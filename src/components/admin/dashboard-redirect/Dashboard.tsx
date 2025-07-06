'use client';

import React, { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext';
import { Roles } from '@/context/AuthContext';
import SuperAdminDashboard from '@/components/admin/super-admin/Dashboard';
import AdminDashboard from '@/components/admin/admin/Dashboard';
import SuperUserDashboard from '@/components/admin/super-user/Dashboard'

function Dashboard() {

    const {user} = useAuth();
    if(user?.role == Roles.superAdmin) {
        return <SuperAdminDashboard></SuperAdminDashboard>
    } else if(user?.role == Roles.admin) {
        return <AdminDashboard></AdminDashboard>
    } else if(user?.role == Roles.superUser) {
        return <SuperUserDashboard></SuperUserDashboard>
    } else {
        <div>Loading...</div>
    }
}

export default Dashboard
