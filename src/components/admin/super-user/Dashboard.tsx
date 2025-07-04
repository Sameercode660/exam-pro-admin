'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [data, setData] = useState({
    totalExams: 0,
    activeExams: 0,
    inactiveExams: 0,
    totalQuestions: 0,
    totalCategories: 0,
    totalTopics: 0,
    adminInfo: { name: '', email: '' },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const adminId = localStorage.getItem('adminId');
      if (!adminId) {
        console.error('Admin ID not found in localStorage');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/dashboard/dashboard-data-count`, { adminId });
        console.log(response.data)
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  const { adminInfo, ...stats } = data;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Admin Info */}
          <Card className="col-span-1 p-4 bg-white shadow-xl rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800">Admin Info</h2>
            <p className="text-sm text-gray-600 mt-2">Name: {adminInfo.name}</p>
            <p className="text-sm text-gray-600">Email: {adminInfo.email}</p>
          </Card>

          {/* Statistics */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(stats).map(([key, value]) => (
              <Card key={key} className="p-4 bg-white shadow-xl rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800">{key}</h3>
                <p className="text-2xl font-bold text-gray-600 mt-2">{value}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Reports Button */}
        <div className="mt-6 flex justify-center">
          <Button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg shadow-md hover:bg-blue-700">
            View Reports
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
