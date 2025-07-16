import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/about/AboutPage";
import ProgramDetail from "./pages/programs/programDetails/ProgramDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import BlogForm from "./components/BlogForm";

import NewsList from "./pages/news/newsPage/NewsList";
import BlogList from "./pages/blogs/blogsPage/BlogsList";
import RepositoryCategory from "./pages/repository/RepositoryCategory";
import RepositorySearch from "./pages/repository/RepositorySearch";

import RepositoryFileTable from "./pages/repository/RepositoryFileTable";
import RepositoryLevelSelector from "./pages/repository/RepositoryLevelSelector";
import Repository from "./pages/repository/Repository";
import PaymentPage from "./pages/payment/PaymentPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import PaymentSuccess from './pages/payment/PaymentSuccess';

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminManagement from "./pages/admin/AdminManagement";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import AboutUser from "./pages/about/AboutUser";
import Programs from "./pages/programs/Programs";
import Profile from './pages/profile/Profile';

function App() {
  return (
    <div className="scroll-smooth">
      <Routes>
        {/* Redirect /repo to /repository for compatibility */}
        <Route path="/repo" element={<Navigate to="/repository" replace />} />
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route path="/signup" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={
          <AdminProtectedRoute requireAuth={false}>
            <AdminLogin />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute requireAuth={true}>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/management" element={
          <AdminProtectedRoute requireAuth={true}>
            <AdminManagement />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/management/:section" element={
          <AdminProtectedRoute requireAuth={true}>
            <AdminManagement />
          </AdminProtectedRoute>
        } />

        {/* Public Routes */}
        <Route path="/about-runacoss" element={<AboutPage />} />
        <Route path="/programs/:courseId" element={<ProgramDetail />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/news" element={<NewsList />} />
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/dues" element={<PaymentPage />} />
        <Route path="/about-user" element={<AboutUser />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/payment/success" element={<PaymentSuccess />} />

        {/* Authenticated User Home (Dashboard) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Protected Routes */}
        <Route path="/blogs/new" element={
          <ProtectedRoute>
            <BlogForm />
          </ProtectedRoute>
        } />
        <Route path="/blogs/edit/:id" element={
          <ProtectedRoute>
            <BlogForm />
          </ProtectedRoute>
        } />

        {/* Repository Routes */}
        <Route path="/repository" element={<Repository />} />
        <Route path="/repository/search" element={
          <ProtectedRoute>
            <RepositorySearch />
          </ProtectedRoute>
        } />
        <Route path="/repository/category/:category" element={
          <ProtectedRoute>
            <RepositoryCategory />
          </ProtectedRoute>
        } />
        <Route path="/repository/upload" element={
          <ProtectedRoute>
            <RepositoryCategory />
          </ProtectedRoute>
        } />
        <Route path="/repository/multimedia" element={
          <ProtectedRoute>
            <RepositoryCategory />
          </ProtectedRoute>
        } />
        <Route path="/repository/recent" element={
          <ProtectedRoute>
            <RepositoryCategory />
          </ProtectedRoute>
        } />
        {/* Legacy Repository Routes (keeping for backward compatibility) */}
        <Route path="/repository/:category" element={
          <ProtectedRoute>
            <RepositoryCategory />
          </ProtectedRoute>
        } />
        <Route path="/repository/:category/:department" element={
          <ProtectedRoute>
            <RepositoryLevelSelector />
          </ProtectedRoute>
        } />
        <Route path="/repository/:category/:department/:level/:semester" element={
          <ProtectedRoute>
            <RepositoryFileTable />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;

