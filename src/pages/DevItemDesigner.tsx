import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Item } from '../types/character';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
import Button from '../components/ui/Button';

interface FileEntry {
  filename: string;
  name: string;
  type: string;
  rarity: string;
}

const defaultItem: Partial<Item> = {
  name: '',
  description: '',
  type: 'weapon',
  rarity: 'common',
  weight: 0,
  value: 0,
  encumbrance_penalty: 0,
  health: { max: 0, recovery: 0 },
  energy: { max: 0, recovery: 0 },
  resolve: { max: 0, recovery: 0 },
  movement: {
    walk: { bonus: 0, set: 0 },
    swim: { bonus: 0, set: 0 },
    climb: { bonus: 0, set: 0 },
    fly: { bonus: 0, set: 0 },
  },
  mitigation: {},
  pain: 0,
  stress: 0,
};

const rarityColors: Record<string, string> = {
  common: '#a0aec0',
  uncommon: '#68d391',
  rare: '#63b3ed',
  epic: '#b794f6',
  legendary: '#ff8c42',
  artifact: '#ff6b6b',
};

const DevItemDesigner: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (!isDev) {
      navigate('/');
    }
  }, [isDev, navigate]);

  // Item state
  const [item, setItem] = useState<Partial<Item>>({ ...defaultItem });

  // File browser state
  const [itemFiles, setItemFiles] = useState<Record<string, FileEntry[]>>({});
  const [showBrowser, setShowBrowser] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [editingFile, setEditingFile] = useState<{ path: string } | null>(null);

  // Save-as modal state
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [saveAsCategory, setSaveAsCategory] = useState('');
  const [saveAsFilename, setSaveAsFilename] = useState('');

  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    header: true,
    basic: true,
    resources: false,
    weapon: false,
    implant: false,
    recipe: false,
    bonuses: false,
    mitigation: false,
    detectionsImmunities: false,
    abilities: false,
    extras: false,
  });

  const handleFieldChange = (field: string, value: any) => {
    setItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // ---- File operations ----

  const fetchItemFiles = async () => {
    try {
      const response = await fetch('/api/items/files');
      if (response.ok) {
        const data = await response.json();
        setItemFiles(data);
      }
    } catch (err) {
      console.error('Failed to fetch item files:', err);
    }
  };

  const loadItemFile = async (filePath: string) => {
    try {
      const response = await fetch(`/api/items/files/${filePath}`);
      if (!response.ok) throw new Error('Failed to load');
      const jsonData = await response.json();

      // Initialize weapon attack objects if needed
      if (jsonData.type === 'weapon') {
        if (!jsonData.primary) {
          jsonData.primary = {
            damage: '0', damage_extra: '0', damage_type: 'physical',
            category: 'slash', bonus_attack: 0, energy: 0,
            secondary_damage: 0, secondary_damage_extra: 0, secondary_damage_type: 'none',
            min_range: 1, max_range: 1,
          };
        }
        if (!jsonData.secondary) {
          jsonData.secondary = {
            damage: '0', damage_extra: '0', damage_type: 'physical',
            category: 'slash', bonus_attack: 0, energy: 0,
            secondary_damage: 0, secondary_damage_extra: 0, secondary_damage_type: 'none',
            min_range: 1, max_range: 1,
          };
        }
      }

      setItem(jsonData);
      setEditingFile({ path: filePath });
      setShowBrowser(false);
      setSearchFilter('');
      setCategoryFilter('all');

      // Auto-expand relevant sections
      setExpandedSections({
        header: true,
        basic: true,
        resources: true,
        weapon: jsonData.type === 'weapon',
        implant: jsonData.type === 'implant',
        recipe: !!jsonData.recipe?.type,
        bonuses: !!(jsonData.basic || jsonData.weapon || jsonData.magic || jsonData.craft || jsonData.attributes),
        mitigation: !!(jsonData.mitigation && Object.keys(jsonData.mitigation).length > 0),
        detectionsImmunities:
          !!(jsonData.detections && Object.keys(jsonData.detections).length > 0) ||
          !!(jsonData.immunities && Object.keys(jsonData.immunities).length > 0),
        abilities: !!(jsonData.actions?.length || jsonData.reactions?.length),
        extras: !!(jsonData.properties || jsonData.substance || jsonData.holdable || jsonData.foundry_icon),
      });

      showSuccess(`Loaded ${jsonData.name || filePath} for editing`);
    } catch (err) {
      showError('Failed to load item file');
    }
  };

  const saveItemFile = async () => {
    if (!editingFile) return;
    try {
      const response = await fetch(`/api/items/files/${editingFile.path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error('Failed to save');
      showSuccess(`Saved to ${editingFile.path}`);
    } catch (err) {
      showError('Failed to save item file');
    }
  };

  const saveItemFileAs = async () => {
    if (!saveAsCategory || !saveAsFilename) {
      showError('Category and filename are required');
      return;
    }
    const filename = saveAsFilename.endsWith('.json') ? saveAsFilename : `${saveAsFilename}.json`;
    const filePath = `${saveAsCategory}/${filename}`;
    try {
      const response = await fetch(`/api/items/files/${filePath}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error('Failed to save');
      setEditingFile({ path: filePath });
      setShowSaveAs(false);
      setSaveAsCategory('');
      setSaveAsFilename('');
      showSuccess(`Saved to ${filePath}`);
    } catch (err) {
      showError('Failed to save item file');
    }
  };

  const downloadJSON = () => {
    if (!item.name?.trim()) {
      showError('Item name is required');
      return;
    }
    const dataStr = JSON.stringify(item, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportName = `${item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', exportName);
    link.click();
    showSuccess(`Downloaded ${exportName}`);
  };

  const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        setItem(jsonData);
        setEditingFile(null);
        showSuccess('Item loaded from file');
      } catch {
        showError('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be loaded again
    event.target.value = '';
  };

  const clearForm = () => {
    if (confirm('Clear all form data?')) {
      setItem({ ...defaultItem });
      setEditingFile(null);
    }
  };

  // ---- UI Components ----

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
    marginBottom: '0.5rem',
  };

  if (!isDev) return null;

  return (
    <div className="container mx-auto p-6">
      {/* Page Title */}
      <h1 style={{ color: 'var(--color-white)', fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem' }}>
        Magic Item Designer
      </h1>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button onClick={downloadJSON} variant="secondary">
          Download JSON
        </Button>

        <label
          className="inline-flex items-center px-4 py-2 rounded cursor-pointer text-sm font-medium"
          style={{ backgroundColor: 'var(--color-evening)', color: 'var(--color-white)', border: '1px solid var(--color-dark-border)' }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-dark-elevated)')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-evening)')}
        >
          Load JSON
          <input type="file" accept=".json" onChange={loadFromFile} className="hidden" />
        </label>

        <Button onClick={() => { fetchItemFiles(); setShowBrowser(true); }} variant="secondary">
          Browse Server Files
        </Button>

        {editingFile && (
          <Button onClick={saveItemFile} variant="primary">
            Save to {editingFile.path}
          </Button>
        )}

        <Button onClick={() => {
          setSaveAsCategory(editingFile ? editingFile.path.split('/').slice(0, -1).join('/') : '');
          setSaveAsFilename(item.name ? item.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.json' : '');
          setShowSaveAs(true);
        }} variant="secondary">
          Save As...
        </Button>

        <Button onClick={clearForm} variant="danger">
          Clear Form
        </Button>
      </div>

      {/* Editing file indicator */}
      {editingFile && (
        <div
          className="mb-4 px-3 py-2 rounded text-sm flex items-center gap-2"
          style={{
            backgroundColor: 'rgba(200, 170, 80, 0.15)',
            border: '1px solid rgba(200, 170, 80, 0.3)',
            color: 'var(--color-old-gold)',
          }}
        >
          Editing: <strong>{editingFile.path}</strong>
          <button
            onClick={() => setEditingFile(null)}
            className="ml-2 text-gray-400 hover:text-white text-xs"
          >
            × clear
          </button>
        </div>
      )}

      {/* Form Sections */}
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {/* Header - always visible */}
        <div style={sectionContentStyle}>
          <ItemHeaderFields item={item} onChange={handleFieldChange} />
        </div>

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
          <SectionHeader title="Resources & Movement" section="resources" />
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

        {/* Recipe */}
        <div>
          <SectionHeader title="Crafting Recipe" section="recipe" />
          {expandedSections.recipe && (
            <div style={sectionContentStyle}>
              <ItemRecipeFields item={item} onChange={handleFieldChange} />
            </div>
          )}
        </div>

        {/* Bonuses & Modifiers */}
        <div>
          <SectionHeader title="Skill Bonuses" section="bonuses" />
          {expandedSections.bonuses && (
            <div style={sectionContentStyle}>
              <ItemBonusFields item={item} onChange={handleFieldChange} />
            </div>
          )}
        </div>

        {/* Mitigation */}
        <div>
          <SectionHeader title="Mitigation" section="mitigation" />
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

        {/* Extras */}
        <div>
          <SectionHeader title="Extras" section="extras" />
          {expandedSections.extras && (
            <div style={sectionContentStyle}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {/* Properties */}
                <div>
                  <label style={fieldLabelStyle}>Properties (text)</label>
                  <textarea
                    value={item.properties || ''}
                    onChange={(e) => handleFieldChange('properties', e.target.value)}
                    rows={3}
                    style={{ ...fieldInputStyle, resize: 'vertical', minHeight: '60px' }}
                    placeholder="Describe any special properties..."
                  />
                </div>

                {/* Substance fields */}
                <div>
                  <label style={fieldLabelStyle}>Substance</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    <div>
                      <label style={{ ...fieldLabelStyle, fontSize: '0.75rem' }}>Category</label>
                      <input
                        type="text"
                        value={item.substance?.category || ''}
                        onChange={(e) =>
                          handleFieldChange('substance', {
                            ...item.substance,
                            category: e.target.value,
                          })
                        }
                        style={fieldInputStyle}
                        placeholder="e.g. alcohol"
                      />
                    </div>
                    <div>
                      <label style={{ ...fieldLabelStyle, fontSize: '0.75rem' }}>Dependency</label>
                      <input
                        type="number"
                        value={item.substance?.dependency || 0}
                        onChange={(e) =>
                          handleFieldChange('substance', {
                            ...item.substance,
                            dependency: parseInt(e.target.value) || 0,
                          })
                        }
                        style={fieldInputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ ...fieldLabelStyle, fontSize: '0.75rem' }}>Effect</label>
                      <input
                        type="text"
                        value={item.substance?.effect || ''}
                        onChange={(e) =>
                          handleFieldChange('substance', {
                            ...item.substance,
                            effect: e.target.value,
                          })
                        }
                        style={fieldInputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ ...fieldLabelStyle, fontSize: '0.75rem' }}>Duration</label>
                      <input
                        type="text"
                        value={item.substance?.duration || ''}
                        onChange={(e) =>
                          handleFieldChange('substance', {
                            ...item.substance,
                            duration: e.target.value,
                          })
                        }
                        style={fieldInputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Misc fields row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', alignItems: 'end' }}>
                  <div>
                    <label style={fieldLabelStyle}>
                      <input
                        type="checkbox"
                        checked={item.holdable || false}
                        onChange={(e) => handleFieldChange('holdable', e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Holdable
                    </label>
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>Stack Limit</label>
                    <input
                      type="number"
                      value={item.stack_limit || 0}
                      onChange={(e) => handleFieldChange('stack_limit', parseInt(e.target.value) || 0)}
                      style={fieldInputStyle}
                    />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>Hands</label>
                    <input
                      type="number"
                      value={item.hands || 0}
                      onChange={(e) => handleFieldChange('hands', parseInt(e.target.value) || 0)}
                      min={0}
                      max={2}
                      style={fieldInputStyle}
                    />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>Side Effect</label>
                    <input
                      type="text"
                      value={item.side_effect || ''}
                      onChange={(e) => handleFieldChange('side_effect', e.target.value)}
                      style={fieldInputStyle}
                    />
                  </div>
                </div>

                {/* Foundry fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={fieldLabelStyle}>Foundry Icon</label>
                    <input
                      type="text"
                      value={(item as any).foundry_icon || ''}
                      onChange={(e) => handleFieldChange('foundry_icon', e.target.value)}
                      style={fieldInputStyle}
                      placeholder="icons/svg/..."
                    />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>Foundry ID</label>
                    <input
                      type="text"
                      value={(item as any).foundry_id || ''}
                      onChange={(e) => handleFieldChange('foundry_id', e.target.value)}
                      style={fieldInputStyle}
                      placeholder="Auto-generated if blank"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Browser Modal */}
      {showBrowser &&
        (() => {
          const categories = Object.keys(itemFiles).sort();
          let allEntries: { category: string; filename: string; name: string; type: string; rarity: string }[] = [];
          const catsToShow = categoryFilter === 'all' ? categories : [categoryFilter];
          for (const cat of catsToShow) {
            if (itemFiles[cat]) {
              allEntries.push(...itemFiles[cat].map((f) => ({ ...f, category: cat })));
            }
          }
          if (searchFilter.trim()) {
            const term = searchFilter.toLowerCase().trim();
            allEntries = allEntries.filter((e) => e.name.toLowerCase().includes(term));
          }

          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Browse Magic Items</h3>
                  <Button
                    onClick={() => {
                      setShowBrowser(false);
                      setSearchFilter('');
                      setCategoryFilter('all');
                    }}
                    variant="ghost"
                  >
                    ×
                  </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="p-2 bg-gray-900 border border-gray-600 rounded text-sm"
                  />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-2 bg-gray-900 border border-gray-600 rounded text-sm"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-xs text-gray-400 mb-2">
                  {allEntries.length} item{allEntries.length !== 1 ? 's' : ''}
                </div>

                <div className="overflow-y-auto flex-1">
                  {categoryFilter === 'all' ? (
                    categories
                      .filter((cat) => {
                        const entries = itemFiles[cat] || [];
                        if (!searchFilter.trim()) return entries.length > 0;
                        return entries.some((e) =>
                          e.name.toLowerCase().includes(searchFilter.toLowerCase().trim())
                        );
                      })
                      .map((cat) => {
                        let entries = itemFiles[cat] || [];
                        if (searchFilter.trim()) {
                          const term = searchFilter.toLowerCase().trim();
                          entries = entries.filter((e) => e.name.toLowerCase().includes(term));
                        }
                        return (
                          <div key={cat} className="mb-4">
                            <h4
                              className="text-sm font-bold uppercase tracking-wider mb-2"
                              style={{ color: 'var(--color-stormy)' }}
                            >
                              {cat} ({entries.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {entries.map((entry) => (
                                <button
                                  key={entry.filename}
                                  onClick={() => loadItemFile(`${cat}/${entry.filename}`)}
                                  className="text-left p-3 rounded border border-gray-600 hover:bg-gray-700 transition-colors"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-white">{entry.name}</span>
                                    <span
                                      className="text-xs capitalize px-2 py-0.5 rounded"
                                      style={{
                                        color: rarityColors[entry.rarity] || '#a0aec0',
                                        backgroundColor: 'var(--color-dark-surface)',
                                      }}
                                    >
                                      {entry.rarity}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">{entry.filename}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {allEntries.map((entry) => (
                        <button
                          key={`${entry.category}-${entry.filename}`}
                          onClick={() => loadItemFile(`${entry.category}/${entry.filename}`)}
                          className="text-left p-3 rounded border border-gray-600 hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-white">{entry.name}</span>
                            <span
                              className="text-xs capitalize px-2 py-0.5 rounded"
                              style={{
                                color: rarityColors[entry.rarity] || '#a0aec0',
                                backgroundColor: 'var(--color-dark-surface)',
                              }}
                            >
                              {entry.rarity}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{entry.filename}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {allEntries.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <p>
                        {Object.keys(itemFiles).length === 0
                          ? 'Loading item files...'
                          : 'No items match your filters.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      {/* Save As Modal */}
      {showSaveAs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Save As</h3>
            <div className="grid gap-3 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category Path</label>
                <input
                  type="text"
                  value={saveAsCategory}
                  onChange={(e) => setSaveAsCategory(e.target.value)}
                  placeholder="e.g. weapons/complexMelee"
                  className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-sm"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  Relative to data/magic_items/
                </span>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Filename</label>
                <input
                  type="text"
                  value={saveAsFilename}
                  onChange={(e) => setSaveAsFilename(e.target.value)}
                  placeholder="e.g. flaming_sword.json"
                  className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setShowSaveAs(false)} variant="ghost">
                Cancel
              </Button>
              <Button onClick={saveItemFileAs} variant="primary">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevItemDesigner;
