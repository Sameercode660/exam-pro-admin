"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import DynamicTable from "../utils/DynamicTable";
import { useAuth } from "@/context/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import PageHeading from "../utils/PageHeading";

export default function AdminsActivityTable() {
    const [activities, setActivities] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const { user } = useAuth();

    const fetchActivities = async () => {
        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_ROOT_URL}/admins-activity/fetch-activity-data`,
            {
                organizationId: Number(user?.organizationId),
                search,
                fromDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
                toDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
            }
        );
        setActivities(res.data.data);
    };

    useEffect(() => {
        fetchActivities();
    }, [search, dateRange]);

    const columns = [
        "Name",
        "Email",
        "Mobile Number",
        "Role",
        "Login Time",
        "Logout Time",
        "Spent Time",
    ];

    const tableData = activities.map((activity) => ({
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
                if (seconds > 0 || parts.length === 0) parts.push(`${seconds} sec`);
                return parts.join(" ");
            })()
            : "-",
    }));

    return (
      <>
        <PageHeading title="Admin and Super User Activity"></PageHeading>
          <div className="pr-6 pl-6 pb-6 space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <input
                    type="text"
                    placeholder="Search by name, email, mobile..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 px-3 border border-gray-300 rounded-lg shadow-sm text-sm w-64"
                />

                {/* Date Range Picker */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-10 w-[280px] justify-start text-left font-normal text-sm"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {dateRange.from.toLocaleDateString()} -{" "}
                                        {dateRange.to.toLocaleDateString()}
                                    </>
                                ) : (
                                    dateRange.from.toLocaleDateString()
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            initialFocus
                        />
                        {dateRange?.from && (
                            <div className="flex justify-end p-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDateRange(undefined)}
                                    className="flex items-center gap-1 text-red-500 hover:text-red-600"
                                >
                                    <X className="h-4 w-4" /> Clear
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={fetchActivities}
                        className="h-10 px-4 text-sm bg-blue-500 text-white hover:bg-blue-600"
                    >
                        Apply Filters
                    </Button>
                    {(search || dateRange) && (
                        <Button
                            onClick={() => {
                                setSearch("");
                                setDateRange(undefined);
                            }}
                            className="h-10 px-4 text-sm bg-blue-500 text-white hover:bg-blue-600"
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </div>
            {/* Table */}
            <DynamicTable
                columns={columns}
                data={tableData}
                // searchable={false} 
                color="text-blue-600 font-medium"
            />
        </div>
      </>
    );
}
