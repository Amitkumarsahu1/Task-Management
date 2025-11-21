import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import DashboardLayout from "../../components/DashboardLayout"
import axiosInstance from "../../utils/axioInstance"
import moment from "moment"
import { useNavigate } from "react-router-dom"
import RecentTasks from "../../components/RecentTasks"
import CustomPieChart from "../../components/CustomPieChart"
import CustomBarChart from "../../components/CustomBarChart"
import { FaTasks, FaClock, FaSpinner, FaCheckCircle } from "react-icons/fa"

const COLORS = ["#FFA726", "#42A5F5", "#66BB6A"]

const UserDashboard = () => {
  const navigate = useNavigate()
  const { currentUser } = useSelector((state) => state.user)

  const [dashboardData, setDashboardData] = useState([])
  const [pieChartData, setPieChartData] = useState([])
  const [barChartData, setBarChartData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // prepare data for pie chart
  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || {}
    const taskPriorityLevels = data?.taskPriorityLevel || {}

    const taskDistributionData = [
      { status: "Pending", count: taskDistribution?.Pending || 0 },
      { status: "In Progress", count: taskDistribution?.InProgress || 0 },
      { status: "Completed", count: taskDistribution?.Completed || 0 },
    ]

    setPieChartData(taskDistributionData)

    const priorityLevelData = [
      { priority: "Low", count: taskPriorityLevels?.Low || 0 },
      { priority: "Medium", count: taskPriorityLevels?.Medium || 0 },
      { priority: "High", count: taskPriorityLevels?.High || 0 },
    ]

    setBarChartData(priorityLevelData)
  }

  const getDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get("/tasks/user-dashboard-data")

      if (response.data) {
        setDashboardData(response.data)
        prepareChartData(response.data?.charts || null)
      }
    } catch (error) {
      console.log("Error fetching user dashboard data: ", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getDashboardData()
  }, [])

  const statsCards = [
    {
      title: "Total Tasks",
      value: dashboardData?.charts?.taskDistribution?.All || 0,
      icon: <FaTasks />,
      color: "blue",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      title: "Pending",
      value: dashboardData?.charts?.taskDistribution?.Pending || 0,
      icon: <FaClock />,
      color: "orange",
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100",
      textColor: "text-orange-600",
      borderColor: "border-orange-200"
    },
    {
      title: "In Progress",
      value: dashboardData?.charts?.taskDistribution?.InProgress || 0,
      icon: <FaSpinner />,
      color: "purple",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
      textColor: "text-purple-600",
      borderColor: "border-purple-200"
    },
    {
      title: "Completed",
      value: dashboardData?.charts?.taskDistribution?.Completed || 0,
      icon: <FaCheckCircle />,
      color: "green",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-600",
      borderColor: "border-green-200"
    }
  ]

  return (
    <DashboardLayout activeMenu={"Dashboard"}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Welcome back, {currentUser?.name}!
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {moment().format("dddd, MMMM Do YYYY")}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {statsCards.map((card, index) => (
                <div
                  key={index}
                  className={`${card.bgColor} border ${card.borderColor} rounded-lg p-5 transition-all duration-200 hover:shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-3">
                        {card.title}
                      </p>
                      <p className={`text-3xl font-bold ${card.textColor}`}>
                        {card.value}
                      </p>
                    </div>
                    <div className={`${card.iconBg} ${card.textColor} p-3 rounded-lg`}>
                      {card.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Task Distribution
                </h3>
                <div className="h-64">
                  <CustomPieChart
                    data={pieChartData}
                    label="Tasks"
                    colors={COLORS}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Task Priority Levels
                </h3>
                <div className="h-64">
                  <CustomBarChart data={barChartData} />
                </div>
              </div>
            </div>

            {/* Recent Tasks Section */}
            <RecentTasks tasks={dashboardData?.recentTasks} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default UserDashboard