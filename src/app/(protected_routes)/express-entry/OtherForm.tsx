import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const OtherForm = () => {
  const router = useRouter()
  useEffect(() => {
    router.push('/visitor-list');
  }, [])

  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  )
}

export default OtherForm