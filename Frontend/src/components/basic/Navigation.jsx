import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import './Navigation.css';
import ThemeToggle from '../basic/ThemeToggle';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    api('/api/auth/me')
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch {
    }
    window.location.href = '/';
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <nav className="main-nav">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-12 md:h-14 lg:h-16 flex items-center justify-between">
        <div className="nav-brand">
          <Link to="/home" className="nav-logo flex items-center gap-2">
            <span className="text-lg md:text-2xl">✦</span>
            Luminary
          </Link>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <form onSubmit={onSubmit} className="nav-search">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="search-input text-sm"
            />
          </form>
          <Link
            to="/home"
            className={`nav-link text-xs md:text-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 ${
              isActive('/home') ? 'active' : ''
            }`}
          >
            Home
          </Link>
          <Link
            to="/profile"
            className={`nav-link text-xs md:text-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 ${
              isActive('/profile') ? 'active' : ''
            }`}
          >
            Profile
          </Link>

          {user?.isAdmin && (
            <Link
              to="/admin"
              className={`nav-link text-xs md:text-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 ${
                isActive('/admin') ? 'active' : ''
              }`}
            >
              Admin
            </Link>
          )}

          <Link
            to="/create"
            className="nav-btn nav-create rounded-full text-xs md:text-sm px-3 py-1.5 md:px-5 md:py-2"
          >
            + New Post
          </Link>

          <ThemeToggle />

          <button
            onClick={handleLogout}
            className="nav-link text-xs md:text-sm rounded-full px-3 py-1.5 md:px-4 md:py-2"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;