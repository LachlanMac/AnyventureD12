import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Item, Damage, ArmorData, Character } from '../types/character';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import PurchaseItemModal from '../components/character/view/PurchaseItemModal';
import AddItemModal from '../components/character/view/AddItemModal';

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

// Helper function to convert range numbers to descriptive text
const getRangeDescription = (minRange: number, maxRange: number): string => {
  // Helper to get range description for a single value
  const getSingleRangeDesc = (value: number): string => {
    if (value === 0 || value === 1) return 'Adjacent';
    if (value === 2) return 'Nearby';
    if (value >= 3 && value <= 5) return 'Very Short';
    if (value >= 6 && value <= 10) return 'Short';
    if (value >= 11 && value <= 20) return 'Moderate';
    if (value >= 21 && value <= 40) return 'Far';
    if (value >= 41 && value <= 60) return 'Very Far';
    if (value >= 61 && value <= 100) return 'Distant';
    return 'Unlimited';
  };

  // If min is 0 or 1 and max is 1, it's just Adjacent (melee)
  if ((minRange === 0 || minRange === 1) && maxRange === 1) {
    return 'Melee';
  }

  // Get descriptive names
  const minDesc = getSingleRangeDesc(minRange);
  const maxDesc = getSingleRangeDesc(maxRange);

  // If both are the same, show only one
  if (minDesc === maxDesc) {
    return minDesc;
  }

  // If min is 1 (Adjacent) and max is something else, just show the max
  if (minRange === 1 && maxRange > 1) {
    return maxDesc;
  }

  // Otherwise show range
  return `${minDesc} to ${maxDesc}`;
};

// Helper function to render energy stars
const renderEnergyStars = (energy: number | undefined): React.ReactElement => {
  if (!energy || energy === 0) {
    return <span style={{ color: 'var(--color-cloud)' }}>None</span>;
  }

  return (
    <span style={{ display: 'inline-flex', gap: '0.125rem', alignItems: 'center' }}>
      {Array.from({ length: energy }).map((_, i) => (
        <span key={i} style={{ color: '#FFD700', fontSize: '0.9rem' }}>★</span>
      ))}
    </span>
  );
};

