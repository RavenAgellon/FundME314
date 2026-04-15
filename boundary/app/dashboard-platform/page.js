'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { requireAuth } from '@/lib/auth';

export default function PlatformDashboard() {
  const [user, setUser] = useState(null);

  function displayPlatformManagementPage() {
    const u = requireAuth('platform_management');
    if (u) setUser(u);
  }

  useEffect(() => { displayPlatformManagementPage(); }, []);
  if (!user) return null;

  return (
    <>
      <Navbar role="Platform Mgmt" username={user.name} />
      <div className="page">
        <h2>Platform Management</h2>
        <p className="subtitle">Manage FSA categories, reports and platform-wide settings.</p>
      </div>
    </>
  );
}