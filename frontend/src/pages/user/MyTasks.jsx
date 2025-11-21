import React, { useEffect, useState, useCallback } from "react"
import DashboardLayout from "../../components/DashboardLayout"
import { useNavigate, useLocation } from "react-router-dom" // <-- useLocation imported for state access
import axiosInstance from "../../utils/axioInstance"
import TaskStatusTabs from "../../components/TaskStatusTabs"
import { FaFileLines } from "react-icons/fa6"
import { FaSpinner } from "react-icons/fa" // FaSpinner imported here
import { GrPowerReset } from "react-icons/gr";
import TaskCard from "../../components/TaskCard"
import toast from "react-hot-toast"

const MyTask = () => {
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [tabs, setTabs] = useState([
    { label: "All", count: 0 },
    { label: "Pending", count: 0 },
    { label: "In Progress", count: 0 },
    { label: "Completed", count: 0 },
  ])
  const [filterStatus, setFilterStatus] = useState("All")
  
  const navigate = useNavigate()
  const location = useLocation() // <-- Initialize useLocation to access navigation state

  // Function to fetch tasks and status counts (Memoized using useCallback)
  const getAllTasks = useCallback(async () => {
    setLoading(true)
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
      setTabs([
        { label: "All", count: statusSummary.all || 0 },
        { label: "Pending", count: statusSummary.pendingTasks || 0 },
        { label: "In Progress", count: statusSummary.inProgressTasks || 0 },
        { label: "Completed", count: statusSummary.completedTasks || 0 },
      ])
    } catch (error) {
      console.error("Error fetching tasks: ", error)
      toast.error("Failed to load tasks.")
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  // Function called by TaskCard to refresh the whole list and counts
  const handleTaskStatusUpdated = useCallback(() => {
    getAllTasks()
    toast.success("Task list refreshed!")
  }, [getAllTasks])

  const handleClick = (taskId) => {
    navigate(`/user/task-details/${taskId}`)
  }

  useEffect(() => {
    // 🔔 CRITICAL FIX: Check location state for refresh signal
    if (location.state?.refresh) {
      // Force a full refresh to get updated counts
      getAllTasks(); 
      // Clear the state immediately so it doesn't refresh constantly on future renders
      navigate(location.pathname, { replace: true, state: {} }); 
      return; 
    }

    // Default fetch logic (on mount or filter change)
    getAllTasks()
    
  }, [filterStatus, getAllTasks, location.state?.refresh, navigate, location.pathname]) // Added dependencies

  return (
    <DashboardLayout activeMenu={"My Tasks"}>
      <div className="min-h-screen bg-gray-50 pt-4 pb-12 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section: Title and Tabs */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 mb-6">
            
            {/* Title */}
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                My Tasks 📋
              </h2>
              <p className="mt-1 text-base text-gray-500">
                Overview of all your assigned tasks.
              </p>
            </div>

            {/* Task Status Tabs and Refresh Button */}
            <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />
              <button
                onClick={handleTaskStatusUpdated} 
                disabled={loading}
                className={`p-3 rounded-lg text-gray-600 border border-gray-300 hover:bg-gray-100 transition duration-150 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Refresh Tasks"
              >
                <GrPowerReset className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <hr className="mb-6"/>

        {/* Task Grid Section */}
        <div className="max-w-7xl mx-auto">
          {loading && (
            <div className="col-span-full text-center py-5">
              <FaSpinner className="animate-spin h-6 w-6 text-indigo-500 mx-auto" />
              <p className="mt-2 text-sm text-indigo-600">Loading tasks...</p>
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {allTasks?.length > 0 ? (
                allTasks.map((item) => (
                  <TaskCard
                    key={item._id}
                    title={item.title}
                    description={item.description}
                    priority={item.priority}
                    status={item.status}
                    progress={item.progress}
                    createdAt={item.createdAt}
                    dueDate={item.dueDate}
                    assignedTo={item.assignedTo?.map(
                      (user) => user.profileImageUrl
                    )}
                    attachmentCount={item.attachments?.length || 0}
                    completedTodoCount={item.completedTodoCount || 0}
                    todoChecklist={item.todoChecklist || []}
                    onClick={() => handleClick(item._id)}
                    
                    // Passed the refresh function for immediate list updates
                    onStatusChange={handleTaskStatusUpdated} 
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    No tasks found in "{filterStatus}"
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try checking a different status or enjoy your free time!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default MyTask