import { useState } from 'react';

interface Mail {
  id: number;
  sender: string;
  title: string;
  content: string;
  date: string;
  attachments?: { name: string; size: string }[];
}

const mails: Mail[] = [
  {
    id: 1,
    sender: 'Elena Mateo',
    title: 'I heard you recently traveled. Tell me all about it!',
    content: 'Passionate frontend developer...',
    date: '24 Feb 2024, 2:25 pm',
    attachments: [
      { name: 'Dashboard UiKit', size: '34.75 MB' },
      { name: 'Discussion Platform', size: '23.48 MB' },
    ],
  },
  {
    id: 2,
    sender: 'Valentine Maton',
    title: 'Just finished a great book and wanted to share...',
    content: 'Dedicated affiliate marketer specializing...',
    date: '25 Feb 2024, 3:15 pm',
  },
  {
    id: 3,
    sender: 'Laura Foreman',
    title: "Long time no talk. Let's plan a catch-up...",
    content: 'Fullstack developer with a passion...',
    date: '26 Feb 2024, 4:30 pm',
  },
];

export default function InboxComponent() {
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);

  return (
    <div className="flex h-screen">
      {/* Inbox Sidebar */}
      <div className={`inbox-sidebar w-1/3 border-r border-gray-200 ${selectedMail ? 'hidden' : 'block'}`}>
        <h2 className="text-xl font-semibold p-4 border-b">Inbox</h2>
        <input type="text" placeholder="Search..." className="w-full p-2 mb-2 border-b focus:outline-none" />
        {mails.map((mail) => (
          <div
            key={mail.id}
            className="p-4 cursor-pointer hover:bg-gray-100"
            onClick={() => setSelectedMail(mail)}
          >
            <h3 className="font-bold">{mail.sender}</h3>
            <p className="text-sm text-gray-600">{mail.title}</p>
            <span className="text-xs text-gray-400">{mail.date}</span>
          </div>
        ))}
      </div>

      {/* Mail Content */}
      <div className={`mail-content flex-1 ${selectedMail ? 'block' : 'hidden'}`}>
        {selectedMail && (
          <div className="p-4">
            <button
              onClick={() => setSelectedMail(null)}
              className="text-sm text-gray-500 mb-4"
            >
              ← Back
            </button>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-semibold mb-1">{selectedMail.title}</h2>
                <span className="text-xs text-gray-400">{selectedMail.date}</span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">Reply</button>
                <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">Forward</button>
                <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">Star</button>
                <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">Delete</button>
                <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">Copy</button>
                <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">Print</button>
                <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">Archive</button>
                <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">Mark as Unread</button>
              </div>
            </div>
            <p className="my-4 text-gray-700">{selectedMail.content}</p>
            {selectedMail.attachments && (
              <div className="attachments">
                <h3 className="text-sm font-semibold mb-2">Attachments</h3>
                <div className="flex gap-4">
                  {selectedMail.attachments.map((attachment, index) => (
                    <div key={index} className="p-2 border rounded-lg">
                      <p className="text-sm">{attachment.name}</p>
                      <span className="text-xs text-gray-500">{attachment.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
