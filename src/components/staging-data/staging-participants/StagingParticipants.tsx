"use client";

import { useEffect, useState } from "react";
import DynamicTable from "@/components/utils/DynamicTable";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";


const STAGING_STATUSES = ["PENDING", "VALID", "INVALID", "DUPLICATE", "IMPORTED"];

interface UploadTimestamp {
    raw: string;
    formatted: string;
    batchId: number
}

export default function StagingParticipants() {
    const [uploadTimestamps, setUploadTimestamps] = useState<UploadTimestamp[]>([]);
    const [selectedTimestamp, setSelectedTimestamp] = useState<string | null>("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [tableData, setTableData] = useState<Record<string, any>[]>([]);
    const { user } = useAuth();
    const organizationId = user?.organizationId;
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>('')
    const [selectedValue, setSelectedValue] = useState("");

    const fetchTimestamps = async () => {
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/staging-data/staging-participants/upload-timestamp`, {
                organizationId,
            });

            const data = res.data?.uploadTimestamps;
            console.log(res.data?.uploadTimestamps)
            if (Array.isArray(data)) {
                setUploadTimestamps(data);
            } else {
                console.error("Unexpected timestamp response:", data);
                toast.error("Failed to fetch timestamps: Invalid response format.");
            }
        } catch (err) {
            console.error("Error fetching participant timestamps:", err);
            toast.error("Error fetching upload timestamps.");
        }
    };


    const fetchFilteredData = async () => {
        if (!organizationId) {
            toast.warning("Organization ID missing");
            return;
        }

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/staging-data/staging-participants/fetch-participants`, {
                organizationId,
                status: selectedStatus || undefined,
                batchId: Number(selectedBatchId) || undefined,
            });

            console.log(res.data)

            const responseData = res.data?.data;

            if (!Array.isArray(responseData)) {
                console.error("Unexpected response format. 'data' is not an array:", responseData);
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
            console.error("Error fetching participant data:", err);
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
    }, [selectedStatus, selectedTimestamp]);

    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-4">
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="">Filter by Status</option>
                    {STAGING_STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>

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
                            // reset if "Filter by BatchId" is chosen
                            setSelectedBatchId(null);
                            setSelectedTimestamp(null);
                        }
                    }}
                    className="p-2 border rounded"
                >
                    <option value="">Filter by BatchId</option>
                    {uploadTimestamps.map((ts, idx) => (
                        <option
                            key={idx}
                            value={JSON.stringify({ batchId: ts.batchId, raw: ts.raw })}
                        >
                            {`batchId-${ts.batchId} - ${ts.formatted}`}
                        </option>
                    ))}
                </select>

                <button
                    onClick={fetchFilteredData}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Apply Filter
                </button>
            </div>

            <DynamicTable
                columns={["ID", "BatchId", "Name", "Email", "Mobile", "Status", "ErrorMessage", "Admin", "CreatedAt"]}
                data={tableData}
                searchable
            />
        </div>
    );
}
