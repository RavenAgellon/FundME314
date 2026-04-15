'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth } from '@/lib/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  function displayUserAdminPage() {
    const u = requireAuth('user_admin');
    if (u) setUser(u);
  }

  useEffect(() => { displayUserAdminPage(); }, []);

  if (!user) return null;

  return (
    <>
      <Navbar role="User Admin" username={user.name} />
      <div className="page-narrow">
        <div style={{ textAlign: 'center', margin: '3rem 0 2.5rem' }}>
          <h2>Admin Dashboard</h2>
          <p className="subtitle">Select a management area to get started.</p>
        </div>

        <div className="menu-grid">
          <div className="menu-card" onClick={() => router.push('/user-account-management')}>
            <div className="card-icon">👤</div>
            <h3>User Account Management</h3>
            <p>Create, view, update, suspend and search user accounts across all roles.</p>
            <div className="card-arrow">→</div>
          </div>

          <div className="menu-card" onClick={() => router.push('/user-profile-management')}>
            <div className="card-icon">🪪</div>
            <h3>User Profile Management</h3>
            <p>View and manage user role profiles and their associated permissions.</p>
            <div className="card-arrow">→</div>
          </div>
        </div>
      </div>
    </>
  );
}