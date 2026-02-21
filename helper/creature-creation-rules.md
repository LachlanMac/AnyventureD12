# Creature Creation Rules for AnyventureD12

This document provides comprehensive guidance for AI-assisted creature creation in the AnyventureD12 TTRPG system. It covers all available options in the creature designer, balance guidelines derived from existing official creatures, and game rules context.

## File Location & Structure

Creature JSON files are stored in `data/monsters/` organized by creature type:
```
data/monsters/
  beast/
  construct/
  dark/
  divine/
  elemental/
  fey/
  humanoid/
  monster/
  plantoid/
  undead/
```

Each creature is a single JSON file named in `snake_case.json` format (e.g., `flesh_golem.json`, `queen_lumberwasp.json`). The subfolder MUST match the creature's `type` field.

---

## Enum Values & Options

### Creature Types
`humanoid`, `beast`, `monster`, `plantoid`, `elemental`, `dark`, `divine`, `undead`, `construct`, `fey`

**Type Guidelines:**
- **humanoid**: Intelligent bipedal creatures (soldiers, bandits, mages, NPCs)
- **beast**: Natural animals and wildlife (wolves, pumas, insects)
- **monster**: Unnatural creatures not fitting other categories (lycanthropes, chimeras)
- **plantoid**: Plant-based creatures (treants, living vines)
- **elemental**: Beings of pure elemental energy (fire elementals, earth golems)
- **dark**: Fiends, demons, infernal creatures (hellhounds, imps)
- **divine**: Celestial or holy creatures (angels, divine guardians)
- **undead**: Animated dead (skeletons, zombies, wraiths, liches)
- **construct**: Artificially created beings (flesh golems, clockwork soldiers)
- **fey**: Creatures of the fey realm (satyrs, sprites, fey beasts)

### Creature Tiers
`minion`, `grunt`, `standard`, `champion`, `elite`, `legend`, `mythic`

### Sizes
`tiny`, `small`, `medium`, `large`, `huge`, `gargantuan`

### Damage Types
`physical`, `heat`, `cold`, `electric`, `dark`, `divine`, `aetheric`, `psychic`, `toxic`

**IMPORTANT:** Use `aetheric` not `arcane`. The system has standardized on `aetheric`.

### Attack Categories
`pierce`, `slash`, `blunt`, `ranged`

### Spell Target Defenses
`evasion`, `deflection`, `resilience`, `none`

### Spell Types
`normal`, `innate`, `unique`

- **normal**: Standard spells that follow regular casting rules
- **innate**: The creature can cast without gestures or verbal components
- **unique**: The spell is unique to this creature and cannot be learned by players

### Action/Reaction Types
`attack`, `spell`, `utility`, `movement`

### Taming Command Levels
`basic`, `moderate`, `advanced`

### Range Values (for min_range and max_range)
| Value | Name | Distance |
|-------|------|----------|
| 0 | Self | 0 units |
| 1 | Adjacent | 0 units (touching) |
| 2 | Nearby | 1 unit |
| 3 | Very Short | 2-5 units |
| 4 | Short | 6-10 units |
| 5 | Moderate | 11-20 units |
| 6 | Far | 21-40 units |
| 7 | Very Far | 41-60 units |
| 8 | Distant | 61-100 units |

### Skills (20 total)
**Physique:** Fitness, Deflection, Might, Endurance
**Finesse:** Evasion, Stealth, Coordination, Thievery
**Mind:** Resilience, Concentration, Senses, Logic
**Knowledge:** Wildcraft, Academics, Magic, Medicine
**Social:** Expression, Presence, Insight, Persuasion

### Skill Levels (die mapping)
| Level | Die |
|-------|-----|
| -1 | Cannot use (below minimum) |
| 0 | d4 |
| 1 | d6 |
| 2 | d8 |
| 3 | d10 |
| 4 | d12 |
| 5 | d16 |
| 6 | d20 |

### Detections
`normal`, `darksight`, `infravision`, `deadsight`, `echolocation`, `tremorsense`, `truesight`, `aethersight`

Detection values range from 0-8. Most creatures have `normal: 5` and all others at 0. Assign special senses based on creature type (e.g., undead get deadsight, beasts may get darksight or infravision).

### Condition Immunities
`afraid`, `bleeding`, `blinded`, `charmed`, `confused`, `dazed`, `diseased`, `exhausted`, `frightened`, `grappled`, `incapacitated`, `invisible`, `paralyzed`, `petrified`, `poisoned`, `prone`, `restrained`, `stunned`, `unconscious`

**Common Immunity Patterns:**
- **Undead**: bleeding, diseased, exhausted, poisoned
- **Constructs**: dazed, stunned (sometimes more)
- **Fey**: varies, often afraid or charmed
- **Beasts**: usually no immunities

---

## Action Economy by Tier

This is critical to get right and matches the combat rules:

| Tier | Actions per Turn | Energy System | Notes |
|------|-----------------|---------------|-------|
| Minion | 1 | No energy (0/0/0) | Weakest; cannon fodder |
| Grunt | 1 | No energy (0/0/0) | Slightly stronger cannon fodder |
| Standard | 2 | Has energy (recovery 3) | First "real" opponent |
| Champion | 2 | Has energy (5/5/3) | Tough mid-tier threat |
| Elite | 3 (1 per phase) | High energy (7+/5/7) | Boss-level, acts in Early/Mid/Late phases |
| Legend | 3 (1 per phase) | Very high energy | Major boss encounter |
| Mythic | 3 (1 per phase) | Very high energy | Campaign-ending threat |

