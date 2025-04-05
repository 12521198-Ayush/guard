import React from 'react'
import dynamic from 'next/dynamic';
const Register = dynamic(() => import('./Register'), { ssr: false });

const page = () => {
  return (
    <div>
       <Register />
    </div>
  )
}

export default page
