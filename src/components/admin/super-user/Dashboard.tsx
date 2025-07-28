"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const { user } = useAuth();
  const adminId = user?.id;
  const organizationId = user?.organizationId;

  const [unapprovedParticipants, setUnapprovedParticipants] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const router = useRouter();

  const [orgStats, setOrgStats] = useState({
    totalSuperUsers: 0,
    totalParticipants: 0,
    totalExams: 0,
    totalQuestions: 0,
    activeExams: 0,
    inactiveExams: 0,
  });

  const fetchOrganizationStats = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/admin/dashboard-data`,
        { organizationId }
      );
      console.log(res.data)
      setOrgStats(res.data);
    } catch (err: any) {
      toast.error("Failed to fetch organization stats");
    }
  };

  const fetchUnapprovedParticipants = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/participants/fetch-upapprove-participant`,
        { organizationId }
      );
      setUnapprovedParticipants(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to fetch participants");
    }
  };

  useEffect(() => {
    fetchUnapprovedParticipants();
    fetchOrganizationStats()
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Section 1: Quick Stats */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* <StatCard title="Super Users" onclick={() => {
            router.push('/home/admin/totat-super-user')
          }} value={orgStats.totalSuperUsers} /> */}
          <StatCard title="Participants" onclick={() => {
            router.push('/home/participant/manage-participant')
          }} value={orgStats.totalParticipants} />
          <StatCard title="Exams" onclick={() => {
            router.push('/home/exams/manage-exams')
          }} value={orgStats.totalExams} />
          <StatCard title="Questions" onclick={() => {
            router.push('/home/questions/manage-questions')
          }} value={orgStats.totalQuestions} />
          <StatCard title="Active Exams"
            onclick={() => {
              router.push('/home/admin/total-active-exams')
            }}
            value={orgStats.activeExams} />
          <StatCard title="Inactive Exams"
            onclick={() => {
              router.push('/home/admin/total-inactive-exams')
            }}
            value={orgStats.inactiveExams} />
        </div>

        {/* Section 2: Reports */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 flex items-center justify-center">
          <h2 className="text-2xl font-bold text-gray-800">📈 Reports Overview</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 3: Graph Data */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Graph Overview</h3>
          {/* Plug any third-party graph component here */}
          <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed rounded-xl">
            Graph Component Goes Here
          </div>
        </div>

        {/* Section 4: Approvals */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              ✅ Approvals ({unapprovedParticipants.length})
            </h3>
            <button
              onClick={handleApproveSelected}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Approve Selected
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
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

      <ToastContainer position="top-center" />
    </div>
  );
};

const StatCard = ({ title, value, onclick }: { title: string; value: number; onclick?: () => void }) => (
  <div className="bg-white  rounded-xl p-4 text-center shadow-sm cursor-pointer" onClick={onclick}>
    <h3 className="text-sm font-medium text-black">{title}</h3>
    <p className="text-2xl font-bold mt-1 underline text-blue-500">{value}</p>
  </div>
);


export default Dashboard;
