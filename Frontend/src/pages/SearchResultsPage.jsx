import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import './SearchResultsPage.css';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'users', label: 'Users' },
  { key: 'posts', label: 'Posts' },
  { key: 'albums', label: 'Albums' },
];

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const hashtag = searchParams.get('hashtag') || '';
  const type = searchParams.get('type') || 'all';

  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState({ users: [], posts: [], albums: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const runSearch = useCallback(async () => {
    if (!query && !hashtag) {
      setResults({ users: [], posts: [], albums: [] });
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (hashtag) params.set('hashtag', hashtag);
      params.set('type', type);
      const data = await api(`/api/search?${params.toString()}`);
      setResults({
        users: data.users || [],
        posts: data.posts || [],
        albums: data.albums || [],
      });
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, [query, hashtag, type]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (inputValue.trim()) next.set('q', inputValue.trim());
    next.set('type', type);
    setSearchParams(next);
  };

  const setTab = (newType) => {
    const next = new URLSearchParams(searchParams);
    next.set('type', newType);
    setSearchParams(next);
  };

  const clearHashtag = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('hashtag');
    setSearchParams(next);
  };

  const total =
    results.users.length + results.posts.length + results.albums.length;

  return (
    <div className="max-w-[960px] mx-auto px-3 py-6 md:px-8 md:py-12 min-h-screen">
      <h1 className="text-2xl md:text-3xl mb-6 md:mb-8 text-center">Search</h1>

      <form onSubmit={handleSubmit} className="search-results-form mb-6 md:mb-8">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search users, posts, albums…"
          className="search-input w-full py-2.5 md:py-3.5 px-4 text-sm md:text-base"
        />
      </form>

      {hashtag && (
        <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
          <span className="text-sm">
            Filtering by hashtag{' '}
            <strong className="text-[color:var(--color-primary)]">
              #{hashtag}
            </strong>
          </span>
          <button
            onClick={clearHashtag}
            className="text-xs underline text-[color:var(--color-gray)]"
          >
            clear
          </button>
        </div>
      )}

      <div className="flex justify-center gap-1 md:gap-2 mb-6 md:mb-10 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`feed-tab px-3 py-1.5 md:px-5 md:py-2 text-xs md:text-sm ${
              type === t.key ? 'active' : ''
            }`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <p className="text-center text-[color:var(--color-gray)] py-12">
          Searching…
        </p>
      )}

      {error && (
        <p className="text-center text-[color:var(--color-secondary)] py-12">
          {error}
        </p>
      )}

      {!isLoading && !error && total === 0 && (query || hashtag) && (
        <p className="text-center text-[color:var(--color-gray)] py-12">
          No results found.
        </p>
      )}

      {!isLoading && !error && total > 0 && (
        <div className="flex flex-col gap-10 md:gap-14">
          {/* USERS */}
          {(type === 'all' || type === 'users') && results.users.length > 0 && (
            <section>
              <h2 className="text-lg md:text-xl mb-4 md:mb-5">
                Users ({results.users.length})
              </h2>
              <div className="flex flex-col gap-2 md:gap-3">
                {results.users.map((u) => (
                  <Link
                    key={u._id}
                    to={`/profile/${u._id}`}
                    className="search-result-row flex items-center gap-3 md:gap-4 p-3 md:p-4 no-underline text-inherit"
                  >
                    <img
                      src={
                        u.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          u.name
                        )}&background=6C63FF&color=fff&size=40`
                      }
                      alt={u.name}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm md:text-base truncate">
                        {u.name}
                      </span>
                      <span className="text-xs md:text-sm text-[color:var(--color-gray)] truncate">
                        @{u.username}
                        {u.email && ` · ${u.email}`}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* POSTS */}
          {(type === 'all' || type === 'posts') && results.posts.length > 0 && (
            <section>
              <h2 className="text-lg md:text-xl mb-4 md:mb-5">
                Posts ({results.posts.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {results.posts.map((p) => (
                  <Link
                    key={p._id}
                    to={`/post/${p._id}`}
                    className="search-post-tile relative block aspect-square rounded-lg overflow-hidden no-underline"
                  >
                    <img
                      src={p.image}
                      alt={p.description}
                      className="w-full h-full object-cover"
                    />
                    {p.isHidden && (
                      <span className="absolute top-2 left-2 text-xs bg-[color:var(--color-secondary)] text-white rounded px-1.5 py-0.5">
                        hidden
                      </span>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 line-clamp-2">
                      {p.description}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ALBUMS */}
          {(type === 'all' || type === 'albums') && results.albums.length > 0 && (
            <section>
              <h2 className="text-lg md:text-xl mb-4 md:mb-5">
                Albums ({results.albums.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {results.albums.map((a) => (
                  <Link
                    key={a._id}
                    to={`/album/${a._id}`}
                    className="search-album-card block rounded-lg overflow-hidden no-underline text-inherit"
                  >
                    {a.coverImage ? (
                      <img
                        src={a.coverImage}
                        alt={a.name}
                        className="w-full aspect-square object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-[color:var(--color-gray-light)] flex items-center justify-center text-sm p-3 text-center">
                        {a.name}
                      </div>
                    )}
                    <div className="p-3 md:p-4">
                      <div className="text-sm md:text-base font-semibold mb-1 truncate">
                        {a.name}
                      </div>
                      <div className="text-xs md:text-sm text-[color:var(--color-gray)] truncate">
                        {a.postCount} {a.postCount === 1 ? 'post' : 'posts'}
                        {a.owner && ` · @${a.owner.username}`}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;