import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import { Module, CharacterModule } from '../types/character';
import { getOptionEnergyCost, getEnergyDisplay, parseActionData } from '../utils/actionParser';

// Type definitions

interface Character {
  _id: string;
  name: string;
  modulePoints: {
    total: number;
    spent: number;
  };
  modules: CharacterModule[];
}

const ModulesPage: React.FC = () => {
  const { id: characterId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const highlightModuleId = searchParams.get('highlight');
  const moduleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [_loading, setLoading] = useState<boolean>(true);
  const [_error, setError] = useState<string | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  // Search functionality
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'core' | 'secondary' | 'personality'>(
    'all'
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const characterResponse = await fetch(`/api/characters/${characterId}`);
        if (!characterResponse.ok) {
          throw new Error('Failed to fetch character data');
        }
        const characterData = await characterResponse.json();

        // Filter out any modules with null moduleId
        if (characterData.modules) {
          characterData.modules = characterData.modules.filter(
            (m: CharacterModule) => m.moduleId !== null
          );
        }

        setCharacter(characterData);

        // Fetch all modules
        const modulesResponse = await fetch('/api/modules');
        if (!modulesResponse.ok) {
          throw new Error('Failed to fetch modules');
        }
        const modulesData = await modulesResponse.json();
        setAllModules(modulesData);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchData();
  }, [characterId]);

  // Scroll to highlighted module when modules are loaded
  useEffect(() => {
    if (highlightModuleId && allModules.length > 0) {
      // Give a small delay for DOM to render
      setTimeout(() => {
        const moduleElement = moduleRefs.current[highlightModuleId];
        if (moduleElement) {
          moduleElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Also select the module
          const module = allModules.find((m) => m._id === highlightModuleId);
          if (module) {
            setSelectedModule(module);
          }
        }
      }, 100);
    }
  }, [highlightModuleId, allModules]);

  const isModuleSelected = (moduleId: string) => {
    return (
      character?.modules.some((m) => {
        if (!m.moduleId) {
          return false;
        }
        if (typeof m.moduleId === 'string') {
          return m.moduleId === moduleId;
        } else {
          return m.moduleId._id === moduleId;
        }
      }) || false
    );
  };

  const getCharacterModule = (moduleId: string) => {
    return character?.modules.find((m) => {
      if (!m.moduleId) {
        return false;
      }
      if (typeof m.moduleId === 'string') {
        return m.moduleId === moduleId;
      } else {
        return m.moduleId._id === moduleId;
      }
    });
  };

  const isOptionSelected = (moduleId: string, location: string) => {
    const charModule = getCharacterModule(moduleId);
    return charModule?.selectedOptions.some((o) => o.location === location) || false;
  };

  const isPersonalityModuleSelectable = (moduleId: string) => {
    // Check if this personality module is already selected
    if (isModuleSelected(moduleId)) return true;

    // Check if ANY personality module is already selected
    const hasPersonalityModule = character?.modules.some((m) => {
      if (!m.moduleId) return false;
      const modId = typeof m.moduleId === 'string' ? m.moduleId : m.moduleId._id;
      const mod = allModules.find((mod) => mod._id === modId);
      return mod?.mtype === 'personality';
    });

    // If a personality module is already selected, can't select a different one
    return !hasPersonalityModule;
  };

  const canSelectOption = (module: Module, location: string) => {
    // For personality modules, ALWAYS check if they're selectable (not just tier 1)
    if (module.mtype === 'personality') {
      return isPersonalityModuleSelectable(module._id);
    }

    if (location === '1') return true;
    const tierMatch = location.match(/^(\d+)/);
    if (!tierMatch) return false;
    const tier = parseInt(tierMatch[1]);
    const charModule = getCharacterModule(module._id);

    if (
      charModule?.selectedOptions.some(
        (o) => o.location.startsWith(tier.toString()) && o.location !== location
      )
    ) {
      return false; // Another option from the same tier is already selected
    }

    if (tier === 2) {
      return isOptionSelected(module._id, '1');
    } else {
      const isSubOption = location.length > 1; // Like "3a", "4b", etc.
      if (isSubOption) {
        const previousTier = (tier - 1).toString();
        const charModule = getCharacterModule(module._id);
        return (
          charModule?.selectedOptions.some((o) => o.location.startsWith(previousTier)) || false
        );
      } else {
        const previousTier = (tier - 1).toString();
        const charModule = getCharacterModule(module._id);
        return (
          charModule?.selectedOptions.some((o) => o.location.startsWith(previousTier)) || false
        );
      }
    }
  };
  // Handle selecting a module and its first option
  const handleSelectOption = async (moduleId: string, location: string) => {
    try {
      if (location === '1' && !isModuleSelected(moduleId)) {
        const addModuleResponse = await fetch(
          `/api/characters/${characterId}/modules/${moduleId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );
        if (!addModuleResponse.ok) {
          throw new Error('Failed to add module');
        }
        const selectOptionResponse = await fetch(
          `/api/characters/${characterId}/modules/${moduleId}/options`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ location }),
          }
        );
        if (!selectOptionResponse.ok) {
          throw new Error('Failed to select option');
        }
        const updatedCharacter = await selectOptionResponse.json();
        setCharacter(updatedCharacter);
      } else {
        const response = await fetch(`/api/characters/${characterId}/modules/${moduleId}/options`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ location }),
        });
        if (!response.ok) {
          throw new Error('Failed to select option');
        }
        const updatedCharacter = await response.json();
        setCharacter(updatedCharacter);
      }
    } catch (err) {
      console.error('Error selecting option:', err);
      setError(err instanceof Error ? err.message : 'Failed to select option');
    }
  };

  const canDeselectOption = (moduleId: string, location: string) => {
    if (location === '1') {
      return true;
    }
    const charModule = getCharacterModule(moduleId);
    if (!charModule) return false;
    const tierNumber = parseInt(location.charAt(0));
    const nextTierNumber = tierNumber + 1;
    const hasDependentOptions = charModule.selectedOptions.some((o) => {
      const optionTier = parseInt(o.location.charAt(0));
      return optionTier === nextTierNumber;
    });
    return !hasDependentOptions;
  };

  const handleDeselectOption = async (moduleId: string, location: string, moduleType: string) => {
    try {
      if (location === '1' && moduleType === 'personality') {
        return;
      }
      if (location === '1') {
        const response = await fetch(`/api/characters/${characterId}/modules/${moduleId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to remove module');
        }

        const updatedCharacter = await response.json();
        setCharacter(updatedCharacter);
      } else {
        const response = await fetch(
          `/api/characters/${characterId}/modules/${moduleId}/options/${location}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to deselect option');
        }

        const updatedCharacter = await response.json();
        setCharacter(updatedCharacter);
      }
    } catch (err) {
      console.error('Error deselecting option:', err);
      setError(err instanceof Error ? err.message : 'Failed to deselect option');
    }
  };

  const handleViewModule = (module: Module) => {
    setSelectedModule(module);
  };

  const hasEnoughPoints = (cost: number = 1) => {
    return (character?.modulePoints.total || 0) - (character?.modulePoints.spent || 0) >= cost;
  };

  const getDisplayModules = () => {
    if (!allModules.length) return [];

    let filteredModules = [...allModules];

    // Apply type filter
    if (activeFilter !== 'all') {
      filteredModules = filteredModules.filter((module) => {
        // For personality filter, show ONLY the selected personality module
        if (activeFilter === 'personality') {
          return module.mtype === 'personality' && isModuleSelected(module._id);
        }
        // For core/secondary filters
        return module.mtype === activeFilter;
      });
    } else {
      // When 'all' is selected, show personality modules only if selected
      filteredModules = filteredModules.filter((module) => {
        if (module.mtype === 'personality') {
          return isModuleSelected(module._id);
        }
        return true;
      });
    }

    // Apply search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filteredModules = filteredModules.filter((module) => {
        if (module.name.toLowerCase().includes(term)) return true;
        if (module.mtype.toLowerCase().includes(term)) return true;
        return module.options.some(
          (option) =>
            option.name.toLowerCase().includes(term) ||
            option.description.toLowerCase().includes(term)
        );
      });
    }

    return filteredModules.sort((a, b) => {
      // First, sort by selection status (selected modules first)
      const aSelected = isModuleSelected(a._id);
      const bSelected = isModuleSelected(b._id);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      // Then alphabetically by name
      const nameA = (a.name || '').toString().trim();
      const nameB = (b.name || '').toString().trim();
      return nameA.localeCompare(nameB);
    });
  };
  const displayModules = getDisplayModules();

  return (
    <div className="container mx-auto px-4 py-8">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1
          style={{
            color: 'var(--color-white)',
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 'bold',
          }}
        >
          Character Modules
        </h1>

        <div
          style={{
            backgroundColor: 'var(--color-dark-elevated)',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            color: 'var(--color-metal-gold)',
          }}
        >
          Module Points:{' '}
          <span style={{ fontWeight: 'bold' }}>
            {(character?.modulePoints?.total || 0) - (character?.modulePoints?.spent || 0)}
          </span>{' '}
          / {character?.modulePoints.total || 0}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={`/characters/${characterId}?tab=modules`}>
          <Button variant="secondary">&larr; Back to Character</Button>
        </Link>
      </div>

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
              variant={activeFilter === 'personality' ? 'accent' : 'secondary'}
              onClick={() => setActiveFilter('personality')}
            >
              Personality
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
        {/* Modules list */}
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
                Available Modules
              </h2>
            </CardHeader>
            <CardBody>
              {displayModules.length === 0 ? (
                <div style={{ color: 'var(--color-cloud)', padding: '1rem' }}>
                  No modules available
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    maxHeight: '600px',
                    overflowY: 'auto',
                    paddingRight: '0.25rem',
                  }}
                >
                  {displayModules.map((module) => (
                    <div
                      key={module._id}
                      ref={(el) => {
                        moduleRefs.current[module._id] = el;
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '0.375rem',
                        backgroundColor: isModuleSelected(module._id)
                          ? 'var(--color-sat-purple-faded)'
                          : highlightModuleId === module._id
                            ? 'var(--color-metal-gold-faded)'
                            : 'var(--color-dark-elevated)',
                        cursor: 'pointer',
                        border:
                          selectedModule?._id === module._id
                            ? '1px solid var(--color-metal-gold)'
                            : highlightModuleId === module._id
                              ? '2px solid var(--color-metal-gold)'
                              : isModuleSelected(module._id)
                                ? '1px solid var(--color-sat-purple)'
                                : '1px solid transparent',
                        transition: 'background-color 0.2s ease, border-color 0.1s ease',
                      }}
                      onClick={() => handleViewModule(module)}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
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
                            }}
                          >
                            {module.mtype}
                          </div>
                        </div>

                        {isModuleSelected(module._id) && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <div
                              style={{
                                width: '0.5rem',
                                height: '0.5rem',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-metal-gold)',
                              }}
                            ></div>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--color-metal-gold)',
                              }}
                            >
                              Added
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Module details */}
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
                </div>
              </CardHeader>

              <CardBody>
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
                            const isSelected = isOptionSelected(
                              selectedModule._id,
                              option.location
                            );

                            // For Tier 1, always make it selectable if module isn't added yet
                            // For other tiers, check prerequisites
                            const canSelect =
                              option.location === '1'
                                ? true
                                : isModuleSelected(selectedModule._id) &&
                                  canSelectOption(selectedModule, option.location);

                            const hasEnoughPointsForOption = hasEnoughPoints(1);

                            return (
                              <div
                                key={option.location}
                                style={{
                                  padding: '0.75rem',
                                  borderRadius: '0.375rem',
                                  backgroundColor: isSelected
                                    ? 'var(--color-sat-purple-faded)'
                                    : 'var(--color-dark-elevated)',
                                  border: isSelected
                                    ? '1px solid var(--color-metal-gold)'
                                    : '1px solid var(--color-dark-border)',
                                  width: optionWidth,
                                  cursor:
                                    canSelect && (isSelected || hasEnoughPointsForOption)
                                      ? 'pointer'
                                      : 'not-allowed',
                                  opacity:
                                    !canSelect || (!isSelected && !hasEnoughPointsForOption)
                                      ? 0.5
                                      : 1,
                                  position: 'relative',
                                  textAlign: 'center',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  minHeight: '120px',
                                }}
                                onClick={() => {
                                  if (canSelect && (isSelected || hasEnoughPointsForOption)) {
                                    if (isSelected) {
                                      // Check if the option can be deselected before attempting to deselect it
                                      if (canDeselectOption(selectedModule._id, option.location)) {
                                        handleDeselectOption(
                                          selectedModule._id,
                                          option.location,
                                          selectedModule.mtype
                                        );
                                      }
                                      // If it can't be deselected, do nothing (silently ignore the click)
                                    } else {
                                      handleSelectOption(selectedModule._id, option.location);
                                    }
                                  }
                                }}
                              >
                                {/* Title row with centered name and location indicator */}
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.5rem',
                                  }}
                                >
                                  {/* Empty element for centering */}
                                  <div style={{ width: '2rem', flexShrink: 0 }}></div>

                                  {/* Centered name */}
                                  <div
                                    style={{
                                      color: 'var(--color-white)',
                                      fontWeight: 'bold',
                                      fontSize: '1rem',
                                      textAlign: 'center',
                                      flex: 1,
                                    }}
                                  >
                                    {option.name}
                                  </div>

                                  {/* Tier indicator */}
                                  <div
                                    style={{
                                      color: 'var(--color-cloud)',
                                      fontSize: '0.75rem',
                                      width: '2rem',
                                      flexShrink: 0,
                                      textAlign: 'right',
                                    }}
                                  >
                                    {option.location}
                                  </div>
                                </div>

                                {/* Content area - grows to fill space */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                  <p
                                    style={{
                                      color: isSelected ? 'var(--color-cloud)' : 'var(--color-white)',
                                      fontSize: '0.875rem',
                                      marginBottom: '0.5rem',
                                    }}
                                  >
                                    {option.description}
                                  </p>
                                </div>

                                {/* Tags at bottom - pushed down with marginTop: auto */}
                                {(() => {
                                  const actionData = parseActionData(option.data || '');
                                  const energyCost = getOptionEnergyCost(option);

                                  return (
                                    <div
                                      style={{
                                        display: 'flex',
                                        gap: '0.25rem',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexWrap: 'wrap',
                                        marginTop: 'auto',
                                      }}
                                    >
                                      {/* Daily tag */}
                                      {actionData && actionData.frequency === 'daily' && (
                                        <div
                                          style={{
                                            backgroundColor: 'rgba(251, 191, 36, 0.2)',
                                            color: 'rgb(251, 191, 36)',
                                            padding: '0.125rem 0.375rem',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.625rem',
                                            fontWeight: 'bold',
                                            border: '1px solid rgba(251, 191, 36, 0.3)',
                                          }}
                                        >
                                          Daily
                                        </div>
                                      )}

                                      {/* Magical tag */}
                                      {actionData && actionData.magical && (
                                        <div
                                          style={{
                                            backgroundColor: 'rgba(167, 139, 250, 0.2)',
                                            color: 'rgb(167, 139, 250)',
                                            padding: '0.125rem 0.375rem',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.625rem',
                                            fontWeight: 'bold',
                                            border: '1px solid rgba(167, 139, 250, 0.3)',
                                          }}
                                        >
                                          Magical
                                        </div>
                                      )}

                                      {/* Energy cost tag */}
                                      {energyCost !== null && (
                                        <div
                                          style={{
                                            backgroundColor:
                                              energyCost === 0
                                                ? 'var(--color-dark-elevated)'
                                                : 'rgba(59, 130, 246, 0.2)',
                                            color:
                                              energyCost === 0
                                                ? 'var(--color-cloud)'
                                                : 'rgb(147, 197, 253)',
                                            padding: '0.125rem 0.375rem',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.625rem',
                                            fontWeight: 'bold',
                                            border:
                                              energyCost === 0
                                                ? '1px solid var(--color-dark-border)'
                                                : '1px solid rgba(59, 130, 246, 0.3)',
                                          }}
                                        >
                                          {getEnergyDisplay(energyCost)}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
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
                  Modules allow you to customize and improve your character's abilities
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModulesPage;
