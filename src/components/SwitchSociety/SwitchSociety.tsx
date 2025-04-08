'use client';
import React, { useState } from 'react';
import { Modal, Select } from 'antd';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { HomeOutlined } from '@ant-design/icons';

type PremiseUnit = {
    premise_id: string;
    premise_name: string;
    sub_premise_id: string;
    premise_unit_id: string;
    mobile: string;
    email: string;
    name: string;
    association_type: string;
};

const SwitchSociety = ({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) => {
    const { data: session, update } = useSession();
    const [selected, setSelected] = useState<PremiseUnit | null>(null);

    const handleSwitch = async () => {
        if (!selected) {
            Swal.fire({
                title: 'No Selection!',
                text: 'Please select a society to switch.',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#f59e0b',
                width: '350px',
            });
            return;
        }

        const current = session?.user;

        const isSameSociety =
            current?.premise_unit_id === selected.premise_unit_id &&
            current?.primary_premise_id === selected.premise_id &&
            current?.sub_premise_id === selected.sub_premise_id;

        if (isSameSociety) {
            Swal.fire({
                title: 'Already in this society',
                text: 'You are already using this society.',
                icon: 'info',
                confirmButtonText: 'OK',
                confirmButtonColor: '#007bff',
                width: '350px',
            });
            return;
        }

        await update({
            primary_premise_id: selected.premise_id,
            primary_premise_name: selected.premise_name,
            premise_unit_id: selected.premise_unit_id,
            sub_premise_id: selected.sub_premise_id,
            role: selected.association_type,
        });

        onClose();

        Swal.fire({
            title: 'Switched!',
            text: 'Your society has been switched.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#28a745',
            width: '350px',
        }).then(() => {
            window.location.reload();
        });
    };

    const options = (
        (session?.user?.premises_associated_with as unknown as PremiseUnit[]) || []
    ).map((unit) => ({
        label: `${unit.premise_name} - ${unit.premise_unit_id} (${unit.association_type})`,
        value: unit.premise_unit_id,
        unit: unit,
    }));

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            closable={false}
            centered={false}
            width={350}
            style={{ top: 200 }} // shifted upward
        >
            <div className=" bg-white rounded-2xl transition-all duration-300 ease-in-out transform scale-100 sm:scale-100 sm:w-full">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                    <HomeOutlined style={{ color: '#4CAF50', marginRight: '8px' }} />
                    Switch Unit
                </h2>

                <Select
                    style={{ width: '100%', height: 45 }}
                    placeholder="Select a unit"
                    options={options}
                    onChange={(value, option) => setSelected((option as any).unit)}
                    optionFilterProp="label"
                />

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSwitch}
                        className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
                    >
                        Switch
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default SwitchSociety;
