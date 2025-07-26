'use client'
import { menuItems } from '@/lib/constants'
import { useRouter } from 'next/navigation'

const QuickActions = () => {
  const router = useRouter()

  const handleClick = (path: string) => {
    router.push(path)
  }

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold px-4 pb-2 text-gray-900">
        Quick Action Tools
      </h2>
      <div className="overflow-x-auto whitespace-nowrap px-4 py-2 space-x-3 flex">
        {menuItems.map(({ icon: Icon, label, color, path }, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(path)}
            className="cursor-pointer min-w-[100px] max-w-[120px] bg-white rounded-2xl shadow-md flex flex-col items-center justify-center py-4 px-3 active:scale-[0.97] transition-transform"
          >
            <Icon className={`w-6 h-6 ${color}`} />
            <span className="text-xs mt-2 text-center">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuickActions
