'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth, apiFetch } from '@/lib/auth';

// ========== API ENDPOINT ==========
const API_BASE = 'http://localhost:3000/api/fra';

// ========== API HELPERS ==========
async function createFRA(fra) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fra),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Error creating FRA');
  }

  return data.fra;
}

async function updateFRA(fraID, updates) {
  const res = await fetch(`${API_BASE}/${fraID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Error updating FRA');
  }

  return data.fra;
}

async function suspendFRA(fraID) {
  const res = await fetch(`${API_BASE}/${fraID}/suspend`, {
    method: 'PATCH',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Error suspending FRA');
  }

  return data.fra;
}

async function unsuspendFRA(fraID) {
  const res = await fetch(`${API_BASE}/${fraID}/unsuspend`, {
    method: 'PATCH',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Error unsuspending FRA');
  }

  return data.fra;
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

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [selectedFRA, setSelectedFRA] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [target, setTarget] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const u = requireAuth('fundraiser');

    if (u) {
      setUser(u);
      loadFRAs();
    }
  }, []);

  useEffect(() => {
    if (showForm || showDetails) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => document.body.classList.remove('modal-open');
  }, [showForm, showDetails]);

  function getOngoingFRAs(fraList) {
    const today = new Date();

    return fraList.filter(
      (fra) => new Date(fra.endDate || fra.end) >= today,
    );
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

  async function loadFRAs() {
    setLoading(true);

    try {
      // Use backend route same as donee pages
      const res = await fetch(`${API_BASE}`);
      const data = await res.json();

      const allFRAs = data.fraList || data || [];
      setFRAs(getOngoingFRAs(allFRAs));

      await fetchSavedCounts();
    } catch {
      setFRAs([]);
    } finally {
      setLoading(false);
    }
  }

  async function searchFRA() {
    // If search box is empty, just load all ongoing FRAs
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
    } catch {
      setFRAs([]);
      setErrorMsg('Failed to search FRA');
    } finally {
      setLoading(false);
    }
  }

  function openForm() {
    setShowForm(true);
    setShowDetails(false);
    setEditingId(null);

    setTitle('');
    setDesc('');
    setCategory('');
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
    setTarget(
      fra.targetAmount?.toString() || fra.target?.toString() || '',
    );
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

  async function handleSuspend(id) {
    setErrorMsg('');

    try {
      await suspendFRA(id);
      await loadFRAs();
    } catch (error) {
      setErrorMsg(error.message);
    }
  }

  async function handleUnsuspend(id) {
    setErrorMsg('');

    try {
      await unsuspendFRA(id);
      await loadFRAs();
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
            <button
              className="btn-primary"
              onClick={searchFRA}
            >
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
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="loading-cell">
                    Loading...
                  </td>
                </tr>
              ) : FRAs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
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
                        $ {(fra.targetAmount || fra.target || 0).toLocaleString()}
                      </td>

                      <td>{formatDate(fra.endDate || fra.end)}</td>

                      <td>
                        <span
                          style={{
                            background: fra.suspended
                              ? 'rgba(240,112,112,0.15)'
                              : 'rgba(201,168,76,0.15)',
                            color: fra.suspended ? '#f07070' : '#C9A84C',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {fra.suspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      <td>{savedCounts[fraID] || 0}</td>

                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="action-btn btn-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditForm(fra);
                            }}
                            disabled={fra.suspended}
                          >
                            Edit
                          </button>

                          {fra.suspended ? (
                            <button
                              className="action-btn btn-edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnsuspend(fraID);
                              }}
                            >
                              Unsuspend
                            </button>
                          ) : (
                            <button
                              className="action-btn btn-suspend"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSuspend(fraID);
                              }}
                            >
                              Suspend
                            </button>
                          )}
                        </div>
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
        <div className="modal-overlay active">
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
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
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
        <div className="modal-overlay active">
          <div className="modal" style={{ maxWidth: 540 }}>
            <h3 style={{ marginBottom: '1.25rem' }}>
              Fundraising Activity Details
            </h3>

            <div className="form-group">
              <label>FRA ID</label>
              <p>{selectedFRA.fraID || selectedFRA.id}</p>
            </div>

            <div className="form-group">
              <label>Name</label>
              <p>{selectedFRA.fraName || selectedFRA.title}</p>
            </div>

            <div className="form-group">
              <label>Category</label>
              <p>{selectedFRA.category || '-'}</p>
            </div>

            <div className="form-group">
              <label>Description</label>
              <p>{selectedFRA.description || '-'}</p>
            </div>

            <div className="form-group">
              <label>Target Amount</label>
              <p>
                $ {(selectedFRA.targetAmount || selectedFRA.target || 0).toLocaleString()}
              </p>
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <p>{formatDate(selectedFRA.startDate || selectedFRA.start)}</p>
            </div>

            <div className="form-group">
              <label>End Date</label>
              <p>{formatDate(selectedFRA.endDate || selectedFRA.end)}</p>
            </div>

            <div className="form-group">
              <label>Status</label>
              <p>{selectedFRA.suspended ? 'Suspended' : 'Active'}</p>
            </div>

            <div className="form-group">
              <label>Saved Count</label>
              <p>{savedCounts[selectedFRA.fraID || selectedFRA.id] || 0}</p>
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