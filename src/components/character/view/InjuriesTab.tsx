import React, { useEffect, useState } from 'react';
import Card, { CardBody, CardHeader } from '../../ui/Card';
import Button from '../../ui/Button';

interface InjuryData {
  _id: string;
  id: string;
  name: string;
  description: string;
  type: string;
  severity: string | null;
  pain: number;
  stress: number;
  recovery_dc: number | null;
  recovery_stat: string | null;
  data: string;
  foundry_icon: string;
}

interface CharacterInjury {
  injuryId: InjuryData;
  notes: string;
  dateAcquired: string;
}

interface InjuriesTabProps {
  character: {
    _id: string;
    resources?: {
      health?: { current: number; max: number };
      resolve?: { current: number; max: number };
      pain?: { custom: number; calculated: number };
      stress?: { custom: number; calculated: number };
    };
    injuries?: CharacterInjury[];
  };
  onCharacterUpdate?: (character: any) => void;
  onPainStressChange?: (type: 'pain' | 'stress', newCustomValue: number) => void;
  canEdit?: boolean;
}

const INJURY_TYPE_LABELS: Record<string, string> = {
  cosmetic_injury: 'Cosmetic',
  physical_injury: 'Physical',
  mental_injury: 'Mental',
  missing_part: 'Missing Part',
};

const INJURY_TYPE_COLORS: Record<string, string> = {
  cosmetic_injury: 'var(--color-cloud)',
  physical_injury: 'var(--color-sunset)',
  mental_injury: 'var(--color-sat-purple)',
  missing_part: 'var(--color-danger)',
};

function getPainThreshold(pain: number): { label: string; color: string; effects: string } {
  if (pain <= 0) return { label: 'None', color: 'var(--color-success)', effects: 'No effect.' };
  if (pain <= 5) return { label: 'Mild', color: 'var(--color-cloud)', effects: 'No effect.' };
  if (pain <= 10) return { label: 'Moderate', color: 'var(--color-metal-gold)', effects: '+1 penalty die on all rolls.' };
  if (pain <= 15) return { label: 'Severe', color: 'var(--color-sunset)', effects: '+2 penalty dice on all rolls. No favorable rest. No morale.' };
  return { label: 'Critical', color: 'var(--color-danger)', effects: '+2 penalty dice. Endurance RC 4 each turn or fall unconscious. No favorable rest. No morale.' };
}

function getStressThreshold(stress: number): { label: string; color: string; effects: string } {
  if (stress <= 0) return { label: 'None', color: 'var(--color-success)', effects: 'No effect.' };
  if (stress <= 5) return { label: 'Mild', color: 'var(--color-cloud)', effects: 'No effect.' };
  if (stress <= 10) return { label: 'Moderate', color: 'var(--color-metal-gold)', effects: '+1 penalty die on all rolls.' };
  if (stress <= 15) return { label: 'Severe', color: 'var(--color-sat-purple)', effects: '+2 penalty dice on all rolls. No favorable rest. No morale.' };
  return { label: 'Critical', color: 'var(--color-danger)', effects: '+2 penalty dice. Resilience RC 4 each turn or become Broken. No favorable rest. No morale.' };
}

