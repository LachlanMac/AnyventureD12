import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';

interface SpellTabProps {
  characterId: string;
  spells: any[];
  spellSlots: number;
  sorcererSpells?: any[];
  sorcererSpellSlots?: number;
  thiefSpells?: any[];
  thiefSpellSlots?: number;
  exoticSchools?: {
    fiend: boolean;
    draconic: boolean;
    fey: boolean;
    celestial: boolean;
    cosmic: boolean;
    chaos: boolean;
  };
  onUpdateExoticSchools?: (schools: any) => void;
  canEdit?: boolean;
}

interface Spell {
  _id: string;
  name: string;
  description: string;
  charge?: string | null;
  duration: string;
  range: string;
  school: string;
  subschool: string;
  checkToCast: number;
  components: string[];
  energy: number;
  damage: number;
  damageType: string;
  concentration: boolean;
  reaction: boolean;
}

interface CharacterSpell {
  spellId: string;
  dateAdded: string;
  favorite: boolean;
  notes: string;
  _id: string;
  spellData?: Spell;
}

const SpellsTab: React.FC<SpellTabProps> = ({
  characterId,
  spells,
  spellSlots,
  sorcererSpells = [],
  sorcererSpellSlots = 0,
  thiefSpells = [],
  thiefSpellSlots = 0,
  exoticSchools = {
    fiend: false,
    draconic: false,
    fey: false,
    celestial: false,
    cosmic: false,
    chaos: false
  },
  onUpdateExoticSchools,
  canEdit = true
}) => {
  const [enhancedSpells, setEnhancedSpells] = useState<CharacterSpell[]>([]);
  const [enhancedSorcererSpells, setEnhancedSorcererSpells] = useState<CharacterSpell[]>([]);
  const [enhancedThiefSpells, setEnhancedThiefSpells] = useState<CharacterSpell[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleExoticToggle = async (school: string) => {
    if (!onUpdateExoticSchools) return;

    const updatedSchools = {
      ...exoticSchools,
      [school]: !exoticSchools[school as keyof typeof exoticSchools]
    };

    onUpdateExoticSchools(updatedSchools);
  };

  const fetchSpellDetails = async (spellList: any[]): Promise<CharacterSpell[]> => {
    const enhanced = [...spellList] as CharacterSpell[];
    for (let i = 0; i < enhanced.length; i++) {
      try {
        const response = await fetch(`/api/spells/${enhanced[i].spellId}`);
        if (response.ok) {
          enhanced[i].spellData = await response.json();
        }
      } catch (err) {
        console.error(`Error fetching spell ${enhanced[i].spellId}:`, err);
      }
    }
    return enhanced;
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [regular, sorcerer, thief] = await Promise.all([
          spells.length > 0 ? fetchSpellDetails(spells) : Promise.resolve([]),
          sorcererSpells.length > 0 ? fetchSpellDetails(sorcererSpells) : Promise.resolve([]),
          thiefSpells.length > 0 ? fetchSpellDetails(thiefSpells) : Promise.resolve([]),
        ]);

        setEnhancedSpells(regular);
        setEnhancedSorcererSpells(sorcerer);
        setEnhancedThiefSpells(thief);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching spell data:', err);
        setError('Failed to load spell details');
        setLoading(false);
      }
    };

    fetchAll();
  }, [spells, sorcererSpells, thiefSpells]);

  const getSchoolColor = (school: string | undefined) => {
    switch (school?.toLowerCase()) {
      case 'meta':
      case 'black':
      case 'white':
      case 'mysticism':
      case 'primal':
      case 'arcane':
        return 'rgba(215, 183, 64, 0.7)';
      default:
        return 'var(--color-dark-elevated)';
    }
  };

  const renderSpellCard = (spell: CharacterSpell, accentColor?: string) => (
    <Card key={spell._id} variant="default" hoverEffect={true}>
      <CardHeader
        style={{
          backgroundColor: accentColor || getSchoolColor(spell.spellData?.school),
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3
            style={{
              color: 'var(--color-white)',
              fontSize: '1.125rem',
              fontWeight: 'bold',
            }}
          >
            {spell.spellData?.name || 'Loading spell...'}
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {spell.spellData?.school && (
              <span
                style={{
                  color: 'var(--color-white)',
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.375rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '0.25rem',
                  textTransform: 'capitalize',
                }}
              >
                {spell.spellData.school}
              </span>
            )}
            {spell.spellData?.subschool && (
              <span
                style={{
                  color: 'var(--color-white)',
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.375rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '0.25rem',
                  textTransform: 'capitalize',
                }}
              >
                {spell.spellData.subschool}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {spell.spellData ? (
          <>
            <p
              style={{
                color: 'var(--color-cloud)',
                fontSize: '0.875rem',
                marginBottom: '0.75rem',
              }}
            >
              {spell.spellData.description}
            </p>
            {spell.spellData.charge && (
              <div
                style={{
                  backgroundColor: 'var(--color-dark-elevated)',
                  borderLeft: '3px solid var(--color-metal-gold)',
                  padding: '0.5rem',
                  marginBottom: '0.75rem',
                  borderRadius: '0.25rem',
                }}
              >
                <div
                  style={{
                    color: 'var(--color-metal-gold)',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    marginBottom: '0.25rem',
                  }}
                >
                  Charge Effect:
                </div>
                <p
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    margin: 0,
                  }}
                >
                  {spell.spellData.charge}
                </p>
              </div>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--color-cloud)',
              }}
            >
              <div>
                <span style={{ fontWeight: 'bold' }}>Range:</span> {spell.spellData.range}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>Duration:</span>{' '}
                {spell.spellData.duration}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>Energy Cost:</span>{' '}
                {spell.spellData.energy}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>Check to Cast:</span>{' '}
                {spell.spellData.checkToCast}
              </div>
              {spell.spellData.damage > 0 && (
                <>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>Damage:</span>{' '}
                    {spell.spellData.damage}
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>Damage Type:</span>{' '}
                    {spell.spellData.damageType}
                  </div>
                </>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginTop: '0.75rem',
              }}
            >
              {spell.spellData.concentration && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.125rem 0.375rem',
                    backgroundColor: 'var(--color-dark-elevated)',
                    borderRadius: '0.25rem',
                    color: 'var(--color-metal-gold)',
                  }}
                >
                  Concentration
                </span>
              )}

              {spell.spellData.reaction && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.125rem 0.375rem',
                    backgroundColor: 'var(--color-dark-elevated)',
                    borderRadius: '0.25rem',
                    color: 'var(--color-sunset)',
                  }}
                >
                  Reaction
                </span>
              )}

              {spell.spellData.components &&
                spell.spellData.components.length > 0 &&
                spell.spellData.components[0] !== '' && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.375rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      borderRadius: '0.25rem',
                      color: 'var(--color-white)',
                    }}
                  >
                    Components: {spell.spellData.components.join(', ')}
                  </span>
                )}
            </div>
          </>
        ) : (
          <div
            style={{ color: 'var(--color-cloud)', textAlign: 'center', padding: '1rem' }}
          >
            Loading spell details...
          </div>
        )}

        {spell.notes && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem',
              backgroundColor: 'var(--color-dark-elevated)',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              color: 'var(--color-cloud)',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Notes:</div>
            {spell.notes}
          </div>
        )}
      </CardBody>
    </Card>
  );

  const renderSpellSection = (
    title: string,
    spellList: CharacterSpell[],
    used: number,
    total: number,
    accentColor?: string
  ) => (
    <div style={{ marginBottom: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h3
            style={{
              color: accentColor || 'var(--color-white)',
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}
          >
            {title}
          </h3>
          <p style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
            {used} / {total} slots used
          </p>
        </div>
      </div>
      {spellList.length === 0 ? (
        <Card variant="default">
          <CardBody>
            <div
              style={{
                textAlign: 'center',
                padding: '1rem',
                color: 'var(--color-cloud)',
                fontSize: '0.875rem',
              }}
            >
              No {title.toLowerCase()} assigned yet.
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spellList.map((spell) => renderSpellCard(spell, accentColor))}
        </div>
      )}
    </div>
  );

  const hasSorcererSlots = sorcererSpellSlots > 0;
  const hasThiefSlots = thiefSpellSlots > 0;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Spells
          </h2>
          <p style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
            {spells.length} / {spellSlots} spell slots used
            {hasSorcererSlots && (
              <span style={{ color: 'rgb(57, 0, 214)', marginLeft: '1rem' }}>
                Sorcerer: {sorcererSpells.length} / {sorcererSpellSlots}
              </span>
            )}
            {hasThiefSlots && (
              <span style={{ color: 'var(--color-sunset)', marginLeft: '1rem' }}>
                Thief: {thiefSpells.length} / {thiefSpellSlots}
              </span>
            )}
          </p>
        </div>
        {canEdit && (
          <Link to={`/characters/${characterId}/spells`}>
            <Button variant="accent">Manage Spells</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="loading-spinner"></div>
        </div>
      ) : error ? (
        <Card variant="default">
          <CardBody>
            <div
              style={{
                color: 'var(--color-sunset)',
                textAlign: 'center',
                padding: '1rem',
              }}
            >
              {error}
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          {enhancedSpells.length === 0 && !hasSorcererSlots && !hasThiefSlots ? (
            <Card variant="default">
              <CardBody>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                  }}
                >
                  <div
                    style={{
                      color: 'var(--color-cloud)',
                      marginBottom: canEdit ? '1rem' : '0',
                    }}
                  >
                    No spells known yet.{canEdit && ' Add spells to enhance your magical abilities.'}
                  </div>
                  {canEdit && (
                    <Link to={`/characters/${characterId}/spells`}>
                      <Button variant="secondary">Add Spells</Button>
                    </Link>
                  )}
                </div>
              </CardBody>
            </Card>
          ) : (
            <>
              {(enhancedSpells.length > 0 || (!hasSorcererSlots && !hasThiefSlots)) && (
                <div style={{ marginBottom: hasSorcererSlots || hasThiefSlots ? '2rem' : '0' }}>
                  {enhancedSpells.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {enhancedSpells.map((spell) => renderSpellCard(spell))}
                    </div>
                  )}
                  {enhancedSpells.length === 0 && (hasSorcererSlots || hasThiefSlots) && (
                    <Card variant="default">
                      <CardBody>
                        <div
                          style={{
                            textAlign: 'center',
                            padding: '1rem',
                            color: 'var(--color-cloud)',
                            fontSize: '0.875rem',
                          }}
                        >
                          No learned spells yet.
                        </div>
                      </CardBody>
                    </Card>
                  )}
                </div>
              )}

              {hasSorcererSlots &&
                renderSpellSection(
                  'Sorcerer Spells',
                  enhancedSorcererSpells,
                  sorcererSpells.length,
                  sorcererSpellSlots,
                  'rgb(57, 0, 214)'
                )}

              {hasThiefSlots &&
                renderSpellSection(
                  'Thief Spells',
                  enhancedThiefSpells,
                  thiefSpells.length,
                  thiefSpellSlots,
                  'var(--color-sunset)'
                )}
            </>
          )}
        </>
      )}

      {/* Exotic Schools Configuration */}
      <div style={{ marginTop: '2rem' }}>
        <Card variant="default">
          <CardHeader>
            <h3 style={{ color: 'var(--color-white)', fontSize: '1rem', fontWeight: 'bold' }}>
              Exotic School Access
            </h3>
          </CardHeader>
          <CardBody>
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Fiend */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: onUpdateExoticSchools ? 'pointer' : 'not-allowed',
                color: 'var(--color-cloud)',
                opacity: onUpdateExoticSchools ? 1 : 0.6
              }}>
                <div style={{
                  position: 'relative',
                  width: '44px',
                  height: '24px',
                  backgroundColor: exoticSchools.fiend ? 'var(--color-sat-purple)' : 'var(--color-dark-elevated)',
                  borderRadius: '12px',
                  transition: 'background-color 0.2s',
                  border: '2px solid var(--color-slate)',
                  cursor: onUpdateExoticSchools ? 'pointer' : 'not-allowed'
                }}>
                  <input
                    type="checkbox"
                    checked={exoticSchools.fiend}
                    onChange={() => handleExoticToggle('fiend')}
                    disabled={!onUpdateExoticSchools}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0,
                      position: 'absolute'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: exoticSchools.fiend ? '22px' : '2px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'var(--color-white)',
                    borderRadius: '50%',
                    transition: 'left 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Fiend</span>
              </label>

              {/* Draconic */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: onUpdateExoticSchools ? 'pointer' : 'not-allowed',
                color: 'var(--color-cloud)',
                opacity: onUpdateExoticSchools ? 1 : 0.6
              }}>
                <div style={{
                  position: 'relative',
                  width: '44px',
                  height: '24px',
                  backgroundColor: exoticSchools.draconic ? 'var(--color-sat-purple)' : 'var(--color-dark-elevated)',
                  borderRadius: '12px',
                  transition: 'background-color 0.2s',
                  border: '2px solid var(--color-slate)',
                  cursor: onUpdateExoticSchools ? 'pointer' : 'not-allowed'
                }}>
                  <input
                    type="checkbox"
                    checked={exoticSchools.draconic}
                    onChange={() => handleExoticToggle('draconic')}
                    disabled={!onUpdateExoticSchools}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0,
                      position: 'absolute'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: exoticSchools.draconic ? '22px' : '2px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'var(--color-white)',
                    borderRadius: '50%',
                    transition: 'left 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Draconic</span>
              </label>

              {/* Fey */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: onUpdateExoticSchools ? 'pointer' : 'not-allowed',
                color: 'var(--color-cloud)',
                opacity: onUpdateExoticSchools ? 1 : 0.6
              }}>
                <div style={{
                  position: 'relative',
                  width: '44px',
                  height: '24px',
                  backgroundColor: exoticSchools.fey ? 'var(--color-sat-purple)' : 'var(--color-dark-elevated)',
                  borderRadius: '12px',
                  transition: 'background-color 0.2s',
                  border: '2px solid var(--color-slate)',
                  cursor: onUpdateExoticSchools ? 'pointer' : 'not-allowed'
                }}>
                  <input
                    type="checkbox"
                    checked={exoticSchools.fey}
                    onChange={() => handleExoticToggle('fey')}
                    disabled={!onUpdateExoticSchools}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0,
                      position: 'absolute'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: exoticSchools.fey ? '22px' : '2px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'var(--color-white)',
                    borderRadius: '50%',
                    transition: 'left 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Fey</span>
              </label>

              {/* Celestial */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: onUpdateExoticSchools ? 'pointer' : 'not-allowed',
                color: 'var(--color-cloud)',
                opacity: onUpdateExoticSchools ? 1 : 0.6
              }}>
                <div style={{
                  position: 'relative',
                  width: '44px',
                  height: '24px',
                  backgroundColor: exoticSchools.celestial ? 'var(--color-sat-purple)' : 'var(--color-dark-elevated)',
                  borderRadius: '12px',
                  transition: 'background-color 0.2s',
                  border: '2px solid var(--color-slate)',
                  cursor: onUpdateExoticSchools ? 'pointer' : 'not-allowed'
                }}>
                  <input
                    type="checkbox"
                    checked={exoticSchools.celestial}
                    onChange={() => handleExoticToggle('celestial')}
                    disabled={!onUpdateExoticSchools}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0,
                      position: 'absolute'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: exoticSchools.celestial ? '22px' : '2px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'var(--color-white)',
                    borderRadius: '50%',
                    transition: 'left 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Celestial</span>
              </label>

              {/* Cosmic */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: onUpdateExoticSchools ? 'pointer' : 'not-allowed',
                color: 'var(--color-cloud)',
                opacity: onUpdateExoticSchools ? 1 : 0.6
              }}>
                <div style={{
                  position: 'relative',
                  width: '44px',
                  height: '24px',
                  backgroundColor: exoticSchools.cosmic ? 'var(--color-sat-purple)' : 'var(--color-dark-elevated)',
                  borderRadius: '12px',
                  transition: 'background-color 0.2s',
                  border: '2px solid var(--color-slate)',
                  cursor: onUpdateExoticSchools ? 'pointer' : 'not-allowed'
                }}>
                  <input
                    type="checkbox"
                    checked={exoticSchools.cosmic}
                    onChange={() => handleExoticToggle('cosmic')}
                    disabled={!onUpdateExoticSchools}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0,
                      position: 'absolute'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: exoticSchools.cosmic ? '22px' : '2px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'var(--color-white)',
                    borderRadius: '50%',
                    transition: 'left 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Cosmic</span>
              </label>

              {/* Chaos */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: onUpdateExoticSchools ? 'pointer' : 'not-allowed',
                color: 'var(--color-cloud)',
                opacity: onUpdateExoticSchools ? 1 : 0.6
              }}>
                <div style={{
                  position: 'relative',
                  width: '44px',
                  height: '24px',
                  backgroundColor: exoticSchools.chaos ? 'var(--color-sat-purple)' : 'var(--color-dark-elevated)',
                  borderRadius: '12px',
                  transition: 'background-color 0.2s',
                  border: '2px solid var(--color-slate)',
                  cursor: onUpdateExoticSchools ? 'pointer' : 'not-allowed'
                }}>
                  <input
                    type="checkbox"
                    checked={exoticSchools.chaos}
                    onChange={() => handleExoticToggle('chaos')}
                    disabled={!onUpdateExoticSchools}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0,
                      position: 'absolute'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: exoticSchools.chaos ? '22px' : '2px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'var(--color-white)',
                    borderRadius: '50%',
                    transition: 'left 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Chaos</span>
              </label>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SpellsTab;
