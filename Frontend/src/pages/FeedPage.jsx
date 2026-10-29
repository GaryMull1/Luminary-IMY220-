import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import './FeedPage.css';
import Hashtag from '../components/basic/Hashtag';

const FeedPage = () => {
  const [feedType, setFeedType] = useState('local');
  const [feed, setFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchFeed = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await api(`/api/activity/${feedType}`);
        if (!cancelled) setFeed(data.feed || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load feed');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchFeed();
    return () => { cancelled = true; };
  }, [feedType]);

  return (
    <div className="max-w-[800px] mx-auto p-2 md:p-8">
      <div className="text-center mb-4 md:mb-6">
        <h1 className="text-2xl md:text-4xl mb-1">Activity Feed</h1>
        <p className="feed-subtitle text-sm md:text-lg">
          {feedType === 'local'
            ? 'See what your friends are sharing'
            : 'Discover posts from the community'}
        </p>
      </div>

      <div className="flex justify-center gap-1 md:gap-2 mb-4 md:mb-8">
        <button
          className={`feed-tab px-3 py-1.5 md:px-6 md:py-2.5 text-xs md:text-sm ${
            feedType === 'local' ? 'active' : ''
          }`}
          onClick={() => setFeedType('local')}
        >
          Friends
        </button>
        <button
          className={`feed-tab px-3 py-1.5 md:px-6 md:py-2.5 text-xs md:text-sm ${
            feedType === 'global' ? 'active' : ''
          }`}
          onClick={() => setFeedType('global')}
        >
          Global
        </button>
      </div>

      {isLoading && (
        <p className="text-center text-[color:var(--color-gray)] py-8">
          Loading feed...
        </p>
      )}

      {error && (
        <p className="text-center text-[color:var(--color-secondary)] py-8">
          {error}
        </p>
      )}

      {!isLoading && !error && feed.length === 0 && (
        <p className="text-center text-[color:var(--color-gray)] py-8">
          No activity yet.
        </p>
      )}

      <div className="flex flex-col gap-4 md:gap-8">
        {feed.map((item) => {
          const post = item.post;
          const album = item.album;

          if (album) {
            const owner = album.owner || item.user;
            const createdLabel = new Date(item.createdAt).toLocaleString();
            const cover = album.coverImage || album.posts?.[0]?.image || '';

            return (
              <article key={item._id} className="post-card">
                <div className="flex items-center justify-between p-3 md:p-5">
                  <Link
                    to={`/profile/${owner._id}`}
                    className="post-user flex items-center gap-2 md:gap-3 flex-1"
                  >
                    <img
                      src={
                        owner.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          owner.name
                        )}&background=6C63FF&color=fff&size=40`
                      }
                      alt={owner.name}
                      className="post-avatar w-8 h-8 md:w-10 md:h-10"
                    />
                    <div className="flex flex-col">
                      <span className="post-username text-sm md:text-[0.95rem]">
                        {owner.name}
                      </span>
                      <span className="post-userhandle text-xs md:text-[0.8rem]">
                        @{owner.username} · created an album
                      </span>
                    </div>
                  </Link>
                  <span className="post-time text-xs md:text-[0.8rem]">
                    {createdLabel}
                  </span>
                </div>

                <Link to={`/album/${album._id}`} className="post-image-link">
                  <div className="post-image-wrapper">
                    {cover ? (
                      <img
                        src={cover}
                        alt={album.name}
                        className="post-image"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-[color:var(--color-gray-light)] flex items-center justify-center text-sm">
                        {album.name}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-3 md:p-5">
                  <Link
                    to={`/album/${album._id}`}
                    className="post-description-link"
                  >
                    <p className="post-description text-sm md:text-[0.95rem] leading-relaxed mb-2">
                      <strong>{album.name}</strong>
                      {album.description && ` — ${album.description}`}
                    </p>
                  </Link>
                  {album.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {album.hashtags.map((tag, index) => (
                        <Hashtag key={index} tag={tag} />
                      ))}
                    </div>
                  )}
                  <div className="post-stats flex gap-4 md:gap-6 pt-3">
                    <span className="post-stat text-xs md:text-[0.9rem]">
                      🖼️ {album.posts?.length || album.postCount || 0} posts
                    </span>
                  </div>
                </div>
              </article>
            );
          }

          if (!post) return null;

          if (post.isHidden) {
            return (
              <article key={item._id} className="post-card p-4 text-center">
                <p className="text-[color:var(--color-gray)] mb-2">
                  ⚠️ This post has been reported and is hidden.
                </p>
                <Link
                  to={`/post/${post._id}`}
                  className="text-xs text-[color:var(--color-primary)] underline"
                >
                  View post anyway →
                </Link>
              </article>
            );
          }

          const owner = post.owner || item.user;
          const createdLabel = new Date(item.createdAt).toLocaleString();

          return (
            <article key={item._id} className="post-card">
              <div className="flex items-center justify-between p-3 md:p-5">
                <Link
                  to={`/profile/${owner._id}`}
                  className="post-user flex items-center gap-2 md:gap-3 flex-1"
                >
                  <img
                    src={
                      owner.profileImage ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        owner.name
                      )}&background=6C63FF&color=fff&size=40`
                    }
                    alt={owner.name}
                    className="post-avatar w-8 h-8 md:w-10 md:h-10"
                  />
                  <div className="flex flex-col">
                    <span className="post-username text-sm md:text-[0.95rem]">
                      {owner.name}
                    </span>
                    <span className="post-userhandle text-xs md:text-[0.8rem]">
                      @{owner.username}
                    </span>
                  </div>
                </Link>
                <span className="post-time text-xs md:text-[0.8rem]">
                  {createdLabel}
                </span>
              </div>

              <Link to={`/post/${post._id}`} className="post-image-link">
                <div className="post-image-wrapper">
                  <img
                    src={post.image}
                    alt={post.description}
                    className="post-image"
                  />
                </div>
              </Link>

              <div className="p-3 md:p-5">
                <Link
                  to={`/post/${post._id}`}
                  className="post-description-link"
                >
                  <p className="post-description text-sm md:text-[0.95rem] leading-relaxed mb-2">
                    {post.description}
                  </p>
                </Link>
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.hashtags?.map((tag, index) => (
                    <Hashtag key={index} tag={tag} />
                  ))}
                </div>
                <div className="post-stats flex gap-4 md:gap-6 pt-3">
                  <span className="post-stat text-xs md:text-[0.9rem]">
                    ❤️{' '}
                    {Array.isArray(post.likes)
                      ? post.likes.length
                      : post.likes || 0}
                  </span>
                  <span className="post-stat text-xs md:text-[0.9rem]">
                    💬 {post.comments?.length || 0}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default FeedPage; 