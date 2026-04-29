'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { requireAuth, apiFetch } from '@/lib/auth';

// ======================= DUMMY DATA & FUNCTIONS START  =======================

// Dummy data for user accounts (in-memory array)
let dummyUsers = [
  {
    _id: '1',
    userID: 1,
    username: "alice",
    password: "test23",
    role: "user_admin",
    name: "Alice Lim",
    email: "alice@demo.com",
    phoneNumber: "12345678",
    suspended: false,
    createdAt: "2026-04-01",
  },
  {
    _id: '2',
    userID: 2,
    username: "bob",
    password: "test45",
    role: "fundraiser",
    name: "Bob Lee",
    email: "bob@demo.com",
    phoneNumber: "87654321",
    suspended: false,
    createdAt: "2026-03-15",
  },
  {
    _id: '3',
    userID: 3,
    username: "charlie",
    password: "test67",
    role: "donee",
    name: "Charlie Kim",
    email: "charlie@demo.com",
    phoneNumber: "55555555",
    suspended: true,
    createdAt: "2026-02-20",
  },
];

// Dummy fetch all users
function fakeFetchUsers() {
  return Promise.resolve([...dummyUsers]);
}

// Dummy search users
function fakeSearchUsers(search) {
  if (!search.trim()) return fakeFetchUsers();
  const term = search.trim().toLowerCase();
  return Promise.resolve(
    dummyUsers.filter(
      u =>
        u.username.toLowerCase().includes(term) ||
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.userID && u.userID.toString().includes(term)) ||
        (u.role && u.role.toLowerCase().includes(term))
    )
  );
}

// Dummy create user
function fakeCreateUser({ username, password, role, name, email, phoneNumber }) {
  const newUser = {
    _id: (dummyUsers.length + 1).toString(),
    userID: dummyUsers.length + 1,
    username,
    password,
    role,
    name,
    email,
    phoneNumber,
    suspended: false,
    createdAt: new Date().toISOString(),
  };
  dummyUsers.push(newUser);
  return Promise.resolve(newUser);
}

// Dummy update user
function fakeUpdateUser(userID, { role, name, email, phoneNumber, password }) {
  const idx = dummyUsers.findIndex(u => u.userID === userID);
  if (idx === -1) return Promise.reject(new Error('User not found'));
  dummyUsers[idx] = {
    ...dummyUsers[idx],
    role,
    name,
    email,
    phoneNumber,
    ...(password ? { password } : {}),
  };
  return Promise.resolve(dummyUsers[idx]);
}

// Dummy suspend/unsuspend user
function fakeSuspendUser(userID, isSuspended) {
  const idx = dummyUsers.findIndex(u => u.userID === userID);
  if (idx === -1) return Promise.reject(new Error('User not found'));
  dummyUsers[idx] = {
    ...dummyUsers[idx],
    suspended: !isSuspended,
  };
  return Promise.resolve(dummyUsers[idx]);
}

// ======================= DUMMY DATA & FUNCTIONS END =======================

const EMPTY_FORM = { username: '', password: '', role: '', name: '', email: '', phoneNumber: '' };

export default function UserAccountManagement() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', data: {} }
  const [form, setForm] = useState(EMPTY_FORM);
  const [modalAlert, setModalAlert] = useState(null);
  const [saving, setSaving] = useState(false);
  const [detailUser, setDetailUser] = useState(null);

  function displayUserAdminPage() {
    const u = requireAuth('user_admin');
    if (u) { setUser(u); viewUserAccount(); fetchProfiles(); }
  }

  useEffect(() => { displayUserAdminPage(); }, []);

async function viewUserAccount() {
  setLoading(true);
  try {
    const res = await apiFetch('/api/users/view', 'GET');
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []); // ← guard here
  } catch { setUsers([]); }
  finally { setLoading(false); }
}

  async function fetchProfiles() {
    try {
      const res = await apiFetch('/api/user-profiles/view', 'GET');
      // const res = await fakeFetchUsers();
      const data = await res.json();
      setProfiles(data);
    } catch { setProfiles([]); }
  }

