"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import moment from "moment";

type RemovedParticipant = {
  id: number;
  name: string;
  mobileNumber: string;
  createdAt: string;
  createdBy: string;
  removedBy: string | null;
};

export default function RemovedParticipants() {
  const [participants, setParticipants] = useState<RemovedParticipant[]>([]);
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  const fetchParticipants = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-participants/fetch-removed-participants`,
        {
          organizationId: user?.id,
          search,
        }
      );
      setParticipants(res.data.data);
    } catch (err) {
      console.error("Failed to fetch participants:", err);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [search]);

  const handleRestore = async (participantId: number) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-participants/restore-removed-participants`,
        { participantId }
      );
      fetchParticipants();
    } catch (err) {
      console.error("Restore failed:", err);
    }
  };

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search by name or mobile..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full md:w-1/3"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-[#f1e9d9] text-gray-800 font-semibold">
            <tr>
              <th className="px-4 py-3 text-center">Name</th>
              <th className="px-4 py-3 text-center">Mobile</th>
              <th className="px-4 py-3 text-center">Created At</th>
              <th className="px-4 py-3 text-center">Created By</th>
              <th className="px-4 py-3 text-center">Removed By</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {participants.length === 0 ? (
              <tr className="hover:bg-gray-100 border-b">
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  No participants found.
                </td>
              </tr>
            ) : (
              participants.map((p) => (
                <tr key={p.id} className="hover:bg-gray-100 border-b">
                  <td className="px-4 py-2 border-0">{p.name}</td>
                  <td className="px-4 py-2 border-0">{p.mobileNumber}</td>
                  <td className="px-4 py-2 border-0">{moment(p.createdAt).format("DD/MM/YYYY")}</td>
                  <td className="px-4 py-2 border-0">{p.createdBy}</td>
                  <td className="px-4 py-2 border-0">{p.removedBy || "-"}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleRestore(p.id)}
                      className="text-blue-600 hover:underline"
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
