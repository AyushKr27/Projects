import React, { useState } from 'react'
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from "lucide-react";
const Login = () => {
  const[input,setinput]=useState({
    email:"",
    password:""
  });
  const[loading,setloading]=useState(false);
  const navigate=useNavigate();
  const changeEventHandler=(e)=>{
    setinput({...input,[e.target.name]:e.target.value});
  }
  const signupHandler=async(e)=>{
    e.preventDefault();
    try {
      setloading(true);
      const res=await axios.post('/api/v2/user/login',input,{
        headers:{
          'Content-Type':'application/json'
        },
        withCredentials:true
      });
      console.log(res.data);
      if(res.data.success){
        navigate("/");
        toast.success(res.data.message);
        setinput({
          email:"",
          password:""
        });
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
      toast.error(error.res?.data?.message||"Something Went Wrong");
    setloading(false);
    }
  }
  return (
    <div className='flex flex-col items-center w-screen h-screen justify-center bg-black'>
        <form onSubmit={signupHandler} className='shadow-xl hover:shadow-2xl flex flex-col gap-5 p-16 rounded-2xl bg-slate-600'>
      <div className='my-4 mx-auto'>
      <h1 className='text-center font-bold text-xl'>LOGO</h1>
      <p className='text-sm text-center'>Login</p>
      </div>
      <div>
      <span className='font-medium'>Email</span>
      <br />
      <input 
      type="email" name="email" value={input.email}
      onChange={changeEventHandler} className='focus-visible:ring-transparent my-2' />
      </div>
      <div>
      <span className='font-medium'>Password</span>
      <br />
      <input 
      type="password" name="password" value={input.password}
      onChange={changeEventHandler} className='focus-visible:ring-transparent my-2' />
      </div>
      {
        loading ? (
            <button className='relative flex items-center justify-center'>
                <Loader2 className='absolute h-5 w-5 animate-spin text-white"'/>
            </button>
        ) : (
            <button type='submit'>LogIn</button>
        )
      }
      <span className='text-center'>Doesn't have an Account?<Link to="/signup" className='text-blue-800'>Signup</Link></span>
      </form>
    </div>
  )
}

export default Login