const InjuriesTab: React.FC<InjuriesTabProps> = ({ character, onCharacterUpdate, onPainStressChange, canEdit = true }) => {
  const [allInjuries, setAllInjuries] = useState<InjuryData[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInjuryId, setSelectedInjuryId] = useState('');
  const [addNotes, setAddNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const injuries = character.injuries || [];

  useEffect(() => {
    fetch('/api/injuries')
      .then((res) => res.json())
      .then((data) => setAllInjuries(data))
      .catch((err) => console.error('Failed to load injuries:', err));
  }, []);

  // Calculate pain and stress
  const injuryPain = injuries.reduce((sum, i) => sum + (i.injuryId?.pain || 0), 0);
  const injuryStress = injuries.reduce((sum, i) => sum + (i.injuryId?.stress || 0), 0);

  const health = character.resources?.health || { current: 0, max: 0 };
  const resolve = character.resources?.resolve || { current: 0, max: 0 };

  let healthPain = 0;
  if (health.max > 0) {
    if (health.current < 5) healthPain = 4;
    else if (health.current < health.max / 2) healthPain = 2;
  }

  let resolvePain = 0;
  if (resolve.max > 0) {
    if (resolve.current < 3) resolvePain = 4;
    else if (resolve.current < resolve.max / 2) resolvePain = 2;
  }

  const painOverride = character.resources?.pain?.custom || 0;
  const stressOverride = character.resources?.stress?.custom || 0;

  const totalPain = Math.max(0, injuryPain + healthPain + painOverride);
  const totalStress = Math.max(0, injuryStress + resolvePain + stressOverride);

  const painThreshold = getPainThreshold(totalPain);
  const stressThreshold = getStressThreshold(totalStress);

  const handleAddInjury = async () => {
    if (!selectedInjuryId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/characters/${character._id}/injuries/${selectedInjuryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ notes: addNotes }),
      });
      if (!res.ok) throw new Error('Failed to add injury');
      const updatedInjuries = await res.json();
      if (onCharacterUpdate) {
        onCharacterUpdate({ ...character, injuries: updatedInjuries });
      }
      setShowAddModal(false);
      setSelectedInjuryId('');
      setAddNotes('');
    } catch (err) {
      console.error('Error adding injury:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveInjury = async (index: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/characters/${character._id}/injuries/${index}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      if (!res.ok) throw new Error('Failed to remove injury');
      const updatedInjuries = await res.json();
      if (onCharacterUpdate) {
        onCharacterUpdate({ ...character, injuries: updatedInjuries });
      }
    } catch (err) {
      console.error('Error removing injury:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group injuries by type for display
  const groupedInjuries: Record<string, { injury: CharacterInjury; index: number }[]> = {};
  injuries.forEach((injury, index) => {
    const type = injury.injuryId?.type || 'unknown';
    if (!groupedInjuries[type]) groupedInjuries[type] = [];
    groupedInjuries[type].push({ injury, index });
  });

  const typeOrder = ['physical_injury', 'mental_injury', 'missing_part', 'cosmetic_injury'];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ color: 'var(--color-white)', fontSize: '1.25rem', fontWeight: 'bold' }}>
          Injuries
        </h2>
        {canEdit && (
          <Button variant="accent" onClick={() => setShowAddModal(true)}>
            Add Injury
          </Button>
        )}
      </div>

      {/* Pain & Stress Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <Card variant="default">
          <CardBody>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--color-cloud)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>PAIN</div>
              <div style={{ color: painThreshold.color, fontSize: '1.5rem', fontWeight: 'bold' }}>{totalPain}</div>
              <div style={{ color: painThreshold.color, fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {painThreshold.label}
              </div>
              <div style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>{painThreshold.effects}</div>
              {healthPain > 0 && (
                <div style={{ color: 'var(--color-sunset)', fontSize: '0.7rem', marginTop: '0.5rem' }}>
                  +{healthPain} from low health
                </div>
              )}
              {canEdit && onPainStressChange && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                  <span style={{ color: 'var(--color-cloud)', fontSize: '0.7rem' }}>Override:</span>
                  <input
                    type="number"
                    value={painOverride}
                    onChange={(e) => onPainStressChange('pain', parseInt(e.target.value) || 0)}
                    style={{
                      width: '3.5rem',
                      padding: '0.125rem 0.25rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      textAlign: 'center',
                    }}
                  />
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card variant="default">
          <CardBody>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--color-cloud)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>STRESS</div>
              <div style={{ color: stressThreshold.color, fontSize: '1.5rem', fontWeight: 'bold' }}>{totalStress}</div>
              <div style={{ color: stressThreshold.color, fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {stressThreshold.label}
              </div>
              <div style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>{stressThreshold.effects}</div>
              {resolvePain > 0 && (
                <div style={{ color: 'var(--color-sat-purple)', fontSize: '0.7rem', marginTop: '0.5rem' }}>
                  +{resolvePain} from low resolve
                </div>
              )}
              {canEdit && onPainStressChange && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                  <span style={{ color: 'var(--color-cloud)', fontSize: '0.7rem' }}>Override:</span>
                  <input
                    type="number"
                    value={stressOverride}
                    onChange={(e) => onPainStressChange('stress', parseInt(e.target.value) || 0)}
                    style={{
                      width: '3.5rem',
                      padding: '0.125rem 0.25rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      textAlign: 'center',
                    }}
                  />
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Injury List */}
      {injuries.length === 0 ? (
        <Card variant="default">
          <CardBody>
            <div style={{ textAlign: 'center', color: 'var(--color-cloud)', padding: '2rem 0' }}>
              No injuries. Stay safe out there.
            </div>
          </CardBody>
        </Card>
      ) : (
        typeOrder.map((type) => {
          const group = groupedInjuries[type];
          if (!group || group.length === 0) return null;
          return (
            <div key={type} style={{ marginBottom: '1rem' }}>
              <h3 style={{ color: INJURY_TYPE_COLORS[type], fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {INJURY_TYPE_LABELS[type]} ({group.length})
              </h3>
              {group.map(({ injury, index }) => {
                const data = injury.injuryId;
                if (!data) return null;
                return (
                  <Card key={index} variant="default" style={{ marginBottom: '0.5rem' }}>
                    <CardBody>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>{data.name}</span>
                            {data.severity && (
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '0.25rem',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                color: INJURY_TYPE_COLORS[data.type],
                              }}>
                                {data.severity}
                              </span>
                            )}
                            {data.pain > 0 && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-sunset)' }}>
                                +{data.pain} pain
                              </span>
                            )}
                            {data.stress > 0 && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-sat-purple)' }}>
                                +{data.stress} stress
                              </span>
                            )}
                          </div>
                          <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                            {data.description}
                          </div>
                          {data.recovery_dc && data.recovery_stat && (
                            <div style={{ color: 'var(--color-metal-gold)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                              Recovery: {data.recovery_stat} RC {data.recovery_dc}
                            </div>
                          )}
                          {injury.notes && (
                            <div style={{ color: 'var(--color-cloud)', fontSize: '0.75rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
                              {injury.notes}
                            </div>
                          )}
                        </div>
                        {canEdit && (
                          <button
                            onClick={() => handleRemoveInjury(index)}
                            disabled={loading}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-danger)',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              fontSize: '1.25rem',
                              lineHeight: 1,
                            }}
                            title="Remove injury"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          );
        })
      )}

      {/* Add Injury Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-dark)',
              border: '1px solid var(--color-dark-border)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: 'var(--color-white)', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Add Injury
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: 'var(--color-cloud)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Injury
              </label>
              <select
                value={selectedInjuryId}
                onChange={(e) => setSelectedInjuryId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: 'var(--color-dark-elevated)',
                  color: 'var(--color-white)',
                  border: '1px solid var(--color-dark-border)',
                  borderRadius: '0.375rem',
                }}
              >
                <option value="">Select an injury...</option>
                {typeOrder.map((type) => {
                  const typeInjuries = allInjuries.filter((i) => i.type === type);
                  if (typeInjuries.length === 0) return null;
                  return (
                    <optgroup key={type} label={INJURY_TYPE_LABELS[type]}>
                      {typeInjuries.map((injury) => (
                        <option key={injury._id} value={injury._id}>
                          {injury.name}
                          {injury.severity ? ` (${injury.severity})` : ''}
                          {injury.pain > 0 ? ` [+${injury.pain} pain]` : ''}
                          {injury.stress > 0 ? ` [+${injury.stress} stress]` : ''}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>

            {selectedInjuryId && (() => {
              const selected = allInjuries.find((i) => i._id === selectedInjuryId);
              if (!selected) return null;
              return (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '0.375rem',
                  marginBottom: '1rem',
                }}>
                  <div style={{ color: 'var(--color-white)', fontWeight: 'bold', marginBottom: '0.25rem' }}>{selected.name}</div>
                  <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>{selected.description}</div>
                  {selected.recovery_dc && selected.recovery_stat && (
                    <div style={{ color: 'var(--color-metal-gold)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      Recovery: {selected.recovery_stat} RC {selected.recovery_dc}
                    </div>
                  )}
                </div>
              );
            })()}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: 'var(--color-cloud)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Notes (optional)
              </label>
              <input
                type="text"
                value={addNotes}
                onChange={(e) => setAddNotes(e.target.value)}
                placeholder="How did this happen?"
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

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button variant="accent" onClick={handleAddInjury} disabled={!selectedInjuryId || loading}>
                {loading ? 'Adding...' : 'Add Injury'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InjuriesTab;
