import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import './AdminPage.css';

const TABS = [
  { key: 'users', label: 'Users' },
  { key: 'posts', label: 'Posts' },
  { key: 'albums', label: 'Albums' }, 
  { key: 'reported', label: 'Reported Posts' },
  { key: 'reasons', label: 'Report Reasons' },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="max-w-[1100px] mx-auto p-4 md:p-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl mb-6 text-center">Admin Panel</h1>

      <div className="admin-tabs flex flex-wrap justify-center gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab px-4 py-2 text-sm ${
              activeTab === tab.key ? 'active' : ''
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'posts' && <PostsTab />}
      {activeTab === 'albums' && <AlbumsTab />}
      {activeTab === 'reported' && <ReportedPostsTab />}
      {activeTab === 'reasons' && <ReasonsTab />}
    </div>
  );
};

/* ----------------------------------------
   USERS TAB
   ---------------------------------------- */

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingOn, setActingOn] = useState(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api('/api/admin/users');
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (user) => {
    if (
      !window.confirm(
        `Delete user "${user.name}"? This removes all their posts, albums, friendships, and activity.`
      )
    )
      return;
    setActingOn(user._id);
    try {
      await api(`/api/admin/users/${user._id}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActingOn(null);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMsg msg={error} />;
  if (users.length === 0) return <Empty msg="No users." />;

  return (
    <div className="admin-table">
      {users.map((user) => (
        <div key={user._id} className="admin-row flex items-center gap-3 p-3 flex-wrap">
          <Link
            to={`/profile/${user._id}`}
            className="flex items-center gap-3 flex-1 no-underline text-inherit"
          >
            <img
              src={
                user.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.name
                )}&background=6C63FF&color=fff&size=40`
              }
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">
                {user.name}
                {user.isAdmin && (
                  <span className="ml-2 text-xs bg-[color:var(--color-primary)] text-white rounded-full px-2 py-0.5">
                    admin
                  </span>
                )}
              </span>
              <span className="text-xs text-[color:var(--color-gray)]">
                @{user.username} · {user.email}
              </span>
            </div>
          </Link>
          <button
            className="admin-btn admin-btn-danger"
            onClick={() => handleDelete(user)}
            disabled={actingOn === user._id}
          >
            {actingOn === user._id ? '...' : 'Delete'}
          </button>
        </div>
      ))}
    </div>
  );
};

/* ----------------------------------------
   POSTS TAB 
   ---------------------------------------- */

