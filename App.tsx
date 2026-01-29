
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Companies } from './pages/Companies';
import { CompanyDetail } from './pages/CompanyDetail';
import { Settings } from './pages/Settings';
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
      <DataProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/events" element={
              <PrivateRoute>
                <Layout>
                  <Events />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/events/:id" element={
              <PrivateRoute>
                <Layout>
                  <EventDetail />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/companies" element={
              <PrivateRoute>
                <Layout>
                  <Companies />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/companies/:id" element={
              <PrivateRoute>
                <Layout>
                  <CompanyDetail />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/settings" element={
              <PrivateRoute>
                <Layout>
                  <Settings />
                </Layout>
              </PrivateRoute>
            } />

          </Routes>
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
