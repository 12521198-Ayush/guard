'use client';

import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';

const categories = ['Electrician', 'Plumber', 'Sweeper', 'Gardener', 'Painter'];

const demoHelpers = [
  'Helper 1',
  'Helper 2',
  'Helper 3',
  'Helper 4',
  'Helper 5',
  'Helper 6',
  'Helper 7',
  'Helper 8',
  'Helper 9',
  'Helper 10',
];

const HelperStuff: React.FC = () => {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isRecruitModalOpen, setIsRecruitModalOpen] = useState(false);
  const [loader, setLoader] = useState(false);
  const [helperId, setHelperId] = useState('');

  const handleTagHelper = async () => {
    setLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading
    setLoader(false);
    Swal.fire(`Helper with ID ${helperId} has been tagged!`);
    setHelperId('');
    setIsTagModalOpen(false);
  };

  const handleRecruitHelper = () => {
    setIsRecruitModalOpen(false);
    Swal.fire('Post has been created for the helper. They will contact you soon!');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Helper Management</h1>

      <div className="mb-6 space-y-4">
        <button
          onClick={() => setIsTagModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
        >
          Tag Helper
        </button>

        <button
          onClick={() => setIsRecruitModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
        >
          Recruit a Helper
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">My Helpers</h2>
      <ul className="space-y-2">
        {demoHelpers.map((helper, index) => (
          <li
            key={index}
            className="p-3 bg-white rounded shadow hover:shadow-lg transition"
          >
            {helper}
          </li>
        ))}
      </ul>

      {/* Tag Helper Modal */}
      <Transition appear show={isTagModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsTagModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded shadow-lg p-6 w-full max-w-md">
              <Dialog.Title className="text-lg font-semibold">Tag Helper</Dialog.Title>
              <input
                type="text"
                value={helperId}
                onChange={(e) => setHelperId(e.target.value)}
                placeholder="Enter Helper ID"
                className="mt-2 p-2 border border-gray-300 rounded w-full"
              />
              <div className="mt-4">
                <button
                  onClick={handleTagHelper}
                  disabled={loader}
                  className={`px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition ${loader ? 'opacity-50' : ''}`}
                >
                  {loader ? 'Saving...' : 'Save'}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>

      {/* Recruit Helper Modal */}
      <Transition appear show={isRecruitModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsRecruitModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded shadow-lg p-6 w-full max-w-md">
              <Dialog.Title className="text-lg font-semibold">Recruit a Helper</Dialog.Title>
              <select className="mt-2 p-2 border border-gray-300 rounded w-full default:text-gray-400">
                <option disabled selected>
                  Select Category
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Purpose"
                className="mt-2 p-2 border border-gray-300 rounded w-full h-24"
              />
              <div className="mt-4">
                <button
                  onClick={handleRecruitHelper}
                  className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
                >
                  Save
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default HelperStuff;