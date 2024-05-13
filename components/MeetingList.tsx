"use client"
import { useState } from 'react'
import ActionCards from './ActionCards'
import { useRouter } from 'next/navigation'
import MeetingModal from './MeetingModal'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import ReactDatePicker from 'react-datepicker';
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'


const MeetingList = () => {
    const router = useRouter();
    const [meetingState, setmeetingState] = useState<'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined>()
    const user = useUser();
    const client = useStreamVideoClient();
    const [callTime, setcallTime] = useState({
        dateTime: new Date(),
        description: '',
        link: '',
    })
    const [callDetails, setcallDetails] = useState<Call>()
    const { toast } = useToast()
    const createMeeting = async () => {
        if (!client || !user) return;
        try {
            if (!callTime.dateTime) {
                toast({
                    title: "Please schedule the meeting",
                })
                return;
            }
            const id = crypto.randomUUID();
            const call = client.call('default', id);
            if (!call) throw new Error('Failed to create call');
            const startsAt = callTime.dateTime.toISOString() || new Date(Date.now()).toISOString();
            const description = callTime.description || 'Instant Meeting';
            await call.getOrCreate({
                data: {
                    starts_at: startsAt,
                    custom: {
                        description,
                    },
                },
            });
            setcallDetails(call);
            if (!callTime.description) {
                router.push(`/meeting/${call.id}`)
            }
            console.log("Meeting Created")
            toast({
                title: "Meeting Created",
            })
        } catch (error) {
            console.log(error)
            toast({
                title: "Failed to create meeting",
            })
        }
    }
    const meetinglink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`
    return (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <ActionCards
                img="/icons/add-meeting.svg"
                title="New Meeting"
                description="Start an instant meeting"
                handleClick={() => setmeetingState('isInstantMeeting')}
                className="bg-orange-1"
            />
            <ActionCards
                img="/icons/schedule.svg"
                title="Schedule Meeting"
                description="Plan your meeting"
                handleClick={() => setmeetingState('isScheduleMeeting')}
                className="bg-blue-1"
            />
            <ActionCards
                img="/icons/recordings.svg"
                title="View Recordings"
                description="View Your Recordings"
                handleClick={() => router.push('/recordings')}
                className="bg-purple-1"
            />
            <ActionCards
                img="/icons/join-meeting.svg"
                title="Join Meeting"
                description="via Invitation Link"
                handleClick={() => setmeetingState('isJoiningMeeting')}
                className="bg-yellow-1"
            />
            {!callDetails ? (
                <MeetingModal
                    isOpen={meetingState === 'isScheduleMeeting'}
                    onClose={() => setmeetingState(undefined)}
                    title="Schedule an Meeting"
                    handleClick={createMeeting}
                >
                    <div className="flex flex-col gap-2.5">
                        <label className="text-base font-normal leading-[22.4px] text-sky-2">
                            Add a description
                        </label>
                        <Textarea
                            className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
                            onChange={(e) =>
                                setcallTime({ ...callTime, description: e.target.value })
                            }
                        />
                    </div>
                    <div className="flex w-full flex-col gap-2.5">
                        <label className="text-base font-normal leading-[22.4px] text-sky-2">
                            Select Date and Time
                        </label>
                        <ReactDatePicker
                            selected={callTime.dateTime}
                            onChange={(date) => setcallTime({ ...callTime, dateTime: date! })}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            timeCaption="time"
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="w-full rounded bg-dark-3 p-2 focus:outline-none"
                        />
                    </div>
                </MeetingModal>
            ) : (
                <MeetingModal
                    isOpen={meetingState === 'isScheduleMeeting'}
                    onClose={() => setmeetingState(undefined)}
                    title="Meeting Scheduled"
                    className="text-center"
                    buttonText="Copy Meeting Link"
                    handleClick={() => {
                        navigator.clipboard.writeText(meetinglink);
                        toast({ title: "Link Copied" });
                    }}
                    image="/icons/checked.svg"
                    buttonIcon="/icons/copy.svg"

                />
            )}
            <MeetingModal
                isOpen={meetingState === 'isInstantMeeting'}
                onClose={() => setmeetingState(undefined)}
                title="Start an Instant Meeting"
                className="text-center"
                buttonText="Start Meeting"
                handleClick={createMeeting}
            />

            <MeetingModal
                isOpen={meetingState === 'isJoiningMeeting'}
                onClose={() => setmeetingState(undefined)}
                title="Type the link here"
                className="text-center"
                buttonText="Join Meeting"
                handleClick={() => router.push(callTime.link)}
            >
                <Input
                    placeholder="Meeting link"
                    onChange={(e) => setcallTime({ ...callTime, link: e.target.value })}
                    className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </MeetingModal>

        </section>
    )
}

export default MeetingList
