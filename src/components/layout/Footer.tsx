import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-evening)',
        paddingTop: '2rem',
        paddingBottom: '2rem',
        marginTop: 'auto',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and tagline */}
          <div className="md:col-span-1">
            <Link
              to="/"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: 'var(--color-metal-gold)',
              }}
              className="text-glow"
            >
              Anyventure TTRPG
            </Link>
            <p
              style={{
                marginTop: '0.5rem',
                color: 'var(--color-cloud)',
                fontSize: '0.875rem',
              }}
            >
              Embark on epic adventures across the cosmos
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3
              style={{
                color: 'var(--color-white)',
                fontWeight: 600,
                marginBottom: '0.75rem',
              }}
            >
              Game
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <FooterLink to="/characters">Characters</FooterLink>
              </li>
              <li>
                <FooterLink to="/characters/create">Create Character</FooterLink>
              </li>
              <li>
                <FooterLink to="/campaigns">Campaigns</FooterLink>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3
              style={{
                color: 'var(--color-white)',
                fontWeight: 600,
                marginBottom: '0.75rem',
              }}
            >
              Resources
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <FooterLink to="/rules">Rulebook</FooterLink>
              </li>
              <li>
                <FooterLink to="/guides">Guides</FooterLink>
              </li>
              <li>
                <FooterLink to="/community">Community</FooterLink>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3
              style={{
                color: 'var(--color-white)',
                fontWeight: 600,
                marginBottom: '0.75rem',
              }}
            >
              About
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <FooterLink to="/about">About Us</FooterLink>
              </li>
              <li>
                <FooterLink to="/contact">Contact</FooterLink>
              </li>
              <li>
                <FooterLink to="/privacy">Privacy Policy</FooterLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Social links and copyright */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(73, 78, 107, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
          className="md:flex-row md:justify-between"
        >
          <div
            style={{
              color: 'var(--color-cloud)',
              fontSize: '0.875rem',
            }}
          >
            &copy; {currentYear} AnyventureDX. All rights reserved.
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <SocialLink href="https://twitter.com" label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </SocialLink>
            <SocialLink href="https://discord.com" label="Discord">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3847-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </SocialLink>
            <SocialLink href="https://github.com" label="GitHub">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </SocialLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Footer Link Component
interface FooterLinkProps {
  to: string;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ to, children }) => {
  return (
    <Link
      to={to}
      style={{
        color: 'var(--color-cloud)',
        transition: 'color 0.2s ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.color = 'var(--color-old-gold)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.color = 'var(--color-cloud)';
      }}
    >
      {children}
    </Link>
  );
};

// Social Media Link Component
interface SocialLinkProps {
  href: string;
  label: string;
  children: React.ReactNode;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, label, children }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        color: 'var(--color-cloud)',
        transition: 'color 0.2s ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.color = 'var(--color-old-gold)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.color = 'var(--color-cloud)';
      }}
    >
      {children}
    </a>
  );
};

export default Footer;
