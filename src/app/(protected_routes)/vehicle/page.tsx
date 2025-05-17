'use client';

import React, { useEffect, useState } from 'react';
import { MdEdit, MdDelete, MdDirectionsCar, MdTwoWheeler, MdAdd, MdLocalParking } from 'react-icons/md';
import { useSession } from 'next-auth/react';
import VehicleFormModal from './VehicleFormModal'; // assuming modal is created
import Swal from 'sweetalert2';

interface Vehicle {
  _id: string;
  vno: string;
  parking_slot: string;
  parking_area_name: string;
  vehicle_type: '2w' | '4w';
}

const VehicleListPage: React.FC = () => {
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Vehicle | null>(null);

  useEffect(() => {
    fetch('http://139.84.166.124:8060/user-service/admin/parking/slot/vehicle_list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.user?.accessToken}`,
      },
      body: JSON.stringify({
        premise_id: session?.user?.primary_premise_id,
        premise_unit_id: session?.user?.premise_unit_id,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setVehicles(res.data);
        }
      })
      .catch((err) => console.error('Error fetching vehicles:', err));
  }, [session]);

  const handleAdd = () => {
    setEditData(null);
    setShowModal(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditData(vehicle);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    console.log('Delete vehicle', id);
    // Confirm + Delete Logic Here
  };

  const handleSave = async (data: any) => {
    const isEdit = !!data.oldvno;
    const url = isEdit
      ? 'http://139.84.166.124:8060/user-service/resident/parking/slot/edit_vehicle'
      : 'http://139.84.166.124:8060/user-service/resident/parking/slot/add_vehicle';

    console.log(`🚀 handleSave initiated`);
    console.log(`🔍 Mode: ${isEdit ? 'Edit' : 'Add'} Vehicle`);
    console.log(`🌐 Target URL: ${url}`);

    // Build raw payload
    const rawPayload = {
      ...data,
      premise_id: session?.user?.primary_premise_id,
      premise_unit_id: session?.user?.premise_unit_id,
      sub_premise_id: session?.user?.sub_premise_id,
    };

    // Remove edit-only fields if in edit mode
    if (isEdit) {
      delete rawPayload.create_ts;
      delete rawPayload.created_by;
      delete rawPayload.mod_by;
      delete rawPayload._id;
    }

    // Clean undefined/null/empty values
    const payload = Object.entries(rawPayload).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    console.log('📦 Final Payload:', payload);
    console.log('🔑 Using AccessToken:', session?.user?.accessToken?.slice(0, 20) + '...');

    try {
      console.log('📤 Sending request...');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 Response received');

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const resData = await response.json();
      console.log('✅ API Response:', resData);

      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Vehicle updated!' : 'Vehicle added!',
        text: isEdit
          ? 'The vehicle details have been updated successfully.'
          : 'Your request has been sent to the admin for approval. Once approved, it will be visible here.',
        confirmButtonColor: '#43a047',
      });

      return resData;
    } catch (error: any) {
      console.error('❌ Fetch error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: error.message || 'Something went wrong.',
        confirmButtonColor: '#e53935',
      });
      throw error;
    }
  };


  return (
    <div className="bg-white p-3 font-sans relative ">
      {/* Header */}
      <div className="flex justify-center mb-6 ">
        <h2
          className="text-xl font-medium text-[#222] px-6 py-3 rounded-2xl bg-white"
          style={{
            textAlign: 'center',
            width: '90%',
            background: 'linear-gradient(to right, #ffffff, #f9fbfd)',
            boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.05), inset 0 -1px 3px rgba(0, 0, 0, 0.07)',
          }}
        >
          Vehicle List
        </h2>
      </div>

      {/* Vehicle Cards */}
      <div className="space-y-4 overflow-y-auto pb-20" style={{ height: '77vh' }}>
        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full mt-10 text-center text-gray-500">
            <p className="text-lg font-medium">No vehicles added yet</p>
            <p className="text-sm text-gray-400">Add a vehicle to see it listed here</p>
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className="flex items-start justify-between px-4 py-4 rounded-2xl bg-white shadow-md"
              style={{
                background: 'linear-gradient(to right, #ffffff, #f3f6f9)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              {/* Left Block */}
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="mt-1 text-3xl text-blue-600">
                  {vehicle.vehicle_type === '4w' ? (
                    <MdDirectionsCar />
                  ) : (
                    <MdTwoWheeler className="text-green-500" />
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-gray-800">{vehicle.vno}</span>
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <MdLocalParking className="text-blue-500" />
                    {vehicle.parking_slot} • {vehicle.parking_area_name}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    Type: {vehicle.vehicle_type === '4w' ? '4-Wheeler' : '2-Wheeler'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(vehicle)} className="text-blue-600">
                  <MdEdit className="text-2xl" />
                </button>
                {/* <button onClick={() => handleDelete(vehicle._id)} className="text-red-500">
                  <MdDelete className="text-2xl" />
                </button> */}
              </div>
            </div>
          ))
        )}
      </div>


      {/* Add Floating Button */}
      <button
        onClick={handleAdd}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
      >
        <MdAdd className="text-3xl" />
      </button>

      {/* Modal */}
      <div>
        <VehicleFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          initialData={editData || undefined}
          mode={editData ? 'edit' : 'add'}
        />
      </div>
    </div>
  );
};

export default VehicleListPage;
