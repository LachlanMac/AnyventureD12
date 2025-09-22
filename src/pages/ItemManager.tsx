import React, { useState, useEffect } from 'react';
import { Item } from '../types/character';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import { useToast } from '../context/ToastContext';

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          padding: '0.75rem',
          backgroundColor: 'var(--color-dark-elevated)',
          borderRadius: '0.375rem',
          marginBottom: isOpen ? '1rem' : '0',
          border: '1px solid var(--color-dark-border)',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            color: 'var(--color-cloud)',
          }}
        >
          ▶
        </span>
        <h3
          style={{
            color: 'var(--color-metal-gold)',
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: 'bold',
          }}
        >
          {title}
        </h3>
      </div>
      {isOpen && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--color-dark-surface)',
            borderRadius: '0.375rem',
            border: '1px solid var(--color-dark-border)',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const ItemManager: React.FC = () => {
  const { showSuccess, showError, confirm } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editedItem, setEditedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Collapsible section states
  const [sections, setSections] = useState({
    basic: true,
    weapon: true,
    resources: false,
    attributes: false,
    skills: false,
    weapon_skills: false,
    magic_skills: false,
    craft_skills: false,
    mitigation: false,
    encumbrance: false,
    detections: false,
    immunities: false,
  });

  // Range options from datakey.txt
  const rangeOptions = [
    { value: 0, label: 'None' },
    { value: 1, label: 'Adjacent' },
    { value: 2, label: 'Nearby' },
    { value: 3, label: 'Very Short' },
    { value: 4, label: 'Short' },
    { value: 5, label: 'Moderate' },
    { value: 6, label: 'Distant' },
    { value: 7, label: 'Remote' },
    { value: 8, label: 'Unlimited' },
  ];

  const detectionTypes = [
    'normal',
    'darksight',
    'infravision',
    'deadsight',
    'echolocation',
    'tremorsense',
    'truesight',
    'aethersight',
  ];

  const immunityTypes = [
    'afraid',
    'bleeding',
    'blinded',
    'charmed',
    'confused',
    'dazed',
    'diseased',
    'exhausted',
    'frightened',
    'grappled',
    'incapacitated',
    'invisible',
    'paralyzed',
    'petrified',
    'poisoned',
    'prone',
    'restrained',
    'stunned',
    'unconscious',
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    setEditedItem({ ...item });
    setIsCreatingNew(false);
  };

  const handleCreateNew = () => {
    const newItem: Item = {
      _id: '',
      name: 'New Item',
      description: '',
      weight: 1,
      value: 0,
      rarity: 'common',
      type: 'trade_good',
      health: { max: 0, recovery: 0 },
      energy: { max: 0, recovery: 0 },
      resolve: { max: 0, recovery: 0 },
      movement: 0,
      attributes: {
        physique: { add_talent: 0, set_talent: 0 },
        finesse: { add_talent: 0, set_talent: 0 },
        mind: { add_talent: 0, set_talent: 0 },
        knowledge: { add_talent: 0, set_talent: 0 },
        social: { add_talent: 0, set_talent: 0 },
      },
      basic: {},
      craft: {},
      magic: {},
      weapon: {},
      mitigation: {
        physical: 0,
        cold: 0,
        heat: 0,
        electric: 0,
        psychic: 0,
        dark: 0,
        divine: 0,
        aether: 0,
        toxic: 0,
      },
      encumbrance_penalty: 0,
      detections: {},
      immunities: {},
    };

    setSelectedItem(null);
    setEditedItem(newItem);
    setIsCreatingNew(true);
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!editedItem) return;
    setEditedItem({ ...editedItem, [field]: value });
  };

  const handleNestedFieldChange = (parent: string, field: string, value: any) => {
    if (!editedItem) return;
    setEditedItem({
      ...editedItem,
      [parent]: {
        ...(editedItem[parent as keyof Item] as any),
        [field]: value,
      },
    });
  };

  const handleDeepNestedFieldChange = (
    parent: string,
    subParent: string,
    field: string,
    value: any
  ) => {
    if (!editedItem) return;
    setEditedItem({
      ...editedItem,
      [parent]: {
        ...(editedItem[parent as keyof Item] as any),
        [subParent]: {
          ...((editedItem[parent as keyof Item] as any)?.[subParent] || {}),
          [field]: value,
        },
      },
    });
  };

  const handleSave = async () => {
    if (!editedItem) return;

    setSaving(true);
    try {
      const url = isCreatingNew ? '/api/items' : `/api/items/${editedItem._id}`;
      const method = isCreatingNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedItem),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to save item');

      const savedItem = await response.json();

      if (isCreatingNew) {
        setItems([...items, savedItem]);
        setSelectedItem(savedItem);
        setEditedItem(savedItem);
        setIsCreatingNew(false);
      } else {
        setItems(items.map((item) => (item._id === savedItem._id ? savedItem : item)));
        setSelectedItem(savedItem);
      }

      showSuccess('Item saved successfully!');
    } catch (error) {
      console.error('Error saving item:', error);
      showError('Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/items/${selectedItem._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete item');

      setItems(items.filter((item) => item._id !== selectedItem._id));
      setSelectedItem(null);
      setEditedItem(null);
      showSuccess('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      showError('Failed to delete item');
    }
  };

  const getFilteredItems = () => {
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  };

  const isEquippableItem = () => {
    if (!editedItem) return false;
    return !['trade_good', 'consumable', 'tool', 'instrument', 'ammunition'].includes(
      editedItem.type
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
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
          Item Manager
        </h1>
        <Button onClick={handleCreateNew} variant="primary">
          Create New Item
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item List */}
        <div className="lg:col-span-1">
          <Card variant="default">
            <CardHeader>
              <h2 style={{ color: 'var(--color-white)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                Items ({getFilteredItems().length})
              </h2>
            </CardHeader>
            <CardBody>
              {/* Search and filters */}
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'var(--color-dark-bg)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.25rem',
                    color: 'var(--color-cloud)',
                    marginBottom: '0.5rem',
                  }}
                />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'var(--color-dark-bg)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.25rem',
                    color: 'var(--color-cloud)',
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="weapon">Weapons</option>
                  <option value="boots">Boots</option>
                  <option value="body">Body Armor</option>
                  <option value="gloves">Gloves</option>
                  <option value="headwear">Headwear</option>
                  <option value="cloak">Cloaks</option>
                  <option value="accessory">Accessories</option>
                  <option value="shield">Shields</option>
                  <option value="trade_good">Trade Goods</option>
                  <option value="consumable">Consumables</option>
                  <option value="tool">Tools</option>
                  <option value="instrument">Instruments</option>
                  <option value="ammunition">Ammunition</option>
                </select>
              </div>

              {/* Item list */}
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {getFilteredItems().map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleSelectItem(item)}
                    style={{
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      backgroundColor:
                        selectedItem?._id === item._id
                          ? 'var(--color-dark-elevated)'
                          : 'var(--color-dark-bg)',
                      border:
                        selectedItem?._id === item._id
                          ? '1px solid var(--color-metal-gold)'
                          : '1px solid var(--color-dark-border)',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                      {item.name}
                    </div>
                    <div
                      style={{
                        color: 'var(--color-cloud)',
                        fontSize: '0.875rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {item.type} • {item.rarity}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Item Editor */}
        <div className="lg:col-span-2">
          {editedItem ? (
            <Card variant="default">
              <CardHeader>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <h2
                    style={{ color: 'var(--color-white)', fontSize: '1.25rem', fontWeight: 'bold' }}
                  >
                    {isCreatingNew ? 'Create New Item' : 'Edit Item'}
                  </h2>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    {!isCreatingNew && (
                      <Button onClick={handleDelete} variant="danger">
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {/* Basic Information - Always shown */}
                <CollapsibleSection
                  title="Basic Information"
                  isOpen={sections.basic}
                  onToggle={() => toggleSection('basic')}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label
                        style={{
                          color: 'var(--color-cloud)',
                          display: 'block',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        value={editedItem.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-bg)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.25rem',
                          color: 'var(--color-cloud)',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          color: 'var(--color-cloud)',
                          display: 'block',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Type
                      </label>
                      <select
                        value={editedItem.type}
                        onChange={(e) => handleFieldChange('type', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-bg)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.25rem',
                          color: 'var(--color-cloud)',
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
                        <option value="trade_good">Trade Good</option>
                        <option value="consumable">Consumable</option>
                        <option value="tool">Tool</option>
                        <option value="instrument">Instrument</option>
                        <option value="ammunition">Ammunition</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <label
                      style={{
                        color: 'var(--color-cloud)',
                        display: 'block',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Description
                    </label>
                    <textarea
                      value={editedItem.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-dark-bg)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.25rem',
                        color: 'var(--color-cloud)',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '1rem',
                      marginTop: '1rem',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          color: 'var(--color-cloud)',
                          display: 'block',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Weight
                      </label>
                      <input
                        type="number"
                        value={editedItem.weight}
                        onChange={(e) =>
                          handleFieldChange('weight', parseFloat(e.target.value) || 0)
                        }
                        step="0.1"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-bg)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.25rem',
                          color: 'var(--color-cloud)',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          color: 'var(--color-cloud)',
                          display: 'block',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Value
                      </label>
                      <input
                        type="number"
                        value={editedItem.value}
                        onChange={(e) => handleFieldChange('value', parseInt(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-bg)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.25rem',
                          color: 'var(--color-cloud)',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          color: 'var(--color-cloud)',
                          display: 'block',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Rarity
                      </label>
                      <select
                        value={editedItem.rarity}
                        onChange={(e) => handleFieldChange('rarity', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'var(--color-dark-bg)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.25rem',
                          color: 'var(--color-cloud)',
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
                </CollapsibleSection>

                {/* Weapon Data - Only show for weapons */}
                {editedItem.type === 'weapon' && (
                  <CollapsibleSection
                    title="Weapon Data"
                    isOpen={sections.weapon}
                    onToggle={() => toggleSection('weapon')}
                  >
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      <div>
                        <label
                          style={{
                            color: 'var(--color-cloud)',
                            display: 'block',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Weapon Category
                        </label>
                        <select
                          value={editedItem.weapon_category || 'simpleMelee'}
                          onChange={(e) => handleFieldChange('weapon_category', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-bg)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.25rem',
                            color: 'var(--color-cloud)',
                          }}
                        >
                          <option value="simpleMelee">Simple Melee</option>
                          <option value="simpleRanged">Simple Ranged</option>
                          <option value="complexMelee">Complex Melee</option>
                          <option value="complexRanged">Complex Ranged</option>
                          <option value="unarmed">Unarmed</option>
                          <option value="throwing">Throwing</option>
                        </select>
                      </div>

                      {/* Primary Damage */}
                      <div>
                        <h4 style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                          Primary Damage
                        </h4>
                        <div
                          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}
                        >
                          <div>
                            <label
                              style={{
                                color: 'var(--color-cloud)',
                                display: 'block',
                                marginBottom: '0.25rem',
                                fontSize: '0.875rem',
                              }}
                            >
                              Base Damage
                            </label>
                            <input
                              type="text"
                              value={editedItem.primary?.damage || '0'}
                              onChange={(e) =>
                                handleNestedFieldChange('primary', 'damage', e.target.value)
                              }
                              placeholder="e.g., 3"
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-dark-bg)',
                                border: '1px solid var(--color-dark-border)',
                                borderRadius: '0.25rem',
                                color: 'var(--color-cloud)',
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                color: 'var(--color-cloud)',
                                display: 'block',
                                marginBottom: '0.25rem',
                                fontSize: '0.875rem',
                              }}
                            >
                              Extra Damage
                            </label>
                            <input
                              type="text"
                              value={editedItem.primary?.damage_extra || '0'}
                              onChange={(e) =>
                                handleNestedFieldChange('primary', 'damage_extra', e.target.value)
                              }
                              placeholder="e.g., 2"
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-dark-bg)',
                                border: '1px solid var(--color-dark-border)',
                                borderRadius: '0.25rem',
                                color: 'var(--color-cloud)',
                              }}
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.5rem',
                            marginTop: '0.5rem',
                          }}
                        >
                          <div>
                            <label
                              style={{
                                color: 'var(--color-cloud)',
                                display: 'block',
                                marginBottom: '0.25rem',
                                fontSize: '0.875rem',
                              }}
                            >
                              Damage Type
                            </label>
                            <select
                              value={editedItem.primary?.damage_type || 'physical'}
                              onChange={(e) =>
                                handleNestedFieldChange('primary', 'damage_type', e.target.value)
                              }
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-dark-bg)',
                                border: '1px solid var(--color-dark-border)',
                                borderRadius: '0.25rem',
                                color: 'var(--color-cloud)',
                              }}
                            >
                              <option value="physical">Physical</option>
                              <option value="heat">Heat</option>
                              <option value="cold">Cold</option>
                              <option value="electric">Electric</option>
                              <option value="dark">Dark</option>
                              <option value="divine">Divine</option>
                              <option value="aether">Aetheric</option>
                              <option value="psychic">Psychic</option>
                              <option value="toxic">Toxic</option>
                            </select>
                          </div>
                          <div>
                            <label
                              style={{
                                color: 'var(--color-cloud)',
                                display: 'block',
                                marginBottom: '0.25rem',
                                fontSize: '0.875rem',
                              }}
                            >
                              Category
                            </label>
                            <select
                              value={editedItem.primary?.category || 'slash'}
                              onChange={(e) =>
                                handleNestedFieldChange('primary', 'category', e.target.value)
                              }
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-dark-bg)',
                                border: '1px solid var(--color-dark-border)',
                                borderRadius: '0.25rem',
                                color: 'var(--color-cloud)',
                              }}
                            >
                              <option value="pierce">Pierce</option>
                              <option value="slash">Slash</option>
                              <option value="blunt">Blunt</option>
                              <option value="ranged">Ranged</option>
                              <option value="extra">Extra</option>
                            </select>
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.5rem',
                            marginTop: '0.5rem',
                          }}
                        >
                          <div>
                            <label
                              style={{
                                color: 'var(--color-cloud)',
                                display: 'block',
                                marginBottom: '0.25rem',
                                fontSize: '0.875rem',
                              }}
                            >
                              Min Range
                            </label>
                            <input
                              type="number"
                              value={editedItem.primary?.min_range || 0}
                              onChange={(e) =>
                                handleNestedFieldChange(
                                  'primary',
                                  'min_range',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-dark-bg)',
                                border: '1px solid var(--color-dark-border)',
                                borderRadius: '0.25rem',
                                color: 'var(--color-cloud)',
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                color: 'var(--color-cloud)',
                                display: 'block',
                                marginBottom: '0.25rem',
                                fontSize: '0.875rem',
                              }}
                            >
                              Max Range
                            </label>
                            <input
                              type="number"
                              value={editedItem.primary?.max_range || 0}
                              onChange={(e) =>
                                handleNestedFieldChange(
                                  'primary',
                                  'max_range',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-dark-bg)',
                                border: '1px solid var(--color-dark-border)',
                                borderRadius: '0.25rem',
                                color: 'var(--color-cloud)',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Secondary Damage */}
                      <div>
                        <h4 style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                          Secondary Damage (Optional)
                        </h4>
                        <div
                          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}
                        >
                          <div>
                            <label
                              style={{
                                color: 'var(--color-cloud)',
                                display: 'block',
                                marginBottom: '0.25rem',
                                fontSize: '0.875rem',
                              }}
                            >
                              Secondary Damage
                            </label>
                            <input
                              type="number"
                              value={editedItem.primary?.secondary_damage || 0}
                              onChange={(e) =>
                                handleNestedFieldChange(
                                  'primary',
                                  'secondary_damage',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-dark-bg)',
                                border: '1px solid var(--color-dark-border)',
                                borderRadius: '0.25rem',
                                color: 'var(--color-cloud)',
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                color: 'var(--color-cloud)',
                                display: 'block',
                                marginBottom: '0.25rem',
                                fontSize: '0.875rem',
                              }}
                            >
                              Secondary Extra
                            </label>
                            <input
                              type="number"
                              value={editedItem.primary?.secondary_damage_extra || 0}
                              onChange={(e) =>
                                handleNestedFieldChange(
                                  'primary',
                                  'secondary_damage_extra',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-dark-bg)',
                                border: '1px solid var(--color-dark-border)',
                                borderRadius: '0.25rem',
                                color: 'var(--color-cloud)',
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            style={{
                              color: 'var(--color-cloud)',
                              display: 'block',
                              marginBottom: '0.25rem',
                              fontSize: '0.875rem',
                              marginTop: '0.5rem',
                            }}
                          >
                            Secondary Type
                          </label>
                          <select
                            value={editedItem.primary?.secondary_damage_type || 'none'}
                            onChange={(e) =>
                              handleNestedFieldChange(
                                'primary',
                                'secondary_damage_type',
                                e.target.value
                              )
                            }
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-dark-bg)',
                              border: '1px solid var(--color-dark-border)',
                              borderRadius: '0.25rem',
                              color: 'var(--color-cloud)',
                            }}
                          >
                            <option value="none">None</option>
                            <option value="physical">Physical</option>
                            <option value="heat">Heat</option>
                            <option value="cold">Cold</option>
                            <option value="electric">Electric</option>
                            <option value="dark">Dark</option>
                            <option value="divine">Divine</option>
                            <option value="aether">Aetheric</option>
                            <option value="psychic">Psychic</option>
                            <option value="toxic">Toxic</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>
                )}

                {/* Only show stat sections for equippable items */}
                {isEquippableItem() && (
                  <>
                    {/* Resources */}
                    <CollapsibleSection
                      title="Resources"
                      isOpen={sections.resources}
                      onToggle={() => toggleSection('resources')}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '1rem',
                        }}
                      >
                        <div>
                          <h4 style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                            Health
                          </h4>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '0.5rem',
                            }}
                          >
                            <div>
                              <label
                                style={{
                                  color: 'var(--color-cloud)',
                                  display: 'block',
                                  marginBottom: '0.25rem',
                                  fontSize: '0.875rem',
                                }}
                              >
                                Max
                              </label>
                              <input
                                type="number"
                                value={editedItem.health?.max || 0}
                                onChange={(e) =>
                                  handleNestedFieldChange(
                                    'health',
                                    'max',
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  backgroundColor: 'var(--color-dark-bg)',
                                  border: '1px solid var(--color-dark-border)',
                                  borderRadius: '0.25rem',
                                  color: 'var(--color-cloud)',
                                }}
                              />
                            </div>
                            <div>
                              <label
                                style={{
                                  color: 'var(--color-cloud)',
                                  display: 'block',
                                  marginBottom: '0.25rem',
                                  fontSize: '0.875rem',
                                }}
                              >
                                Recovery
                              </label>
                              <input
                                type="number"
                                value={editedItem.health?.recovery || 0}
                                onChange={(e) =>
                                  handleNestedFieldChange(
                                    'health',
                                    'recovery',
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  backgroundColor: 'var(--color-dark-bg)',
                                  border: '1px solid var(--color-dark-border)',
                                  borderRadius: '0.25rem',
                                  color: 'var(--color-cloud)',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                            Energy
                          </h4>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '0.5rem',
                            }}
                          >
                            <div>
                              <label
                                style={{
                                  color: 'var(--color-cloud)',
                                  display: 'block',
                                  marginBottom: '0.25rem',
                                  fontSize: '0.875rem',
                                }}
                              >
                                Max
                              </label>
                              <input
                                type="number"
                                value={editedItem.energy?.max || 0}
                                onChange={(e) =>
                                  handleNestedFieldChange(
                                    'energy',
                                    'max',
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  backgroundColor: 'var(--color-dark-bg)',
                                  border: '1px solid var(--color-dark-border)',
                                  borderRadius: '0.25rem',
                                  color: 'var(--color-cloud)',
                                }}
                              />
                            </div>
                            <div>
                              <label
                                style={{
                                  color: 'var(--color-cloud)',
                                  display: 'block',
                                  marginBottom: '0.25rem',
                                  fontSize: '0.875rem',
                                }}
                              >
                                Recovery
                              </label>
                              <input
                                type="number"
                                value={editedItem.energy?.recovery || 0}
                                onChange={(e) =>
                                  handleNestedFieldChange(
                                    'energy',
                                    'recovery',
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  backgroundColor: 'var(--color-dark-bg)',
                                  border: '1px solid var(--color-dark-border)',
                                  borderRadius: '0.25rem',
                                  color: 'var(--color-cloud)',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                            Resolve
                          </h4>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '0.5rem',
                            }}
                          >
                            <div>
                              <label
                                style={{
                                  color: 'var(--color-cloud)',
                                  display: 'block',
                                  marginBottom: '0.25rem',
                                  fontSize: '0.875rem',
                                }}
                              >
                                Max
                              </label>
                              <input
                                type="number"
                                value={editedItem.resolve?.max || 0}
                                onChange={(e) =>
                                  handleNestedFieldChange(
                                    'resolve',
                                    'max',
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  backgroundColor: 'var(--color-dark-bg)',
                                  border: '1px solid var(--color-dark-border)',
                                  borderRadius: '0.25rem',
                                  color: 'var(--color-cloud)',
                                }}
                              />
                            </div>
                            <div>
                              <label
                                style={{
                                  color: 'var(--color-cloud)',
                                  display: 'block',
                                  marginBottom: '0.25rem',
                                  fontSize: '0.875rem',
                                }}
                              >
                                Recovery
                              </label>
                              <input
                                type="number"
                                value={editedItem.resolve?.recovery || 0}
                                onChange={(e) =>
                                  handleNestedFieldChange(
                                    'resolve',
                                    'recovery',
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  backgroundColor: 'var(--color-dark-bg)',
                                  border: '1px solid var(--color-dark-border)',
                                  borderRadius: '0.25rem',
                                  color: 'var(--color-cloud)',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                            Movement
                          </h4>
                          <input
                            type="number"
                            value={editedItem.movement || 0}
                            onChange={(e) =>
                              handleFieldChange('movement', parseInt(e.target.value) || 0)
                            }
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-dark-bg)',
                              border: '1px solid var(--color-dark-border)',
                              borderRadius: '0.25rem',
                              color: 'var(--color-cloud)',
                            }}
                          />
                        </div>
                      </div>
                    </CollapsibleSection>

                    {/* Attributes */}
                    <CollapsibleSection
                      title="Attributes"
                      isOpen={sections.attributes}
                      onToggle={() => toggleSection('attributes')}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '1rem',
                        }}
                      >
                        {['physique', 'finesse', 'mind', 'knowledge', 'social'].map((attr) => (
                          <div key={attr}>
                            <h4
                              style={{
                                color: 'var(--color-cloud)',
                                marginBottom: '0.5rem',
                                textTransform: 'capitalize',
                              }}
                            >
                              {attr}
                            </h4>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.5rem',
                              }}
                            >
                              <div>
                                <label
                                  style={{
                                    color: 'var(--color-cloud)',
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Add Talent
                                </label>
                                <input
                                  type="number"
                                  value={editedItem.attributes?.[attr]?.add_talent || 0}
                                  onChange={(e) =>
                                    handleDeepNestedFieldChange(
                                      'attributes',
                                      attr,
                                      'add_talent',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-dark-bg)',
                                    border: '1px solid var(--color-dark-border)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--color-cloud)',
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    color: 'var(--color-cloud)',
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Set Talent
                                </label>
                                <input
                                  type="number"
                                  value={editedItem.attributes?.[attr]?.set_talent || 0}
                                  onChange={(e) =>
                                    handleDeepNestedFieldChange(
                                      'attributes',
                                      attr,
                                      'set_talent',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-dark-bg)',
                                    border: '1px solid var(--color-dark-border)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--color-cloud)',
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>

                    {/* Basic Skills */}
                    <CollapsibleSection
                      title="Basic Skills"
                      isOpen={sections.skills}
                      onToggle={() => toggleSection('skills')}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '1rem',
                        }}
                      >
                        {[
                          'fitness',
                          'deflection',
                          'might',
                          'endurance',
                          'evasion',
                          'stealth',
                          'coordination',
                          'thievery',
                          'resilience',
                          'concentration',
                          'senses',
                          'logic',
                          'wildcraft',
                          'academics',
                          'magic',
                          'medicine',
                          'expression',
                          'presence',
                          'insight',
                          'persuasion',
                        ].map((skill) => (
                          <div key={skill}>
                            <h4
                              style={{
                                color: 'var(--color-cloud)',
                                marginBottom: '0.5rem',
                                textTransform: 'capitalize',
                              }}
                            >
                              {skill}
                            </h4>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.5rem',
                              }}
                            >
                              <div>
                                <label
                                  style={{
                                    color: 'var(--color-cloud)',
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Add Bonus
                                </label>
                                <input
                                  type="number"
                                  value={editedItem.basic?.[skill]?.add_bonus || 0}
                                  onChange={(e) =>
                                    handleDeepNestedFieldChange(
                                      'basic',
                                      skill,
                                      'add_bonus',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-dark-bg)',
                                    border: '1px solid var(--color-dark-border)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--color-cloud)',
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    color: 'var(--color-cloud)',
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Set Bonus
                                </label>
                                <input
                                  type="number"
                                  value={editedItem.basic?.[skill]?.set_bonus || 0}
                                  onChange={(e) =>
                                    handleDeepNestedFieldChange(
                                      'basic',
                                      skill,
                                      'set_bonus',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-dark-bg)',
                                    border: '1px solid var(--color-dark-border)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--color-cloud)',
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>

                    {/* Weapon Skills */}
                    <CollapsibleSection
                      title="Weapon Skills"
                      isOpen={sections.weapon_skills}
                      onToggle={() => toggleSection('weapon_skills')}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '1rem',
                        }}
                      >
                        {[
                          'unarmed',
                          'throwing',
                          'simpleRangedWeapons',
                          'simpleMeleeWeapons',
                          'complexRangedWeapons',
                          'complexMeleeWeapons',
                        ].map((skill) => (
                          <div key={skill}>
                            <h4
                              style={{
                                color: 'var(--color-cloud)',
                                marginBottom: '0.5rem',
                                textTransform: 'capitalize',
                              }}
                            >
                              {skill.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </h4>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '0.5rem',
                              }}
                            >
                              <div>
                                <label
                                  style={{
                                    color: 'var(--color-cloud)',
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Add Bonus
                                </label>
                                <input
                                  type="number"
                                  value={editedItem.weapon?.[skill]?.add_bonus || 0}
                                  onChange={(e) =>
                                    handleDeepNestedFieldChange(
                                      'weapon',
                                      skill,
                                      'add_bonus',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-dark-bg)',
                                    border: '1px solid var(--color-dark-border)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--color-cloud)',
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    color: 'var(--color-cloud)',
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Set Bonus
                                </label>
                                <input
                                  type="number"
                                  value={editedItem.weapon?.[skill]?.set_bonus || 0}
                                  onChange={(e) =>
                                    handleDeepNestedFieldChange(
                                      'weapon',
                                      skill,
                                      'set_bonus',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-dark-bg)',
                                    border: '1px solid var(--color-dark-border)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--color-cloud)',
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    color: 'var(--color-cloud)',
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Add Talent
                                </label>
                                <input
                                  type="number"
                                  value={editedItem.weapon?.[skill]?.add_talent || 0}
                                  onChange={(e) =>
                                    handleDeepNestedFieldChange(
                                      'weapon',
                                      skill,
                                      'add_talent',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-dark-bg)',
                                    border: '1px solid var(--color-dark-border)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--color-cloud)',
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    color: 'var(--color-cloud)',
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Set Talent
                                </label>
                                <input
                                  type="number"
                                  value={editedItem.weapon?.[skill]?.set_talent || 0}
                                  onChange={(e) =>
                                    handleDeepNestedFieldChange(
                                      'weapon',
                                      skill,
                                      'set_talent',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-dark-bg)',
                                    border: '1px solid var(--color-dark-border)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--color-cloud)',
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>

                    {/* Magic Skills */}
                    <CollapsibleSection
                      title="Magic Skills"
                      isOpen={sections.magic_skills}
                      onToggle={() => toggleSection('magic_skills')}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '1rem',
                        }}
                      >
                        {['black', 'primal', 'alteration', 'divine', 'mystic'].map((skill) => (
                          <div key={skill}>
                            <h4
                              style={{
                                color: 'var(--color-cloud)',
                                marginBottom: '0.5rem',
                                textTransform: 'capitalize',
                              }}
                            >
                              {skill}
                            </h4>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '0.5rem',
                              }}
                            >
                              <div>
                                <label
                                  style={{
                                    color: 'var(--color-cloud)',
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Add Bonus
                                </label>
                                <input
                                  type="number"
                                  value={editedItem.magic?.[skill]?.add_bonus || 0}
                                  onChange={(e) =>
                                    handleDeepNestedFieldChange(
                                      'magic',
                                      skill,
                                      'add_bonus',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-dark-bg)',
                                    border: '1px solid var(--color-dark-border)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--color-cloud)',
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    color: 'var(--color-cloud)',
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Set Bonus
                                </label>
                                <input
                                  type="number"
                                  value={editedItem.magic?.[skill]?.set_bonus || 0}
                                  onChange={(e) =>
                                    handleDeepNestedFieldChange(
                                      'magic',
                                      skill,
                                      'set_bonus',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-dark-bg)',
                                    border: '1px solid var(--color-dark-border)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--color-cloud)',
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    color: 'var(--color-cloud)',
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Add Talent
                                </label>
                                <input
                                  type="number"
                                  value={editedItem.magic?.[skill]?.add_talent || 0}
                                  onChange={(e) =>
                                    handleDeepNestedFieldChange(
                                      'magic',
                                      skill,
                                      'add_talent',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-dark-bg)',
                                    border: '1px solid var(--color-dark-border)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--color-cloud)',
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    color: 'var(--color-cloud)',
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Set Talent
                                </label>
                                <input
                                  type="number"
                                  value={editedItem.magic?.[skill]?.set_talent || 0}
                                  onChange={(e) =>
                                    handleDeepNestedFieldChange(
                                      'magic',
                                      skill,
                                      'set_talent',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-dark-bg)',
                                    border: '1px solid var(--color-dark-border)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--color-cloud)',
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>

                    {/* Craft Skills */}
                    <CollapsibleSection
                      title="Craft Skills"
                      isOpen={sections.craft_skills}
                      onToggle={() => toggleSection('craft_skills')}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '1rem',
                        }}
                      >
                        {[
                          'engineering',
                          'fabrication',
                          'alchemy',
                          'cooking',
                          'glyphcraft',
                          'bioSculpting',
                        ].map((skill) => (
                          <div key={skill}>
                            <h4
                              style={{
                                color: 'var(--color-cloud)',
                                marginBottom: '0.5rem',
                                textTransform: 'capitalize',
                              }}
                            >
                              {skill.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </h4>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '0.5rem',
                              }}
                            >
                              <div>
                                <label
                                  style={{
                                    color: 'var(--color-cloud)',
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Add Bonus
                                </label>
                                <input
                                  type="number"
                                  value={editedItem.craft?.[skill]?.add_bonus || 0}
                                  onChange={(e) =>
                                    handleDeepNestedFieldChange(
                                      'craft',
                                      skill,
                                      'add_bonus',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-dark-bg)',
                                    border: '1px solid var(--color-dark-border)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--color-cloud)',
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    color: 'var(--color-cloud)',
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Set Bonus
                                </label>
                                <input
                                  type="number"
                                  value={editedItem.craft?.[skill]?.set_bonus || 0}
                                  onChange={(e) =>
                                    handleDeepNestedFieldChange(
                                      'craft',
                                      skill,
                                      'set_bonus',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-dark-bg)',
                                    border: '1px solid var(--color-dark-border)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--color-cloud)',
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    color: 'var(--color-cloud)',
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Add Talent
                                </label>
                                <input
                                  type="number"
                                  value={editedItem.craft?.[skill]?.add_talent || 0}
                                  onChange={(e) =>
                                    handleDeepNestedFieldChange(
                                      'craft',
                                      skill,
                                      'add_talent',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-dark-bg)',
                                    border: '1px solid var(--color-dark-border)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--color-cloud)',
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    color: 'var(--color-cloud)',
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Set Talent
                                </label>
                                <input
                                  type="number"
                                  value={editedItem.craft?.[skill]?.set_talent || 0}
                                  onChange={(e) =>
                                    handleDeepNestedFieldChange(
                                      'craft',
                                      skill,
                                      'set_talent',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-dark-bg)',
                                    border: '1px solid var(--color-dark-border)',
                                    borderRadius: '0.25rem',
                                    color: 'var(--color-cloud)',
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>

                    {/* Mitigation */}
                    <CollapsibleSection
                      title="Damage Mitigation"
                      isOpen={sections.mitigation}
                      onToggle={() => toggleSection('mitigation')}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '1rem',
                        }}
                      >
                        {[
                          'physical',
                          'cold',
                          'heat',
                          'electric',
                          'psychic',
                          'dark',
                          'divine',
                          'aether',
                          'toxic',
                        ].map((type) => (
                          <div key={type}>
                            <label
                              style={{
                                color: 'var(--color-cloud)',
                                display: 'block',
                                marginBottom: '0.25rem',
                                textTransform: 'capitalize',
                              }}
                            >
                              {type}
                            </label>
                            <input
                              type="number"
                              value={editedItem.mitigation?.[type] || 0}
                              onChange={(e) =>
                                handleNestedFieldChange(
                                  'mitigation',
                                  type,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-dark-bg)',
                                border: '1px solid var(--color-dark-border)',
                                borderRadius: '0.25rem',
                                color: 'var(--color-cloud)',
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>

                    {/* Encumbrance Penalty */}
                    <CollapsibleSection
                      title="Encumbrance Penalty"
                      isOpen={sections.encumbrance}
                      onToggle={() => toggleSection('encumbrance')}
                    >
                      <div>
                        <label
                          style={{
                            color: 'var(--color-cloud)',
                            display: 'block',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Penalty Value
                        </label>
                        <input
                          type="number"
                          value={editedItem.encumbrance_penalty || 0}
                          onChange={(e) =>
                            handleFieldChange('encumbrance_penalty', parseInt(e.target.value) || 0)
                          }
                          min={0}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-bg)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.25rem',
                            color: 'var(--color-cloud)',
                          }}
                        />
                      </div>
                    </CollapsibleSection>
                  </>
                )}

                {/* Detections */}
                <CollapsibleSection
                  title="Detections"
                  isOpen={sections.detections}
                  onToggle={() => toggleSection('detections')}
                >
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}
                  >
                    {detectionTypes.map((detection) => (
                      <div key={detection}>
                        <label
                          style={{
                            color: 'var(--color-cloud)',
                            display: 'block',
                            marginBottom: '0.25rem',
                            textTransform: 'capitalize',
                          }}
                        >
                          {detection.replace(/_/g, ' ')}
                        </label>
                        <select
                          value={editedItem.detections?.[detection] || 0}
                          onChange={(e) =>
                            handleNestedFieldChange(
                              'detections',
                              detection,
                              parseInt(e.target.value)
                            )
                          }
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-dark-bg)',
                            border: '1px solid var(--color-dark-border)',
                            borderRadius: '0.25rem',
                            color: 'var(--color-cloud)',
                          }}
                        >
                          {rangeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Immunities */}
                <CollapsibleSection
                  title="Immunities"
                  isOpen={sections.immunities}
                  onToggle={() => toggleSection('immunities')}
                >
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}
                  >
                    {immunityTypes.map((immunity) => (
                      <div key={immunity} style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          id={`immunity-${immunity}`}
                          checked={editedItem.immunities?.[immunity] || false}
                          onChange={(e) =>
                            handleNestedFieldChange('immunities', immunity, e.target.checked)
                          }
                          style={{
                            marginRight: '0.5rem',
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                          }}
                        />
                        <label
                          htmlFor={`immunity-${immunity}`}
                          style={{
                            color: 'var(--color-cloud)',
                            textTransform: 'capitalize',
                            cursor: 'pointer',
                          }}
                        >
                          {immunity}
                        </label>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              </CardBody>
            </Card>
          ) : (
            <Card variant="default">
              <CardBody>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3rem',
                    color: 'var(--color-cloud)',
                  }}
                >
                  <h3 style={{ marginBottom: '1rem' }}>No Item Selected</h3>
                  <p>Select an item from the list or create a new one to begin editing.</p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemManager;
