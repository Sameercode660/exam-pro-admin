'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Roles, useAuth } from '@/context/AuthContext';
import Toast from '../utils/Toast';
import Spinner from '../utils/Spinner';
import EditGroup from './EditGroup';
import { useRouter } from 'next/navigation';
import { Calendar } from '../ui/calendar';
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DateRange } from "react-day-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import PageHeading from '../utils/PageHeading';

interface Group {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: {
    id: number;
    name: string;
  };
  createdAt: string;
  _count: {
    participants: number;
  };
}

interface Admin {
  id: number;
  name: string;
  email: string;
}

const ManageGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState<'my' | 'all'>('my');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; groupId: number | null }>({
    open: false,
    groupId: null,
  });

  const [status, setStatus] = useState<"active" | "inactive" | "">("");
  const [date, setDate] = useState<DateRange | undefined>()
  const router = useRouter();

  const { user } = useAuth();
  const adminId = user?.id;
  const organizationId = user?.organizationId;

  // ✅ Fetch Admins of this organization
  const fetchAdmins = async () => {
    if (!organizationId) return;
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch-admin-list`, {
        organizationId,
      });
      setAdmins(res.data.admins);
    } catch (err) {
      console.error('Failed to fetch admins', err);
    }
  };

  // ✅ Fetch Groups
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch`, {
        search,
        adminId: viewType === 'my' ? adminId : selectedAdminId || undefined,
        organizationId: viewType === 'all' ? organizationId : undefined,
        status: status || undefined,
        fromDate: date?.from?.toISOString(),
        toDate: date?.to?.toISOString(),
      });
      setGroups(res.data);
    } catch (err) {
      console.error('Failed to fetch groups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [organizationId]);

  useEffect(() => {
    fetchGroups();
  }, [viewType, selectedAdminId, date, status, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGroups();
  };

  // ✅ Delete group
  const deleteGroup = async (groupId: number, requesterId: number) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/delete`, {
        groupId,
        requesterId,
      });
      return { success: true, data: res.data };
    } catch (err: any) {
      console.error('Delete Error:', err);
      return {
        success: false,
        error: err.response?.data?.error || 'Something went wrong.',
      };
    }
  };

  const handleDelete = async () => {
    if (!selectedGroupId || !user?.id) return;

    const res = await deleteGroup(selectedGroupId, user.id);
    if (res.success) {
      fetchGroups();
      setShowDeleteModal(false);
      setSelectedGroupId(null);
      setToast({ message: 'Group deleted successfully!', type: 'success' });
    } else {
      setToast({ message: res.error, type: 'error' });
    }
  };

  return (
    <>
      <PageHeading title='Manage Groups'></PageHeading>
      <div className="p-6 max-w-7xl mx-auto">
        {/* toast for message  */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Header Actions */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded-lg ${viewType === 'my' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setViewType('my')}
            >
              My Groups
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${viewType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setViewType('all')}
            >
              All Groups
            </button>
          </div>

          {/* ✅ Admin Dropdown (visible in All Groups mode) */}
          {(
            <select
              value={selectedAdminId ?? ''}
              onChange={(e) =>
                setSelectedAdminId(e.target.value ? Number(e.target.value) : null)
              }
              className="border px-3 py-2 rounded-lg"
            >
              <option value="">Select Admin</option>
              {admins.map((admin) => (
                admin.id == adminId ? null : (<option key={admin.id} value={admin.id}>
                  {admin.name}
                </option>)
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Date Range Filter (Shadcn Calendar) */}
          <div className="flex space-x-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
            {/* Clear button */}
            {date && (
              <Button
                variant="ghost"
                onClick={() => setDate(undefined)}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow border px-4 py-2 rounded-lg shadow-sm"
          />
          <button
            type="submit"
            className="border px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Search
          </button>
        </form>

        {/* Table */}
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-[#f1e9d9] text-gray-800 font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Added Participants</th>
                  <th className="px-4 py-3 text-left">Start Date</th>
                  <th className="px-4 py-3 text-left">End Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created By</th>
                  <th className="px-4 py-3 text-left">Created At</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {groups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-100 border-b">
                    <td
                      className="px-4 py-2 underline text-blue-400 cursor-pointer"
                      onClick={() => {
                        router.push(`/home/groups/${group.id}/${0}/${0}`);
                      }}
                    >
                      {group.name.toUpperCase()}
                    </td>
                    <td className="px-4 py-2">{group.description}</td>
                    <td
                      className="px-4 py-2 flex justify-center items-center text-blue-500 underline cursor-pointer"
                      onClick={() => {
                        router.push(`/home/groups/${group.id}/${1}/${2}`);
                      }}
                    >
                      {group._count.participants}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(group.startDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(group.endDate).toLocaleDateString('en-GB')}
                    </td>
                    <td
                      className={`px-4 py-2 ${group.isActive ? 'text-green-500' : 'text-red-400'
                        }`}
                    >
                      {group.isActive ? 'Active' : 'Inactive'}
                    </td>
                    <td className="px-4 py-2">{group.createdBy.name}</td>
                    <td className="px-4 py-2">
                      {new Date(group.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-2 flex justify-between items-center gap-2 border">
                      {(user?.id === group.createdBy.id || user?.role === Roles.admin) && (
                        <>
                          <button
                            className="text-yellow-600 hover:underline"
                            onClick={() => {
                              setEditModal({ open: true, groupId: group.id });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedGroupId(group.id);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {groups.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-gray-500">
                      No groups found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* edit modal */}
        {editModal.open && editModal.groupId && (
          <EditGroup
            groupId={editModal.groupId}
            onClose={() => setEditModal({ open: false, groupId: null })}
            onSuccess={fetchGroups}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedGroupId && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-sm w-full">
              <h2 className="text-lg font-semibold mb-4">Are you sure?</h2>
              <p className="mb-6">
                Do you really want to delete this group? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedGroupId(null);
                  }}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? <Spinner /> : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManageGroups;
