'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Organization {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  State: string;
  Country: string;
  CountryCode: string;
  createdAt: string;
}

const Organizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/super-admin/organizations`, { search });
      setOrganizations(res.data);
    } catch (err) {
      console.error('Failed to fetch organizations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrganizations();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Search organizations..."
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
                <th className="border px-4 py-2 text-left">Phone</th>
                <th className="border px-4 py-2 text-left">Address</th>
                <th className="border px-4 py-2 text-left">State</th>
                <th className="border px-4 py-2 text-left">Country</th>
                <th className="border px-4 py-2 text-left">Code</th>
                <th className="border px-4 py-2 text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{org.name}</td>
                  <td className="border px-4 py-2">{org.email}</td>
                  <td className="border px-4 py-2">{org.phone}</td>
                  <td className="border px-4 py-2">{org.address}</td>
                  <td className="border px-4 py-2">{org.State}</td>
                  <td className="border px-4 py-2">{org.CountryCode + org.Country}</td>
                  {/* <td className="border px-4 py-2">{org.CountryCode}</td> */}
                  <td className="border px-4 py-2">{new Date(org.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Organizations;
