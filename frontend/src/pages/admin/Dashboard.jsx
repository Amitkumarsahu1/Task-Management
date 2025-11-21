import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import DashboardLayout from "../../components/DashboardLayout"
import axiosInstance from "../../utils/axioInstance"
import moment from "moment"
import { useNavigate } from "react-router-dom"
import RecentTasks from "../../components/RecentTasks"
import CustomPieChart from "../../components/CustomPieChart"
import CustomBarChart from "../../components/CustomBarChart"
import { TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56"]

const Dashboard = () => {
  const navigate = useNavigate()
  const { currentUser } = useSelector((state) => state.user)

  const [dashboardData, setDashboardData] = useState([])
  const [pieChartData, setPieChartData] = useState([])
  const [barChartData, setBarChartData] = useState([])

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
      const response = await axiosInstance.get("/tasks/dashboard-data")

      if (response.data) {
        setDashboardData(response.data)
        prepareChartData(response.data?.charts || null)
      }
    } catch (error) {
      console.log("Error fetching dashboard data: ", error)
    }
  }

  useEffect(() => {
    getDashboardData()
    return () => {}
  }, [])

  const StatCard = ({ title, value, icon: Icon, color, bgColor, borderColor }) => (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className={`absolute inset-0 ${bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`${bgColor} ${color} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${borderColor}`}></div>
      </div>
    </div>
  )

  return (
    <DashboardLayout activeMenu={"Dashboard"}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 p-6 space-y-6">
        {/* Header Section */}
        <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Welcome back, {currentUser?.name}! 👋
                </h1>
                <p className="text-blue-100 text-sm md:text-base font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {moment().format("dddd, MMMM Do YYYY")}
                </p>
              </div>

              <button
                onClick={() => navigate("/admin/create-task")}
                className="group relative px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                <span className="relative flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Create New Task
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Tasks"
              value={dashboardData?.charts?.taskDistribution?.All || 0}
              icon={TrendingUp}
              color="text-blue-600"
              bgColor="bg-blue-50"
              borderColor="bg-gradient-to-r from-blue-500 to-blue-600"
            />
            <StatCard
              title="Pending Tasks"
              value={dashboardData?.charts?.taskDistribution?.Pending || 0}
              icon={AlertCircle}
              color="text-amber-600"
              bgColor="bg-amber-50"
              borderColor="bg-gradient-to-r from-amber-500 to-orange-500"
            />
            <StatCard
              title="In Progress"
              value={dashboardData?.charts?.taskDistribution?.InProgress || 0}
              icon={Clock}
              color="text-emerald-600"
              bgColor="bg-emerald-50"
              borderColor="bg-gradient-to-r from-emerald-500 to-green-500"
            />
            <StatCard
              title="Completed"
              value={dashboardData?.charts?.taskDistribution?.Completed || 0}
              icon={CheckCircle}
              color="text-purple-600"
              bgColor="bg-purple-50"
              borderColor="bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900">Task Distribution</h3>
              <p className="text-sm text-gray-500 mt-1">Overview of task statuses</p>
            </div>
            <div className="p-6">
              <div className="h-72">
                <CustomPieChart
                  data={pieChartData}
                  label="Total Balance"
                  colors={COLORS}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900">Priority Levels</h3>
              <p className="text-sm text-gray-500 mt-1">Task breakdown by priority</p>
            </div>
            <div className="p-6">
              <div className="h-72">
                <CustomBarChart data={barChartData} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tasks Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500 mt-1">Your latest tasks and updates</p>
          </div>
          <RecentTasks tasks={dashboardData?.recentTasks} />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard