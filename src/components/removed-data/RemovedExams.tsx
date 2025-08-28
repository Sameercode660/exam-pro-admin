"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import DynamicTable from "../utils/DynamicTable";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from 'date-fns'
import PageHeading from "../utils/PageHeading";

type RemovedExam = {
  id: number;
  name: string;
  examCode: string;
  status: string;
  description: string;
  duration: string;
  createdAt: string;
  removedAt: string;
  createdBy: string;
  removedBy: string | null;
};

type Admin = {
  id: number;
  name: string;
};

export default function RemovedExams() {
  const [exams, setExams] = useState<RemovedExam[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [examCode, setExamCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedAdmin, setSelectedAdmin] = useState<number | null>(null);

  const { user } = useAuth();

  const fetchAdmins = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch-admin-list`, {
        organizationId: user?.organizationId,
      });
      setAdmins(res.data?.admins || []);
    } catch (err) {
      console.error("Failed to fetch admins", err);
    }
  };

  const fetchRemovedExams = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-exams/fetch-removed-exams`,
        {
          organizationId: user?.organizationId,
          search: searchQuery || undefined,
          examCode: examCode || undefined,
          status: status || undefined,
          createdByAdminId: selectedAdmin || undefined,
          dateRange: dateRange ? { from: dateRange.from, to: dateRange.to } : undefined,
        }
      );
      setExams(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [])
  useEffect(() => {
    fetchRemovedExams();
  }, [searchQuery]);

  const handleRestore = async (examId: number) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-exams/restore-exam`, {
        examId,
        userId: user?.id,
      });
      fetchRemovedExams();
    } catch (err) {
      toast.error("Unable to restore, try again later");
      console.error("Restore failed:", err);
    }
  };

  const columns = [
    "Title",
    "Exam Code",
    "Status",
    "Description",
    "Duration",
    "Created At",
    "Removed At",
    "Created By",
    "Removed By",
    "Action",
  ];

  const formattedData = exams.map((exam) => ({
    Title: exam.name,
    "Exam Code": exam.examCode,
    Status: exam.status,
    Description: exam.description,
    Duration: exam.duration,
    "Created At": format(exam.createdAt, 'dd/MM/yyyy hh:mm:ss a'),
    "Removed At": format(exam.removedAt, 'dd/MM/yyyy hh:mm:ss a'),
    "Created By": exam.createdBy,
    "Removed By": exam.removedBy || "-",
    Action: exam.id,
  }));

  return (
    <>
      <PageHeading title="Removed Exam"></PageHeading>
      <div className="p-4">

        {/* Filters same as ManageExam */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search exams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[200px] px-4 border border-gray-300 rounded-lg shadow-sm h-10"
          />

          <input
            type="text"
            placeholder="Exam Code..."
            value={examCode}
            onChange={(e) => setExamCode(e.target.value)}
            className="w-[150px] px-4 border border-gray-300 rounded-lg shadow-sm h-10"
          />

          <Select onValueChange={(val: any) => setStatus(val)} value={status || ""}>
            <SelectTrigger className="w-[160px] h-10">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(val: any) => setSelectedAdmin(Number(val))} value={selectedAdmin?.toString() || ""}>
            <SelectTrigger className="w-[180px] h-10">
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

          {/* Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[220px] justify-start text-left font-normal h-10"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
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
                  fetchRemovedExams();
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button onClick={fetchRemovedExams} className="bg-blue-500 text-white h-10">
            Apply
          </Button>

          <Button
            variant="outline"
            className="h-10"
            onClick={() => {
              setSearchQuery("");
              setExamCode("");
              setStatus(null);
              setDateRange(undefined);
              setSelectedAdmin(null);
              fetchRemovedExams();
            }}
          >
            Clear
          </Button>
        </div>


        {/* Table */}
        <DynamicTable
          columns={columns}
          data={formattedData}
          searchable={true}
          renderCell={(row, col) => {
            if (col === "Action") {
              return (
                <button
                  onClick={() => handleRestore(row[col])}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Restore
                </button>
              );
            }
            return row[col];
          }}
        />

        <ToastContainer position="top-center" />
      </div>
    </>
  );
}
