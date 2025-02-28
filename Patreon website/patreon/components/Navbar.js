import React from 'react'

const Navbar = () => {
  return (
    <nav className='flex bg-[#e7c2ab] text-[#323232] justify-between px-4 items-center h-12'>
      <div className='logo font-bold text-[#323232] text-lg'>Coffee4Me</div>
      <ul className='flex justify-between gap-4'>
        <li>Home</li>
        <li>About</li>
        <li>Projects</li>
        <li>Sign Up</li>
        <li>Login</li>
      </ul>
    </nav>
  )
}

export default Navbar
