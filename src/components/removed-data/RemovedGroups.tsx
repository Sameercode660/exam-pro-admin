"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import DynamicTable from "../utils/DynamicTable";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type RemovedGroup = {
  id: number;
  name: string;
  createdAt: string;
  removedAt: string;
  createdBy: string;
  removedBy: string | null;
};

type Admin = {
  id: number;
  name: string;
};

export default function RemovedGroups() {
  const [groups, setGroups] = useState<RemovedGroup[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const { user } = useAuth();

  // Fetch admins for dropdown
  const fetchAdmins = async () => {
    if (!user?.organizationId) return;
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch-admin-list`, {
        organizationId: user.organizationId,
      });

      console.log(res.data.admins)
      setAdmins(res.data.admins || []);
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    }
  };

  // Fetch removed groups
  const fetchGroups = async () => {
    if (!user?.organizationId) return;
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-groups/fetch-removed-groups`,
        {
          organizationId: user.organizationId,
          search,
          adminId: selectedAdmin,
          dateRange: dateRange?.from && dateRange?.to ? {
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
          } : undefined,
        }
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
      fetchGroups();
    } catch (err) {
      console.error("Failed to restore group:", err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [search, selectedAdmin, dateRange]);

  const columns = ["Name", "Created By", "Removed By", "Created At", "Removed At", "Action"];

  const formattedData = groups.map((g) => ({
    Name: g.name,
    "Created By": g.createdBy,
    "Removed By": g.removedBy || "-",
    "Created At": new Date(g.createdAt).toLocaleString(),
    "Removed At": new Date(g.removedAt).toLocaleString(),
    Action: g.id,
  }));

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Removed Groups</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg shadow-sm"
        />

        <select
          value={selectedAdmin ?? ""}
          onChange={(e) => setSelectedAdmin(e.target.value ? Number(e.target.value) : undefined)}
          className="border px-3 py-2 rounded-lg shadow-sm"
        >
          <option value="">All Admins</option>
          {admins.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {dateRange?.from && dateRange?.to
                ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                : "Select date range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>
        {dateRange && (
          <Button variant="ghost" onClick={() => setDateRange(undefined)}>
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <DynamicTable
        columns={columns}
        data={formattedData}
        searchable={false}
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
