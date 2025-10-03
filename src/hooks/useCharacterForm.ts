import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Character, Ancestry, Culture, Attributes, Module } from '../types/character';
import {
  createDefaultCharacter,
  updateSkillTalentsFromAttributes
} from '../utils/characterUtils';
import {
  calculateTalentBudget,
  calculateSpentTalents,
  validateTalentAllocation,
  autoCorrectOverspentTalents
} from '../utils/talentCalculations';
import {
  runAllMigrations
} from '../utils/characterMigrations';
import {
  validateStep,
  validateAttributeChange,
  validateTalentChange,
  StepValidationContext
} from '../validators/characterValidators';
import {
  BASE_ATTRIBUTE_POINTS,
  CHARACTER_STEPS
} from '../constants/character';

export interface CharacterFormState {
  // Core character state
  character: Character;
  step: number;
  isLoading: boolean;
  initialLoading: boolean;
  error: string | null;
  portraitFile: File | null;

  // Points tracking
  attributePointsRemaining: number;
  talentStarsRemaining: number;
  startingTalents: number;
  investedTalentStars: number;

  // Selection state
  selectedAncestry: Ancestry | null;
  selectedCulture: Culture | null;
  selectedPersonality: string;
  selectedPersonalityModule: Module | null;
  selectedTrait: string;
  selectedTraitOptions: any[];

  // Data lists
  ancestries: Ancestry[];
  cultures: Culture[];
  initialCultureSelections?: {
    restriction?: any;
    benefit?: any;
    startingItem?: any;
  };
}

export interface CharacterFormHandlers {
  // Basic updates
  updateCharacter: (field: keyof Character, value: any) => void;
  updateAttribute: (attribute: keyof Attributes, newValue: number) => void;
  updateWeaponSkillTalent: (skillId: string, newTalent: number) => void;
  updateMagicSkillTalent: (skillId: string, newTalent: number) => void;
  updateCraftingSkillTalent: (skillId: string, newTalent: number) => void;

  // Selection handlers
  handleRaceChange: (raceName: string, ancestry: Ancestry) => void;
  handleCultureChange: (cultureName: string, culture: Culture) => void;
  handlePersonalitySelect: (personalityName: string, personalityModule: Module) => void;
  handleTraitSelect: (traitId: string, selectedOptions?: any[]) => void;
  handlePortraitUpdate: (file: File) => void;
  handleStartingTalentsChange: (newStartingTalents: number) => void;

  // Navigation
  handleNextStep: () => void;
  handlePrevStep: () => void;
  handleSubmit: () => Promise<void>;

  // Validation
  validateCurrentStep: () => boolean;

  // Recalculation
  recalculateTalentBudget: () => void;
}

