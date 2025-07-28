"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import DynamicTable from "../utils/DynamicTable";

type RemovedGroup = {
  id: number;
  name: string;
  createdAt: string;
  removedAt: string;
  createdBy: string;
  removedBy: string | null;
};

export default function RemovedGroups() {
  const [groups, setGroups] = useState<RemovedGroup[]>([]);
  const { user } = useAuth();

  const fetchGroups = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-groups/fetch-removed-groups`,
        { organizationId: user?.organizationId }
      );
      setGroups(res.data.data);
    } catch (err) {
      console.error("Failed to fetch removed groups:", err);
    }
  };

  const handleRestore = async (groupId: number) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-groups/restore-group`,
        { groupId, adminId: user?.id }
      );
      fetchGroups(); // Refresh the table
    } catch (err) {
      console.error("Failed to restore group:", err);
    }
  };

  useEffect(() => {
    if (user?.organizationId) {
      fetchGroups();
    }
  }, [user?.organizationId]);

  const columns = [
    "Name",
    "Created By",
    "Removed By",
    "Created At",
    "Removed At",
    "Action",
  ];

  const formattedData = groups.map((g) => ({
    "Name": g.name,
    "Created By": g.createdBy,
    "Removed By": g.removedBy || "-",
    "Created At": new Date(g.createdAt).toLocaleString(),
    "Removed At": new Date(g.removedAt).toLocaleString(),
    "Action": g.id,
  }));

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Removed Groups</h1>

      <DynamicTable
        columns={columns}
        data={formattedData}
        searchable={true}
        renderCell={(row, col) => {
          if (col === "Action") {
            return (
              <button
                onClick={() => handleRestore(row[col])}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              >
                Restore
              </button>
            );
          }
          return row[col];
        }}
      />
    </div>
  );
}
