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
      console.log(res.data)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="bg-white border rounded-xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{org.name}</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email:</strong> {org.email}</p>
                <p><strong>Phone:</strong> {org.phone}</p>
                <p><strong>Address:</strong> {org.address}</p>
                <p><strong>State:</strong> {org.State}</p>
                <p><strong>Country:</strong> {org.Country} ({org.CountryCode})</p>
                <p><strong>Created:</strong> {new Date(org.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Organizations;
