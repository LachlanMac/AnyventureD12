import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ReactNode } from 'react';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Characters from './pages/Characters';
import CharacterCreate from './pages/CharacterCreate';
import CharacterView from './pages/CharacterView';
import Campaigns from './pages/Campaigns';
import ModulesPage from './pages/Modules';
import ModuleBrowser from './pages/ModuleBrowser';

interface MainLayoutProps {
  children: ReactNode;
}

// Layout wrapper component
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
  <>
    <Navbar />
    <div style={{ flex: 1, padding: '1rem' }} className="container mx-auto">
      {children}
    </div>
    <Footer />
  </>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: 'var(--color-dark-base)',
          }}
        >
          {/* Background with stars effect */}
          <div className="stars fixed inset-0" aria-hidden="true"></div>

          {/* Main content */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
            }}
          >
            <Routes>
              {/* Public routes with layout */}
              <Route
                path="/"
                element={
                  <MainLayout>
                    <Home />
                  </MainLayout>
                }
              />
              <Route
                path="/campaigns"
                element={
                  <MainLayout>
                    <Campaigns />
                  </MainLayout>
                }
              />
              <Route
                path="/characters"
                element={
                  <MainLayout>
                    <Characters />
                  </MainLayout>
                }
              />
              <Route
                path="/modules"
                element={
                  <MainLayout>
                    <ModuleBrowser />
                  </MainLayout>
                }
              />

              {/* Login page (no layout) */}
              <Route path="/login" element={<Login />} />

              {/* Protected routes with layout */}
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/characters/create"
                  element={
                    <MainLayout>
                      <CharacterCreate />
                    </MainLayout>
                  }
                />
                <Route
                  path="/characters/:id"
                  element={
                    <MainLayout>
                      <CharacterView />
                    </MainLayout>
                  }
                />
                <Route
                  path="/characters/:id/modules"
                  element={
                    <MainLayout>
                      <ModulesPage />
                    </MainLayout>
                  }
                />
                {/* Add other protected routes here */}
              </Route>
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
