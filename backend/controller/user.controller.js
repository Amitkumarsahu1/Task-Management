import Task from "../models/task.model.js"
import User from "../models/user.model.js"
import { errorHandler } from "../utils/error.js"

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" }).select("-password")

    const userWithTaskCounts = await Promise.all(
      users.map(async (user) => {
        const pendingTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "Pending",
        })

        const inProgressTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "In Progress",
        })

        const completedTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "Completed",
        })

        return {
          ...user._doc,
          pendingTasks,
          inProgressTasks,
          completedTasks,
        }
      })
    )

    res.status(200).json(userWithTaskCounts)
  } catch (error) {
    next(error)
  }
}

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return next(errorHandler(404, "User not found!"))
    }

    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}


export const deleteUser = async (req, res, next) => {
  const { id } = req.params

  try {
    // Log the incoming user ID
    console.log(`Deleting user with ID: ${id}`)

    // Check if user exists
    const user = await User.findById(id)

    if (!user) {
      return next(errorHandler(404, "User not found"))
    }

    // Log before deleting
    console.log("User found, proceeding to delete...")

    // Delete the user using `findByIdAndDelete`
    await User.findByIdAndDelete(id)  // Use this method instead of `remove()`

    // Log after deletion
    console.log("User deleted successfully!")

    res.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.log("Error during user deletion:", error)  // Log the error
    next(error)
  }
}

