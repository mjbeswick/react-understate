import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SearchModal, { SearchButton } from './Search';
import './Layout.css';

type LayoutProps = {
  children: React.ReactNode;
};

type NavItem = {
  title: string;
  path: string;
  items?: NavItem[];
};

const navigation: NavItem[] = [
  {
    title: 'Getting Started',
    path: '/getting-started',
    items: [
      { title: 'Introduction', path: '/getting-started/introduction' },
      { title: 'Installation', path: '/getting-started/installation' },
      { title: 'Quick Start', path: '/getting-started/quick-start' },
    ],
  },
  {
    title: 'Guides',
    path: '/guides',
    items: [
      { title: 'State Management', path: '/guides/state-management' },
      { title: 'Derived Values', path: '/guides/derived-values' },
      { title: 'Effects', path: '/guides/effects' },
      { title: 'Batching', path: '/guides/batching' },
      { title: 'Testing', path: '/guides/testing' },
    ],
  },
  {
    title: 'API Reference',
    path: '/api',
    items: [
      { title: 'state()', path: '/api/state' },
      { title: 'derived()', path: '/api/derived' },
      { title: 'action()', path: '/api/action' },
      { title: 'effect()', path: '/api/effect' },
      { title: 'batch()', path: '/api/batch' },
      { title: 'useUnderstate()', path: '/api/use-understate' },
    ],
  },
  {
    title: 'Patterns',
    path: '/patterns',
    items: [
      { title: 'Store Pattern', path: '/patterns/store-pattern' },
      { title: 'State Composition', path: '/patterns/state-composition' },
      {
        title: 'Performance Optimization',
        path: '/patterns/performance-optimization',
      },
      { title: 'Filtering & Sorting', path: '/patterns/filtering-sorting' },
      { title: 'Async Data Loading', path: '/patterns/async-data' },
      { title: 'Local Storage', path: '/patterns/local-storage' },
      { title: 'Keyboard Shortcuts', path: '/patterns/keyboard-shortcuts' },
      { title: 'Form Validation', path: '/patterns/form-validation' },
    ],
  },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const isActive = (path: string) => location.pathname === path;

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === '/' && e.target === document.body) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <Link to="/getting-started/introduction" className="logo">
            <span className="logo-text">React Understate</span>
          </Link>

          <div className="header-actions">
            <SearchButton onClick={() => setSearchOpen(true)} />

            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <a
              href="https://github.com/mjbeswick/react-understate"
              className="github-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          {navigation.map(section => (
            <div key={section.path} className="nav-section">
              <div className="nav-section-title">{section.title}</div>
              {section.items && (
                <ul className="nav-items">
                  {section.items.map(item => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="main-content">
        <div className="content-wrapper">{children}</div>
      </main>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default Layout;
