"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import DynamicTable from "../utils/DynamicTable";
import { useAuth } from "@/context/AuthContext";

export default function AdminsActivityTable() {
    const [activities, setActivities] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const { user } = useAuth();

    const fetchActivities = async () => {
        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_ROOT_URL}/admins-activity/fetch-activity-data`,
            {
                organizationId: Number(user?.organizationId),
                search,
                fromDate,
                toDate,
            }
        );

        console.log(res.data)
        setActivities(res.data.data);
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    // Define the columns (keys should match what you send in `data`)
    const columns = [
        "Name",
        "Email",
        "Mobile Number",
        "Role",
        "Login Time",
        "Logout Time",
        "Spent Time",
    ];

    // Transform raw activities into rows for DynamicTable
    const tableData = activities.map((activity) => {
        return {
            Name: activity.admin?.name || "Unknown",
            Email: activity.admin?.email || "Unknown",
            "Mobile Number": activity.admin?.mobileNumber || "Unknown",
            Role: activity.admin?.role || "Unknown",
            "Login Time": format(new Date(activity.loginTime), "dd/MM/yyyy hh:mm a"),
            "Logout Time":
                activity.logoutTime !== activity.loginTime
                    ? format(new Date(activity.logoutTime), "dd/MM/yyyy hh:mm a")
                    : "-",
            "Spent Time": activity.spentTime
                ? (() => {
                    const totalSeconds = activity.spentTime;
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    const seconds = totalSeconds % 60;

                    const parts = [];
                    if (hours > 0) parts.push(`${hours} hr`);
                    if (minutes > 0) parts.push(`${minutes} min`);
                    if (seconds > 0 || parts.length === 0)
                        parts.push(`${seconds} sec`);

                    return parts.join(" ");
                })()
                : "-",
        };
    });

    return (
        <div className="p-4">
            {/* Filters */}
            <div className="flex gap-4 mb-4">
                {/* <input
          type="text"
          placeholder="Search by name"
          className="border px-3 py-2 rounded-md text-sm w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        /> */}
                <input
                    type="date"
                    className="border px-3 py-2 rounded-md text-sm"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
                <input
                    type="date"
                    className="border px-3 py-2 rounded-md text-sm"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />
                <button
                    onClick={fetchActivities}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm"
                >
                    Search
                </button>
            </div>

            {/* Reusable table */}
            <DynamicTable
                columns={columns}
                data={tableData}
                searchable={true} // enable built-in search
                color="text-blue-600 font-medium" // make names look clickable/blue
            />
        </div>
    );
}
