import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Item } from '../types/character';
import ItemHeaderFields from '../components/item/ItemHeaderFields';
import ItemBasicFields from '../components/item/ItemBasicFields';
import ItemWeaponFields from '../components/item/ItemWeaponFields';
import ItemResourceFields from '../components/item/ItemResourceFields';
import ItemMitigationFields from '../components/item/ItemMitigationFields';
import ItemBonusFields from '../components/item/ItemBonusFields';
import ItemDetectionFields from '../components/item/ItemDetectionFields';
import ItemRecipeFields from '../components/item/ItemRecipeFields';
import ItemImplantFields from '../components/item/ItemImplantFields';
import { fieldInputStyle, fieldLabelStyle } from '../components/item/itemFormConstants';
import AbilityEditor, { AbilityEntry } from '../components/shared/AbilityEditor';
import { CreatureAction, CreatureReaction } from '../types/creature';

const HomebrewItemCreator: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id || !!templateId);

  // Single unified item state
  const [item, setItem] = useState<Partial<Item>>({
    name: '',
    description: '',
    type: 'weapon',
    weapon_category: 'simpleMelee',
    rarity: 'common',
    weight: 1,
    value: 0,
    bonus_attack: 0,
    primary: {
      damage: '0',
      damage_extra: '0',
      damage_type: 'physical',
      category: 'slash',
      bonus_attack: 0,
      energy: 0,
      secondary_damage: 0,
      secondary_damage_extra: 0,
      secondary_damage_type: 'none',
      min_range: 1,
      max_range: 1,
    },
    secondary: {
      damage: '0',
      damage_extra: '0',
      damage_type: 'physical',
      category: 'slash',
      bonus_attack: 0,
      energy: 0,
      secondary_damage: 0,
      secondary_damage_extra: 0,
      secondary_damage_type: 'none',
      min_range: 1,
      max_range: 1,
    },
    health: { max: 0, recovery: 0 },
    energy: { max: 0, recovery: 0 },
    resolve: { max: 0, recovery: 0 },
    movement: {
      walk: { bonus: 0, set: 0 },
      swim: { bonus: 0, set: 0 },
      climb: { bonus: 0, set: 0 },
      fly: { bonus: 0, set: 0 },
    },
    encumbrance_penalty: 0,
    mitigation: {
      physical: 0,
      cold: 0,
      heat: 0,
      electric: 0,
      psychic: 0,
      dark: 0,
      divine: 0,
      aetheric: 0,
      toxic: 0,
    },
    detections: {
      normal: 0,
      darksight: 0,
      infravision: 0,
      deadsight: 0,
      echolocation: 0,
      tremorsense: 0,
      truesight: 0,
      aethersight: 0,
    },
    immunities: {
      afraid: false,
      bleeding: false,
      blinded: false,
      charmed: false,
      confused: false,
      dazed: false,
      diseased: false,
      exhausted: false,
      frightened: false,
      grappled: false,
      incapacitated: false,
      invisible: false,
      paralyzed: false,
      petrified: false,
      poisoned: false,
      prone: false,
      restrained: false,
      stunned: false,
      unconscious: false,
    },
  });

  // Homebrew-specific fields
  const [tags, setTags] = useState<string[]>([]);
  const [source, setSource] = useState('');
  const [balanceNotes, setBalanceNotes] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Collapsible section state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    resources: false,
    weapon: false,
    recipe: false,
    bonuses: false,
    mitigation: false,
    detectionsImmunities: false,
    abilities: false,
    implant: false,
    homebrew: true,
  });

  useEffect(() => {
    if (id) {
      fetchItem(`/api/homebrew/items/${id}`);
    } else if (templateId) {
      fetchItem(`/api/items/${templateId}`, true);
    } else {
      setLoading(false);
    }
  }, [id, templateId]);

  const fetchItem = async (url: string, isTemplate = false) => {
    try {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch item');
      const data = await response.json();

      setItem({
        ...data,
        // Clear ID fields when using as template
        ...(isTemplate && { _id: undefined }),
        // Ensure name indicates template
        name: isTemplate ? `${data.name} (Custom)` : data.name,
        // Ensure weapon attack objects exist
        primary: data.primary || {
          damage: '0',
          damage_extra: '0',
          damage_type: 'physical',
          category: 'slash',
          bonus_attack: 0,
          energy: 0,
          secondary_damage: 0,
          secondary_damage_extra: 0,
          secondary_damage_type: 'none',
          min_range: 1,
          max_range: 1,
        },
        secondary: data.secondary || {
          damage: '0',
          damage_extra: '0',
          damage_type: 'physical',
          category: 'slash',
          bonus_attack: 0,
          energy: 0,
          secondary_damage: 0,
          secondary_damage_extra: 0,
          secondary_damage_type: 'none',
          min_range: 1,
          max_range: 1,
        },
        // Ensure mitigation exists
        mitigation: data.mitigation || {
          physical: 0, cold: 0, heat: 0, electric: 0,
          psychic: 0, dark: 0, divine: 0, aetheric: 0, toxic: 0,
        },
        // Ensure detections exists
        detections: data.detections || {
          normal: 0, darksight: 0, infravision: 0, deadsight: 0,
          echolocation: 0, tremorsense: 0, truesight: 0, aethersight: 0,
        },
        // Ensure immunities exists
        immunities: data.immunities || {
          afraid: false, alert: false, broken: false, charmed: false,
          confused: false, dazed: false, maddened: false, numbed: false, stunned: false,
          bleeding: false, blinded: false, deafened: false, ignited: false,
          impaired: false, incapacitated: false, muted: false, obscured: false,
          poisoned: false, prone: false, stasis: false, unconscious: false, winded: false,
        },
        health: data.health || { max: 0 },
        energy: data.energy || { max: 0 },
        resolve: data.resolve || { max: 0 },
        movement: data.movement || {
          walk: { bonus: 0, set: 0 },
          swim: { bonus: 0, set: 0 },
          climb: { bonus: 0, set: 0 },
          fly: { bonus: 0, set: 0 },
        },
        encumbrance_penalty: data.encumbrance_penalty || 0,
      });

      if (!isTemplate) {
        setTags(data.tags || []);
        setSource(data.source || '');
        setBalanceNotes(data.balanceNotes || '');
      }

      // Auto-expand relevant sections
      setExpandedSections({
        basic: true,
        resources: true,
        weapon: data.type === 'weapon',
        bonuses: !!data.basic || !!data.weapon || !!data.magic || !!data.craft || !!data.attributes,
        mitigation: !!data.mitigation && Object.values(data.mitigation).some((v: any) => v > 0),
        detectionsImmunities:
          (!!data.detections && Object.values(data.detections).some((v: any) => v > 0)) ||
          (!!data.immunities && Object.values(data.immunities).some((v: any) => v === true)),
        abilities: !!(data.actions?.length || data.reactions?.length),
        implant: data.type === 'implant',
        homebrew: true,
      });
    } catch (err) {
      showError(isTemplate ? 'Failed to load template item' : 'Failed to load item for editing');
      navigate('/homebrew');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to create homebrew items');
      return;
    }

    if (!item.name || !item.description) {
      setError('Name and description are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const completeItem = {
        ...item,
        tags,
        source,
        balanceNotes,
      };

      const url = id ? `/api/homebrew/items/${id}` : '/api/homebrew/items';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
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

  const SectionHeader: React.FC<{ title: string; section: string }> = ({ title, section }) => (
    <div
      onClick={() => toggleSection(section)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        backgroundColor: 'var(--color-dark-elevated)',
        marginBottom: expandedSections[section] ? '1rem' : '0.5rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        border: '1px solid var(--color-dark-border)',
        userSelect: 'none',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
        e.currentTarget.style.borderColor = 'var(--color-metal-gold)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-dark-elevated)';
        e.currentTarget.style.borderColor = 'var(--color-dark-border)';
      }}
    >
      <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-white)', fontWeight: '600' }}>
        {title}
      </h3>
      {expandedSections[section] ? (
        <ChevronDown size={18} style={{ color: 'var(--color-metal-gold)' }} />
      ) : (
        <ChevronRight size={18} style={{ color: 'var(--color-metal-gold)' }} />
      )}
    </div>
  );

  const sectionContentStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-dark-elevated)',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--color-dark-border)',
  };

  return (
    <div className="container mx-auto px-4 py-8" style={{ maxWidth: '900px' }}>
      <h1
        style={{
          color: 'var(--color-white)',
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
        }}
      >
        {id ? 'Edit' : templateId ? 'Create from Template' : 'Create'} Homebrew Item
      </h1>
      <p style={{ color: 'var(--color-cloud)', marginBottom: '2rem', fontSize: '0.95rem' }}>
        {templateId
          ? 'Customize your item based on the template below.'
          : 'Fill in the sections below to create your homebrew item. Expand sections as needed.'}
      </p>

      {error && (
        <div
          style={{
            backgroundColor: 'rgba(220, 53, 69, 0.15)',
            color: '#ff6b6b',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            border: '1px solid rgba(220, 53, 69, 0.3)',
          }}
        >
          {error}
        </div>
      )}

      {/* Always-visible header: Name, Type, Category */}
      <div style={{ ...sectionContentStyle, marginBottom: '1rem' }}>
        <ItemHeaderFields item={item} onChange={handleFieldChange} />
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {/* Basic Information */}
        <div>
          <SectionHeader title="Basic Information" section="basic" />
          {expandedSections.basic && (
            <div style={sectionContentStyle}>
              <ItemBasicFields item={item} onChange={handleFieldChange} />
            </div>
          )}
        </div>

        {/* Resource Bonuses */}
        <div>
          <SectionHeader title="Resource Bonuses" section="resources" />
          {expandedSections.resources && (
            <div style={sectionContentStyle}>
              <ItemResourceFields item={item} onChange={handleFieldChange} />
            </div>
          )}
        </div>

        {/* Weapon Properties */}
        {item.type === 'weapon' && (
          <div>
            <SectionHeader title="Weapon Properties" section="weapon" />
            {expandedSections.weapon && (
              <div style={sectionContentStyle}>
                <ItemWeaponFields item={item} onChange={handleFieldChange} />
              </div>
            )}
          </div>
        )}

        {/* Recipe */}
        <div>
          <SectionHeader title="Recipe" section="recipe" />
          {expandedSections.recipe && (
            <div style={sectionContentStyle}>
              <ItemRecipeFields item={item} onChange={handleFieldChange} />
            </div>
          )}
        </div>

        {/* Bonuses & Modifiers */}
        <div>
          <SectionHeader title="Bonuses & Modifiers" section="bonuses" />
          {expandedSections.bonuses && (
            <div style={sectionContentStyle}>
              <ItemBonusFields item={item} onChange={handleFieldChange} />
            </div>
          )}
        </div>

        {/* Damage Mitigation */}
        <div>
          <SectionHeader title="Damage Mitigation" section="mitigation" />
          {expandedSections.mitigation && (
            <div style={sectionContentStyle}>
              <ItemMitigationFields item={item} onChange={handleFieldChange} />
            </div>
          )}
        </div>

        {/* Detections & Immunities */}
        <div>
          <SectionHeader title="Detections & Immunities" section="detectionsImmunities" />
          {expandedSections.detectionsImmunities && (
            <div style={sectionContentStyle}>
              <ItemDetectionFields item={item} onChange={handleFieldChange} />
            </div>
          )}
        </div>

        {/* Abilities (Actions & Reactions) */}
        <div>
          <SectionHeader title="Abilities (Actions & Reactions)" section="abilities" />
          {expandedSections.abilities && (
            <div style={sectionContentStyle}>
              <AbilityEditor
                showCharges={true}
                abilities={(() => {
                  const list: AbilityEntry[] = [];
                  (item.actions || []).forEach((a: any) => list.push({ ...a, reaction: false }));
                  (item.reactions || []).forEach((r: any) => list.push({ ...r, reaction: true }));
                  return list;
                })()}
                onAbilitiesChange={(updated) => {
                  const actions: CreatureAction[] = [];
                  const reactions: CreatureReaction[] = [];
                  updated.forEach((ab) => {
                    const { reaction: isReaction, trigger, ...rest } = ab;
                    if (isReaction) {
                      reactions.push({ ...rest, trigger } as unknown as CreatureReaction);
                    } else {
                      actions.push(rest as unknown as CreatureAction);
                    }
                  });
                  setItem((prev) => ({ ...prev, actions, reactions }));
                }}
              />
            </div>
          )}
        </div>

        {/* Implant Data */}
        {item.type === 'implant' && (
          <div>
            <SectionHeader title="Implant Data" section="implant" />
            {expandedSections.implant && (
              <div style={sectionContentStyle}>
                <ItemImplantFields item={item} onChange={handleFieldChange} />
              </div>
            )}
          </div>
        )}

        {/* Homebrew Details */}
        <div>
          <SectionHeader title="Homebrew Details" section="homebrew" />
          {expandedSections.homebrew && (
            <div style={sectionContentStyle}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {/* Tags */}
                <div>
                  <label style={fieldLabelStyle}>Tags</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Add a tag..."
                      style={{ ...fieldInputStyle, flex: 1 }}
                    />
                    <button
                      onClick={addTag}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--color-sat-purple)',
                        border: 'none',
                        borderRadius: '0.25rem',
                        color: 'var(--color-white)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      Add
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            backgroundColor: 'rgba(138, 116, 192, 0.15)',
                            color: 'var(--color-sat-purple)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.8rem',
                            border: '1px solid rgba(138, 116, 192, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-cloud)',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: '1rem',
                              lineHeight: 1,
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Source */}
                <div>
                  <label style={fieldLabelStyle}>Source / Campaign</label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g., My Campaign Setting"
                    style={fieldInputStyle}
                  />
                </div>

                {/* Balance Notes */}
                <div>
                  <label style={fieldLabelStyle}>Balance Notes</label>
                  <textarea
                    value={balanceNotes}
                    onChange={(e) => setBalanceNotes(e.target.value)}
                    placeholder="Explain your design choices and balance considerations..."
                    rows={3}
                    style={{ ...fieldInputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '2px solid var(--color-dark-border)',
        }}
      >
        <Button
          variant="secondary"
          onClick={() => navigate('/homebrew')}
          disabled={saving}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={saving || !item.name || !item.description}
        >
          {saving
            ? `${id ? 'Updating' : 'Creating'}...`
            : `${id ? 'Update' : 'Create'} Item`}
        </Button>
      </div>
    </div>
  );
};

export default HomebrewItemCreator;
