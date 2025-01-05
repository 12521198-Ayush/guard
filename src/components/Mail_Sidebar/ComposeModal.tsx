import React from "react";
import { Modal, Input, Button } from "antd";
import { Editor } from "@tinymce/tinymce-react";

interface ComposeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSend: () => void;
}

const ComposeModal: React.FC<ComposeModalProps> = ({
  isVisible,
  onClose,
  onSend,
}) => {
  return (
    <Modal
      title="New Message"
      open={isVisible}
      onCancel={onClose}
      footer={null}
    >
      <div className="flex flex-col gap-4">
        <Input placeholder="To" />
        <Input placeholder="Subject" />
        <Editor
          apiKey="your-tinymce-api-key"
          init={{
            height: 200,
            menubar: false,
            plugins: [
              "advlist autolink lists link image charmap print preview anchor",
              "searchreplace visualblocks code fullscreen",
              "insertdatetime media table paste code help wordcount",
            ],
            toolbar:
              "undo redo | formatselect | bold italic backcolor | \
              alignleft aligncenter alignright alignjustify | \
              bullist numlist outdent indent | removeformat | help",
          }}
        />
        <Button
          type="primary"
          onClick={onSend}
          className="bg-green-500 hover:bg-green-600"
        >
          Send
        </Button>
      </div>
    </Modal>
  );
};

export default ComposeModal;