async function searchUserAccount() {
  if (!search.trim()) {
    viewUserAccount();
    return;
  }
  setLoading(true);
  try {
    const res = await apiFetch('/api/users/search?search=' + encodeURIComponent(search), 'GET');
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : (Array.isArray(data.users) ? data.users : []));
  } catch {
    setUsers([]);
  } finally {
    setLoading(false);
  }
}
  function createUserAccount() {
    setForm(EMPTY_FORM);
    setModalAlert(null);
    setModal({ mode: 'create' });
  }

  function updateUserAccount(u) {
    setForm({ username: u.username, password: '', role: u.role, name: u.name || '', email: u.email || '', phoneNumber: u.phoneNumber || '', createdAt: u.createdAt, userID: u.userID });
    setModalAlert(null);
    setModal({ mode: 'edit', data: u });
  }

  async function suspendUserAccount(userID, isSuspended) {
    if (!confirm(`Are you sure you want to ${isSuspended ? 'unsuspend' : 'suspend'} this user?`)) return;
    try {
      await apiFetch('/api/users/' + userID + '/suspend', 'PUT');
      // await fakeSuspendUser(userID, isSuspended);
      viewUserAccount();
    } catch { alert('Failed to update suspension status.'); }
  }

  async function handleModalSubmit() {
    setModalAlert(null);
    if (!form.username || !form.role) { setModalAlert({ type: 'error', msg: 'Username and role are required.' }); return; }
    if (modal.mode === 'create' && !form.password) { setModalAlert({ type: 'error', msg: 'Password is required for new users.' }); return; }

    setSaving(true);
    try {
      const body = { username: form.username, role: form.role, name: form.name, email: form.email, phoneNumber: form.phoneNumber };
      if (form.password) body.password = form.password;
      const url = modal.mode === 'edit' ? '/api/users/' + form.userID : '/api/users';
      const method = modal.mode === 'edit' ? 'PUT' : 'POST';
      const res = await apiFetch(url, method, body);
      const data = await res.json();
      if (!res.ok) { setModalAlert({ type: 'error', msg: data.message }); return; }
      /*
      if (modal.mode === 'edit') {
        await fakeUpdateUser(form.userID, { role: form.role, name: form.name, email: form.email, phoneNumber: form.phoneNumber, password: form.password });
      } else {
        await fakeCreateUser({ username: form.username, password: form.password, role: form.role, name: form.name, email: form.email, phoneNumber: form.phoneNumber });
      }
      */
      setModal(null);
      viewUserAccount();
    } catch { setModalAlert({ type: 'error', msg: 'Server error. Try again.' }); }
    finally { setSaving(false); }
  }

  function roleBadgeStyle(role) {
    const map = { user_admin: '#C9A84C', fundraiser: '#5DCAA5', donee: '#6BAEE8', platform_management: '#C896DC' };
    const color = map[role] || '#9999BB';
    return { background: `${color}22`, color, display:'inline-block', padding:'2px 10px', borderRadius:'20px', fontSize:'0.7rem', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.5px' };
  }

  const selectedProfile = profiles.find(p => p.roleName === form.role);

  if (!user) return null;

  return (
    <>
      <Navbar role="User Admin" username={user.name} />
      <div className="page">
        <span className="back-link" onClick={() => router.push('/dashboard-admin')}>← Back to Dashboard</span>
        <h2>User Account Management</h2>
        <p className="subtitle">Create, view, update, suspend and search user accounts.</p>

        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchUserAccount()}
              placeholder="Search by name, username, ID or role..."
            />
          </div>
          <button className="btn-primary" onClick={searchUserAccount} style={{marginRight:'0.5rem'}}>Search</button>
          <button className="btn-primary" onClick={createUserAccount}>+ Create User</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User ID</th><th>Name</th><th>Role</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="loading-cell">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="empty-state">No users found.</td></tr>
              ) : users.map(u => (
                <tr key={u._id}>
                  <td><code style={{color:'var(--gold)',fontSize:'0.8rem'}}>{u.userID || '—'}</code></td>
                  <td>
                    <span onClick={() => setDetailUser(u)}
                      style={{cursor:'pointer', color:'var(--text)', borderBottom:'1px dashed var(--muted)', paddingBottom:'1px'}}>
                      {u.name || '—'}
                    </span>
                  </td>
                  <td><span style={roleBadgeStyle(u.role)}>{u.role}</span></td>
                  <td><span className={`badge ${u.suspended ? 'badge-suspended' : 'badge-active'}`}>{u.suspended ? 'Suspended' : 'Active'}</span></td>
                  <td>
                    <button className="action-btn btn-edit" onClick={() => updateUserAccount(u)}>Edit</button>
                    <button className={`action-btn ${u.suspended ? 'btn-unsuspend' : 'btn-suspend'}`}
                      onClick={() => suspendUserAccount(u.userID, u.suspended)}>
                      {u.suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Detail Modal */}
      {detailUser && (
        <div className="modal-overlay active" onClick={e => e.target === e.currentTarget && setDetailUser(null)}>
          <div className="modal">
            <h3>User Details</h3>

            <div style={{display:'grid', gap:'0.75rem', marginBottom:'1.25rem'}}>
              {[
                { label: 'User ID',      value: detailUser.userID },
                { label: 'Name',         value: detailUser.name || '—' },
                { label: 'Username',     value: detailUser.username },
                { label: 'Email',        value: detailUser.email || '—' },
                { label: 'Phone',        value: detailUser.phoneNumber || '—' },
                { label: 'Role',         value: detailUser.role },
                { label: 'Status',       value: detailUser.suspended ? 'Suspended' : 'Active' },
                { label: 'Date Created', value: new Date(detailUser.createdAt).toLocaleString() },
              ].map(row => (
                <div key={row.label} style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'0.6rem'}}>
                  <span style={{fontSize:'0.78rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.6px', fontWeight:500}}>{row.label}</span>
                  <span style={{fontSize:'0.875rem', color:'var(--text)'}}>{row.value}</span>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDetailUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="modal-overlay active" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <h3>{modal.mode === 'create' ? 'Create User' : 'Update User'}</h3>
            {modalAlert && <div className={`modal-alert ${modalAlert.type}`}>{modalAlert.msg}</div>}

            <div className="form-group">
              <label>Username</label>
              <input type="text" value={form.username} disabled={modal.mode === 'edit'}
                style={modal.mode === 'edit' ? {opacity:0.5, cursor:'not-allowed'} : {}}
                onChange={e => setForm(f => ({...f, username: e.target.value}))} placeholder="e.g. john_doe" />
            </div>
            <div className="form-group">
              <label>Password {modal.mode === 'edit' && <span style={{color:'var(--muted)',fontSize:'0.7rem',textTransform:'none'}}>(leave blank to keep current)</span>}</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="Enter password" />
            </div>
            <div className="form-group">
              <label>Role (User Profile)</label>
              <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
                <option value="">Select a role</option>
                {profiles.map(p => (
                  <option key={p.roleID} value={p.roleName}>{p.roleName}{p.suspended ? ' (suspended)' : ''}</option>
                ))}
              </select>
              {selectedProfile && (
                <div className="hint" style={{color: selectedProfile.suspended ? 'var(--error)' : 'var(--muted)'}}>
                  {selectedProfile.description}{selectedProfile.suspended ? ' — This profile is suspended. The user will be created as suspended.' : ''}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. John Doe" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="e.g. john@email.com" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" value={form.phoneNumber} maxLength={8}
                onChange={e => setForm(f => ({...f, phoneNumber: e.target.value}))} placeholder="e.g. 91234567" />
              <div className="hint">Must be exactly 8 digits.</div>
            </div>
            {modal.mode === 'edit' && (
              <div className="form-group">
                <label>Date Created</label>
                <input type="text" disabled value={new Date(form.createdAt).toLocaleString()} style={{opacity:0.5,cursor:'not-allowed'}} />
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleModalSubmit} disabled={saving}>
                {saving ? 'Saving...' : modal.mode === 'create' ? 'Create User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}