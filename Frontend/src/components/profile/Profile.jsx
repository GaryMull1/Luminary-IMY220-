import React from 'react';
import './Profile.css';
import AvatarUploader from './AvatarUploader';

const Profile = ({ profile, isOwnProfile, onAvatarChange }) => {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    profile.name
  )}&background=6C63FF&color=fff&size=120`;

  // ----- LIMITED VIEW (not friends, not own profile) -----
  if (profile.limited) {
    return (
      <div className="profile flex flex-col items-center p-4 md:p-8">
        <img
          src={profile.avatar || defaultAvatar}
          alt={profile.name}
          className="profile-avatar w-20 h-20 md:w-[120px] md:h-[120px] mb-4"
        />
        <h1 className="profile-name text-xl md:text-[1.8rem]">
          {profile.name}
        </h1>
        <p className="profile-username text-sm md:text-base">
          @{profile.username}
        </p>
        <p className="text-[color:var(--color-gray)] mt-4 text-sm text-center max-w-md">
          You need to be friends with this user to see their full profile.
        </p>
      </div>
    );
  }

  // ----- FULL PROFILE -----
  return (
    <div className="profile flex flex-col items-center p-4 md:p-8">
      <div className="mb-4">
        {isOwnProfile ? (
          <AvatarUploader
            profile={profile}
            onAvatarUpdated={onAvatarChange}
          />
        ) : (
          <img
            src={profile.avatar || defaultAvatar}
            alt={profile.name}
            className="profile-avatar w-20 h-20 md:w-[120px] md:h-[120px]"
          />
        )}
      </div>

      <div className="text-center w-full">
        <h1 className="profile-name text-xl md:text-[1.8rem] m-0 mb-1">
          {profile.name}
        </h1>
        <p className="profile-username text-sm md:text-base m-0 mb-2">
          @{profile.username}
        </p>

        {profile.bio && (
          <p className="profile-bio text-sm md:text-base my-2">
            {profile.bio}
          </p>
        )}

        <div className="profile-stats flex flex-wrap justify-center gap-4 md:gap-16 mt-4 pt-4">
          <div className="stat-item">
            <span className="stat-number text-base md:text-[1.2rem]">
              {profile.postsCount || 0}
            </span>
            <span className="stat-label text-[0.7rem] md:text-[0.8rem]">
              Posts
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-number text-base md:text-[1.2rem]">
              {profile.friendsCount || 0}
            </span>
            <span className="stat-label text-[0.7rem] md:text-[0.8rem]">
              Friends
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;