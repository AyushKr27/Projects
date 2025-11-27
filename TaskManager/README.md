# Task Manager (MERN)

A complete **MERN Stack Task Manager** featuring:

- 🔐 JWT Authentication (Register + Login)
- 🔒 Protected Routes (Frontend + Backend)
- 📝 Task CRUD (Create, Read, Update, Delete)
- 🔄 Drag-and-Drop Reordering (Persistent)
- 🔍 Search, Filter & Sort Tasks
- ✏️ Edit Modal for task updates
- 🔔 Toast Notifications
- 🎨 Modern UI with TailwindCSS (glass + gradients)
- ⚛️ React + Redux Toolkit
- 🗄️ MongoDB + Mongoose

---

## 🚀 Local Setup Instructions

### 1️⃣ Clone the Repository

git clone <your-repo-url>
cd task-manager

### 2️⃣ Install Dependencies
cd backend
npm install
### 3️⃣ Create .env File
MONGODB_URI=mongodb://localhost:27017/taskdb  *(you can use your own mongodb uri)*
JWT_SECRET=your_secret_key_here
PORT=4000
### 4️⃣ Run Backend
npm run dev

Backend runs at:

http://localhost:4000

💻 Frontend Setup (React + Vite)
Install Dependencies

cd ../frontend
npm install

Start Frontend
npm run dev

Frontend runs at:

http://localhost:5173

📡 API Documentation 

🔐 Authentication Routes
POST /auth/register

Creates a new user account.
Body: { username, password }
Returns: User info.

POST /auth/login

Logs in and returns a JWT token.
Body: { username, password }
Returns: { token }

📝 Task Routes (Protected — require JWT)
GET /tasks

Fetch all tasks belonging to the logged-in user.

POST /tasks

Create a new task.
Body: { title, description, status }
Returns the created task.

PUT /tasks/:id

Update an existing task.
Body: Any of { title, description, status, order }

DELETE /tasks/:id

Delete a task by ID.

POST /tasks/reorder

Bulk update order of tasks (drag-and-drop support).
Body: { orders: [{ id, order }] }