const PostsTab = () => {
  const [posts, setPosts] = useState([]);
  const [reportCounts, setReportCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ description: '', hashtagsInput: '' });
  const [actingOn, setActingOn] = useState(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [postsRes, reportedRes] = await Promise.all([
        api('/api/admin/posts'),
        api('/api/admin/reported-posts').catch(() => ({ reportedPosts: [] })),
      ]);

      setPosts(postsRes.posts || []);

      const counts = {};
      (reportedRes.reportedPosts || []).forEach((p) => {
        counts[p._id] = (p.reports || []).length;
      });
      setReportCounts(counts);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const startEdit = (post) => {
    setEditingId(post._id);
    setEditForm({
      description: post.description || '',
      hashtagsInput: (post.hashtags || []).join(', '),
    });
  };

  const handleSave = async (postId) => {
    const hashtags = editForm.hashtagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, '').toLowerCase())
      .filter((t) => t.length > 0);

    setActingOn(postId);
    try {
      await api(`/api/admin/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify({
          description: editForm.description,
          hashtags,
        }),
      });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, description: editForm.description, hashtags }
            : p
        )
      );
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setActingOn(null);
    }
  };

  const handleDelete = async (post) => {
    if (
      !window.confirm(
        'Delete this post permanently? This also removes its comments and activity.'
      )
    )
      return;
    setActingOn(post._id);
    try {
        await api(`/api/admin/reported-posts/${post._id}`, {
            method: 'DELETE',
            body: JSON.stringify({ deletePost: true }),
        });
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActingOn(null);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMsg msg={error} />;
  if (posts.length === 0) return <Empty msg="No posts." />;

  return (
    <div className="admin-table">
      {posts.map((post) => {
        const isEditing = editingId === post._id;
        const isActing = actingOn === post._id;
        const reports = reportCounts[post._id] || 0;

        return (
          <div
            key={post._id}
            className="admin-row p-3 flex flex-col gap-2 md:flex-row md:items-center"
          >
            <div className="relative flex-shrink-0">
              <img
                src={post.image}
                alt=""
                className="w-full md:w-20 h-20 object-cover rounded-md"
              />
              {reports > 0 && (
                <span
                  className={`admin-report-badge ${
                    reports > 2 ? 'admin-report-badge-high' : ''
                  }`}
                  title={`${reports} report${reports === 1 ? '' : 's'}`}
                >
                  🚩 {reports}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="admin-input"
                    rows="2"
                    placeholder="Description"
                  />
                  <input
                    type="text"
                    value={editForm.hashtagsInput}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        hashtagsInput: e.target.value,
                      }))
                    }
                    className="admin-input"
                    placeholder="hashtags, comma, separated"
                  />
                </div>
              ) : (
                <>
                  <p className="text-sm mb-1">{post.description}</p>
                  {post.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {post.hashtags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs text-[color:var(--color-primary)]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-[color:var(--color-gray)]">
                    by {post.owner?.name || 'Unknown'}
                    {reports > 0 && (
                      <span className="ml-2 text-[color:var(--color-secondary)] font-semibold">
                        · {reports} report{reports === 1 ? '' : 's'}
                      </span>
                    )}
                  </span>
                </>
              )}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {isEditing ? (
                <>
                  <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => handleSave(post._id)}
                    disabled={isActing}
                  >
                    {isActing ? '...' : 'Save'}
                  </button>
                  <button
                    className="admin-btn"
                    onClick={() => setEditingId(null)}
                    disabled={isActing}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => startEdit(post)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => handleDelete(post)}
                    disabled={isActing}
                  >
                    {isActing ? '...' : 'Delete'}
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ----------------------------------------
   REPORTED POSTS TAB
   ---------------------------------------- */

const ReportedPostsTab = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingOn, setActingOn] = useState(null);

  const fetchReported = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api('/api/admin/reported-posts');
      const sorted = (data.reportedPosts || []).sort(
        (a, b) => (b.reports?.length || 0) - (a.reports?.length || 0)
      );
      setPosts(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReported();
  }, [fetchReported]);

  const handleDeletePost = async (post) => {
    if (!window.confirm('Delete this post permanently?')) return;
    setActingOn(post._id);
    try {
      await api(`/api/admin/reported-posts/${post._id}`, {
        method: 'DELETE',
        body: JSON.stringify({ deletePost: true }),
      });
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActingOn(null);
    }
  };

  const handleClearReports = async (post) => {
    if (
      !window.confirm(
        `Clear all reports on this post? The post stays visible.`
      )
    )
      return;
    setActingOn(post._id);
    try {
      await api(`/api/admin/reported-posts/${post._id}`, {
        method: 'DELETE',
        body: JSON.stringify({ deletePost: false }),
      });
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActingOn(null);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMsg msg={error} />;
  if (posts.length === 0) return <Empty msg="No reported posts." />;

  return (
    <div className="admin-table">
      {posts.map((post) => {
        const count = post.reports?.length || 0;
        const isActing = actingOn === post._id;
        const isHidden = count > 2;

        return (
          <div key={post._id} className="admin-row p-3 flex flex-col gap-3">
            {/* Top row: image + content + actions */}
            <div className="flex flex-col md:flex-row gap-3 md:items-start">
              <div className="relative flex-shrink-0">
                <img
                  src={post.image}
                  alt=""
                  className="w-full md:w-24 h-24 object-cover rounded-md"
                />
                <span
                  className={`admin-report-badge ${
                    isHidden ? 'admin-report-badge-high' : ''
                  }`}
                  title={`${count} report${count === 1 ? '' : 's'}`}
                >
                  🚩 {count}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold">
                    {post.owner?.name || 'Unknown'}
                  </span>
                  <Link
                    to={`/post/${post._id}`}
                    className="text-xs text-[color:var(--color-primary)] hover:underline"
                  >
                    View post →
                  </Link>
                  {isHidden && (
                    <span className="text-xs bg-[color:var(--color-secondary)] text-white rounded-full px-2 py-0.5">
                      hidden from feed
                    </span>
                  )}
                </div>
                <p className="text-sm mb-1">{post.description}</p>
                {post.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs text-[color:var(--color-primary)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0 self-end md:self-start">
                <button
                  className="admin-btn"
                  onClick={() => handleClearReports(post)}
                  disabled={isActing}
                >
                  {isActing ? '...' : 'Clear Reports'}
                </button>
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => handleDeletePost(post)}
                  disabled={isActing}
                >
                  Delete Post
                </button>
              </div>
            </div>

            {/* Reports list */}
            <div className="admin-reports-list pl-2 md:pl-32">
              <div className="text-xs uppercase text-[color:var(--color-gray)] mb-1">
                Reports ({count})
              </div>
              {post.reports?.map((report, i) => (
                <div
                  key={report._id || i}
                  className="text-xs text-[color:var(--color-dark)] mb-1"
                >
                  <span className="text-[color:var(--color-secondary)]">
                    •
                  </span>{' '}
                  <span className="text-[color:var(--color-gray)]">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ----------------------------------------
   REASONS TAB
   ---------------------------------------- */

const ReasonsTab = () => {
  const [reasons, setReasons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newText, setNewText] = useState('');
  const [actingOn, setActingOn] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const fetchReasons = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api('/api/admin/reasons');
      setReasons(data.reasons || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReasons();
  }, [fetchReasons]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setIsAdding(true);
    try {
      const data = await api('/api/admin/reasons', {
        method: 'POST',
        body: JSON.stringify({ text: newText.trim() }),
      });
      setReasons((prev) => [...prev, data.reason]);
      setNewText('');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (reason) => {
    if (!window.confirm(`Delete reason "${reason.text}"?`)) return;
    setActingOn(reason._id);
    try {
      await api(`/api/admin/reasons/${reason._id}`, { method: 'DELETE' });
      setReasons((prev) => prev.filter((r) => r._id !== reason._id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActingOn(null);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <div>
      <form
        onSubmit={handleAdd}
        className="admin-add-form flex gap-2 mb-4 flex-wrap"
      >
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="New reason (e.g. Sexual content)"
          className="admin-input flex-1 min-w-[200px]"
          maxLength="200"
        />
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={isAdding || !newText.trim()}
        >
          {isAdding ? 'Adding...' : 'Add Reason'}
        </button>
      </form>

      {reasons.length === 0 ? (
        <Empty msg="No report reasons." />
      ) : (
        <div className="admin-table">
          {reasons.map((reason) => (
            <div
              key={reason._id}
              className="admin-row flex items-center gap-3 p-3"
            >
              <span className="flex-1 text-sm">{reason.text}</span>
              <button
                className="admin-btn admin-btn-danger"
                onClick={() => handleDelete(reason)}
                disabled={actingOn === reason._id}
              >
                {actingOn === reason._id ? '...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ----------------------------------------
   ALBUMS TAB
   ---------------------------------------- */

const AlbumsTab = () => {
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingOn, setActingOn] = useState(null);

  const fetchAlbums = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api('/api/admin/albums');
      setAlbums(data.albums || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleDelete = async (album) => {
    if (
      !window.confirm(
        `Delete album "${album.name}"? The posts inside will stay, but the album will be removed.`
      )
    )
      return;
      
    setActingOn(album._id);
    try {
      await api(`/api/admin/albums/${album._id}`, { method: 'DELETE' });
      setAlbums((prev) => prev.filter((a) => a._id !== album._id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActingOn(null);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMsg msg={error} />;
  if (albums.length === 0) return <Empty msg="No albums." />;

  return (
    <div className="admin-table">
      {albums.map((album) => {
        const isActing = actingOn === album._id;
        const cover = album.coverImage || '';

        return (
          <div key={album._id} className="admin-row flex items-center gap-3 p-3 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={cover || 'https://via.placeholder.com/60?text=Album'}
                alt={album.name}
                className="w-12 h-12 rounded object-cover flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm truncate">{album.name}</span>
                <span className="text-xs text-[color:var(--color-gray)] truncate">
                  {album.description || 'No description'} · {album.posts?.length || 0} posts
                </span>
              </div>
            </div>
            
            <button
              className="admin-btn admin-btn-danger flex-shrink-0"
              onClick={() => handleDelete(album)}
              disabled={isActing}
            >
              {isActing ? '...' : 'Delete Album'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

const Loading = () => (
  <div className="flex items-center justify-center py-12">
    <div className="inline-block w-8 h-8 border-4 border-[color:var(--color-gray-light)] border-t-[color:var(--color-primary)] rounded-full animate-spin" />
  </div>
);

const ErrorMsg = ({ msg }) => (
  <p className="text-center text-[color:var(--color-secondary)] py-6">{msg}</p>
);

const Empty = ({ msg }) => (
  <p className="text-center text-[color:var(--color-gray)] py-6">{msg}</p>
);

export default AdminPage;