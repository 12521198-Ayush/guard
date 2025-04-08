import { useState } from 'react'

type Props = {
  onClose: () => void
}

export default function OtherForm({ onClose }: Props) {
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    console.log({ description })
    onClose()
  }

  return (
    <div className="space-y-4">
      <textarea
        placeholder="Please specify..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border rounded-lg p-3 bg-gray-50 shadow-sm min-h-[100px]"
      />
      <button
        onClick={handleSubmit}
        className="w-full bg-yellow-500 text-white py-3 rounded-lg shadow-md hover:bg-yellow-600 transition"
      >
        Submit
      </button>
    </div>
  )
}
