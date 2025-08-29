import User from "../models/user.model.js"
import bcryptjs from "bcryptjs"

export const signup = async (req, res) => {
  const { name, email, password, profileImageUrl, adminJoinCode } = req.body

  if (
    !name ||
    !email ||
    !password ||
    name === "" ||
    email === "" ||
    password === ""
  ) {
    return res.status(400).json({ message: "All fields are required" })
  }

  //   Check if user already exists
  const isAlreadyExist = await User.findOne({ email })

  if (isAlreadyExist) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" })
  }

  //   check user role
  let role = "user"

  if (adminJoinCode && adminJoinCode === process.env.ADMIN_JOIN_CODE) {
    role = "admin"
  }

  const hashedPassword = bcryptjs.hashSync(password, 10)

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    profileImageUrl,
    role,
  })

  try {
    await newUser.save()

    res.json("Signup successful")
  } catch (error) {
    res.status(500).json({ message: error.message() })
  }
}
