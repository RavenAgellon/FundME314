'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { requireAuth } from '@/lib/auth';

// ========== API ENDPOINT ==========
const API_BASE = 'http://localhost:3000/api/fra'; // <-- Update if backend runs elsewhere!

// ========== API HELPERS ==========
async function fetchFRAs() {
  const res = await fetch(`${API_BASE}/search`);
  const data = await res.json();
  return data.fraList || [];
}
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
    method: 'PATCH'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error suspending FRA');
  return data.fra;
}
function formatDate(dateStr) {
  if (!dateStr) return '';
  if (dateStr.length >= 10) return dateStr.slice(0, 10);
  return dateStr;
}

// ========== MAIN DASHBOARD COMPONENT ==========
export default function FundraiserDashboard() {
  const [user, setUser] = useState(null);
  const [fras, setFras] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  // Form fields
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [target, setTarget] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const u = requireAuth('fundraiser');
    if (u) setUser(u);
    fetchFRAs().then(fras => setFras(fras)).catch(() => setFras([]));
  }, []);

  function openForm() {
    setShowForm(true);
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
    setEditingId(fra.fraID || fra.id);
    setTitle(fra.fraName || fra.title || '');
    setDesc(fra.description || '');
    setCategory(fra.category || '');
    setTarget(fra.targetAmount?.toString() || fra.target?.toString() || '');
    setStart(formatDate(fra.startDate || fra.start));
    setEnd(formatDate(fra.endDate || fra.end));
    setErrorMsg('');
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setErrorMsg('');
    const fraData = {
      fraName: title,
      description: desc,
      category: category,
      targetAmount: Number(target),
      startDate: start,
      endDate: end,
    };

    try {
      if (editingId !== null) {
        // Update
        const updated = await updateFRA(editingId, fraData);
        setFras(fras =>
          fras.map(fra =>
            (fra.fraID === editingId || fra.id === editingId) ? updated : fra
          )
        );
        setSuccessMsg('FRA updated');
      } else {
        // Create new
        const created = await createFRA(fraData);
        setFras([created, ...fras]);
        setSuccessMsg('FRA created');
      }
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
      const updated = await suspendFRA(id);
      setFras(fras =>
        fras.map(fra =>
          (fra.fraID === id || fra.id === id) ? updated : fra
        )
      );
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
      <div className="page-narrow" style={{ minHeight: '70vh' }}>
        <div style={{ textAlign: 'center', margin: '2.5rem 0 2rem' }}>
          <h2>Fundraiser Dashboard</h2>
          <p className="subtitle">
            Start and manage your fundraising activities with ease
          </p>
        </div>
        {successMsg &&
          <div className="alert success" style={{ marginBottom: 16 }}>
            {successMsg}
          </div>
        }
        {errorMsg &&
          <div className="alert error" style={{ marginBottom: 16 }}>
            {errorMsg}
          </div>
        }
        <div className="toolbar" style={{ marginBottom: '2rem', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={openForm}>
            ➕&nbsp;New Fundraising Activity
          </button>
        </div>
        {showForm && (
          <div className="modal-overlay active" style={{ display: 'flex' }}>
            <div className="modal" style={{ maxWidth: 540 }}>
              <h3 style={{ marginBottom: '1.25rem' }}>
                {editingId !== null ? 'Edit Fundraising Activity' : 'Create Fundraising Activity'}
              </h3>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label htmlFor="fra-title">Title</label>
                  <input
                    id="fra-title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    autoFocus
                    placeholder="e.g. Build A Well"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fra-category">Category</label>
                  <input
                    id="fra-category"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    required
                    placeholder="e.g. Education, Health, Environment"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fra-desc">Description</label>
                  <textarea
                    id="fra-desc"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    required
                    placeholder="Describe the activity and goal..."
                  />
                </div>
                <div className="form-group">
                  <label>Target Amount</label>
                  <input
                    type="number"
                    min={1}
                    value={target}
                    onChange={e => setTarget(e.target.value)}
                    required
                    placeholder="e.g. 10000"
                  />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={start}
                    onChange={e => setStart(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={end}
                    onChange={e => setEnd(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                  <button type="button" className="btn-cancel" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={creating}>
                    {creating ? (editingId !== null ? 'Updating...' : 'Creating...') : (editingId !== null ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!showForm && (
          <>
            <h3 style={{ margin: '2.3rem 0 1.1rem' }}>My Fundraising Activities</h3>
            <div className="menu-grid" style={{ margin: 0 }}>
              {fras.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1/-1', padding: '2.5rem 0' }}>
                  No fundraising activities yet. Click "New Fundraising Activity" to begin!
                </div>
              ) : (
                fras.map(fra => {
                  const fraID = fra.fraID || fra.id;
                  return (
                    <div key={fraID} className="menu-card"
                      style={{
                        background: fra.suspended ? 'rgba(240,112,112,0.11)' : undefined,
                        border: fra.suspended ? '2px solid var(--error)' : undefined,
                        opacity: fra.suspended ? 0.7 : 1,
                        filter: fra.suspended ? 'grayscale(0.6)' : undefined,
                        pointerEvents: fra.suspended ? 'none' : 'inherit',
                      }}>
                      <div className="card-icon" style={{ background: 'var(--gold-light)', fontSize: 23 }}>📄</div>
                      <h3>
                        {fra.fraName || fra.title}
                        {fra.suspended && (
                          <span className="badge badge-suspended" style={{ marginLeft: 10 }}>Suspended</span>
                        )}
                      </h3>
                      <div style={{ fontSize: '0.92rem', color: 'var(--gold)', fontWeight: 500 }}>
                        Category: {fra.category ? fra.category : <i>None</i>}
                      </div>
                      <p>{fra.description}</p>
                      <div style={{ fontSize: '0.9rem', marginTop: 8, color: 'var(--muted)' }}>
                        🎯 {fra.targetAmount || fra.target} &nbsp; &nbsp;
                        🗓 {formatDate(fra.startDate || fra.start)} → {formatDate(fra.endDate || fra.end)}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 16 }}>
                        <button
                          type="button"
                          className="action-btn btn-edit"
                          onClick={() => openEditForm(fra)}
                          disabled={fra.suspended}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="action-btn btn-suspend"
                          onClick={() => handleSuspend(fraID)}
                          disabled={fra.suspended}
                        >
                          Suspend
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}