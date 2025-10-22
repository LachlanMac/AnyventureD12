import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

const HomebrewSpellCreator: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);

  // Basic spell data
  const [spellData, setSpellData] = useState({
    name: '',
    description: '',
    charge: '',
    duration: 'Instantaneous',
    range: 'Self',
    school: 'primal' as 'meta' | 'black' | 'white' | 'mysticism' | 'primal' | 'arcane',
    subschool: 'elemental',
    checkToCast: 1,
    components: [] as string[],
    ritualDuration: '',
    concentration: false,
    reaction: false,
    energy: 1,
    damage: 0,
    damageType: null as string | null,
    tags: [] as string[],
    source: '',
    balanceNotes: '',
  });

  // Current step
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    if (id) {
      fetchSpell();
    }
  }, [id]);

  const fetchSpell = async () => {
    try {
      const response = await fetch(`/api/homebrew/spells/${id}`);
      if (!response.ok) throw new Error('Failed to fetch spell');

      const spell = await response.json();

      // Populate form with existing data
      setSpellData({
        name: spell.name,
        description: spell.description,
        charge: spell.charge || '',
        duration: spell.duration || 'Instantaneous',
        range: spell.range || 'Self',
        school: spell.school || 'primal',
        subschool: spell.subschool || 'elemental',
        checkToCast: spell.checkToCast || 1,
        components: spell.components || [],
        ritualDuration: spell.ritualDuration || '',
        concentration: spell.concentration || false,
        reaction: spell.reaction || false,
        energy: spell.energy || 1,
        damage: spell.damage || 0,
        damageType: spell.damageType || null,
        tags: spell.tags || [],
        source: spell.source || '',
        balanceNotes: spell.balanceNotes || '',
      });
    } catch (err) {
      showError('Failed to load spell for editing');
      navigate('/homebrew/spells');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to create homebrew spells');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Prepare spell data
      const submitData = {
        ...spellData,
        components: spellData.components.filter((c) => c.trim() !== ''),
        damageType: spellData.damage > 0 ? spellData.damageType : null,
      };

      const url = id ? `/api/homebrew/spells/${id}` : '/api/homebrew/spells';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${id ? 'update' : 'create'} homebrew spell`);
      }

      const savedSpell = await response.json();
      showSuccess(`Spell ${id ? 'updated' : 'created'} successfully!`);
      navigate(`/homebrew/spells/${savedSpell._id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to ${id ? 'update' : 'create'} spell`;
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card variant="default">
            <CardHeader>
              <h2 style={{ color: 'var(--color-white)', fontSize: '1.5rem' }}>Basic Information</h2>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      color: 'var(--color-cloud)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Spell Name
                  </label>
                  <input
                    type="text"
                    value={spellData.name}
                    onChange={(e) => setSpellData({ ...spellData, name: e.target.value })}
                    placeholder="e.g., Mystic Flame Bolt"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--color-cloud)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    value={spellData.description}
                    onChange={(e) => setSpellData({ ...spellData, description: e.target.value })}
                    placeholder="Describe what the spell does..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--color-cloud)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Charge Effect (Optional)
                  </label>
                  <textarea
                    value={spellData.charge}
                    onChange={(e) => setSpellData({ ...spellData, charge: e.target.value })}
                    placeholder="Describe what happens when you charge this spell..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        display: 'block',
                        marginBottom: '0.5rem',
                      }}
                    >
                      School
                    </label>
                    <select
                      value={spellData.school}
                      onChange={(e) => {
                        const newSchool = e.target.value as typeof spellData.school;
                        const subschoolMap = {
                          meta: 'illusion',
                          black: 'necromancy',
                          white: 'radiant',
                          mysticism: 'divination',
                          primal: 'elemental',
                          arcane: 'conjuration',
                        };
                        setSpellData({
                          ...spellData,
                          school: newSchool,
                          subschool: subschoolMap[newSchool],
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-elevated)',
                        color: 'var(--color-white)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.375rem',
                      }}
                    >
                      <option value="meta">Metamagic</option>
                      <option value="black">Black</option>
                      <option value="white">White</option>
                      <option value="mysticism">Mysticism</option>
                      <option value="primal">Primal</option>
                      <option value="arcane">Arcane</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        display: 'block',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Subschool
                    </label>
                    <select
                      value={spellData.subschool}
                      onChange={(e) => setSpellData({ ...spellData, subschool: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-elevated)',
                        color: 'var(--color-white)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.375rem',
                      }}
                    >
                      {spellData.school === 'meta' && (
                        <>
                          <option value="fey">Fey</option>
                          <option value="illusion">Illusion</option>
                          <option value="transmutation">Transmutation</option>
                        </>
                      )}
                      {spellData.school === 'black' && (
                        <>
                          <option value="fiend">Fiend</option>
                          <option value="necromancy">Necromancy</option>
                          <option value="witchcraft">Witchcraft</option>
                        </>
                      )}
                      {spellData.school === 'white' && (
                        <>
                          <option value="celestial">Celestial</option>
                          <option value="radiant">Radiant</option>
                          <option value="protection">Protection</option>
                        </>
                      )}
                      {spellData.school === 'mysticism' && (
                        <>
                          <option value="spirit">Spirit</option>
                          <option value="divination">Divination</option>
                          <option value="cosmic">Cosmic</option>
                        </>
                      )}
                      {spellData.school === 'primal' && (
                        <>
                          <option value="draconic">Draconic</option>
                          <option value="elemental">Elemental</option>
                          <option value="nature">Nature</option>
                        </>
                      )}
                      {spellData.school === 'arcane' && (
                        <>
                          <option value="conjuration">Conjuration</option>
                          <option value="enchantment">Enchantment</option>
                          <option value="chaos">Chaos</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        );

      case 2:
        return (
          <Card variant="default">
            <CardHeader>
              <h2 style={{ color: 'var(--color-white)', fontSize: '1.5rem' }}>
                Casting Properties
              </h2>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}
                >
                  <div>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        display: 'block',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Check to Cast
                    </label>
                    <input
                      type="number"
                      value={spellData.checkToCast}
                      onChange={(e) =>
                        setSpellData({ ...spellData, checkToCast: Number(e.target.value) })
                      }
                      min={1}
                      max={20}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-elevated)',
                        color: 'var(--color-white)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.375rem',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        display: 'block',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Energy Cost
                    </label>
                    <input
                      type="number"
                      value={spellData.energy}
                      onChange={(e) =>
                        setSpellData({ ...spellData, energy: Number(e.target.value) })
                      }
                      min={1}
                      max={10}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-elevated)',
                        color: 'var(--color-white)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.375rem',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        display: 'block',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Range
                    </label>
                    <select
                      value={spellData.range}
                      onChange={(e) => setSpellData({ ...spellData, range: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-elevated)',
                        color: 'var(--color-white)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.375rem',
                      }}
                    >
                      <option value="Self">Self</option>
                      <option value="Adjacent">Adjacent</option>
                      <option value="Nearby">Nearby</option>
                      <option value="Very Short">Very Short</option>
                      <option value="Short">Short</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Far">Far</option>
                      <option value="Very Far">Far</option>
                      <option value="Distant">Distant</option>
                    
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        display: 'block',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Duration
                    </label>
                    <input
                      type="text"
                      value={spellData.duration}
                      onChange={(e) => setSpellData({ ...spellData, duration: e.target.value })}
                      placeholder="e.g., Instantaneous, 1 minute, Concentration"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-elevated)',
                        color: 'var(--color-white)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.375rem',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--color-cloud)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Components (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={spellData.components.join(', ')}
                    onChange={(e) =>
                      setSpellData({
                        ...spellData,
                        components: e.target.value
                          .split(',')
                          .map((c) => c.trim())
                          .filter((c) => c),
                      })
                    }
                    placeholder="e.g., pinch of sulfur, bat wing"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--color-cloud)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Ritual Duration (Optional)
                  </label>
                  <input
                    type="text"
                    value={spellData.ritualDuration}
                    onChange={(e) => setSpellData({ ...spellData, ritualDuration: e.target.value })}
                    placeholder="e.g., 1 hour, 10 minutes"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '2rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--color-cloud)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={spellData.concentration}
                      onChange={(e) =>
                        setSpellData({ ...spellData, concentration: e.target.checked })
                      }
                      style={{ transform: 'scale(1.2)' }}
                    />
                    Requires Concentration
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--color-cloud)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={spellData.reaction}
                      onChange={(e) => setSpellData({ ...spellData, reaction: e.target.checked })}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    Can be cast as Reaction
                  </label>
                </div>

                <div>
                  <h3 style={{ color: 'var(--color-white)', marginBottom: '1rem' }}>
                    Damage (Optional)
                  </h3>
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}
                  >
                    <div>
                      <label
                        style={{
                          color: 'var(--color-cloud)',
                          display: 'block',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Damage Amount
                      </label>
                      <input
                        type="number"
                        value={spellData.damage}
                        onChange={(e) =>
                          setSpellData({ ...spellData, damage: Number(e.target.value) })
                        }
                        min={0}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-elevated)',
                          color: 'var(--color-white)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                        }}
                      />
                    </div>

                    {spellData.damage > 0 && (
                      <div>
                        <label
                          style={{
                            color: 'var(--color-cloud)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Damage Type
                        </label>
                        <select
                          value={spellData.damageType || ''}
                          onChange={(e) =>
                            setSpellData({ ...spellData, damageType: e.target.value })
                          }
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-elevated)',
                            color: 'var(--color-white)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.375rem',
                          }}
                        >
                          <option value="">Select type...</option>
                          <option value="physical">Physical</option>
                          <option value="heat">Heat</option>
                          <option value="cold">Cold</option>
                          <option value="electric">Electric</option>
                          <option value="dark">Dark</option>
                          <option value="divine">Divine</option>
                          <option value="psychic">Psychic</option>
                          <option value="toxic">Toxic</option>
                          <option value="aetheric">Aetheric</option>
                          <option value="true">True</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        );

      case 3:
        return (
          <Card variant="default">
            <CardHeader>
              <h2 style={{ color: 'var(--color-white)', fontSize: '1.5rem' }}>Meta Information</h2>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label
                    style={{
                      color: 'var(--color-cloud)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={spellData.tags.join(', ')}
                    onChange={(e) =>
                      setSpellData({
                        ...spellData,
                        tags: e.target.value
                          .split(',')
                          .map((tag) => tag.trim())
                          .filter((tag) => tag),
                      })
                    }
                    placeholder="e.g., fire, combat, utility"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--color-cloud)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Source/Campaign
                  </label>
                  <input
                    type="text"
                    value={spellData.source}
                    onChange={(e) => setSpellData({ ...spellData, source: e.target.value })}
                    placeholder="e.g., My Campaign Setting"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--color-cloud)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Balance Notes
                  </label>
                  <textarea
                    value={spellData.balanceNotes}
                    onChange={(e) => setSpellData({ ...spellData, balanceNotes: e.target.value })}
                    placeholder="Explain your design choices and balance considerations..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                    }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1
        style={{
          color: 'var(--color-white)',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
        }}
      >
        {id ? 'Edit' : 'Create'} Homebrew Spell
      </h1>

      {error && (
        <div
          style={{
            backgroundColor: 'var(--color-stormy)',
            color: 'var(--color-white)',
            padding: '1rem',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Progress indicator */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '4px',
                backgroundColor:
                  i < currentStep ? 'var(--color-metal-gold)' : 'var(--color-dark-elevated)',
                marginRight: i < totalSteps - 1 ? '0.5rem' : '0',
                borderRadius: '2px',
              }}
            />
          ))}
        </div>
        <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
          Step {currentStep} of {totalSteps}
        </div>
      </div>

      {renderStep()}

      {/* Navigation buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '2rem',
        }}
      >
        <Button
          variant="secondary"
          onClick={() =>
            currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/homebrew')
          }
          disabled={saving}
        >
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>

        <Button
          variant="primary"
          onClick={() =>
            currentStep < totalSteps ? setCurrentStep(currentStep + 1) : handleSubmit()
          }
          disabled={saving || !spellData.name || !spellData.description}
        >
          {currentStep === totalSteps
            ? saving
              ? `${id ? 'Updating' : 'Creating'}...`
              : `${id ? 'Update' : 'Create'} Spell`
            : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default HomebrewSpellCreator;
