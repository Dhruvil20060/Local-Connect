import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProviderRegister from './pages/ProviderRegister';
import Providers from './pages/Providers';
import ProviderDetails from './pages/ProviderDetails';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <MainLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/provider" element={<ProviderRegister />} />
        <Route path="/become-provider" element={<ProviderRegister />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/providers/:id" element={<ProviderDetails />} />

        {/* Protected Customer Routes */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Provider Routes */}
        <Route
          path="/provider/dashboard"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'subadmin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Shared Protected Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
