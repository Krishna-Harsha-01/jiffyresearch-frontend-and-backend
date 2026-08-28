import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import DashboardPage from './pages/DashboardPage';
import WorkspacePage from './pages/WorkspacePage';
import AdminSecurityDashboard from './components/AdminSecurityDashboard';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
          <Navbar />
          <main className="flex-1 pt-16">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ForgotPasswordPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workspace/:id"
                element={
                  <ProtectedRoute>
                    <WorkspacePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/security"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSecurityDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
