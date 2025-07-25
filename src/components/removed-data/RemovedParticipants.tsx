"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

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
  const {user} = useAuth();

  const fetchParticipants = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-participants/fetch-removed-participants`, {
        organizationId: user?.id,
        search,
      });
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
      await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-participants/restore-removed-participants`, { participantId });
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
        className="mb-4 p-2 border rounded"
      />

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Mobile Number</th>
            <th className="border p-2">Created At</th>
            <th className="border p-2">Created By</th>
            <th className="border p-2">Removed By</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((participant) => (
            <tr key={participant.id}>
              <td className="border p-2">{participant.name}</td>
              <td className="border p-2">{participant.mobileNumber}</td>
              <td className="border p-2">{new Date(participant.createdAt).toLocaleString()}</td>
              <td className="border p-2">{participant.createdBy}</td>
              <td className="border p-2">{participant.removedBy || "-"}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleRestore(participant.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Restore
                </button>
              </td>
            </tr>
          ))}
          {participants.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-4 text-gray-500">
                No participants found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
