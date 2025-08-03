import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Item, Damage, ArmorData } from '../types/character';
import Card, { CardBody } from '../components/ui/Card';

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

const ItemCompendium: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<APIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [weaponCategoryFilter, setWeaponCategoryFilter] = useState<string>('all');
  const [consumableCategoryFilter, setConsumableCategoryFilter] = useState<string>('all');

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

    // Consumable category filter
    if (consumableCategoryFilter !== 'all' && typeFilter === 'consumable') {
      filtered = filtered.filter((item) => item.consumable_category === consumableCategoryFilter);
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
    'goods',
    'adventure',
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

  const consumableCategories = [
    'all',
    'poisons',
    'elixirs',
    'potions',
    'explosives',
    'intoxicants',
    'snack',
    'meal',
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

              {/* Consumable Category Filter (only show when type is consumable) */}
              {typeFilter === 'consumable' && (
                <div>
                  <label
                    htmlFor="consumable-category-filter"
                    style={{
                      display: 'block',
                      color: 'var(--color-cloud)',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    Consumable Category
                  </label>
                  <select
                    id="consumable-category-filter"
                    value={consumableCategoryFilter}
                    onChange={(e) => setConsumableCategoryFilter(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      padding: '0.5rem',
                    }}
                  >
                    {consumableCategories.map((category) => (
                      <option key={category} value={category}>
                        {category === 'all'
                          ? 'All Consumables'
                          : category.charAt(0).toUpperCase() + category.slice(1)}
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

      {/* Items List */}
      <Card variant="default">
        <CardBody style={{ padding: '0' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredItems.map((item, index) => (
              <div
                key={item._id}
                onClick={() => navigate(`/items/${item._id}`)}
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  borderLeft: '3px solid transparent',
                  borderBottom:
                    index < filteredItems.length - 1
                      ? '1px solid var(--color-dark-border)'
                      : 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Top section - Name and rarity */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3
                      style={{
                        color: 'var(--color-white)',
                        fontSize: '1.125rem',
                        fontWeight: 'bold',
                        margin: 0,
                        flex: 1,
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

                  {/* Bottom section - Stats and info */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
                  >
                    {/* Type badge */}
                    <span
                      style={{
                        color: 'var(--color-cloud)',
                        fontSize: '0.75rem',
                        textTransform: 'capitalize',
                        backgroundColor: 'var(--color-dark-elevated)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.25rem',
                      }}
                    >
                      {item.type}
                    </span>

                    {/* Weapon category if applicable */}
                    {item.weapon_category && (
                      <span
                        style={{
                          color: 'var(--color-muted)',
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--color-dark-elevated)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                        }}
                      >
                        {item.weapon_category
                          .replace(/([A-Z])/g, ' $1')
                          .trim()
                          .toLowerCase()}
                      </span>
                    )}

                    {/* Quick stats */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        marginLeft: 'auto',
                        fontSize: '0.75rem',
                        color: 'var(--color-muted)',
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div>Weight</div>
                        <div style={{ color: 'var(--color-cloud)', fontWeight: 'bold' }}>
                          {item.weight}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div>Value</div>
                        <div style={{ color: 'var(--color-cloud)', fontWeight: 'bold' }}>
                          {item.value}
                        </div>
                      </div>
                      {item.primary?.damage && item.primary.damage !== '0' && (
                        <div style={{ textAlign: 'center' }}>
                          <div>Damage</div>
                          <div style={{ color: 'var(--color-cloud)', fontWeight: 'bold' }}>
                            {item.primary.damage}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ItemCompendium;
