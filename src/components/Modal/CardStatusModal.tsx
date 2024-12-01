import React, { FC } from 'react';
import { Modal, Select } from 'antd';

const { Option } = Select;

interface CardStatusModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (status: string) => void;
  initialStatus: string;
}

const CardStatusModal: FC<CardStatusModalProps> = ({ visible, onClose, onSubmit, initialStatus }) => {
  const [selectedStatus, setSelectedStatus] = React.useState(initialStatus);

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  const handleSubmit = () => {
    onClose();
  };

  return (
    <Modal
      title="Update Card Status"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Update"
    >
      <Select
        value={selectedStatus}
        onChange={handleStatusChange}
        style={{ width: '100%' }}
      >
        <Option value="Not Printed">Not Printed</Option>
        <Option value="Printed">Printed</Option>
        <Option value="Re Printed">Re Printed</Option>
        <Option value="Not Ready for Print">Not Ready for Print</Option>
      </Select>
    </Modal>
  );
};

export default CardStatusModal;
    