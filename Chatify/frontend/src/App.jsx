import './App.css'
import { Toaster } from 'react-hot-toast'
import Home from './components/Home'
import Login from './components/Login'
import MainLayout from './components/Mainlayout'
import Profile from './components/Profile'
import Signup from './components/Signup'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
const browserRouter =createBrowserRouter([
  {
    path:"/",
    element:<MainLayout/>,
    children:[{
      path:'/',
      element: <Home/>
    },
  {
      path:'/profile',
      element: <Profile/>
  },
]
  },
  {
    path:'/login',
    element:<Login/>
  },
  {
    path:'/signup',
    element:<Signup/>
  }
])
function App() {
  return (
    <>
    <RouterProvider router={browserRouter}/>
    <Toaster position="top-left" reverseOrder={false}/>
         </>
  )
}

export default App
