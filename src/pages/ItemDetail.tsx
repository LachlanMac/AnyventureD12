import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Item, Damage, ArmorData } from '../types/character';
import { CreatureAction, CreatureReaction } from '../types/creature';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import CreatureActionCard from '../components/creature/CreatureActionCard';
import CreatureReactionCard from '../components/creature/CreatureReactionCard';
import Button from '../components/ui/Button';
import { formatGoldDisplay } from '../utils/valueUtils';
import { useAuth } from '../context/AuthContext';

// Extended Item type that matches backend API response
interface APIItem extends Item {
  slot?: string;
  weapon_data?: {
    category: string;
    primary: Damage;
    secondary: Damage;
  };
  armor_data?: ArmorData;
  recipe?: {
    type: string;
    difficulty: number;
    ingredients: string[];
  };
  isHomebrew?: boolean;
  creatorId?: string;
  creatorName?: string;
  status?: 'draft' | 'private' | 'published' | 'approved' | 'rejected';
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
    6: 'Far',
    7: 'Very Far',
    8: 'Distant',
    9: 'Unlimited',
  };

  const minDesc = rangeMap[minRange] || 'Unknown';
  const maxDesc = rangeMap[maxRange] || 'Unknown';

  if (minRange === 0) {
    return maxDesc;
  }

  if (minDesc === maxDesc) {
    return minDesc;
  }

  return `${minDesc} - ${maxDesc}`;
};

