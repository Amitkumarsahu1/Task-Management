import React, { useEffect, useState } from "react"
import axiosInstance from "../../utils/axioInstance"
import DashboardLayout from "../../components/DashboardLayout"
import { FaFileAlt, FaTrash, FaUsers, FaSearch } from "react-icons/fa"
import UserCard from "../../components/UserCard"
import toast from "react-hot-toast"

const ManageUsers = () => {
  const [allUsers, setAllUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Function to fetch all users
  const getAllUsers = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get("/users/get-users")
      if (response.data?.length > 0) {
        setAllUsers(response.data)
      }
    } catch (error) {
      console.log("Error fetching users: ", error)
      toast.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to delete a user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return
    }

    try {
      const response = await axiosInstance.delete(`/users/delete-user/${userId}`)
      if (response.data.success) {
        toast.success("User deleted successfully!")
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
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "user_details.xlsx")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success("Report downloaded successfully!")
    } catch (error) {
      console.log("Error downloading user-details report: ", error)
      toast.error("Error downloading user-details report. Please try again!")
    }
  }

  // Filter users based on search term
  const filteredUsers = allUsers.filter((user) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    )
  })

  useEffect(() => {
    getAllUsers()
  }, [])

  return (
    <DashboardLayout activeMenu={"Team Members"}>
      <div className="py-6 px-4 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaUsers className="text-2xl text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Team Members</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your team members and their access
                </p>
              </div>
            </div>

            <button
              type="button"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              onClick={handleDownloadReport}
            >
              <FaFileAlt className="text-base" />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* Search and Stats Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
              <span className="font-semibold text-gray-900">{filteredUsers.length}</span>
              <span>of</span>
              <span className="font-semibold text-gray-900">{allUsers.length}</span>
              <span>members</span>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUsers className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm ? "Try adjusting your search terms" : "Get started by adding team members"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUsers.map((user) => (
              <div key={user._id} className="relative group">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                  <UserCard userInfo={user} />
                </div>
                
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Delete user"
                >
                  <FaTrash className="text-base" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ManageUsers