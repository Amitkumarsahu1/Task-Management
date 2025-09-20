import React, { useEffect, useState } from "react"
import axiosInstance from "../../utils/axioInstance"
import DashboardLayout from "../../components/DashboardLayout"

const ManageUsers = () => {
  const [allUsers, setAllUsers] = useState([])

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

  useEffect(() => {
    getAllUsers()

    return () => {}
  }, [])

  return (
    <DashboardLayout activeMenu={"Team Members"}>ManageUsers</DashboardLayout>
  )
}

export default ManageUsers
