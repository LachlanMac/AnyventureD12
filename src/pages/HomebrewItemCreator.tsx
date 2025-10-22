import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import { Item } from '../types/character';
import { valueToGold, goldToValue, formatGoldDisplay } from '../utils/valueUtils';

const HomebrewItemCreator: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);

  // Basic item data
  const [itemData, setItemData] = useState({
    name: '',
    description: '',
    type: 'weapon' as Item['type'],
    weapon_category: '' as Item['weapon_category'],
    consumable_category: '' as Item['consumable_category'],
    rarity: 'common' as Item['rarity'],
    weight: 1,
    value: 0,
    tags: [] as string[],
    source: '',
    balanceNotes: '',
  });

  // Weapon data
  const [weaponData, setWeaponData] = useState({
    bonus_attack: 0,
    primary: {
      damage: '0',
      damage_extra: '0',
      damage_type: 'physical',
      category: 'slash' as 'pierce' | 'slash' | 'blunt' | 'ranged',
      secondary_damage: 0,
      secondary_damage_extra: 0,
      secondary_damage_type: 'none',
      min_range: 0,
      max_range: 0,
    },
    secondary: {
      damage: '0',
      damage_extra: '0',
      damage_type: 'physical',
      category: 'slash' as 'pierce' | 'slash' | 'blunt' | 'ranged',
      secondary_damage: 0,
      secondary_damage_extra: 0,
      secondary_damage_type: 'none',
      min_range: 0,
      max_range: 0,
    },
  });

  const [hasSecondaryDamage, setHasSecondaryDamage] = useState(false);

  // Encumbrance penalty
  const [encumbrancePenalty, setEncumbrancePenalty] = useState(0);

  // Resource bonuses
  const [resourceBonuses, setResourceBonuses] = useState({
    health: { max: 0, recovery: 0 },
    energy: { max: 0, recovery: 0 },
    resolve: { max: 0, recovery: 0 },
    movement: 0,
  });

  // Mitigation
  const [mitigation, setMitigation] = useState({
    physical: 0,
    cold: 0,
    heat: 0,
    electric: 0,
    psychic: 0,
    dark: 0,
    divine: 0,
    aether: 0,
    toxic: 0,
  });

  // Current step
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = itemData.type === 'weapon' ? 5 : 4;

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/homebrew/items/${id}`);
      if (!response.ok) throw new Error('Failed to fetch item');

      const item = await response.json();

      // Populate form with existing data
      setItemData({
        name: item.name,
        description: item.description,
        type: item.type,
        weapon_category: item.weapon_category || '',
        consumable_category: item.consumable_category || '',
        rarity: item.rarity,
        weight: item.weight,
        value: item.value,
        tags: item.tags || [],
        source: item.source || '',
        balanceNotes: item.balanceNotes || '',
      });

      if (item.type === 'weapon') {
        setWeaponData({
          bonus_attack: item.bonus_attack || 0,
          primary: item.primary || { damage: '', damage_extra: '', damage_type: 'physical' },
          secondary: item.secondary || { damage: '', damage_extra: '', damage_type: 'physical' },
        });
        setHasSecondaryDamage(!!item.secondary);
      }

      if (item.encumbrance_penalty) {
        setEncumbrancePenalty(item.encumbrance_penalty);
      }

      if (item.health || item.energy || item.resolve || item.movement) {
        setResourceBonuses({
          health: item.health || { max: 0, recovery: 0 },
          energy: item.energy || { max: 0, recovery: 0 },
          resolve: item.resolve || { max: 0, recovery: 0 },
          movement: item.movement || 0,
        });
      }

      if (item.mitigation) {
        setMitigation(item.mitigation);
      }
    } catch (err) {
      showError('Failed to load item for editing');
      navigate('/homebrew/items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to create homebrew items');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Combine all data
      const completeItem = {
        ...itemData,
        ...(itemData.type === 'weapon' && {
          bonus_attack: weaponData.bonus_attack,
          primary: weaponData.primary,
          ...(hasSecondaryDamage && { secondary: weaponData.secondary }),
        }),
        encumbrance_penalty: encumbrancePenalty,
        health: resourceBonuses.health,
        energy: resourceBonuses.energy,
        resolve: resourceBonuses.resolve,
        movement: resourceBonuses.movement,
        mitigation,
      };

      const url = id ? `/api/homebrew/items/${id}` : '/api/homebrew/items';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(completeItem),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${id ? 'update' : 'create'} homebrew item`);
      }

      const savedItem = await response.json();
      showSuccess(`Item ${id ? 'updated' : 'created'} successfully!`);
      navigate(`/homebrew/items/${savedItem._id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to ${id ? 'update' : 'create'} item`;
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
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={itemData.name}
                    onChange={(e) => setItemData({ ...itemData, name: e.target.value })}
                    placeholder="e.g., Flaming Sword of Justice"
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
                    value={itemData.description}
                    onChange={(e) => setItemData({ ...itemData, description: e.target.value })}
                    placeholder="Describe your item's appearance and lore..."
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        display: 'block',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Item Type
                    </label>
                    <select
                      value={itemData.type}
                      onChange={(e) =>
                        setItemData({ ...itemData, type: e.target.value as Item['type'] })
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
                      <option value="weapon">Weapon</option>
                      <option value="boots">Boots</option>
                      <option value="body">Body Armor</option>
                      <option value="gloves">Gloves</option>
                      <option value="headwear">Headwear</option>
                      <option value="cloak">Cloak</option>
                      <option value="accessory">Accessory</option>
                      <option value="shield">Shield</option>
                      <option value="consumable">Consumable</option>
                      <option value="tool">Tool</option>
                      <option value="instrument">Instrument</option>
                      <option value="ammunition">Ammunition</option>
                      <option value="adventure">Adventure</option>
                      <option value="goods">Trade Good</option>
                      <option value="runes">Runes</option>
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
                      Rarity
                    </label>
                    <select
                      value={itemData.rarity}
                      onChange={(e) =>
                        setItemData({ ...itemData, rarity: e.target.value as Item['rarity'] })
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
                      <option value="common">Common</option>
                      <option value="uncommon">Uncommon</option>
                      <option value="rare">Rare</option>
                      <option value="epic">Epic</option>
                      <option value="legendary">Legendary</option>
                      <option value="artifact">Artifact</option>
                    </select>
                  </div>
                </div>

                {itemData.type === 'weapon' && (
                  <div>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        display: 'block',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Weapon Category
                    </label>
                    <select
                      value={itemData.weapon_category}
                      onChange={(e) =>
                        setItemData({
                          ...itemData,
                          weapon_category: e.target.value as Item['weapon_category'],
                        })
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
                      <option value="">Select category...</option>
                      <option value="simpleMelee">Simple Melee</option>
                      <option value="simpleRanged">Simple Ranged</option>
                      <option value="complexMelee">Complex Melee</option>
                      <option value="complexRanged">Complex Ranged</option>
                      <option value="brawling">Brawling</option>
                      <option value="throwing">Throwing</option>
                    </select>
                  </div>
                )}

                {itemData.type === 'consumable' && (
                  <div>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        display: 'block',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Consumable Category
                    </label>
                    <select
                      value={itemData.consumable_category}
                      onChange={(e) =>
                        setItemData({
                          ...itemData,
                          consumable_category: e.target.value as Item['consumable_category'],
                        })
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
                      <option value="">Select category...</option>
                      <option value="poisons">Poisons</option>
                      <option value="elixirs">Elixirs</option>
                      <option value="potions">Potions</option>
                      <option value="explosives">Explosives</option>
                    </select>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        display: 'block',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Weight
                    </label>
                    <input
                      type="number"
                      value={itemData.weight}
                      onChange={(e) => setItemData({ ...itemData, weight: Number(e.target.value) })}
                      min={0}
                      step={0.1}
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
                      Value (Gold) - {formatGoldDisplay(itemData.value)}
                    </label>
                    <input
                      type="number"
                      value={valueToGold(itemData.value)}
                      onChange={(e) =>
                        setItemData({ ...itemData, value: goldToValue(Number(e.target.value)) })
                      }
                      min={0}
                      step={0.1}
                      placeholder="e.g., 1.5 for 1 gold 5 silver"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-elevated)',
                        color: 'var(--color-white)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.375rem',
                      }}
                    />
                    <div
                      style={{
                        color: 'var(--color-cloud)',
                        fontSize: '0.75rem',
                        marginTop: '0.25rem',
                      }}
                    >
                      Enter value in gold (e.g., 1.5 = 1 gold, 5 silver)
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        );

      case 2:
        if (itemData.type === 'weapon') {
          const rangeOptions = [
            { label: 'Adjacent', value: 1 },
            { label: 'Nearby', value: 2 },
            { label: 'Very Short', value: 3 },
            { label: 'Short', value: 4 },
            { label: 'Moderate', value: 5 },
            { label: 'Far', value: 6 },
            { label: 'Very Far', value: 6 },
            { label: 'Distant', value: 8 },
          ];

          return (
            <Card variant="default">
              <CardHeader>
                <h2 style={{ color: 'var(--color-white)', fontSize: '1.5rem' }}>
                  Weapon Properties
                </h2>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Attack Bonus - applies to whole weapon */}
                  <div>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        display: 'block',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Attack Bonus (applies to all attacks)
                    </label>
                    <input
                      type="number"
                      value={weaponData.bonus_attack}
                      onChange={(e) =>
                        setWeaponData({ ...weaponData, bonus_attack: Number(e.target.value) })
                      }
                      min={0}
                      max={5}
                      style={{
                        width: '100px',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-elevated)',
                        color: 'var(--color-white)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.375rem',
                      }}
                    />
                  </div>

                  {/* Primary Damage */}
                  <div>
                    <h3 style={{ color: 'var(--color-white)', marginBottom: '1rem' }}>
                      Primary Damage
                    </h3>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            color: 'var(--color-cloud)',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Base Damage
                        </label>
                        <input
                          type="text"
                          value={weaponData.primary.damage}
                          onChange={(e) =>
                            setWeaponData({
                              ...weaponData,
                              primary: { ...weaponData.primary, damage: e.target.value },
                            })
                          }
                          placeholder="e.g., 3 or 1d6"
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
                          Extra Damage
                        </label>
                        <input
                          type="text"
                          value={weaponData.primary.damage_extra}
                          onChange={(e) =>
                            setWeaponData({
                              ...weaponData,
                              primary: { ...weaponData.primary, damage_extra: e.target.value },
                            })
                          }
                          placeholder="e.g., 2"
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
                          Damage Type
                        </label>
                        <select
                          value={weaponData.primary.damage_type}
                          onChange={(e) =>
                            setWeaponData({
                              ...weaponData,
                              primary: { ...weaponData.primary, damage_type: e.target.value },
                            })
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
                          <option value="physical">Physical</option>
                          <option value="heat">Heat</option>
                          <option value="cold">Cold</option>
                          <option value="electric">Electric</option>
                          <option value="dark">Dark</option>
                          <option value="divine">Divine</option>
                          <option value="arcane">Arcane</option>
                          <option value="psychic">Psychic</option>
                          <option value="toxic">Toxic</option>
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
                          Damage Category
                        </label>
                        <select
                          value={weaponData.primary.category}
                          onChange={(e) =>
                            setWeaponData({
                              ...weaponData,
                              primary: { ...weaponData.primary, category: e.target.value as any },
                            })
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
                          <option value="slash">Slash</option>
                          <option value="pierce">Pierce</option>
                          <option value="blunt">Blunt</option>
                          <option value="ranged">Ranged</option>
                          <option value="black_magic">Black Magic</option>
                          <option value="primal_magic">Primal Magic</option>
                          <option value="white_magic">White Magic</option>
                          <option value="mysticism_magic">Mysticism Magic</option>
                          <option value="meta_magic">Meta Magic</option>
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
                          Min Range
                        </label>
                        <select
                          value={weaponData.primary.min_range}
                          onChange={(e) =>
                            setWeaponData({
                              ...weaponData,
                              primary: { ...weaponData.primary, min_range: Number(e.target.value) },
                            })
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
                          {rangeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label} ({option.value})
                            </option>
                          ))}
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
                          Max Range
                        </label>
                        <select
                          value={weaponData.primary.max_range}
                          onChange={(e) =>
                            setWeaponData({
                              ...weaponData,
                              primary: { ...weaponData.primary, max_range: Number(e.target.value) },
                            })
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
                          {rangeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label} ({option.value})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Damage Toggle */}
                  <div>
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
                        checked={hasSecondaryDamage}
                        onChange={(e) => setHasSecondaryDamage(e.target.checked)}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      Add Secondary Damage Type (like a halberd with both slash and pierce)
                    </label>
                  </div>

                  {/* Secondary Damage */}
                  {hasSecondaryDamage && (
                    <div>
                      <h3 style={{ color: 'var(--color-white)', marginBottom: '1rem' }}>
                        Secondary Damage
                      </h3>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '1rem',
                        }}
                      >
                        <div>
                          <label
                            style={{
                              color: 'var(--color-cloud)',
                              display: 'block',
                              marginBottom: '0.5rem',
                            }}
                          >
                            Base Damage
                          </label>
                          <input
                            type="text"
                            value={weaponData.secondary.damage}
                            onChange={(e) =>
                              setWeaponData({
                                ...weaponData,
                                secondary: { ...weaponData.secondary, damage: e.target.value },
                              })
                            }
                            placeholder="e.g., 3 or 1d6"
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
                            Extra Damage
                          </label>
                          <input
                            type="text"
                            value={weaponData.secondary.damage_extra}
                            onChange={(e) =>
                              setWeaponData({
                                ...weaponData,
                                secondary: {
                                  ...weaponData.secondary,
                                  damage_extra: e.target.value,
                                },
                              })
                            }
                            placeholder="e.g., 2"
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
                            Damage Type
                          </label>
                          <select
                            value={weaponData.secondary.damage_type}
                            onChange={(e) =>
                              setWeaponData({
                                ...weaponData,
                                secondary: { ...weaponData.secondary, damage_type: e.target.value },
                              })
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
                            <option value="physical">Physical</option>
                            <option value="heat">Heat</option>
                            <option value="cold">Cold</option>
                            <option value="electric">Electric</option>
                            <option value="dark">Dark</option>
                            <option value="divine">Divine</option>
                            <option value="arcane">Arcane</option>
                            <option value="psychic">Psychic</option>
                            <option value="toxic">Toxic</option>
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
                            Damage Category
                          </label>
                          <select
                            value={weaponData.secondary.category}
                            onChange={(e) =>
                              setWeaponData({
                                ...weaponData,
                                secondary: {
                                  ...weaponData.secondary,
                                  category: e.target.value as any,
                                },
                              })
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
                            <option value="slash">Slash</option>
                            <option value="pierce">Pierce</option>
                            <option value="blunt">Blunt</option>
                            <option value="ranged">Ranged</option>
                            <option value="black_magic">Black Magic</option>
                            <option value="primal_magic">Primal Magic</option>
                            <option value="white_magic">White Magic</option>
                            <option value="mysticism_magic">Mysticism Magic</option>
                            <option value="meta_magic">Meta Magic</option>
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
                            Min Range
                          </label>
                          <select
                            value={weaponData.secondary.min_range}
                            onChange={(e) =>
                              setWeaponData({
                                ...weaponData,
                                secondary: {
                                  ...weaponData.secondary,
                                  min_range: Number(e.target.value),
                                },
                              })
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
                            {rangeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label} ({option.value})
                              </option>
                            ))}
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
                            Max Range
                          </label>
                          <select
                            value={weaponData.secondary.max_range}
                            onChange={(e) =>
                              setWeaponData({
                                ...weaponData,
                                secondary: {
                                  ...weaponData.secondary,
                                  max_range: Number(e.target.value),
                                },
                              })
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
                            {rangeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label} ({option.value})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        }
        // For non-weapon items, show bonuses directly
        return (
          <Card variant="default">
            <CardHeader>
              <h2 style={{ color: 'var(--color-white)', fontSize: '1.5rem' }}>
                Bonuses & Penalties
              </h2>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Resource Bonuses */}
                <div>
                  <h3 style={{ color: 'var(--color-white)', marginBottom: '0.5rem' }}>
                    Resource Bonuses
                  </h3>
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}
                  >
                    <div>
                      <label style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                        Health Max
                      </label>
                      <input
                        type="number"
                        value={resourceBonuses.health.max}
                        onChange={(e) =>
                          setResourceBonuses({
                            ...resourceBonuses,
                            health: { ...resourceBonuses.health, max: Number(e.target.value) },
                          })
                        }
                        style={{
                          width: '100%',
                          padding: '0.25rem',
                          backgroundColor: 'var(--color-dark-elevated)',
                          color: 'var(--color-white)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.25rem',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                        Energy Max
                      </label>
                      <input
                        type="number"
                        value={resourceBonuses.energy.max}
                        onChange={(e) =>
                          setResourceBonuses({
                            ...resourceBonuses,
                            energy: { ...resourceBonuses.energy, max: Number(e.target.value) },
                          })
                        }
                        style={{
                          width: '100%',
                          padding: '0.25rem',
                          backgroundColor: 'var(--color-dark-elevated)',
                          color: 'var(--color-white)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.25rem',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                        Resolve Max
                      </label>
                      <input
                        type="number"
                        value={resourceBonuses.resolve.max}
                        onChange={(e) =>
                          setResourceBonuses({
                            ...resourceBonuses,
                            resolve: { ...resourceBonuses.resolve, max: Number(e.target.value) },
                          })
                        }
                        style={{
                          width: '100%',
                          padding: '0.25rem',
                          backgroundColor: 'var(--color-dark-elevated)',
                          color: 'var(--color-white)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.25rem',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Balance Notes */}
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
                    value={itemData.balanceNotes}
                    onChange={(e) => setItemData({ ...itemData, balanceNotes: e.target.value })}
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

      case 3:
        return (
          <Card variant="default">
            <CardHeader>
              <h2 style={{ color: 'var(--color-white)', fontSize: '1.5rem' }}>
                Bonuses & Penalties
              </h2>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Resource Bonuses */}
                <div>
                  <h3 style={{ color: 'var(--color-white)', marginBottom: '0.5rem' }}>
                    Resource Bonuses
                  </h3>
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}
                  >
                    <div>
                      <label style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                        Health Max
                      </label>
                      <input
                        type="number"
                        value={resourceBonuses.health.max}
                        onChange={(e) =>
                          setResourceBonuses({
                            ...resourceBonuses,
                            health: { ...resourceBonuses.health, max: Number(e.target.value) },
                          })
                        }
                        style={{
                          width: '100%',
                          padding: '0.25rem',
                          backgroundColor: 'var(--color-dark-elevated)',
                          color: 'var(--color-white)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.25rem',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                        Energy Max
                      </label>
                      <input
                        type="number"
                        value={resourceBonuses.energy.max}
                        onChange={(e) =>
                          setResourceBonuses({
                            ...resourceBonuses,
                            energy: { ...resourceBonuses.energy, max: Number(e.target.value) },
                          })
                        }
                        style={{
                          width: '100%',
                          padding: '0.25rem',
                          backgroundColor: 'var(--color-dark-elevated)',
                          color: 'var(--color-white)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.25rem',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                        Resolve Max
                      </label>
                      <input
                        type="number"
                        value={resourceBonuses.resolve.max}
                        onChange={(e) =>
                          setResourceBonuses({
                            ...resourceBonuses,
                            resolve: { ...resourceBonuses.resolve, max: Number(e.target.value) },
                          })
                        }
                        style={{
                          width: '100%',
                          padding: '0.25rem',
                          backgroundColor: 'var(--color-dark-elevated)',
                          color: 'var(--color-white)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.25rem',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                        Movement
                      </label>
                      <input
                        type="number"
                        value={resourceBonuses.movement}
                        onChange={(e) =>
                          setResourceBonuses({
                            ...resourceBonuses,
                            movement: Number(e.target.value),
                          })
                        }
                        style={{
                          width: '100%',
                          padding: '0.25rem',
                          backgroundColor: 'var(--color-dark-elevated)',
                          color: 'var(--color-white)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.25rem',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Encumbrance Penalty */}
                <div>
                  <h3 style={{ color: 'var(--color-white)', marginBottom: '0.5rem' }}>
                    Encumbrance Penalty
                  </h3>
                  <div>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        fontSize: '0.75rem',
                      }}
                    >
                      Penalty Value
                    </label>
                    <input
                      type="number"
                      value={encumbrancePenalty}
                      onChange={(e) => setEncumbrancePenalty(Number(e.target.value))}
                      min={0}
                      style={{
                        width: '100%',
                        padding: '0.25rem',
                        backgroundColor: 'var(--color-dark-elevated)',
                        color: 'var(--color-white)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.25rem',
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        );

      case 4:
        return (
          <Card variant="default">
            <CardHeader>
              <h2 style={{ color: 'var(--color-white)', fontSize: '1.5rem' }}>Mitigation & Meta</h2>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Mitigation */}
                <div>
                  <h3 style={{ color: 'var(--color-white)', marginBottom: '0.5rem' }}>
                    Damage Mitigation
                  </h3>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                    }}
                  >
                    {Object.entries(mitigation).map(([damageType, value]) => (
                      <div key={damageType}>
                        <label
                          style={{
                            color: 'var(--color-cloud)',
                            fontSize: '0.75rem',
                            textTransform: 'capitalize',
                          }}
                        >
                          {damageType}
                        </label>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) =>
                            setMitigation({
                              ...mitigation,
                              [damageType]: Number(e.target.value),
                            })
                          }
                          min={0}
                          style={{
                            width: '100%',
                            padding: '0.25rem',
                            backgroundColor: 'var(--color-dark-elevated)',
                            color: 'var(--color-white)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.25rem',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
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
                    value={itemData.tags.join(', ')}
                    onChange={(e) =>
                      setItemData({
                        ...itemData,
                        tags: e.target.value
                          .split(',')
                          .map((tag) => tag.trim())
                          .filter((tag) => tag),
                      })
                    }
                    placeholder="e.g., magic, cursed, elemental"
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

                {/* Source */}
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
                    value={itemData.source}
                    onChange={(e) => setItemData({ ...itemData, source: e.target.value })}
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

                {/* Balance Notes */}
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
                    value={itemData.balanceNotes}
                    onChange={(e) => setItemData({ ...itemData, balanceNotes: e.target.value })}
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
        {id ? 'Edit' : 'Create'} Homebrew Item
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
          disabled={saving || !itemData.name || !itemData.description}
        >
          {currentStep === totalSteps
            ? saving
              ? `${id ? 'Updating' : 'Creating'}...`
              : `${id ? 'Update' : 'Create'} Item`
            : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default HomebrewItemCreator;
