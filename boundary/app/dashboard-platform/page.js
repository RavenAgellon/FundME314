'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth } from '@/lib/auth';

export default function PlatformDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  function displayPlatformManagementPage() {
    const u = requireAuth('platform_management');
    if (u) setUser(u);
  }

  useEffect(() => {
    displayPlatformManagementPage();
  }, []);
  if (!user) return null;

  return (
    <>
      <Navbar role="Platform Mgmt" username={user.name} />
      <div className="page">
        <h2>Platform Management</h2>
        <p className="subtitle">
          Manage FRA categories, reports and platform-wide settings.
        </p>

        <div className="menu-grid">
          <div
            className="menu-card"
            // onClick={() => router.push('/fra-category-management')}
          >
            <div className="card-icon">🗂️</div>
            <h3>FRA Category Management</h3>
            <p>
              Create, view, update, suspend and search Fundraising Activity
              categories.
            </p>
            <div className="card-arrow">→</div>
          </div>

          <div
            className="menu-card"
            // onClick={() => router.push('/report-management')}
          >
            <div className="card-icon">🧾</div>
            <h3>Report Management</h3>
            <p>Generate daily/weekly/monthly reports on platform activities.</p>
            <div className="card-arrow">→</div>
          </div>
        </div>
      </div>
    </>
  );
}
