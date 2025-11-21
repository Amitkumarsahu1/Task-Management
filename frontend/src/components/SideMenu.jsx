import React, { useEffect, useState } from "react"
import axiosInstance from "../utils/axioInstance"
import { useDispatch, useSelector } from "react-redux"
import { signOutSuccess } from "../redux/slice/userSlice"
import { useNavigate } from "react-router-dom"
import { SIDE_MENU_DATA, USER_SIDE_MENU_DATA } from "../utils/data"

const SideMenu = ({ activeMenu }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [SideMenuData, setSideMenuData] = useState([])
  const { currentUser } = useSelector((state) => state.user)

  const handleClick = (route) => {
    console.log(route)

    if (route === "logout") {
      handleLogut()
      return
    }

    navigate(route)
  }

  const handleLogut = async () => {
    try {
      const response = await axiosInstance.post("/auth/sign-out")

      if (response.data) {
        dispatch(signOutSuccess())
        navigate("/login")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (currentUser) {
      setSideMenuData(
        currentUser?.role === "admin" ? SIDE_MENU_DATA : USER_SIDE_MENU_DATA
      )
    }

    return () => {}
  }, [currentUser])

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "U"
    const words = name.trim().split(" ")
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }

  // Generate color based on name
  const getAvatarColor = (name) => {
    if (!name) return "bg-blue-500"
    const colors = [
      "bg-blue-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-rose-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-emerald-500",
      "bg-teal-500",
      "bg-cyan-500",
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div className="w-64 h-full flex flex-col bg-white lg:border-r lg:border-gray-200">
      {/* Profile Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-4 group">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-gray-100 group-hover:ring-blue-100 transition-all duration-300">
              {currentUser?.profileImageUrl ? (
                <img
                  src={currentUser.profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full ${getAvatarColor(
                    currentUser?.name
                  )} flex items-center justify-center text-white text-2xl font-bold`}
                >
                  {getInitials(currentUser?.name)}
                </div>
              )}
            </div>
            
            {/* Online Indicator */}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          {/* Admin Badge */}
          {currentUser?.role === "admin" && (
            <div className="mb-3 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold shadow-sm">
              Admin
            </div>
          )}

          {/* User Info */}
          <h5 className="text-lg font-bold text-gray-900 text-center mb-1">
            {currentUser?.name || "User"}
          </h5>
          <p className="text-sm text-gray-500 text-center truncate max-w-full px-2">
            {currentUser?.email || ""}
          </p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {SideMenuData.map((item, index) => {
            const isActive = activeMenu === item.label
            const Icon = item.icon

            return (
              <button
                key={`menu_${index}`}
                onClick={() => handleClick(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }
                  group relative overflow-hidden
                `}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full"></div>
                )}

                {/* Icon */}
                <div
                  className={`
                  flex-shrink-0 text-xl transition-transform duration-200
                  ${isActive ? "scale-110" : "group-hover:scale-105"}
                `}
                >
                  <Icon />
                </div>

                {/* Label */}
                <span className="flex-1 text-left">{item.label}</span>

                {/* Hover Effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/50 transition-all duration-200 -z-10 rounded-xl"></div>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer - Optional branding */}
      <div className="p-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-400">Task Manager Pro</p>
          <p className="text-xs text-gray-400 mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  )
}

export default SideMenu