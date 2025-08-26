import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"

dotenv.config()

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database is connected")
  })
  .catch((err) => {
    console.log(err)
  })

const app = express()

// Middleware to handle cors
app.use(
  cors({
    origin: process.env.FRONT_END_URL || "http://localhost:5174",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

// Middleware to handle JSON object in req body
app.use(express.json())

app.listen(3000, () => {
  console.log("Server is running on port 3000!")
})
