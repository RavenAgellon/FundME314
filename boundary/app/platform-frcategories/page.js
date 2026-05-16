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

  // Form state for creating/updating categories
  const [catName, setCatName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
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
      const res = await apiFetch('/api/fra-category/', 'GET');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  function resetCategoryForm() {
    setCatName('');
    setDescription('');
    setFormError('');
    setEditing(false);
    setOriginalName('');
  }

  function openCreateModal() {
    resetCategoryForm();
    setShowCreateModal(true);
  }

  function closeCategoryModal() {
    setShowCreateModal(false);
    resetCategoryForm();
  }

  // Search function for categories based on catName.
  async function searchCategory() {
    if (!search.trim()) {
      fetchCategories();
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch(
        '/api/fra-category/search?catName=' + encodeURIComponent(search),
        'GET',
      );
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  async function createCategory() {
    const payload = {
      catName: catName.trim(),
      description: description || '',
    };

    if (!payload.catName) {
      setFormError('Category name is required');
      return false;
    } else if (!payload.description) {
      setFormError('Description is required');
      return false;
    }

    try {
      setFormError('');
      const res = await apiFetch('/api/fra-category', 'POST', payload);
      const data = await res.json();

      if (data && (data === true || data.success)) {
        closeCategoryModal();
        fetchCategories();
        return true;
      }

      setFormError(data?.message || 'Failed to create category');
      return false;
    } catch (err) {
      setFormError(err?.message || 'Request failed');
      return false;
    }
  }

  async function updateCategory() {
    const payload = {
      catName: catName.trim(),
      description: description || '',
    };

    if (!payload.catName) {
      setFormError('Category name is required');
      return false;
    } else if (!payload.description) {
      setFormError('Description is required');
      return false;
    }

    try {
      setFormError('');
      const res = await apiFetch(
        `/api/fra-category/${encodeURIComponent(originalName)}`,
        'PUT',
        payload,
      );
      const data = await res.json();

      if (data && (data === true || data.success)) {
        closeCategoryModal();
        fetchCategories();
        return true;
      }

      setFormError(data?.message || 'Failed to update category');
      return false;
    } catch (err) {
      setFormError(err?.message || 'Request failed');
      return false;
    }
  }

  async function handleCategorySubmit(e) {
    e && e.preventDefault();

    if (editing) {
      return updateCategory();
    }

    return createCategory();
  }

  function startEdit(cat) {
    setFormError('');
    setEditing(true);
    setOriginalName(cat.catName);
    setCatName(cat.catName);
    setDescription(cat.description || '');
    setShowCreateModal(true);
  }

  //  suspend or unsuspend category based on current state
  async function suspendCategory(cat) {
    try {
      const res = await apiFetch(
        `/api/fra-category/${encodeURIComponent(cat.catName)}/suspend`,
        'PATCH',
      );
      const data = await res.json();
    } catch (err) {
      // silently handle errors
    } finally {
      fetchCategories();
    }
  }

  // View category description in a modal
  function viewCategoryDescription(cat) {
    setViewFraList({
      catName: cat.catName,
      description: cat.description || 'No description available.',
    });
  }

  if (!user) return null;

  return (
    <>
      <Navbar role="Platform Mgmt" username={user.name} />
      <div className="page">
        <span
          className="back-link"
          onClick={() => router.push('/dashboard-platform')}
        >
          ← Back to Dashboard
        </span>
        <h2>FRA Category Management</h2>
        <p className="subtitle">
          Create, view, update, suspend and search Fundraising Activity
          categories.
        </p>

        <div
          className="toolbar"
          style={{
            marginBottom: '0.75rem',
            justifyContent: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <div className="search-wrap" style={{ display: 'flex' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchCategory()}
              placeholder="Search categories"
            />
          </div>
          <button className="btn-primary" onClick={searchCategory}>
            Search
          </button>
          <button className="btn-primary" onClick={openCreateModal}>
            + Create Category
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="loading-cell">
                    Loading...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty-state">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat.catName}
                    onClick={() => viewCategoryDescription(cat)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 600 }}>{cat.catName}</td>
                    <td>
                      <span
                        style={
                          cat.suspended
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
                        {cat.suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className="action-btn btn-edit"
                        onClick={() => startEdit(cat)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn btn-suspend"
                        onClick={() => suspendCategory(cat)}
                      >
                        {cat.suspended ? 'Unsuspend' : 'Suspend'}
                      </button>
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
        <div
          className="modal-overlay active"
          onClick={(e) => e.target === e.currentTarget && closeCategoryModal()}
        >
          <div className="modal">
            <h3>{editing ? 'Update Category' : 'Create Category'}</h3>

            <form
              onSubmit={handleCategorySubmit}
              style={{ marginTop: '0.5rem' }}
            >
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Education"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                />
              </div>

              {formError && (
                <div
                  style={{
                    color: 'var(--error)',
                    marginTop: 6,
                    marginBottom: 6,
                    fontSize: '0.9rem',
                  }}
                >
                  {formError}
                </div>
              )}

              {/* FRA IDs are backend-only and intentionally not shown in the UI */}

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Short description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeCategoryModal}
                >
                  Cancel
                </button>
                <button className="btn-primary" type="submit">
                  {editing ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Category Description Modal */}
      {viewFraList && (
        <div
          className="modal-overlay active"
          onClick={(e) => e.target === e.currentTarget && setViewFraList(null)}
        >
          <div className="modal">
            <h3>FRAs in Category "{viewFraList.catName}"</h3>

            <div style={{ marginTop: '0.5rem' }}>
              <div
                style={{
                  color: 'var(--muted)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                Category Description:
              </div>
              <div
                style={{
                  color: 'var(--text)',
                  fontSize: '0.95rem',
                  marginTop: '0.5rem',
                }}
              >
                {viewFraList.description}
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setViewFraList(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
