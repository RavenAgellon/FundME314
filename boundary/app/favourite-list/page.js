'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth, apiFetch } from '@/lib/auth';

export default function FavouriteListPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [FRAs, setFRAs] = useState([]);
  const [search, setSearch] = useState('');
  const [detailFRA, setDetailFRA] = useState(null);

  function displayDoneePage() {
    const u = requireAuth('donee');
    if (u) {
      setUser(u);
      viewFRAs();
    }
  }

  useEffect(() => {
    displayDoneePage();
  }, []);

  async function viewFRAs() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/favourite-fra/view', 'GET');
      const data = await res.json();

      setFRAs(sortByFRAID(data));
    } catch {
      setFRAs([]);
    } finally {
      setLoading(false);
    }
  }

  async function searchFRA() {
    // If search box is empty, just load all saved FRAs
    if (!search.trim()) {
      viewFRAs();
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch(
        '/api/favourite-fra/search?search=' + encodeURIComponent(search),
        'GET',
      );
      const data = await res.json();
      setFRAs(sortByFRAID(data || []));
    } catch {
      setFRAs([]);
    } finally {
      setLoading(false);
    }
  }

  async function removeSavedFRA(fraID) {
    if (
      !confirm(
        `Are you sure you want to remove this FRA from your favourite list?`,
      )
    )
      return;

    try {
      const res = await apiFetch(`/api/favourite-fra/${fraID}`, 'DELETE');
      const data = await res.json();

      setFRAs((prevFRAs) => prevFRAs.filter((fra) => fra.fraID !== fraID));
      setDetailFRA(null);

      alert(data.message);
    } catch {
      alert('Failed to delete FRA from favourite list.');
    }
  }

  function badgeStyle(status) {
    const map = { ongoing: '#C9A84C', completed: '#C896DC' };
    const color = map[status] || '#9999BB';
    return {
      background: `${color}22`,
      color,
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '0.7rem',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    };
  }

  function sortByFRAID(list) {
    return [...list].sort(
      (a, b) => (Number(a.fraID) || 0) - (Number(b.fraID) || 0),
    );
  }

  // For ongoing FRAs
  function getDaysLeft(endDate) {
    const today = new Date();
    const deadline = new Date(endDate);

    const diff = deadline.getTime() - today.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return daysLeft;
  }

  // For completed FRAs
  function getDaysPassed(endDate) {
    const today = new Date();
    const deadline = new Date(endDate);

    const diff = today.getTime() - deadline.getTime();
    const daysPassed = Math.floor(diff / (1000 * 60 * 60 * 24));

    return daysPassed;
  }

  if (!user) return null;

  return (
    <>
      <Navbar role="Donee" username={user.name} />
      <div className="page">
        <span
          className="back-link"
          onClick={() => router.push('/dashboard-donee')}
        >
          ← Back to Dashboard
        </span>
        <h2>My Favourite List</h2>
        <p className="subtitle">
          Manage favourite FRAs to keep track of the progress.
        </p>

        <div className="toolbar">
          <div className="search-wrap" style={{ display: 'flex' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchFRA()}
              placeholder="Search by FRA name"
            />
            <button
              className="btn-primary"
              onClick={searchFRA}
              style={{ marginLeft: '1rem' }}
            >
              Search
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>FRA ID</th>
                <th>Name</th>
                <th>Target Amount</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="loading-cell">
                    Loading...
                  </td>
                </tr>
              ) : FRAs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-state">
                    No FRAs found.
                  </td>
                </tr>
              ) : (
                FRAs.map((FRA) => (
                  <tr key={FRA.fraID}>
                    <td>
                      <code
                        style={{ color: 'var(--gold)', fontSize: '0.8rem' }}
                      >
                        {FRA.fraID || '—'}
                      </code>
                    </td>
                    <td>
                      <span
                        onClick={() => {
                          setDetailFRA(FRA);
                        }}
                        style={{
                          cursor: 'pointer',
                          color: 'var(--text)',
                          borderBottom: '1px dashed var(--muted)',
                          paddingBottom: '1px',
                        }}
                      >
                        {FRA.fraName || '—'}
                      </span>
                    </td>
                    <td>
                      <span>$ {FRA.targetAmount.toLocaleString() || '—'}</span>
                    </td>
                    <td>{`${new Date(FRA.endDate) >= new Date() ? getDaysLeft(FRA.endDate) : getDaysPassed(FRA.endDate)} days ${new Date(FRA.endDate) >= new Date() ? 'left' : 'ago'}`}</td>
                    <td>
                      <span
                        style={badgeStyle(
                          new Date(FRA.endDate) >= new Date()
                            ? 'ongoing'
                            : 'completed',
                        )}
                      >
                        {getDaysLeft(FRA.endDate) > 0 ? 'Ongoing' : 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailFRA && (
        <div
          className="modal-overlay active"
          onClick={(e) => e.target === e.currentTarget && setDetailFRA(null)}
        >
          <div className="modal">
            <h3>FRA Details</h3>

            <div
              style={{
                display: 'grid',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              {[
                { label: 'FRA ID', value: detailFRA.fraID },
                { label: 'Name', value: detailFRA.fraName || '—' },
                {
                  label: 'Target Amount',
                  value: `$ ${detailFRA.targetAmount.toLocaleString()}` || '—',
                },
                {
                  label: 'Start Date',
                  value: new Date(detailFRA.startDate).toLocaleDateString(),
                },
                {
                  label: 'End Date',
                  value:
                    new Date(detailFRA.endDate).toLocaleDateString() || '—',
                },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    paddingBottom: '0.6rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      fontWeight: 500,
                    }}
                  >
                    {row.label}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button
                className={'action-btn btn-suspend'}
                onClick={() => removeSavedFRA(detailFRA.fraID)}
              >
                Remove from Favourite List
              </button>
              <button className="btn-cancel" onClick={() => setDetailFRA(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
