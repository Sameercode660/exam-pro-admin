'use client';

import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { Divide, Loader2 } from 'lucide-react';
import Message from './utils/Message';
import { MessageType } from './utils/Message';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react"; // optional for icon


interface AppMessage {
  type: MessageType;
  text: string;
}
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";


function CreateExam() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [examCode, setExamCode] = useState('');
  const [duration, setDuration] = useState(''); // Used in both scheduled and non-scheduled
  const [status, setStatus] = useState('Active');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [scheduleMode, setScheduleMode] = useState(false);
  const [message, setMessage] = useState<AppMessage | null>(null)

  const [loading, setLoading] = useState(false);
  const [minDateTime, setMinDateTime] = useState('');

  const { user } = useAuth();
  const router = useRouter();
  const adminId = user?.id;

  // calendar state
  const [open, setOpen] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  

  // keyboard vs mouse detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') setKeyboardNav(true);
    };
    const handleMouseDown = () => setKeyboardNav(false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  useEffect(() => {
    generateExamCode();
    setMinDateTime(getCurrentDateTime());
  }, []);

  useEffect(() => {
    if (scheduleMode && startTime && duration) {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + Number(duration) * 60000);

      // Converting to local datetime-local format (yyyy-MM-ddTHH:mm)
      const localEnd = new Date(end.getTime() - end.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setEndTime(localEnd);
    }
  }, [scheduleMode, startTime, duration]);

  const generateExamCode = () => {
    const randomCode = `EX-${Math.floor(100000 + Math.random() * 900000)}`;
    setExamCode(randomCode);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/create-exam`, payload);
      console.log(response.data)



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
      setMessage({ type: 'error', text: err.response?.data?.message || err.message });
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
              <label className="block text-sm font-semibold text-gray-600 mb-1">Start Time <span className="required text-red-400" aria-hidden="true">*</span></label>
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
                    {startTime ? format(new Date(startTime), "dd/MM/yyyy HH:mm") : <span>Pick start date & time</span>}
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
                        // preserve time (HH:mm) if user selected before
                        const prev = startTime ? new Date(startTime) : null;
                        const hours = prev ? prev.getHours() : new Date().getHours();
                        const minutes = prev ? prev.getMinutes() : new Date().getMinutes();

                        date.setHours(hours, minutes, 0, 0);

                        const iso = date.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
                        setStartTime(iso);
                        buttonRef.current?.blur();
                      }
                    }}
                    disabled={(date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0) // reset to midnight
                      return date < today
                    }} // prevent past dates
                  />
                  {/* Add time input under calendar */}
                  <div className="p-3 border-t">
                    <input
                      type="time"
                      className="w-full border rounded-md px-2 py-1"
                      value={startTime ? new Date(startTime).toISOString().slice(11, 16) : ""}
                      onChange={(e) => {
                        if (startTime) {
                          const date = new Date(startTime);
                          const [hh, mm] = e.target.value.split(":").map(Number);
                          date.setHours(hh, mm, 0, 0);
                          const iso = date.toISOString().slice(0, 16);
                          setStartTime(iso);
                        }
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>

            </div>

            {startTime && duration && (
              <div className="md:col-span-2 text-gray-600 text-sm">
                <strong>End Time:</strong> {endTime.replace('T', ' ')}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition flex justify-center items-center gap-2"
        >
          {loading && <Loader2 className="animate-spin w-5 h-5" />}
          {loading ? 'Creating...' : 'Create Exam'}
        </button>
      </form>
      {/* <ToastContainer /> */}
    </div>
  );
}

export default CreateExam;
