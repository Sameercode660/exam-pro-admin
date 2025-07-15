"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";

const Dashboard = () => {
  const { user } = useAuth();
  const adminId = user?.id;
  const organizationId = user?.organizationId;

  const [unapprovedParticipants, setUnapprovedParticipants] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const fetchUnapprovedParticipants = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/participants/fetch-upapprove-participant`, {
        organizationId,
      });
      setUnapprovedParticipants(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to fetch participants");
    }
  };

  useEffect(() => {
    fetchUnapprovedParticipants();
    // fetch-upapprove-participant
  }, []);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      const allIds = unapprovedParticipants.map((p) => p.id);
      setSelectedIds(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((pid) => pid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleApproveSelected = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Please select at least one participant to approve.");
      return;
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/participants/approve-participant`, {
        participantIds: selectedIds,
        adminId,
      });

      toast.success("Participants approved successfully!");
      setSelectedIds([]);
      setSelectAll(false);
      fetchUnapprovedParticipants();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Approval failed.");
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Sidebar: Stats Cards */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4">
          <StatCard title="Super Users" value={24} />
          <StatCard title="Participants" value={120} />
          <StatCard title="Exams" value={12} />
          <StatCard title="Questions" value={456} />
          <StatCard title="Active Exams" value={8} />
          <StatCard title="Inactive Exams" value={4} />
        </div>

        {/* Right Section: Reports and Approvals */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          <BigCard title="📊 Reports" />
          
          <div className="flex-1 bg-white border border-gray-300 rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">✅ Approvals ({unapprovedParticipants.length})</h3>
              <button
                onClick={handleApproveSelected}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Approve Selected
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Mobile</th>
                    <th className="p-3 text-left">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {unapprovedParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        No unapproved participants.
                      </td>
                    </tr>
                  ) : (
                    unapprovedParticipants.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(p.id)}
                            onChange={() => handleSelectOne(p.id)}
                          />
                        </td>
                        <td className="p-3">{p.name}</td>
                        <td className="p-3">{p.email}</td>
                        <td className="p-3">{p.mobileNumber}</td>
                        <td className="p-3">{moment(p.createdAt).format("DD/MM/YYYY")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

const StatCard = ({ title, value }: { title: string; value: number }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center">
    <h3 className="text-xs font-medium text-gray-700">{title}</h3>
    <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

const BigCard = ({ title }: { title: string }) => (
  <div className="flex-1 bg-white border border-gray-300 rounded-2xl shadow-md p-10 flex items-center justify-center text-center text-2xl font-bold text-gray-800">
    {title}
  </div>
);

export default Dashboard;
