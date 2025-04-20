import React from 'react'

const TicketCard = ({ ticket }: { ticket: any }) => {
  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm">
      <div className="text-sm text-gray-600">Order ID: {ticket.order_id}</div>
      <div className="text-md font-semibold">{ticket.customer_name} ({ticket.customer_mobile})</div>
      <div className="text-sm">order_description: {ticket.order_description}</div>
      <div className="text-xs text-gray-500 mt-1">Priority: {ticket.service_priority}</div>
      <div className="text-xs text-gray-500 mt-1">order_creation_ts: {ticket.order_creation_ts}</div>
      <div className="text-xs text-gray-500 mt-1">Assigned to: {ticket.assigned}</div>
    </div>
  )
}

export default TicketCard
