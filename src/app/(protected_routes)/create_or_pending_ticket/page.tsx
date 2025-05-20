'use client'
import React, { useEffect, useState } from 'react'
import SkillsList from './SkillsList'
import TicketDrawer from './TicketDrawer'
import axios from 'axios'
import { useSession } from 'next-auth/react';

const CreateOrPendingTicketPage = () => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { data: session } = useSession();

  const fetchTickets = async () => {
    const res = await axios.post('http://139.84.166.124:8060/order-service/list', {
      premise_id: session?.user?.primary_premise_id,
      sub_premise_id: session?.user?.sub_premise_id,
      premise_unit_id: session?.user?.premise_unit_id,
      order_status: 'open',
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
