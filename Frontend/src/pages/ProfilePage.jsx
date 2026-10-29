import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Profile from '../components/profile/Profile';
import EditProfile from '../components/profile/EditProfile';
import PostList from '../components/profile/PostList';
import CreatePost from '../components/profile/CreatePost';
import FriendList from '../components/profile/FriendList';
import AlbumList from '../components/albums/AlbumList';
import FriendButton from '../components/profile/FriendButton';
import { api } from '../api';

const ProfilePage = () => {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [friendsData, setFriendsData] = useState([]);
  const [postsData, setPostsData] = useState([]);
  const [albumsData, setAlbumsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      let targetId = userId;
      if (!targetId) {
        const me = await api('/api/auth/me');
        targetId = me._id;
      }

      const data = await api(`/api/users/${targetId}`);
      const u = data.user;

      setProfileData({
        _id: u._id,
        name: u.name,
        username: u.username,
        email: u.email || '',
        bio: u.bio || '',
        avatar: u.profileImage,
        isAdmin: u.isAdmin,
        postsCount: data.posts?.length || 0,
        albumsCount: data.albums?.length || 0,
        friendsCount: data.friends?.length || 0,
        isOwnProfile: data.isOwnProfile,
        friendshipStatus: data.friendshipStatus,
        limited: data.limited,
      });

      setPostsData(data.posts || []);
      setFriendsData(data.friends || []);
      setAlbumsData(data.albums || []);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-10 h-10 border-4 border-[color:var(--color-gray-light)] border-t-[color:var(--color-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-[900px] mx-auto p-8 text-center">
        <p className="text-[color:var(--color-secondary)]">
          {error || 'Profile not found'}
        </p>
      </div>
    );
  }

  const isOwnProfile = profileData.isOwnProfile;

  return (
    <div className="max-w-[900px] mx-auto p-2 md:p-8 min-h-screen">
      <div className="flex flex-col gap-4 md:gap-8">
        <Profile
          profile={profileData}
          isOwnProfile={isOwnProfile}
          onAvatarChange={(newAvatar) =>
            setProfileData((prev) => ({ ...prev, avatar: newAvatar }))
          }
        />

        {/* Friend button — only when viewing someone else's profile */}
        {!isOwnProfile && (
          <div className="flex justify-center -mt-2 md:-mt-4">
            <FriendButton
              userId={profileData._id}
              friendshipStatus={profileData.friendshipStatus}
              onStatusChange={(newStatus) => {
                setProfileData((prev) => ({
                  ...prev,
                  friendshipStatus: newStatus,
                }));
                if (newStatus === 'friends') {
                  fetchProfile();
                }
              }}
            />
          </div>
        )}

        {isOwnProfile && (
          <>
            <EditProfile
              profile={profileData}
              onUpdate={async (updatedData) => {
                try {
                  const res = await api('/api/users/me', {
                    method: 'PUT',
                    body: JSON.stringify(updatedData),
                  });
                  setProfileData((prev) => ({
                    ...prev,
                    name: res.user.name,
                    username: res.user.username,
                    bio: res.user.bio || '',
                    avatar: res.user.profileImage,
                  }));
                } catch (err) {
                  alert(err.message);
                }
              }}
            />
            <CreatePost onCreated={fetchProfile} />
          </>
        )}

        {!profileData.limited && (
          <>
            <FriendList friends={friendsData} isOwnProfile={isOwnProfile} />
            
            <PostList posts={postsData} isOwnProfile={isOwnProfile} />
            
            <AlbumList
              albums={albumsData}
              isOwnProfile={isOwnProfile}
              onAlbumsChange={setAlbumsData}
            />

            
          </>
        )}




      </div>
    </div>
  );
};

export default ProfilePage;