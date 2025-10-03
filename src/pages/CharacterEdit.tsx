import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import StepIndicator from '../components/character/creator/StepIndicator';
import BasicInfoTab from '../components/character/creator/BasicInfoTab';
import AttributesTab from '../components/character/creator/AttributesTab';
import TalentsTab from '../components/character/creator/TalentsTab';
import BackgroundCreatorTab from '../components/character/creator/BackgroundCreatorTab';
import PersonalityCreatorTab from '../components/character/creator/PersonalityCreatorTab';
import { useToast } from '../context/ToastContext';

// Import utility functions and types from the shared files
import { createDefaultCharacter, updateSkillTalentsFromAttributes } from '../utils/characterUtils';
import { Character, Ancestry, Culture, Attributes, Module } from '../types/character';

const CharacterEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showInfo } = useToast();
  const hasShownRecalcToast = React.useRef(false);
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);

  // Tracking for attribute and talent points
  const [attributePointsRemaining, setAttributePointsRemaining] = useState<number>(0);
  const [startingTalents, setStartingTalents] = useState<number>(8);
  const [talentStarsRemaining, setTalentStarsRemaining] = useState<number>(0);
  const [_ancestries, setAncestries] = useState<Ancestry[]>([]);
  const [_cultures, setCultures] = useState<Culture[]>([]);
  const [selectedAncestry, setSelectedAncestry] = useState<Ancestry | null>(null);
  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);
  const [initialCultureSelections, setInitialCultureSelections] = useState<{
    restriction?: any;
    benefit?: any;
    startingItem?: any;
  } | undefined>(undefined);
  const [selectedPersonality, setSelectedPersonality] = useState<string>('');
  const [selectedPersonalityModule, setSelectedPersonalityModule] = useState<Module | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<string>('');
  const [selectedTraitOptions, setSelectedTraitOptions] = useState<any[]>([]);

  // Track invested points to prevent going negative
  const [investedTalentStars, setInvestedTalentStars] = useState<number>(0);

  // Define steps
  const steps = ['Basic Info', 'Attributes', 'Personality & Trait', 'Talents', 'Background'];

  // Initialize character state using the utility function
  const [character, setCharacter] = useState<Character>(createDefaultCharacter(''));

  // Load existing character data
  useEffect(() => {
    const loadCharacterData = async () => {
      try {
        setInitialLoading(true);

        // Fetch the character data
        const charResponse = await fetch(`/api/characters/${id}`);
        if (!charResponse.ok) {
          throw new Error('Failed to fetch character');
        }
        const charData = await charResponse.json();

        // MIGRATION: Initialize baseTalent for old characters that don't have it
        // This fixes characters created before baseTalent tracking was added
        let needsMigration = false;

        // Check weapon skills
        if (charData.weaponSkills) {
          Object.keys(charData.weaponSkills).forEach(skillId => {
            if (charData.weaponSkills[skillId] && charData.weaponSkills[skillId].baseTalent === undefined) {
              console.log(`[MIGRATION] Setting baseTalent for weapon skill ${skillId}: ${charData.weaponSkills[skillId].talent}`);
              charData.weaponSkills[skillId].baseTalent = charData.weaponSkills[skillId].talent;
              needsMigration = true;
            }
          });
        }

        // Check magic skills
        if (charData.magicSkills) {
          Object.keys(charData.magicSkills).forEach(skillId => {
            if (charData.magicSkills[skillId] && charData.magicSkills[skillId].baseTalent === undefined) {
              console.log(`[MIGRATION] Setting baseTalent for magic skill ${skillId}: ${charData.magicSkills[skillId].talent}`);
              charData.magicSkills[skillId].baseTalent = charData.magicSkills[skillId].talent;
              needsMigration = true;
            }
          });
        }

        // Check crafting skills
        if (charData.craftingSkills) {
          Object.keys(charData.craftingSkills).forEach(skillId => {
            if (charData.craftingSkills[skillId] && charData.craftingSkills[skillId].baseTalent === undefined) {
              console.log(`[MIGRATION] Setting baseTalent for crafting skill ${skillId}: ${charData.craftingSkills[skillId].talent}`);
              charData.craftingSkills[skillId].baseTalent = charData.craftingSkills[skillId].talent;
              needsMigration = true;
            }
          });
        }

        if (needsMigration) {
          console.log('[MIGRATION] Character needs baseTalent migration. Will save on next update.');
        }

        // VALIDATION MIGRATION: Check if character's talent spending is valid
        // Calculate what the talent budget should be
        let validationBaseTalentPoints = 8;
        let validationBonusTalentPoints = 0;

        // Parse ancestry for UT bonuses
        if (charData.ancestry?.ancestryId?.options) {
          for (const option of charData.ancestry.ancestryId.options) {
            if (option.data) {
              const utMatch = option.data.match(/UT=(\d+)/);
              if (utMatch) {
                validationBonusTalentPoints += parseInt(utMatch[1]);
              }
            }
          }
        }

        // Parse trait for UT bonuses
        if (charData.traits && charData.traits.length > 0) {
          const traitData = charData.traits[0].traitId;
          if (traitData && traitData.options) {
            for (const option of traitData.options) {
              if (option.data) {
                const utMatch = option.data.match(/UT=(\d+)/);
                if (utMatch) {
                  validationBonusTalentPoints += parseInt(utMatch[1]);
                }
              }
            }
          }
        }

        const validationTotalTalentPoints = validationBaseTalentPoints + validationBonusTalentPoints;

        // Count what was actually spent using baseTalent (now that we've migrated it)
        let validationSpentTalentPoints = 0;
        const validationFreeWeaponTalents: { [key: string]: number } = {
          brawling: 1,
          throwing: 1,
          simpleRangedWeapons: 1,
          simpleMeleeWeapons: 1,
        };

        // Count weapon skills
        if (charData.weaponSkills) {
          Object.entries(charData.weaponSkills).forEach(([skillId, skill]: [string, any]) => {
            const baseTalent = skill?.baseTalent ?? 0;
            const freeTalents = validationFreeWeaponTalents[skillId] || 0;
            if (baseTalent > freeTalents) {
              validationSpentTalentPoints += baseTalent - freeTalents;
            }
          });
        }

        // Count magic skills
        if (charData.magicSkills) {
          Object.values(charData.magicSkills).forEach((skill: any) => {
            const baseTalent = skill?.baseTalent ?? 0;
            validationSpentTalentPoints += baseTalent;
          });
        }

        // Count crafting skills
        if (charData.craftingSkills) {
          Object.values(charData.craftingSkills).forEach((skill: any) => {
            const baseTalent = skill?.baseTalent ?? 0;
            validationSpentTalentPoints += baseTalent;
          });
        }

        const validationRemaining = validationTotalTalentPoints - validationSpentTalentPoints;

        console.log('[VALIDATION] Talent Budget Check:');
        console.log(`  Available: ${validationTotalTalentPoints} (${validationBaseTalentPoints} base + ${validationBonusTalentPoints} bonus)`);
        console.log(`  Spent: ${validationSpentTalentPoints}`);
        console.log(`  Remaining: ${validationRemaining}`);

        if (validationRemaining < 0) {
          console.warn('[VALIDATION] ⚠️ CHARACTER HAS OVERSPENT TALENTS BY', Math.abs(validationRemaining), 'POINTS');
          console.log('[MIGRATION] Auto-correcting overspent talents...');

          // Auto-correct by reducing talents from highest skills first
          let pointsToRemove = Math.abs(validationRemaining);
          const skillsToAdjust: Array<{type: string, id: string, current: number, free: number}> = [];

          // Collect all skills that have spent points
          if (charData.weaponSkills) {
            Object.entries(charData.weaponSkills).forEach(([skillId, skill]: [string, any]) => {
              const baseTalent = skill?.baseTalent ?? 0;
              const freeTalents = validationFreeWeaponTalents[skillId] || 0;
              if (baseTalent > freeTalents) {
                skillsToAdjust.push({
                  type: 'weapon',
                  id: skillId,
                  current: baseTalent,
                  free: freeTalents
                });
              }
            });
          }

          if (charData.magicSkills) {
            Object.entries(charData.magicSkills).forEach(([skillId, skill]: [string, any]) => {
              const baseTalent = skill?.baseTalent ?? 0;
              if (baseTalent > 0) {
                skillsToAdjust.push({
                  type: 'magic',
                  id: skillId,
                  current: baseTalent,
                  free: 0
                });
              }
            });
          }

          if (charData.craftingSkills) {
            Object.entries(charData.craftingSkills).forEach(([skillId, skill]: [string, any]) => {
              const baseTalent = skill?.baseTalent ?? 0;
              if (baseTalent > 0) {
                skillsToAdjust.push({
                  type: 'crafting',
                  id: skillId,
                  current: baseTalent,
                  free: 0
                });
              }
            });
          }

          // Sort by current value (highest first)
          skillsToAdjust.sort((a, b) => (b.current - b.free) - (a.current - a.free));

          // Remove points from highest skills first
          for (const skill of skillsToAdjust) {
            if (pointsToRemove <= 0) break;

            const spentInSkill = skill.current - skill.free;
            const toRemove = Math.min(spentInSkill, pointsToRemove);
            const newBaseTalent = skill.current - toRemove;

            console.log(`[MIGRATION] Reducing ${skill.type} skill ${skill.id}: ${skill.current} -> ${newBaseTalent}`);

            if (skill.type === 'weapon') {
              charData.weaponSkills[skill.id].baseTalent = newBaseTalent;
              charData.weaponSkills[skill.id].talent = newBaseTalent; // Also update talent to match
            } else if (skill.type === 'magic') {
              charData.magicSkills[skill.id].baseTalent = newBaseTalent;
              charData.magicSkills[skill.id].talent = newBaseTalent;
            } else if (skill.type === 'crafting') {
              charData.craftingSkills[skill.id].baseTalent = newBaseTalent;
              charData.craftingSkills[skill.id].talent = newBaseTalent;
            }

            pointsToRemove -= toRemove;
          }

          console.log('[MIGRATION] Auto-correction complete. Character will save corrected values on update.');
          needsMigration = true;

          // Show toast notification only once
          if (!hasShownRecalcToast.current) {
            hasShownRecalcToast.current = true;
            showInfo(`Talents recalculated - adjusted ${Math.abs(validationRemaining)} overspent talent points`);
          }
        } else if (validationRemaining > 0) {
          console.log('[VALIDATION] ✅ Character has', validationRemaining, 'unspent talent points (valid)');
        } else {
          console.log('[VALIDATION] ✅ Character talent budget is perfectly balanced');
        }

        // Set the character state with the loaded data (including migrated baseTalent)
        setCharacter(charData);

        // Calculate attribute points remaining
        const totalAttributePoints = 6 + (charData.additionalAttributePoints || 0);
        const spentAttributePoints = Object.values(charData.attributes as Attributes).reduce(
          (sum: number, val: number) => sum + (val - 1),
          0
        );
        setAttributePointsRemaining(totalAttributePoints - spentAttributePoints);

        // Calculate talent stars remaining
        const baseTalentPoints = 8;

        // Calculate bonus talent points from ancestry and traits (UT=X in data)
        let bonusTalentPoints = 0;

        console.log('=== TALENT CALCULATION DEBUG ===');
        console.log('Character ID:', charData._id);
        console.log('Character Name:', charData.name);
        console.log('Base Talent Points:', baseTalentPoints);

        // Parse ancestry options for UT bonuses
        if (charData.ancestry?.ancestryId?.options) {
          console.log('Ancestry:', charData.ancestry.ancestryId.name);
          for (const option of charData.ancestry.ancestryId.options) {
            if (option.data) {
              const utMatch = option.data.match(/UT=(\d+)/);
              if (utMatch) {
                const bonus = parseInt(utMatch[1]);
                console.log(`  - ${option.name}: +${bonus} talent points (${option.data})`);
                bonusTalentPoints += bonus;
              }
            }
          }
        }

        // Parse trait options for UT bonuses
        if (charData.traits && charData.traits.length > 0) {
          const traitData = charData.traits[0].traitId;
          if (traitData && traitData.options) {
            console.log('Trait:', traitData.name);
            for (const option of traitData.options) {
              if (option.data) {
                const utMatch = option.data.match(/UT=(\d+)/);
                if (utMatch) {
                  const bonus = parseInt(utMatch[1]);
                  console.log(`  - ${option.name}: +${bonus} talent points (${option.data})`);
                  bonusTalentPoints += bonus;
                }
              }
            }
          }
        }

        console.log('Total Bonus Talent Points from Ancestry/Traits:', bonusTalentPoints);
        const totalTalentPoints = baseTalentPoints + bonusTalentPoints;
        console.log('Total Available Talent Points:', totalTalentPoints);

        let spentTalentPoints = 0;

        // Count spent talent points from weapon skills (excluding free talents)
        const freeWeaponTalents: { [key: string]: number } = {
          brawling: 1,
          throwing: 1,
          simpleRangedWeapons: 1,
          simpleMeleeWeapons: 1,
        };

        console.log('\nWeapon Skills:');
        if (charData.weaponSkills) {
          Object.entries(charData.weaponSkills).forEach(([skillId, skill]: [string, any]) => {
            // Use baseTalent (without module bonuses) for character creation point tracking
            const baseTalent = skill?.baseTalent ?? skill?.talent ?? 0;
            const currentTalent = skill?.talent ?? 0;
            const freeTalents = freeWeaponTalents[skillId] || 0;
            if (baseTalent > 0 || currentTalent > 0) {
              const spent = Math.max(0, baseTalent - freeTalents);
              console.log(`  ${skillId}: baseTalent=${baseTalent}, talent=${currentTalent}, free=${freeTalents}, spent=${spent}`);
              spentTalentPoints += spent;
            }
          });
        }

        // Count spent talent points from magic skills
        console.log('\nMagic Skills:');
        if (charData.magicSkills) {
          Object.entries(charData.magicSkills).forEach(([skillId, skill]: [string, any]) => {
            // Use baseTalent (without module bonuses) for character creation point tracking
            const baseTalent = skill?.baseTalent ?? skill?.talent ?? 0;
            const currentTalent = skill?.talent ?? 0;
            if (baseTalent > 0 || currentTalent > 0) {
              console.log(`  ${skillId}: baseTalent=${baseTalent}, talent=${currentTalent}, spent=${baseTalent}`);
              spentTalentPoints += baseTalent;
            }
          });
        }

        // Count spent talent points from crafting skills
        console.log('\nCrafting Skills:');
        if (charData.craftingSkills) {
          Object.entries(charData.craftingSkills).forEach(([skillId, skill]: [string, any]) => {
            // Use baseTalent (without module bonuses) for character creation point tracking
            const baseTalent = skill?.baseTalent ?? skill?.talent ?? 0;
            const currentTalent = skill?.talent ?? 0;
            if (baseTalent > 0 || currentTalent > 0) {
              console.log(`  ${skillId}: baseTalent=${baseTalent}, talent=${currentTalent}, spent=${baseTalent}`);
              spentTalentPoints += baseTalent;
            }
          });
        }

        console.log('\nTotal Spent Talent Points:', spentTalentPoints);
        console.log('Remaining Talent Points:', totalTalentPoints - spentTalentPoints);
        console.log('=== END TALENT CALCULATION ===\n');

        setInvestedTalentStars(spentTalentPoints);
        setStartingTalents(totalTalentPoints);
        setTalentStarsRemaining(totalTalentPoints - spentTalentPoints);

        // Set selected race/culture/personality
        if (charData.culture) {
          setSelectedCulture(charData.culture);
        }

        // Find and set personality module from character's modules
        if (charData.modules && Array.isArray(charData.modules)) {
          // Fetch personality modules to find which one the character has
          try {
            const personalityModulesResponse = await fetch('/api/modules?type=personality');
            if (personalityModulesResponse.ok) {
              const personalityModules = await personalityModulesResponse.json();

              // Find which personality module the character has
              for (const charModule of charData.modules) {
                const personalityModule = personalityModules.find(
                  (pm: any) => pm._id === charModule.moduleId || pm._id === charModule.moduleId._id
                );

                if (personalityModule) {
                  setSelectedPersonality(personalityModule.name);
                  setSelectedPersonalityModule(personalityModule);
                  break;
                }
              }
            }
          } catch (err) {
            console.error('Error fetching personality modules:', err);
          }
        }

        // Load the character's selected trait
        if (charData.traits && charData.traits.length > 0) {
          const trait = charData.traits[0];
          if (trait.traitId) {
            setSelectedTrait(typeof trait.traitId === 'string' ? trait.traitId : trait.traitId._id);
            setSelectedTraitOptions(trait.selectedOptions || []);
          }
        }

        // Fetch ancestries and cultures for dropdowns
        const ancestryResponse = await fetch('/api/ancestries');
        if (!ancestryResponse.ok) {
          throw new Error('Failed to fetch ancestries');
        }
        const ancestryData = await ancestryResponse.json();
        setAncestries(ancestryData);

        // Find and set the selected ancestry with subchoice selections
        const ancestryByName = charData.race
          ? ancestryData.find((a: Ancestry) => a.name === charData.race)
          : undefined;
        const ancestryId = charData.ancestry?.ancestryId && typeof charData.ancestry.ancestryId !== 'string'
          ? charData.ancestry.ancestryId._id
          : (typeof charData.ancestry?.ancestryId === 'string' ? charData.ancestry?.ancestryId : undefined);
        const ancestryById = ancestryId
          ? ancestryData.find((a: any) => a._id === ancestryId)
          : undefined;
        const ancestry = ancestryById || ancestryByName;
        if (ancestry) {
          // If we have saved ancestry data with subchoices, apply them
          if (charData.ancestry && charData.ancestry.selectedOptions) {
            const ancestryWithSubchoices = {
              ...ancestry,
              options: ancestry.options.map((option: any) => {
                const savedOption = charData.ancestry.selectedOptions.find(
                  (saved: any) => saved.name === option.name
                );
                return {
                  ...option,
                  selectedSubchoice: savedOption?.selectedSubchoice || undefined,
                };
              }),
            };
            setSelectedAncestry(ancestryWithSubchoices);
          } else {
            setSelectedAncestry(ancestry);
          }
        }

        const cultureResponse = await fetch('/api/cultures');
        if (!cultureResponse.ok) {
          throw new Error('Failed to fetch cultures');
        }
        const cultureData = await cultureResponse.json();
        setCultures(cultureData);

        // Find and set the selected culture
        if (charData.culture || (charData.characterCulture && charData.characterCulture.cultureId)) {
          // Prefer matching by populated characterCulture if available
          let culture: any = null;
          if (charData.characterCulture && charData.characterCulture.cultureId) {
            const cultureId = typeof charData.characterCulture.cultureId === 'string'
              ? charData.characterCulture.cultureId
              : charData.characterCulture.cultureId._id;
            culture = cultureData.find((c: any) => c._id === cultureId);
          }
          if (!culture && charData.culture) {
            culture = cultureData.find((c: Culture) => c.name === charData.culture);
          }
          if (culture) {
            setSelectedCulture(culture);

            // Seed initial selections from saved characterCulture
            const sel = charData.characterCulture || {};
            const restriction = sel.selectedRestriction
              ? (culture.culturalRestrictions || []).find((r: any) => r.name === (sel.selectedRestriction.name || sel.selectedRestriction)) || sel.selectedRestriction
              : undefined;
            const benefit = sel.selectedBenefit
              ? (culture.benefits || []).find((b: any) => b.name === (sel.selectedBenefit.name || sel.selectedBenefit)) || sel.selectedBenefit
              : undefined;
            const startingItem = sel.selectedStartingItem
              ? (culture.startingItems || []).find((s: any) => s.name === (sel.selectedStartingItem.name || sel.selectedStartingItem)) || sel.selectedStartingItem
              : undefined;
            setInitialCultureSelections({
              restriction,
              benefit,
              startingItem,
            });
          }
        }

        setInitialLoading(false);
      } catch (err) {
        console.error('Error loading character data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load character');
        setInitialLoading(false);
      }
    };

    if (id) {
      loadCharacterData();
    }
  }, [id]);

  // Recalculate talent budget when trait changes
  useEffect(() => {
    if (!selectedTrait || !character._id) return; // Don't run during initial load

    const recalculateTalentBudget = async () => {
      try {
        // Fetch the trait data to get UT bonuses
        const traitResponse = await fetch(`/api/traits/${selectedTrait}`);
        if (!traitResponse.ok) {
          console.error('Failed to fetch trait data for talent recalculation');
          return;
        }
        const traitData = await traitResponse.json();

        // Calculate base talent points
        const baseTalentPoints = 8;
        let bonusTalentPoints = 0;

        // Parse ancestry for UT bonuses
        // Note: ancestryId can be populated (Ancestry object) or just a string ID
        const ancestryData = character.ancestry?.ancestryId as any;
        if (ancestryData && typeof ancestryData === 'object' && ancestryData.options) {
          for (const option of ancestryData.options) {
            if (option.data) {
              const utMatch = option.data.match(/UT=(\d+)/);
              if (utMatch) {
                bonusTalentPoints += parseInt(utMatch[1]);
              }
            }
          }
        }

        // Parse new trait for UT bonuses
        if (traitData.options) {
          for (const option of traitData.options) {
            if (option.data) {
              const utMatch = option.data.match(/UT=(\d+)/);
              if (utMatch) {
                bonusTalentPoints += parseInt(utMatch[1]);
              }
            }
          }
        }

        const totalTalentPoints = baseTalentPoints + bonusTalentPoints;

        console.log('[TRAIT CHANGE] Recalculating talent budget:');
        console.log(`  New trait: ${traitData.name}`);
        console.log(`  Bonus talents: ${bonusTalentPoints}`);
        console.log(`  Total available: ${totalTalentPoints}`);

        // Recalculate spent points (this doesn't change, but we need it for remaining)
        let spentTalentPoints = 0;
        const freeWeaponTalents: { [key: string]: number } = {
          brawling: 1,
          throwing: 1,
          simpleRangedWeapons: 1,
          simpleMeleeWeapons: 1,
        };

        if (character.weaponSkills) {
          Object.entries(character.weaponSkills).forEach(([skillId, skill]: [string, any]) => {
            const baseTalent = skill?.baseTalent ?? skill?.talent ?? 0;
            const freeTalents = freeWeaponTalents[skillId] || 0;
            if (baseTalent > freeTalents) {
              spentTalentPoints += baseTalent - freeTalents;
            }
          });
        }

        if (character.magicSkills) {
          Object.values(character.magicSkills).forEach((skill: any) => {
            const baseTalent = skill?.baseTalent ?? skill?.talent ?? 0;
            spentTalentPoints += baseTalent;
          });
        }

        if (character.craftingSkills) {
          Object.values(character.craftingSkills).forEach((skill: any) => {
            const baseTalent = skill?.baseTalent ?? skill?.talent ?? 0;
            spentTalentPoints += baseTalent;
          });
        }

        console.log(`  Spent: ${spentTalentPoints}`);
        console.log(`  Remaining: ${totalTalentPoints - spentTalentPoints}`);

        // Update the state
        setStartingTalents(totalTalentPoints);
        setTalentStarsRemaining(totalTalentPoints - spentTalentPoints);
      } catch (err) {
        console.error('Error recalculating talent budget:', err);
      }
    };

    recalculateTalentBudget();
  }, [selectedTrait]); // Only recalculate when trait changes, not when skills change

  const handleCultureChange = (cultureName: string, culture: Culture) => {
    // Keep legacy field in sync
    updateCharacter('culture', cultureName);

    // Persist new-format culture selections for export
    updateCharacter('characterCulture', {
      cultureId: (culture as any)._id,
      selectedRestriction: (culture as any).selectedRestriction || null,
      selectedBenefit: (culture as any).selectedBenefit || null,
      selectedStartingItem: (culture as any).selectedStartingItem || null,
    });

    setSelectedCulture(culture);
  };

  const handlePersonalitySelect = (personalityName: string, personalityModule: Module) => {
    setSelectedPersonality(personalityName);
    setSelectedPersonalityModule(personalityModule);
  };

  const handleRaceChange = (raceName: string, ancestry: Ancestry) => {
    updateCharacter('race', raceName);
    setSelectedAncestry(ancestry);
  };

  // Update basic character field
  const updateCharacter = (field: keyof Character, value: any) => {
    setCharacter((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Update attributes with validation
  const updateAttribute = (attribute: keyof Attributes, newValue: number) => {
    const currentValue = character.attributes[attribute];
    const change = newValue - currentValue;

    if (newValue < 1 || newValue > 6) {
      return;
    }

    if (change > 0 && attributePointsRemaining <= 0) {
      return;
    }

    if (change < 0 && attributePointsRemaining >= 6) {
      return;
    }

    setCharacter((prev) => {
      const updatedCharacter = {
        ...prev,
        attributes: {
          ...prev.attributes,
          [attribute]: newValue,
        },
      };
      return updateSkillTalentsFromAttributes(updatedCharacter);
    });

    setAttributePointsRemaining((prev) => prev - change);
  };

  // Update weapon skill talent
  const updateWeaponSkillTalent = (skillId: string, newTalent: number) => {
    if (newTalent < 0 || newTalent > 4) {
      return;
    }

    const oldTalent = character.weaponSkills[skillId]?.talent || 0;
    const starDifference = oldTalent - newTalent;

    if (talentStarsRemaining + starDifference < 0) {
      return;
    }

    setCharacter((prev) => ({
      ...prev,
      weaponSkills: {
        ...prev.weaponSkills,
        [skillId]: {
          ...(prev.weaponSkills[skillId] || { value: 0 }),
          talent: newTalent,
        },
      },
    }));

    setTalentStarsRemaining((prev) => prev + starDifference);
  };

  // Update magic skill talent
  const updateMagicSkillTalent = (skillId: string, newTalent: number) => {
    if (newTalent < 0 || newTalent > 4) {
      return;
    }

    const oldTalent = character.magicSkills[skillId]?.talent || 0;
    const starDifference = oldTalent - newTalent;

    if (talentStarsRemaining + starDifference < 0) {
      return;
    }

    setCharacter((prev) => ({
      ...prev,
      magicSkills: {
        ...prev.magicSkills,
        [skillId]: {
          ...(prev.magicSkills[skillId] || { value: 0 }),
          talent: newTalent,
        },
      },
    }));

    setTalentStarsRemaining((prev) => prev + starDifference);
  };

  // Update crafting skill talent
  const updateCraftingSkillTalent = (skillId: string, newTalent: number) => {
    if (newTalent < 0 || newTalent > 4) {
      return;
    }

    const oldTalent = character.craftingSkills[skillId]?.talent || 0;
    const starDifference = oldTalent - newTalent;

    if (talentStarsRemaining + starDifference < 0) {
      return;
    }

    setCharacter((prev) => ({
      ...prev,
      craftingSkills: {
        ...prev.craftingSkills,
        [skillId]: {
          ...(prev.craftingSkills[skillId] || { value: 0 }),
          talent: newTalent,
        },
      },
    }));

    setTalentStarsRemaining((prev) => prev + starDifference);
  };

  // Validate the current step
  const validateStep = (): boolean => {
    setError(null);

    switch (step) {
      case 1:
        if (!character.name.trim()) {
          setError('Character name is required');
          return false;
        }
        if (!character.race) {
          setError('Please select a race');
          return false;
        }
        if (!character.culture) {
          setError('Please select a culture');
          return false;
        }
        return true;

      case 2:
        // Check if all attribute points have been spent
        if (attributePointsRemaining > 0) {
          setError(`You still have ${attributePointsRemaining} attribute points to spend`);
          return false;
        }
        return true;

      case 3:
        // Step 3 is Personality & Trait selection
        if (!selectedPersonality) {
          setError('Please select a personality for your character');
          return false;
        }
        return true;

      case 4:
        // Step 4 is Talent assignment - check if all talent stars have been spent
        if (talentStarsRemaining > 0) {
          setError(`You still have ${talentStarsRemaining} talent stars to assign`);
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handlePortraitUpdate = (file: File) => {
    setPortraitFile(file);
  };

  const handleTraitSelect = (traitId: string, selectedOptions?: any[]) => {
    setSelectedTrait(traitId);
    setSelectedTraitOptions(selectedOptions || []);

    // Trigger recalculation of talent budget when trait changes
    // This will be handled by the useEffect that watches selectedTrait
  };

  const handleStartingTalentsChange = (newStartingTalents: number) => {
    // Prevent reducing below invested amount
    if (newStartingTalents < investedTalentStars) {
      setError(`Cannot reduce talent points below ${investedTalentStars} (already invested)`);
      return;
    }
    const currentSpentTalents = startingTalents - talentStarsRemaining;
    setStartingTalents(newStartingTalents);
    setTalentStarsRemaining(newStartingTalents - currentSpentTalents);
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      // Prepare ancestry data (all 3 options are automatically selected)
      const ancestryData = selectedAncestry
        ? {
            ancestryId: selectedAncestry._id,
            selectedOptions: selectedAncestry.options.map((option) => ({
              name: option.name,
              selectedSubchoice: option.selectedSubchoice || null,
            })),
          }
        : null;

      // Prepare culture data with explicit selections
      const cultureData = selectedCulture
        ? {
            cultureId: selectedCulture._id,
            selectedRestriction: (selectedCulture as any).selectedRestriction || null,
            selectedBenefit: (selectedCulture as any).selectedBenefit || null,
            selectedStartingItem: (selectedCulture as any).selectedStartingItem || null,
          }
        : null;

      // Handle module updates - keep all existing modules except personality
      const updatedModules = [];
      let modulePointRefund = 0;

      // First, get all personality module IDs and their data to filter them out
      const personalityModulesMap = new Map();
      try {
        const personalityModulesResponse = await fetch('/api/modules?type=personality');
        if (personalityModulesResponse.ok) {
          const personalityModules = await personalityModulesResponse.json();
          personalityModules.forEach((pm: any) => {
            personalityModulesMap.set(pm._id, pm);
          });
        }
      } catch (err) {
        console.error('Error fetching personality modules:', err);
      }

      // Keep all non-personality modules from the character and calculate refund

      if (character.modules && Array.isArray(character.modules)) {
        character.modules.forEach((module: any) => {
          // Handle nested module structure - the actual module data might be in module.moduleId
          const moduleData = module.moduleId || module;
          const moduleId = moduleData._id || moduleData;

          // Check if this is a personality module
          const personalityModule = personalityModulesMap.get(moduleId);
          if (personalityModule) {
            // Calculate refund for the old personality module
            if (module.selectedOptions && Array.isArray(module.selectedOptions)) {
              module.selectedOptions.forEach((selectedOption: any) => {
                // Find the option in the module to get its cost
                const moduleOption = personalityModule.options.find(
                  (opt: any) => opt.location === selectedOption.location
                );
                if (moduleOption) {
                  // All module options cost 1 point (except tier 1 which is free)
                  const cost = selectedOption.location === '1' ? 0 : 1;
                  if (cost > 0) {
                    modulePointRefund += cost;
                  }
                }
              });
            }
          } else {
            // Keep non-personality modules
            updatedModules.push(module);
          }
        });
      }

      // Add the newly selected personality module
      if (selectedPersonalityModule) {
        const tier1Option = selectedPersonalityModule.options.find(
          (option) => option.location === '1'
        );

        if (tier1Option) {
          updatedModules.push({
            moduleId: selectedPersonalityModule._id,
            selectedOptions: [
              {
                location: '1',
                selectedAt: new Date().toISOString(),
              },
            ],
          });
        }
      }

      // Transform the character data for the API
      const characterData = {
        name: character.name,
        race: character.race,
        culture: character.culture,
        ancestry: ancestryData,
        characterCulture: cultureData,
        attributes: character.attributes,
        skills: character.skills,
        weaponSkills: character.weaponSkills,
        magicSkills: character.magicSkills,
        craftingSkills: character.craftingSkills,
        modulePoints: {
          total: character.modulePoints.total,
          spent: Math.max(0, (character.modulePoints.spent || 0) - modulePointRefund),
        },
        level: character.level,
        biography: character.biography,
        appearance: character.appearance,
        physicalTraits: character.physicalTraits,
        characterCreation: {
          attributePointsRemaining: attributePointsRemaining,
          talentStarsRemaining: talentStarsRemaining,
        },
        modules: updatedModules,
        traits: selectedTrait
          ? [
              {
                traitId: selectedTrait,
                selectedOptions: selectedTraitOptions,
                dateAdded: new Date().toISOString(),
              },
            ]
          : [],
      };

      const response = await fetch(`/api/characters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(characterData),
      });

      if (!response.ok) {
        throw new Error('Failed to update character');
      }

      await response.json();

      // Now upload portrait if one was selected
      if (portraitFile) {
        try {
          const formData = new FormData();
          formData.append('portrait', portraitFile);

          const portraitResponse = await fetch(`/api/portraits/${id}/portrait`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });

          if (!portraitResponse.ok) {
            console.warn('Failed to upload portrait, but character was updated');
          }
        } catch (portraitErr) {
          console.error('Error uploading portrait:', portraitErr);
        }
      }

      // Redirect to character view
      navigate(`/characters/${id}`);
    } catch (err) {
      console.error('Error updating character:', err);
      setError(err instanceof Error ? err.message : 'Failed to update character');
      setIsLoading(false);
    }
  };

  // Loading state
  if (initialLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
        }}
      >
        <div className="loading-spinner" style={{ marginBottom: '1rem' }}></div>
        <div style={{ color: 'var(--color-cloud)' }}>Loading character data...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
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
            color: 'var(--color-metal-gold)',
            fontSize: '2rem',
            fontWeight: 'bold',
          }}
        >
          Edit Character
        </h1>
        <Link to={`/characters/${id}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={step} steps={steps} />

      {/* Error Message */}
      {error && (
        <div
          style={{
            backgroundColor: 'rgba(152, 94, 109, 0.2)',
            border: '1px solid var(--color-stormy)',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem',
            color: 'var(--color-white)',
          }}
        >
          {error}
        </div>
      )}

      {/* Content */}
      <Card style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--color-white)',
            }}
          >
            {steps[step - 1]}
          </h2>
        </CardHeader>
        <CardBody>
          {step === 1 && (
            <BasicInfoTab
              name={character.name}
              race={character.race}
              culture={character.culture || (selectedCulture?.name || '')}
              startingTalents={startingTalents}
              onNameChange={(name) => updateCharacter('name', name)}
              onRaceChange={handleRaceChange}
              onCultureChange={handleCultureChange}
              onStartingTalentsChange={handleStartingTalentsChange}
              hideModulePoints={true}
              selectedAncestry={selectedAncestry}
              selectedCultureSelections={initialCultureSelections}
            />
          )}
          {step === 2 && (
            <AttributesTab
              attributes={character.attributes}
              attributePointsRemaining={attributePointsRemaining}
              onUpdateAttribute={updateAttribute}
            />
          )}
          {step === 3 && (
            <PersonalityCreatorTab
              selectedPersonality={selectedPersonality || ''}
              selectedTrait={selectedTrait}
              selectedTraitOptions={selectedTraitOptions}
              onSelectPersonality={handlePersonalitySelect}
              onSelectTrait={handleTraitSelect}
            />
          )}
          {step === 4 && (
            <TalentsTab
              weaponSkills={character.weaponSkills}
              magicSkills={character.magicSkills}
              craftingSkills={character.craftingSkills}
              talentStarsRemaining={talentStarsRemaining}
              onUpdateSpecializedSkillTalent={updateWeaponSkillTalent}
              onUpdateMagicSkillTalent={updateMagicSkillTalent}
              onUpdateCraftingSkillTalent={updateCraftingSkillTalent}
            />
          )}
          {step === 5 && (
            <BackgroundCreatorTab
              physicalTraits={character.physicalTraits || { height: '', weight: '', gender: '' }}
              appearance={character.appearance || ''}
              biography={character.biography || ''}
              name={character.name}
              race={character.race}
              culture={character.culture}
              modulePoints={character.modulePoints || { total: 0, spent: 0 }}
              attributes={character.attributes}
              portraitFile={portraitFile}
              onUpdatePhysicalTrait={(trait, value) => {
                updateCharacter('physicalTraits', {
                  ...character.physicalTraits,
                  [trait]: value,
                });
              }}
              onUpdateAppearance={(value) => updateCharacter('appearance', value)}
              onUpdateBiography={(value) => updateCharacter('biography', value)}
              onUpdatePortrait={handlePortraitUpdate}
            />
          )}
        </CardBody>
      </Card>

      {/* Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          {step > 1 && (
            <Button variant="outline" onClick={handlePrevStep}>
              Previous
            </Button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {step < steps.length ? (
            <Button variant="primary" onClick={handleNextStep}>
              Next
            </Button>
          ) : (
            <Button variant="accent" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Character'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterEdit;
