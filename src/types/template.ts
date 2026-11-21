import { Character } from './character';

export type TemplateStage = 1 | 2 | 3 | 4;

export interface TemplateModule {
  moduleId: string | null;
  moduleName: string;
  // location ("1", "2a", ...) -> stage it is picked at
  selectedOptions: Record<string, number>;
}

export interface TemplateSpell {
  spellId: string | null;
  spellName: string;
}

export interface Template {
  _id: string;
  name: string;
  description: string;
  playstyle: string;
  category: 'martial' | 'magic' | 'hybrid' | 'support' | 'utility';
  modules: TemplateModule[];
  spells: TemplateSpell[];
  sorcererSpells: TemplateSpell[];
  thiefSpells: TemplateSpell[];
  extraTraining: { name: string; data: string | null }[];
  attributes: Character['attributes'];
  weaponTalents: Record<string, number>;
  magicTalents: Record<string, number>;
  craftingTalents: Record<string, number>;
  source: 'official' | 'community';
}

export interface TemplateModuleSummary {
  moduleId: string | null;
  name: string;
  mtype: string | null;
  found: boolean;
  options: { location: string; stage: number; name: string }[];
}

export interface DerivedTrait {
  name: string;
  description: string;
  source: string;
  type: string;
}

export interface DerivedTraitCategories {
  General: DerivedTrait[];
  Crafting: DerivedTrait[];
  Ancestry: DerivedTrait[];
  Cultural: DerivedTrait[];
  Uncategorized: DerivedTrait[];
}

export interface TemplatePreview {
  template: Template;
  character: Character & { derivedTraits?: DerivedTraitCategories };
  moduleSummaries: TemplateModuleSummary[];
  missingSpells: string[];
  // Template spells this stage can't cast yet (max roll of the school's magic skill < RC)
  lockedSpells: { name: string; list: string; school: string; rc: number; maxRoll: number }[];
  // nth pick unlocks at stage n (one per 10 module points)
  extraTraining: { name: string; stage: number; unlocked: boolean; found: boolean }[];
  stage: TemplateStage;
  maxStage: TemplateStage;
  pointsSpent: number;
  stagePoints: number;
}

export const TEMPLATE_STAGE_INFO: Record<
  TemplateStage,
  { label: string; points: number; color: string; bg: string; border: string }
> = {
  1: {
    label: 'Starter',
    points: 15,
    color: 'rgb(34, 197, 94)',
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.6)',
  },
  2: {
    label: 'Advanced',
    points: 25,
    color: 'rgb(59, 130, 246)',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.6)',
  },
  3: {
    label: 'Veteran',
    points: 35,
    color: 'rgb(168, 85, 247)',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.6)',
  },
  4: {
    label: 'Elite',
    points: 45,
    color: 'rgb(234, 179, 8)',
    bg: 'rgba(234, 179, 8, 0.15)',
    border: 'rgba(234, 179, 8, 0.6)',
  },
};

export const getTemplateMaxStage = (template: Template): TemplateStage => {
  let max = 1;
  for (const m of template.modules) {
    for (const s of Object.values(m.selectedOptions)) if (s > max) max = s;
  }
  return max as TemplateStage;
};
