"use client"

import { DeviceSettings, VideoPreview, useCall } from '@stream-io/video-react-sdk'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'

const MeetingSetup = ({setisSetupComplete}: {setisSetupComplete: (value: boolean) => void }) => {

    const [toggleMicCam, settoggleMicCam] = useState(false)
    const call = useCall();
    if(!call){
        throw new Error('useCall must be used within StreamCall Component')
    }
    useEffect(() => {
        if(toggleMicCam){
            call?.camera.disable();
            call?.microphone.disable();
        } else{
            call?.camera.enable();
            call?.microphone.enable();
        }
    }, [ toggleMicCam, call?.camera, call?.microphone ])
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
        <h1>Meeting Setup</h1>
        <VideoPreview />
        <div className="flex h-16 items-center justify-center gap-3">
            <label className='flexitems-center justify-center gap-3 font-medium'>
                <input type="checkbox" checked={toggleMicCam} onChange={(e) => settoggleMicCam(e.target.checked)} />
                Join with mic and camera off
            </label>
            <DeviceSettings />
        </div>
        <Button className='rounded-md bg-green-500 px-4 py-2.5' onClick={() => {
            call.join();
            setisSetupComplete(true);
        }}>Join Meeting</Button>
    </div>
  )
}

export default MeetingSetup
