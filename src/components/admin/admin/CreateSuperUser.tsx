'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const CreateSuperUser = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
  });
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [mobileNumberError, setMobileNumberError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false)

  const { user } = useAuth();
  const adminId = user?.id;

  function eraseError(resetState: any) {
    const id = setTimeout(() => {
      resetState(false);
      clearTimeout(id);
    }, 2000)
  }

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
    if (form.name == '') {
      setNameError(true);
      eraseError(setNameError);
      return;
    } else if (form.email == '') {
      setEmailError(true);
      eraseError(setEmailError);
      return;
    } else if (form.mobileNumber == '') {
      setMobileNumberError(true);
      eraseError(setMobileNumberError);
      return;
    } else if (form.password == '') {
      setPasswordError(true);
      eraseError(setPasswordError);
      return;
    }

    if ((!form.email.includes('@')) || (!form.email.endsWith('.com'))) {
      toast.error('Inavalid email format')
      setEmailError(true);
      eraseError(setEmailError);
      return;
    }

    if (form.mobileNumber.length > 12 || form.mobileNumber.startsWith('12345')) {
      toast.error('Please enter correct mobile number');
      setMobileNumberError(true);
      eraseError(setMobileNumberError);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/admin/create-super-user`, {
        ...form,
        organizationId,
        createdById: Number(adminId),
      });
      console.log(response.data)
      toast.success('SuperUser create successfully');
      setForm({ name: '', email: '', mobileNumber: '', password: '' });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Something went wrong");
      } else {
        toast.error("Unable to create the user");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Create SuperUser</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className={`w-full border px-4 py-2 rounded ${nameError ? 'border-red-500' : ''}`} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className={`w-full border px-4 py-2 rounded ${emailError ? 'border-red-500' : ''}`} />
        <input name="mobileNumber" placeholder="Mobile Number" value={form.mobileNumber} onChange={handleChange} className={`w-full border px-4 py-2 rounded ${mobileNumberError ? 'border-red-500' : ''}`} />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className={`w-full border px-4 py-2 rounded ${passwordError ? 'border-red-500' : ''}`} />
        <button type="submit" disabled={loading || !organizationId} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {loading ? 'Creating...' : 'Create SuperUser'}
        </button>
      </form>
      <ToastContainer position='top-center' autoClose={2000}></ToastContainer>
    </div>
  );
};

export default CreateSuperUser;
