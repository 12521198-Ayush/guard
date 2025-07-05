'use client'
import QuickActions from './QuickActions'
import VisitorEntry from './VisitorEntry'
import GuestList from './GuestList'
import GuardVisitorForm from './new_form'
const KeypadScreen = () => {
  return (
    <div className="relative w-full text-gray-800 font-medium pb-6">
      <VisitorEntry />
      <GuestList />
      <QuickActions />
    </div>
  )
}

export default KeypadScreen 
