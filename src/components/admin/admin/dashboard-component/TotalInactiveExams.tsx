'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

type Exam = {
  id: number;
  title: string;
  description: string;
  examCode: string;
  duration: number;
  status: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  createdBy: {
    name: string;
  } | null;
};

export default function TotalInactiveExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  const fetchExams = async (searchTerm = "") => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/admin/fetch-total-inactive-exam`,
        {
          organizationId: user?.organizationId,
          search: searchTerm,
        }
      );
      setExams(res.data.data);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.organizationId) {
      fetchExams();
    }
  }, [user?.organizationId]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    fetchExams(value);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={handleSearch}
          className="border border-gray-300 px-4 py-2 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-[#f1e9d9] text-gray-800 font-semibold">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Exam Code</th>
              <th className="px-4 py-3 text-left">Duration</th>
              <th className="px-4 py-3 text-left">Start Time</th>
              <th className="px-4 py-3 text-left">Created By</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {exams.map((exam) => (
              <tr key={exam.id} className="hover:bg-gray-100 border-b">
                <td className="px-4 py-2">{exam.title}</td>
                <td className="px-4 py-2">{exam.description}</td>
                <td className="px-4 py-2">{exam.examCode}</td>
                <td className="px-4 py-2">{exam.duration} min</td>
                <td className="px-4 py-2">
                  {new Date(exam.startTime).toLocaleString()}
                </td>
                <td className="px-4 py-2">{exam.createdBy?.name || "self"}</td>
              </tr>
            ))}
            {!loading && exams.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No inactive exams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
