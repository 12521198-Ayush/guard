import React from 'react';
import { IdcardOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

const handleRFID = ()=>{
    console.log('new assigned')
};

const AssignRFIDButton: React.FC = () => {
    

    return (
        <Tooltip title="Assign RFID Card">
            <Button
                type="primary"
                icon={<IdcardOutlined style={{ color: '#fff', fontSize: '18px' }} />}
                style={{
                    background: 'linear-gradient(135deg, #4e92ff, #1e62d0)',
                    borderColor: '#1e62d0',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '6px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                    
                }}
                onClick={handleRFID}

            >
            </Button>
        </Tooltip>
    );
};

export default AssignRFIDButton;
