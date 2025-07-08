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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {admins.map((admin) => (
                        <div
                            key={admin.id}
                            className="bg-white border rounded-xl shadow-sm p-6 hover:shadow-md transition"
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">{admin.name}</h2>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Email:</strong> {admin.email}</p>
                                <p><strong>Mobile:</strong> {admin.mobileNumber}</p>
                                <p><strong>Role:</strong> {admin.role}</p>
                                <p><strong>Org ID:</strong> {admin.organizationId ?? '—'}</p>
                                <p><strong>Created By:</strong> {admin.createdById ?? '—'}</p>
                                <p><strong>Joined:</strong> {new Date(admin.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminList;
