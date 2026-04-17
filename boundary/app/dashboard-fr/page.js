'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { requireAuth } from '@/lib/auth';

const fakeFetchFRAs = () =>
  Promise.resolve([
    {
      id: 1,
      title: 'Save The Earth',
      description: 'Plant 1000 trees',
      target: 5000,
      start: '2024-05-01',
      end: '2024-06-01',
    },
    {
      id: 2,
      title: 'School Fund',
      description: 'Books for kids',
      target: 2000,
      start: '2024-07-01',
      end: '2024-08-01',
    },
  ]);

const fakeCreateFRA = (fra) =>
  Promise.resolve({ ...fra, id: Math.random() });

export default function FundraiserDashboard() {
  const [user, setUser] = useState(null);
  const [fras, setFras] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedFRA, setSelectedFRA] = useState(null);
  // form fields
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [target, setTarget] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const u = requireAuth('fundraiser');
    if (u) setUser(u);
    fakeFetchFRAs().then(setFras);
  }, []);

  if (!user) return null;

  function openForm() {
    setShowForm(true);
    setSelectedFRA(null);
    setTitle('');
    setDesc('');
    setTarget('');
    setStart('');
    setEnd('');
  }

  function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    // Could add validation here.
    fakeCreateFRA({
      title,
      description: desc,
      target,
      start,
      end,
    }).then((fra) => {
      setFras([fra, ...fras]);
      setShowForm(false);
      setCreating(false);
    });
  }

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

        <div className="toolbar" style={{ marginBottom: '2rem', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={openForm}>
            ➕&nbsp;New Fundraising Activity
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay active" style={{ display: 'flex' }}>
            <div className="modal" style={{ maxWidth: 540 }}>
              <h3 style={{ marginBottom: '1.25rem' }}>Create Fundraising Activity</h3>
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
                  <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={creating}>
                    {creating ? 'Creating...' : 'Create'}
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
                fras.map(fra => (
                  <div
                    key={fra.id}
                    className="menu-card"
                    onClick={() => setSelectedFRA(fra)}
                    style={{
                      background: selectedFRA && selectedFRA.id === fra.id ? 'var(--gold-light)' : undefined,
                      border: selectedFRA && selectedFRA.id === fra.id ? '2px solid var(--gold)' : undefined,
                      transition: 'all 0.15s',
                      minHeight: 180,
                    }}
                  >
                    <div className="card-icon" style={{ background: 'var(--gold-light)', fontSize: 23 }}>📄</div>
                    <h3>{fra.title}</h3>
                    <p>{fra.description}</p>
                    <div style={{ fontSize: '0.9rem', marginTop: 8, color: 'var(--muted)' }}>
                      🎯 {fra.target} &nbsp; &nbsp; 🗓 {fra.start} → {fra.end}
                    </div>
                    <div className="card-arrow" style={{ marginTop: 10 }}>View →</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* FRA Detail Panel */}
        {selectedFRA && (
          <div style={{
            margin: '2rem 0',
            background: 'var(--card-bg)',
            border: '2px solid var(--gold)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '2rem',
            animation: 'fadeUp 0.4s both'
          }}>
            <button
              className="btn-cancel"
              style={{ float: 'right', marginLeft: '1rem' }}
              onClick={() => setSelectedFRA(null)}
            >
              ✕ Close
            </button>
            <h3 style={{ marginBottom: '.7em' }}>{selectedFRA.title}</h3>
            <div style={{ marginBottom: '.7em' }}><b>Description:</b> {selectedFRA.description}</div>
            <div><b>Target Amount:</b> {selectedFRA.target}</div>
            <div><b>Duration:</b> {selectedFRA.start} to {selectedFRA.end}</div>
          </div>
        )}
      </div>
    </>
  );
}