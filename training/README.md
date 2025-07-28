# Anyventure Training Data

This folder contains JSONL training data for fine-tuning language models on the Anyventure TTRPG system.

## File Structure

Each JSONL file contains training examples in the format:
```json
{"input": "question or prompt", "output": "accurate system response"}
```

## Current Files

- `dice_and_skills.jsonl` (20 examples) - Core dice mechanics, skill checks, talents, helping others
- `combat_and_damage.jsonl` (20 examples) - Combat rules, damage calculation, weapon talents, defenses
- `magic_and_spells.jsonl` (20 examples) - Spellcasting, magic schools, rituals, spell learning
- `character_creation.jsonl` (20 examples) - Character creation process, attributes, races, cultures
- `resources_and_conditions.jsonl` (20 examples) - Health, resolve, energy, conditions, wonder/woe

Total: 100 examples covering core game rules

## Usage

These files are designed for training a 13B MythoMax model to understand and explain Anyventure game mechanics accurately.

## Adding More Data

When adding new training data:
1. Keep the {"input": "", "output": ""} format
2. Ensure outputs are accurate to the game rules
3. Group related concepts in the same file
4. Aim for clear, concise responses
5. Cover both basic questions and edge cases

## Future Categories

Planned additional training files:
- Modules and progression
- Crafting systems
- Languages
- Movement and ranges
- Specific creature rules
- GM-specific rules