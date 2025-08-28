"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import DynamicTable from "../utils/DynamicTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import PageHeading from "../utils/PageHeading";
// import { DateRangePicker } from "@/components/ui/date-range-picker"; // your wrapper component

export default function RemovedParticipants() {
  const [participants, setParticipants] = useState<any[]>([]);
  const { user } = useAuth();

  const [batches, setBatches] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Fetch batches
  const fetchBatches = async () => {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/batch-ids`,
      { organizationId: user?.organizationId, type: "participants" }
    );
    setBatches(res.data || []);
  };

  // Fetch admins
  const fetchAdmins = async () => {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch-admin-list`,
      { organizationId: user?.organizationId }
    );
    setAdmins(res.data.admins || []);
  };

  // Fetch removed participants
  const fetchParticipants = async () => {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-participants/fetch-removed-participants`,
      {
        organizationId: user?.organizationId,
        search: search || undefined,
        batchId: selectedBatch ? Number(selectedBatch) : undefined,
        adminId: selectedAdmin ? Number(selectedAdmin) : undefined,
        fromDate: dateRange?.from?.toISOString(),
        toDate: dateRange?.to?.toISOString(),
      }
    );
    setParticipants(res.data.data || []);
  };

  useEffect(() => {
    fetchParticipants();
  }, [search, selectedAdmin, selectedBatch]);

  useEffect(() => {
    fetchBatches();
    fetchAdmins();
  }, [])
  const handleRestore = async (participantId: number) => {
    await axios.post(
      `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-participants/restore-removed-participants`,
      { participantId, adminId: user?.id }
    );
    fetchParticipants();
  };

  const columns = [
    "BatchId",
    "Name",
    "Mobile Number",
    "Created At",
    "Removed At",
    "Created By",
    "Removed By",
    "Action",
  ];

  const formattedData = participants.map((p) => ({
    BatchId: p.batchId,
    Name: p.name,
    "Mobile Number": p.mobileNumber,
    "Created At": new Date(p.createdAt).toLocaleString(),
    "Removed At": new Date(p.removedAt).toLocaleString(),
    "Created By": p.createdBy,
    "Removed By": p.removedBy || "-",
    Action: p.id,
  }));

  return (
    <>
    <PageHeading title="Removed Participant"></PageHeading>
      <div className="pr-4 pl-4 pb-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {/* Search */}
        <Input
          placeholder="Search by name or mobile"
          className="h-10 w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Batch Select */}
        <Select
          value={selectedBatch ?? ""}
          onValueChange={(val) => setSelectedBatch(val || null)}
        >
          <SelectTrigger className="w-48 h-10">
            <SelectValue placeholder="All Batches" />
          </SelectTrigger>
          <SelectContent>
            {batches.map((batch) => (
              <SelectItem key={batch.batchId} value={String(batch.batchId)}>
                {batch.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Admin Select */}
        <Select
          value={selectedAdmin ?? ""}
          onValueChange={(val) => setSelectedAdmin(val || null)}
        >
          <SelectTrigger className="w-48 h-10">
            <SelectValue placeholder="Select Admin" />
          </SelectTrigger>
          <SelectContent>
            {admins.map((admin) => (
              <SelectItem key={admin.id} value={String(admin.id)}>
                {admin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Picker */}
        {/* <DateRangePicker date={dateRange} onDateChange={setDateRange} /> */}

        {/* Actions */}
        <Button onClick={fetchParticipants} className="h-10">
          Apply Filter
        </Button>
        <Button
          variant="outline"
          className="h-10"
          onClick={() => {
            setSearch("");
            setSelectedBatch(null);
            setSelectedAdmin(null);
            setDateRange(undefined);
            fetchParticipants();
          }}
        >
          Clear
        </Button>
      </div>

      {/* Table */}
      <DynamicTable
        columns={columns}
        data={formattedData}
        searchable={false}
        renderCell={(row, col) =>
          col === "Action" ? (
            <Button size="sm" onClick={() => handleRestore(row[col])}>
              Restore
            </Button>
          ) : (
            row[col]
          )
        }
      />
    </div>
    </>
  );
}
