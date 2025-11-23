🚀 Task Management System

A full-stack Task Management System with:

👨‍💼 Admin Dashboard
👤 User Dashboard
🔐 JWT Authentication
🔑 Role-Based Access Control
📝 Task Management
🧩 Admin Invite Token System
🎨 Smooth UI using Framer Motion



📌 Features
👨‍💼 Admin Features
Admin login
Create users (normal + admins)
View/manage tasks
View/manage users


👤 User Features
Register / Login
View personal tasks
Task details page


🛠 Tech Stack
Frontend
React (Vite)
Redux Toolkit
React Router v6
Axios
Framer Motion
TailwindCSS 


Backend
Node.js
Express.js
MongoDB Atlas (Mongoose)
bcryptjs
JWT Authentication



⚙️ Installation & Setup
1️⃣ Clone Project
git clone https://github.com/Amitkumarsahu1/Task-Management.git
cd task-management

🖥 Backend Setup
Install dependencies
cd backend
npm install

Create .env file
Paste this:

PORT=5000
JWT_SECRET=your_secret_key_here
MONGO_URL=paste_your_mongodb_atlas_url_here
ADMIN_JOIN_CODE=your_admin_join_code

Example MongoDB Atlas URL
mongodb+srv://yourUser:yourPassword@cluster0.mongodb.net/taskdb

🎨 Frontend Setup
Install dependencies
cd frontend
npm install

Add Framer Motion (IMPORTANT)
npm install framer-motion


▶️ Run App (Frontend + Backend)
You can run both using:
npm run dev

OR run individually:

Frontend:
cd frontend
npm run dev

Backend:
cd backend
npm run dev


🧩 Admin Invite Token System (Signup Rule)
When registering on the Signup Page, a user sees:

Admin Invite Token Field

If token entered is: Admin_Invite_Token_code
→ User becomes Admin

If token is empty
→ User becomes Normal User


This logic must be handled in:
Frontend: Signup form
Backend: Register API → check token before assigning role


🧪 Default Admin Login (Optional)
You can also use the hard-coded admin login:

email: admin@gmail.com
password: admin123