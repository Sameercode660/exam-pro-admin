'use client'

import React from 'react'
import Home from '@/components/Home';
import ProtectedRoute from '@/components/protected/ProtectedRoute';
import DashboardHeading from '@/components/utils/DashboardHeading';
import SuddentCloseActivityTracker from '@/components/admins-activity-tracking/SuddentCloseActivityTracker';
import { useAuth } from '@/context/AuthContext';

function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { user } = useAuth();
  return (
    <div>
      <ProtectedRoute>
        <DashboardHeading></DashboardHeading>
        {user && <SuddentCloseActivityTracker userId={user.id} />}
        <Home children={children}></Home>
      </ProtectedRoute>
    </div>
  )
}

export default layout
