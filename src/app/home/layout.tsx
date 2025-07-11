import React from 'react'
import Home from '@/components/Home';
import ProtectedRoute from '@/components/protected/ProtectedRoute';
import DashboardHeading from '@/components/utils/DashboardHeading';

function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <ProtectedRoute>
        <DashboardHeading></DashboardHeading>
        <Home children={children}></Home>
      </ProtectedRoute>
    </div>
  )
}

export default layout
