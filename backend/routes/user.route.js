import express from "express"
import { adminOnly, verifyToken } from "../utils/verifyUser.js"
import { getUserById, getUsers,deleteUser } from "../controller/user.controller.js"

const router = express.Router()


router.get("/get-users", verifyToken, adminOnly, getUsers)

router.get("/:id", verifyToken, getUserById)

router.delete("/delete-user/:id", adminOnly, deleteUser)

export default router
