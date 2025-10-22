import React, { useState, useEffect } from 'react';

interface ExtraTrainingProps {
  characterId: string;
  modulePoints: { total: number; spent: number };
  traits: any[];
  onTraitsUpdate: (updatedTraits: any[]) => void;
}

interface SkillOption {
  id: string;
  name: string;
  dataCode: string;
  category: string;
}

const ExtraTrainingManager: React.FC<ExtraTrainingProps> = ({
  characterId,
  modulePoints,
  traits,
  onTraitsUpdate,
}) => {
  const [extraTrainingTrait, setExtraTrainingTrait] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<Map<string, SkillOption>>(new Map());
  const [availableSlots, setAvailableSlots] = useState(0);

  // All available skill options organized by category
  const skillOptions: SkillOption[] = [
    // Basic Skills
    { id: 'fitness', name: 'Fitness', dataCode: 'SSA=1', category: 'Basic' },
    { id: 'deflection', name: 'Deflection', dataCode: 'SSB=1', category: 'Basic' },
    { id: 'might', name: 'Might', dataCode: 'SSC=1', category: 'Basic' },
    { id: 'endurance', name: 'Endurance', dataCode: 'SSD=1', category: 'Basic' },
    { id: 'evasion', name: 'Evasion', dataCode: 'SSE=1', category: 'Basic' },
    { id: 'stealth', name: 'Stealth', dataCode: 'SSF=1', category: 'Basic' },
    { id: 'coordination', name: 'Coordination', dataCode: 'SSG=1', category: 'Basic' },
    { id: 'thievery', name: 'Thievery', dataCode: 'SSH=1', category: 'Basic' },
    { id: 'resilience', name: 'Resilience', dataCode: 'SSI=1', category: 'Basic' },
    { id: 'concentration', name: 'Concentration', dataCode: 'SSJ=1', category: 'Basic' },
    { id: 'senses', name: 'Senses', dataCode: 'SSK=1', category: 'Basic' },
    { id: 'logic', name: 'Logic', dataCode: 'SSL=1', category: 'Basic' },
    { id: 'wildcraft', name: 'Wildcraft', dataCode: 'SSM=1', category: 'Basic' },
    { id: 'academics', name: 'Academics', dataCode: 'SSN=1', category: 'Basic' },
    { id: 'magic', name: 'Magic', dataCode: 'SSO=1', category: 'Basic' },
    { id: 'medicine', name: 'Medicine', dataCode: 'SSP=1', category: 'Basic' },
    { id: 'expression', name: 'Expression', dataCode: 'SSQ=1', category: 'Basic' },
    { id: 'presence', name: 'Presence', dataCode: 'SSR=1', category: 'Basic' },
    { id: 'insight', name: 'Insight', dataCode: 'SSS=1', category: 'Basic' },
    { id: 'persuasion', name: 'Persuasion', dataCode: 'SST=1', category: 'Basic' },

    // Weapon Skills
    { id: 'brawling', name: 'Brawling', dataCode: 'WS1=1', category: 'Weapon' },
    { id: 'throwing', name: 'Throwing', dataCode: 'WS2=1', category: 'Weapon' },
    { id: 'simpleMelee', name: 'Simple Melee Weapons', dataCode: 'WS3=1', category: 'Weapon' },
    { id: 'simpleRanged', name: 'Simple Ranged Weapons', dataCode: 'WS4=1', category: 'Weapon' },
    { id: 'complexMelee', name: 'Complex Melee Weapons', dataCode: 'WS5=1', category: 'Weapon' },
    { id: 'complexRanged', name: 'Complex Ranged Weapons', dataCode: 'WS6=1', category: 'Weapon' },

    // Magic Skills
    { id: 'black', name: 'Black Magic', dataCode: 'YS1=1', category: 'Magic' },
    { id: 'primal', name: 'Primal Magic', dataCode: 'YS2=1', category: 'Magic' },
    { id: 'meta', name: 'Metamagic', dataCode: 'YS3=1', category: 'Magic' },
    { id: 'white', name: 'White Magic', dataCode: 'YS4=1', category: 'Magic' },
    { id: 'mystic', name: 'Mysticism', dataCode: 'YS5=1', category: 'Magic' },
    { id: 'arcane', name: 'Arcane Magic', dataCode: 'YS6=1', category: 'Magic' },

    // Crafting Skills
    { id: 'engineering', name: 'Engineering', dataCode: 'CS1=1', category: 'Crafting' },
    { id: 'fabrication', name: 'Fabrication', dataCode: 'CS2=1', category: 'Crafting' },
    { id: 'alchemy', name: 'Alchemy', dataCode: 'CS3=1', category: 'Crafting' },
    { id: 'cooking', name: 'Cooking', dataCode: 'CS4=1', category: 'Crafting' },
    { id: 'glyphcraft', name: 'Glyphcraft', dataCode: 'CS5=1', category: 'Crafting' },
    { id: 'biosculpting', name: 'Biosculpting', dataCode: 'CS6=1', category: 'Crafting' },
  ];

  // Fetch Extra Training trait from API
  useEffect(() => {
    const fetchExtraTrainingTrait = async () => {
      try {
        const response = await fetch('/api/traits');
        if (!response.ok) throw new Error('Failed to fetch traits');
        const allTraits = await response.json();
        const extraTrait = allTraits.find((t: any) => t.name === 'Extra Training');
        setExtraTrainingTrait(extraTrait);
      } catch (error) {
        console.error('Error fetching Extra Training trait:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExtraTrainingTrait();
  }, []);

  // Calculate available slots and extract selected skills
  useEffect(() => {
    const maxSlots = Math.floor(modulePoints.total / 10);
    setAvailableSlots(maxSlots);

    // Extract already selected skills from existing Extra Training traits
    const selected = new Map<string, SkillOption>();

    if (extraTrainingTrait && traits) {
      const extraTrainings = traits.filter(
        (t) => t.traitId?._id === extraTrainingTrait._id || t.traitId === extraTrainingTrait._id
      );

      extraTrainings.forEach((trait, index) => {
        // Find the selected subchoice for this trait
        const selectedOption = trait.selectedOptions?.[0];
        if (selectedOption?.selectedSubchoice) {
          // Find the subchoice in the trait's options
          for (const option of extraTrainingTrait.options || []) {
            for (const subchoice of option.subchoices || []) {
              if (subchoice._id === selectedOption.selectedSubchoice) {
                // Find the matching skill option by data code
                const skillOption = skillOptions.find(s => s.dataCode === subchoice.data);
                if (skillOption) {
                  selected.set(`slot-${index}`, skillOption);
                }
              }
            }
          }
        }
      });
    }

    setSelectedSkills(selected);
  }, [modulePoints, traits, extraTrainingTrait]);

  const handleAddSkill = async (skillOptionId: string) => {
    if (!extraTrainingTrait) return;

    const skillOption = skillOptions.find(s => s.id === skillOptionId);
    if (!skillOption) return;

    // Find the matching option and subchoice in the trait
    let selectedOptionData: any = null;
    let selectedSubchoiceId: string | null = null;

    for (const option of extraTrainingTrait.options || []) {
      for (const subchoice of option.subchoices || []) {
        if (subchoice.data === skillOption.dataCode) {
          selectedOptionData = option;
          selectedSubchoiceId = subchoice._id;
          break;
        }
      }
      if (selectedSubchoiceId) break;
    }

    if (!selectedOptionData || !selectedSubchoiceId) return;

    try {
      const response = await fetch(`/api/characters/${characterId}/traits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          traitId: extraTrainingTrait._id,
          selectedOptions: [
            {
              name: selectedOptionData.name,
              selectedSubchoice: selectedSubchoiceId,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add Extra Training');
      }

      const updatedCharacter = await response.json();
      onTraitsUpdate(updatedCharacter.traits);
    } catch (error) {
      console.error('Error adding Extra Training:', error);
      alert(error instanceof Error ? error.message : 'Failed to add Extra Training');
    }
  };

  const handleRemoveSkill = async (traitInstanceId: string) => {
    try {
      const response = await fetch(`/api/characters/${characterId}/traits/${traitInstanceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to remove Extra Training');
      }

      const updatedCharacter = await response.json();
      onTraitsUpdate(updatedCharacter.traits);
    } catch (error) {
      console.error('Error removing Extra Training:', error);
      alert('Failed to remove Extra Training');
    }
  };

  const getAvailableSkillsForSlot = (currentSlotId: string): SkillOption[] => {
    const usedSkills = new Set(
      Array.from(selectedSkills.entries())
        .filter(([slotId]) => slotId !== currentSlotId)
        .map(([_, skill]) => skill.id)
    );

    return skillOptions.filter(skill => !usedSkills.has(skill.id));
  };

  const groupSkillsByCategory = (skills: SkillOption[]) => {
    return skills.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, SkillOption[]>);
  };

  if (loading) {
    return <div className="text-center text-cloud">Loading Extra Training...</div>;
  }

  if (!extraTrainingTrait) {
    return (
      <div className="text-center p-4 text-sunset bg-dark-elevated rounded-lg">
        Extra Training trait not found. Please run: npm run reset-traits
      </div>
    );
  }

  if (availableSlots === 0) {
    return (
      <div className="text-center p-4 text-cloud bg-dark-elevated rounded-lg">
        No Extra Training slots available. Earn 10 module points to unlock your first slot.
      </div>
    );
  }

  // Get existing Extra Training trait instances
  const extraTrainingInstances = traits.filter(
    (t) => t.traitId?._id === extraTrainingTrait._id || t.traitId === extraTrainingTrait._id
  );

  return (
    <div className="space-y-3">
      {/* Existing Extra Training selections */}
      {extraTrainingInstances.map((trait, index) => {
        const slotId = `slot-${index}`;
        const selectedSkill = selectedSkills.get(slotId);

        return (
          <div
            key={trait._id || `trait-${index}`}
            className="flex items-center justify-between p-3 bg-dark-elevated rounded-lg"
          >
            <div>
              <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                {selectedSkill?.name || 'Unknown Skill'}
              </div>
              <div style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>
                {selectedSkill?.category} Skill +1
              </div>
            </div>
            <button
              onClick={() => handleRemoveSkill(trait._id)}
              className="px-3 py-1 bg-sunset/20 hover:bg-sunset/30 text-sunset rounded text-sm transition-colors"
            >
              Remove
            </button>
          </div>
        );
      })}

      {/* Add new Extra Training slot */}
      {extraTrainingInstances.length < availableSlots && (
        <div className="p-3 bg-dark-elevated rounded-lg">
          <label className="block text-white font-bold mb-2 text-sm">
            Select a skill to train:
          </label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAddSkill(e.target.value);
                e.target.value = ''; // Reset selection
              }
            }}
            className="w-full px-3 py-2 bg-dark-surface text-white rounded border border-dark-border focus:outline-none focus:border-sat-purple"
            defaultValue=""
          >
            <option value="">Choose a skill...</option>
            {Object.entries(groupSkillsByCategory(getAvailableSkillsForSlot(`slot-${extraTrainingInstances.length}`))).map(
              ([category, skills]) => (
                <optgroup key={category} label={`${category} Skills`}>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </optgroup>
              )
            )}
          </select>
        </div>
      )}

      {/* Summary */}
      <div className="text-sm text-cloud text-center">
        {extraTrainingInstances.length} / {availableSlots} Extra Training slots used
      </div>
    </div>
  );
};

export default ExtraTrainingManager;
