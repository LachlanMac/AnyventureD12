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
import CharacterEdit from './pages/CharacterEdit';
import CharacterView from './pages/CharacterView';
import Campaigns from './pages/Campaigns';
import CampaignView from './components/campaign/CampaignView';
import CampaignJoin from './components/campaign/CampaignJoin';
import ModulesPage from './pages/Modules';
import ModuleCompendium from './pages/ModuleCompendium';
import SpellsPage from './pages/SpellsPage';
import ItemBrowser from './pages/ItemBrowser';
import ItemManager from './pages/ItemManager';
import ItemCompendium from './pages/ItemCompendium';
import SpellCompendium from './pages/SpellCompendium';
import ConditionsCompendium from './pages/ConditionsCompendium';
import ItemDetail from './pages/ItemDetail';
import SpellDetail from './pages/SpellDetail';

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
                    <ModuleCompendium />
                  </MainLayout>
                }
              />
              <Route
                path="/items"
                element={
                  <MainLayout>
                    <ItemCompendium />
                  </MainLayout>
                }
              />
              <Route
                path="/spells"
                element={
                  <MainLayout>
                    <SpellCompendium />
                  </MainLayout>
                }
              />
              <Route
                path="/conditions"
                element={
                  <MainLayout>
                    <ConditionsCompendium />
                  </MainLayout>
                }
              />
              <Route
                path="/items/:id"
                element={
                  <MainLayout>
                    <ItemDetail />
                  </MainLayout>
                }
              />
              <Route
                path="/spells/:id"
                element={
                  <MainLayout>
                    <SpellDetail />
                  </MainLayout>
                }
              />
              
              {/* Campaign invite join page (no auth required) */}
              <Route
                path="/campaigns/join/:token"
                element={
                  <MainLayout>
                    <CampaignJoin />
                  </MainLayout>
                }
              />

              {/* Login page (no layout) */}
              <Route path="/login" element={<Login />} />

              {/* Protected routes with layout */}
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/campaigns"
                  element={
                    <MainLayout>
                      <Campaigns />
                    </MainLayout>
                  }
                />
                <Route
                  path="/campaigns/:id"
                  element={
                    <MainLayout>
                      <CampaignView />
                    </MainLayout>
                  }
                />
                <Route
                  path="/characters/create"
                  element={
                    <MainLayout>
                      <CharacterCreate />
                    </MainLayout>
                  }
                />
                <Route
                  path="/characters/:id/spells"
                  element={
                    <MainLayout>
                      <SpellsPage />
                    </MainLayout>
                  }
                />
                <Route
                  path="/characters/:id/edit"
                  element={
                    <MainLayout>
                      <CharacterEdit />
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
                <Route
                  path="/character/:characterId/items"
                  element={
                    <MainLayout>
                      <ItemBrowser />
                    </MainLayout>
                  }
                />
                <Route
                  path="/items/manage"
                  element={
                    <MainLayout>
                      <ItemManager />
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
