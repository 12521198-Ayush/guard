import React from 'react';
import { Button } from 'antd';

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
        <div>
            <Button className='mb-2' onClick={onShowSubPremises}>
                Sub-Premises ({subPremiseCount})
            </Button>
            <br />
            <Button  onClick={onShowPremiseUnits}>
                Premise Units ({premiseUnitCount})
            </Button>
        </div>
    );
};

export default TaggedItems;