**IMPORTANT for Minions and Grunts:** Because they have no energy, their action costs in the JSON can be 0. The energy cost field exists in the schema but is effectively ignored for display purposes on the bestiary for these tiers. Set `energy.max`, `energy.current`, and `energy.recovery` all to `0`.

**IMPORTANT for Standard+:** Energy recovery is typically `3` per round (matching the game rules). Elite+ may have higher recovery (e.g., Queen Lumberwasp has 7 recovery).

---

## Balance Guidelines by Tier

These guidelines are derived from analysis of all existing official creatures.

### Minion
**Role:** Cannon fodder. Appear in groups of 3-6+. Should die in 1-2 hits from a typical PC.

| Stat | Range | Notes |
|------|-------|-------|
| Health | 5-12 | Very low |
| Resolve | 0-8 | Often 0 for mindless creatures |
| Energy | 0/0/0 | No energy system |
| Movement (walk) | 3-5 | Slower than PCs |
| Attributes | 1-2 each | Low across the board |
| Primary Damage | 2-3 | Minimal threat |
| Extra Damage | 1-2 | Very low |
| Attack Dice | 2d4 typical | Low dice, small dice |
| Actions | 1-2 | 1 basic attack + maybe 1 utility |
| Reactions | 0 | Almost never |
| Traits | 0-2 | Simple if any |
| Mitigation | 0-2 per type | Usually only thematic mitigation |

**Example:** Fox (HP 8, 2d4, 2/1 physical), Flesh Golem Minion (HP 10, 2d4, 3/2 physical)

### Grunt
**Role:** Common enemy. Appear in groups of 2-4. Should take 2-4 hits from a typical PC.

| Stat | Range | Notes |
|------|-------|-------|
| Health | 13-22 | Moderate |
| Resolve | 0-10 | 10 for sentient, 0 for mindless |
| Energy | 0/0/0 | No energy system |
| Movement (walk) | 5-8 | Comparable to PCs |
| Attributes | 1-3 (primary 2) | One strong attribute, rest 1-2 |
| Primary Damage | 3-5 | Meaningful but not devastating |
| Extra Damage | 0-4 | Varies |
| Attack Dice | 2d6 to 4d6 | Moderate pools |
| Actions | 2-3 | 1 basic attack + 1-2 other abilities |
| Reactions | 0-1 | Occasionally 1 |
| Traits | 1-2 | Defining characteristics |
| Mitigation | 0-5 per type | Usually 1-2 types with 2-4 |

**Examples:**
- Wolf (HP 13, 3d8, 4/2 physical) - fast, pack fighter
- Skeleton (HP 18, 2d6, 5/3 physical) - sturdy, mindless
- Puma (HP 17, 3d8, 4/2 physical) - agile, ambush predator
- Satyr Goreling (HP 22, 3d6, 4/2 physical) - sturdy grunt with reaction

### Standard
**Role:** A real threat. Typically faced in pairs or with support. Should take 4-8 hits from a typical PC.

| Stat | Range | Notes |
|------|-------|-------|
| Health | 25-40 | Substantial |
| Resolve | 0-15 | Depends on sentience |
| Energy | 3-5 max, recovery 3 | Has energy system |
| Movement (walk) | 4-6 | Standard movement |
| Attributes | 1-3 (primary 3) | One strong, rest distributed |
| Primary Damage | 5-7 | Threatening |
| Extra Damage | 3-5 | Adds up with multiple hits |
| Attack Dice | 2d8 to 3d10 | Solid pools |
| Actions | 3-4 | 1 basic + 2-3 special abilities |
| Reactions | 0-1 | May have 1 |
| Traits | 1-3 | Notable abilities |
| Mitigation | 0-5 per type | Broader thematic coverage |

**Example:** Flesh Golem (HP 35, 3d10, 5/4 physical; big slam 2d12, 7/7)

### Champion
**Role:** Mini-boss. Faced as a solo threat or with a few support creatures. Should take 6-10+ hits from a typical PC.

| Stat | Range | Notes |
|------|-------|-------|
| Health | 35-55 | High |
| Resolve | 15-25 | Meaningful resolve pool |
| Energy | 5 max, recovery 3 | Standard energy |
| Movement (walk) | 5-7 | Good mobility |
| Attributes | 1-3 (2-3 at 3) | Multiple strong attributes |
| Primary Damage | 5-9 | Dangerous |
| Extra Damage | 3-4 | Stacking threat |
| Attack Dice | 3d8 to 5d12 | Large, dangerous pools |
| Actions | 3-5 | Mix of attacks and utility |
| Reactions | 0-1 | May have a signature reaction |
| Traits | 1-3 | Defining abilities |
| Mitigation | 0-6 per type | Multiple damage resistances |

**Examples:**
- Hellhound (HP 40, 3d8 basic; 2d12 breath weapon for 8/4 heat; 5 actions)
- Werebear (HP 40, 3d10 basic 5/4; bite 5d12 6/3 devastating; 3 actions)
- Briarhorn (HP 50, 4d8 9/3 huge hits; daily Indomitable ability; spell reaction)

