import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react'
import { toast } from 'react-toastify';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
const Signup = () => {
  const[input,setinput]=useState({
    username:"",
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
      const res=await axios.post('/api/v2/user/register',input,{
        headers:{
          'Content-Type':'application/json'
        },
        withCredentials:true
      });
      if(res.data.success){
        toast.success('Account created successfully');
        navigate("/login");
        setinput({
          username:"",
          email:"",
          password:""
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.res?.data?.message||"Something Went Wrong");
    }
    finally{
      setloading(false);
    }
  }
  return (
    <div className='flex flex-col items-center w-screen h-screen justify-center bg-black'>
        <form onSubmit={signupHandler} className='shadow-xl hover:shadow-2xl flex flex-col gap-5 p-16 rounded-2xl bg-slate-600'>
      <div className='my-4 mx-auto'>
      <h1 className='text-center font-bold text-xl'>LOGO</h1>
      <p className='text-sm text-center'>Signup</p>
      </div>
      <div>
      <span className='font-medium'>Username</span>
      <br />
      <input 
      type="text" className='focus-visible:ring-transparent my-2'name="username" value={input.username}
      onChange={changeEventHandler} />
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
            <button type='submit'>SignUp</button>
        )
      }
      <span className='text-center'>Already have an account?<Link to="/login" className='text-blue-800'>Login</Link></span>
      </form>
    </div>
  )
}

export default Signup
