"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function SuperUsers() {
  const [superUsers, setSuperUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const { user } = useAuth();


  useEffect(() => {
    axios
      .post(`${process.env.NEXT_PUBLIC_ROOT_URL}/admin/fetch-total-super-user`, {
        organizationId: user?.organizationId,
      })
      .then((res) => {
        console.log(res.data?.data)
        setSuperUsers(res.data?.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch super users", err);
        setSuperUsers([]);
      });
  }, [user?.organizationId]);

  const filtered = superUsers?.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 mb-4"
      />
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-[#f1e9d9] text-gray-800 font-semibold">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Role</th>
            <th className="px-4 py-3 text-left">CreatedAt</th>
            <th className="px-4 py-3 text-left">CreatedBy</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {filtered.map((user) => (
            <tr key={user.id} className="hover:bg-gray-100 border-b">
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{"SuperUser"}</td>
              <td className="px-4 py-2">{new Date(user.createdAt).toLocaleString()}</td>
              <td className="px-4 py-2">{user.createdBy?.name ? user.createdBy.name : 'self'}</td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center py-4 text-gray-500">
                No superusers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
