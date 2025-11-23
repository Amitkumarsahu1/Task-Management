import React, { useEffect, useState } from "react"
import DashboardLayout from "../../components/DashboardLayout"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../utils/axioInstance"
import TaskStatusTabs from "../../components/TaskStatusTabs"
import { FiDownload, FiFilter, FiGrid, FiList } from "react-icons/fi"
import { HiOutlineViewGrid } from "react-icons/hi"
import TaskCard from "../../components/TaskCard"
import toast from "react-hot-toast"

const SpinnerLoader = () => (
    <div className="flex justify-center items-center h-40">
        <svg className="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    </div>
)

const ManageTasks = () => {
    const [allTasks, setAllTasks] = useState([])
    const [isLoading, setIsLoading] = useState(true)

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
        setIsLoading(true)

        try {
            const response = await axiosInstance.get("/tasks", {
                params: {
                    status: filterStatus === "All" ? "" : filterStatus,
                },
            })

            if (response?.data) {
                setAllTasks(response.data?.tasks || [])
            }

            const summary = response.data?.statusSummary || {}

            setTabs([
                { label: "All", count: summary.all || 0 },
                { label: "Pending", count: summary.pendingTasks || 0 },
                { label: "In Progress", count: summary.inProgressTasks || 0 },
                { label: "Completed", count: summary.completedTasks || 0 }
            ])
        } catch (error) {
            console.log("Error fetching tasks: ", error)
            toast.error("Failed to fetch tasks")
        } finally {
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
            toast.error("Error downloading report")
        } finally {
            setIsDownloading(false)
        }
    }

    useEffect(() => {
        getAllTasks()
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

    const totalTaskCount = tabs.find(t => t.label === "All")?.count || 0

    return (
        <DashboardLayout activeMenu={"Manage Task"}>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/10 p-6">

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
                    <div className={`bg-gradient-to-r ${getStatusColor(filterStatus)} px-8 py-6`}>
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white">
                                    Task Management
                                </h1>
                                <p className="text-white/90 text-sm md:text-base">
                                    Viewing {allTasks.length} {filterStatus.toLowerCase()} tasks
                                </p>
                            </div>

                            <div className="flex items-center gap-3">

                                <div className="hidden md:flex bg-white/10 backdrop-blur-sm rounded-xl p-1">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded-lg transition-all ${
                                            viewMode === "grid" ? "bg-white text-blue-600" : "text-white"
                                        }`}
                                    >
                                        <FiGrid />
                                    </button>

                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded-lg transition-all ${
                                            viewMode === "list" ? "bg-white text-blue-600" : "text-white"
                                        }`}
                                    >
                                        <FiList />
                                    </button>
                                </div>

                                {totalTaskCount > 0 && (
                                    <button
                                        onClick={handleDownloadReport}
                                        disabled={isDownloading}
                                        className="group flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl backdrop-blur-sm"
                                    >
                                        {isDownloading ? "Downloading..." : "Download Report"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
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

                {/* Loader */}
                {isLoading ? (
                    <SpinnerLoader />
                ) : allTasks.length > 0 ? (
                    <div
                        className={`grid gap-6 ${
                            viewMode === "grid"
                                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                                : "grid-cols-1"
                        }`}
                    >
                        {allTasks.map((item) => (
                            <div key={item._id} className="transition-all hover:scale-[1.02]">
                                <TaskCard
                                    title={item.title}
                                    description={item.description}
                                    priority={item.priority}
                                    status={item.status}
                                    progress={item.progress}
                                    createdAt={item.createdAt}
                                    dueDate={item.dueDate}
                                    assignedTo={item.assignedTo?.map(u => u.profileImageUrl)}
                                    attachmentCount={item.attachments?.length || 0}

                        
                                    completedTodoCount={
                                        typeof item.completedCount === "number"
                                            ? item.completedCount
                                            : (item.todoChecklist?.filter(t => t.completed).length || 0)
                                    }

                                    todoChecklist={item.todoChecklist || []}
                                    onClick={() => handleClick(item)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <HiOutlineViewGrid className="text-5xl text-blue-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Tasks Found</h3>
                        <button
                            onClick={() => navigate("/admin/create-task")}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl"
                        >
                            Create New Task
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default ManageTasks
