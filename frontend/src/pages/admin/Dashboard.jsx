import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import DashboardLayout from "../../components/DashboardLayout"
import axiosInstance from "../../utils/axioInstance"
import moment from "moment"

const Dashboard = () => {
  const { currentUser } = useSelector((state) => state.user)

  const [dashboardData, setDashboardData] = useState(null)
  const [pieChartdData, setPieChartData] = useState(null)
  const [barChartData, setBarChartData] = useState(null)

  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get("/tasks/dashboard-data")

      if (response.data) {
        setDashboardData(response.data)
      }
    } catch (error) {
      console.log("Error fetching dashboard data: ", error)
    }
  }

  useEffect(() => {
    getDashboardData()

    return () => {}
  }, [])

  return (
    <DashboardLayout activeMenu={"Dashboard"}>
      <div className="">
        <div className="">
          <div className="">
            <h2 className="">Welcome! {currentUser?.name}</h2>

            <p className="">{moment().format("dddd Do MMMM YYYY")}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
