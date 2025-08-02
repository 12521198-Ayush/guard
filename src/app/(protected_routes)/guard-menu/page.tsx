'use client'
import QuickActions from './QuickActions'
import VisitorEntry from './VisitorEntry'
import { useSession } from 'next-auth/react'
import Preference from './preference'
import { useLayoutEffect, useEffect, useState } from 'react'
import { Button } from 'antd'
import { Router } from 'lucide-react'
import { useRouter } from 'next/navigation';
import PendingVisitorList from './PendingVisitorList';
import { useContext } from 'react';
import VisitorsList from './VisitorsList'

const KeypadScreen = () => {

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
    <div className="relative w-full text-gray-800 font-medium pb-6">
      <VisitorEntry />
      {/* <GuestList /> */}
      <VisitorsList />;
      {/* <QuickActions /> */}
    </div>
  )
}

export default KeypadScreen 
