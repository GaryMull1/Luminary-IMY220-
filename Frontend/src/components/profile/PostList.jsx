import React from 'react';
import { Link } from 'react-router-dom';
import './PostList.css';
import Hashtag from '../basic/Hashtag';

const PostList = ({ posts, isOwnProfile }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="post-list-empty flex flex-col items-center justify-center min-h-[200px] p-4 md:p-8">
        <span className="empty-icon mb-4">📷</span>
        <h3 className="text-base md:text-[1.2rem] mb-2">No posts yet</h3>
        <p className="text-sm md:text-base">
          {isOwnProfile
            ? 'Share your first photo with the world!'
            : "This user hasn't posted anything yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="post-list p-2 md:p-8 mt-8">
      <div className="post-list-header pb-2 mb-4 md:mb-8">
        <h3 className="post-list-title text-base md:text-[1.3rem]">
          Posts ({posts.length})
        </h3>
      </div>

      <div className="flex flex-col gap-2 md:gap-4">
        {posts.map((post) => (
          <Link
            to={`/post/${post._id}`}
            key={post._id}
            className="post-item flex flex-col md:flex-row gap-2 md:gap-4 p-2 md:p-4"
          >
            <div className="post-item-image-wrapper w-full h-[150px] md:w-[120px] md:h-[120px] flex-shrink-0">
              <img
                src={post.image}
                alt={post.description}
                className="post-item-image"
                loading="lazy"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between gap-1">
              <p className="post-item-description text-sm md:text-[0.95rem] m-0 mb-1">
                {post.description}
              </p>
              <div className="flex gap-2 md:gap-4">
                <span className="post-stat text-xs md:text-[0.85rem]">
                  ❤️ {Array.isArray(post.likes) ? post.likes.length : post.likes || 0}
                </span>
                <span className="post-stat text-xs md:text-[0.85rem]">
                  💬 {Array.isArray(post.comments) ? post.comments.length : post.comments || 0}
                </span>
              </div>
              <span className="post-item-date text-[0.7rem] md:text-[0.8rem]">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              {post.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {post.hashtags.map((tag, i) => (
                    <Hashtag key={i} tag={tag} />
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PostList;