import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import DashboardLayout from "../../components/DashboardLayout"
import { MdDelete, MdSave, MdAdd } from "react-icons/md"
import { FiCalendar, FiAlertCircle, FiCheckCircle } from "react-icons/fi"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import SelectedUsers from "../../components/SelectedUsers"
import TodoListInput from "../../components/TodoListInput"
import AddAttachmentsInput from "../../components/AddAttachmentsInput"
import axiosInstance from "../../utils/axioInstance"
import moment from "moment"
import toast from "react-hot-toast"
import Modal from "../../components/Modal"
import DeleteAlert from "../../components/DeleteAlert"

const CreateTask = () => {
  const location = useLocation()
  const { taskId } = location.state || {}
  const navigate = useNavigate()

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: null,
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
  })

  const [currentTask, setCurrentTask] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)

  const handleValueChange = (key, value) => {
    setTaskData((prevData) => ({
      ...prevData,
      [key]: value,
    }))
  }

  const clearData = () => {
    setTaskData({
      title: "",
      description: "",
      priority: "Low",
      dueDate: null,
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
    })
  }

  const createTask = async () => {
    try {
      setLoading(true)
      const todolist = taskData.todoChecklist?.map((item) => ({
        text: item,
        completed: false,
      }))

      const response = await axiosInstance.post("/tasks/create", {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoChecklist: todolist,
      })

      toast.success("Task created successfully!")
      clearData()
    } catch (error) {
      console.log("Error creating task: ", error)
      toast.error("Error creating task!")
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async () => {
    try {
      setLoading(true)
      const todolist = taskData.todoChecklist?.map((item) => {
        const prevTodoChecklist = currentTask?.todoChecklist || []
        const matchedTask = prevTodoChecklist.find((task) => task.text === item)

        return {
          text: item,
          completed: matchedTask ? matchedTask.completed : false,
        }
      })

      const response = await axiosInstance.put(`/tasks/${taskId}`, {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoChecklist: todolist,
      })

      toast.success("Task updated successfully!")
      console.log(response.data)
    } catch (error) {
      console.log("Error updating task: ", error)
      toast.error("Error updating task!")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    setError("")

    if (!taskData.title.trim()) {
      setError("Title is required!")
      return
    }

    if (!taskData.description.trim()) {
      setError("Description is required!")
      return
    }

    if (!taskData.dueDate) {
      setError("Due date is required!")
      return
    }

    if (taskData.assignedTo?.length === 0) {
      setError("Task is not assigned to any member!")
      return
    }

    if (taskData.todoChecklist?.length === 0) {
      setError("Add atleast one todo task!")
      return
    }

    if (taskId) {
      updateTask()
      return
    }

    createTask()
  }

  const getTaskDetailsById = async () => {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}`)

      if (response.data) {
        const taskInfo = response.data
        setCurrentTask(taskInfo)

        setTaskData((prevState) => ({
          ...prevState,
          title: taskInfo?.title,
          description: taskInfo?.description,
          priority: taskInfo?.priority,
          dueDate: taskInfo?.dueDate
            ? moment(taskInfo?.dueDate).format("YYYY-MM-DD")
            : null,
          assignedTo: taskInfo?.assignedTo?.map((item) => item?._id || []),
          todoChecklist:
            taskInfo?.todoChecklist?.map((item) => item?.text) || [],
          attachments: taskInfo?.attachments || [],
        }))
      }
    } catch (error) {
      console.log("Error fetching task details: ", error)
    }
  }

  const deleteTask = async () => {
    try {
      await axiosInstance.delete(`/tasks/${taskId}`)
      setOpenDeleteAlert(false)
      toast.success("Task deleted successfully!")
      navigate("/admin/tasks")
    } catch (error) {
      console.log("Error delating task: ", error)
    }
  }

  useEffect(() => {
    if (taskId) {
      getTaskDetailsById(taskId)
    }
    return () => {}
  }, [taskId])

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-50 border-red-200 text-red-700"
      case "Medium":
        return "bg-amber-50 border-amber-200 text-amber-700"
      default:
        return "bg-emerald-50 border-emerald-200 text-emerald-700"
    }
  }

  return (
    <DashboardLayout activeMenu={"Create Task"}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/10 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {taskId ? "Update Task" : "Create New Task"}
                  </h1>
                  <p className="text-blue-100 text-sm">
                    {taskId
                      ? "Modify task details and update assignments"
                      : "Fill in the details to create a new task"}
                  </p>
                </div>

                {taskId && (
                  <button
                    onClick={() => setOpenDeleteAlert(true)}
                    className="group flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-red-500 text-white rounded-xl font-medium transition-all duration-200 border border-white/20 hover:border-red-500"
                  >
                    <MdDelete className="text-xl group-hover:rotate-12 transition-transform" />
                    Delete Task
                  </button>
                )}
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mx-8 mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiAlertCircle className="text-red-500 text-xl flex-shrink-0" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <form className="p-8 space-y-8">
              {/* Task Title */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter a descriptive task title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  value={taskData.title}
                  onChange={(e) => handleValueChange("title", e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Provide detailed task description..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                  value={taskData.description}
                  onChange={(e) =>
                    handleValueChange("description", e.target.value)
                  }
                />
              </div>

              {/* Priority and Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    Priority Level <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 appearance-none bg-white cursor-pointer"
                      value={taskData.priority}
                      onChange={(e) =>
                        handleValueChange("priority", e.target.value)
                      }
                    >
                      <option value="Low">🟢 Low Priority</option>
                      <option value="Medium">🟡 Medium Priority</option>
                      <option value="High">🔴 High Priority</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className={`mt-2 px-3 py-2 rounded-lg border text-sm font-medium ${getPriorityColor(taskData.priority)}`}>
                    Current: {taskData.priority} Priority
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiCalendar className="text-blue-500" />
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={taskData.dueDate}
                      onChange={(data) => handleValueChange("dueDate", data)}
                      minDate={new Date()}
                      placeholderText="Select due date..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      dateFormat="MMMM d, yyyy"
                    />
                  </div>
                </div>
              </div>

              {/* Assign To Section */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  Assign Team Members <span className="text-red-500">*</span>
                </label>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <SelectedUsers
                    selectedUser={taskData.assignedTo}
                    setSelectedUser={(value) =>
                      handleValueChange("assignedTo", value)
                    }
                  />
                </div>
              </div>

              {/* TODO Checklist */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FiCheckCircle className="text-blue-500" />
                  TODO Checklist <span className="text-red-500">*</span>
                </label>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <TodoListInput
                    todoList={taskData?.todoChecklist}
                    setTodoList={(value) =>
                      handleValueChange("todoChecklist", value)
                    }
                  />
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  Attachments
                </label>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <AddAttachmentsInput
                    attachments={taskData?.attachments}
                    setAttachments={(value) =>
                      handleValueChange("attachments", value)
                    }
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        {taskId ? <MdSave className="text-xl" /> : <MdAdd className="text-xl" />}
                        {taskId ? "Update Task" : "Create Task"}
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Modal
        isOpen={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
        title={"Delete Task"}
      >
        <DeleteAlert
          content="Are you sure you want to delete this task? This action cannot be undone."
          onDelete={() => deleteTask()}
        />
      </Modal>
    </DashboardLayout>
  )
}

export default CreateTask