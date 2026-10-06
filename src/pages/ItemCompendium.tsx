import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Item, Damage, ArmorData } from '../types/character';
import Card, { CardBody } from '../components/ui/Card';
import { formatGoldDisplay } from '../utils/valueUtils';
import { getDamageChart } from '../utils/combatUtils';

interface APIItem extends Omit<Item, 'consumable_category'> {
  slot?: string;
  weapon_data?: {
    category: string;
    primary: Damage;
    secondary: Damage;
  };
  armor_data?: ArmorData;
  consumable_category?: string;
  recipe?: {
    type: string;
    difficulty: number;
    ingredients: string[];
  };
}

const ITEMS_PER_PAGE = 50;

const ItemCompendium: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<APIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filters from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [rarityFilter, setRarityFilter] = useState(searchParams.get('rarity') || 'all');
  const [weaponCategoryFilter, setWeaponCategoryFilter] = useState(searchParams.get('weaponCat') || 'all');
  const [consumableCategoryFilter, setConsumableCategoryFilter] = useState(searchParams.get('consumableCat') || 'all');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));

  // Sync filters to URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (typeFilter !== 'all') params.type = typeFilter;
    if (rarityFilter !== 'all') params.rarity = rarityFilter;
    if (weaponCategoryFilter !== 'all' && typeFilter === 'weapon') params.weaponCat = weaponCategoryFilter;
    if (consumableCategoryFilter !== 'all' && typeFilter === 'consumable') params.consumableCat = consumableCategoryFilter;
    if (currentPage > 1) params.page = String(currentPage);
    setSearchParams(params, { replace: true });
  }, [searchTerm, typeFilter, rarityFilter, weaponCategoryFilter, consumableCategoryFilter, currentPage, setSearchParams]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, rarityFilter, weaponCategoryFilter, consumableCategoryFilter]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/items?summary=true');
        if (!response.ok) throw new Error('Failed to fetch items');
        setItems(await response.json());
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const getFilteredItems = () => {
    let filtered = [...items];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term) ||
          item.type.toLowerCase().includes(term)
      );
    }
    if (typeFilter !== 'all') filtered = filtered.filter((item) => item.type === typeFilter);
    if (rarityFilter !== 'all') filtered = filtered.filter((item) => item.rarity === rarityFilter);
    if (weaponCategoryFilter !== 'all' && typeFilter === 'weapon')
      filtered = filtered.filter((item) => item.weapon_category === weaponCategoryFilter);
    if (consumableCategoryFilter !== 'all' && typeFilter === 'consumable')
      filtered = filtered.filter((item) => item.consumable_category === consumableCategoryFilter);

    const rarityOrder: Record<string, number> = {
      artifact: 6, legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1,
    };
    return filtered.sort((a, b) => {
      const diff = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });
  };

  const allFiltered = getFilteredItems();
  const totalPages = Math.ceil(allFiltered.length / ITEMS_PER_PAGE);
  const paginatedItems = allFiltered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const rarityColors: Record<string, string> = {
    common: '#9CA3AF',
    uncommon: '#10B981',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
    artifact: '#EF4444',
  };

  const itemTypes = [
    'all', 'weapon', 'body', 'headwear', 'boots', 'gloves', 'cloak', 'accessory',
    'shield', 'consumable', 'goods', 'adventure', 'tool', 'instrument',
    'ammunition', 'runes', 'implant', 'body_parts',
  ];
  const itemTypeLabels: Record<string, string> = {
    all: 'All Types', weapon: 'Weapons', body: 'Body Armor', headwear: 'Headwear',
    boots: 'Boots', gloves: 'Gloves', cloak: 'Cloaks', accessory: 'Accessories',
    shield: 'Shields', consumable: 'Consumables', goods: 'Goods & Materials',
    adventure: 'Adventure Gear', tool: 'Tools', instrument: 'Instruments',
    ammunition: 'Ammunition', runes: 'Runes & Glyphs', implant: 'Implants',
    body_parts: 'Body Parts',
  };
  const rarityTypes = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'artifact'];
  const weaponCategories = ['all', 'simpleMelee', 'simpleRanged', 'complexMelee', 'complexRanged', 'brawling', 'throwing'];
  const weaponCatLabels: Record<string, string> = {
    all: 'All Weapons', simpleMelee: 'Simple Melee', simpleRanged: 'Simple Ranged',
    complexMelee: 'Complex Melee', complexRanged: 'Complex Ranged',
    brawling: 'Brawling', throwing: 'Throwing',
  };
  const consumableCategories = ['all', 'poisons', 'elixirs', 'potions', 'explosives'];

  const typeCounts: Record<string, number> = {};
  items.forEach((item) => { typeCounts[item.type] = (typeCounts[item.type] || 0) + 1; });

  // Stat helpers
  const isMagicCategory = (cat?: string) => cat?.endsWith('_magic') || false;

  const getWeaponAttacks = (item: APIItem) => {
    if (item.type !== 'weapon') return null;
    const attacks: { label: string; chart: string; dmgType: string; isMagic: boolean }[] = [];

    if (item.primary) {
      const base = parseInt(item.primary.damage as string) || 0;
      const growth = parseInt(item.primary.damage_extra as string) || 0;
      if (base > 0 || growth > 0) {
        const magic = isMagicCategory(item.primary.category);
        attacks.push({
          label: magic ? 'Magic' : 'Melee',
          chart: getDamageChart(base, growth, !!(item.primary as any).aimed, item.hands || 1),
          dmgType: item.primary.damage_type || '',
          isMagic: magic,
        });
      }
    }

    if ((item as any).secondary) {
      const sec = (item as any).secondary;
      const base = parseInt(sec.damage as string) || 0;
      const growth = parseInt(sec.damage_extra as string) || 0;
      if (base > 0 || growth > 0) {
        const magic = isMagicCategory(sec.category);
        attacks.push({
          label: magic ? 'Magic' : 'Melee',
          chart: getDamageChart(base, growth, !!sec.aimed, item.hands || 1),
          dmgType: sec.damage_type || '',
          isMagic: magic,
        });
      }
    }

    return attacks.length > 0 ? attacks : null;
  };

  const getArmorEntries = (item: APIItem) => {
    if (!item.mitigation) return null;
    const entries = Object.entries(item.mitigation).filter(
      ([, v]) => (typeof v === 'object' && (v.min !== 0 || v.max !== 0))
    );
    if (entries.length === 0) return null;
    return entries as [string, { min: number; max: number }][];
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
      <div className="container mx-auto px-4 py-8">
        <Card variant="default"><CardBody><p style={{ color: 'var(--color-sunset)' }}>Error: {error}</p></CardBody></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-white)', fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Item Compendium
        </h1>
        <p style={{ color: 'var(--color-cloud)', fontSize: '1.125rem' }}>
          {items.length} items across weapons, armor, consumables, and equipment
        </p>
      </div>

      {/* Filters */}
      <Card variant="default" style={{ marginBottom: '1.5rem' }}>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search items by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', backgroundColor: 'var(--color-dark-elevated)', color: 'var(--color-white)',
                  border: '1px solid var(--color-dark-border)', borderRadius: '0.375rem',
                  padding: '0.75rem 1rem', paddingLeft: '2.5rem',
                }}
              />
              <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-cloud)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-cloud)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>
                  &times;
                </button>
              )}
            </div>

            {/* Filter row */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setWeaponCategoryFilter('all'); setConsumableCategoryFilter('all'); }}
                style={{ flex: '1 1 150px', backgroundColor: 'var(--color-dark-elevated)', color: 'var(--color-white)', border: '1px solid var(--color-dark-border)', borderRadius: '0.375rem', padding: '0.5rem' }}>
                {itemTypes.map((type) => (
                  <option key={type} value={type}>
                    {itemTypeLabels[type] || type}{type !== 'all' && typeCounts[type] ? ` (${typeCounts[type]})` : ''}
                  </option>
                ))}
              </select>

              <select value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value)}
                style={{ flex: '1 1 150px', backgroundColor: 'var(--color-dark-elevated)', color: 'var(--color-white)', border: '1px solid var(--color-dark-border)', borderRadius: '0.375rem', padding: '0.5rem', textTransform: 'capitalize' }}>
                {rarityTypes.map((r) => <option key={r} value={r}>{r === 'all' ? 'All Rarities' : r}</option>)}
              </select>

              {typeFilter === 'weapon' && (
                <select value={weaponCategoryFilter} onChange={(e) => setWeaponCategoryFilter(e.target.value)}
                  style={{ flex: '1 1 150px', backgroundColor: 'var(--color-dark-elevated)', color: 'var(--color-white)', border: '1px solid var(--color-dark-border)', borderRadius: '0.375rem', padding: '0.5rem' }}>
                  {weaponCategories.map((c) => <option key={c} value={c}>{weaponCatLabels[c]}</option>)}
                </select>
              )}

              {typeFilter === 'consumable' && (
                <select value={consumableCategoryFilter} onChange={(e) => setConsumableCategoryFilter(e.target.value)}
                  style={{ flex: '1 1 150px', backgroundColor: 'var(--color-dark-elevated)', color: 'var(--color-white)', border: '1px solid var(--color-dark-border)', borderRadius: '0.375rem', padding: '0.5rem', textTransform: 'capitalize' }}>
                  {consumableCategories.map((c) => <option key={c} value={c}>{c === 'all' ? 'All Consumables' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              )}

              {(searchTerm || typeFilter !== 'all' || rarityFilter !== 'all') && (
                <button onClick={() => { setSearchTerm(''); setTypeFilter('all'); setRarityFilter('all'); setWeaponCategoryFilter('all'); setConsumableCategoryFilter('all'); }}
                  style={{ backgroundColor: 'transparent', color: 'var(--color-cloud)', border: '1px solid var(--color-dark-border)', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', cursor: 'pointer', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  Clear All
                </button>
              )}
            </div>

            <div style={{ color: 'var(--color-cloud)', fontSize: '0.8rem' }}>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, allFiltered.length)} of {allFiltered.length} items
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Items List */}
      {paginatedItems.length === 0 ? (
        <Card variant="default">
          <CardBody>
            <div style={{ textAlign: 'center', color: 'var(--color-cloud)', padding: '2rem 0' }}>No items match your filters.</div>
          </CardBody>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {paginatedItems.map((item) => {
            const weaponAttacks = getWeaponAttacks(item);
            const armorEntries = getArmorEntries(item);
            const color = rarityColors[item.rarity] || '#9CA3AF';

            return (
              <div
                key={item._id}
                onClick={() => navigate(`/items/${item._id}`)}
                style={{
                  position: 'relative',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-dark-elevated)',
                  borderRadius: '0.375rem',
                  overflow: 'hidden',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-dark-surface)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-dark-elevated)'; }}
              >
                {/* Rarity gradient overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '15%',
                    background: `linear-gradient(to right, ${color}40, transparent)`,
                    pointerEvents: 'none',
                  }}
                />

                <div style={{ position: 'relative' }}>
                  {/* Top row: Name + tags + price/rarity */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--color-white)', fontWeight: 'bold', fontSize: '1rem' }}>
                          {item.name}
                        </span>
                        <span style={{
                          fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '0.2rem',
                          backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--color-cloud)',
                          textTransform: 'capitalize', whiteSpace: 'nowrap',
                        }}>
                          {item.type.replace('_', ' ')}
                        </span>
                        {item.weapon_category && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-cloud)', whiteSpace: 'nowrap' }}>
                            {weaponCatLabels[item.weapon_category] || item.weapon_category}
                          </span>
                        )}
                        {Number(item.encumbrance_penalty) > 0 && (
                          <span style={{
                            fontSize: '0.6rem', padding: '0.1rem 0.35rem', borderRadius: '0.2rem',
                            backgroundColor: 'rgba(255, 150, 50, 0.15)', color: 'var(--color-sunset)',
                            whiteSpace: 'nowrap',
                          }}>
                            Enc {item.encumbrance_penalty}
                          </span>
                        )}
                      </div>
                      {/* Description - hidden on mobile */}
                      <div className="hidden md:block" style={{ color: 'var(--color-white)', fontSize: '0.75rem', marginTop: '0.25rem', lineHeight: '1.4' }}>
                        {item.description}
                      </div>
                    </div>

                    {/* Right: Price + Rarity */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      {item.value > 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-metal-gold)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                          {formatGoldDisplay(item.value)}
                        </span>
                      )}
                      <span style={{ fontSize: '0.7rem', color, fontWeight: 'bold', textTransform: 'capitalize', whiteSpace: 'nowrap', minWidth: '4rem', textAlign: 'right' }}>
                        {item.rarity}
                      </span>
                    </div>
                  </div>

                  {/* Stats bar - only shown for items with weapon or armor stats */}
                  {(weaponAttacks || armorEntries) && (
                    <div style={{
                      marginTop: '0.5rem',
                      marginLeft: '-1rem',
                      marginRight: '-1rem',
                      marginBottom: '-0.75rem',
                      padding: '0.4rem 1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      flexWrap: 'wrap',
                    }}>
                      {/* Weapon damage brackets */}
                      {weaponAttacks && weaponAttacks.map((atk, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                          {weaponAttacks.length > 1 && (
                            <span style={{
                              color: atk.isMagic ? 'var(--color-sat-purple)' : 'var(--color-cloud)',
                              fontSize: '0.65rem',
                              fontWeight: 'bold',
                            }}>
                              {atk.label}:
                            </span>
                          )}
                          <span style={{ color: 'var(--color-sunset)' }}>
                            [{atk.chart}]
                          </span>
                          <span style={{ color: 'var(--color-cloud)', opacity: 0.7 }}>
                            {atk.dmgType}
                          </span>
                        </div>
                      ))}

                      {/* Armor mitigation entries */}
                      {armorEntries && armorEntries.map(([type, val]) => (
                        <span key={type} style={{ color: 'var(--color-metal-gold)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {type} [{val.min > 0 ? '+' : ''}{val.min}/{val.max > 0 ? '+' : ''}{val.max}]
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button
            onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
            disabled={currentPage <= 1}
            style={{
              backgroundColor: 'var(--color-dark-elevated)', color: currentPage <= 1 ? 'var(--color-dark-border)' : 'var(--color-white)',
              border: '1px solid var(--color-dark-border)', borderRadius: '0.375rem', padding: '0.5rem 1rem',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
            .reduce<(number | string)[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              typeof p === 'string' ? (
                <span key={`ellipsis-${i}`} style={{ color: 'var(--color-cloud)', padding: '0 0.25rem' }}>...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => { setCurrentPage(p); window.scrollTo(0, 0); }}
                  style={{
                    backgroundColor: p === currentPage ? 'var(--color-sat-purple)' : 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)', borderRadius: '0.375rem',
                    padding: '0.5rem 0.75rem', cursor: 'pointer', fontWeight: p === currentPage ? 'bold' : 'normal',
                  }}
                >
                  {p}
                </button>
              )
            )}

          <button
            onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
            disabled={currentPage >= totalPages}
            style={{
              backgroundColor: 'var(--color-dark-elevated)', color: currentPage >= totalPages ? 'var(--color-dark-border)' : 'var(--color-white)',
              border: '1px solid var(--color-dark-border)', borderRadius: '0.375rem', padding: '0.5rem 1rem',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemCompendium;
