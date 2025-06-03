import React from 'react';
import Card, { CardHeader, CardBody } from '../../ui/Card';
import { Character } from '../../../types/character';

interface EquipmentEffectsPanelProps {
  character: Character;
}

const EquipmentEffectsPanel: React.FC<EquipmentEffectsPanelProps> = ({ character }) => {
  const equipmentEffects = (character as any).equipmentEffects;

  if (!equipmentEffects || equipmentEffects.appliedItems.length === 0) {
    return null;
  }

  const hasAnyBonuses = () => {
    const bonuses = equipmentEffects.bonuses;
    const penalties = equipmentEffects.penalties;
    
    return (
      Object.keys(bonuses.skills).length > 0 ||
      Object.keys(bonuses.weaponSkills).length > 0 ||
      Object.keys(bonuses.magicSkills).length > 0 ||
      Object.keys(bonuses.craftingSkills).length > 0 ||
      Object.keys(bonuses.attributes).length > 0 ||
      Object.keys(bonuses.mitigation).length > 0 ||
      bonuses.health.max !== 0 ||
      bonuses.energy.max !== 0 ||
      bonuses.resolve.max !== 0 ||
      bonuses.movement !== 0 ||
      bonuses.bonusAttack !== 0 ||
      Object.keys(bonuses.detections).length > 0 ||
      bonuses.immunities.length > 0 ||
      Object.keys(penalties.skills).length > 0 ||
      penalties.movement !== 0 ||
      penalties.energy !== 0
    );
  };

  if (!hasAnyBonuses()) {
    return null;
  }

  const renderBonusSection = (title: string, items: { [key: string]: any }, color: string) => {
    const entries = Object.entries(items).filter(([_, value]) => value !== 0 && value !== undefined);
    if (entries.length === 0) return null;

    return (
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ color: color, fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {title}
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {entries.map(([key, value]) => (
            <span
              key={key}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: value > 0 ? '#10b981' : '#ef4444',
                fontSize: '0.75rem',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem',
                fontWeight: 'bold',
              }}
            >
              {key}: {value > 0 ? '+' : ''}{value}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderComplexBonusSection = (title: string, items: { [key: string]: any }, color: string) => {
    const entries = Object.entries(items).filter(([_, value]) => {
      if (typeof value === 'object') {
        return value.value !== 0 || value.talent !== 0 || value.diceTierModifier !== 0;
      }
      return false;
    });
    if (entries.length === 0) return null;

    return (
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ color: color, fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {title}
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {entries.map(([key, bonusData]) => (
            <div key={key} style={{ display: 'flex', gap: '0.25rem' }}>
              {bonusData.value !== 0 && (
                <span
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    color: bonusData.value > 0 ? '#10b981' : '#ef4444',
                    fontSize: '0.75rem',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '0.25rem',
                    fontWeight: 'bold',
                  }}
                >
                  {key}: {bonusData.value > 0 ? '+' : ''}{bonusData.value}
                </span>
              )}
              {bonusData.talent !== 0 && (
                <span
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    color: bonusData.talent > 0 ? '#10b981' : '#ef4444',
                    fontSize: '0.75rem',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '0.25rem',
                    fontWeight: 'bold',
                  }}
                >
                  {key} talent: {bonusData.talent > 0 ? '+' : ''}{bonusData.talent}
                </span>
              )}
              {bonusData.diceTierModifier !== 0 && (
                <span
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    color: bonusData.diceTierModifier > 0 ? '#10b981' : '#ef4444',
                    fontSize: '0.75rem',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '0.25rem',
                    fontWeight: 'bold',
                  }}
                >
                  {key} tier: {bonusData.diceTierModifier > 0 ? '+' : ''}{bonusData.diceTierModifier}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card variant="default">
      <CardHeader>
        <h2 style={{ color: 'var(--color-white)', fontSize: '1.25rem', fontWeight: 'bold' }}>
          Equipment Effects
        </h2>
      </CardHeader>
      <CardBody>
        {/* Applied Items */}
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: 'var(--color-cloud)', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Active Equipment
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {equipmentEffects.appliedItems.map((item: any, index: number) => (
              <span
                key={index}
                style={{
                  backgroundColor: 'rgba(85, 65, 130, 0.3)',
                  color: 'var(--color-white)',
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  fontWeight: 'bold',
                }}
              >
                {item.name} ({item.slot})
              </span>
            ))}
          </div>
        </div>

        {/* Bonuses */}
        {renderBonusSection('Attributes', equipmentEffects.bonuses.attributes, 'var(--color-metal-gold)')}
        {renderComplexBonusSection('Skills', equipmentEffects.bonuses.skills, 'var(--color-sat-purple)')}
        {renderComplexBonusSection('Weapon Skills', equipmentEffects.bonuses.weaponSkills, 'var(--color-sunset)')}
        {renderComplexBonusSection('Magic Skills', equipmentEffects.bonuses.magicSkills, 'var(--color-mistic-purple)')}
        {renderComplexBonusSection('Crafting Skills', equipmentEffects.bonuses.craftingSkills, 'var(--color-cloud)')}
        {renderBonusSection('Mitigation', equipmentEffects.bonuses.mitigation, '#10b981')}
        
        {/* Resource Bonuses */}
        {(equipmentEffects.bonuses.health.max !== 0 || equipmentEffects.bonuses.energy.max !== 0 || equipmentEffects.bonuses.resolve.max !== 0 || equipmentEffects.bonuses.movement !== 0 || equipmentEffects.bonuses.bonusAttack !== 0) && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--color-cloud)', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Resources & Stats
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {equipmentEffects.bonuses.health.max !== 0 && (
                <span style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', color: '#10b981', fontSize: '0.75rem', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontWeight: 'bold' }}>
                  Health: +{equipmentEffects.bonuses.health.max}
                </span>
              )}
              {equipmentEffects.bonuses.energy.max !== 0 && (
                <span style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', color: '#10b981', fontSize: '0.75rem', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontWeight: 'bold' }}>
                  Energy: +{equipmentEffects.bonuses.energy.max}
                </span>
              )}
              {equipmentEffects.bonuses.resolve.max !== 0 && (
                <span style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', color: equipmentEffects.bonuses.resolve.max > 0 ? '#10b981' : '#ef4444', fontSize: '0.75rem', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontWeight: 'bold' }}>
                  Resolve: {equipmentEffects.bonuses.resolve.max > 0 ? '+' : ''}{equipmentEffects.bonuses.resolve.max}
                </span>
              )}
              {equipmentEffects.bonuses.movement !== 0 && (
                <span style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', color: '#10b981', fontSize: '0.75rem', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontWeight: 'bold' }}>
                  Movement: +{equipmentEffects.bonuses.movement}
                </span>
              )}
              {equipmentEffects.bonuses.bonusAttack !== 0 && (
                <span style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', color: '#10b981', fontSize: '0.75rem', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontWeight: 'bold' }}>
                  Attack Bonus: +{equipmentEffects.bonuses.bonusAttack}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Detections */}
        {Object.keys(equipmentEffects.bonuses.detections).length > 0 && renderBonusSection('Detections', equipmentEffects.bonuses.detections, 'var(--color-mistic-purple)')}

        {/* Immunities */}
        {equipmentEffects.bonuses.immunities.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Immunities
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {equipmentEffects.bonuses.immunities.map((immunity: string) => (
                <span
                  key={immunity}
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    fontSize: '0.75rem',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '0.25rem',
                    fontWeight: 'bold',
                  }}
                >
                  {immunity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Penalties */}
        {(Object.keys(equipmentEffects.penalties.skills).length > 0 || equipmentEffects.penalties.movement !== 0 || equipmentEffects.penalties.energy !== 0) && (
          <div>
            <h3 style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Penalties
            </h3>
            {renderBonusSection('Skill Penalties', equipmentEffects.penalties.skills, '#ef4444')}
            {equipmentEffects.penalties.movement !== 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Movement Penalty
                </h4>
                <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.75rem', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontWeight: 'bold' }}>
                  -{equipmentEffects.penalties.movement}
                </span>
              </div>
            )}
            {equipmentEffects.penalties.energy !== 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Energy Penalty
                </h4>
                <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.75rem', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontWeight: 'bold' }}>
                  -{equipmentEffects.penalties.energy}
                </span>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default EquipmentEffectsPanel;