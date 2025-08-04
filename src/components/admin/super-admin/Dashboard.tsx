'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const { user } = useAuth();
  const adminId = user?.id;
  const organizationId = user?.organizationId;
  const router = useRouter();

  const [unapprovedParticipants, setUnapprovedParticipants] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [orgStats, setOrgStats] = useState({
    totalSuperUsers: 0,
    totalParticipants: 0,
    totalExams: 0,
    totalQuestions: 0,
    activeExams: 0,
    inactiveExams: 0,
  });

  const [superAdminStats, setSuperAdminStats] = useState({
    totalAdmins: 0,
    totalOrganizations: 0,
  });

  const fetchUnapprovedParticipants = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/participants/fetch-upapprove-participant`,
        { organizationId }
      );
      setUnapprovedParticipants(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to fetch participants');
    }
  };

  const fetchOrganizationStats = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/admin/dashboard-data`,
        { organizationId }
      );
      setOrgStats(res.data);
    } catch (err: any) {
      toast.error('Failed to fetch organization stats');
    }
  };

  const fetchSuperAdminStats = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/super-admin/dashboard-data`,
        { adminId }
      );
      setSuperAdminStats({
        totalAdmins: res.data.totalAdmins,
        totalOrganizations: res.data.totalOrganizations,
      });
    } catch (err) {
      toast.error('Failed to fetch super admin stats');
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchUnapprovedParticipants();
      fetchOrganizationStats();
    }
    if (adminId) {
      fetchSuperAdminStats();
    }
  }, [organizationId, adminId]);

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
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleApproveSelected = async () => {
    if (selectedIds.length === 0) {
      toast.warning('Please select at least one participant to approve.');
      return;
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/participants/approve-participant`, {
        participantIds: selectedIds,
        adminId,
      });

      toast.success('Participants approved successfully!');
      setSelectedIds([]);
      setSelectAll(false);
      fetchUnapprovedParticipants();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Approval failed.');
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Section 1: Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Super Admin Cards */}
          <StatCard title="Total Admins" value={superAdminStats.totalAdmins} onclick={() => router.push('/home/super-admin/admins')} />
          <StatCard title="Total Organizations" value={superAdminStats.totalOrganizations} onclick={() => router.push('/home/super-admin/organizations')} />
          <div onClick={() => router.push('/home/super-admin/create-admin')} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl flex flex-col justify-center items-center p-4 cursor-pointer shadow-md hover:opacity-90">
            <h3 className="text-sm font-medium">Create Admin</h3>
            <span className="text-2xl font-bold mt-1">+ Create</span>
          </div>
        </div>

        {/* Section 2: Reports */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 flex items-center justify-center">
          <h2 className="text-2xl font-bold text-gray-800">📈 Reports Overview</h2>
        </div>
      </div>

      {/* Section 3: Graph & Approvals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Graph */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Graph Overview</h3>
          <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed rounded-xl">
            Graph Component Goes Here
          </div>
        </div>

        {/* Approvals */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800"> Purchases info</h2>
        </div>
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
};

const StatCard = ({
  title,
  value,
  onclick,
}: {
  title: string;
  value: number;
  onclick?: () => void;
}) => (
  <div
    className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm cursor-pointer hover:shadow-md transition"
    onClick={onclick}
  >
    <h3 className="text-sm font-medium text-black">{title}</h3>
    <p className="text-2xl font-bold mt-1 underline text-blue-500">{value}</p>
  </div>
);

export default Dashboard;
