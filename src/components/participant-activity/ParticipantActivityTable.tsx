"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

export default function ParticipantActivityTable() {
  const [activities, setActivities] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchActivities = async () => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/participant-activity-tracking/fetch-activity-data`, {
      search,
      fromDate,
      toDate,
    });
    setActivities(res.data.data);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name"
          className="border px-3 py-2 rounded-md text-sm w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-[#f1e9d9] text-gray-800 font-semibold">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Login Time</th>
              <th className="px-4 py-3 text-left">Logout Time</th>
              <th className="px-4 py-3 text-left">Spent Time</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-100 border-b">
                <td className="px-4 py-2 text-blue-600 font-medium">
                  {activity.participant.name || "Unknown"}
                </td>
                <td className="px-4 py-2">
                  {format(new Date(activity.loginTime), "dd/MM/yyyy hh:mm a")}
                </td>
                <td className="px-4 py-2">
                  {activity.logoutTime != activity.loginTime
                    ? format(new Date(activity.logoutTime), "dd/MM/yyyy hh:mm a")
                    : "-"}
                </td>
                <td className="px-4 py-2">
                  {activity.spentTime ? (
                    (() => {
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
                  ) : (
                    "Online"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
