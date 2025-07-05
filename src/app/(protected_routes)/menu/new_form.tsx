'use client'

import React, { useEffect, useState } from 'react'

const API_BASE = 'http://139.84.166.124:8060/user-service/registration'

const premise_id = '348afcc9-d024-3fe9-2e85-bf5a9694ea19'

const GuardVisitorForm = () => {
    const [name, setName] = useState('')
    const [guestType, setGuestType] = useState('')
    const [vehicleType, setVehicleType] = useState('')
    const [vehicleNumber, setVehicleNumber] = useState('')
    const [premise, setPremise] = useState(premise_id)
    const [subPremises, setSubPremises] = useState<any[]>([])
    const [selectedTower, setSelectedTower] = useState('')
    const [premiseUnits, setPremiseUnits] = useState<any[]>([])
    const [selectedFlats, setSelectedFlats] = useState<string[]>([])

    const guestTypes = ['delivery', 'private', 'cab', 'others']
    const vehicleTypes = ['car', 'bike', 'pedestrian']

    useEffect(() => {
        fetchSubPremises(premise_id)
    }, [])

    const fetchSubPremises = async (selectedPremise: string) => {
        setPremise(selectedPremise)
        try {
            const res = await fetch(`${API_BASE}/subpremise/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ premise_id: selectedPremise })
            })
            const data = await res.json()
            setSubPremises(data.data || [])
        } catch (error) {
            console.error('Error fetching sub-premises:', error)
        }
    }

    const fetchPremiseUnits = async (selectedSubPremise: string) => {
        setSelectedTower(selectedSubPremise)
        try {
            const res = await fetch(`${API_BASE}/premise_unit/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    premise_id: premise,
                    sub_premise_id: selectedSubPremise
                })
            })
            const data = await res.json()
            setPremiseUnits(data.data || [])
        } catch (error) {
            console.error('Error fetching premise units:', error)
        }
    }

    const handleFlatToggle = (unit: string) => {
        if (selectedFlats.includes(unit)) {
            setSelectedFlats((prev) => prev.filter((f) => f !== unit))
        } else {
            setSelectedFlats((prev) => [...prev, unit])
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-lg space-y-6 mt-6">
            <h2 className="text-xl font-semibold">Visitor Entry Form</h2>

            {/* Step 1 - Name + Guest Type */}
            <div className="space-y-2">
                <label className="block text-sm font-medium">Visitor Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                />

                <label className="block text-sm font-medium mt-4">Guest Type</label>
                <div className="flex gap-2 flex-wrap">
                    {guestTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => setGuestType(type)}
                            className={`px-4 py-1.5 rounded-full border ${
                                guestType === type
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Step 2 - Vehicle Info */}
            {guestType && (
                <div className="space-y-3">
                    <label className="block text-sm font-medium">Vehicle Type</label>
                    <div className="flex gap-2 flex-wrap">
                        {vehicleTypes
                            .filter((v) => !(guestType === 'cab' && v === 'pedestrian'))
                            .map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setVehicleType(v)}
                                    className={`px-4 py-1.5 rounded-full border ${
                                        vehicleType === v
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {v}
                                </button>
                            ))}
                    </div>

                    {vehicleType !== 'pedestrian' && (
                        <input
                            type="text"
                            placeholder="Vehicle Number"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                        />
                    )}
                </div>
            )}

            {/* Step 3 - Tower + Flats */}
            {vehicleType && (
                <div className="space-y-4">
                    <label className="block text-sm font-medium">Select Tower</label>
                    <select
                        value={selectedTower}
                        onChange={(e) => fetchPremiseUnits(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                    >
                        <option value="">Select Tower</option>
                        {subPremises.map((sp) => (
                            <option key={sp.id} value={sp.id}>
                                {sp.name || sp.sub_premise_name}
                            </option>
                        ))}
                    </select>

                    {/* Selected Flats */}
                    {selectedFlats.length > 0 && (
                        <div className="bg-gray-100 p-2 rounded-lg">
                            <p className="font-medium text-sm mb-2">Selected Flats:</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedFlats.map((flat) => (
                                    <span
                                        key={flat}
                                        className="bg-blue-100 text-blue-700 px-2 py-1 text-sm rounded-full flex items-center gap-2"
                                    >
                                        {flat}
                                        <button onClick={() => handleFlatToggle(flat)} className="text-xs">✕</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Flat List */}
                    <div className="grid grid-cols-3 gap-2">
                        {premiseUnits.map((unit) => (
                            <button
                                key={unit.unit_id}
                                onClick={() => handleFlatToggle(unit.unit_number)}
                                className={`text-sm border rounded px-2 py-1 ${
                                    selectedFlats.includes(unit.unit_number)
                                        ? 'bg-green-600 text-white'
                                        : 'bg-white text-gray-800'
                                }`}
                            >
                                {unit.unit_number}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default GuardVisitorForm
