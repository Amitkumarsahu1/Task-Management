import React, { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import axiosInstance from "../../utils/axioInstance"
import DashboardLayout from "../../components/DashboardLayout"
import moment from "moment"
import AvatarGroup from "../../components/AvatarGroup" // Assuming this component is imported
import { FaExternalLinkAlt, FaRegClock, FaLayerGroup,FaSpinner } from "react-icons/fa"
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5"
import { MdOutlineIncompleteCircle } from "react-icons/md"
import { TbListDetails } from "react-icons/tb"
import toast from "react-hot-toast"

const TaskDetails = () => {
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)

  const getStatusTagColor = (status) => {
    switch (status) {
      case "In Progress":
        return "text-cyan-700 bg-cyan-100 border border-cyan-200"
      case "Completed":
        return "text-lime-700 bg-lime-100 border border-lime-200"
      default:
        return "text-violet-700 bg-violet-100 border border-violet-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "In Progress":
        return <MdOutlineIncompleteCircle className="w-4 h-4 mr-1" />
      case "Completed":
        return <IoCheckmarkDoneCircleSharp className="w-4 h-4 mr-1" />
      default:
        return <FaLayerGroup className="w-3 h-3 mr-1" />
    }
  }

  const getTaskDetailsById = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`/tasks/${id}`)
      if (response.data) {
        setTask(response.data)
      }
    } catch (error) {
      console.error("Error fetching task details: ", error)
      toast.error("Failed to load task details.")
      setTask(null); // Clear task if fetching fails
    } finally {
      setLoading(false)
    }
  }, [id])

  const updateTodoChecklist = async (index) => {
    if (!task || !task.todoChecklist || !task.todoChecklist[index]) return;

    const todoChecklist = [...task.todoChecklist]
    const originalCompletedStatus = todoChecklist[index].completed
    todoChecklist[index].completed = !todoChecklist[index].completed

    // Optimistically update the local state first
    setTask({ ...task, todoChecklist })

    try {
      const response = await axiosInstance.put(`/tasks/${id}/todo`, {
        todoChecklist,
      })

      if (response.status === 200) {
        // Update state with server response (if the server returns updated task including status change)
        setTask(response.data?.task || { ...task, todoChecklist })
        toast.success("Checklist updated!")
      } else {
        // Revert on server error
        todoChecklist[index].completed = originalCompletedStatus
        setTask({ ...task, todoChecklist })
        toast.error("Failed to update checklist.")
      }
    } catch (error) {
      // Revert on network/API error
      todoChecklist[index].completed = originalCompletedStatus
      setTask({ ...task, todoChecklist })
      console.error("Error updating checklist:", error)
      toast.error("An error occurred during update.")
    }
  }

  const handleLinkClick = (link) => {
    if (!/^https?:\/\//i.test(link)) {
      link = "https://" + link
    }
    window.open(link, "_blank")
  }

  useEffect(() => {
    if (id) {
      getTaskDetailsById()
    }
  }, [id, getTaskDetailsById])

  if (loading) {
    return (
      <DashboardLayout activeMenu={"My Tasks"}>
        <div className="mt-8 text-center py-10">
          <FaSpinner className="animate-spin h-8 w-8 text-indigo-500 mx-auto" />
          <p className="mt-2 text-lg text-indigo-600">Loading task details...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!task && !loading) {
    return (
      <DashboardLayout activeMenu={"My Tasks"}>
        <div className="mt-8 text-center py-10 text-gray-500">
          <h2 className="text-2xl font-bold">Task Not Found</h2>
          <p>The task ID provided does not correspond to an existing task.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeMenu={"My Tasks"}>
      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        {task && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Task Details Main Section (2/3 width on large screens) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                {/* Title and Status */}
                <div className="pb-4 border-b border-gray-100">
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                    {task.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <div
                      className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusTagColor(
                        task.status
                      )}`}
                    >
                      {getStatusIcon(task.status)}
                      {task.status}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center mb-2">
                    <TbListDetails className="w-5 h-5 mr-2 text-indigo-600" />
                    Details
                  </h2>
                  <p className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap">
                    {task.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Todo Checklist */}
              {task.todoChecklist?.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                    <IoCheckmarkDoneCircleSharp className="w-5 h-5 mr-2 text-lime-600" />
                    Todo Checklist ({task.todoChecklist.filter(t => t.completed).length} / {task.todoChecklist.length})
                  </h2>
                  <div className="space-y-3">
                    {task.todoChecklist.map((item, index) => (
                      <TodoCheckList
                        key={`todo_${index}`}
                        text={item.text}
                        isChecked={item.completed}
                        onChange={() => updateTodoChecklist(index)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {task.attachments?.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                    <FaExternalLinkAlt className="w-4 h-4 mr-2 text-blue-600" />
                    Attachments
                  </h2>
                  <div className="space-y-3">
                    {task.attachments.map((link, index) => (
                      <Attachment
                        key={`link_${index}`}
                        link={link}
                        index={index}
                        onClick={() => handleLinkClick(link)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Task Meta Info Sidebar (1/3 width on large screens) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-3">
                  Task Information
                </h3>

                {/* Priority */}
                <InfoBox label={"Priority"} value={task.priority} icon={FaLayerGroup} />

                {/* Due Date */}
                <InfoBox
                  label={"Due Date"}
                  value={
                    task.dueDate
                      ? moment(task.dueDate).format("Do MMM YYYY")
                      : "N/A"
                  }
                  icon={FaRegClock}
                />

                {/* Assigned To */}
                <div>
                  <label className="text-sm font-semibold text-slate-500 flex items-center mb-2 border-b border-gray-100 pb-3">
                    <FaExternalLinkAlt className="w-3 h-3 mr-2 text-slate-400" />
                    Assigned To
                  </label>

                  <div className="pt-3 space-y-2">
                    <AvatarGroup
                      avatars={
                        task.assignedTo?.map(
                          (item) => item?.profileImageUrl
                        ) || []
                      }
                      maxVisible={5}
                    />
                    
                    {/* List of names (The fix for your previous issue) */}
                    <div className="mt-3 space-y-1">
                      {task.assignedTo?.length > 0 ? (
                        task.assignedTo.map((user, idx) => (
                          <p key={idx} className="text-sm text-gray-700 font-medium">
                            {user.name}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          Not currently assigned.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default TaskDetails

// --- Helper Components ---

const InfoBox = ({ label, value, icon: Icon }) => {
  return (
    <div className="border-b border-gray-100 pb-4">
      <label className="text-sm font-semibold text-slate-500 flex items-center mb-1">
        {Icon && <Icon className="w-3 h-3 mr-2 text-slate-400" />}
        {label}
      </label>

      <p className="text-base font-bold text-gray-800">
        {value}
      </p>
    </div>
  )
}

const TodoCheckList = ({ text, isChecked, onChange }) => {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${isChecked ? 'bg-lime-50' : 'hover:bg-gray-50'}`}>
      <input
        id={`todo-${text}`}
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        className={`mt-1 w-4 h-4 text-lime-600 bg-white border border-gray-300 rounded outline-none cursor-pointer focus:ring-lime-600 transition duration-150 ease-in-out`}
      />

      <label
        htmlFor={`todo-${text}`}
        className={`text-base font-medium text-gray-800 select-none ${isChecked ? 'line-through text-gray-500' : ''}`}
      >
        {text}
      </label>
    </div>
  )
}

const Attachment = ({ link, index, onClick }) => {
  const displayLink = new URL(link.startsWith('http') ? link : `https://${link}`).hostname;

  return (
    <div
      className="flex justify-between items-center bg-white border border-blue-200 text-blue-600 px-4 py-3 rounded-lg transition-all hover:bg-blue-50 hover:shadow-sm cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <span className="text-sm font-semibold text-blue-500 mr-2 flex-shrink-0">
          Link {index + 1}
        </span>

        <p className="text-sm font-medium truncate min-w-0">
          {displayLink}
        </p>
      </div>

      <FaExternalLinkAlt className="text-blue-500 group-hover:text-blue-700 transition duration-150 flex-shrink-0 ml-4" />
    </div>
  )
}