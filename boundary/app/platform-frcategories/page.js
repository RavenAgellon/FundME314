'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth, apiFetch } from '@/lib/auth';

export default function PlatformFRACategories() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');

  // Form state
  const [catName, setCatName] = useState('');
  const [fraIDsText, setFraIDsText] = useState('');
  const [description, setDescription] = useState('');
  const [editing, setEditing] = useState(false);
  const [originalName, setOriginalName] = useState('');

  const [viewFraList, setViewFraList] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  function displayPage() {
    const u = requireAuth('platform_management');
    if (u) {
      setUser(u);
      fetchCategories();
    }
  }

  useEffect(() => {
    displayPage();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/fra-category/search', 'GET');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  async function searchCategory() {
    if (!search.trim()) {
      fetchCategories();
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/fra-category/search?catName=' + encodeURIComponent(search), 'GET');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  function parseFraIDs(text) {
    return text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((n) => Number(n))
      .filter((n) => !Number.isNaN(n));
  }

  async function submitCategory(e) {
    e && e.preventDefault();
    const payload = {
      catName: catName.trim(),
      description: description || ''
    };

    // Only include fraIDs when editing
    if (editing) {
      payload.fraIDs = parseFraIDs(fraIDsText);
    }

    if (!payload.catName) {
      alert('Category name is required');
      return;
    }

    try {
      if (editing) {
        const res = await apiFetch(`/api/fra-category/${encodeURIComponent(originalName)}`, 'PUT', payload);
        const data = await res.json();
        if (data) {
          alert('Category updated');
        } else {
          alert('Failed to update category');
        }
      } else {
        const res = await apiFetch('/api/fra-category', 'POST', payload);
        const data = await res.json();
        if (data) {
          alert('Category created');
        } else {
          alert('Failed to create category');
        }
      }

      // Reset form and refresh
      setCatName('');
      setFraIDsText('');
      setDescription('');
      setEditing(false);
      setOriginalName('');
      fetchCategories();
    } catch (err) {
      alert('Request failed');
    }
  }

  function startEdit(cat) {
    setEditing(true);
    setOriginalName(cat.catName);
    setCatName(cat.catName);
    setFraIDsText((cat.fraIDs || []).join(', '));
    setDescription(cat.description || '');
    setShowCreateModal(true);
  }

  async function suspendCategory(cat) {
    if (!confirm(`Suspend category "${cat.catName}"?`)) return;
    try {
      const res = await apiFetch(`/api/fra-category/${encodeURIComponent(cat.catName)}/suspend`, 'PATCH');
      const data = await res.json();
      if (data) alert('Category suspended');
      else alert('Failed to suspend');
    } catch (err) {
      alert('Request failed');
    } finally {
      fetchCategories();
    }
  }

  async function viewCategoryFRAs(cat) {
    try {
      const res = await apiFetch(`/api/fra-category/${encodeURIComponent(cat.catName)}`, 'GET');
      const data = await res.json();
      setViewFraList({ catName: cat.catName, fraList: Array.isArray(data) ? data : [] });
    } catch {
      setViewFraList({ catName: cat.catName, fraList: [] });
    }
  }

  if (!user) return null;

  return (
    <>
      <Navbar role="Platform Mgmt" username={user.name} />
      <div className="page">
        <span className="back-link" onClick={() => router.push('/dashboard-platform')}>← Back to Dashboard</span>
        <h2>FRA Category Management</h2>
        <p className="subtitle">Create, view, update, suspend and search Fundraising Activity categories.</p>

        <div className="toolbar" style={{ marginBottom: '0.75rem', justifyContent: 'flex-start', gap: '0.75rem' }}>
          <div className="search-wrap" style={{ display: 'flex' }}>
            <span className="search-icon">🔍</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchCategory()} placeholder="Search categories" />
          </div>
          <button className="btn-primary" onClick={searchCategory}>Search</button>
          <button className="btn-primary" onClick={() => { setEditing(false); setCatName(''); setFraIDsText(''); setDescription(''); setOriginalName(''); setShowCreateModal(true); }}>+ Create Category</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>fraID</th>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="loading-cell">Loading...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">No categories found.</td>
                </tr>
              ) : (
                categories.map((cat, index) => (
                  <tr key={cat.catName} onClick={() => viewCategoryFRAs(cat)} style={{ cursor: 'pointer' }}>
                    <td>
                      <code style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>
                        {index + 1}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600 }}>{cat.catName}</td>
                    <td>{cat.description || '—'}</td>
                    <td>
                      <span style={cat.suspended ? { color: 'var(--error)', fontSize: '0.8rem', textTransform: 'uppercase' } : { color: 'var(--success)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        {cat.suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="action-btn btn-edit" onClick={() => startEdit(cat)}>Edit</button>
                      <button className="action-btn btn-suspend" onClick={() => suspendCategory(cat)}>Suspend</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

        {/* Create / Edit Category Modal */}
        {showCreateModal && (
          <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
            <div className="modal">
              <h3>{editing ? 'Update Category' : 'Create Category'}</h3>

              <form onSubmit={submitCategory} style={{ marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label>Category Name</label>
                  <input type="text" placeholder="e.g. Education" value={catName} onChange={(e) => setCatName(e.target.value)} disabled={editing} style={editing ? {opacity:0.5, cursor:'not-allowed'} : {}} />
                </div>

                {editing && (
                  <div className="form-group">
                    <label>FRA IDs</label>
                    <input type="text" placeholder="e.g. 1, 2, 3" value={fraIDsText} onChange={(e) => setFraIDsText(e.target.value)} />
                    <div className="hint">Comma separated FRA IDs</div>
                  </div>
                )}

                <div className="form-group">
                  <label>Description</label>
                  <textarea placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => { setShowCreateModal(false); setEditing(false); setCatName(''); setFraIDsText(''); setDescription(''); setOriginalName(''); }}>Cancel</button>
                  <button className="btn-primary" type="submit">{editing ? 'Update Category' : 'Create Category'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View FRAs modal */}
      {viewFraList && (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setViewFraList(null)}>
          <div className="modal">
            <h3>FRAs in Category "{viewFraList.catName}"</h3>

            <div style={{
              display: 'grid',
              gap: '0.75rem',
              marginBottom: '1.25rem',
              marginTop: '1rem'
            }}>
              {viewFraList.fraList.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: '0.875rem', padding: '1rem', textAlign: 'center' }}>
                  No FRAs in this category.
                </div>
              ) : (
                viewFraList.fraList.map((fra) => (
                  <div
                    key={fra.fraID}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      paddingBottom: '0.6rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>{fra.fraName || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>FRA ID: {fra.fraID}</div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 500 }}>$ {fra.targetAmount ? fra.targetAmount.toLocaleString() : '—'}</span>
                  </div>
                ))
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setViewFraList(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
