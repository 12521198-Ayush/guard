import React, { useEffect, useState } from 'react'
import axios from 'axios'
import SkillItem from './SkillItem'

interface Props {
    onSkillClick: (skill: string) => void
}

const SkillsList: React.FC<Props> = ({ onSkillClick }) => {
    const [skills, setSkills] = useState<any[]>([])

    useEffect(() => {
        const fetchSkills = async () => {
            const res = await axios.post('http://139.84.166.124:8060/staff-service/skills', {
                premise_id: 'c319f4c3-c3ac-cd2e-fc4f-b6fa9f1625af',
                sub_premise_id: '0aad0a20-6b21-11ef-b2cb-13f201b16993',
                premise_unit_id: 'D-0005',
            })
            const formatted = res.data.data.map((item: any) => ({
                ...item,
                // mobile: item.mobile || 'N/A',
                // location: item.location || 'Not Available',
            }))

            setSkills(formatted)
        }
        fetchSkills()
    }, [])

    return (
        <div className="flex flex-col gap-4 p-2">
            <div className="flex justify-center mb-6">
                <h2
                    className="text-xl font-medium text-[#222] px-6 py-3 rounded-2xl bg-white"
                    style={{
                        textAlign: 'center',
                        width: '90%',
                        background: 'linear-gradient(to right, #ffffff, #f9fbfd)',
                        boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.05), inset 0 -1px 3px rgba(0, 0, 0, 0.07)',
                    }}
                >
                    Manage Tickets
                </h2>
            </div>
            {skills.map((skill) => (
                <SkillItem key={skill._id} skill={skill} onClick={onSkillClick} />
            ))}
        </div>
    )
}

export default SkillsList
