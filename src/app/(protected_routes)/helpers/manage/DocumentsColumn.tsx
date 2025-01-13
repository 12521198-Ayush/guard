import { useState } from 'react';
import { Modal, Image } from 'antd';
import { IdcardOutlined, HomeOutlined, SafetyOutlined } from '@ant-design/icons';

const DocumentsColumn = ({ record }: { record: any }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState<string | null>(null);

    const documentTypes = [
        { key: 'id_proof_url', value: record.id_proof_url, label: 'ID Proof', icon: <IdcardOutlined /> },
        { key: 'address_proof_url', value: record.address_proof_url, label: 'Address Proof', icon: <HomeOutlined /> },
        { key: 'pv_url', value: record.pv_url, label: 'Police Verification', icon: <SafetyOutlined /> },
    ];

    const fetchSignedUrl = async (fileKey: string) => {
        return fileKey || null;
    };

    const handleClick = async (fileKey: string) => {
        const url = await fetchSignedUrl(fileKey);
        if (url) {
            setModalImage(url);
            setIsModalOpen(true);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setModalImage(null);
    };

    return (
        <>
            <div className="flex flex-row gap-4">
                {documentTypes.map((docType) => {
                    const fileKey = docType.value;
                    const isClickable = fileKey && fileKey !== '-';

                    const iconColor = isClickable
                        ? 'text-green-500'
                        : fileKey === '-'
                            ? 'text-red-500'
                            : 'text-blue-500';

                    return (
                        <div
                            key={docType.key}
                            className={`flex items-center ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                            onClick={() => isClickable && handleClick(fileKey)}
                        >
                            <div className={`text-2xl ${iconColor}`}>{docType.icon}</div>
                            <span className="ml-2">{docType.label}</span>
                        </div>
                    );
                })}
            </div>

            <Modal
                visible={isModalOpen}
                footer={null}
                onCancel={handleModalClose}
                centered
                width={800}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        minHeight: '60vh', // Ensures sufficient height for centering
                    }}
                >
                    {modalImage ? (
                        <Image
                            src={modalImage}
                            alt="Document"
                            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                        />
                    ) : (
                        <p>No image available</p>
                    )}
                </div>
            </Modal>

        </>
    );
};

export default DocumentsColumn;
// Usage in the Table column

