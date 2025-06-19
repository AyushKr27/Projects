# 📝 Feedback Collection Tool

A full-stack feedback collection system built with **React**, **Node.js**, **Express**, **MongoDB**, **JWT**, and **Socket.IO**. It allows users to submit anonymous feedback and gives administrators a real-time dashboard to manage and analyze entries.

---

## 🚀 Features

### 🔧 User-Side
- Anonymous feedback form
- Required fields: Name, Email, Feedback, Rating (1–5 stars)
- Star rating selection
- Form validation with error handling
- Thank-you message with auto-redirect to form

### 🔐 Admin Panel
- Admin login with JWT authentication
- View feedback list in real-time
- Sort by date or rating
- Filter by specific rating
- View statistics (average rating, total feedbacks)
- Delete all feedback entries
- Export feedback list as CSV

---

## 🛠 Tech Stack

| Area       | Tech                     |
|------------|--------------------------|
| Frontend   | React (Vite), CSS        |
| Backend    | Express.js, Node.js      |
| Database   | MongoDB + Mongoose       |
| Real-Time  | Socket.IO                |
| Auth       | JSON Web Tokens (JWT)    |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

feedback-tool/
│
├── client/ # Frontend - React App
│ ├── src/
│ │ ├── components/ # FeedbackForm, AdminDashboard, Login
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── styles/
│ └── vite.config.js
│
├── server/ # Backend - Node.js/Express App
│ ├── routes/
│ ├── models/
│ ├── middleware/
│ ├── index.js
│ └── .env
│
└── README.md


---

## ⚙️ Setup Instructions

### ✅ Prerequisites

- Node.js v16+
- MongoDB instance (local or Atlas)

---

### 🔧 Clone & Install

```bash
git clone https://github.com/your-username/feedback-tool.git
cd feedback-tool
