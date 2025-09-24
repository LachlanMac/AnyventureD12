import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ui/ToastContainer';
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
import SongCompendium from './pages/SongCompendium';
import ConditionsCompendium from './pages/ConditionsCompendium';
import RecipeCompendium from './pages/RecipeCompendium';
import ItemDetail from './pages/ItemDetail';
import SpellDetail from './pages/SpellDetail';
import SongDetail from './pages/SongDetail';
import SongsPage from './pages/SongsPage';
import HomebrewBrowser from './pages/HomebrewBrowser';
import HomebrewItemBrowser from './pages/HomebrewItemBrowser';
import HomebrewItemCreator from './pages/HomebrewItemCreator';
import HomebrewSpellBrowser from './pages/HomebrewSpellBrowser';
import HomebrewSpellCreator from './pages/HomebrewSpellCreator';
import HomebrewCreatureBrowser from './pages/HomebrewCreatureBrowser';
import HomebrewCreatureCreator from './pages/HomebrewCreatureCreator';
import Bestiary from './pages/Bestiary';
import CreatureDetail from './pages/CreatureDetail';
import Profile from './pages/Profile';

// Wiki Components
import WikiLayout from './components/wiki/WikiLayout';
import WikiHome from './components/wiki/WikiHome';
import WikiPage from './components/wiki/WikiPage';

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
      <ToastProvider>
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

            {/* Toast notifications */}
            <ToastContainer />

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
                  path="/songs"
                  element={
                    <MainLayout>
                      <SongCompendium />
                    </MainLayout>
                  }
                />
                <Route
                  path="/songs/:id"
                  element={
                    <MainLayout>
                      <SongDetail />
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
                  path="/recipes"
                  element={
                    <MainLayout>
                      <RecipeCompendium />
                    </MainLayout>
                  }
                />
                <Route
                  path="/bestiary"
                  element={
                    <MainLayout>
                      <Bestiary />
                    </MainLayout>
                  }
                />
                <Route
                  path="/bestiary/:id"
                  element={
                    <MainLayout>
                      <CreatureDetail />
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
                <Route
                  path="/homebrew"
                  element={
                    <MainLayout>
                      <HomebrewBrowser />
                    </MainLayout>
                  }
                />
                <Route
                  path="/homebrew/items"
                  element={
                    <MainLayout>
                      <HomebrewItemBrowser />
                    </MainLayout>
                  }
                />
                <Route
                  path="/homebrew/items/:id"
                  element={
                    <MainLayout>
                      <ItemDetail />
                    </MainLayout>
                  }
                />
                <Route
                  path="/homebrew/spells"
                  element={
                    <MainLayout>
                      <HomebrewSpellBrowser />
                    </MainLayout>
                  }
                />
                <Route
                  path="/homebrew/spells/:id"
                  element={
                    <MainLayout>
                      <SpellDetail />
                    </MainLayout>
                  }
                />
                <Route
                  path="/homebrew/creatures"
                  element={
                    <MainLayout>
                      <HomebrewCreatureBrowser />
                    </MainLayout>
                  }
                />

                {/* Wiki routes */}
                <Route path="/wiki" element={<WikiLayout />}>
                  <Route index element={<WikiHome />} />
                  <Route path=":pageId" element={<WikiPage />} />
                </Route>

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
                    path="/characters/:id/songs"
                    element={
                      <MainLayout>
                        <SongsPage />
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
                  <Route
                    path="/homebrew/items/create"
                    element={
                      <MainLayout>
                        <HomebrewItemCreator />
                      </MainLayout>
                    }
                  />
                  <Route
                    path="/homebrew/items/:id/edit"
                    element={
                      <MainLayout>
                        <HomebrewItemCreator />
                      </MainLayout>
                    }
                  />
                  <Route
                    path="/homebrew/spells/create"
                    element={
                      <MainLayout>
                        <HomebrewSpellCreator />
                      </MainLayout>
                    }
                  />
                  <Route
                    path="/homebrew/spells/:id/edit"
                    element={
                      <MainLayout>
                        <HomebrewSpellCreator />
                      </MainLayout>
                    }
                  />
                  <Route
                    path="/homebrew/creatures/create"
                    element={
                      <MainLayout>
                        <HomebrewCreatureCreator />
                      </MainLayout>
                    }
                  />
                  <Route
                    path="/homebrew/creatures/:id/edit"
                    element={
                      <MainLayout>
                        <HomebrewCreatureCreator />
                      </MainLayout>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <MainLayout>
                        <Profile />
                      </MainLayout>
                    }
                  />
                  {/* Add other protected routes here */}
                </Route>
              </Routes>
            </div>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