### Elite
**Role:** Major boss. Usually fought by a full party (3-5 PCs). Acts 3 times per round (once per phase). Should be a challenging multi-round encounter.

| Stat | Range | Notes |
|------|-------|-------|
| Health | 80-120 | Very high |
| Resolve | 30-50 | Large resolve pool |
| Energy | 7+ max, recovery 5-7 | High energy budget |
| Movement (walk) | 5-7+ | May have multiple movement types |
| Attributes | 2-4 | Multiple high attributes |
| Primary Damage | 5-8 basic, 8-12 big attacks | Very dangerous |
| Extra Damage | 3-5 | Consistent pressure |
| Attack Dice | 3d10 to 4d12 | Large, consistent pools |
| Actions | 4-5 | Multiple attack types + utility |
| Reactions | 1-2 | Signature reactions |
| Traits | 1-3 | Powerful defining abilities |
| Mitigation | Varies | May have conditional mitigation (traits) |

**Example:** Queen Lumberwasp (HP 100, 4d12 mandibles 8/4; reaction spawns minions; trait halves phys damage above 80 HP)

### Legend (Estimated - No Examples Yet)
**Role:** Epic boss. Multi-phase encounter for a full party. Legendary actions/reactions. Should define a major story arc. A Legend is a creature that veteran adventurers tell stories about - an ancient dragon, a lich lord, a primordial beast.

| Stat | Estimated Range | Notes |
|------|----------------|-------|
| Health | 150-250 | Massive; consider phase-change mechanics (e.g., new abilities at 50% HP) |
| Resolve | 40-60 | Very high; nearly impossible to break mentally |
| Energy | 8-10 max, recovery 8+ | Essentially unlimited energy budget |
| Movement (walk) | 6-8+ | Very mobile; likely has 2+ movement types |
| Attributes | 3-5 | 2-3 attributes at 4, rest at 2-3; nothing below 2 |
| Primary Damage | 8-15 | Devastating |
| Extra Damage | 4-8 | Each extra hit really hurts |
| Attack Dice | 4d10 to 5d12+ | Huge pools; basic attacks alone are lethal |
| Actions | 5-7 | Diverse and powerful toolkit |
| Reactions | 2-3 | Multiple signature reactions |
| Traits | 3-5 | Powerful, encounter-defining |
| Condition Immunities | 3-6 | Immune to many crowd-control effects |
| Detections | Multiple senses at 6-7 | Wide awareness; hard to sneak up on |

**Legend Skill Profile:**
Legends are masters. They should have multiple skills at 4-5, with signature skills potentially at 5-6. Most skills should be 2+ with very few at 0 and almost nothing at -1.

Example - Ancient Dragon (Legend):
- **Signature (5-6):** Senses 6, Resilience 5, Might 5, Presence 5
- **High (3-4):** Fitness 4, Endurance 4, Concentration 4, Evasion 3, Insight 3
- **Medium (2):** Deflection 2, Stealth 2, Coordination 2, Logic 2, Academics 2, Intimidation 2
- **Low (1):** Wildcraft 1, Magic 1, Expression 1, Persuasion 1
- **Never -1:** A legend-tier creature is too powerful and experienced to be incapable of anything
- Attributes: Physique 4, Finesse 3, Mind 4, Knowledge 2, Social 3

Example - Lich Lord (Legend):
- **Signature (5-6):** Magic 6, Academics 5, Resilience 5, Concentration 5
- **High (3-4):** Senses 4, Logic 4, Insight 4, Presence 4, Persuasion 3
- **Medium (2):** Endurance 2, Evasion 2, Stealth 2, Expression 2, Medicine 2
- **Low (1):** Deflection 1, Coordination 1, Wildcraft 1, Might 1, Fitness 1
- **Zero (0):** Thievery 0
- Attributes: Physique 2, Finesse 2, Mind 4, Knowledge 5, Social 3

**Legend Trait Design:**
Traits at this tier should fundamentally change how the encounter plays:
- **Phase changes:** "When reduced below 50% health, the creature transforms/enrages/enters a new phase"
- **Legendary resistance:** "X times per day, the creature can choose to succeed on a failed resilience or concentration check"
- **Auras:** Persistent effects that punish proximity (fear aura, damage aura, anti-magic zone)
- **Damage thresholds:** Conditional mitigation that changes the math (e.g., "physical damage below 8 is fully mitigated")
- **Regeneration:** Meaningful healing each round that forces the party to sustain pressure
- **Minion summoning:** Spawning reinforcements during the fight

### Mythic (Estimated - No Examples Yet)
**Role:** Campaign-defining threat. God-tier enemy. Near-impossible to defeat without preparation and strategy. A Mythic is a force of nature - a primordial titan, an archdevil, a world-eater. Fighting one should feel like trying to stop a natural disaster.

