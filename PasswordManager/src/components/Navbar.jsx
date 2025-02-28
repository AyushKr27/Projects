import React from 'react'

const Navbar = () => {
  return (
    <nav className=' bg-slate-200 flex justify-between items-center h-12 px-4'>
      <div className='logo font-bold text-2xl'>
       <span className='text-violet-800'>&lt;Pass</span>
       <span> ManageR</span>
       <span className='text-violet-800'>&gt;</span>
        </div>
      <ul>
        <li className='flex gap-4'>
      <a className='hover:font-semibold' href="/">Home</a>
      <a className='hover:font-semibold' href="#">About</a>
      <a className='hover:font-semibold' href="#">Contact</a>
      </li>
      </ul>
    </nav>
  )
}

export default Navbar
