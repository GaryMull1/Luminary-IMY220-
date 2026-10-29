import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import './AlbumPage.css';
import Hashtag from '../components/basic/Hashtag';

const AlbumPage = () => {
  const { albumId } = useParams();
  const [album, setAlbum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    api('/api/auth/me')
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null));
  }, []);

  const fetchAlbum = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api(`/api/albums/${albumId}`);
      setAlbum(data.album);
    } catch (err) {
      setError(err.message || 'Failed to load album');
    } finally {
      setIsLoading(false);
    }
  }, [albumId]);

  useEffect(() => {
    fetchAlbum();
  }, [fetchAlbum]);

  const handleRemove = async (postId) => {
    setRemovingId(postId);
    try {
      await api(`/api/albums/${albumId}/posts/${postId}`, {
        method: 'DELETE',
      });
      setAlbum((prev) => ({
        ...prev,
        posts: prev.posts.filter((p) => p._id !== postId),
      }));
      setConfirmingId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-10 h-10 border-4 border-[color:var(--color-gray-light)] border-t-[color:var(--color-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="max-w-[900px] mx-auto p-8 text-center">
        <p className="text-[color:var(--color-secondary)]">
          {error || 'Album not found'}
        </p>
        <Link
          to="/home"
          className="btn btn-primary mt-4 inline-block px-4 py-2"
        >
          Go Home
        </Link>
      </div>
    );
  }

  const isOwner =
    currentUser && album.owner && currentUser._id === album.owner._id.toString();

  return (
    <div className="max-w-[900px] mx-auto p-2 md:p-8 min-h-screen">
      <Link
        to={`/profile/${album.owner?._id}`}
        className="back-button px-2 py-1 md:px-4 md:py-2"
      >
        ← Back to Profile
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl md:text-3xl mb-2">{album.name}</h1>
        {album.description && (
          <p className="text-[color:var(--color-gray)] mb-2">
            {album.description}
          </p>
        )}
        {album.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {album.hashtags.map((tag, i) => (
              <Hashtag key={i} tag={tag} />
            ))}
          </div>
        )}
      </div>

      {album.posts?.length === 0 ? (
        <p className="text-center text-[color:var(--color-gray)] py-8">
          This album is empty.
          {isOwner && (
            <>
              {' '}
              You can add posts from any of your posts by clicking
              the ⋮ menu → <strong>Add to Album</strong>.
            </>
          )}
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mt-4">
          {album.posts.map((post) => {
            const isRemoving = removingId === post._id;
            const isConfirming = confirmingId === post._id;

            return (
              <div
                key={post._id}
                className="album-tile aspect-square overflow-hidden rounded-md"
              >
                <Link
                  to={`/post/${post._id}`}
                  className="block w-full h-full"
                >
                  <img
                    src={post.image}
                    alt={post.description}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {isOwner && !isConfirming && (
                  <button
                    className="album-remove-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      setConfirmingId(post._id);
                    }}
                    aria-label="Remove from album"
                  >
                    ✕
                  </button>
                )}

                {isOwner && isConfirming && (
                  <div className="album-confirm-overlay">
                    <p className="text-xs md:text-sm text-white mb-2 text-center">
                      Remove from album?
                    </p>
                    <div className="flex gap-2">
                      <button
                        className="album-confirm-btn album-confirm-danger"
                        onClick={() => handleRemove(post._id)}
                        disabled={isRemoving}
                      >
                        {isRemoving ? '...' : 'Remove'}
                      </button>
                      <button
                        className="album-confirm-btn"
                        onClick={() => setConfirmingId(null)}
                        disabled={isRemoving}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isOwner && album.posts?.length > 0 && (
        <p className="text-center text-xs text-[color:var(--color-gray)] mt-6">
          Hover a photo and click ✕ to remove it from this album.
        </p>
      )}
    </div>
  );
};

export default AlbumPage;