| Stat | Estimated Range | Notes |
|------|----------------|-------|
| Health | 300-500+ | Enormous; always use phase-change mechanics |
| Resolve | 60-100 | Near-unbreakable will; essentially immune to mental assault |
| Energy | 10+ max, recovery 10+ | Unrestricted; energy is never a limiting factor |
| Movement (walk) | 8+ | Extremely mobile; multiple movement types at high values |
| Attributes | 4-6 | Most at 4-5, signature at 5-6; nothing below 3 |
| Primary Damage | 12-20+ | Lethal; can one-shot most PCs |
| Extra Damage | 6-10+ | Catastrophic with multiple hits |
| Attack Dice | 5d12 to 6d16+ | Enormous pools; multiple dice at d16-d20 |
| Actions | 6+ | Full repertoire covering all situations |
| Reactions | 3+ | Multiple per round; some may be free |
| Traits | 5+ | Reality-warping abilities |
| Condition Immunities | 5-10+ | Immune to most conditions; only exotic effects work |
| Detections | Multiple senses at 7-8 | Near-omniscient awareness within range |

**Mythic Skill Profile:**
Mythic creatures are near-godlike. Most skills should be 3+ with multiple at 5-6. The skill `tier` field (granting +1 talent) should be used on 2-4 signature skills. Nothing should be at -1 and very little at 0.

Example - Elder Wyrm (Mythic):
- **Mastery (6):** Senses 6, Might 6, Resilience 6, Presence 6
- **Near-Mastery (5):** Fitness 5, Endurance 5, Concentration 5, Insight 5
- **Expert (4):** Deflection 4, Evasion 3, Coordination 3, Logic 4, Academics 4, Expression 4
- **High (3):** Stealth 3, Magic 3, Persuasion 3, Wildcraft 3, Medicine 3
- **Skill Tiers:** Might tier 1, Resilience tier 1, Senses tier 1 (each effectively +1 talent die)
- Attributes: Physique 5, Finesse 3, Mind 5, Knowledge 4, Social 4

**Mythic Trait Design:**
Mythic traits should make the players question whether victory is possible:
- **Multiple phases:** 2-3 distinct combat phases with different abilities and behaviors
- **Legendary resistance (enhanced):** Auto-succeed on failed checks multiple times per encounter
- **Environmental effects:** The creature's presence warps reality (tremors, storms, darkness, wildfires)
- **True damage:** Some abilities bypass all mitigation entirely
- **Death throes:** Dramatic effects when finally defeated (explosion, curse, dimensional collapse)
- **Minion armies:** Can summon or command multiple waves of reinforcements
- **Anti-magic/Anti-weapon zones:** Nullify specific types of player offense
- **Regeneration (massive):** 10-20+ HP per round unless specific conditions are met to disable it

**Mythic Design Philosophy:**
A mythic encounter should never be "just hit it until it dies." The party should need:
1. Pre-encounter preparation (specific items, spells, or knowledge)
2. Environmental interaction (disable regeneration, break a shield, exploit a weakness)
3. Phase awareness (different tactics for each phase)
4. Resource management across a long fight (energy, resolve, health, consumables)

---

## Dice Roll Conventions

Attack dice follow this format: `NdX` where N = number of dice, X = die size.

**Die size progression:** d4 < d6 < d8 < d10 < d12 < d16 < d20 < d24

### Typical Attack Dice by Tier
| Tier | Basic Attack | Strongest Attack |
|------|-------------|------------------|
| Minion | 2d4 | 2d4 |
| Grunt | 2d6 to 3d8 | 4d6 |
| Standard | 2d8 to 3d10 | 2d12 |
| Champion | 3d8 to 4d8 | 5d12 |
| Elite | 3d10 to 4d12 | 4d12+ |
| Legend | 4d10+ | 5d12+ |
| Mythic | 5d12+ | 6d16+ |

---

## Damage Design Rules

### Primary vs Extra Damage
- **Primary damage** applies on the first successful hit die
- **Extra damage** applies for each additional die that beats the defense

For creatures, think of it as: `primary` is the base impact, `extra` is how much it punishes poor defense.

### Damage Scaling by Tier
| Tier | Primary (basic) | Extra (basic) | Primary (big) | Extra (big) |
|------|----------------|---------------|---------------|-------------|
| Minion | 2-3 | 1-2 | - | - |
| Grunt | 3-5 | 0-3 | 4-6 | 3-4 |
| Standard | 4-5 | 3-4 | 6-7 | 5-7 |
| Champion | 5-6 | 3-4 | 8-9 | 3-4 |
| Elite | 5-6 | 3-4 | 8-10 | 4-6 |
| Legend | 7-10 | 4-6 | 10-15 | 5-8 |
| Mythic | 10-15 | 6-10 | 15-20 | 8-12 |

