import React from "react"
import { useSelector } from "react-redux"
import DashboardLayout from "../../components/DashboardLayout"

const Dashboard = () => {
  const { currentUser } = useSelector((state) => state.user)

  return <DashboardLayout activeMenu={"Dashboard"}>Dashboard</DashboardLayout>
}

export default Dashboard