const ItemBrowser: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const { showSuccess, showError } = useToast();

  const [items, setItems] = useState<APIItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<APIItem | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [weaponCategoryFilter, setWeaponCategoryFilter] = useState('all');
  const [addingItem, setAddingItem] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [itemToPurchase, setItemToPurchase] = useState<APIItem | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemToAdd, setItemToAdd] = useState<APIItem | null>(null);

  // Helper function to check if a skill bonus has any non-zero values
  const hasSkillBonus = (skill: any): boolean => {
    return (
      (skill?.add_bonus || 0) > 0 ||
      (skill?.set_bonus || 0) > 0 ||
      (skill?.add_talent || 0) > 0 ||
      (skill?.set_talent || 0) > 0
    );
  };

  // Helper function to format currency (value in silver)
  const formatCurrency = (valueInSilver: number): React.ReactElement => {
    const gold = Math.floor(valueInSilver / 10);
    const silver = valueInSilver % 10;

    return (
      <span style={{ display: 'inline-flex', gap: '0.75rem', alignItems: 'center' }}>
        {gold > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '0.9rem' }}>⚜</span>
            <span>{gold}</span>
          </span>
        )}
        {silver > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ color: '#C0C0C0', fontWeight: 'bold', fontSize: '0.9rem' }}>◉</span>
            <span>{silver}</span>
          </span>
        )}
        {valueInSilver === 0 && <span>Free</span>}
      </span>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch items
        const itemsResponse = await fetch('/api/items');
        if (!itemsResponse.ok) {
          throw new Error('Failed to fetch items');
        }
        const itemsData = await itemsResponse.json();
        setItems(itemsData);

        // Fetch character data
        if (characterId) {
          const characterResponse = await fetch(`/api/characters/${characterId}`, {
            credentials: 'include',
          });
          if (characterResponse.ok) {
            const characterData = await characterResponse.json();
            setCharacter(characterData);
          }
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

  const handleAddItemClick = (item: APIItem) => {
    setItemToAdd(item);
    setShowAddItemModal(true);
  };

  const handleAddItem = async (quantity: number) => {
    if (!itemToAdd) return;

    try {
      setAddingItem(true);
      const response = await fetch(`/api/characters/${characterId}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: itemToAdd._id, quantity }),
        credentials: 'include',
      });

      if (response.ok) {
        // Show success message
        showSuccess(`Added ${quantity}x ${itemToAdd.name} to inventory!`);
      } else {
        throw new Error('Failed to add item to inventory');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      showError('Failed to add item to inventory');
    } finally {
      setAddingItem(false);
    }
  };

  const handlePurchaseClick = (item: APIItem) => {
    setItemToPurchase(item);
    setShowPurchaseModal(true);
  };

  const handlePurchaseConfirm = async (quantity: number) => {
    if (!itemToPurchase) return;

    try {
      setAddingItem(true);
      const response = await fetch(`/api/characters/${characterId}/purchase-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: itemToPurchase._id, quantity }),
        credentials: 'include',
      });

      if (response.ok) {
        const updatedCharacter = await response.json();
        setCharacter(updatedCharacter);
        showSuccess(`Purchased ${quantity}x ${itemToPurchase.name}!`);
        setShowPurchaseModal(false);
        setItemToPurchase(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to purchase item');
      }
    } catch (error) {
      console.error('Error purchasing item:', error);
      showError(error instanceof Error ? error.message : 'Failed to purchase item');
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

    // Filter by weapon category (only applies when type is weapon)
    if (typeFilter === 'weapon' && weaponCategoryFilter !== 'all') {
      filtered = filtered.filter((item) => item.weapon_category === weaponCategoryFilter);
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {character && (
                <Button
                  onClick={() => handlePurchaseClick(item)}
                  disabled={addingItem}
                  variant="accent"
                >
                  Purchase
                </Button>
              )}
              <Button onClick={() => handleAddItemClick(item)} disabled={addingItem} variant="accent">
                {addingItem ? 'Adding...' : 'Add to Inventory'}
              </Button>
            </div>
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
              {item.type === 'weapon' ? (
                <span style={{ color: 'var(--color-cloud)' }}>
                  {item.hands === 2 ? '2-Handed' : '1-Handed'}{' '}
                  {item.weapon_category === 'complexMelee' || item.weapon_category === 'complexRanged' ? 'Complex' : 'Simple'}{' '}
                  {item.weapon_category === 'simpleMelee' || item.weapon_category === 'complexMelee' ? 'Melee' :
                   item.weapon_category === 'simpleRanged' || item.weapon_category === 'complexRanged' ? 'Ranged' :
                   item.weapon_category === 'brawling' ? 'Brawling' :
                   item.weapon_category === 'throwing' ? 'Throwing' : ''}{' '}
                  Weapon
                </span>
              ) : (
                <>
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

            {/* Effects (for consumables with substance data) */}
            {item.substance && (
              <div>
                <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
                  Effects
                </h3>
                <div
                  style={{
                    backgroundColor: 'var(--color-dark-elevated)',
                    padding: '1rem',
                    borderRadius: '0.375rem',
                  }}
                >
                  <div style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                    <strong>Effect:</strong> {item.substance.effect}
                  </div>
                  <div style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                    <strong>Duration:</strong> {item.substance.duration}
                  </div>
                  <div style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                    <strong>Category:</strong> <span style={{ textTransform: 'capitalize' }}>{item.substance.category}</span>
                  </div>
                  <div style={{ color: 'var(--color-cloud)' }}>
                    <strong>Dependency Risk:</strong> {item.substance.dependency}
                  </div>
                  {item.side_effect && (
                    <>
                      <div style={{ height: '1px', backgroundColor: 'var(--color-dark-border)', margin: '0.75rem 0' }} />
                      <div style={{ color: 'var(--color-sunset)' }}>
                        <strong>Side Effect:</strong> {item.side_effect}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Effects (for items with effects array) */}
            {!item.substance && item.effects && item.effects.length > 0 && (
              <div>
                <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
                  Effects
                </h3>
                <div
                  style={{
                    backgroundColor: 'var(--color-dark-elevated)',
                    padding: '1rem',
                    borderRadius: '0.375rem',
                  }}
                >
                  {item.effects.map((effect, index) => (
                    <div key={index} style={{ marginBottom: index < item.effects!.length - 1 ? '0.75rem' : '0' }}>
                      <div style={{ color: 'var(--color-cloud)', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        {effect.type}
                      </div>
                      <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                        {effect.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                <div style={{ color: 'var(--color-cloud)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong>Value:</strong> {formatCurrency(item.value || 0)}
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
            {(item.primary || item.weapon_data) && (
              <div>
                <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
                  Weapon Details
                </h3>
                <div
                  style={{
                    backgroundColor: 'var(--color-dark-elevated)',
                    padding: '1rem',
                    borderRadius: '0.375rem',
                  }}
                >
                  {/* Primary Damage */}
                  {item.primary && (
                    <>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong>Primary:</strong>
                        <span style={{ color: 'var(--color-old-gold)', fontWeight: 'bold' }}>
                          [{item.primary.damage}/{item.primary.damage_extra}]
                        </span>
                        <span style={{ textTransform: 'capitalize' }}>{item.primary.damage_type}</span>
                        {item.primary.category && item.primary.category !== 'extra' && (
                          <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>({item.primary.category})</span>
                        )}
                      </div>

                      {/* Energy Cost */}
                      {item.primary.energy !== undefined && (
                        <div style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong>Energy:</strong>
                          {renderEnergyStars(item.primary.energy)}
                        </div>
                      )}

                      {/* Range */}
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                        <strong>Range:</strong>{' '}
                        {getRangeDescription(
                          item.primary.min_range || 0,
                          item.primary.max_range || 1
                        )}
                      </div>
                    </>
                  )}

                  {/* Secondary Damage */}
                  {item.secondary && item.secondary.damage !== '0' && (
                    <>
                      <div style={{ height: '1px', backgroundColor: 'var(--color-dark-border)', margin: '0.75rem 0' }} />
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong>Secondary:</strong>
                        <span style={{ color: 'var(--color-old-gold)', fontWeight: 'bold' }}>
                          [{item.secondary.damage}/{item.secondary.damage_extra}]
                        </span>
                        <span style={{ textTransform: 'capitalize' }}>{item.secondary.damage_type}</span>
                        {item.secondary.category && item.secondary.category !== 'extra' && (
                          <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>({item.secondary.category})</span>
                        )}
                      </div>

                      {/* Energy Cost for Secondary */}
                      {item.secondary.energy !== undefined && (
                        <div style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong>Energy:</strong>
                          {renderEnergyStars(item.secondary.energy)}
                        </div>
                      )}

                      {/* Range for Secondary */}
                      <div style={{ color: 'var(--color-cloud)' }}>
                        <strong>Range:</strong>{' '}
                        {getRangeDescription(
                          item.secondary.min_range || 0,
                          item.secondary.max_range || 1
                        )}
                      </div>
                    </>
                  )}

                  {/* Fallback to weapon_data if primary/secondary not available */}
                  {!item.primary && item.weapon_data && (
                    <>
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
                      {(item.weapon_data.primary.min_range > 0 ||
                        item.weapon_data.primary.max_range > 0) && (
                        <div style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                          <strong>Range:</strong>{' '}
                          {getRangeDescription(
                            item.weapon_data.primary.min_range,
                            item.weapon_data.primary.max_range
                          )}
                        </div>
                      )}
                      {item.weapon_data.secondary && item.weapon_data.secondary.damage !== '0' && (
                        <div style={{ color: 'var(--color-cloud)' }}>
                          <strong>Secondary Damage:</strong> {item.weapon_data.secondary.damage}{' '}
                          {item.weapon_data.secondary.damage_type} (
                          {item.weapon_data.secondary.category})
                        </div>
                      )}
                    </>
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
            {item.basic && Object.values(item.basic).some(hasSkillBonus) && (
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
        <Link to={`/characters/${characterId}?tab=inventory`}>
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
            onChange={(e) => {
              setTypeFilter(e.target.value);
              // Reset weapon category filter when changing type
              if (e.target.value !== 'weapon') {
                setWeaponCategoryFilter('all');
              }
            }}
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
            <option value="boots">Boots</option>
            <option value="body">Body</option>
            <option value="gloves">Gloves</option>
            <option value="headwear">Headwear</option>
            <option value="cloak">Cloaks</option>
            <option value="accessory">Accessories</option>
            <option value="shield">Shields</option>
            <option value="goods">Goods</option>
            <option value="adventure">Adventure</option>
            <option value="consumable">Consumables</option>
            <option value="tool">Tools</option>
            <option value="instrument">Instruments</option>
            <option value="ammunition">Ammunition</option>
            <option value="implant">Implants</option>
            <option value="body_parts">Body Parts</option>
          </select>

          {/* Weapon Category Filter - Only shown when Weapons type is selected */}
          {typeFilter === 'weapon' && (
            <select
              value={weaponCategoryFilter}
              onChange={(e) => setWeaponCategoryFilter(e.target.value)}
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--color-dark-elevated)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '0.375rem',
                color: 'var(--color-cloud)',
              }}
            >
              <option value="all">All Weapon Types</option>
              <option value="brawling">Brawling</option>
              <option value="throwing">Throwing</option>
              <option value="simpleMelee">Simple Melee</option>
              <option value="simpleRanged">Simple Ranged</option>
              <option value="complexMelee">Complex Melee</option>
              <option value="complexRanged">Complex Ranged</option>
            </select>
          )}

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

                    // Generate weapon type description
                    const getItemTypeDescription = () => {
                      if (item.type === 'weapon') {
                        const hands = item.hands === 2 ? '2-Handed' : '1-Handed';
                        const complexity = item.weapon_category === 'complexMelee' || item.weapon_category === 'complexRanged' ? 'Complex' : 'Simple';
                        const category =
                          item.weapon_category === 'simpleMelee' || item.weapon_category === 'complexMelee' ? 'Melee' :
                          item.weapon_category === 'simpleRanged' || item.weapon_category === 'complexRanged' ? 'Ranged' :
                          item.weapon_category === 'brawling' ? 'Brawling' :
                          item.weapon_category === 'throwing' ? 'Throwing' : '';
                        return `${hands} ${complexity} ${category} Weapon`;
                      }
                      return item.type;
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
                              }}
                            >
                              {getItemTypeDescription()}
                              {!item.type.includes('weapon') && item.slot && ` • ${item.slot}`}
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

      {/* Add Item Modal */}
      {itemToAdd && (
        <AddItemModal
          isOpen={showAddItemModal}
          onClose={() => {
            setShowAddItemModal(false);
            setItemToAdd(null);
          }}
          itemName={itemToAdd.name}
          onConfirm={handleAddItem}
        />
      )}

      {/* Purchase Modal */}
      {character && itemToPurchase && (
        <PurchaseItemModal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setItemToPurchase(null);
          }}
          itemName={itemToPurchase.name}
          itemCostInSilver={itemToPurchase.value || 0}
          currentGold={character.wealth?.gold || 0}
          currentSilver={character.wealth?.silver || 0}
          onConfirm={handlePurchaseConfirm}
        />
      )}
    </div>
  );
};

export default ItemBrowser;
