'use client'
import React, { useEffect, useState } from 'react'
import SkillsList from './SkillsList'
import TicketDrawer from './TicketDrawer'
import axios from 'axios'

const CreateOrPendingTicketPage = () => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  const fetchTickets = async () => {
    const res = await axios.post('http://139.84.166.124:8060/order-service/list', {
      premise_id: 'c319f4c3-c3ac-cd2e-fc4f-b6fa9f1625af',
      sub_premise_id: '0aad0a20-6b21-11ef-b2cb-13f201b16993',
      premise_unit_id: 'D-0005',
      order_status: 'pending',
    })
    return res.data.data.array
  }

  const handleSkillClick = async (skill: string) => {
    setSelectedSkill(skill)
    const data = await fetchTickets()
    const filtered = data.filter((ticket: any) => ticket.servicetype.toLowerCase() === skill.toLowerCase())
    setTickets(filtered)
    setDrawerOpen(true)
  }

  return (
    <>
      <SkillsList onSkillClick={handleSkillClick} />
      <TicketDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} skill={selectedSkill} tickets={tickets} />
    </>
  )
}

export default CreateOrPendingTicketPage
