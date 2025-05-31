import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Item, Damage, ArmorData } from '../types/character';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

// Extended Item type that matches backend API response
interface APIItem extends Item {
  slot?: string;
  weapon_data?: {
    category: string;
    primary: Damage;
    secondary: Damage;
  };
  armor_data?: ArmorData;
}

const ItemBrowser: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>();

  const [items, setItems] = useState<APIItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<APIItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [addingItem, setAddingItem] = useState(false);

  // Helper function to check if a skill bonus has any non-zero values
  const hasSkillBonus = (skill: any): boolean => {
    return (skill?.add_bonus || 0) > 0 || 
           (skill?.set_bonus || 0) > 0 || 
           (skill?.add_talent || 0) > 0 || 
           (skill?.set_talent || 0) > 0;
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/items');
        if (!response.ok) {
          throw new Error('Failed to fetch items');
        }
        const itemsData = await response.json();
        setItems(itemsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleAddItem = async (itemId: string) => {
    try {
      setAddingItem(true);
      const response = await fetch(`/api/characters/${characterId}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity: 1 }),
        credentials: 'include',
      });

      if (response.ok) {
        // Show success message
        alert('Item added to inventory!');
      } else {
        throw new Error('Failed to add item to inventory');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item to inventory');
    } finally {
      setAddingItem(false);
    }
  };

  const getFilteredItems = () => {
    let filtered = [...items];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    // Filter by rarity
    if (rarityFilter !== 'all') {
      filtered = filtered.filter((item) => item.rarity === rarityFilter);
    }

    // Sort by rarity then name
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'artifact'];
    filtered.sort((a, b) => {
      const rarityDiff = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
      if (rarityDiff !== 0) return rarityDiff;
      return a.name.localeCompare(b.name);
    });

    return filtered;
  };

  const filteredItems = getFilteredItems();

  const ItemDetail: React.FC<{ item: APIItem | null }> = ({ item }) => {
    if (!item) {
      return (
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
            <div style={{ marginBottom: '1rem' }}>Select an item from the list to view details</div>
            <div style={{ fontSize: '0.875rem' }}>
              Click on any item to see its properties and stats
            </div>
          </div>
        </div>
      );
    }

    const rarityColors = {
      common: '#9CA3AF',
      uncommon: '#10B981',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B',
      artifact: '#EF4444',
    };

    return (
      <Card variant="default">
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2
              style={{
                color: 'var(--color-white)',
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}
            >
              {item.name}
            </h2>
            <Button onClick={() => handleAddItem(item._id)} disabled={addingItem}>
              {addingItem ? 'Adding...' : 'Add to Inventory'}
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Item Type and Rarity */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span
                style={{
                  color: rarityColors[item.rarity],
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                  fontSize: '1.1rem',
                }}
              >
                {item.rarity}
              </span>
              <span style={{ color: 'var(--color-muted)' }}>•</span>
              <span style={{ color: 'var(--color-cloud)', textTransform: 'capitalize' }}>
                {item.type}
              </span>
              {item.slot && (
                <>
                  <span style={{ color: 'var(--color-muted)' }}>•</span>
                  <span style={{ color: 'var(--color-cloud)', textTransform: 'capitalize' }}>
                    {item.slot} slot
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.5rem' }}>
                Description
              </h3>
              <p style={{ color: 'var(--color-cloud)', lineHeight: '1.5' }}>{item.description}</p>
            </div>

            {/* Basic Properties */}
            <div>
              <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
                Properties
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '0.5rem',
                }}
              >
                <div style={{ color: 'var(--color-cloud)' }}>
                  <strong>Weight:</strong> {item.weight}
                </div>
                <div style={{ color: 'var(--color-cloud)' }}>
                  <strong>Value:</strong> {item.value}
                </div>
                {(item.health?.max !== 0 || item.health?.recovery !== 0) && (
                  <div style={{ color: 'var(--color-cloud)' }}>
                    <strong>Health:</strong>
                    {item.health?.max !== 0 &&
                      ` ${item.health.max > 0 ? '+' : ''}${item.health.max} max`}
                    {item.health?.recovery !== 0 &&
                      ` ${item.health.recovery > 0 ? '+' : ''}${item.health.recovery} recovery`}
                  </div>
                )}
                {(item.energy?.max !== 0 || item.energy?.recovery !== 0) && (
                  <div style={{ color: 'var(--color-cloud)' }}>
                    <strong>Energy:</strong>
                    {item.energy?.max !== 0 &&
                      ` ${item.energy.max > 0 ? '+' : ''}${item.energy.max} max`}
                    {item.energy?.recovery !== 0 &&
                      ` ${item.energy.recovery > 0 ? '+' : ''}${item.energy.recovery} recovery`}
                  </div>
                )}
                {(item.resolve?.max !== 0 || item.resolve?.recovery !== 0) && (
                  <div style={{ color: 'var(--color-cloud)' }}>
                    <strong>Resolve:</strong>
                    {item.resolve?.max !== 0 &&
                      ` ${item.resolve.max > 0 ? '+' : ''}${item.resolve.max} max`}
                    {item.resolve?.recovery !== 0 &&
                      ` ${item.resolve.recovery > 0 ? '+' : ''}${item.resolve.recovery} recovery`}
                  </div>
                )}
                {item.movement !== 0 && (
                  <div style={{ color: 'var(--color-cloud)' }}>
                    <strong>Movement:</strong> {item.movement > 0 ? '+' : ''}
                    {item.movement}
                  </div>
                )}
              </div>
            </div>

            {/* Weapon Data */}
            {item.weapon_data && (
              <div>
                <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
                  Weapon Data
                </h3>
                <div
                  style={{
                    backgroundColor: 'var(--color-dark-elevated)',
                    padding: '1rem',
                    borderRadius: '0.375rem',
                  }}
                >
                  <div style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                    <strong>Category:</strong> {item.weapon_data.category}
                  </div>
                  <div style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                    <strong>Primary Damage:</strong> {item.weapon_data.primary.damage}{' '}
                    {item.weapon_data.primary.damage_type} ({item.weapon_data.primary.category})
                  </div>
                  {item.weapon_data.primary.damage_extra !== '0' && (
                    <div style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                      <strong>Extra Damage:</strong> {item.weapon_data.primary.damage_extra} per
                      extra hit
                    </div>
                  )}
                  {item.weapon_data.primary.min_range > 0 ||
                    (item.weapon_data.primary.max_range > 0 && (
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                        <strong>Range:</strong> {item.weapon_data.primary.min_range}-
                        {item.weapon_data.primary.max_range}
                      </div>
                    ))}
                  {item.weapon_data.secondary && item.weapon_data.secondary.damage !== '0' && (
                    <div style={{ color: 'var(--color-cloud)' }}>
                      <strong>Secondary Damage:</strong> {item.weapon_data.secondary.damage}{' '}
                      {item.weapon_data.secondary.damage_type} (
                      {item.weapon_data.secondary.category})
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Armor Data */}
            {item.armor_data && (
              <div>
                <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
                  Armor Data
                </h3>
                <div
                  style={{
                    backgroundColor: 'var(--color-dark-elevated)',
                    padding: '1rem',
                    borderRadius: '0.375rem',
                  }}
                >
                  <div style={{ color: 'var(--color-cloud)' }}>
                    <div>
                      <strong>Category:</strong> {item.armor_data.category}
                    </div>
                    <div>
                      <strong>Base Mitigation:</strong> {item.armor_data.base_mitigation}
                    </div>
                    {item.armor_data.dexterity_limit > 0 && (
                      <div>
                        <strong>Dexterity Limit:</strong> {item.armor_data.dexterity_limit}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Attributes */}
            {item.attributes &&
              Object.values(item.attributes).some(
                (attr) => (attr?.add_talent || 0) > 0 || (attr?.set_talent || 0) > 0
              ) && (
                <div>
                  <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
                    Attribute Bonuses
                  </h3>
                  <div
                    style={{
                      backgroundColor: 'var(--color-dark-elevated)',
                      padding: '1rem',
                      borderRadius: '0.375rem',
                    }}
                  >
                    {Object.entries(item.attributes).map(([attrName, attr]) => {
                      if ((attr?.add_talent || 0) > 0 || (attr?.set_talent || 0) > 0) {
                        return (
                          <div
                            key={attrName}
                            style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}
                          >
                            <strong style={{ textTransform: 'capitalize' }}>{attrName}:</strong>
                            {(attr?.add_talent || 0) > 0 && ` +${attr.add_talent} talent`}
                            {(attr?.set_talent || 0) > 0 && ` Set to ${attr.set_talent} talent`}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

            {/* Basic Skills */}
            {item.basic &&
              Object.values(item.basic).some(hasSkillBonus) && (
                <div>
                  <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
                    Basic Skill Bonuses
                  </h3>
                  <div
                    style={{
                      backgroundColor: 'var(--color-dark-elevated)',
                      padding: '1rem',
                      borderRadius: '0.375rem',
                    }}
                  >
                    {Object.entries(item.basic).map(([skillName, skill]) => {
                      if (
                        (skill?.add_bonus || 0) > 0 ||
                        (skill?.set_bonus || 0) > 0 ||
                        (skill?.add_talent || 0) > 0 ||
                        (skill?.set_talent || 0) > 0
                      ) {
                        return (
                          <div
                            key={skillName}
                            style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}
                          >
                            <strong style={{ textTransform: 'capitalize' }}>{skillName}:</strong>
                            {(skill?.add_bonus || 0) > 0 && ` +${skill.add_bonus} skill`}
                            {(skill?.set_bonus || 0) > 0 && ` Set to ${skill.set_bonus} skill`}
                            {(skill?.add_talent || 0) > 0 && ` +${skill.add_talent} talent`}
                            {(skill?.set_talent || 0) > 0 && ` Set to ${skill.set_talent} talent`}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

            {/* Weapon Skill Bonuses */}
            {item.weapon &&
              Object.values(item.weapon).some(
                (skill) =>
                  (skill?.add_bonus || 0) > 0 ||
                  (skill?.set_bonus || 0) > 0 ||
                  (skill?.add_talent || 0) > 0 ||
                  (skill?.set_talent || 0) > 0
              ) && (
                <div>
                  <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
                    Weapon Skill Bonuses
                  </h3>
                  <div
                    style={{
                      backgroundColor: 'var(--color-dark-elevated)',
                      padding: '1rem',
                      borderRadius: '0.375rem',
                    }}
                  >
                    {Object.entries(item.weapon).map(([skillName, skill]) => {
                      if (
                        (skill?.add_bonus || 0) > 0 ||
                        (skill?.set_bonus || 0) > 0 ||
                        (skill?.add_talent || 0) > 0 ||
                        (skill?.set_talent || 0) > 0
                      ) {
                        return (
                          <div
                            key={skillName}
                            style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}
                          >
                            <strong style={{ textTransform: 'capitalize' }}>
                              {skillName.replace(/([A-Z])/g, ' $1').trim()}:
                            </strong>
                            {(skill?.add_bonus || 0) > 0 && ` +${skill.add_bonus} skill`}
                            {(skill?.set_bonus || 0) > 0 && ` Set to ${skill.set_bonus} skill`}
                            {(skill?.add_talent || 0) > 0 && ` +${skill.add_talent} talent`}
                            {(skill?.set_talent || 0) > 0 && ` Set to ${skill.set_talent} talent`}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

            {/* Magic Skill Bonuses */}
            {item.magic &&
              Object.values(item.magic).some(
                (skill) =>
                  (skill?.add_bonus || 0) > 0 ||
                  (skill?.set_bonus || 0) > 0 ||
                  (skill?.add_talent || 0) > 0 ||
                  (skill?.set_talent || 0) > 0
              ) && (
                <div>
                  <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
                    Magic Skill Bonuses
                  </h3>
                  <div
                    style={{
                      backgroundColor: 'var(--color-dark-elevated)',
                      padding: '1rem',
                      borderRadius: '0.375rem',
                    }}
                  >
                    {Object.entries(item.magic).map(([skillName, skill]) => {
                      if (
                        (skill?.add_bonus || 0) > 0 ||
                        (skill?.set_bonus || 0) > 0 ||
                        (skill?.add_talent || 0) > 0 ||
                        (skill?.set_talent || 0) > 0
                      ) {
                        return (
                          <div
                            key={skillName}
                            style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}
                          >
                            <strong style={{ textTransform: 'capitalize' }}>{skillName}:</strong>
                            {(skill?.add_bonus || 0) > 0 && ` +${skill.add_bonus} skill`}
                            {(skill?.set_bonus || 0) > 0 && ` Set to ${skill.set_bonus} skill`}
                            {(skill?.add_talent || 0) > 0 && ` +${skill.add_talent} talent`}
                            {(skill?.set_talent || 0) > 0 && ` Set to ${skill.set_talent} talent`}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

            {/* Craft Skill Bonuses */}
            {item.craft &&
              Object.values(item.craft).some(
                (skill) =>
                  (skill?.add_bonus || 0) > 0 ||
                  (skill?.set_bonus || 0) > 0 ||
                  (skill?.add_talent || 0) > 0 ||
                  (skill?.set_talent || 0) > 0
              ) && (
                <div>
                  <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
                    Craft Skill Bonuses
                  </h3>
                  <div
                    style={{
                      backgroundColor: 'var(--color-dark-elevated)',
                      padding: '1rem',
                      borderRadius: '0.375rem',
                    }}
                  >
                    {Object.entries(item.craft).map(([skillName, skill]) => {
                      if (
                        (skill?.add_bonus || 0) > 0 ||
                        (skill?.set_bonus || 0) > 0 ||
                        (skill?.add_talent || 0) > 0 ||
                        (skill?.set_talent || 0) > 0
                      ) {
                        return (
                          <div
                            key={skillName}
                            style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}
                          >
                            <strong style={{ textTransform: 'capitalize' }}>
                              {skillName.replace(/([A-Z])/g, ' $1').trim()}:
                            </strong>
                            {(skill?.add_bonus || 0) > 0 && ` +${skill.add_bonus} skill`}
                            {(skill?.set_bonus || 0) > 0 && ` Set to ${skill.set_bonus} skill`}
                            {(skill?.add_talent || 0) > 0 && ` +${skill.add_talent} talent`}
                            {(skill?.set_talent || 0) > 0 && ` Set to ${skill.set_talent} talent`}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

            {/* Mitigation */}
            {Object.values(item.mitigation).some((val) => val > 0) && (
              <div>
                <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
                  Damage Mitigation
                </h3>
                <div
                  style={{
                    backgroundColor: 'var(--color-dark-elevated)',
                    padding: '1rem',
                    borderRadius: '0.375rem',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '0.5rem',
                      color: 'var(--color-cloud)',
                    }}
                  >
                    {Object.entries(item.mitigation).map(
                      ([type, value]) =>
                        value > 0 && (
                          <div key={type}>
                            <strong style={{ textTransform: 'capitalize' }}>{type}:</strong> {value}
                          </div>
                        )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Detections */}
            {item.detections && Object.values(item.detections).some((val) => val !== 0) && (
              <div>
                <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
                  Detections
                </h3>
                <div
                  style={{
                    backgroundColor: 'var(--color-dark-elevated)',
                    padding: '1rem',
                    borderRadius: '0.375rem',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '0.5rem',
                      color: 'var(--color-cloud)',
                    }}
                  >
                    {Object.entries(item.detections).map(
                      ([type, value]) =>
                        value !== 0 && (
                          <div key={type}>
                            <strong style={{ textTransform: 'capitalize' }}>{type}:</strong>{' '}
                            {value < 0 ? (
                              <span style={{ color: 'var(--color-sunset)' }}>Impaired</span>
                            ) : (
                              [
                                'None',
                                'Adjacent',
                                'Nearby',
                                'Very Short',
                                'Short',
                                'Moderate',
                                'Distant',
                                'Remote',
                                'Unlimited',
                              ][value]
                            )}
                          </div>
                        )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Immunities */}
            {item.immunities && Object.values(item.immunities).some((val) => val === true) && (
              <div>
                <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
                  Immunities
                </h3>
                <div
                  style={{
                    backgroundColor: 'var(--color-dark-elevated)',
                    padding: '1rem',
                    borderRadius: '0.375rem',
                  }}
                >
                  <div style={{ color: 'var(--color-cloud)' }}>
                    {Object.entries(item.immunities)
                      .filter(([_, value]) => value === true)
                      .map(([type], index, array) => (
                        <span key={type}>
                          <span style={{ textTransform: 'capitalize' }}>{type}</span>
                          {index < array.length - 1 && ', '}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Effects */}
            {item.effects && item.effects.length > 0 && (
              <div>
                <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
                  Special Effects
                </h3>
                <div
                  style={{
                    backgroundColor: 'var(--color-dark-elevated)',
                    padding: '1rem',
                    borderRadius: '0.375rem',
                  }}
                >
                  {item.effects.map((effect, index) => (
                    <div key={index} style={{ marginBottom: '0.5rem' }}>
                      <div style={{ color: 'var(--color-cloud)', fontWeight: 'bold' }}>
                        {effect.type}
                      </div>
                      <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
                        {effect.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div style={{ color: 'var(--color-sunset)', textAlign: 'center' }}>
          <h2>Error loading items</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

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
          Item Browser
        </h1>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={`/character/${characterId}?tab=inventory`}>
          <Button variant="secondary">&larr; Back to Inventory</Button>
        </Link>
      </div>

      {/* Search and filters */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--color-dark-elevated)',
                color: 'var(--color-white)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '0.375rem',
                padding: '0.75rem 1rem',
                paddingLeft: '2.5rem',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-cloud)',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-cloud)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--color-dark-elevated)',
              border: '1px solid var(--color-dark-border)',
              borderRadius: '0.375rem',
              color: 'var(--color-cloud)',
            }}
          >
            <option value="all">All Types</option>
            <option value="weapon">Weapons</option>
            <option value="gear">Gear</option>
            <option value="shield">Shields</option>
            <option value="consumable">Consumables</option>
          </select>

          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--color-dark-elevated)',
              border: '1px solid var(--color-dark-border)',
              borderRadius: '0.375rem',
              color: 'var(--color-cloud)',
            }}
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
            <option value="artifact">Artifact</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items list */}
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
                Available Items ({filteredItems.length})
              </h2>
            </CardHeader>
            <CardBody>
              {filteredItems.length === 0 ? (
                <div style={{ color: 'var(--color-cloud)', padding: '1rem' }}>
                  No items match your filters
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
                  {filteredItems.map((item) => {
                    const rarityColors = {
                      common: '#9CA3AF',
                      uncommon: '#10B981',
                      rare: '#3B82F6',
                      epic: '#8B5CF6',
                      legendary: '#F59E0B',
                      artifact: '#EF4444',
                    };

                    return (
                      <div
                        key={item._id}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '0.375rem',
                          backgroundColor: 'var(--color-dark-elevated)',
                          cursor: 'pointer',
                          border:
                            selectedItem?._id === item._id
                              ? '1px solid var(--color-metal-gold)'
                              : '1px solid transparent',
                        }}
                        onClick={() => setSelectedItem(item)}
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
                              {item.name}
                            </div>
                            <div
                              style={{
                                color: 'var(--color-cloud)',
                                fontSize: '0.75rem',
                                textTransform: 'capitalize',
                              }}
                            >
                              {item.type}
                              {item.slot && ` • ${item.slot}`}
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: rarityColors[item.rarity],
                              fontWeight: 'bold',
                              textTransform: 'capitalize',
                            }}
                          >
                            {item.rarity}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Item details */}
        <div className="md:col-span-2">
          <ItemDetail item={selectedItem} />
        </div>
      </div>
    </div>
  );
};

export default ItemBrowser;
