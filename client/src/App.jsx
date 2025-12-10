import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import Transfers from './pages/Transfers';
import Assignments from './pages/Assignments';

import Header from './components/Header';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="min-h-screen bg-[#0f1218] text-gray-100 flex font-sans">
      <Navbar />
      <div className="flex-1 p-8 overflow-y-auto h-screen relative">
        <Header />
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/purchases" element={
            <ProtectedRoute>
              <Purchases />
            </ProtectedRoute>
          } />
          <Route path="/transfers" element={
            <ProtectedRoute>
              <Transfers />
            </ProtectedRoute>
          } />
          <Route path="/assignments" element={
            <ProtectedRoute>
              <Assignments />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