export function useCharacterForm(mode: 'create' | 'edit', characterId?: string) {
  const navigate = useNavigate();
  const { showInfo, showError } = useToast();
  const hasShownRecalcToast = useRef(false);

  // Initialize state
  const [state, setState] = useState<CharacterFormState>({
    character: createDefaultCharacter(mode === 'create' ? 'test-user-id' : ''),
    step: 1,
    isLoading: false,
    initialLoading: mode === 'edit',
    error: null,
    portraitFile: null,
    attributePointsRemaining: mode === 'create' ? BASE_ATTRIBUTE_POINTS : 0,
    talentStarsRemaining: mode === 'create' ? 8 : 0,
    startingTalents: 8,
    investedTalentStars: 0,
    selectedAncestry: null,
    selectedCulture: null,
    selectedPersonality: '',
    selectedPersonalityModule: null,
    selectedTrait: '',
    selectedTraitOptions: [],
    ancestries: [],
    cultures: [],
    initialCultureSelections: undefined
  });

  // Load character data for edit mode
  useEffect(() => {
    if (mode === 'edit' && characterId) {
      loadCharacterData(characterId);
    } else if (mode === 'create') {
      loadCreateData();
    }
  }, [mode, characterId]);

  // Recalculate talent budget when trait changes
  useEffect(() => {
    if (!state.selectedTrait || !state.character._id) return;

    const recalculateTalentBudgetForTrait = async () => {
      try {
        const traitResponse = await fetch(`/api/traits/${state.selectedTrait}`);
        if (!traitResponse.ok) {
          console.error('Failed to fetch trait data for talent recalculation');
          return;
        }
        const traitData = await traitResponse.json();

        // Create a temporary character with the new trait for calculation
        const tempCharacter = {
          ...state.character,
          traits: [{
            traitId: traitData,
            selectedOptions: state.selectedTraitOptions
          }]
        } as any; // Cast to any since trait format is for calculation only

        const budget = calculateTalentBudget(tempCharacter);
        const spent = calculateSpentTalents(tempCharacter);

        console.log('[TRAIT CHANGE] Recalculating talent budget:');
        console.log(`  New trait: ${traitData.name}`);
        console.log(`  Total available: ${budget.total}`);
        console.log(`  Spent: ${spent}`);
        console.log(`  Remaining: ${budget.total - spent}`);

        setState(prev => ({
          ...prev,
          startingTalents: budget.total,
          talentStarsRemaining: budget.total - spent
        }));
      } catch (err) {
        console.error('Error recalculating talent budget:', err);
      }
    };

    recalculateTalentBudgetForTrait();
  }, [state.selectedTrait]);

  const loadCreateData = async () => {
    try {
      const [ancestryResponse, cultureResponse] = await Promise.all([
        fetch('/api/ancestries'),
        fetch('/api/cultures')
      ]);

      if (!ancestryResponse.ok || !cultureResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const ancestryData = await ancestryResponse.json();
      const cultureData = await cultureResponse.json();

      setState(prev => ({
        ...prev,
        ancestries: ancestryData,
        cultures: cultureData
      }));
    } catch (err) {
      showError('Failed to load character creation data');
    }
  };

  const loadCharacterData = async (id: string) => {
    try {
      setState(prev => ({ ...prev, initialLoading: true }));

      const charResponse = await fetch(`/api/characters/${id}`);
      if (!charResponse.ok) {
        throw new Error('Failed to fetch character');
      }
      const charData = await charResponse.json();

      // Run migrations
      runAllMigrations(charData);

      // Handle talent validation and correction
      const validation = validateTalentAllocation(charData);
      if (!validation.isValid && validation.overspent > 0) {
        console.warn('[VALIDATION] Character has overspent talents by', validation.overspent);
        const corrections = autoCorrectOverspentTalents(charData, validation.overspent);

        if (!hasShownRecalcToast.current) {
          hasShownRecalcToast.current = true;
          showInfo(`Talents recalculated - adjusted ${validation.overspent} overspent talent points`);
        }

        console.log('[MIGRATION] Auto-corrected talents:', corrections);
      }

      // Calculate points
      const totalAttributePoints = BASE_ATTRIBUTE_POINTS + (charData.additionalAttributePoints || 0);
      const spentAttributePoints = Object.values(charData.attributes as Attributes).reduce(
        (sum: number, val: number) => sum + (val - 1),
        0
      );

      const budget = calculateTalentBudget(charData);
      const spentTalents = calculateSpentTalents(charData);

      // Load ancestries and cultures
      const [ancestryResponse, cultureResponse] = await Promise.all([
        fetch('/api/ancestries'),
        fetch('/api/cultures')
      ]);

      const ancestryData = await ancestryResponse.json();
      const cultureData = await cultureResponse.json();

      // Find selected ancestry and culture
      let selectedAncestry = null;
      let selectedCulture = null;

      if (charData.ancestry?.ancestryId) {
        const ancestryId = typeof charData.ancestry.ancestryId === 'string'
          ? charData.ancestry.ancestryId
          : charData.ancestry.ancestryId._id;
        selectedAncestry = ancestryData.find((a: any) => a._id === ancestryId);
      }

      if (charData.characterCulture?.cultureId) {
        const cultureId = typeof charData.characterCulture.cultureId === 'string'
          ? charData.characterCulture.cultureId
          : charData.characterCulture.cultureId._id;
        selectedCulture = cultureData.find((c: any) => c._id === cultureId);
      }

      // Load personality module
      let selectedPersonality = '';
      let selectedPersonalityModule = null;

      if (charData.modules && Array.isArray(charData.modules)) {
        try {
          const personalityModulesResponse = await fetch('/api/modules?type=personality');
          if (personalityModulesResponse.ok) {
            const personalityModules = await personalityModulesResponse.json();

            for (const charModule of charData.modules) {
              const moduleId = charModule.moduleId?._id || charModule.moduleId;
              const personalityModule = personalityModules.find((pm: any) => pm._id === moduleId);

              if (personalityModule) {
                selectedPersonality = personalityModule.name;
                selectedPersonalityModule = personalityModule;
                break;
              }
            }
          }
        } catch (err) {
          console.error('Error fetching personality modules:', err);
        }
      }

      // Load trait
      let selectedTrait = '';
      let selectedTraitOptions: any[] = [];

      if (charData.traits && charData.traits.length > 0) {
        const trait = charData.traits[0];
        if (trait.traitId) {
          selectedTrait = typeof trait.traitId === 'string' ? trait.traitId : trait.traitId._id;
          selectedTraitOptions = trait.selectedOptions || [];
        }
      }

      setState(prev => ({
        ...prev,
        character: charData,
        initialLoading: false,
        ancestries: ancestryData,
        cultures: cultureData,
        selectedAncestry,
        selectedCulture,
        selectedPersonality,
        selectedPersonalityModule,
        selectedTrait,
        selectedTraitOptions,
        attributePointsRemaining: totalAttributePoints - spentAttributePoints,
        startingTalents: budget.total,
        talentStarsRemaining: budget.total - spentTalents,
        investedTalentStars: spentTalents,
        initialCultureSelections: charData.characterCulture || undefined
      }));
    } catch (err) {
      console.error('Error loading character data:', err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load character',
        initialLoading: false
      }));
    }
  };

  // Handler implementations
  const updateCharacter = useCallback((field: keyof Character, value: any) => {
    setState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        [field]: value
      }
    }));
  }, []);

  const updateAttribute = useCallback((attribute: keyof Attributes, newValue: number) => {
    const validation = validateAttributeChange(
      state.character.attributes[attribute],
      newValue,
      state.attributePointsRemaining
    );

    if (!validation.valid) {
      return;
    }

    const change = newValue - state.character.attributes[attribute];

    setState(prev => {
      const updatedCharacter = {
        ...prev.character,
        attributes: {
          ...prev.character.attributes,
          [attribute]: newValue
        }
      };
      return {
        ...prev,
        character: updateSkillTalentsFromAttributes(updatedCharacter),
        attributePointsRemaining: prev.attributePointsRemaining - change
      };
    });
  }, [state.character.attributes, state.attributePointsRemaining]);

  const updateWeaponSkillTalent = useCallback((skillId: string, newTalent: number) => {
    const oldTalent = state.character.weaponSkills[skillId]?.talent || 0;
    const validation = validateTalentChange(oldTalent, newTalent, state.talentStarsRemaining);

    if (!validation.valid) {
      return;
    }

    const starDifference = oldTalent - newTalent;

    setState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        weaponSkills: {
          ...prev.character.weaponSkills,
          [skillId]: {
            ...(prev.character.weaponSkills[skillId] || { value: 0 }),
            talent: newTalent,
            baseTalent: newTalent // Keep baseTalent in sync for create mode
          }
        }
      },
      talentStarsRemaining: prev.talentStarsRemaining + starDifference
    }));
  }, [state.character.weaponSkills, state.talentStarsRemaining]);

  const updateMagicSkillTalent = useCallback((skillId: string, newTalent: number) => {
    const oldTalent = state.character.magicSkills[skillId]?.talent || 0;
    const validation = validateTalentChange(oldTalent, newTalent, state.talentStarsRemaining);

    if (!validation.valid) {
      return;
    }

    const starDifference = oldTalent - newTalent;

    setState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        magicSkills: {
          ...prev.character.magicSkills,
          [skillId]: {
            ...(prev.character.magicSkills[skillId] || { value: 0 }),
            talent: newTalent,
            baseTalent: newTalent
          }
        }
      },
      talentStarsRemaining: prev.talentStarsRemaining + starDifference
    }));
  }, [state.character.magicSkills, state.talentStarsRemaining]);

  const updateCraftingSkillTalent = useCallback((skillId: string, newTalent: number) => {
    const oldTalent = state.character.craftingSkills[skillId]?.talent || 0;
    const validation = validateTalentChange(oldTalent, newTalent, state.talentStarsRemaining);

    if (!validation.valid) {
      return;
    }

    const starDifference = oldTalent - newTalent;

    setState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        craftingSkills: {
          ...prev.character.craftingSkills,
          [skillId]: {
            ...(prev.character.craftingSkills[skillId] || { value: 0 }),
            talent: newTalent,
            baseTalent: newTalent
          }
        }
      },
      talentStarsRemaining: prev.talentStarsRemaining + starDifference
    }));
  }, [state.character.craftingSkills, state.talentStarsRemaining]);

  const handleRaceChange = useCallback((raceName: string, ancestry: Ancestry) => {
    updateCharacter('race', raceName);
    setState(prev => ({ ...prev, selectedAncestry: ancestry }));

    // Recalculate talent budget when ancestry changes
    const tempCharacter = {
      ...state.character,
      ancestry: {
        ancestryId: ancestry as any, // Populated for calculation
        selectedOptions: ancestry.options.map((opt: any) => ({
          name: opt.name,
          selectedSubchoice: null
        }))
      }
    } as any; // Cast to any since format is for calculation only

    const budget = calculateTalentBudget(tempCharacter);
    const spent = calculateSpentTalents(tempCharacter);

    setState(prev => ({
      ...prev,
      startingTalents: budget.total,
      talentStarsRemaining: budget.total - spent
    }));
  }, [state.character, updateCharacter]);

  const handleCultureChange = useCallback((cultureName: string, culture: Culture) => {
    updateCharacter('culture', cultureName);
    updateCharacter('characterCulture', {
      cultureId: (culture as any)._id,
      selectedRestriction: (culture as any).selectedRestriction || null,
      selectedBenefit: (culture as any).selectedBenefit || null,
      selectedStartingItem: (culture as any).selectedStartingItem || null
    });
    setState(prev => ({ ...prev, selectedCulture: culture }));
  }, [updateCharacter]);

  const handlePersonalitySelect = useCallback((personalityName: string, personalityModule: Module) => {
    setState(prev => ({
      ...prev,
      selectedPersonality: personalityName,
      selectedPersonalityModule: personalityModule
    }));
  }, []);

  const handleTraitSelect = useCallback((traitId: string, selectedOptions?: any[]) => {
    setState(prev => ({
      ...prev,
      selectedTrait: traitId,
      selectedTraitOptions: selectedOptions || []
    }));
  }, []);

  const handlePortraitUpdate = useCallback((file: File) => {
    setState(prev => ({ ...prev, portraitFile: file }));
  }, []);

  const handleStartingTalentsChange = useCallback((newStartingTalents: number) => {
    if (newStartingTalents < state.investedTalentStars) {
      setState(prev => ({
        ...prev,
        error: `Cannot reduce talent points below ${prev.investedTalentStars} (already invested)`
      }));
      return;
    }
    const currentSpentTalents = state.startingTalents - state.talentStarsRemaining;
    setState(prev => ({
      ...prev,
      startingTalents: newStartingTalents,
      talentStarsRemaining: newStartingTalents - currentSpentTalents
    }));
  }, [state.investedTalentStars, state.startingTalents, state.talentStarsRemaining]);

  const validateCurrentStep = useCallback((): boolean => {
    const context: StepValidationContext = {
      character: state.character,
      attributePointsRemaining: state.attributePointsRemaining,
      talentStarsRemaining: state.talentStarsRemaining,
      selectedPersonality: state.selectedPersonality
    };

    const validation = validateStep(state.step, context);

    if (!validation.valid) {
      setState(prev => ({ ...prev, error: validation.error || null }));
      return false;
    }

    setState(prev => ({ ...prev, error: null }));
    return true;
  }, [state]);

  const handleNextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setState(prev => ({ ...prev, step: prev.step + 1 }));
      window.scrollTo(0, 0);
    }
  }, [validateCurrentStep]);

  const handlePrevStep = useCallback(() => {
    setState(prev => ({ ...prev, step: prev.step - 1 }));
    window.scrollTo(0, 0);
  }, []);

  const recalculateTalentBudget = useCallback(() => {
    const budget = calculateTalentBudget(state.character);
    const spent = calculateSpentTalents(state.character);

    setState(prev => ({
      ...prev,
      startingTalents: budget.total,
      talentStarsRemaining: budget.total - spent,
      investedTalentStars: spent
    }));
  }, [state.character]);

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const endpoint = mode === 'create' ? '/api/characters' : `/api/characters/${characterId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      // Prepare character data
      const characterData = prepareCharacterData();

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(characterData)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${mode} character`);
      }

      const savedCharacter = await response.json();

      // Upload portrait if provided
      if (state.portraitFile) {
        try {
          const formData = new FormData();
          formData.append('portrait', state.portraitFile);

          await fetch(`/api/portraits/${savedCharacter._id}/portrait`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
          });
        } catch (portraitErr) {
          console.error('Error uploading portrait:', portraitErr);
        }
      }

      // Navigate to character view
      navigate(`/characters/${savedCharacter._id}`);
    } catch (err) {
      console.error(`Error ${mode}ing character:`, err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : `Failed to ${mode} character`,
        isLoading: false
      }));
    }
  }, [mode, characterId, state, validateCurrentStep, navigate]);

  const prepareCharacterData = () => {
    // This function would prepare the character data for submission
    // Implementation depends on specific requirements for create vs edit
    const data: any = {
      name: state.character.name,
      race: state.character.race,
      culture: state.character.culture,
      attributes: state.character.attributes,
      skills: state.character.skills,
      weaponSkills: state.character.weaponSkills,
      magicSkills: state.character.magicSkills,
      craftingSkills: state.character.craftingSkills,
      level: state.character.level,
      biography: state.character.biography,
      appearance: state.character.appearance,
      physicalTraits: state.character.physicalTraits,
    };

    if (state.selectedAncestry) {
      data.ancestry = {
        ancestryId: state.selectedAncestry._id,
        selectedOptions: state.selectedAncestry.options.map((option: any) => ({
          name: option.name,
          selectedSubchoice: option.selectedSubchoice || null
        }))
      };
    }

    if (state.selectedCulture) {
      data.characterCulture = {
        cultureId: (state.selectedCulture as any)._id,
        selectedRestriction: (state.selectedCulture as any).selectedRestriction || null,
        selectedBenefit: (state.selectedCulture as any).selectedBenefit || null,
        selectedStartingItem: (state.selectedCulture as any).selectedStartingItem || null
      };
    }

    if (state.selectedTrait) {
      data.traits = [{
        traitId: state.selectedTrait,
        selectedOptions: state.selectedTraitOptions,
        dateAdded: new Date().toISOString()
      }];
    }

    if (mode === 'edit') {
      // For edit mode, handle module updates
      data.modules = prepareModuleUpdates();
      data.modulePoints = state.character.modulePoints;
    } else {
      // For create mode, just add personality module
      if (state.selectedPersonalityModule) {
        const tier1Option = state.selectedPersonalityModule.options.find(
          (option: any) => option.location === '1'
        );

        if (tier1Option) {
          data.modules = [{
            moduleId: state.selectedPersonalityModule._id,
            selectedOptions: [{
              location: '1',
              selectedAt: new Date().toISOString()
            }]
          }];
        }
      }
    }

    return data;
  };

  const prepareModuleUpdates = () => {
    // Handle module updates for edit mode
    const updatedModules: any[] = [];

    // Keep all non-personality modules
    if (state.character.modules && Array.isArray(state.character.modules)) {
      state.character.modules.forEach((module: any) => {
        const moduleData = module.moduleId || module;
        const isPersonalityModule = moduleData.mtype === 'personality';

        if (!isPersonalityModule) {
          updatedModules.push(module);
        }
      });
    }

    // Add new personality module
    if (state.selectedPersonalityModule) {
      const tier1Option = state.selectedPersonalityModule.options.find(
        (option: any) => option.location === '1'
      );

      if (tier1Option) {
        updatedModules.push({
          moduleId: state.selectedPersonalityModule._id,
          selectedOptions: [{
            location: '1',
            selectedAt: new Date().toISOString()
          }]
        });
      }
    }

    return updatedModules;
  };

  const handlers: CharacterFormHandlers = {
    updateCharacter,
    updateAttribute,
    updateWeaponSkillTalent,
    updateMagicSkillTalent,
    updateCraftingSkillTalent,
    handleRaceChange,
    handleCultureChange,
    handlePersonalitySelect,
    handleTraitSelect,
    handlePortraitUpdate,
    handleStartingTalentsChange,
    handleNextStep,
    handlePrevStep,
    handleSubmit,
    validateCurrentStep,
    recalculateTalentBudget
  };

  return {
    state,
    handlers,
    steps: CHARACTER_STEPS
  };
}