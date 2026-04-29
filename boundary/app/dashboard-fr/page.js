'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth } from '@/lib/auth';

export default function FundraiserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  function displayFundraiserPage() {
    const u = requireAuth('fundraiser');
    if (u) setUser(u);
  }

  useEffect(() => {
    displayFundraiserPage();
  }, []);

  if (!user) return null;

  return (
    <>
      <Navbar role="Fundraiser" username={user.name} />

      <div className="page-narrow">
        <div style={{ textAlign: 'center', margin: '3rem 0 2.5rem' }}>
          <h2>Fundraiser Dashboard</h2>
          <p className="subtitle">
            Manage your fundraising activities with ease.
          </p>
        </div>

        <div className="menu-grid">
          <div className="menu-card" onClick={() => router.push('/fra-fr')}>
            <div className="card-icon">🚀</div>
            <h3>Ongoing FRA</h3>
            <p>Create, view, edit, search and manage ongoing fundraising activities.</p>
            <div className="card-arrow">→</div>
          </div>

          <div
            className="menu-card"
            onClick={() => router.push('/fra-completed-fr')}
          >
            <div className="card-icon">⛳</div>
            <h3>Completed FRA</h3>
            <p>View and search completed fundraising activities.</p>
            <div className="card-arrow">→</div>
          </div>
        </div>
      </div>
    </>
  );
}