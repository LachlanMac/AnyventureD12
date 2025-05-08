import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

// Type definitions
interface ModuleOption {
  name: string;
  description: string;
  location: string;
  data: string;
}

interface Module {
  _id: string;
  name: string;
  mtype: 'racial' | 'core' | 'secondary';
  ruleset: number;
  options: ModuleOption[];
}

const ModuleBrowser: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter states
  const [activeFilter, setActiveFilter] = useState<'all' | 'racial' | 'core' | 'secondary'>('all');

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        // In a real app, this would call your API
        const response = await fetch('/api/modules');

        if (!response.ok) {
          throw new Error('Failed to fetch modules');
        }

        const data = await response.json();
        setModules(data);
        setFilteredModules(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching modules:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);

        // For development, use mock data when API fails
        const mockModules = getMockModules();
        setModules(mockModules);
        setFilteredModules(mockModules);
      }
    };

    fetchModules();
  }, []);

  // Apply filters
  useEffect(() => {
    let results = modules;

    // Apply type filter
    if (activeFilter !== 'all') {
      results = results.filter((module) => module.mtype === activeFilter);
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (module) =>
          module.name.toLowerCase().includes(term) ||
          module.options.some(
            (option) =>
              option.name.toLowerCase().includes(term) ||
              option.description.toLowerCase().includes(term)
          )
      );
    }

    setFilteredModules(results);
  }, [modules, activeFilter, searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error && filteredModules.length === 0) {
    return (
      <div
        style={{
          padding: '2rem',
          backgroundColor: 'rgba(152, 94, 109, 0.2)',
          borderRadius: '0.5rem',
          border: '1px solid var(--color-sunset)',
          color: 'var(--color-white)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Error</h2>
        <p>{error}</p>
        <div style={{ marginTop: '1rem' }}>
          <Button variant="accent" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filter Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          className="md:flex-row md:justify-between"
        >
          {/* Search Bar */}
          <div style={{ flexGrow: 1, maxWidth: '600px' }}>
            <input
              type="text"
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--color-dark-elevated)',
                color: 'var(--color-white)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '0.375rem',
                padding: '0.75rem 1rem',
              }}
            />
          </div>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant={activeFilter === 'all' ? 'accent' : 'secondary'}
              onClick={() => setActiveFilter('all')}
            >
              All
            </Button>
            <Button
              variant={activeFilter === 'racial' ? 'accent' : 'secondary'}
              onClick={() => setActiveFilter('racial')}
            >
              Racial
            </Button>
            <Button
              variant={activeFilter === 'core' ? 'accent' : 'secondary'}
              onClick={() => setActiveFilter('core')}
            >
              Core
            </Button>
            <Button
              variant={activeFilter === 'secondary' ? 'accent' : 'secondary'}
              onClick={() => setActiveFilter('secondary')}
            >
              Secondary
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module List */}
        <div className="md:col-span-1">
          <Card variant="default">
            <CardHeader>
              <h2
                style={{
                  color: 'var(--color-white)',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                }}
              >
                {activeFilter === 'all'
                  ? 'All Modules'
                  : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Modules`}
              </h2>
              <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                {filteredModules.length} modules found
              </div>
            </CardHeader>
            <CardBody>
              {filteredModules.length === 0 ? (
                <div style={{ color: 'var(--color-cloud)', padding: '1rem' }}>
                  No modules match your search criteria.
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    maxHeight: '600px',
                    overflowY: 'auto',
                  }}
                >
                  {filteredModules.map((module) => (
                    <div
                      key={module._id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '0.375rem',
                        backgroundColor:
                          selectedModule?._id === module._id
                            ? 'var(--color-sat-purple-faded)'
                            : 'var(--color-dark-elevated)',
                        cursor: 'pointer',
                        border:
                          selectedModule?._id === module._id
                            ? '1px solid var(--color-metal-gold)'
                            : '1px solid transparent',
                      }}
                      onClick={() => setSelectedModule(module)}
                    >
                      <div
                        style={{
                          color: 'var(--color-white)',
                          fontWeight: 'bold',
                        }}
                      >
                        {module.name}
                      </div>
                      <div
                        style={{
                          color: 'var(--color-cloud)',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{module.mtype}</span>
                        <span>{module.options.length} options</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Module Details */}
        <div className="md:col-span-2">
          {selectedModule ? (
            <Card variant="default">
              <CardHeader>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <h2
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {selectedModule.name}
                  </h2>
                  <div
                    style={{
                      color: 'var(--color-cloud)',
                      fontSize: '0.875rem',
                      textTransform: 'capitalize',
                      padding: '0.25rem 0.75rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      borderRadius: '9999px',
                    }}
                  >
                    {selectedModule.mtype}
                  </div>
                </div>
              </CardHeader>

              <CardBody>
                <div>
                  {/* Module skill tree */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Group options by tier */}
                    {Array.from(
                      new Set(
                        selectedModule.options.map(
                          (option) => option.location.match(/^(\d+)/)?.[1] || ''
                        )
                      )
                    ).map((tier) => {
                      // Filter options for this tier
                      const tierOptions = selectedModule.options.filter((option) =>
                        option.location.startsWith(tier)
                      );

                      // Check if it's an odd tier (1, 3, 5) or even (2, 4, etc)
                      const isOddTier = parseInt(tier) % 2 === 1;

                      return (
                        <div key={tier} style={{ marginBottom: '0.25rem' }}>
                          {/* Module options grid layout */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: isOddTier ? '1fr' : '1fr 1fr',
                              gap: '0.75rem',
                              justifyItems: 'center',
                              width: '100%',
                            }}
                          >
                            {tierOptions.map((option) => {
                              // Adjust width based on tier
                              const optionWidth = isOddTier ? '50%' : '100%';
                              return (
                                <div
                                  key={option.location}
                                  style={{
                                    padding: '1rem',
                                    borderRadius: '0.375rem',
                                    backgroundColor: 'var(--color-dark-elevated)',
                                    border: '1px solid var(--color-dark-border)',
                                    width: optionWidth,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      marginBottom: '0.75rem',
                                    }}
                                  >
                                    <div
                                      style={{
                                        color: 'var(--color-white)',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        textAlign: 'center',
                                        width: '100%',
                                      }}
                                    >
                                      {option.name}
                                    </div>
                                    <div
                                      style={{
                                        color: 'var(--color-metal-gold)',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold',
                                        position: 'absolute',
                                        right: '1rem',
                                      }}
                                    ></div>
                                  </div>
                                  <p
                                    style={{
                                      color: 'var(--color-cloud)',
                                      fontSize: '0.875rem',
                                      marginBottom: '0.5rem',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {option.description}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-dark-surface)',
                borderRadius: '0.5rem',
                padding: '3rem',
                height: '100%',
              }}
            >
              <div style={{ color: 'var(--color-cloud)', textAlign: 'center' }}>
                <div style={{ marginBottom: '1rem' }}>
                  Select a module from the list to view details
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  Browse through available modules to learn about character customization options
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Function to generate mock modules for development
function getMockModules(): Module[] {
  return [];
}

export default ModuleBrowser;
