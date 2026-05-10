'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth, apiFetch } from '@/lib/auth';

const API_BASE = 'http://localhost:3000/api/fra';
const CAT_API_BASE = 'http://localhost:3000/api/fra-category';

async function createFRA(fra) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fra),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error creating FRA');
  return data.fra;
}

async function updateFRA(fraID, updates) {
  const res = await fetch(`${API_BASE}/${fraID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error updating FRA');
  return data.fra;
}

async function suspendFRA(fraID) {
  const res = await fetch(`${API_BASE}/${fraID}/suspend`, {
    method: 'PATCH',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Error updating FRA status');
  }

  return data;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  if (dateStr.length >= 10) return dateStr.slice(0, 10);
  return dateStr;
}

export default function FundraiserOngoingFRAPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [FRAs, setFRAs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [savedCounts, setSavedCounts] = useState({});
  const [viewCounts, setViewCounts] = useState({});
  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [selectedFRA, setSelectedFRA] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [category, setCategory] = useState('');
  const [target, setTarget] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const [creating, setCreating] = useState(false);

  function displayPage() {
    const u = requireAuth('fundraiser');
    if (u) setUser(u);
  }

  function getOngoingFRAs(fraList) {
    const today = new Date();

    return fraList.filter((fra) => new Date(fra.endDate || fra.end) >= today);
  }

  async function fetchSavedCounts() {
    try {
      const res = await apiFetch('/api/favourite-fra/counts', 'GET');
      const data = await res.json();

      const countMap = {};
      data.forEach((item) => {
        countMap[item.fraID] = item.savedCount;
      });

      setSavedCounts(countMap);
    } catch {
      setSavedCounts({});
    }
  }

  async function fetchViewCounts(fraList) {
    const viewMap = {};
    const promises = fraList.map(async (fra) => {
      try {
        const res = await fetch(`${API_BASE}/${fra.fraID}/views`);
        const data = await res.json();
        console.log(`View count for FRA ${fra.fraID}:`, data);
        viewMap[fra.fraID] = data;
      } catch (error) {
        console.error(
          `Failed to fetch view count for FRA ${fra.fraID}:`,
          error,
        );
        viewMap[fra.fraID] = 0;
      }
    });
    await Promise.all(promises);
    setViewCounts(viewMap);
  }

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch(`${CAT_API_BASE}/search`);
      const data = await res.json();

      const categoryList = Array.isArray(data) ? data : [];
      setCategories(categoryList.filter((cat) => !cat.suspended));
    } catch {
      setCategories([]);
    }
  }, []);

  const loadFRAs = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}`);
      const data = await res.json();

      const allFRAs = data.fraList || data || [];
      setFRAs(getOngoingFRAs(allFRAs));

      await fetchSavedCounts();
      await fetchViewCounts(allFRAs);
    } catch {
      setFRAs([]);
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
    if (showForm || showDetails) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => document.body.classList.remove('modal-open');
  }, [showForm, showDetails]);

  async function fetchSavedCounts() {
    try {
      const res = await apiFetch('/api/favourite-fra/counts', 'GET');
      const data = await res.json();

      const countMap = {};
      data.forEach((item) => {
        countMap[item.fraID] = item.savedCount;
      });

      setSavedCounts(countMap);
    } catch {
      setSavedCounts({});
    }
  }

  async function fetchViewCounts(fraList) {
    const viewMap = {};
    const promises = fraList.map(async (fra) => {
      try {
        const res = await fetch(`${API_BASE}/${fra.fraID}/views`);
        const data = await res.json();
        console.log(`View count for FRA ${fra.fraID}:`, data);
        viewMap[fra.fraID] = data;
      } catch (error) {
        console.error(
          `Failed to fetch view count for FRA ${fra.fraID}:`,
          error,
        );
        viewMap[fra.fraID] = 0;
      }
    });
    await Promise.all(promises);
    setViewCounts(viewMap);
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

      setFRAs(getOngoingFRAs(searchedFRAs));
      await fetchSavedCounts();
      await fetchViewCounts(searchedFRAs);
    } catch {
      setFRAs([]);
      setErrorMsg('Failed to search FRA');
    } finally {
      setLoading(false);
    }
  }

  function getCategoryDescription(catName) {
    const selectedCategory = categories.find((cat) => cat.catName === catName);
    return selectedCategory?.description || '—';
  }

  function handleCategoryChange(catName) {
    setCategory(catName);
    setCategoryDesc(getCategoryDescription(catName));
  }

  function openForm() {
    setShowForm(true);
    setShowDetails(false);
    setEditingId(null);

    setTitle('');
    setDesc('');
    setCategory('');
    setCategoryDesc('');
    setTarget('');
    setStart('');
    setEnd('');

    setErrorMsg('');
  }

  function openEditForm(fra) {
    setShowForm(true);
    setShowDetails(false);

    setEditingId(fra.fraID || fra.id);
    setTitle(fra.fraName || fra.title || '');
    setDesc(fra.description || '');
    setCategory(fra.category || '');
    setCategoryDesc(getCategoryDescription(fra.category));

    setTarget(fra.targetAmount?.toString() || fra.target?.toString() || '');
    setStart(formatDate(fra.startDate || fra.start));
    setEnd(formatDate(fra.endDate || fra.end));

    setErrorMsg('');
  }

  function openDetails(fra) {
    setSelectedFRA(fra);
    setShowDetails(true);
    setShowForm(false);
    setErrorMsg('');
  }

  function closeDetails() {
    setSelectedFRA(null);
    setShowDetails(false);
  }

  async function handleCreate(e) {
    e.preventDefault();

    setCreating(true);
    setErrorMsg('');

    const fraData = {
      fraName: title,
      description: desc,
      category,
      targetAmount: Number(target),
      startDate: start,
      endDate: end,
    };

    try {
      if (editingId !== null) {
        await updateFRA(editingId, fraData);
        setSuccessMsg('FRA updated');
      } else {
        await createFRA(fraData);
        setSuccessMsg('FRA created');
      }

      await loadFRAs();

      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      setErrorMsg(error.message);
    }

    setCreating(false);
    setTimeout(() => setSuccessMsg(''), 2200);
  }
  async function handleSuspendToggle(id) {
    setErrorMsg('');

    try {
      const result = await suspendFRA(id);

      setSuccessMsg(result.message);

      await loadFRAs();

      setTimeout(() => setSuccessMsg(''), 2200);
    } catch (error) {
      setErrorMsg(error.message);
    }
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setErrorMsg('');
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

        <h2>Ongoing Fundraising Activities</h2>
        <p className="subtitle">
          Create, search, view and manage ongoing fundraising activities.
        </p>

        {successMsg && (
          <div className="alert success" style={{ marginBottom: 16 }}>
            {successMsg}
          </div>
        )}

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

          <button className="btn-primary" onClick={openForm}>
            ➕ New Fundraising Activity
          </button>
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
                    No ongoing fundraising activities.
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
                          style={
                            fra.suspended
                              ? {
                                  color: 'var(--error)',
                                  fontSize: '0.8rem',
                                  textTransform: 'uppercase',
                                }
                              : {
                                  color: 'var(--success)',
                                  fontSize: '0.8rem',
                                  textTransform: 'uppercase',
                                }
                          }
                        >
                          {fra.suspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      <td>{savedCounts[fraID] || 0}</td>
                      <td>{viewCounts[fraID] || 0}</td>

                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="action-btn btn-edit"
                          onClick={() => openEditForm(fra)}
                        >
                          Edit
                        </button>

                        <button
                          className="action-btn btn-suspend"
                          onClick={() => handleSuspendToggle(fraID)}
                        >
                          {fra.suspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div
          className="modal-overlay active"
          onClick={(e) => e.target === e.currentTarget && handleCancel()}
        >
          <div className="modal" style={{ maxWidth: 540 }}>
            <h3 style={{ marginBottom: '1.25rem' }}>
              {editingId !== null
                ? 'Edit Fundraising Activity'
                : 'Create Fundraising Activity'}
            </h3>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.catName} value={cat.catName}>
                      {cat.catName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Category Description</label>
                <textarea
                  value={categoryDesc}
                  readOnly
                  placeholder="Category description will appear here"
                />
              </div>

              <div className="form-group">
                <label>FRA Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Target Amount</label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  required
                />
              </div>

              <div
                className="modal-actions"
                style={{ justifyContent: 'space-between' }}
              >
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={creating}
                >
                  {creating
                    ? editingId !== null
                      ? 'Updating...'
                      : 'Creating...'
                    : editingId !== null
                      ? 'Update'
                      : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  value: selectedFRA.suspended ? 'Suspended' : 'Active',
                },
                {
                  label: 'Saved Count',
                  value: savedCounts[selectedFRA.fraID || selectedFRA.id] || 0,
                },
                {
                  label: 'View Count',
                  value: selectedFRA.viewCount || 0,
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

              {!selectedFRA.suspended && (
                <button
                  className="btn-primary"
                  onClick={() => openEditForm(selectedFRA)}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
