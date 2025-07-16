import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Footer from "./contact/Footer";
import Navbar from "../componentLibrary/NavBar";

const quickLinks = [
  { name: 'Repository', path: '/repository', icon: '📁' },
  { name: 'Programs', path: '/programs', icon: '🎓' },
  { name: 'News', path: '/news', icon: '📰' },
  { name: 'Blogs', path: '/blogs', icon: '✍️' },
  { name: 'Dues', path: '/dues', icon: '💳' },
  { name: 'Profile', path: '/profile', icon: '👤' },
];

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <div className="text-gray-700">User context is null. Please log in again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2 text-center">Welcome, {user.firstName}!</h2>
          <p className="text-gray-600 text-center mb-6">Glad to have you back. Here’s your personalized RUNACOSS dashboard.</p>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-lg text-primary">{user.firstName} {user.lastName}</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Verified</span>
              </div>
              <div className="text-gray-500 text-sm mb-1">{user.email}</div>
              <div className="text-gray-500 text-sm">{user.matricNumber}</div>
              <div className="text-gray-500 text-sm">{user.department}</div>
            </div>
            <img
              className="h-24 w-24 rounded-full object-cover border-4 border-blue-100 shadow-lg"
              src={user.avatar?.url ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}${user.avatar.url}` : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
              alt={user.avatar?.alt || "User profile"}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            {quickLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center gap-3 px-6 py-4 bg-blue-50 rounded-lg shadow hover:bg-blue-100 transition cursor-pointer text-primary font-semibold text-lg justify-center"
              >
                <span className="text-2xl">{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard; 