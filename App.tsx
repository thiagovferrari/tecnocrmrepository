
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Companies } from './pages/Companies';
import { CompanyDetail } from './pages/CompanyDetail';
import { Archived } from './pages/Archived';
import { Settings } from './pages/Settings';
import { History } from './pages/History';
import { Login } from './pages/Login';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { DataProvider } from './src/contexts/DataContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Carregando...</div>;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <PrivateRoute>
              <DataProvider>
                <Layout>
                  <Dashboard />
                </Layout>
              </DataProvider>
            </PrivateRoute>
          } />

          <Route path="/events" element={
            <PrivateRoute>
              <DataProvider>
                <Layout>
                  <Events />
                </Layout>
              </DataProvider>
            </PrivateRoute>
          } />

          <Route path="/events/:id" element={
            <PrivateRoute>
              <DataProvider>
                <Layout>
                  <EventDetail />
                </Layout>
              </DataProvider>
            </PrivateRoute>
          } />

          <Route path="/companies" element={
            <PrivateRoute>
              <DataProvider>
                <Layout>
                  <Companies />
                </Layout>
              </DataProvider>
            </PrivateRoute>
          } />

          <Route path="/companies/:id" element={
            <PrivateRoute>
              <DataProvider>
                <Layout>
                  <CompanyDetail />
                </Layout>
              </DataProvider>
            </PrivateRoute>
          } />

          <Route path="/archived" element={
            <PrivateRoute>
              <DataProvider>
                <Layout>
                  <Archived />
                </Layout>
              </DataProvider>
            </PrivateRoute>
          } />

          <Route path="/settings" element={
            <PrivateRoute>
              <DataProvider>
                <Layout>
                  <Settings />
                </Layout>
              </DataProvider>
            </PrivateRoute>
          } />

          <Route path="/history" element={
            <PrivateRoute>
              <DataProvider>
                <Layout>
                  <History />
                </Layout>
              </DataProvider>
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
