import React, { useEffect, useState } from "react"
import DashboardLayout from "../../components/DashboardLayout"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../utils/axioInstance"
import TaskStatusTabs from "../../components/TaskStatusTabs"
import { FiDownload, FiFilter, FiGrid, FiList } from "react-icons/fi"
import { HiOutlineViewGrid } from "react-icons/hi"
import TaskCard from "../../components/TaskCard"
import toast from "react-hot-toast"

// A simple Loader component for demonstration
const SpinnerLoader = () => (
    <div className="flex justify-center items-center h-40">
        <svg className="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    </div>
);


const ManageTasks = () => {
  const [allTasks, setAllTasks] = useState([])
  // 1. ADD NEW LOADING STATE
  const [isLoading, setIsLoading] = useState(true)
    
  // Initialize tabs as an array with default counts
  const [tabs, setTabs] = useState([
    { label: "All", count: 0 },
    { label: "Pending", count: 0 },
    { label: "In Progress", count: 0 },
    { label: "Completed", count: 0 },
  ])
  const [filterStatus, setFilterStatus] = useState("All")
  const [viewMode, setViewMode] = useState("grid")
  const [isDownloading, setIsDownloading] = useState(false)

  const navigate = useNavigate()

  const getAllTasks = async () => {
    // 2. SET LOADING TRUE BEFORE API CALL
    setIsLoading(true)
    
    try {
      const response = await axiosInstance.get("/tasks", {
        params: {
          status: filterStatus === "All" ? "" : filterStatus,
        },
      })

      if (response?.data) {
        setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : [])
      }

      const statusSummary = response.data?.statusSummary || {}

      const statusArray = [
        { label: "All", count: statusSummary.all || 0 },
        { label: "Pending", count: statusSummary.pendingTasks || 0 },
        { label: "In Progress", count: statusSummary.inProgressTasks || 0 },
        { label: "Completed", count: statusSummary.completedTasks || 0 },
      ]

      setTabs(statusArray)
    } catch (error) {
      console.log("Error fetching tasks: ", error)
      toast.error("Failed to fetch tasks")
    } finally {
        // 3. SET LOADING FALSE AFTER API CALL (always runs)
        setIsLoading(false)
    }
  }

  const handleClick = (taskData) => {
    navigate("/admin/create-task", { state: { taskId: taskData._id } })
  }

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true)
      const response = await axiosInstance.get("/reports/export/tasks", {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")

      link.href = url
      link.setAttribute("download", "tasks_details.xlsx")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success("Report downloaded successfully!")
    } catch (error) {
      console.log("Error downloading task-details report: ", error)
      toast.error("Error downloading task-details report. Please try again!")
    } finally {
      setIsDownloading(false)
    }
  }

  useEffect(() => {
    getAllTasks()
    return () => {}
  }, [filterStatus])

  const getStatusColor = (status) => {
    switch (status) {
      case "All":
        return "from-blue-500 to-indigo-600"
      case "Pending":
        return "from-amber-500 to-orange-600"
      case "In Progress":
        return "from-emerald-500 to-green-600"
      case "Completed":
        return "from-purple-500 to-pink-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }
  
  // Helper to determine if there are any tasks in total
  const totalTaskCount = tabs.find(t => t.label === 'All')?.count || 0;

  return (
    <DashboardLayout activeMenu={"Manage Task"}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/10 p-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className={`bg-gradient-to-r ${getStatusColor(filterStatus)} px-8 py-6`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Task Management
                </h1>
                <p className="text-white/90 text-sm md:text-base">
                  {allTasks.length > 0 
                    ? `Viewing ${allTasks.length} ${filterStatus.toLowerCase()} ${allTasks.length === 1 ? 'task' : 'tasks'}`
                    : `Showing 0 ${filterStatus.toLowerCase()} tasks`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="hidden md:flex bg-white/10 backdrop-blur-sm rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-white hover:bg-white/20"
                    }`}
                    title="Grid View"
                  >
                    <FiGrid className="text-xl" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-white hover:bg-white/20"
                    }`}
                    title="List View"
                  >
                    <FiList className="text-xl" />
                  </button>
                </div>

                {/* Download Button - visible if total tasks > 0 */}
                {totalTaskCount > 0 && (
                  <button
                    onClick={handleDownloadReport}
                    disabled={isDownloading}
                    className="group flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white text-white hover:text-blue-600 rounded-xl font-semibold transition-all duration-200 border border-white/20 hover:border-white disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  >
                    {isDownloading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="hidden md:inline">Downloading...</span>
                      </>
                    ) : (
                      <>
                        <FiDownload className="text-xl group-hover:animate-bounce" />
                        <span className="hidden md:inline">Download Report</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs Section - Always visible to allow status switching */}
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <FiFilter className="text-gray-400 text-xl" />
              <span className="text-sm font-semibold text-gray-600">Filter by Status</span>
            </div>
            <TaskStatusTabs
              tabs={tabs}
              activeTab={filterStatus}
              setActiveTab={setFilterStatus}
            />
          </div>
        </div>

        {/* Tasks Grid/List or No Tasks Found Message */}
        {/* 4. CONDITIONAL RENDERING: Show loader if loading, else show tasks/empty message */}
        {isLoading ? (
            <SpinnerLoader />
        ) : allTasks?.length > 0 ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {allTasks.map((item) => (
              <div
                key={item._id}
                className="transform transition-all duration-300 hover:scale-[1.02]"
              >
                <TaskCard
                  title={item.title}
                  description={item.description}
                  priority={item.priority}
                  status={item.status}
                  progress={item.progress}
                  createdAt={item.createdAt}
                  dueDate={item.dueDate}
                  // Ensure assignedTo is passed safely (already good)
                  assignedTo={item.assignedTo?.map((user) => user.profileImageUrl)}
                  attachmentCount={item.attachments?.length || 0}
                  completedTodoCount={item.completedTodoCount || 0}
                  todoChecklist={item.todoChecklist || []}
                  onClick={() => handleClick(item)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <HiOutlineViewGrid className="text-5xl text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Tasks Found
              </h3>
              <p className="text-gray-500 mb-6">
                {filterStatus === "All"
                  ? "You don't have any tasks yet. Create your first task to get started!"
                  : `No ${filterStatus.toLowerCase()} tasks at the moment.`}
              </p>
              {/** Only show 'Create New Task' button if viewing 'All' and total task count is 0 */}
              {(filterStatus === "All" || totalTaskCount === 0) && (
                <button
                  onClick={() => navigate("/admin/create-task")}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span>Create New Task</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ManageTasks