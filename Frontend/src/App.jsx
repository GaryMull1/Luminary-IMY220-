import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashPage from './pages/SplashPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import PostPage from './pages/PostPage';
import CreatePost from './components/profile/CreatePost';
import Navigation from './components/basic/Navigation';
import ProtectedRoute from './components/basic/ProtectedRoute';
import AdminRoute from './components/basic/AdminRoute';
import AlbumPage from './pages/AlbumPage';
import FriendRequestPage from './pages/FriendRequestPage';
import AdminPage from './pages/AdminPage';
import SearchResultsPage from './pages/SearchResultsPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Navigation />
                <main className="app-main">
                  <Routes>
                    <Route path="/home" element={<FeedPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/:userId" element={<ProfilePage />} />
                    <Route path="/post/:postId" element={<PostPage />} />
                    <Route path="/create" element={<CreatePost />} />
                    <Route path="/album/:albumId" element={<AlbumPage />} />
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route
                      path="/friends/requests"
                      element={<FriendRequestPage />}
                    />
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminPage />
                        </AdminRoute>
                      }
                    />
                  </Routes>
                </main>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;