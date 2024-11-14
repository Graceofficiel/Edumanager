import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './context/ThemeContext';
import { SchoolProvider } from './context/SchoolContext';
import { AuthProvider } from './context/AuthContext';
import { CycleProvider } from './context/CycleContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeCustomizer from './components/ThemeCustomizer';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Profile from './pages/admin/Profile';
import CycleManagement from './pages/admin/CycleManagement';
import DataStructure from './pages/admin/DataStructure';
import ImportData from './pages/admin/ImportData';
import SchoolSettings from './pages/admin/SchoolSettings';
import Login from './pages/student/Login';
import Results from './pages/student/Results';

function App() {
  return (
    <ThemeProvider>
      <SchoolProvider>
        <AuthProvider>
          <CycleProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/settings" element={<SchoolSettings />} />
                          <Route path="/cycle/:cycleId" element={<CycleManagement />} />
                          <Route path="/class/:cycleId/:classId/structure" element={<DataStructure />} />
                          <Route path="/class/:cycleId/:classId/import" element={<ImportData />} />
                        </Routes>
                        <ThemeCustomizer />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/results/:cycleId/:classId/:studentId" element={<Results />} />
                <Route path="/" element={<Navigate to="/admin" replace />} />
              </Routes>
              <Toaster position="top-right" richColors />
            </BrowserRouter>
          </CycleProvider>
        </AuthProvider>
      </SchoolProvider>
    </ThemeProvider>
  );
}

export default App;