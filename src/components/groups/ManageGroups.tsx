'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Roles, useAuth } from '@/context/AuthContext';
import Toast from '../utils/Toast';
import Spinner from '../utils/Spinner';
import EditGroup from './EditGroup';
import { useRouter } from 'next/navigation';

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
  }
}

const ManageGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState<'my' | 'all'>('my');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean, groupId: number | null }>({ open: false, groupId: null });
  const router = useRouter();



  const { user } = useAuth();
  const adminId = user?.id;
  const organizationId = user?.organizationId;

  // Fetch Groups
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch`, {
        search,
        adminId: viewType === 'my' ? adminId : undefined,
        organizationId: viewType === 'all' ? organizationId : undefined,
      });
      setGroups(res.data);
      console.log(res.data)
    } catch (err) {
      console.error('Failed to fetch groups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [viewType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGroups();
  };

  // Delete group (soft-delete)
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
                  <td className="px-4 py-2 underline text-blue-400 cursor-pointer" onClick={() => {
                    router.push(`/home/groups/${group.id}/${0}`)
                  }} >{group.name.toUpperCase()}</td>
                  <td className="px-4 py-2">{group.description}</td>
                  <td className="px-4 py-2 flex justify-center items-center text-blue-500 underline cursor-pointer"
                    onClick={() => {
                      router.push(`/home/groups/${group.id}/${1}`)
                    }}
                  >{group._count.participants}</td>
                  <td className="px-4 py-2">{new Date(group.startDate).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-2">{new Date(group.endDate).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-2">{group.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-2">{group.createdBy.name}</td>
                  <td className="px-4 py-2">{new Date(group.createdAt).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-2 flex justify-between items-center gap-2 border">
                    {/* <button className="text-blue-600 hover:underline" onClick={() => {
                      router.push(`/home/groups/${group.id}`)
                    }}>View</button> */}
                    {(user?.id === group.createdBy.id || user?.role === Roles.admin) && (
                      <>
                        <button className="text-yellow-600 hover:underline" onClick={() => {
                          setEditModal({ open: true, groupId: group.id })
                        }}>Edit</button>
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
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    No groups found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* edit model  */}
      {editModal.open && editModal.groupId && (
        <>
          {console.log("Opening Edit Modal for ID:", editModal.groupId)}
          <EditGroup
            groupId={editModal.groupId}
            onClose={() => setEditModal({ open: false, groupId: null })}
            onSuccess={fetchGroups}
          />
        </>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedGroupId && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Are you sure?</h2>
            <p className="mb-6">Do you really want to delete this group? This action cannot be undone.</p>
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
                {loading ? <Spinner></Spinner> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGroups;