const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<APIItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        setError('No item ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/items/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch item');
        }
        const itemData = await response.json();
        setItem(itemData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching item:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const rarityColors = {
    common: '#9CA3AF',
    uncommon: '#10B981',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
    artifact: '#EF4444',
  };

  const copyItemLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handlePublish = async () => {
    if (!item || !id) return;

    try {
      const response = await fetch(`/api/homebrew/items/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setItem({ ...item, status: updatedItem.status });
      }
    } catch (err) {
      console.error('Failed to publish:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="default">
          <CardBody>
            <p style={{ color: 'var(--color-sunset)', marginBottom: '1rem' }}>
              Error: {error || 'Item not found'}
            </p>
            <Link to="/items" style={{ color: 'var(--color-metal-gold)' }}>
              ← Back to Item Compendium
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Button variant="ghost" onClick={() => navigate('/items')}>
            ← Back to Items
          </Button>
          <Button variant="outline" onClick={copyItemLink}>
            📋 Copy Link
          </Button>
          {user && (
            <Button
              variant="outline"
              onClick={() => navigate(`/homebrew/items/create?template=${id}`)}
            >
              Use as Template
            </Button>
          )}
          {item.isHomebrew && user && item.creatorId === user.id && item.status === 'draft' && (
            <Button variant="accent" onClick={handlePublish}>
              Publish
            </Button>
          )}
          {item.isHomebrew && user && item.creatorId === user.id && (
            <Button
              variant="secondary"
              onClick={() => navigate(`/homebrew/items/${id}/edit`)}
            >
              Edit
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <h1
            style={{
              color: 'var(--color-white)',
              fontFamily: 'var(--font-display)',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              margin: 0,
            }}
          >
            {item.name}
          </h1>
          <span
            style={{
              color: rarityColors[item.rarity],
              fontSize: '1.25rem',
              fontWeight: 'bold',
              textTransform: 'capitalize',
            }}
          >
            {item.rarity}
          </span>
          {item.isHomebrew && item.status && (
            <span
              style={{
                backgroundColor:
                  item.status === 'published' ? 'var(--color-forest)' :
                  item.status === 'draft' ? 'var(--color-cloud)' :
                  'var(--color-stormy)',
                color: 'var(--color-white)',
                padding: '0.25rem 0.625rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'capitalize',
              }}
            >
              {item.status}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span
            style={{
              color: 'var(--color-cloud)',
              fontSize: '1.125rem',
              textTransform: 'capitalize',
            }}
          >
            {item.type}
          </span>
          {item.type === 'weapon' && item.weapon_category && (
            <>
              <span style={{ color: 'var(--color-muted)' }}>•</span>
              <span style={{ color: 'var(--color-cloud)', fontSize: '1.125rem' }}>
                {item.weapon_category.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </>
          )}
          {item.type === 'consumable' && item.consumable_category && (
            <>
              <span style={{ color: 'var(--color-muted)' }}>•</span>
              <span style={{ color: 'var(--color-cloud)', fontSize: '1.125rem', textTransform: 'capitalize' }}>
                {item.consumable_category}
              </span>
            </>
          )}
          {item.type === 'shield' && item.shield_category && (
            <>
              <span style={{ color: 'var(--color-muted)' }}>•</span>
              <span style={{ color: 'var(--color-cloud)', fontSize: '1.125rem', textTransform: 'capitalize' }}>
                {item.shield_category}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2">
          <Card variant="default" style={{ marginBottom: '1.5rem' }}>
            <CardHeader>
              <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Description</h2>
            </CardHeader>
            <CardBody>
              <p style={{ color: 'var(--color-cloud)', lineHeight: '1.6', margin: 0 }}>
                {item.description}
              </p>
            </CardBody>
          </Card>

          {/* Properties */}
          {item.properties && (
            <Card variant="default" style={{ marginBottom: '1.5rem' }}>
              <CardHeader>
                <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Properties</h2>
              </CardHeader>
              <CardBody>
                <p
                  style={{
                    color: 'var(--color-sky)',
                    lineHeight: '1.6',
                    margin: 0,
                    fontSize: '1.1rem',
                  }}
                >
                  {item.properties}
                </p>
              </CardBody>
            </Card>
          )}

          {/* Combat Stats */}
          {item.type === 'weapon' && item.primary && item.primary.damage !== '0' && (
            <Card variant="default" style={{ marginBottom: '1.5rem' }}>
              <CardHeader>
                <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Combat Statistics</h2>
              </CardHeader>
              <CardBody>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                  }}
                >
                  {item.primary.damage !== '0' && (
                    <div>
                      <h3 style={{ color: 'var(--color-white)', marginBottom: '0.5rem' }}>
                        Primary Attack
                      </h3>
                      <div style={{ color: 'var(--color-cloud)' }}>
                        <div>
                          <strong>Damage:</strong> {item.primary.damage} {item.primary.damage_type}
                        </div>
                        {item.primary.damage_extra !== '0' && (
                          <div>
                            <strong>Extra Damage:</strong> +{item.primary.damage_extra} per extra
                            hit
                          </div>
                        )}
                        <div>
                          <strong>Category:</strong> {item.primary.category}
                        </div>
                        {(item.primary.min_range > 0 || item.primary.max_range > 0) && (
                          <div>
                            <strong>Range:</strong>{' '}
                            {getRangeDescription(item.primary.min_range, item.primary.max_range)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {item.secondary && item.secondary.damage !== '0' && (
                    <div>
                      <h3 style={{ color: 'var(--color-white)', marginBottom: '0.5rem' }}>
                        Secondary Attack
                      </h3>
                      <div style={{ color: 'var(--color-cloud)' }}>
                        <div>
                          <strong>Damage:</strong> {item.secondary.damage}{' '}
                          {item.secondary.damage_type}
                        </div>
                        {item.secondary.damage_extra !== '0' && (
                          <div>
                            <strong>Extra Damage:</strong> +{item.secondary.damage_extra} per extra
                            hit
                          </div>
                        )}
                        <div>
                          <strong>Category:</strong> {item.secondary.category}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Bonuses and Effects */}
          {(item.health?.max !== 0 ||
            item.health?.recovery !== 0 ||
            item.energy?.max !== 0 ||
            item.energy?.recovery !== 0 ||
            item.resolve?.max !== 0 ||
            item.resolve?.recovery !== 0 ||
            (item.movement && Object.values(item.movement).some((v: any) => v?.bonus || v?.set)) ||
            (item.mitigation && Object.values(item.mitigation).some((v: number) => v !== 0))) && (
            <Card variant="default" style={{ marginBottom: '1.5rem' }}>
              <CardHeader>
                <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Bonuses & Effects</h2>
              </CardHeader>
              <CardBody>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                  }}
                >
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
                  {item.movement && Object.entries(item.movement).some(([, v]: [string, any]) => v?.bonus || v?.set) && (
                    <div style={{ color: 'var(--color-cloud)' }}>
                      <strong>Movement:</strong>{' '}
                      {Object.entries(item.movement)
                        .filter(([, v]: [string, any]) => v?.bonus || v?.set)
                        .map(([k, v]: [string, any]) => {
                          const parts: string[] = [];
                          if (v.bonus) parts.push(`${v.bonus > 0 ? '+' : ''}${v.bonus}`);
                          if (v.set) parts.push(`set ${v.set}`);
                          return `${k}: ${parts.join(', ')}`;
                        })
                        .join(' | ')}
                    </div>
                  )}
                  {item.mitigation && Object.entries(item.mitigation).some(([, v]) => v !== 0) && (
                    <div style={{ color: 'var(--color-cloud)' }}>
                      <strong>Mitigation:</strong>{' '}
                      {Object.entries(item.mitigation)
                        .filter(([, v]) => v !== 0)
                        .map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${k}`)
                        .join(', ')}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Abilities (Actions & Reactions) */}
          {((item as any).actions?.length > 0 || (item as any).reactions?.length > 0) && (
            <Card variant="default" style={{ marginBottom: '1.5rem' }}>
              <CardHeader>
                <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Abilities</h2>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(item as any).actions?.map((action: CreatureAction, idx: number) => (
                    <CreatureActionCard
                      key={`action-${idx}`}
                      action={action}
                      creatureTier="standard"
                    />
                  ))}
                  {(item as any).reactions?.map((reaction: CreatureReaction, idx: number) => (
                    <CreatureReactionCard
                      key={`reaction-${idx}`}
                      reaction={reaction}
                      creatureTier="standard"
                    />
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Recipe Information */}
          {item.recipe && item.recipe.type && (
            <Card variant="default">
              <CardHeader>
                <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Crafting Recipe</h2>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ color: 'var(--color-cloud)' }}>
                      <strong>Crafting Skill:</strong>{' '}
                      {item.recipe.type.charAt(0).toUpperCase() + item.recipe.type.slice(1)}
                    </div>
                    <div style={{ color: 'var(--color-cloud)' }}>
                      <strong>Difficulty:</strong> {item.recipe.difficulty}
                    </div>
                  </div>

                  {item.recipe.ingredients && item.recipe.ingredients.length > 0 && (
                    <div>
                      <h3
                        style={{
                          color: 'var(--color-white)',
                          marginBottom: '0.5rem',
                          fontSize: '1rem',
                        }}
                      >
                        Required Ingredients
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {item.recipe.ingredients.map((ingredient, index) => (
                          <span
                            key={index}
                            style={{
                              color: 'var(--color-cloud)',
                              backgroundColor: 'var(--color-dark-border)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.875rem',
                              textTransform: 'capitalize',
                            }}
                          >
                            {ingredient.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Column - Quick Stats */}
        <div className="lg:col-span-1">
          <Card variant="default" style={{ position: 'sticky', top: '1rem' }}>
            <CardHeader>
              <h2 style={{ color: 'var(--color-metal-gold)', margin: 0 }}>Quick Stats</h2>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Weight</div>
                  <div
                    style={{
                      color: 'var(--color-white)',
                      fontWeight: 'bold',
                      fontSize: '1.125rem',
                    }}
                  >
                    {item.weight} bu
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Value</div>
                  <div
                    style={{
                      color: 'var(--color-white)',
                      fontWeight: 'bold',
                      fontSize: '1.125rem',
                    }}
                  >
                    {formatGoldDisplay(item.value)}
                  </div>
                </div>

                {item.primary?.damage && item.primary.damage !== '0' && (
                  <div>
                    <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Damage</div>
                    <div
                      style={{
                        color: 'var(--color-white)',
                        fontWeight: 'bold',
                        fontSize: '1.125rem',
                      }}
                    >
                      {item.primary.damage}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--color-dark-border)',
                  }}
                >
                  <div
                    style={{
                      color: 'var(--color-muted)',
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Share this item
                  </div>
                  <Button variant="outline" onClick={copyItemLink} style={{ width: '100%' }}>
                    📋 Copy Link
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
