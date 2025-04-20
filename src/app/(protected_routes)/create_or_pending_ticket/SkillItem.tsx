import React from 'react'
import { ChevronRight } from 'lucide-react'

interface Props {
  skill: {
    skill: string
    skill_image_url: string
  }
  onClick: (skill: string) => void
}

const getSkillDescription = (skill: string) => {
  switch (skill.toLowerCase()) {
    case 'maid':
      return 'Cleaning, dusting, and household chores'
    case 'cook':
      return 'Home-cooked meals, snacks, and tiffin prep'
    case 'carpenter':
      return 'Furniture repair and woodwork services'
    default:
      return 'Click to view details'
  }
}

const SkillItem: React.FC<Props> = ({ skill, onClick }) => {
  return (
    <div
      onClick={() => onClick(skill.skill)}
      className="bg-white rounded-2xl p-4 flex items-center justify-between gap-4 shadow-md hover:shadow-lg transition-all duration-200 ease-in-out cursor-pointer active:scale-[0.98]"
    >
      {/* Left Side: Image + Label + Description */}
      <div className="flex items-center gap-4">
        <img
          src={skill.skill_image_url}
          alt={skill.skill}
          className="w-14 h-14 rounded-full object-cover shadow-sm transition-transform duration-200"
        />
        <div className="flex flex-col">
          <div className="text-gray-800 text-base font-semibold capitalize">
            {skill.skill}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {getSkillDescription(skill.skill)}
          </div>
        </div>
      </div>

      {/* Right Side: Chevron */}
      <ChevronRight className="text-gray-400" size={20} />
    </div>
  )
}

export default SkillItem
