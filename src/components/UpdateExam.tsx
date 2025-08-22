'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSocket } from '@/context/SocketContext';
import { format } from "date-fns";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

// Utility to convert ISO to local datetime-local value
const toLocalDatetimeInputValue = (dateString: string) => {
  const date = new Date(dateString);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const UpdateExam: React.FC = () => {
  const { examId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [examCode, setExamCode] = useState('');
  const [duration, setDuration] = useState('');
  const [status, setStatus] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  // calendar state
  const initialStateRef = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(false);

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


  // socket
  const socket = useSocket();

  const adminId = user?.id;

  useEffect(() => {
    if (!adminId) return;

    const fetchExam = async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_ROOT_URL}/exams/fetch-single-exam`,
          { examId: Number(examId), adminId: Number(adminId) }
        );

        if (res.data.status) {
          const exam = res.data.response;

          setTitle(exam.title);
          setDescription(exam.description);
          setExamCode(exam.examCode);
          setDuration(exam.duration.toString());
          setStatus(exam.status);
          setStartTime(exam.startTime ? toLocalDatetimeInputValue(exam.startTime) : '');
          setEndTime(exam.endTime ? toLocalDatetimeInputValue(exam.endTime) : '');

          initialStateRef.current = {
            title: exam.title,
            description: exam.description,
            examCode: exam.examCode,
            duration: exam.duration.toString(),
            status: exam.status,
            startTime: exam.startTime ? toLocalDatetimeInputValue(exam.startTime) : '',
            endTime: exam.endTime ? toLocalDatetimeInputValue(exam.endTime) : '',
          };

          setIsInitialDataLoaded(true);
        } else {
          throw new Error(res.data.message);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      }
    };

    fetchExam();
  }, [examId, adminId]);

  // Handle auto calculation of end time if Scheduled
  useEffect(() => {
    if (status === 'Scheduled' && startTime && duration) {
      const start = new Date(startTime);
      const calculatedEnd = new Date(start.getTime() + Number(duration) * 60000);
      const localEnd = new Date(calculatedEnd.getTime() - calculatedEnd.getTimezoneOffset() * 60000);
      setEndTime(localEnd.toISOString().slice(0, 16));
    }
  }, [status, startTime, duration]);

  useEffect(() => {
    if (!isInitialDataLoaded) return;

    const isChanged =
      title !== initialStateRef.current.title ||
      description !== initialStateRef.current.description ||
      duration !== initialStateRef.current.duration ||
      status !== initialStateRef.current.status ||
      (status === 'Scheduled' &&
        (startTime !== initialStateRef.current.startTime ||
          endTime !== initialStateRef.current.endTime));

    setIsModified(isChanged);
  }, [title, description, duration, status, startTime, endTime, isInitialDataLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isModified) return;

    try {
      setLoading(true);

      const payload: any = {
        id: Number(examId),
        adminId,
        title,
        description,
        examCode,
        duration: Number(duration),
        status,
        updatedByAdminId: adminId,
      };

      if (status === 'Scheduled') {
        payload.startTime = startTime;
        payload.endTime = endTime;
      }

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/exams/update-exam`,
        payload
      );

      if (!res.data.status) {
        throw new Error(res.data.message);
      }

      if (res.data.response.status == "Scheduled") {
        await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/participants/my-group/exam/schedule-activation`, {
          examId: res.data.response.id,
          startTime: res.data.response.startTime,
          endTime: res.data.response.endTime
        });
      } else if (res.data.response.status == "Active") {
        await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/participants/my-group/exam/active-exam-schedule-activation`, {
          examId: res.data.response.id,
          endTime: res.data.response.endTime
        });
      }

      // socket event 
      socket?.emit('update-exam-status-admin', 'status-updated')
      toast.success('Exam updated successfully');
      router.push('/home/exams/manage-exams');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Update Exam</h2>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm border border-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Exam Code</label>
          <input
            type="text"
            value={examCode}
            disabled
            className="w-full px-4 py-3 rounded-xl border bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Duration (minutes)</label>
          <input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Scheduled">Scheduled</option>
          </select>
        </div>

        {status === 'Scheduled' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ✅ Start Time with Shadcn Calendar + Time Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Start Time
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    ref={initialStateRef}
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!startTime && "text-muted-foreground"}`}
                    onFocus={() => {
                      if (keyboardNav && !justSelected) {
                        setOpen(true);
                      }
                      setJustSelected(false);
                    }}
                  >
                    {startTime
                      ? format(new Date(startTime), "dd/MM/yyyy hh:mm a") // ✅ 12-hour with AM/PM
                      : "Pick start date & time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  side="top"
                  align="start"
                  sideOffset={4}
                  avoidCollisions={false}
                >
                  <Calendar
                    mode="single"
                    selected={startTime ? new Date(startTime) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        // keep previously chosen time if any
                        const prev = startTime ? new Date(startTime) : null;
                        const hours = prev ? prev.getHours() : new Date().getHours();
                        const minutes = prev ? prev.getMinutes() : new Date().getMinutes();

                        date.setHours(hours, minutes, 0, 0);

                        const iso = date.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
                        setStartTime(iso);
                        setJustSelected(true);
                        initialStateRef.current?.blur();
                      }
                    }}
                    disabled={(date) => date < new Date()} // block past dates
                  />
                  {/* ✅ Time input under calendar */}
                  <div className="p-3 border-t">
                    <input
                      type="time"
                      className="w-full border rounded-md px-2 py-1"
                      value={startTime ? format(new Date(startTime), "HH:mm") : ""}
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
                    {/* ✅ Show AM/PM formatted time below input */}
                    {startTime && (
                      <p className="text-xs text-gray-500 mt-1">
                        Selected time: {format(new Date(startTime), "hh:mm a")}
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* ✅ End Time stays auto-calculated & disabled */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                End Time
              </label>
              <input
                type="text"
                value={endTime ? format(new Date(endTime), "dd/MM/yyyy hh:mm a") : ""}
                className="w-full px-4 py-3 rounded-xl border bg-gray-100 text-gray-500 cursor-not-allowed"
                disabled
                required
              />
            </div>
          </div>
        )}


        <button
          type="submit"
          disabled={!isModified || loading}
          className={`w-full py-3 rounded-xl text-white flex justify-center items-center gap-2 transition ${loading || !isModified
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {loading && <Loader2 className="animate-spin w-5 h-5" />}
          {loading ? 'Updating...' : 'Update Exam'}
        </button>
      </form>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default UpdateExam;
