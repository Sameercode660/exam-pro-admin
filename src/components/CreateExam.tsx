'use client';

import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import Message from './utils/Message';
import { MessageType } from './utils/Message';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";

interface AppMessage {
  type: MessageType;
  text: string;
}

function CreateExam() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [examCode, setExamCode] = useState('');
  const [duration, setDuration] = useState('');
  const [status, setStatus] = useState('Active');
  const [startTime, setStartTime] = useState<any>('');   // always store ISO string
  const [endTime, setEndTime] = useState<string>('');
  const [scheduleMode, setScheduleMode] = useState(false);
  const [message, setMessage] = useState<AppMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverDate, setServerDate] = useState<any>('')

  const { user } = useAuth();
  const router = useRouter();
  const adminId = user?.id;

  // calendar state
  const [open, setOpen] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    generateExamCode();
    fetchServerDate();
  }, []);

  useEffect(() => {
    if (scheduleMode && startTime && duration) {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + Number(duration) * 60000);
      setEndTime(end.toISOString());
    }
  }, [scheduleMode, startTime, duration]);

  const generateExamCode = () => {
    const randomCode = `EX-${Math.floor(100000 + Math.random() * 900000)}`;
    setExamCode(randomCode);
  };

  const fetchServerDate = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_URL}/date-time`);
    const utcDateString = response.data.date; // e.g. "2025-08-24T21:33:36.836Z"

    // Parse as UTC and convert to IST
    const utcDate = new Date(utcDateString);
    const istDate = toZonedTime(utcDate, "Asia/Kolkata");

    setStartTime(istDate);
    setServerDate(istDate) // keep Date object in IST
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        title,
        description,
        examCode,
        duration: Number(duration),
        status: scheduleMode ? 'Scheduled' : status,
        startTime: scheduleMode && startTime ? startTime : null,
        endTime: scheduleMode && endTime ? endTime : null,
        createdByAdminId: adminId,
      };

      if (payload.startTime && (new Date(payload.startTime) < new Date(serverDate))) {
        setMessage({ type: 'error', text: "Past time or date is not allowed" });
        return;
      }

      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/create-exam`, payload);

      if (response.data.response.status == "Scheduled") {
        await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/participants/my-group/exam/schedule-activation`, {
          examId: response.data.response.id,
          startTime: response.data.response.startTime,
          endTime: response.data.response.endTime
        });
      } else if (response.data.response.status == "Active") {
        await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/participants/my-group/exam/active-exam-schedule-activation`, {
          examId: response.data.response.id,
          endTime: response.data.response.endTime
        });
      }

      setMessage({ type: 'success', text: 'Exam created Successfully' });
      router.push('/home/exams/manage-exams');
    } catch (err: any) {
      setMessage({ type: 'error', text: "Past time or date is not allowed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-3xl mx-auto mt-10 space-y-6 border border-gray-200">
      <div className='flex justify-center items-center'>
        {message && (
          <Message
            type={message.type}
            text={message.text}
            onClose={() => setMessage(null)}
          />
        )}
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Create New Exam</h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Title <span className="required text-red-400" aria-hidden="true">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Description <span className="required text-red-400" aria-hidden="true">*</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div className='flex justify-between w-full gap-3'>
          <div className='w-[50%]'>
            <label className="block text-sm font-semibold text-gray-600 mb-1" >Duration (minutes) <span className="required text-red-400" aria-hidden="true">*</span></label>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {!scheduleMode ? (
            <div className='w-[50%]'>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Status <span className="required text-red-400" aria-hidden="true">*</span></label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          ) : (<div className='w-[50%]'>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Status <span className="required text-red-400" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              value="Scheduled"
              disabled
              readOnly
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          )}

        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="schedule"
            checked={scheduleMode}
            onChange={(e) => setScheduleMode(e.target.checked)}
            className="w-5 h-5 text-blue-600"
          />
          <label htmlFor="schedule" className="text-gray-700 font-medium">Schedule this Exam</label>
        </div>

        {scheduleMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Start Time</label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    ref={buttonRef}
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!startTime && "text-muted-foreground"}`}
                    onFocus={() => {
                      if (keyboardNav && !justSelected) {
                        setOpen(true);
                      }
                      setJustSelected(false);
                    }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startTime ? format(new Date(startTime), "dd/MM/yyyy hh:mm a") : <span>Pick start date & time</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"
                  side="top"
                  align="start"
                  sideOffset={4}
                  avoidCollisions={false}>
                  <Calendar
                    mode="single"
                    selected={startTime ? new Date(startTime) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        // console.log(date)
                        const prev = startTime ? new Date(startTime) : new Date();
                        date.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
                        setStartTime(date.toISOString());
                        buttonRef.current?.blur();
                      }
                    }}
                    disabled={(date) => {
                      const today = new Date(serverDate);
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                  <div className="p-3 border-t">
                    <input
                      type="time"
                      className="w-full border rounded-md px-2 py-1"
                      value={startTime ? formatInTimeZone(new Date(startTime), "Asia/Kolkata", "HH:mm") : ""}
                      onChange={(e) => {
                        if (startTime) {
                          const d = new Date(startTime);
                          const [hh, mm] = e.target.value.split(":").map(Number);
                          d.setHours(hh, mm, 0, 0);

                          // ⛔ If same date as serverDate and time < server time → block
                          if (serverDate) {
                            const istSelected = toZonedTime(d, "Asia/Kolkata");
                            const istServer = serverDate;
                            if (
                              istSelected.toDateString() === istServer.toDateString() &&
                              istSelected < istServer
                            ) {
                              setMessage({ type: 'error', text: "Past time not allowed" });
                              return;
                            }
                          }
                          setStartTime(d.toISOString());
                        }
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {startTime && duration && (
              <div className="md:col-span-2 text-gray-600 text-sm">
                <strong>End Time:</strong> {endTime ? format(new Date(endTime), "dd/MM/yyyy hh:mm a") : ""}
              </div>
            )}
          </div>
        )}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition flex justify-center items-center gap-2" > {loading && <Loader2 className="animate-spin w-5 h-5" />} {loading ? 'Creating...' : 'Create Exam'} </button>
      </form>
    </div>
  );
}

export default CreateExam;


// {startTime ? format(new Date(startTime), "dd/MM/yyyy hh:mm a") : <span>Pick start date & time</span>}
