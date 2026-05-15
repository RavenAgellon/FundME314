'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth, apiFetch } from '@/lib/auth';

const CAT_API_BASE = 'http://localhost:3000/api/fra-category';

export default function FundraiserOngoingFRAPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [FRAs, setFRAs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedFRA, setSelectedFRA] = useState(null);
  const [categories, setCategories] = useState([]);
  const [savedCounts, setSavedCounts] = useState({});
  const [viewCounts, setViewCounts] = useState({});

  const [showForm, setShowForm] = useState(false);
  const [editingFRA, setEditingFRA] = useState(null);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [target, setTarget] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  function displayPage() {
    const u = requireAuth('fundraiser');

    if (u) {
      setUser(u);
      viewFRAs();
      loadCategories();
    }
  }

  useEffect(() => {
    displayPage();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch(`${CAT_API_BASE}/search`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  }

  function getCategoryDescription(catName) {
    const selectedCategory = categories.find((cat) => cat.catName === catName);
    return selectedCategory?.description || '—';
  }

  function sortByFRAID(list) {
    return [...list].sort(
      (a, b) => (Number(a.fraID) || 0) - (Number(b.fraID) || 0),
    );
  }

  function getDaysLeft(endDate) {
    const today = new Date();
    const deadline = new Date(endDate);
    const diff = deadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function getFRAList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.fraList)) return data.fraList;
    if (Array.isArray(data.fras)) return data.fras;
    if (data.fra) return [data.fra];
    return [];
  }

  async function viewFRAs() {
    setLoading(true);

    try {
      const res = await apiFetch('/api/fra/view', 'GET');
      const data = await res.json();

      const ongoingFRAs = sortByFRAID(
        getFRAList(data).filter((fra) => new Date(fra.endDate) >= new Date()),
      );

      setFRAs(ongoingFRAs);
      await fetchSavedCounts();
      await fetchViewCounts(ongoingFRAs);
    } catch {
      setFRAs([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSavedCounts() {
    try {
      const res = await apiFetch('/api/favourite-fra/counts', 'GET');
      const data = await res.json();

      const countMap = {};
      if (Array.isArray(data)) {
        data.forEach((item) => {
          countMap[item.fraID] = item.savedCount;
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
        try {
          const res = await apiFetch(`/api/fra/${fra.fraID}/views`, 'GET');
          const data = await res.json();
          viewMap[fra.fraID] = Number(data) || 0;
        } catch {
          viewMap[fra.fraID] = fra.viewCount || 0;
        }
      }),
    );

    setViewCounts(viewMap);
  }

  async function fetchSelectedFRA(fraID) {
    try {
      const res = await apiFetch(`/api/fra/${fraID}/view`, 'GET');
      const data = await res.json();
      setSelectedFRA(data);
    } catch {
      setSelectedFRA(null);
    }
  }
  

  async function searchFRA() {
    if (!search.trim()) {
      viewFRAs();
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch(
        '/api/fra/fundraiser/search?fraName=' + encodeURIComponent(search),
        'GET',
      );

      const data = await res.json();

      const ongoingFRAs = sortByFRAID(
        getFRAList(data).filter((fra) => new Date(fra.endDate) >= new Date()),
      );

      setFRAs(ongoingFRAs);
      await fetchSavedCounts();
      await fetchViewCounts(ongoingFRAs);
    } catch {
      setFRAs([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingFRA(null);
    setTitle('');
    setDesc('');
    setCategory('');
    setTarget('');
    setStart('');
    setEnd('');
    setShowForm(true);
  }

  function openEditForm(FRA) {
    setEditingFRA(FRA);
    setTitle(FRA.fraName || '');
    setDesc(FRA.description || '');
    setCategory(FRA.category || '');
    setTarget(FRA.targetAmount || '');
    setStart(FRA.startDate ? String(FRA.startDate).slice(0, 10) : '');
    setEnd(FRA.endDate ? String(FRA.endDate).slice(0, 10) : '');
    setShowForm(true);
  }

  async function saveFRA(e) {
    e.preventDefault();

    const payload = {
      fraName: title,
      description: desc,
      category,
      targetAmount: Number(target),
      startDate: start,
      endDate: end,
    };

    try {
      let res;

      if (editingFRA) {
        res = await apiFetch(`/api/fra/${editingFRA.fraID}`, 'PUT', payload);
      } else {
        res = await apiFetch('/api/fra', 'POST', payload);
      }

      const data = await res.json();

      alert(data.message || (editingFRA ? 'FRA updated' : 'FRA created'));

      setShowForm(false);
      setEditingFRA(null);
      viewFRAs();
    } catch {
      alert(editingFRA ? 'Failed to update FRA.' : 'Failed to create FRA.');
    }
  }

  async function toggleSuspendFRA(fraID, suspended) {
    if (
      !confirm(
        `Are you sure you want to ${suspended ? 'unsuspend' : 'suspend'} this FRA?`,
      )
    )
      return;

    try {
      const res = await apiFetch(`/api/fra/${fraID}/suspend`, 'PATCH');
      const data = await res.json();

      alert(data.message || 'FRA status updated');
      viewFRAs();
    } catch {
      alert('Failed to update FRA status.');
    }
  }

  function badgeStyle(status) {
    const map = {
      active: '#5FD3BC',
      suspended: '#FF6B81',
    };

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

  if (!user) return null;

  return (
    <>
      <Navbar role="Fundraiser" username={user.name} />

      <div className="page">
        <span className="back-link" onClick={() => router.push('/dashboard-fr')}>
          ← Back to Dashboard
        </span>

        <h2>Ongoing Fundraising Activities</h2>

        <p className="subtitle">
          Create, search, view and manage ongoing fundraising activities.
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

          <button className="btn-primary" onClick={openCreateForm}>
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
                FRAs.map((FRA) => (
                  <tr key={FRA.fraID}>
                    <td>
                      <code style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>
                        {FRA.fraID || '—'}
                      </code>
                    </td>

                    <td>
                      <span
                        onClick={() => fetchSelectedFRA(FRA.fraID)}
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

                    <td>$ {(FRA.targetAmount || 0).toLocaleString()}</td>

                    <td>{`${getDaysLeft(FRA.endDate)} days left`}</td>

                    <td>
                      <span
                        style={badgeStyle(
                          FRA.suspended ? 'suspended' : 'active',
                        )}
                      >
                        {FRA.suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>

                    <td>{savedCounts[FRA.fraID] || 0}</td>

                    <td>{viewCounts[FRA.fraID] || 0}</td>

                    <td>
                      <button
                        className="action-btn btn-edit"
                        onClick={() => openEditForm(FRA)}
                      >
                        Edit
                      </button>

                      <button
                        className={
                          FRA.suspended
                            ? 'action-btn btn-unsuspend'
                            : 'action-btn btn-suspend'
                        }
                        onClick={() =>
                          toggleSuspendFRA(FRA.fraID, FRA.suspended)
                        }
                        style={{ marginLeft: '0.4rem' }}
                      >
                        {FRA.suspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div
          className="modal-overlay active"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="modal">
            <h3>{editingFRA ? 'Edit Fundraising Activity' : 'Create Fundraising Activity'}</h3>

            <form onSubmit={saveFRA}>
              <div className="form-group">
                <label>FRA Name</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} required>
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
                <input value={getCategoryDescription(category)} readOnly />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Target Amount</label>
                <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={start} onChange={(e) => setStart(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} required />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                  Cancel
                </button>

                <button type="submit" className="btn-primary">
                  {editingFRA ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedFRA && (
        <div
          className="modal-overlay active"
          onClick={(e) => e.target === e.currentTarget && setSelectedFRA(null)}
        >
          <div className="modal">
            <h3>FRA Details</h3>

            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                { label: 'FRA ID', value: selectedFRA.fraID || '—' },
                { label: 'Name', value: selectedFRA.fraName || '—' },
                { label: 'Category', value: selectedFRA.category || '—' },
                {
                  label: 'Category Description',
                  value: getCategoryDescription(selectedFRA.category),
                },
                { label: 'Description', value: selectedFRA.description || '—' },
                {
                  label: 'Target Amount',
                  value: `$ ${(selectedFRA.targetAmount || 0).toLocaleString()}`,
                },
                {
                  label: 'Start Date',
                  value: new Date(selectedFRA.startDate).toLocaleDateString(),
                },
                {
                  label: 'End Date',
                  value: new Date(selectedFRA.endDate).toLocaleDateString(),
                },
                {
                  label: 'Saved Count',
                  value: savedCounts[selectedFRA.fraID] || 0,
                },
                {
                  label: 'View Count',
                  value: viewCounts[selectedFRA.fraID] || 0,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
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
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setSelectedFRA(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}