'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

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
  const {user} = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
    
      try {
        setLoading(true);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_ROOT_URL}/dashboard/dashboard-data-count`,
          { adminId: user?.id }
        );
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg font-medium text-gray-700">Loading...</div>
      </div>
    );
  }

  const { adminInfo, ...stats } = data;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
          {Object.entries(stats).map(([key, value]) => (
            <Card key={key} className="p-4 bg-white border rounded-lg text-center">
              <h3 className="text-sm font-medium text-gray-800 capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            </Card>
          ))}
        </div>

        {/* Reports Button as Card */}
        <div className="w-full md:w-1/2">
          <Card className="p-4 border text-center cursor-pointer hover:shadow transition">
            <Button
              variant="ghost"
              className="w-full text-lg font-medium text-gray-800"
            >
              📊 View Reports
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
