import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Table, Spin, Select } from 'antd';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Swal from 'sweetalert2';

const { Option } = Select;

interface TagNewHelperProps {
    visible: boolean;
    premiseId: string;
    premiseUnitId: string;
    subPremiseId: string;
    onClose: () => void;
    fetchHelpers: () => void;
}

interface Helper {
    sub_premise_id_array: string[];
    card_no: number;
    name: string;
    mobile: string;
    address: string;
    qr_code: string;
    skill: string;
    father_name: string;
    premise_unit_associated_with: { premise_unit_id: string }[];
    picture_url: string;
}

interface Skill {
    _id: string;
    skill: string;
    skill_image_url: string;
}

const TagNewHelper: React.FC<TagNewHelperProps> = ({
    premiseId,
    subPremiseId,
    premiseUnitId,
    onClose,
    visible,
    fetchHelpers
}) => {
    const [cardNo, setCardNo] = useState<number | undefined>();
    const [loading, setLoading] = useState(false);
    const [helpersData, setHelpersData] = useState<Helper[]>([]);
    const { data: session } = useSession();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [selectedSkill, setSelectedSkill] = useState<string | undefined>();



    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await axios.post(
                    'http://139.84.166.124:8060/staff-service/skills',
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${session?.user?.accessToken}`,
                        },
                    }
                );
                setSkills(response.data.data || []);
            } catch (error) {
                console.error('Error fetching skills:', error);
            }
        };
        fetchSkills();
    }, [session?.user?.accessToken]);

    const searchHelper = async () => {
        // console.log(selectedSkill)
        let fetchedData: Helper[] = [];
        setLoading(true);
        if(!cardNo && !selectedSkill){
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'Please enter a card number or select skill to search.',
                confirmButtonColor: '#1e90ff' // Custom blue color
            });
            setLoading(false);
            return;
        }
        else if (!cardNo) {
            try {
                const response = await axios.post(
                    'http://139.84.166.124:8060/staff-service/list',
                    {
                        premise_id: premiseId,
                        sub_premise_id: subPremiseId,
                        skill: selectedSkill
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${session?.user?.accessToken}`,
                        },
                    }
                );
                console.log(response)

                const { data } = response.data;
                fetchedData = [...fetchedData, ...data];
                setHelpersData(fetchedData || []);
            } catch (error) {
                console.error('Error fetching helpers:', error);
                Swal.fire('Error', 'Failed to fetch helpers.', 'error');
            } finally {
                setLoading(false);
            }
        } else {
            try {
                const response = await axios.post(
                    'http://139.84.166.124:8060/staff-service/list',
                    {
                        premise_id: premiseId,
                        card_no: cardNo,
                        sub_premise_id: subPremiseId
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${session?.user?.accessToken}`,
                        },
                    }
                );
                // fetchHelpers();

                const { data } = response.data;
                setHelpersData(data || []);
            } catch (error) {
                console.error('Error fetching helpers:', error);
                Swal.fire('Error', 'Failed to fetch helpers.', 'error');
            } finally {
                setLoading(false);
            }
        }



    };

    const tagHelper = async (helper: any) => {
        console.log(helper);
        
        try {
            await axios.post(
                'http://139.84.166.124:8060/staff-service/tag/premise_unit',
                {
                    premise_id: premiseId,
                    premise_unit_id: premiseUnitId,
                    qr_code: helper
                },
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                }
            );
            fetchHelpers();
            Swal.fire({
                title: 'Success',
                text: `${helper.name} has been tagged successfully.`,
                icon: 'success',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: 'bg-blue-500 text-white hover:bg-blue-600'  // Custom blue color
                }
            });
            searchHelper(); // Refresh data after tagging
        } catch (error) {
            console.error('Error tagging helper:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to tag helper.',
                icon: 'error',
                confirmButtonText: 'Retry',
                confirmButtonColor: '#3085d6'
            });
        }
    };

    const untagHelper = async (helper: any) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to untag ${helper.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, untag it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post(
                        'http://139.84.166.124:8060/staff-service/untag/premise_unit',
                        {
                            premise_id: premiseId,
                            qr_code: helper,
                            premise_unit_id: premiseUnitId,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${session?.user?.accessToken}`,
                            },
                        }
                    );
                    fetchHelpers();

                    Swal.fire({
                        title: 'Success',
                        text: `${helper.name} has been untagged.`,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'bg-blue-500 text-white hover:bg-blue-600'  // Custom blue color
                        }
                    });

                    searchHelper(); // Refresh data after untagging
                } catch (error) {
                    console.error('Error untagging helper:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Failed to untag helper.',
                        icon: 'error',
                        confirmButtonText: 'Retry',
                        confirmButtonColor: '#3085d6'
                    });
                }
            }
        });
    };

    const columns = [
        {
            title: 'Picture',
            key: 'picture',
            render: (record: Helper) => (
                <img
                    src={record.picture_url !== '-' ? record.picture_url : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn8_bOZNLwRTmEpl45X6dNH6IDp5xV4vfCFg&s'}
                    alt="Helper"
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        border: '2px solid #ddd',
                    }}
                />
            ),
        },
        {
            title: 'Details',
            key: 'details',
            render: (record: Helper) => (
                <div>
                    <p>Card No: {record.card_no}</p>
                    <p>Name: {record.name}</p>
                    <p>Mobile: {record.mobile}</p>
                    <p>Profession: {record.skill}</p>
                </div>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (record: Helper) => {
                const isAlreadyTagged = record.premise_unit_associated_with.some(
                    (unit) => unit.premise_unit_id === premiseUnitId
                );

                return isAlreadyTagged ? (
                    <Button
                        style={{
                            borderRadius: '4px',
                            background: 'linear-gradient(90deg, #f44336, #e57373)', // Gradient from dark red to light red
                            color: 'white',
                            padding: '6px 16px',
                            border: 'none',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; // Slight scale on hover
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Shadow effect
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                        }}
                        onClick={() => untagHelper(record.qr_code)}>UnTag</Button>
                ) : (
                    <Button
                        style={{
                            marginBottom: '8px',
                            background: 'linear-gradient(90deg, #4e92ff, #1e62d0)', // Blue gradient background
                            color: 'white', // White text color
                            border: 'none', // No border
                            borderRadius: '4px', // Rounded corners
                            padding: '8px 16px', // Padding for a more substantial look
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
                            cursor: 'pointer', // Pointer cursor on hover
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Transition for hover effects
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
                        }}
                        onClick={() => tagHelper(record.qr_code)}>Tag Helper</Button>
                );
            },
        },
    ];

    return (
        <Modal
            title="Tag New Helper"
            visible={visible}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <div className="flex items-center gap-4 mb-4">
                <Input
                    placeholder="Search by Card Number"
                    type="number"
                    value={cardNo}
                    style={{ width: 400 }}
                    onChange={(e) => setCardNo(Number(e.target.value))}
                />
                <Select
                    placeholder="Filter by Skill"
                    value={selectedSkill}
                    onChange={(value) => setSelectedSkill(value)}
                    style={{ width: 400 }}
                >
                    {skills.map((skill) => (
                        <Option key={skill._id} value={skill.skill}>
                            {/* <img
                                src={skill.skill_image_url}
                                alt={skill.skill}
                                style={{ width: '5px', marginRight: '5px' }}
                            /> */}
                            {skill.skill}
                        </Option>
                    ))}
                </Select>
                <Button onClick={searchHelper}>Search</Button>
            </div>
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={helpersData}
                    rowKey={(record) => record.sub_premise_id_array[0]}
                    pagination={false}
                />
            </Spin>
        </Modal>
    );
};

export default TagNewHelper;
