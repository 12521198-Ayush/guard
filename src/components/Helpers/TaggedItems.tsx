import React from 'react';
import { Button } from 'antd';
import { HomeOutlined, ApartmentOutlined } from '@ant-design/icons';

interface TaggedItemsProps {
    subPremiseCount: number;
    premiseUnitCount: number;
    qr_code: string;
    onShowSubPremises: () => void;
    onShowPremiseUnits: () => void;
}

const TaggedItems: React.FC<TaggedItemsProps> = ({
    subPremiseCount,
    premiseUnitCount,
    qr_code,
    onShowSubPremises,
    onShowPremiseUnits,
}) => {
    return (
        <div className="flex flex-col items-start gap-2">
            {/* Sub-Premises Icon */}
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={onShowSubPremises}
            >
                <HomeOutlined className="text-2xl text-blue-500" />
                <span className="text-lg">
                    Sub-Premises ({subPremiseCount})
                </span>
            </div>

            {/* Premise Units Icon */}
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={onShowPremiseUnits}
            >
                <ApartmentOutlined className="text-2xl text-green-500" />
                <span className="text-lg">
                    Premise Units ({premiseUnitCount})
                </span>
            </div>
        </div>

    );
};

export default TaggedItems;
