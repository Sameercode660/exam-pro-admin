"use client";

import { useEffect, useState } from "react";
import DynamicTable from "@/components/utils/DynamicTable";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import PageHeading from "@/components/utils/PageHeading";

const STAGING_STATUSES = ["PENDING", "VALID", "INVALID", "DUPLICATE", "IMPORTED"];

interface UploadTimestamp {
    raw: string;
    formatted: string;
    batchId: number;
}

export default function StagingParticipants() {
    const [uploadTimestamps, setUploadTimestamps] = useState<UploadTimestamp[]>([]);
    const [selectedTimestamp, setSelectedTimestamp] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [tableData, setTableData] = useState<Record<string, any>[]>([]);
    const { user } = useAuth();
    const organizationId = user?.organizationId;
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const [selectedValue, setSelectedValue] = useState("");
    const [search, setSearch] = useState("");

    const fetchTimestamps = async () => {
        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_ROOT_URL}/staging-data/staging-participants/upload-timestamp`,
                { organizationId }
            );
            const data = res.data?.uploadTimestamps;
            if (Array.isArray(data)) {
                setUploadTimestamps(data);
            } else {
                toast.error("Failed to fetch timestamps: Invalid response format.");
            }
        } catch (err) {
            toast.error("Error fetching upload timestamps.");
        }
    };

    const fetchFilteredData = async () => {
        if (!organizationId) {
            toast.warning("Organization ID missing");
            return;
        }

        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_ROOT_URL}/staging-data/staging-participants/fetch-participants`,
                {
                    organizationId,
                    status: selectedStatus || undefined,
                    batchId: Number(selectedBatchId) || undefined,
                    search: search || undefined,
                }
            );

            const responseData = res.data?.data;
            if (!Array.isArray(responseData)) {
                toast.error("Unexpected response. Couldn't load participants.");
                setTableData([]);
                return;
            }

            const mapped = responseData.map((item: any) => ({
                ID: item.id,
                BatchId: item.batchId,
                Name: item.name,
                Email: item.email,
                Mobile: item.mobileNumber,
                Status: item.status,
                Admin: item.admin?.name,
                ErrorMessage: item.errorMessage,
                CreatedAt: new Date(item.createdAt).toLocaleString("en-IN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }),
            }));

            setTableData(mapped);
        } catch (err) {
            toast.error("Failed to fetch participant data.");
            setTableData([]);
        }
    };

    useEffect(() => {
        if (organizationId) {
            fetchTimestamps();
        }
    }, [organizationId]);

    useEffect(() => {
        if (organizationId) {
            fetchFilteredData();
        }
    }, [selectedStatus, selectedTimestamp, selectedBatchId]);

    return (
        <>
            <PageHeading title="Staging Participants" />

            <div className="p-4 space-y-4">
                {/* Filters Row */}
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Status */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="p-2 border rounded h-10"
                    >
                        <option value="">Select Status</option>
                        {STAGING_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>

                    {/* Batch */}
                    <select
                        value={selectedValue}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSelectedValue(value);
                            if (value) {
                                const { batchId, raw } = JSON.parse(value);
                                setSelectedBatchId(batchId);
                                setSelectedTimestamp(raw);
                            } else {
                                setSelectedBatchId(null);
                                setSelectedTimestamp(null);
                            }
                        }}
                        className="p-2 border rounded h-10"
                    >
                        <option value="">Select BatchId</option>
                        {uploadTimestamps.map((ts, idx) => (
                            <option
                                key={idx}
                                value={JSON.stringify({ batchId: ts.batchId, raw: ts.raw })}
                            >
                                {`batchId-${ts.batchId} - ${ts.formatted}`}
                            </option>
                        ))}
                    </select>

                    {/* Search Bar */}
                    <input
                        type="text"
                        placeholder="Search by name, email, or mobile"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border rounded px-3 h-10 w-full md:w-64"
                    />

                    {/* Apply */}
                    <button
                        onClick={fetchFilteredData}
                        className="px-4 bg-blue-600 text-white rounded hover:bg-blue-700 h-10"
                    >
                        Apply
                    </button>
                    {
                        (selectedBatchId || selectedStatus || search) && (<button
                            onClick={() => {
                                setSelectedBatchId('');
                                setSelectedStatus('');
                                setSearch('');
                            }}
                            className="px-4 bg-blue-600 text-white rounded hover:bg-blue-700 h-10"
                        >
                            clear
                        </button>)
                    }
                </div>

                {/* Table */}
                <DynamicTable
                    columns={[
                        "ID",
                        "BatchId",
                        "Name",
                        "Email",
                        "Mobile",
                        "Status",
                        "ErrorMessage",
                        "Admin",
                        "CreatedAt",
                    ]}
                    data={tableData}
                    searchable={false}
                />
            </div>
        </>
    );
}
