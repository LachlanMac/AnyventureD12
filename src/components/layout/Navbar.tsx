import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, loading, login, logout } = useAuth();

  // Check if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav
      style={{
        backgroundColor: 'var(--color-dark-elevated)',
        borderBottom: '1px solid var(--color-dark-border)',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span
              className="text-glow"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--color-metal-gold)',
              }}
            >
              Starbelter TTRPG
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/characters" isActive={isActive('/characters')}>
              Characters
            </NavLink>
            <NavLink to="/campaigns" isActive={isActive('/campaigns')}>
              Campaigns
            </NavLink>
            <NavLink to="/modules" isActive={isActive('/modules')}>
              Modules
            </NavLink>

            {/* Auth buttons */}
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-space-blue animate-pulse"></div>
            ) : isAuthenticated ? (
              /* User menu when authenticated */
              <div className="relative ml-3">
                <button
                  className="flex items-center"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    color: 'var(--color-white)',
                    transition: 'color 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      height: '2rem',
                      width: '2rem',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--color-sat-purple)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '0.5rem',
                    }}
                  >
                    {user?.username?.charAt(0) || 'U'}
                  </div>
                  <span style={{ color: 'var(--color-white)' }}>{user?.username || 'User'}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ marginLeft: '0.25rem' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '2.5rem',
                      width: '10rem',
                      backgroundColor: 'var(--color-dark-surface)',
                      borderRadius: '0.375rem',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-app)',
                      border: '1px solid var(--color-dark-border)',
                      zIndex: 50,
                    }}
                  >
                    <div
                      style={{
                        padding: '0.5rem 1rem',
                        borderBottom: '1px solid var(--color-dark-border)',
                        color: 'var(--color-white)',
                        fontWeight: 'bold',
                      }}
                    >
                      {user?.username || 'User'}
                    </div>
                    <button
                      onClick={logout}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 1rem',
                        color: 'var(--color-cloud)',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-dark-elevated)';
                        e.currentTarget.style.color = 'var(--color-white)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-cloud)';
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Login button when not authenticated */
              <button
                onClick={login}
                style={{
                  backgroundColor: '#5865F2', // Discord color
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4752C4')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#5865F2')}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                  style={{ marginRight: '0.5rem' }}
                >
                  <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-1.248-.684-2.472-1.02-3.612-1.152-.864-.096-1.692-.072-2.424.024l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.132-1.728 6.996 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-.996-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.228 3.108.012.564-.096 1.14-.264 1.74-.516.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.972.792.972zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z" />
                </svg>
                Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
              style={{
                color: 'var(--color-white)',
                transition: 'color 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'var(--color-metal-gold)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'var(--color-white)';
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div
          className="md:hidden glass-panel"
          style={{
            borderTop: '1px solid var(--color-dark-border)',
          }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <MobileNavLink
              to="/characters"
              isActive={isActive('/characters')}
              onClick={() => setIsOpen(false)}
            >
              Characters
            </MobileNavLink>

            <MobileNavLink
              to="/campaigns"
              isActive={isActive('/campaigns')}
              onClick={() => setIsOpen(false)}
            >
              Campaigns
            </MobileNavLink>

            <MobileNavLink
              to="/modules"
              isActive={isActive('/modules')}
              onClick={() => setIsOpen(false)}
            >
              Modules
            </MobileNavLink>

            {isAuthenticated && (
              <MobileNavLink
                to="/characters/create"
                isActive={isActive('/characters/create')}
                onClick={() => setIsOpen(false)}
              >
                Create Character
              </MobileNavLink>
            )}

            {isAuthenticated ? (
              <button
                onClick={logout}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  color: 'var(--color-sunset)',
                  borderRadius: '0.375rem',
                  margin: '0.5rem 0',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-dark-surface)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Logout ({user?.username})
              </button>
            ) : (
              <button
                onClick={login}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  color: 'white',
                  backgroundColor: '#5865F2', // Discord color
                  borderRadius: '0.375rem',
                  margin: '0.5rem 0',
                  fontWeight: 'bold',
                  transition: 'background-color 0.2s',
                  alignItems: 'center',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4752C4')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#5865F2')}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                  style={{ marginRight: '0.5rem' }}
                >
                  <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-1.248-.684-2.472-1.02-3.612-1.152-.864-.096-1.692-.072-2.424.024l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.132-1.728 6.996 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-.996-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.228 3.108.012.564-.096 1.14-.264 1.74-.516.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.972.792.972zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z" />
                </svg>
                Login with Discord
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// Desktop Navigation Link
interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, isActive }) => {
  const linkStyle = {
    fontWeight: 500,
    transition: 'color 0.2s ease',
    color: isActive ? 'var(--color-metal-gold)' : 'var(--color-white)',
    textShadow: isActive ? '0 0 8px rgba(215, 183, 64, 0.5)' : 'none',
  };

  return (
    <Link
      to={to}
      style={linkStyle}
      onMouseOver={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = 'var(--color-old-gold)';
        }
      }}
      onMouseOut={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = 'var(--color-white)';
        }
      }}
    >
      {children}
    </Link>
  );
};

// Mobile Navigation Link
interface MobileNavLinkProps {
  to: string;
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, children, isActive, onClick }) => {
  const baseStyle = {
    display: 'block',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    fontWeight: 500,
  };

  const activeStyle = {
    ...baseStyle,
    backgroundColor: 'var(--color-sat-purple-faded)',
    color: 'var(--color-metal-gold)',
  };

  const inactiveStyle = {
    ...baseStyle,
    color: 'var(--color-white)',
  };

  return (
    <Link
      to={to}
      style={isActive ? activeStyle : inactiveStyle}
      onClick={onClick}
      onMouseOver={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'var(--color-dark-surface)';
        }
      }}
      onMouseOut={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {children}
    </Link>
  );
};

export default Navbar;
