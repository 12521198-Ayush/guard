import { useState } from 'react'

type Props = {
  onClose: () => void
}

export default function GuestForm({ onClose }: Props) {
  const [name, setName] = useState('')
  const [purpose, setPurpose] = useState('')

  const handleSubmit = () => {
    console.log({ name, purpose })
    onClose()
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Guest Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded-lg p-3 bg-gray-50 shadow-sm"
      />
      <input
        type="text"
        placeholder="Purpose of Visit"
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        className="w-full border rounded-lg p-3 bg-gray-50 shadow-sm"
      />
      <button
        onClick={handleSubmit}
        className="w-full bg-green-500 text-white py-3 rounded-lg shadow-md hover:bg-green-600 transition"
      >
        Submit
      </button>
    </div>
  )
}
