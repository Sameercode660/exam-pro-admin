'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const CreateSuperUser = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
  });
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const {user} = useAuth();
  const adminId = user?.id;

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/admin/get-admin-org`, {
          adminId,
        });
        setOrganizationId(res.data.organizationId);
      } catch (err) {
        console.error('Error fetching organizationId:', err);
      }
    };

    if (adminId) fetchOrganization();
  }, [adminId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId || !adminId) return;

    try {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/admin/create-super-user`, {
        ...form,
        organizationId,
        createdById: Number(adminId),
      });

      if(response.data.status == 500) {
        alert('Unable to create the SuperUser');
        return;
      }
      alert('SuperUser created successfully!');
      setForm({ name: '', email: '', mobileNumber: '', password: '' });
    } catch (err) {
      if(err instanceof Error) {
        alert(err.message)
      } else {
          alert('Unable to create the user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Create SuperUser</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full border px-4 py-2 rounded" />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border px-4 py-2 rounded" />
        <input name="mobileNumber" placeholder="Mobile Number" value={form.mobileNumber} onChange={handleChange} className="w-full border px-4 py-2 rounded" />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full border px-4 py-2 rounded" />
        <button type="submit" disabled={loading || !organizationId} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {loading ? 'Creating...' : 'Create SuperUser'}
        </button>
      </form>
    </div>
  );
};

export default CreateSuperUser;
