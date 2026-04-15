'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { requireAuth } from '@/lib/auth';

export default function FRDashboard() {
  const [user, setUser] = useState(null);

  function displayFRPage() {
    const u = requireAuth('fundraiser');
    if (u) setUser(u);
  }

  useEffect(() => { displayFRPage(); }, []);
  if (!user) return null;

  return (
    <>
      <Navbar role="Fundraiser" username={user.name} />
      <div className="page">
        <h2>Fundraiser Dashboard</h2>
        <p className="subtitle">Manage your fundraising activities and track performance.</p>
      </div>
    </>
  );
}