'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import DynamicTable from '@/components/utils/DynamicTable';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

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

  const columns = [
    'name',
    'email',
    'phone',
    'address',
    'State',
    'Country',
    'Created At',
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* <form onSubmit={handleSearch} className="mb-6 flex gap-2">
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
      </form> */}

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <DynamicTable
          color='text-blue-500'
          event={() => {
            router.push('/home')
          }}
          columns={columns}
          data={organizations.map((org) => ({
            ...org,
            Country: `${org.CountryCode} ${org.Country}`,
            'Created At': new Date(org.createdAt).toLocaleDateString(),
          }))}
          searchable={true}
        />
      )}
    </div>
  );
};

export default Organizations;
