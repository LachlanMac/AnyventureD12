import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import { Module, CharacterModule } from '../types/character';
import { getOptionEnergyCost, getEnergyDisplay, parseActionData } from '../utils/actionParser';
import { useAuth } from '../context/AuthContext';
import ExportTemplateModal from '../components/templates/ExportTemplateModal';

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

interface PlannedModule {
  moduleId: string;
  selectedOptions: Record<string, string>;
  progressionTier: number;
}

const PROGRESSION_COLORS: Record<number, { bg: string; border: string; label: string; text: string }> = {
  1: { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.6)', label: 'Starter (1-15)', text: 'rgb(34, 197, 94)' },
  2: { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.6)', label: 'Advanced (16-25)', text: 'rgb(59, 130, 246)' },
  3: { bg: 'rgba(168, 85, 247, 0.2)', border: 'rgba(168, 85, 247, 0.6)', label: 'Veteran (26-35)', text: 'rgb(168, 85, 247)' },
  4: { bg: 'rgba(234, 179, 8, 0.2)', border: 'rgba(234, 179, 8, 0.6)', label: 'Elite (36-45)', text: 'rgb(234, 179, 8)' },
};

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

  // Plan mode
  const [planMode, setPlanMode] = useState<boolean>(false);
  const [plannedModules, setPlannedModules] = useState<PlannedModule[]>([]);
  const [planDirty, setPlanDirty] = useState<boolean>(false);
  const [showExport, setShowExport] = useState<boolean>(false);
  const { user } = useAuth();

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

        // Fetch planned modules
        try {
          const planResponse = await fetch(`/api/characters/${characterId}/plan`);
          if (planResponse.ok) {
            const planData = await planResponse.json();
            setPlannedModules(planData.map((pm: any) => ({
              moduleId: typeof pm.moduleId === 'object' ? pm.moduleId._id : pm.moduleId,
              selectedOptions: pm.selectedOptions instanceof Map
                ? Object.fromEntries(pm.selectedOptions)
                : (pm.selectedOptions || {}),
              progressionTier: pm.progressionTier
            })));
          }
        } catch (planErr) {
          console.warn('Could not fetch plan data:', planErr);
        }

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

  // Plan mode helpers
  const getPlannedModule = (moduleId: string): PlannedModule | undefined => {
    return plannedModules.find(pm => pm.moduleId === moduleId);
  };

  const getPlannedOptionTier = (moduleId: string, location: string): number | null => {
    const pm = getPlannedModule(moduleId);
    if (!pm) return null;
    const tier = pm.selectedOptions?.[location];
    return tier ? parseInt(tier) : null;
  };

  const handlePlanClick = (moduleId: string, location: string) => {
    const currentUsed = getPlanPointsUsed();
    const existing = plannedModules.find(pm => pm.moduleId === moduleId);
    const currentTier = existing?.selectedOptions?.[location];
    const currentNum = currentTier ? parseInt(currentTier) : 0;

    // Find next tier that has budget, starting after current.
    // Free options (social module tier 1) don't need budget.
    const isFree = isFreePlanOption(moduleId, location);
    let nextTier: number | null = null;
    for (let t = currentNum + 1; t <= 4; t++) {
      if (isFree) {
        nextTier = t;
        break;
      }
      // When checking budget, subtract 1 if this option is currently in a tier (we're moving it)
      const adjustedUsed = currentNum > 0 && currentNum === t ? currentUsed[t] - 1 : currentUsed[t];
      if (adjustedUsed < TIER_BUDGETS[t]) {
        nextTier = t;
        break;
      }
    }

    setPlannedModules(prev => {
      const ex = prev.find(pm => pm.moduleId === moduleId);

      if (nextTier === null) {
        // All tiers full or past tier 4, remove from plan
        if (!ex) return prev;
        const newOptions = { ...ex.selectedOptions };
        delete newOptions[location];
        if (Object.keys(newOptions).length === 0) {
          return prev.filter(pm => pm.moduleId !== moduleId);
        }
        const maxTier = Math.max(...Object.values(newOptions).map(v => parseInt(v)));
        return prev.map(pm => pm.moduleId === moduleId
          ? { ...pm, selectedOptions: newOptions, progressionTier: maxTier }
          : pm
        );
      }

      if (ex) {
        const newOptions = { ...ex.selectedOptions, [location]: String(nextTier) };
        const maxTier = Math.max(...Object.values(newOptions).map(v => parseInt(v)));
        return prev.map(pm => pm.moduleId === moduleId
          ? { ...pm, selectedOptions: newOptions, progressionTier: maxTier }
          : pm
        );
      } else {
        return [...prev, {
          moduleId,
          selectedOptions: { [location]: String(nextTier) },
          progressionTier: nextTier
        }];
      }
    });
    setPlanDirty(true);
  };

  const savePlan = async () => {
    try {
      const response = await fetch(`/api/characters/${characterId}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plannedModules })
      });
      if (response.ok) {
        setPlanDirty(false);
      }
    } catch (err) {
      console.error('Failed to save plan:', err);
    }
  };

  const TIER_BUDGETS: Record<number, number> = { 1: 15, 2: 10, 3: 10, 4: 10 };

  // Every planned option costs 1 point, except the social (personality) module's tier 1,
  // which is auto-granted at character creation. Matches the template export check.
  const isFreePlanOption = (moduleId: string, location: string) =>
    location === '1' && allModules.find((m) => m._id === moduleId)?.mtype === 'personality';

  const getPlanPointsUsed = () => {
    const tiers: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const pm of plannedModules) {
      for (const [location, tier] of Object.entries(pm.selectedOptions)) {
        if (isFreePlanOption(pm.moduleId, location)) continue;
        const t = parseInt(tier);
        if (tiers[t] !== undefined) tiers[t]++;
      }
    }
    return tiers;
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
          {planMode ? 'Plan Modules' : 'Character Modules'}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button
            variant={planMode ? 'accent' : 'secondary'}
            onClick={() => setPlanMode(!planMode)}
          >
            {planMode ? '✎ Plan Mode ON' : 'Plan Mode'}
          </Button>
          {planMode && planDirty && (
            <Button variant="accent" onClick={savePlan}>
              Save Plan
            </Button>
          )}
          {user?.isAdmin && (
            <Button
              variant="secondary"
              onClick={async () => {
                // Export reads the saved plan, so save pending changes first
                if (planDirty) await savePlan();
                setShowExport(true);
              }}
            >
              Export as Template
            </Button>
          )}
          {!planMode && (
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
          )}
        </div>
      </div>

      {showExport && character && (
        <ExportTemplateModal
          characterId={character._id}
          characterName={character.name}
          onClose={() => setShowExport(false)}
        />
      )}

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to={`/characters/${characterId}?tab=modules`}>
          <Button variant="secondary">&larr; Back to Character</Button>
        </Link>
      </div>

      {planMode && (() => {
        const tiers = getPlanPointsUsed();
        return (
          <div style={{
            display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap'
          }}>
            {[1, 2, 3, 4].map(t => {
              const budget = TIER_BUDGETS[t];
              const full = tiers[t] >= budget;
              return (
                <div key={t} style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: full ? PROGRESSION_COLORS[t].bg : 'var(--color-dark-elevated)',
                  border: `2px solid ${full ? PROGRESSION_COLORS[t].border : 'var(--color-dark-border)'}`,
                  color: full ? PROGRESSION_COLORS[t].text : 'var(--color-cloud)',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                }}>
                  {PROGRESSION_COLORS[t].label}: {tiers[t]} / {budget}
                </div>
              );
            })}
            <div style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              backgroundColor: 'var(--color-dark-elevated)',
              color: 'var(--color-white)',
              fontSize: '0.875rem',
              fontWeight: 'bold',
            }}>
              Total: {tiers[1] + tiers[2] + tiers[3] + tiers[4]} / {TIER_BUDGETS[1] + TIER_BUDGETS[2] + TIER_BUDGETS[3] + TIER_BUDGETS[4]}
            </div>
          </div>
        );
      })()}

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

                        {planMode && getPlannedModule(module._id) && (
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
                                backgroundColor: PROGRESSION_COLORS[getPlannedModule(module._id)!.progressionTier].text,
                              }}
                            ></div>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: PROGRESSION_COLORS[getPlannedModule(module._id)!.progressionTier].text,
                              }}
                            >
                              Planned
                            </span>
                          </div>
                        )}
                        {!planMode && isModuleSelected(module._id) && (
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

                            // Plan mode styling
                            const plannedTier = getPlannedOptionTier(selectedModule._id, option.location);
                            const planColor = plannedTier ? PROGRESSION_COLORS[plannedTier] : null;
                            const isInvested = isOptionSelected(selectedModule._id, option.location);

                            // For Tier 1, always make it selectable if module isn't added yet
                            // For other tiers, check prerequisites
                            const canSelect = planMode ? true :
                              option.location === '1'
                                ? true
                                : isModuleSelected(selectedModule._id) &&
                                  canSelectOption(selectedModule, option.location);

                            const hasEnoughPointsForOption = planMode ? true : hasEnoughPoints(1);

                            // Determine card style
                            let cardBg = isInvested
                              ? 'var(--color-sat-purple-faded)'
                              : 'var(--color-dark-elevated)';
                            let cardBorder = planMode && planColor
                              ? `3px solid ${planColor.border}`
                              : isInvested
                                ? '1px solid var(--color-metal-gold)'
                                : '1px solid var(--color-dark-border)';

                            return (
                              <div
                                key={option.location}
                                style={{
                                  padding: '0.75rem',
                                  borderRadius: '0.375rem',
                                  backgroundColor: cardBg,
                                  border: cardBorder,
                                  width: optionWidth,
                                  cursor: planMode
                                    ? 'pointer'
                                    : canSelect && (isSelected || hasEnoughPointsForOption)
                                      ? 'pointer'
                                      : 'not-allowed',
                                  opacity: planMode
                                    ? 1
                                    : !canSelect || (!isSelected && !hasEnoughPointsForOption)
                                      ? 0.5
                                      : 1,
                                  position: 'relative',
                                  textAlign: 'center',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  minHeight: '120px',
                                }}
                                onClick={() => {
                                  if (planMode) {
                                    handlePlanClick(selectedModule._id, option.location);
                                    return;
                                  }
                                  if (canSelect && (isSelected || hasEnoughPointsForOption)) {
                                    if (isSelected) {
                                      if (canDeselectOption(selectedModule._id, option.location)) {
                                        handleDeselectOption(
                                          selectedModule._id,
                                          option.location,
                                          selectedModule.mtype
                                        );
                                      }
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
                                      color: planColor ? planColor.text : 'var(--color-cloud)',
                                      fontSize: '0.75rem',
                                      width: '2rem',
                                      flexShrink: 0,
                                      textAlign: 'right',
                                      fontWeight: planColor ? 'bold' : 'normal',
                                    }}
                                  >
                                    {option.location}
                                  </div>
                                </div>
                                {planMode && planColor && (
                                  <div style={{
                                    fontSize: '0.625rem',
                                    fontWeight: 'bold',
                                    color: planColor.text,
                                    marginBottom: '0.25rem',
                                  }}>
                                    {planColor.label}
                                  </div>
                                )}

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
