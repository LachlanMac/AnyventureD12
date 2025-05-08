import React from 'react';

export type TabType = 'info' | 'modules' | 'actions' | 'traits' | 'background';

interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'info', label: 'Character Info' },
    { id: 'modules', label: 'Modules' },
    { id: 'actions', label: 'Actions' },
    { id: 'traits', label: 'Traits' },
    { id: 'background', label: 'Background' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-dark-border)',
        overflowX: 'auto',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            padding: '0.75rem 1.5rem',
            color: activeTab === tab.id ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
            borderBottom: activeTab === tab.id ? '2px solid var(--color-metal-gold)' : 'none',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;