'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { requireAuth } from '@/lib/auth';

export default function DoneeDashboard() {
  const [user, setUser] = useState(null);

  function displayDoneePage() {
    const u = requireAuth('donee');
    if (u) setUser(u);
  }

  useEffect(() => { displayDoneePage(); }, []);
  if (!user) return null;

  return (
    <>
      <Navbar role="Donee" username={user.name} />
      <div className="page">
        <h2>Donee Dashboard</h2>
        <p className="subtitle">Browse fundraising activities and track your donations.</p>
      </div>
    </>
  );
}