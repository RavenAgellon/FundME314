'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth } from '@/lib/auth';

// ========== API ENDPOINT ==========
const API_BASE = 'http://localhost:3000/api/fra';

function formatDate(dateStr) {
  if (!dateStr) return '';
  if (dateStr.length >= 10) return dateStr.slice(0, 10);
  return dateStr;
}

export default function FundraiserCompletedFRAPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [FRAs, setFRAs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [selectedFRA, setSelectedFRA] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  function displayPage() {
    const u = requireAuth('fundraiser');
    if (u) setUser(u);
  }

  useEffect(() => {
    displayPage();
    loadFRAs();
  }, []);

  useEffect(() => {
    if (showDetails) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => document.body.classList.remove('modal-open');
  }, [showDetails]);

  function getCompletedFRAs(fraList) {
    const today = new Date();

    return fraList.filter((fra) => new Date(fra.endDate || fra.end) < today);
  }

  async function loadFRAs() {
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}`);
      const data = await res.json();

      const allFRAs = data.fraList || data || [];
      setFRAs(getCompletedFRAs(allFRAs));
    } catch {
      setFRAs([]);
    } finally {
      setLoading(false);
    }
  }

  async function searchFRA() {
    if (!search.trim()) {
      loadFRAs();
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(
        `${API_BASE}/search?fraName=${encodeURIComponent(search)}`,
      );

      const data = await res.json();
      const searchedFRAs = data.fraList || data || [];

      setFRAs(getCompletedFRAs(searchedFRAs));
    } catch {
      setFRAs([]);
      setErrorMsg('Failed to search FRA');
    } finally {
      setLoading(false);
    }
  }

  function openDetails(fra) {
    setSelectedFRA(fra);
    setShowDetails(true);
    setErrorMsg('');
  }

  function closeDetails() {
    setSelectedFRA(null);
    setShowDetails(false);
  }

  if (!user) return null;

  return (
    <>
      <Navbar role="Fundraiser" username={user.name} />

      <div className="page">
        <span
          className="back-link"
          onClick={() => router.push('/dashboard-fr')}
        >
          ← Back to Dashboard
        </span>

        <h2>Completed Fundraising Activities</h2>
        <p className="subtitle">
          View and search completed fundraising activities.
        </p>

        {errorMsg && (
          <div className="alert error" style={{ marginBottom: 16 }}>
            {errorMsg}
          </div>
        )}

        <div className="toolbar" style={{ marginBottom: '2rem' }}>
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
                <th>Completed Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="loading-cell">
                    Loading...
                  </td>
                </tr>
              ) : FRAs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No completed fundraising activities.
                  </td>
                </tr>
              ) : (
                FRAs.map((fra) => {
                  const fraID = fra.fraID || fra.id;

                  return (
                    <tr
                      key={fraID}
                      onClick={() => openDetails(fra)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <code
                          style={{
                            color: 'var(--gold)',
                            fontSize: '0.8rem',
                          }}
                        >
                          {fraID}
                        </code>
                      </td>

                      <td>{fra.fraName || fra.title}</td>

                      <td>
                        ${' '}
                        {(fra.targetAmount || fra.target || 0).toLocaleString()}
                      </td>

                      <td>{formatDate(fra.endDate || fra.end)}</td>

                      <td>
                        <span
                          style={{
                            background: 'rgba(120,120,120,0.15)',
                            color: '#bdbdbd',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          Completed
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetails && selectedFRA && (
        <div
          className="modal-overlay active"
          onClick={(e) => e.target === e.currentTarget && closeDetails()}
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
                { label: 'FRA ID', value: selectedFRA.fraID || selectedFRA.id },
                {
                  label: 'Name',
                  value: selectedFRA.fraName || selectedFRA.title || '—',
                },
                {
                  label: 'Category',
                  value: selectedFRA.category || '—',
                },
                {
                  label: 'Category Description',
                  value: selectedFRA.categoryDescription || '—',
                  long: true,
                },
                {
                  label: 'FRA Description',
                  value: selectedFRA.description || '—',
                  long: true,
                },
                {
                  label: 'Target Amount',
                  value: `$ ${(selectedFRA.targetAmount || selectedFRA.target || 0).toLocaleString()}`,
                },
                {
                  label: 'Start Date',
                  value: formatDate(selectedFRA.startDate || selectedFRA.start),
                },
                {
                  label: 'End Date',
                  value: formatDate(selectedFRA.endDate || selectedFRA.end),
                },
                { label: 'Status', value: 'Completed' },
                { label: 'View Count', value: selectedFRA.viewCount || 0 },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: row.long ? 'flex-start' : 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    paddingBottom: '0.6rem',
                    gap: '1rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      fontWeight: 500,
                      display: 'block',
                      marginBottom: 0,
                      flex: '0 0 38%',
                      minWidth: '140px',
                    }}
                  >
                    {row.label}
                  </span>

                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text)',
                      textAlign: 'right',
                      maxWidth: '60%',
                      lineHeight: 1.5,
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                      display: 'block',
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="modal-actions"
              style={{ justifyContent: 'flex-end' }}
            >
              <button className="btn-cancel" onClick={closeDetails}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
