import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SurveyQuestion from './components/Survey/SurveyQuestion';
import SurveyComplete from './components/Survey/SurveyComplete';
import Dashboard from './components/Admin/Dashboard';
import UserManagement from './components/Admin/UserManagement';
import Reports from './components/Admin/Reports';
import { isAuthenticated, isAdmin } from './utils/auth';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected User Routes */}
        <Route
          path="/survey"
          element={
            <ProtectedRoute>
              <SurveyQuestion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complete"
          element={
            <ProtectedRoute>
              <SurveyComplete />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin={true}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            isAuthenticated() ? (
              isAdmin() ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/survey" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
