# React + Go Shopping Cart Application

## Overview

A full-stack shopping cart app featuring:

- **Golang backend**: Gin framework, GORM ORM
- **React frontend**: Material UI, react-toastify

Users can browse products, manage their cart, place orders, and view order history. The backend secures routes via authentication middleware and role-based access (admin-only).

---

## Project Structure

```
your-repo/
│
├── backend/             # Go backend REST API
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   │   └── routes.go    # SetupRoutes function
│   ├── main.go
│   ├── go.mod
│   └── ...
│
├── frontend/            # React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── ItemList.jsx
│   │   │   ├── Cart.jsx
│   │   │   └── ...
│   │   ├── App.js
│   │   ├── api.js
│   │   └── ...
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## Backend API Endpoints

### Public

| Endpoint        | Method | Description                |
|-----------------|--------|----------------------------|
| `/users`        | POST   | Register a new user        |
| `/users/login`  | POST   | Login user and get token   |
| `/items`        | GET    | Get list of all items      |

### Admin Routes (Require Authentication & Admin Role)

| Endpoint                | Method | Description           |
|-------------------------|--------|-----------------------|
| `/admin/items`          | POST   | Add a new item        |
| `/admin/items/:id`      | PUT    | Update item by ID     |
| `/admin/items/:id`      | DELETE | Delete item by ID     |

### Authenticated User Routes

| Endpoint      | Method | Description                    |
|---------------|--------|--------------------------------|
| `/cart`       | POST   | Add item(s) to user cart       |
| `/cart`       | GET    | Retrieve user's cart contents  |
| `/orders`     | POST   | Create a new order from cart   |
| `/orders`     | GET    | Get all orders placed by user  |

---

## Backend Middleware

- **AuthMiddleware**: Protects authenticated routes by verifying tokens.
- **AdminOnly**: Restricts routes for users with admin privileges.

---

## Installation & Setup

### Backend (Go API)

```bash
cd backend
go mod tidy
go run main.go
```
Runs at [http://localhost:8080](http://localhost:8080) by default.

### Frontend (React)

```bash
cd ../frontend
npm install
npm start
```
Runs at [http://localhost:3000](http://localhost:3000).

> **Note:** Ensure API calls use the correct backend URL (e.g., via `src/api.js`).

---

## Features Summary

- **User Management**: Registration and login with JWT authentication.
- **Role-Based Access Control**: Admin routes for item management.
- **Product Management**: Public endpoint to fetch products.
- **Cart Management**: Authenticated users can add/view/modify carts.
- **Order Management**: Place orders and view history.
- **Frontend**: React app with Material UI and react-toastify.

---

## Example Usage Flows

### Register & Login

- Register: `POST /users`
- Login: `POST /users/login` (receive token)

### Browsing & Cart

- Fetch items: `GET /items`
- Add to cart: `POST /cart` (authenticated)
- View cart: `GET /cart` (authenticated)

### Order Placement & History

- Place order: `POST /orders` (authenticated)
- Get orders: `GET /orders` (authenticated)
- Frontend displays order history via toast message

### Admin Operations

- Create/update/delete items: `/admin/items` routes (admin only)

---

## Dependencies

### Backend

- [Gin Web Framework](https://github.com/gin-gonic/gin)
- [GORM ORM](https://gorm.io/gorm)
- Middleware for authentication/authorization

### Frontend

- [React](https://react.dev/)
- [Material UI](https://mui.com/)
- [React Router](https://reactrouter.com/)
- [react-toastify](https://fkhadra.github.io/react-toastify/)
- [Axios](https://axios-http.com/) or custom API interface

---