import React from 'react'
import { v4 as uuidv4 } from 'uuid';
import { Bounce, Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRef, useState, useEffect } from 'react'
const Manager = () => {
  const ref = useRef()
  const passwordref = useRef()
  const [form, setform] = useState({ site: "", username: "", password: "" })
  const [passwordarray, setpasswordarray] = useState([])
  const getpassword=async() => {
    let req= await fetch("http://localhost:3000")
    let passwords = await req.json()
    setpasswordarray(passwords)
    console.log(passwords)
  }
  
  useEffect(() => {
    getpassword()
  }, [])
  const copytext = (text) => {
    toast('Copied to Clipboard !', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Slide,
    });
    navigator.clipboard.writeText(text)
  }
  const showpassword = () => {
    passwordref.current.type = "text"
    console.log(ref.current.src)
    if (ref.current.src.includes("icons/hidden.png")) {
      ref.current.src = "icons/show.png"
      passwordref.current.type = "password"
    }
    else {
      ref.current.src = "icons/hidden.png"
      passwordref.current.type = "text"
    }

  }
  const savepassword = async() => {
    if(form.site.length >3 && form.username.length >3 && form.password.length >3){
      await fetch("http://localhost:3000/",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:form.id})})
    setpasswordarray([...passwordarray, {...form,id:uuidv4()}])
    await fetch("http://localhost:3000/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,id:uuidv4()})})
    setform({ site: "", username: "", password: "" })
    toast('Password saved successfully!', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Slide,
    });
  }
  else{
    toast("Error:Password cannot be saved due to wrong length of credentials", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition:Slide,
    });
  }
}
  const deletepassword = async(id) => {
    console.log("Deleting password with id",id)
    let c=confirm("Do you really want to delete this saved password?")
    if(c){
    setpasswordarray(passwordarray.filter(item=>item.id!==id))
    let res=await fetch("http://localhost:5173/",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})})
    toast('Password deleted successfully!', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Slide,
    });
  }
}
  const editpassword = (id) => {
    console.log("Editing password with id",id)
    setform({...passwordarray.filter(i=>i.id===id)[0],id:id})
    setpasswordarray(passwordarray.filter(item=>item.id!==id))
  }
  const handlechange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value })
  }
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition="Slide"
      />
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <div className="mx-auto bg-slate-300 max-w-4xl rounded-lg my-11 min-h-[82vh] ">
        <p className='text-violet-800 text-xl text-center'>
          <img className='w-12 mx-auto pt-1' src="/svg1.svg" alt="" />Your Own Password Manager</p>
        <div className='text-black flex flex-col p-4 gap-5'>
          <input value={form.site} onChange={handlechange} placeholder='Enter Website URL' className='rounded-md border border-violet-800 text-black p-4 py-1 ' type="text" name='site' />
          <div className="flex flex-col md:flex-row gap-5">
            <input value={form.username} onChange={handlechange} placeholder='Enter Username' className='rounded-md w-full border border-violet-800 text-black p-4 py-1 ' type="text" name='username' />
            <div className="relative">
              <input ref={passwordref} value={form.password} onChange={handlechange} placeholder='Enter Password' className='rounded-md w-full border border-violet-800 text-black p-4 py-1 ' type="password" name='password' />
              <span className='absolute right-0 top-0 cursor-pointer' onClick={showpassword}>
                <img ref={ref} className="p-2" width={35} src="icons/show.png" alt="eye" /></span>
            </div></div>
          <button onClick={savepassword} className='flex flex-row justify-center items-center w-fit mx-auto text-white bg-violet-600 hover:bg-violet-800 border border-violet-800 rounded-lg '>
            <dotlottie-player src="https://lottie.host/40723542-d82d-47ab-aead-6508215530ca/2SNT4MHB4C.json" background="transparent" speed="0.50" loop autoplay></dotlottie-player> 
         <span className='mr-1'>Save</span> </button>
        </div>
        <div className="passwords">
          <h2 className='font-bold text-2xl py-2 text-center text-violet-800'>Your Saved Passwords</h2>
          {passwordarray.length === 0 && <div>No Passwords to show</div>}
          {passwordarray.length != 0 && <table className="table-auto w-full rounded-3xl overflow-hidden">
            <thead className='bg-violet-700 text-white text-lg'>
              <tr>
                <th className='py-2'>Site</th>
                <th className='py-2'>UserName</th>
                <th className='py-2'>Password</th>
                <th className='py-2'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-violet-200'>
              {passwordarray.map((item, index) => {
                return <tr key={index}>
                  <td className='ml-4 justify-center py-2 text-center w-28'><div className='flex justify-center items-center'><a href={item.site} target='_blank'>{item.site}</a>
                    <div className='copyicon cursor-pointer size-7' onClick={() => { copytext(item.site) }}><dotlottie-player style={{ width: "30px", height: "30px" }} src="https://lottie.host/6e1e55d5-39f1-4176-a493-72cd1cfe84f7/QAFQ9ymTWR.json" loop autoplay background="transparent" ></dotlottie-player></div>
                    </div>
                  </td>
                  <td className='py-2 text-center '><div className='flex justify-center items-center'><span>{item.username}</span>
                    <div className='copyicon cursor-pointer size-7' onClick={() => { copytext(item.username) }}><dotlottie-player style={{ width: "30px", height: "30px" }} src="https://lottie.host/6e1e55d5-39f1-4176-a493-72cd1cfe84f7/QAFQ9ymTWR.json" loop autoplay background="transparent" ></dotlottie-player></div>
                    </div>
                  </td>
                  <td className='py-2 text-center '><div className='flex justify-center items-center'><span>{"*".repeat(item.password.length)}</span>
                    <div className='copyicon cursor-pointer size-7' onClick={() => { copytext(item.password) }}><dotlottie-player style={{ width: "30px", height: "30px" }} src="https://lottie.host/6e1e55d5-39f1-4176-a493-72cd1cfe84f7/QAFQ9ymTWR.json" loop autoplay background="transparent" ></dotlottie-player></div>
                    </div>
                  </td>
                  <td className='py-2 flex flex-row justify-center '>
                    <span className='cursor-pointer mx-1'onClick={()=>{editpassword(item.id)}}><img width={25} src="/icons/edit.png" alt="" /></span>
                    <span className='cursor-pointer mx-1'onClick={()=>{deletepassword(item.id)}}>
                    <lord-icon
    src="https://cdn.lordicon.com/skkahier.json"
    trigger="morph"
    state="morph-trash-full"
    colors="primary:#6d28d9"
    style={{"width":"25px",height:"25px"}}>
</lord-icon>
                      </span>
                  </td>
                </tr>
              })}
            </tbody>
          </table>}
        </div>
      </div>
    </>
  )
}

export default Manager
