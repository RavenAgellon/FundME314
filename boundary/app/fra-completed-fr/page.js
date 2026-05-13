'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth, apiFetch } from '@/lib/auth';

const API_BASE = 'http://localhost:3000/api/fra';
const CAT_API_BASE = 'http://localhost:3000/api/fra-category';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return String(dateStr).slice(0, 10);
}

function getFRAId(fra) {
  return fra.fraID || fra.id || fra._id;
}

function sortByFRAID(fraList) {
  return [...fraList].sort(
    (a, b) => Number(getFRAId(a)) - Number(getFRAId(b)),
  );
}

function getCompletedFRAs(fraList) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return fraList.filter((fra) => {
    const endDateValue = fra.endDate || fra.end;
    if (!endDateValue) return false;

    const endDate = new Date(endDateValue);
    endDate.setHours(0, 0, 0, 0);

    return endDate < today;
  });
}

function extractFRAList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.fraList)) return data.fraList;
  if (Array.isArray(data.fras)) return data.fras;
  if (data.fra) return [data.fra];
  if (data.FRA) return [data.FRA];
  if (data.fraData) return [data.fraData];
  if (data.fraID || data._id || data.id) return [data];

  return [];
}

export default function FundraiserCompletedFRAPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [FRAs, setFRAs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [savedCounts, setSavedCounts] = useState({});
  const [viewCounts, setViewCounts] = useState({});
  const [categories, setCategories] = useState([]);

  const [selectedFRA, setSelectedFRA] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  function displayPage() {
    const u = requireAuth('fundraiser');
    if (u) setUser(u);
  }

  async function fetchSavedCounts() {
    try {
      const res = await apiFetch('/api/favourite-fra/counts', 'GET');
      const data = await res.json();

      const countMap = {};

      if (Array.isArray(data)) {
        data.forEach((item) => {
          countMap[item.fraID] = item.savedCount || 0;
        });
      }

      setSavedCounts(countMap);
    } catch {
      setSavedCounts({});
    }
  }

  async function fetchViewCounts(fraList) {
    const viewMap = {};

    await Promise.all(
      fraList.map(async (fra) => {
        const fraID = getFRAId(fra);

        try {
          const res = await fetch(`${API_BASE}/${fraID}/views`);
          const data = await res.json();

          viewMap[fraID] = Number(data) || 0;
        } catch {
          viewMap[fraID] = fra.viewCount || 0;
        }
      }),
    );

    setViewCounts(viewMap);
  }

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch(`${CAT_API_BASE}/search`);
      const data = await res.json();

      const categoryList = Array.isArray(data) ? data : [];
      setCategories(categoryList);
    } catch {
      setCategories([]);
    }
  }, []);

  const loadFRAs = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    setIsSearchMode(false);

    try {
      let res = await fetch(`${API_BASE}/fundraiser/view`);
      let data = await res.json();

      if (!res.ok) {
        res = await fetch(`${API_BASE}/fundraiser/all`);
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load completed FRAs');
      }

      const fraList = extractFRAList(data);
      const completedFRAs = sortByFRAID(getCompletedFRAs(fraList));

      setFRAs(completedFRAs);
      setCurrentIndex(0);

      await fetchSavedCounts();
      await fetchViewCounts(completedFRAs);
    } catch (error) {
      setFRAs([]);
      setCurrentIndex(0);
      setErrorMsg(error.message || 'Failed to load completed FRAs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    displayPage();
    loadFRAs();
    loadCategories();
  }, [loadFRAs, loadCategories]);

  useEffect(() => {
    if (showDetails) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => document.body.classList.remove('modal-open');
  }, [showDetails]);

  async function searchFRA() {
    if (!search.trim()) {
      loadFRAs();
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setIsSearchMode(true);

    try {
      const res = await fetch(
        `${API_BASE}/fundraiser/search?fraName=${encodeURIComponent(search)}`,
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to search completed FRA');
      }

      const searchedFRAs = extractFRAList(data);
      const completedFRAs = sortByFRAID(getCompletedFRAs(searchedFRAs));

      setFRAs(completedFRAs);
      setCurrentIndex(0);

      await fetchSavedCounts();
      await fetchViewCounts(completedFRAs);
    } catch (error) {
      setFRAs([]);
      setCurrentIndex(0);
      setErrorMsg(error.message || 'Failed to search completed FRA');
    } finally {
      setLoading(false);
    }
  }

  function getCategoryDescription(catName) {
    const selectedCategory = categories.find((cat) => cat.catName === catName);
    return selectedCategory?.description || '—';
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

  function goPrevious() {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }

  function goNext() {
    setCurrentIndex((prev) => Math.min(prev + 1, FRAs.length - 1));
  }

  function renderFRARow(fra) {
    const fraID = getFRAId(fra);

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
              color: 'var(--success)',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
            }}
          >
            Completed
          </span>
        </td>

        <td>{savedCounts[fraID] || 0}</td>
        <td>{viewCounts[fraID] || 0}</td>

        <td onClick={(e) => e.stopPropagation()}>
          <button
            className="action-btn btn-edit"
            onClick={() => openDetails(fra)}
          >
            View
          </button>
        </td>
      </tr>
    );
  }

  const displayedFRA = FRAs[currentIndex];

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

        <div
          className="toolbar"
          style={{
            marginBottom: '2rem',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div className="search-wrap" style={{ display: 'flex' }}>
            <span className="search-icon">🔍</span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchFRA()}
              placeholder="Search by FRA name"
            />

            <button className="btn-primary" onClick={searchFRA}>
              Search
            </button>
          </div>
        </div>

        {!isSearchMode && FRAs.length > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <span className="subtitle">
              Showing FRA {currentIndex + 1} of {FRAs.length}
            </span>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn-cancel"
                onClick={goPrevious}
                disabled={currentIndex === 0}
              >
                Previous
              </button>

              <button
                className="btn-primary"
                onClick={goNext}
                disabled={currentIndex === FRAs.length - 1}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {isSearchMode && FRAs.length > 0 && (
          <p className="subtitle" style={{ marginBottom: '1rem' }}>
            Showing {FRAs.length} search result{FRAs.length === 1 ? '' : 's'}
          </p>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>FRA ID</th>
                <th>Name</th>
                <th>Target Amount</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Saved</th>
                <th>Views</th>
                <th>Actions</th>
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
                    No completed fundraising activities.
                  </td>
                </tr>
              ) : isSearchMode ? (
                FRAs.map((fra) => renderFRARow(fra))
              ) : (
                renderFRARow(displayedFRA)
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
            <h3>Completed FRA Details</h3>

            <div
              style={{
                display: 'grid',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              {[
                { label: 'FRA ID', value: getFRAId(selectedFRA) },
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
                  value: getCategoryDescription(selectedFRA.category),
                },
                {
                  label: 'FRA Description',
                  value: selectedFRA.description || '—',
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
                {
                  label: 'Status',
                  value: 'Completed',
                },
                {
                  label: 'Saved Count',
                  value: savedCounts[getFRAId(selectedFRA)] || 0,
                },
                {
                  label: 'View Count',
                  value: viewCounts[getFRAId(selectedFRA)] || 0,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
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
                      minWidth: '140px',
                      flexShrink: 0,
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
              style={{ justifyContent: 'space-between' }}
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