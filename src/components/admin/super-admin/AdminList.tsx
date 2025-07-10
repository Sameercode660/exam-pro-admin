'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Admin {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  createdAt: string;
  active: boolean;
  role: string;
  organizationId?: number;
  createdById?: number;
}

const AdminList = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/super-admin/admins`, { search });
      setAdmins(res.data);
    } catch (err) {
      console.error('Failed to fetch admins', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdmins();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Search admins..."
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

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Mobile</th>
                <th className="border px-4 py-2 text-left">Role</th>
                <th className="border px-4 py-2 text-left">Org ID</th>
                <th className="border px-4 py-2 text-left">Created By</th>
                <th className="border px-4 py-2 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 text-blue-600 cursor-pointer">{admin.name}</td>
                  <td className="border px-4 py-2">{admin.email}</td>
                  <td className="border px-4 py-2">{admin.mobileNumber}</td>
                  <td className="border px-4 py-2">{admin.role}</td>
                  <td className="border px-4 py-2">{admin.organizationId ?? '—'}</td>
                  <td className="border px-4 py-2">{admin.createdById ?? '—'}</td>
                  <td className="border px-4 py-2">{new Date(admin.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminList;
