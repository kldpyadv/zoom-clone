"use client"

import { useState } from 'react';
import { useUser } from '@clerk/nextjs'
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';
import { useGetCallById } from '@/hooks/useGetCallById';
import { useParams } from 'next/navigation';
import Loader from '@/components/Loader';


const Meeting = () => {
  const { id } = useParams();
  const {user, isLoaded} = useUser();
  const [isSetupComplete, setisSetupComplete] = useState(false)
  const {call, isCallLoading} = useGetCallById(id);
  if(!isLoaded || isCallLoading) return <Loader />

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setisSetupComplete={setisSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  )
}

export default Meeting
