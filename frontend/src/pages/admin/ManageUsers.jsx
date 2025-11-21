import React, { useEffect, useState } from "react"
import axiosInstance from "../../utils/axioInstance"
import DashboardLayout from "../../components/DashboardLayout"
import { FaFileAlt, FaTrash } from "react-icons/fa"
import UserCard from "../../components/UserCard"
import toast from "react-hot-toast"

const ManageUsers = () => {
  const [allUsers, setAllUsers] = useState([])

  // Function to fetch all users
  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get("/users/get-users")
      if (response.data?.length > 0) {
        setAllUsers(response.data)
      }
    } catch (error) {
      console.log("Error fetching users: ", error)
    }
  }

  // Function to delete a user
  const handleDeleteUser = async (userId) => {
    try {
      const response = await axiosInstance.delete(`/users/delete-user/${userId}`)
      if (response.data.success) {
        toast.success("User deleted successfully!")
        // Refresh the user list after successful deletion
        setAllUsers(allUsers.filter((user) => user._id !== userId))
      }
    } catch (error) {
      console.log("Error deleting user: ", error)
      toast.error("Error deleting user. Please try again!")
    }
  }

  // Function to download user report
  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get("/reports/export/users", {
        responseType: "blob",
      })
      // create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "user_details.xlsx")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.log("Error downloading user-details report: ", error)
      toast.error("Error downloading user-details report. Please try again!")
    }
  }

  useEffect(() => {
    getAllUsers()

    return () => {}
  }, [])

  return (
    <DashboardLayout activeMenu={"Team Members"}>
      <div className="mt-5 mb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Team Members</h2>

          <button
            type="button"
            className="flex items-center gap-1 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-gray-800 rounded-lg transition-colors duration-200 font-medium shadow-sm hover:shadow-md cursor-pointer text-lg"
            onClick={handleDownloadReport}
          >
            <FaFileAlt className="text-lg" />
            Download Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {allUsers?.map((user) => (
            <div key={user._id} className="relative">
              <UserCard userInfo={user} />
              {/* Add Delete Button */}
              <button
                onClick={() => handleDeleteUser(user._id)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800"
              >
                <FaTrash className="text-xl" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ManageUsers
