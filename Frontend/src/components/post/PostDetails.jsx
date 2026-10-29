import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import './PostDetails.css';
import AlbumPicker from './AlbumPicker';
import Hashtag from '../basic/Hashtag';

const PostDetails = ({ post, isOwner, currentUser, onEdit, onDelete }) => {
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [reportReasons, setReportReasons] = useState([]);
  const [reasonsLoading, setReasonsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const initialLikes = Array.isArray(post.likes)
    ? post.likes.length
    : post.likes || 0;
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!showActions) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowActions(false);
        setShowReportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showActions]);

  const handleLike = async () => {
    if (!currentUser) {
      alert('Please log in to like posts.');
      return;
    }
    if (isLiking) return;
    setIsLiking(true);

    const prevLikes = likes;
    const prevIsLiked = isLiked;
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);

    try {
      const res = await api(`/api/posts/${post._id}/like`, { method: 'POST' });
      setLikes(res.likes);
      setIsLiked(res.isLiked);
    } catch (err) {
      setLikes(prevLikes);
      setIsLiked(prevIsLiked);
      alert(err.message);
    } finally {
      setIsLiking(false);
    }
  };

  const handleOpenReportMenu = async () => {
    setShowReportMenu(true);
    if (reportReasons.length === 0) {
      setReasonsLoading(true);
      try {
        const data = await api('/api/reports/reasons');
        setReportReasons(data.reasons || []);
      } catch (err) {
        alert(err.message);
        setShowReportMenu(false);
      } finally {
        setReasonsLoading(false);
      }
    }
  };

  const handleReport = async (reasonId) => {
    try {
      await api('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ postId: post._id, reasonId }),
      });
      setFeedback('Report submitted. Thanks for helping keep the community safe.');
      setShowActions(false);
      setShowReportMenu(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddToAlbum = () => {
    setShowAlbumPicker(true);
    setShowActions(false);
  };

  const closeAndRun = (fn) => () => {
    setShowActions(false);
    setShowReportMenu(false);
    fn();
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="post-details">
      <div className="post-details-header flex items-center justify-between p-2 md:p-4">
        <Link
          to={`/profile/${post.owner._id}`}
          className="post-details-user flex items-center gap-2"
        >
          <img
            src={
              post.owner.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                post.owner.name
              )}&background=6C63FF&color=fff&size=60`
            }
            alt={post.owner.name}
            className="post-details-avatar w-9 h-9 md:w-12 md:h-12"
          />
          <div className="flex flex-col">
            <div className="post-details-name flex items-center gap-1 text-sm md:text-base">
              {post.owner.name}
            </div>
            <span className="post-details-username text-xs md:text-sm">
              @{post.owner.username}
            </span>
          </div>
        </Link>

        {currentUser && (
          <div className="relative" ref={dropdownRef}>
            <button
              className="post-details-action-btn text-2xl px-2 py-1"
              onClick={() => {
                setShowActions((s) => !s);
                setShowReportMenu(false);
              }}
              aria-label="Post actions"
            >
              ⋮
            </button>

            {showActions && (
              <div className="action-dropdown min-w-[200px] p-2">
                {isOwner ? (
                  <>
                    <button
                      onClick={closeAndRun(onEdit)}
                      className="dropdown-item flex items-center gap-2 w-full px-3 py-2 text-sm"
                    >
                      Edit Post
                    </button>
                    <button
                      onClick={closeAndRun(handleAddToAlbum)}
                      className="dropdown-item flex items-center gap-2 w-full px-3 py-2 text-sm"
                    >
                      Add to Album
                    </button>
                    <button
                      onClick={closeAndRun(onDelete)}
                      className="dropdown-item danger flex items-center gap-2 w-full px-3 py-2 text-sm"
                    >
                      Delete Post
                    </button>
                  </>
                ) : showReportMenu ? (
                  <>
                    <div className="dropdown-item text-xs text-[color:var(--color-gray)] px-3 py-1 cursor-default">
                      Why are you reporting this?
                    </div>
                    {reasonsLoading ? (
                      <div className="dropdown-item px-3 py-2 text-sm text-[color:var(--color-gray)]">
                        Loading reasons...
                      </div>
                    ) : (
                      reportReasons.map((reason) => (
                        <button
                          key={reason._id}
                          onClick={() => handleReport(reason._id)}
                          className="dropdown-item flex items-center gap-2 w-full px-3 py-2 text-sm"
                        >
                          {reason.text}
                        </button>
                      ))
                    )}
                    <button
                      onClick={() => setShowReportMenu(false)}
                      className="dropdown-item flex items-center gap-2 w-full px-3 py-2 text-sm text-[color:var(--color-gray)]"
                    >
                      ← Back
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleOpenReportMenu}
                    className="dropdown-item danger flex items-center gap-2 w-full px-3 py-2 text-sm"
                  >
                    Report Post
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-details-image-wrapper">
        <img
          src={post.image}
          alt={post.description}
          className="post-details-image"
        />
      </div>

      <div className="p-2 md:p-8">
        <p className="post-details-description text-sm md:text-[1.05rem] leading-relaxed md:leading-[1.8] mb-4">
          {post.description}
        </p>

        {post.hashtags?.length > 0 && (
          <div className="post-details-hashtags flex flex-wrap gap-2 mb-4">
            {post.hashtags.map((tag, index) => (
              <Hashtag key={index} tag={tag} />
            ))}
          </div>
        )}

        {post.albums?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <span className="text-xs text-[color:var(--color-gray)] font-semibold uppercase tracking-wider">
              In Albums:
            </span>
            {post.albums.map((album) => (
              <Link
                key={album._id}
                to={`/album/${album._id}`}
                className="flex items-center gap-1 bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] px-3 py-1 rounded-full text-xs font-semibold hover:bg-[color:var(--color-primary)]/20 transition-colors no-underline"
              >
                📁 {album.name}
              </Link>
            ))}
          </div>
        )}
        
        {feedback && (
          <p className="text-sm text-[color:var(--color-primary)] mb-2">
            {feedback}
          </p>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 py-4 border-b border-[color:var(--color-gray-light)] mb-2">
          <div className="flex items-center gap-4 md:gap-8">
            <button
              className={`like-btn flex items-center gap-1 text-base px-2 py-1 ${isLiked ? 'liked' : ''
                }`}
              onClick={handleLike}
              disabled={isLiking}
            >
              <span className="like-icon">{isLiked ? '❤️' : '🤍'}</span>
              <span>{likes}</span>
            </button>
            <span className="comment-stat flex items-center gap-1">
              <span>💬</span>
              <span>{post.comments?.length || 0}</span>
            </span>
          </div>
          <span className="post-time text-xs md:text-sm">
            {formatDate(post.createdAt)}
          </span>
        </div>
      </div>
      {showAlbumPicker && (
        <AlbumPicker
          postId={post._id}
          onClose={() => setShowAlbumPicker(false)}
          onAdded={() => setFeedback('Post added to album.')}
        />
      )}
    </div>
  );
};

export default PostDetails;