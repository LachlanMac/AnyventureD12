import React, { useState, useEffect } from 'react';
import { Item, Damage, ArmorData } from '../types/character';
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

// Helper function to convert range numbers to descriptive text
const getRangeDescription = (minRange: number, maxRange: number): string => {
  const rangeMap: { [key: number]: string } = {
    0: 'No Min',
    1: 'Adjacent',
    2: 'Nearby',
    3: 'Very Short',
    4: 'Short',
    5: 'Moderate',
    6: 'Distant',
    7: 'Remote',
    8: 'Unlimited',
  };

  // Get descriptive names
  const minDesc = rangeMap[minRange] || 'Unknown';
  const maxDesc = rangeMap[maxRange] || 'Unknown';

  // If min is 0 (No Min), only show max
  if (minRange === 0) {
    return maxDesc;
  }

  // If both are the same, show only one
  if (minDesc === maxDesc) {
    return minDesc;
  }

  // Otherwise show range
  return `${minDesc} - ${maxDesc}`;
};

const ItemCompendium: React.FC = () => {
  const [items, setItems] = useState<APIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<APIItem | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [weaponCategoryFilter, setWeaponCategoryFilter] = useState<string>('all');

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

  const getFilteredItems = () => {
    let filtered = [...items];

    // Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term) ||
          item.type.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    // Rarity filter
    if (rarityFilter !== 'all') {
      filtered = filtered.filter((item) => item.rarity === rarityFilter);
    }

    // Weapon category filter
    if (weaponCategoryFilter !== 'all' && typeFilter === 'weapon') {
      filtered = filtered.filter((item) => item.weapon_category === weaponCategoryFilter);
    }

    // Sort by rarity (artifact > legendary > epic > rare > uncommon > common), then name
    const rarityOrder = {
      artifact: 6,
      legendary: 5,
      epic: 4,
      rare: 3,
      uncommon: 2,
      common: 1,
    };

    return filtered.sort((a, b) => {
      const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      return a.name.localeCompare(b.name);
    });
  };

  const filteredItems = getFilteredItems();

  const rarityColors = {
    common: '#9CA3AF',
    uncommon: '#10B981',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
    artifact: '#EF4444',
  };

  const itemTypes = [
    'all',
    'weapon',
    'boots',
    'body',
    'gloves',
    'headwear',
    'cloak',
    'accessory',
    'shield',
    'trade_good',
    'consumable',
    'tool',
    'instrument',
    'ammunition',
  ];

  const rarityTypes = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'artifact'];

  const weaponCategories = [
    'all',
    'simpleMelee',
    'simpleRanged',
    'complexMelee',
    'complexRanged',
    'unarmed',
    'throwing',
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="default">
          <CardBody>
            <p style={{ color: 'var(--color-sunset)' }}>Error: {error}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            color: 'var(--color-white)',
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
          }}
        >
          Item Compendium
        </h1>
        <p style={{ color: 'var(--color-cloud)', fontSize: '1.125rem' }}>
          Browse all available items, weapons, armor, and equipment
        </p>
      </div>

      {/* Search and Filters */}
      <Card variant="default" style={{ marginBottom: '2rem' }}>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Search bar */}
            <div style={{ position: 'relative' }}>
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

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div>
                <label
                  htmlFor="type-filter"
                  style={{
                    display: 'block',
                    color: 'var(--color-cloud)',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  Type
                </label>
                <select
                  id="type-filter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {itemTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rarity Filter */}
              <div>
                <label
                  htmlFor="rarity-filter"
                  style={{
                    display: 'block',
                    color: 'var(--color-cloud)',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  Rarity
                </label>
                <select
                  id="rarity-filter"
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {rarityTypes.map((rarity) => (
                    <option key={rarity} value={rarity}>
                      {rarity === 'all' ? 'All Rarities' : rarity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weapon Category Filter (only show when type is weapon) */}
              {typeFilter === 'weapon' && (
                <div>
                  <label
                    htmlFor="weapon-category-filter"
                    style={{
                      display: 'block',
                      color: 'var(--color-cloud)',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    Weapon Category
                  </label>
                  <select
                    id="weapon-category-filter"
                    value={weaponCategoryFilter}
                    onChange={(e) => setWeaponCategoryFilter(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      padding: '0.5rem',
                    }}
                  >
                    {weaponCategories.map((category) => (
                      <option key={category} value={category}>
                        {category === 'all'
                          ? 'All Weapons'
                          : category
                              .replace(/([A-Z])/g, ' $1')
                              .trim()
                              .replace(/^./, (str) => str.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Results count */}
            <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
              Found {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Items List and Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="lg:col-span-2">
          <Card variant="default">
            <CardBody style={{ padding: '0' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredItems.map((item, index) => (
                  <div
                    key={item._id}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      padding: '1rem',
                      cursor: 'pointer',
                      backgroundColor:
                        selectedItem?._id === item._id
                          ? 'var(--color-dark-elevated)'
                          : 'transparent',
                      borderLeft:
                        selectedItem?._id === item._id
                          ? '3px solid var(--color-metal-gold)'
                          : '3px solid transparent',
                      borderBottom:
                        index < filteredItems.length - 1
                          ? '1px solid var(--color-dark-border)'
                          : 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedItem?._id !== item._id) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedItem?._id !== item._id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Left section - Name and basic info */}
                      <div style={{ flex: '1', minWidth: '0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                          <h3
                            style={{
                              color: 'var(--color-white)',
                              fontSize: '1.125rem',
                              fontWeight: 'bold',
                              margin: 0,
                            }}
                          >
                            {item.name}
                          </h3>
                          <span
                            style={{
                              color: rarityColors[item.rarity],
                              fontSize: '0.875rem',
                              fontWeight: 'bold',
                              textTransform: 'capitalize',
                            }}
                          >
                            {item.rarity}
                          </span>
                        </div>
                        <p
                          style={{
                            color: 'var(--color-cloud)',
                            fontSize: '0.875rem',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.description}
                        </p>
                      </div>

                      {/* Middle section - Type and category */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' }}>
                        <span
                          style={{
                            color: 'var(--color-cloud)',
                            fontSize: '0.75rem',
                            textTransform: 'capitalize',
                            backgroundColor: 'var(--color-dark-elevated)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {item.type}
                        </span>
                        {item.weapon_category && (
                          <span style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>
                            {item.weapon_category
                              .replace(/([A-Z])/g, ' $1')
                              .trim()
                              .toLowerCase()}
                          </span>
                        )}
                      </div>

                      {/* Right section - Quick stats */}
                      <div style={{ display: 'flex', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                        <div style={{ textAlign: 'center', width: '60px' }}>
                          <div style={{ fontSize: '0.75rem' }}>Weight</div>
                          <div style={{ color: 'var(--color-cloud)' }}>{item.weight}</div>
                        </div>
                        <div style={{ textAlign: 'center', width: '60px' }}>
                          <div style={{ fontSize: '0.75rem' }}>Value</div>
                          <div style={{ color: 'var(--color-cloud)' }}>{item.value}</div>
                        </div>
                        <div style={{ textAlign: 'center', width: '60px' }}>
                          <div style={{ fontSize: '0.75rem' }}>Damage</div>
                          <div style={{ color: 'var(--color-cloud)' }}>
                            {item.primary?.damage && item.primary.damage !== '0' ? item.primary.damage : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Selected item detail */}
        <div className="lg:col-span-1">
          {selectedItem ? (
            <Card variant="default" style={{ position: 'sticky', top: '1rem' }}>
              <CardHeader>
                <h2
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {selectedItem.name}
                </h2>
              </CardHeader>
              <CardBody>
                <ItemDetail item={selectedItem} />
              </CardBody>
            </Card>
          ) : (
            <Card variant="default">
              <CardBody>
                <div style={{ color: 'var(--color-cloud)', textAlign: 'center', padding: '2rem' }}>
                  <p style={{ marginBottom: '0.5rem' }}>Select an item to view details</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                    Click on any item card to see its full information
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Reuse the ItemDetail component from ItemBrowser but with some modifications
const ItemDetail: React.FC<{ item: APIItem }> = ({ item }) => {
  const rarityColors = {
    common: '#9CA3AF',
    uncommon: '#10B981',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
    artifact: '#EF4444',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Type and Rarity */}
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
        {item.weapon_category && (
          <>
            <span style={{ color: 'var(--color-muted)' }}>•</span>
            <span style={{ color: 'var(--color-cloud)' }}>
              {item.weapon_category.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </>
        )}
      </div>

      {/* Description */}
      <div>
        <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.5rem' }}>Description</h3>
        <p style={{ color: 'var(--color-cloud)', lineHeight: '1.5' }}>{item.description}</p>
      </div>

      {/* Basic Properties */}
      <div>
        <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>Properties</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.5rem',
          }}
        >
          <div style={{ color: 'var(--color-cloud)' }}>
            <strong>Weight:</strong> {item.weight}
          </div>
          <div style={{ color: 'var(--color-cloud)' }}>
            <strong>Value:</strong> {item.value}
          </div>
        </div>
      </div>

      {/* Weapon Data */}
      {item.primary && (
        <div>
          <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
            Combat Stats
          </h3>
          <div
            style={{
              backgroundColor: 'var(--color-dark-elevated)',
              padding: '1rem',
              borderRadius: '0.375rem',
            }}
          >
            {item.primary.damage !== '0' && (
              <div style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                <strong>Primary Damage:</strong> {item.primary.damage} {item.primary.damage_type}
                {item.primary.damage_extra !== '0' && ` (+${item.primary.damage_extra} per extra hit)`}
              </div>
            )}
            {item.primary.category && (
              <div style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                <strong>Damage Type:</strong> {item.primary.category}
              </div>
            )}
            {(item.primary.min_range > 0 || item.primary.max_range > 0) && (
              <div style={{ color: 'var(--color-cloud)' }}>
                <strong>Range:</strong> {getRangeDescription(item.primary.min_range, item.primary.max_range)}
              </div>
            )}
            {item.secondary && item.secondary.damage !== '0' && (
              <div style={{ color: 'var(--color-cloud)', marginTop: '0.75rem' }}>
                <strong>Secondary:</strong> {item.secondary.damage} {item.secondary.damage_type}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resource Bonuses */}
      {((item.health?.max !== 0 || item.health?.recovery !== 0) ||
        (item.energy?.max !== 0 || item.energy?.recovery !== 0) ||
        (item.resolve?.max !== 0 || item.resolve?.recovery !== 0)) && (
        <div>
          <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
            Resource Bonuses
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(item.health?.max !== 0 || item.health?.recovery !== 0) && (
              <div style={{ color: 'var(--color-cloud)' }}>
                <strong>Health:</strong>
                {item.health?.max !== 0 && ` ${item.health.max > 0 ? '+' : ''}${item.health.max} max`}
                {item.health?.recovery !== 0 &&
                  ` ${item.health.recovery > 0 ? '+' : ''}${item.health.recovery} recovery`}
              </div>
            )}
            {(item.energy?.max !== 0 || item.energy?.recovery !== 0) && (
              <div style={{ color: 'var(--color-cloud)' }}>
                <strong>Energy:</strong>
                {item.energy?.max !== 0 && ` ${item.energy.max > 0 ? '+' : ''}${item.energy.max} max`}
                {item.energy?.recovery !== 0 &&
                  ` ${item.energy.recovery > 0 ? '+' : ''}${item.energy.recovery} recovery`}
              </div>
            )}
            {(item.resolve?.max !== 0 || item.resolve?.recovery !== 0) && (
              <div style={{ color: 'var(--color-cloud)' }}>
                <strong>Resolve:</strong>
                {item.resolve?.max !== 0 && ` ${item.resolve.max > 0 ? '+' : ''}${item.resolve.max} max`}
                {item.resolve?.recovery !== 0 &&
                  ` ${item.resolve.recovery > 0 ? '+' : ''}${item.resolve.recovery} recovery`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Movement Bonus */}
      {item.movement !== 0 && (
        <div>
          <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.5rem' }}>Movement</h3>
          <p style={{ color: 'var(--color-cloud)' }}>
            {item.movement > 0 ? '+' : ''}
            {item.movement} movement speed
          </p>
        </div>
      )}
    </div>
  );
};

export default ItemCompendium;