### Secondary Damage
Some attacks deal two damage types (e.g., Hellhound's Flame Bite deals physical AND heat). Use `secondary_damage`, `secondary_damage_extra`, and `secondary_damage_type`. This should be reserved for Champion+ tier creatures or thematically justified abilities.

### Mitigation Context
Remember that PCs typically have 0-5 mitigation in most types. A starting PC in leather armor might have physical mitigation of 2-3. Full plate might give 6-7. Most PCs have 0 mitigation to non-physical damage types.

The partial mitigation rule means:
- If mitigation >= damage: 0 damage
- If damage > mitigation but <= 2x mitigation: half damage
- If damage > 2x mitigation: full damage

So an attack dealing 5 damage against 3 mitigation deals 2.5 (rounded down to 2). An attack dealing 7 damage against 3 mitigation deals full 7.

**Design implication:** To reliably threaten armored PCs, basic attacks should deal 5+ damage. Anything below 4 is often fully mitigated by light armor.

---

## Action Design Guidelines

### Basic Actions
Every creature should have at least one `basic: true` action. This is their default/auto-attack. For minions and grunts, this is their primary combat action.

**Guidelines for basic actions:**
- Cost 0-1 energy (0 for grunts/minions since they have no energy)
- Type is usually `attack`
- Should be a straightforward damage-dealing ability
- Range is usually `Adjacent` (min_range: 1, max_range: 1) for melee creatures

### Utility Actions
Utility abilities (`type: "utility"`) don't have meaningful attack/damage stats. When creating utility actions, the attack block should use placeholder values:
```json
"attack": {
  "roll": "0",
  "damage": "2",
  "damage_extra": "1",
  "damage_type": "physical",
  "category": "slash",
  "min_range": 1,
  "max_range": 1
}
```
These values exist because the schema requires the attack block but are not displayed for utility actions on the bestiary.

### Movement Actions
`type: "movement"` is for abilities that involve special movement (charges, dashes, teleports). Same placeholder attack block as utility unless they deal damage during movement.

### Spell Actions/Reactions
`type: "spell"` is for abilities that function as spells. These use the `spell` sub-object instead of `attack`:
```json
"spell": {
  "roll": "2d8",
  "damage": "5",
  "damage_extra": "3",
  "damage_type": "heat",
  "target_defense": "evasion",
  "defense_difficulty": 6,
  "min_range": 1,
  "max_range": 5,
  "charge": "The spell deals an additional 3 damage."
}
```

**Spell field explanations:**
- `roll`: The dice the creature rolls to cast (must meet the spell's RC)
- `damage`/`damage_extra`/`damage_type`: Damage dealt by the spell
- `target_defense`: What defense the target uses (`evasion`, `deflection`, `resilience`, `none`)
- `defense_difficulty`: The Required Check the target must beat to resist/avoid
- `charge`: Optional overcharge effect text (displayed on bestiary)

Set `magic: true` on spell-type actions to give them the magical styling on the bestiary.

### Daily vs Round Limitations
- `daily: true` means the ability can only be used once per day/encounter
- `round: true` means the ability can only be used once per round
- Use these to balance powerful abilities

### Spell Type Classification
- `spellType: "normal"` - Default for most abilities
- `spellType: "innate"` - Doesn't require gestures/words; can cast while muted/restrained
- `spellType: "unique"` - Cannot be learned by players; creature-exclusive

---

## Reaction Design Guidelines

Reactions are triggered abilities. Every reaction should have:
- A clear **trigger** in the description (e.g., "In response to taking damage...", "When a creature moves within range...")
- Appropriate **cost** (0 for grunts, 1-3 for standard+)
- The `trigger` field is optional but recommended for clarity

**Common triggers:**
- Being attacked or taking damage
- A creature entering/leaving range
- An ally being attacked
- A spell being cast nearby
- Taking a specific condition

---

## Trait Design Guidelines

Traits are passive abilities or special rules. They don't have costs or dice rolls.

**Common trait patterns:**
- **Weaknesses:** "Takes extra damage from X" or "Loses mitigation against Y"
- **Resistances:** "Gains bonus dice to defend against X" or conditional mitigation
- **Auras:** Effects that apply to nearby creatures
- **Pack tactics:** Bonuses for having allies nearby
- **Regeneration:** Healing over time
- **Immunities:** Narrative immunities beyond the checkbox list

---

## Attribute & Skill Distribution

### Attributes by Tier
| Tier | Total Attribute Points | Typical Distribution | Min Attribute | Max Attribute |
|------|----------------------|---------------------|---------------|---------------|
| Minion | 6-7 | 2/1/1/1/1 | 1 | 2 |
| Grunt | 7-9 | 2/2/1-2/1/1 | 1 | 3 |
| Standard | 8-10 | 3/1-2/2/1/1 | 1 | 3 |
| Champion | 9-11 | 3/2/2-3/1/1 | 1 | 3 |
| Elite | 10-14 | 3/2/2-3/1/3 | 1 | 4 |
| Legend | 14-20 | 4/3/4/2-3/3 | 2 | 5 |
| Mythic | 18-25 | 5/3-4/5/4/4 | 3 | 6 |

**IMPORTANT: Attribute talents can NEVER be 0.** The minimum talent value is 1. To represent a creature being incapable in an area (e.g., a feral beast with no knowledge), set the individual **skills** under that attribute to -1, not the attribute itself. A feral creature with Knowledge 1 and all knowledge skills at -1 effectively can't use those skills (rolling 1d4 take highest is barely functional). The attribute talent determines how many dice you roll; the skill determines the die size. Setting a skill to -1 means the creature simply cannot attempt that skill.

**Context for high attributes:** Remember that attributes = number of dice rolled. A creature with Physique 5 and Might 6 rolls **5d20** for a Might check. That's almost guaranteed to hit the maximum. At the Legend/Mythic tier, this is intentional - these creatures should feel overwhelmingly powerful in their signature areas.

### Skill Value Guidelines
- **-1**: Creature is incapable (beasts often have -1 in academics, magic, medicine, social skills)
- **0**: Untrained baseline
- **1**: Basic training or natural inclination
- **2**: Trained professional competence
- **3**: Expert/Specialized
- **4**: Exceptional mastery
- **5-6**: Legendary mastery (reserved for elite+ tier creatures in their signature skills)

### Skill Tier
The `tier` field on skills represents advanced mastery:
- **-1**: Penalized (cannot use effectively)
- **0**: Normal (most common)
- **1**: Enhanced (+1 to the talent used; very rare, only for champion+ signature skills)

### Skill Distribution Philosophy
**IMPORTANT:** Creatures should have well-rounded skill profiles that reflect their nature, training, and daily activities. Don't just set 1-2 skills high and leave everything else at 0. Think about what the creature *does* every day and assign skills accordingly:

- A town guard trains daily (fitness 2), stands post for hours (endurance 2), watches for trouble (senses 3), deflects blows (deflection 2), has basic combat readiness (might 1, coordination 1, evasion 1), and can apply first aid (medicine 1).
- A wolf hunts in packs (senses 4, stealth 3), chases prey (fitness 2), bites hard (endurance 2), and has some wilderness instinct (wildcraft 2, resilience 2).
- A skeleton mindlessly fights (deflection 1, might 1, endurance 2, resilience 3) but is incapable of knowledge or social interaction (all -1).

**Rule of thumb by tier:**
| Tier | Skills at 4+ | Skills at 2-3 | Skills at 1 | Skills at 0 | Skills at -1 |
|------|-------------|---------------|-------------|-------------|--------------|
| Minion | 0 | 1-2 | 2-3 | 8-10 | 5-8 |
| Grunt | 0 | 2-4 | 3-5 | 6-8 | 3-6 |
| Standard | 0-1 | 3-5 | 4-6 | 5-7 | 2-4 |
| Champion | 0-2 | 4-6 | 4-6 | 4-6 | 1-4 |
| Elite | 1-3 | 5-7 | 4-6 | 3-5 | 1-3 |
| Legend | 3-6 | 6-8 | 4-6 | 1-3 | 0 (very rare) |
| Mythic | 6-10 | 6-10 | 3-5 | 0-2 | 0 (never) |

**Skill tier (the `tier` field):** This grants +1 to the attribute talent used for that skill. It is extremely powerful and should be used sparingly:
- **Champion:** 0-1 skills with tier 1 (only their absolute signature)
- **Elite:** 1-2 skills with tier 1
- **Legend:** 2-3 skills with tier 1
- **Mythic:** 2-4 skills with tier 1

A Mythic creature with Might 6 (d20) and tier 1, under a Physique 5 attribute, rolls **6d20** for that skill. That's terrifying and intentional.

### Skill Assignment by Creature Type

**Beasts** typically have:
- **High (2-4):** Fitness, Senses, Stealth (predators), Evasion or Endurance
- **Medium (1-2):** Coordination, Wildcraft, Resilience, Might (if strong), Presence (if intimidating)
- **Low (0):** Logic, Thievery, Concentration
- **Impossible (-1):** Academics, Magic, Medicine, Expression, Persuasion, Thievery
- Think about what the animal does: a wolf tracks prey (senses 4, wildcraft 2), a puma ambushes (stealth 3, fitness 3), a wasp flies and stings (evasion 2, senses 2)

**Undead** typically have:
- **High (2-4):** Resilience, Endurance (they don't tire or feel pain)
- **Medium (1-2):** Deflection, Might, Senses, Concentration (depending on type)
- **Low (0):** Fitness, Stealth, Coordination, Logic
- **Impossible (-1):** Wildcraft, Academics, Magic (unless a lich/wraith), Medicine, Expression, Insight, Persuasion
- Mindless undead should have most Knowledge and Social skills at -1

**Humanoids** typically have:
- **Broadest distribution** - humanoids are trained professionals with varied skills
- **Role-defining skills at 2-3:** A guard has deflection/senses/endurance; a mage has magic/academics/concentration; a thief has stealth/thievery/evasion
- **Supporting skills at 1:** Things their training touches on (a guard knows basic fitness, coordination, might, medicine, insight, persuasion, academics)
- **Baseline (0):** Skills outside their training but not impossible
- **Rarely -1:** Humanoids are rarely incapable unless it's thematic (a blind oracle has senses -1)
- Think about their daily routine, training regimen, and social interactions

**Constructs** typically have:
- **High (2-4):** Physical combat skills (might, endurance, fitness), Presence (intimidating)
- **Medium (1):** Deflection, Senses, Resilience
- **Low (0):** Expression, Coordination
- **Impossible (-1):** Logic, Wildcraft, Academics, Magic, Medicine, Insight, Persuasion, Thievery, Stealth, Concentration
- Very one-dimensional; most Knowledge and Social skills should be -1

**Fey** typically have:
- **High (2-3):** Magic, Stealth, Expression, Resilience (strong wills)
- **Medium (1-2):** Senses, Coordination, Presence, Insight, Evasion
- **Low (0):** Fitness, Might, Academics, Medicine
- **Rarely -1:** Fey are broadly capable but may have specific weaknesses
- Soldier fey (like Satyr Gorelings) flip this: high physical, lower mental/social

**Dark (fiends/demons)** typically have:
- **High (2-4):** Resilience, Senses, Presence, Endurance
- **Medium (1-2):** Fitness, Might, Concentration, Insight, Persuasion (manipulative)
- **Low (0):** Stealth, Coordination, Medicine, Academics
- **Rarely -1:** Fiends are intelligent and rarely incapable of anything

**Elemental** typically have:
- **High (2-4):** Endurance, Might, Fitness (raw elemental power)
- **Medium (1-2):** Resilience, Senses, Concentration
- **Low (0):** Most other skills
- **Impossible (-1):** Social skills, Knowledge skills, Stealth, Thievery

---

## Mitigation Guidelines

### By Size
Larger creatures tend to have higher physical mitigation (thick hide/armor), while smaller ones rely on evasion.

### By Type
| Type | Typical Mitigations |
|------|-------------------|
| Beast | Minimal (0-2 cold from fur) |
| Undead | Physical 2 (bone); immune to toxic typically |
| Construct | Physical 2-4, broad elemental (2-5), high toxic |
| Dark | Heat 4-6, Dark 3+, maybe Toxic |
| Divine | Divine 4+, maybe Psychic |
| Fey | Dark 2, Aetheric 2 |
| Humanoid | Physical 2-4 (armor), Cold/Heat 2 (armor) |
| Elemental | High in own element (6+), weak to opposite |
| Monster | Varies wildly by concept |

### Mitigation by Tier (typical total points across all types)
| Tier | Total Mitigation Budget |
|------|----------------------|
| Minion | 0-6 |
| Grunt | 0-8 |
| Standard | 5-15 |
| Champion | 8-20 |
| Elite | 10-25 |
| Legend | 15-40 |
| Mythic | 25-60 |

---

## Movement Guidelines

| Size | Default Walk | Notes |
|------|-------------|-------|
| Tiny | 3-4 | Very slow |
| Small | 4-6 | Slightly below or at PC speed |
| Medium | 4-6 | PC-comparable (PCs default to 4-5) |
| Large | 5-7 | Slightly above average |
| Huge | 5-8 | Large strides |
| Gargantuan | 4-8 | Can be slow (lumbering) or fast |

**Special movement:** Only assign climb/swim/fly if it makes thematic sense. Flying creatures often have reduced walk speed (e.g., Lumber Wasp: walk 2, fly 6).

---

## Energy & Resolve Design

### Energy
| Tier | Max | Recovery |
|------|-----|---------|
| Minion | 0 | 0 |
| Grunt | 0 | 0 |
| Standard | 3-5 | 3 |
| Champion | 5 | 3 |
| Elite | 7-10 | 5-7 |
| Legend | 10-12 | 8-10 |
| Mythic | 12-15 | 10-12 |

### Resolve
- **Mindless creatures** (skeletons, golems, basic undead): Resolve 0
- **Semi-sentient** (wolves, pumas): Resolve 5-10
- **Sentient** (humanoids, intelligent monsters): Resolve 10-25
- **Elite+ bosses**: Resolve 30-50+
- **Mythic**: Resolve 60-100

Resolve recovery is almost always `1` for creatures.

---

## Health Guidelines

| Tier | Health Range | Context |
|------|-------------|---------|
| Minion | 5-12 | Dies in 1-2 PC hits |
| Grunt | 13-22 | Dies in 2-4 PC hits |
| Standard | 25-40 | Takes several rounds to kill |
| Champion | 35-55 | Mini-boss; multiple rounds |
| Elite | 80-120 | Full party multi-round encounter |
| Legend | 150-250 | Extended multi-round boss fight |
| Mythic | 300-500+ | Requires full strategy and preparation |

**Context for scaling:** A typical starting PC deals roughly 5-8 damage per attack with a weapon (assuming their attack hits). A well-built PC might deal 8-12 per attack. PCs get 2 actions per turn, so ~10-16 damage per round from one PC.

---

## Taming

Set `tame_check: -1` for untameable creatures (most creatures). Only beasts and some monsters should be tameable.

For tameable creatures:
- `tame_check`: The RC for the wildcraft check to tame (typically 4-12)
- `commands`: What level of commands they can follow
  - `basic`: Simple commands (attack, stay, come)
  - `moderate`: More complex commands
  - `advanced`: Complex multi-step commands

---

## Challenge Rating

Currently `challenge_rating` is set to `1` for all existing creatures. This field is only displayed on the bestiary for `elite` and `legend` tier creatures. It represents the "star rating" difficulty within that tier (1-5 stars).

---

## Common Design Pitfalls

1. **Don't give minions/grunts energy.** They have 1 action and don't track energy. Set all energy values to 0.

2. **Don't forget the basic attack.** Every creature needs at least one `basic: true` attack action. This is what they do by default.

3. **Utility actions still need attack blocks.** The schema requires it. Use the placeholder values described above.

4. **Watch damage type consistency.** A fire creature's breath should deal `heat` damage, not `physical`. Match damage types to the creature's theme.

5. **Don't overload low-tier creatures.** A minion with 5 actions and 3 reactions is wrong. Keep it simple: 1-2 actions for minion, 2-3 for grunt.

6. **Consider the party context.** Creatures are designed to fight 3-5 PCs. A champion should challenge a full party, not just one PC.

7. **Use the `daily` flag for powerful abilities.** The Briarhorn's Indomitable (removes a condition + 10 temp HP) is `daily: true` because it's very strong.

8. **Use `round` for abilities that could be spammed.** If an ability would break the game if used every action, make it 1/round.

9. **Descriptions should be self-contained.** Include all mechanical information in the description text. The stat pills (dice, damage, range) are auto-generated from the data, but conditions, secondary effects, and special rules must be in the description.

10. **Spell-type abilities appear in the Spells section.** On the bestiary, any action/reaction with `type: "spell"` is moved to the Spells section and labeled as "Action" or "Reaction" accordingly. Use this for creature-specific magical abilities.

11. **Use "Required Check" (RC) not "DC".** Anyventure uses RC terminology, never DC (that's a D&D term).

---

## JSON Template

```json
{
  "name": "Creature Name",
  "description": "A paragraph describing the creature's appearance, behavior, and nature.",
  "tactics": "How the creature fights, what it prioritizes, and any behavioral patterns.",
  "tier": "grunt",
  "type": "beast",
  "size": "medium",
  "foundry_portrait": "",
  "health": {
    "max": 18,
    "current": 15
  },
  "energy": {
    "max": 0,
    "current": 0,
    "recovery": 0
  },
  "resolve": {
    "max": 10,
    "current": 5,
    "recovery": 1
  },
  "movement": {
    "walk": 5,
    "climb": 0,
    "swim": 0,
    "fly": 0
  },
  "attributes": {
    "physique": { "talent": 2 },
    "finesse": { "talent": 2 },
    "mind": { "talent": 1 },
    "knowledge": { "talent": 1 },
    "social": { "talent": 1 }
  },
  "skills": {
    "fitness": { "value": 1, "tier": 0 },
    "deflection": { "value": 0, "tier": 0 },
    "might": { "value": 1, "tier": 0 },
    "endurance": { "value": 1, "tier": 0 },
    "evasion": { "value": 1, "tier": 0 },
    "stealth": { "value": 0, "tier": 0 },
    "coordination": { "value": 1, "tier": 0 },
    "thievery": { "value": 0, "tier": 0 },
    "resilience": { "value": 1, "tier": 0 },
    "concentration": { "value": 0, "tier": 0 },
    "senses": { "value": 1, "tier": 0 },
    "logic": { "value": 0, "tier": 0 },
    "wildcraft": { "value": 0, "tier": 0 },
    "academics": { "value": -1, "tier": 0 },
    "magic": { "value": -1, "tier": 0 },
    "medicine": { "value": -1, "tier": 0 },
    "expression": { "value": -1, "tier": 0 },
    "presence": { "value": 0, "tier": 0 },
    "insight": { "value": 0, "tier": 0 },
    "persuasion": { "value": -1, "tier": 0 }
  },
  "mitigation": {
    "physical": 0,
    "cold": 0,
    "heat": 0,
    "electric": 0,
    "psychic": 0,
    "dark": 0,
    "divine": 0,
    "aetheric": 0,
    "toxic": 0
  },
  "detections": {
    "normal": 5,
    "darksight": 0,
    "infravision": 0,
    "deadsight": 0,
    "echolocation": 0,
    "tremorsense": 0,
    "truesight": 0,
    "aethersight": 0
  },
  "immunities": {
    "afraid": false,
    "bleeding": false,
    "blinded": false,
    "charmed": false,
    "confused": false,
    "dazed": false,
    "diseased": false,
    "exhausted": false,
    "frightened": false,
    "grappled": false,
    "incapacitated": false,
    "invisible": false,
    "paralyzed": false,
    "petrified": false,
    "poisoned": false,
    "prone": false,
    "restrained": false,
    "stunned": false,
    "unconscious": false
  },
  "taming": {
    "tame_check": -1,
    "commands": "basic"
  },
  "actions": [
    {
      "name": "Basic Attack",
      "cost": 0,
      "type": "attack",
      "magic": false,
      "description": "Description of the attack and any secondary effects.",
      "reaction": false,
      "basic": true,
      "round": false,
      "daily": false,
      "spellType": "normal",
      "attack": {
        "roll": "2d6",
        "damage": "4",
        "damage_extra": "2",
        "damage_type": "physical",
        "category": "slash",
        "min_range": 1,
        "max_range": 1
      }
    }
  ],
  "reactions": [],
  "traits": [],
  "loot": [],
  "languages": [],
  "challenge_rating": 1,
  "source": "Official",
  "isHomebrew": false
}
```

---

## Quick Reference: PC Baseline (for balancing against)

| Stat | Starting PC | Experienced PC |
|------|-------------|----------------|
| Health | 20 | 25-30 |
| Resolve | 20 | 25-30 |
| Energy | 5 (recovery 3) | 6-8 (recovery 3) |
| Movement | 4-5 | 4-6 |
| Attributes | 1-4 (total 11) | 1-4 (total 11, rarely changes) |
| Weapon Dice | 1d6 to 3d10 | 3d10 to 4d12 |
| Weapon Damage | 3-5 primary, 2-3 extra | 5-8 primary, 3-5 extra |
| Armor Mitigation | Physical 0-4 | Physical 3-7 |
| Defense Dice | 1d4 to 3d10 | 2d8 to 4d12 |
