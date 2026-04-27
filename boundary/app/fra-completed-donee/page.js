'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth, apiFetch } from '@/lib/auth';

export default function DoneeCompletedFRAPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [FRAs, setFRAs] = useState([]);
  const [savedFRAs, setSavedFRAs] = useState([]);
  const [detailFRA, setDetailFRA] = useState(null);
  const [isSelectedFRASaved, setIsSelectedFRASaved] = useState(false);

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
      const res = await apiFetch('/api/fra/completed', 'GET');
      const data = await res.json();

      const sorted = sortByFRAID(data || []);

      setFRAs(sorted);
      await fetchSavedFRAs(sorted);
    } catch {
      setFRAs([]);
      setSavedFRAs([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSavedFRAs(fraList = FRAs) {
    try {
      const res = await apiFetch('/api/favourite-fra/view', 'GET');
      const data = await res.json();

      if (!Array.isArray(fraList)) {
        return;
      }

      const saved = [];

      if (Array.isArray(data)) {
        fraList.map((fra) => {
          const found = data.find((savedFRA) => fra.fraID === savedFRA.fraID)
            ? true
            : false;
          saved.push(found);
        });
      }

      setSavedFRAs(saved);
    } catch {
      setSavedFRAs([]);
    }
  }

  async function saveFRA(fraID) {
    if (
      !confirm(
        `Are you sure you want to ${isSelectedFRASaved ? 'remove' : 'save'} this FRA ${isSelectedFRASaved ? 'from' : 'to'} your favourite list?`,
      )
    )
      return;

    const selectedFRAIndex = FRAs.findIndex(
      (FRA) => FRA.fraID === detailFRA.fraID,
    );

    // Delete FRA from favourite list
    if (isSelectedFRASaved) {
      try {
        const res = await apiFetch(`/api/favourite-fra/${fraID}`, 'DELETE');
        const data = await res.json();
        setIsSelectedFRASaved(false);

        const newState = [...savedFRAs];
        newState[selectedFRAIndex] = false;

        setSavedFRAs(newState);
        alert(data.message);
      } catch {
        alert('Failed to delete FRA from favourite list.');
      }
    } else {
      // Save FRA to favourite list
      try {
        const res = await apiFetch(`/api/favourite-fra/${fraID}`, 'POST');
        const data = await res.json();

        setIsSelectedFRASaved(true);

        const newState = [...savedFRAs];
        newState[selectedFRAIndex] = true;

        setSavedFRAs(newState);
        alert(data.message);
      } catch {
        alert('Failed to save FRA to favourite list.');
      }
    }
  }

  function badgeStyle(status) {
    const map = { not_saved: '#C9A84C', saved: '#C896DC' };
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
        <h2>Completed Fundraising Activities</h2>
        <p className="subtitle">
          View and search completed fundraising activities.
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>FRA ID</th>
                <th>Name</th>
                <th>Target Amount</th>
                <th>Deadline</th>
                <th>Favourite</th>
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
                FRAs.map((FRA, index) => (
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
                          setIsSelectedFRASaved(savedFRAs[index]);
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
                    <td>{`${getDaysPassed(FRA.endDate)} days ago`}</td>
                    <td>
                      <span
                        style={badgeStyle(
                          savedFRAs[index] ? 'saved' : 'not_saved',
                        )}
                      >
                        {savedFRAs[index] ? 'Saved' : 'Not Saved'}
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
                className={`action-btn ${isSelectedFRASaved ? 'btn-suspend' : 'btn-unsuspend'}`}
                onClick={() => saveFRA(detailFRA.fraID)}
              >
                {isSelectedFRASaved
                  ? 'Remove from Favourite List'
                  : 'Save to Favourite List'}
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
