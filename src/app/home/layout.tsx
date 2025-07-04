import React from 'react'
import Home from '@/components/Home';
import ProtectedRoute from '@/components/protected/ProtectedRoute';

function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <ProtectedRoute>
        <Home children={children}></Home>
      </ProtectedRoute>
    </div>
  )
}

export default layout
