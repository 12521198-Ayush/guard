// components/Modal.js  
import React from 'react';  

const Modal = ({ isOpen, onClose, onAdd }) => {  
  if (!isOpen) return null;  

  return (  
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>  
      <div className="bg-white rounded-lg p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>  
        <h2 className="text-lg font-semibold mb-4">Add Options</h2>  
        <button className="bg-blue-500 text-white px-4 py-2 rounded mb-2 w-full" onClick={() => { onAdd('Option 1'); onClose(); }}>Add Option 1</button>  
        <button className="bg-blue-500 text-white px-4 py-2 rounded mb-2 w-full" onClick={() => { onAdd('Option 2'); onClose(); }}>Add Option 2</button>  
        <button className="bg-blue-500 text-white px-4 py-2 rounded mb-2 w-full" onClick={() => { onAdd('Option 3'); onClose(); }}>Add Option 3</button>  
        <button className="bg-gray-300 text-black px-4 py-2 rounded w-full mt-2" onClick={onClose}>Close</button>  
      </div>  
    </div>  
  );  
};  

export default Modal;  