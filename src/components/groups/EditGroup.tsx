'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Toast from '../utils/Toast';
import Spinner from '../utils/Spinner';

const EditGroup = ({ groupId, onClose, onSuccess }: { groupId: number, onClose: () => void, onSuccess: () => void }) => {
  const [groupData, setGroupData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/get-single`, { groupId });
        setGroupData(res.data.group);
      } catch (err: any) {
        setToast({ type: 'error', message: err.response?.data?.error || 'Failed to fetch group' });
      }
    };
    fetchGroup();
  }, [groupId]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/update`, {
        groupId,
        adminId: groupData.createdById,
        name: groupData.name,
        description: groupData.description,
        startDate: groupData.startDate,
        endDate: groupData.endDate,
        isActive: groupData.isActive,
      });

      setToast({ type: 'success', message: 'Group updated successfully' });
      onSuccess();
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Failed to update group' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setGroupData({ ...groupData, [e.target.name]: e.target.value });
  };

  if (!groupData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit Group</h2>

        <input
          className="w-full mb-2 border px-3 py-2 rounded"
          name="name"
          placeholder="Group Name"
          value={groupData.name}
          onChange={handleChange}
        />
        <textarea
          className="w-full mb-2 border px-3 py-2 rounded"
          name="description"
          placeholder="Description"
          value={groupData.description}
          onChange={handleChange}
        />
        <input
          className="w-full mb-2 border px-3 py-2 rounded"
          name="startDate"
          type="date"
          value={groupData.startDate.split('T')[0]}
          onChange={handleChange}
        />
        <input
          className="w-full mb-4 border px-3 py-2 rounded"
          name="endDate"
          type="date"
          value={groupData.endDate.split('T')[0]}
          onChange={handleChange}
        />

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? <Spinner /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGroup;
