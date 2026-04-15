'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth, apiFetch } from '@/lib/auth';

const EMPTY_FORM = { roleName: '', description: '' };

export default function UserProfileManagement() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [modalAlert, setModalAlert] = useState(null);
  const [saving, setSaving] = useState(false);
  const [detailProfile, setDetailProfile] = useState(null);
  const searchTimer = useRef(null);

  function displayUserAdminPage() {
    const u = requireAuth('user_admin');
    if (u) { setUser(u); viewUserProfile(); }
  }

  useEffect(() => { displayUserAdminPage(); }, []);

  async function viewUserProfile() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/user-profiles/view');
      const data = await res.json();
      setProfiles(data);
    } catch { setProfiles([]); }
    finally { setLoading(false); }
  }

  async function searchUserProfile(val) {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      if (!val.trim()) { viewUserProfile(); return; }
      setLoading(true);
      try {
        const res = await apiFetch(`/api/user-profiles/search?search=${encodeURIComponent(val)}`);
        const data = await res.json();
        setProfiles(data);
      } catch { setProfiles([]); }
      finally { setLoading(false); }
    }, 300);
  }

  function createUserProfile() {
    setForm(EMPTY_FORM);
    setModalAlert(null);
    setModal({ mode: 'create' });
  }

  function updateUserProfile(p) {
    setForm({ roleName: p.roleName, description: p.description || '', roleID: p.roleID });
    setModalAlert(null);
    setModal({ mode: 'edit', data: p });
  }

  async function suspendUserProfile(roleID, isSuspended) {
    if (!confirm(`Are you sure you want to ${isSuspended ? 'unsuspend' : 'suspend'} this profile? This will also ${isSuspended ? 'unsuspend' : 'suspend'} all users with this role.`)) return;
    try {
      const res = await apiFetch(`/api/user-profiles/${roleID}/suspend`, { method: 'PUT' });
      const data = await res.json();
      alert(data.message);
      search.trim() ? searchUserProfile(search) : viewUserProfile();
    } catch { alert('Failed to update suspension status.'); }
  }

  async function handleModalSubmit() {
    setModalAlert(null);
    if (!form.roleName) { setModalAlert({ type: 'error', msg: 'Role name is required.' }); return; }
    setSaving(true);
    try {
      const body = { roleName: form.roleName, description: form.description };
      const res = await apiFetch(
        modal.mode === 'edit' ? `/api/user-profiles/${form.roleID}` : '/api/user-profiles',
        { method: modal.mode === 'edit' ? 'PUT' : 'POST', body: JSON.stringify(body) }
      );
      const data = await res.json();
      if (!res.ok) { setModalAlert({ type: 'error', msg: data.message }); return; }
      setModal(null);
      search.trim() ? searchUserProfile(search) : viewUserProfile();
    } catch { setModalAlert({ type: 'error', msg: 'Server error. Try again.' }); }
    finally { setSaving(false); }
  }

  if (!user) return null;

  return (
    <>
      <Navbar role="User Admin" username={user.name} />
      <div className="page">
        <span className="back-link" onClick={() => router.push('/dashboard-admin')}>← Back to Dashboard</span>
        <h2>User Profile Management</h2>
        <p className="subtitle">Create, view, update, suspend and search user role profiles.</p>

        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input type="text" value={search} onChange={e => searchUserProfile(e.target.value)}
              placeholder="Search by role name, ID or description..." />
          </div>
          <button className="btn-primary" onClick={createUserProfile}>+ Create Profile</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Role ID</th><th>Role Name</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="loading-cell">Loading...</td></tr>
              ) : profiles.length === 0 ? (
                <tr><td colSpan={6} className="empty-state">No profiles found.</td></tr>
              ) : profiles.map(p => (
                <tr key={p._id}>
                  <td><code style={{color:'var(--gold)',fontSize:'0.8rem'}}>{p.roleID}</code></td>
                  <td>
                    <span onClick={() => setDetailProfile(p)}
                      style={{cursor:'pointer', color:'var(--text)', borderBottom:'1px dashed var(--muted)', paddingBottom:'1px', fontWeight:500}}>
                      {p.roleName}
                    </span>
                  </td>
                  <td><span className={`badge ${p.suspended ? 'badge-suspended' : 'badge-active'}`}>{p.suspended ? 'Suspended' : 'Active'}</span></td>
                  <td>
                    <button className="action-btn btn-edit" onClick={() => updateUserProfile(p)}>Edit</button>
                    <button className={`action-btn ${p.suspended ? 'btn-unsuspend' : 'btn-suspend'}`}
                      onClick={() => suspendUserProfile(p.roleID, p.suspended)}>
                      {p.suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Detail Modal */}
      {detailProfile && (
        <div className="modal-overlay active" onClick={e => e.target === e.currentTarget && setDetailProfile(null)}>
          <div className="modal">
            <h3>Profile Details</h3>

            <div style={{display:'grid', gap:'0.75rem', marginBottom:'1.25rem'}}>
              {[
                { label: 'Role ID',      value: detailProfile.roleID },
                { label: 'Role Name',    value: detailProfile.roleName },
                { label: 'Description', value: detailProfile.description || '—' },
                { label: 'Status',       value: detailProfile.suspended ? 'Suspended' : 'Active' },
                { label: 'Date Created', value: new Date(detailProfile.createdAt).toLocaleString() },
              ].map(row => (
                <div key={row.label} style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'0.6rem'}}>
                  <span style={{fontSize:'0.78rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.6px', fontWeight:500}}>{row.label}</span>
                  <span style={{fontSize:'0.875rem', color:'var(--text)', maxWidth:'60%', textAlign:'right'}}>{row.value}</span>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDetailProfile(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay active" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <h3>{modal.mode === 'create' ? 'Create Profile' : 'Update Profile'}</h3>
            {modalAlert && <div className={`modal-alert ${modalAlert.type}`}>{modalAlert.msg}</div>}

            <div className="form-group">
              <label>Role Name</label>
              <input type="text" value={form.roleName} onChange={e => setForm(f => ({...f, roleName: e.target.value}))} placeholder="e.g. fundraiser" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Describe what this role can do..." />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleModalSubmit} disabled={saving}>
                {saving ? 'Saving...' : modal.mode === 'create' ? 'Create Profile' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}