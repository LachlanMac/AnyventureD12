import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Item } from '../types/character';
import Card, { CardBody } from '../components/ui/Card';

// Extended Item type that includes recipe information
interface RecipeItem extends Item {
  recipe?: {
    type: string;
    difficulty: number;
    ingredients?: string[];
  };
}

const RecipeCompendium: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [craftingTypeFilter, setCraftingTypeFilter] = useState<string>('all');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/items');
        if (!response.ok) {
          throw new Error('Failed to fetch items');
        }
        const itemsData = await response.json();
        // Filter only items that have recipes
        const recipesOnly = itemsData.filter((item: RecipeItem) => item.recipe && item.recipe.type);
        setItems(recipesOnly);
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
          (item.recipe?.ingredients?.some((ing) => ing.toLowerCase().includes(term)) ?? false)
      );
    }

    // Crafting type filter
    if (craftingTypeFilter !== 'all') {
      filtered = filtered.filter((item) => item.recipe?.type === craftingTypeFilter);
    }

    // Sort by crafting type, then difficulty, then name
    return filtered.sort((a, b) => {
      // First by crafting type
      const typeCompare = (a.recipe?.type || '').localeCompare(b.recipe?.type || '');
      if (typeCompare !== 0) return typeCompare;

      // Then by difficulty
      const diffCompare = (a.recipe?.difficulty || 0) - (b.recipe?.difficulty || 0);
      if (diffCompare !== 0) return diffCompare;

      // Finally by name
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

  const craftingTypes = [
    'all',
    'alchemy',
    'cooking',
    'engineering',
    'fabrication',
    'glyphcraft',
    'bioshaping',
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
          Recipe Compendium
        </h1>
        <p style={{ color: 'var(--color-cloud)', fontSize: '1.125rem' }}>
          Browse all crafting recipes for alchemy, cooking, engineering, and more
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
                placeholder="Search recipes..."
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
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Filter dropdown */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <select
                value={craftingTypeFilter}
                onChange={(e) => setCraftingTypeFilter(e.target.value)}
                style={{
                  backgroundColor: 'var(--color-dark-elevated)',
                  color: 'var(--color-white)',
                  border: '1px solid var(--color-dark-border)',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                }}
              >
                {craftingTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all'
                      ? 'All Crafting Types'
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Results count */}
            <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
              Showing {filteredItems.length} recipe{filteredItems.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Recipes List */}
      <Card variant="default">
        <CardBody>
          {/* Header Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '20% 15% 35% 30%',
              gap: '1rem',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--color-dark-border)',
              fontWeight: 'bold',
              color: 'var(--color-cloud)',
              fontSize: '0.875rem',
            }}
          >
            <div>Name</div>
            <div>Type</div>
            <div>Ingredients</div>
            <div>Properties</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {filteredItems.map((item, index) => (
              <div
                key={item._id}
                onClick={() => navigate(`/items/${item._id}`)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '20% 15% 35% 30%',
                  gap: '1rem',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--color-dark-elevated)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-dark-border)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    index % 2 === 0 ? 'transparent' : 'var(--color-dark-elevated)';
                }}
              >
                {/* Name Column */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <h3
                      style={{
                        color: 'var(--color-white)',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </h3>
                  </div>
                  <span
                    style={{
                      color: rarityColors[item.rarity],
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.rarity}
                  </span>
                </div>

                {/* Type Column */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      color: 'var(--color-cloud)',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {item.recipe?.type &&
                      item.recipe.type.charAt(0).toUpperCase() + item.recipe.type.slice(1)}
                  </div>
                  <div style={{ color: 'var(--color-gray)', fontSize: '0.75rem' }}>
                    Difficulty: {item.recipe?.difficulty}
                  </div>
                </div>

                {/* Ingredients Column */}
                <div style={{ minWidth: 0 }}>
                  {item.recipe?.ingredients && item.recipe.ingredients.length > 0 ? (
                    <div
                      style={{
                        color: 'var(--color-gray)',
                        fontSize: '0.875rem',
                        lineHeight: '1.4',
                        wordWrap: 'break-word',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                      title={item.recipe.ingredients.join(', ')}
                    >
                      {item.recipe.ingredients.join(', ')}
                    </div>
                  ) : (
                    <div
                      style={{
                        color: 'var(--color-gray)',
                        fontSize: '0.875rem',
                        fontStyle: 'italic',
                      }}
                    >
                      No ingredients required
                    </div>
                  )}
                </div>

                {/* Properties Column */}
                <div style={{ minWidth: 0 }}>
                  {item.properties && (
                    <div
                      style={{
                        color: 'var(--color-sky)',
                        fontSize: '0.875rem',
                        lineHeight: '1.4',
                        wordWrap: 'break-word',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                      title={item.properties}
                    >
                      {item.properties}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* No results message */}
      {filteredItems.length === 0 && (
        <Card variant="default" style={{ marginTop: '2rem' }}>
          <CardBody>
            <p style={{ color: 'var(--color-cloud)', textAlign: 'center' }}>
              No recipes found matching your filters.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default RecipeCompendium;
