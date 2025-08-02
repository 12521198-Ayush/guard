import { useLayoutEffect, useEffect, useState } from 'react'
import PendingVisitorList from './PendingVisitorList';
import EntryHistoryList from './EntryHistoryList'; // Ensure correct import
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'
import Preference from './preference'

const VisitorsList = () => {
    const [activeTab, setActiveTab] = useState<'ongoing' | 'history'>('ongoing');
    const [typeFilter, setTypeFilter] = useState('');

    const { data: session } = useSession();
    const router = useRouter();
    const [showPreference, setShowPreference] = useState(false);
    const [socketMessages, setSocketMessages] = useState<any[]>([]);

    useLayoutEffect(() => {
        const handler = (e: MessageEvent) => {
            if (e.data?.type === 'NEW_SOCKET_MESSAGE') {
                setSocketMessages((prev) => [...prev, e.data.payload]);
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);


    useEffect(() => {
        const isPreferenceTaken = localStorage.getItem('preferenceTaken');
        if (!isPreferenceTaken) {
            setShowPreference(true);
        }
    }, []);

    const handlePreferenceComplete = () => {
        localStorage.setItem('preferenceTaken', 'true');
        setShowPreference(false);
        window.location.reload(); // Refresh the page
    };


    if (showPreference) {
        return <Preference onComplete={handlePreferenceComplete} />;
    }

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-900">Visitor List</h2>
            {/* Tab Switcher */}
            <div className="flex justify-around mb-4">
                <button
                    onClick={() => setActiveTab('ongoing')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'ongoing'
                        ? 'bg-blue-500 text-white shadow'
                        : 'bg-gray-100 text-gray-700'
                        }`}
                >
                    Ongoing Entries
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'history'
                        ? 'bg-blue-500 text-white shadow'
                        : 'bg-gray-100 text-gray-700'
                        }`}
                >
                    Past Entries
                </button>
            </div>



            {/* Content based on Tab */}
            {activeTab === 'ongoing' ? (
                <PendingVisitorList socketMessages={socketMessages} />
            ) : (
                <EntryHistoryList />
            )}
        </div>
    );
};

export default VisitorsList;
