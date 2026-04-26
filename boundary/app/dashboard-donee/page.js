'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth } from '@/lib/auth';

export default function DoneeDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  function displayDoneePage() {
    const u = requireAuth('donee');
    if (u) setUser(u);
  }

  useEffect(() => {
    displayDoneePage();
  }, []);
  if (!user) return null;

  return (
    <>
      <Navbar role="Donee" username={user.name} />
      <div className="page-narrow">
        <div style={{ textAlign: 'center', margin: '3rem 0 2.5rem' }}>
          <h2>Donee Dashboard</h2>
          <p className="subfraName">
            Browse fundraising activities and track your donations.
          </p>
        </div>

        <div className="menu-grid">
          <div className="menu-card" onClick={() => router.push('/fra-donee')}>
            <div className="card-icon">🚀</div>
            <h3>Ongoing FRA</h3>
            <p>
              View, search and participate in ongoing fundraising activities.
            </p>
            <div className="card-arrow">→</div>
          </div>

          <div
            className="menu-card"
            // onClick={() => router.push('/fra-completed-donee')}
          >
            <div className="card-icon">⛳</div>
            <h3>Completed FRA</h3>
            <p>View and search completed fundraising activities.</p>
            <div className="card-arrow">→</div>
          </div>

          <div
            className="menu-card"
            // onClick={() => router.push('/favourite-list-management') }
          >
            <div className="card-icon">💛</div>
            <h3>My Favourite List</h3>
            <p>
              Create, view, update, suspend and search user accounts across all
              roles.
            </p>
            <div className="card-arrow">→</div>
          </div>
        </div>
      </div>
    </>
  );
}
