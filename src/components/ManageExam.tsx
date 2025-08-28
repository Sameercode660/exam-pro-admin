'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar } from "@/components/ui/calendar"; // shadcn calendar
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react"; // optional icons
import PageHeading from './utils/PageHeading';

interface Admin {
  id: number;
  name: string;
}

interface Exam {
  id: number;
  title: string;
  description: string;
  examCode: string;
  duration: number;
  status: string;
  startTime: string;
  endTime: string;
}

function ManageExam() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [examCode, setExamCode] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const router = useRouter();
  const { user } = useAuth();
  const adminId = user?.id;

  const fetchAdmins = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch-admin-list`, { organizationId: user?.organizationId });
      setAdmins(res.data?.admins || []);
      console.log(res.data.admins)
    } catch (err) {
      console.error("Failed to fetch admins", err);
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/exams/fetch-all-exam`,
        {
          adminId,
          search: searchQuery || undefined,
          examCode: examCode || undefined,
          status: status || undefined,
          createdByAdminId: selectedAdmin || undefined,
          dateRange: dateRange ? { from: dateRange.from, to: dateRange.to } : undefined,
        }
      );
      setExams(Array.isArray(response.data?.response) ? response.data.response : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [searchQuery]);

  useEffect(() => {
    fetchAdmins();
  }, [])

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setDeleteLoading(true);
      await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/delete-exam`, {
        examId: deleteTargetId,
        adminId,
      });
      fetchExams();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
      setDeleteTargetId(null);
    }
  };

  // if (loading) return <div className="p-6 text-center">Loading exams...</div>;
  // if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <>
      <PageHeading title='Manage Exams'></PageHeading>
      <div className="pr-6 pb-6 pl-6 space-y-6">
        {/* Filters */}

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search exams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[200px] px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
          />

          <input
            type="text"
            placeholder="Exam Code..."
            value={examCode}
            onChange={(e) => setExamCode(e.target.value)}
            className="w-[150px] px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
          />

          <Select
            onValueChange={(val: any) => {
              setStatus(val);
              fetchExams();
            }}
            value={status || ''}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            onValueChange={(val: any) => {
              setSelectedAdmin(Number(val));
              fetchExams();
            }}
            value={selectedAdmin?.toString() || ''}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Admin" />
            </SelectTrigger>
            <SelectContent>
              {admins.map((a) => (
                <SelectItem key={a.id} value={a.id.toString()}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Selector */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[220px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {dateRange.from.toLocaleDateString()} -{" "}
                      {dateRange.to.toLocaleDateString()}
                    </>
                  ) : (
                    dateRange.from.toLocaleDateString()
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  fetchExams();
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Apply & Reset Buttons */}
          <Button onClick={fetchExams} className="bg-blue-500 text-white cursor-pointer">
            Apply
          </Button>

          <Button
            className="bg-blue-500 text-white cursor-pointer "
            onClick={() => {
              setSearchQuery('');
              setExamCode('');
              setStatus(null);
              setDateRange(undefined);
              setSelectedAdmin(null);
              fetchExams();
            }}
          >
            Clear
          </Button>
        </div>

        {/* Exams List */}
        {(!exams || exams.length === 0) ? (
          <p className="text-center text-gray-500">No exams found.</p>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <div key={exam.id} className="border p-5 rounded-xl shadow-md bg-white flex justify-between items-start">
                <div className="space-y-2">
                  <h2
                    onClick={() => router.push(`/home/exams/exam-details/${exam.id}`)}
                    className="text-xl font-bold text-blue-600 underline cursor-pointer"
                  >
                    {exam.title}
                  </h2>
                  <p className="text-gray-600 font-medium">{exam.description || 'No description'}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">{exam.examCode}</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">{exam.duration} min</span>
                    {exam.status}
                  </div>
                </div>
                <div className="space-x-2">
                  <button onClick={() => setDeleteTargetId(exam.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                    Delete
                  </button>
                  <button onClick={() => router.push(`/home/exams/update-exam/${exam.id}`)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    Edit
                  </button>
                  <button onClick={() => router.push(`/home/exams/add-question/${exam.id}`)} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                    Add Question
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteTargetId !== null && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <motion.div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Delete Exam</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this exam?</p>
                <div className="flex justify-end space-x-3">
                  <button onClick={() => setDeleteTargetId(null)} className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                  <button onClick={handleDelete} disabled={deleteLoading} className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600">
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default ManageExam;
