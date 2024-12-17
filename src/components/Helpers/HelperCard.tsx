import React from 'react';

interface HelperCardProps {
    cardNo: number;
    name: string;
    mobile: string;
    skill: string;
    pictureUrl: string;
    address: string;
}

const HelperCard: React.FC<HelperCardProps> = ({ cardNo, name, mobile, skill, pictureUrl, address }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
                src={
                    pictureUrl !== '-'
                        ? pictureUrl
                        : 'https://i.pinimg.com/736x/3a/f1/57/3af1577769c9bcb216ab85c5bf1bc441.jpg'
                }
                alt="Helper"
                style={{
                    width: '80px',
                    height: '80px',
                    marginRight: '16px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                }}
            />
            <div>
                <p>Card No: {cardNo}</p>
                <p>Name: {name}</p>
                <p>Mobile: {mobile}</p>
                <p>Profession: {skill}</p>
                <p>Address: {address}</p>
            </div>
        </div>
    );
};

export default HelperCard;
