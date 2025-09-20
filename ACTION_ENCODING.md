# Action and Reaction Encoding System

This document describes the encoding system for actions and reactions in module data fields.

## Format
Actions and reactions are encoded in a single field using type prefix followed by properties and energy cost.

### Basic Format
```
[Type][Frequency][Magic]E=[Energy Cost]
```

## Type Prefix
- `X` = Action
- `Z` = Reaction
- `Y` = Both (Action & Reaction)
- `F` = Free Action
- `D` = Downtime Action

## Frequency (2nd character)
- `I` = Instant (can use multiple times, default)
- `D` = Daily (once per day)
- `C` = Combat (once per combat)
- `T` = Target (once per target)

## Magic Type (3rd character)
- `N` = Non-magical (default)
- `M` = Magical

## Energy Cost (E=number)
- `E` followed by number = Energy cost
- Default is 1 if not specified

## Examples

### Basic Action (instant, non-magical, 1 energy)
```
XINE=1
```
or just omit since these are defaults

### Daily Magical Action (costs 2 energy)
```
XDME=2
```

### Instant Non-magical Reaction (costs 1 energy)
```
ZINE=1
```

### Once per combat Magical Action (costs 3 energy)
```
XCME=3
```

### Daily Non-magical Reaction (costs 2 energy)
```
ZDNE=2
```

### Free Action (no energy cost)
```
FINE=0
```

### Downtime Action (daily by nature)
```
DDNE=0
```

### Both Action and Reaction (instant, non-magical, 1 energy)
```
YINE=1
```

### Daily Both Action/Reaction (magical, 2 energy)
```
YDME=2
```

## Module Option Example
```json
{
  "name": "Action : Triage",
  "description": "You quickly stabilize an ally's condition...",
  "location": "2a",
  "data": "SSP=1:XTNE=1"
}
```

This encodes:
- Medicine skill +1 (`SSP=1`)
- Action, once per Target, Non-magical, costs 1 Energy (`XTNE=1`)

## More Examples

### Module with multiple abilities
```json
{
  "name": "Reaction : Emergency Response",
  "description": "In response to an ally dropping to 0 health...",
  "location": "2b",
  "data": "ZINE=2"
}
```
- Reaction, Instant use, Non-magical, costs 2 Energy

```json
{
  "name": "Daily Reaction : Backup Plan",
  "description": "Once per day, when you would fail...",
  "location": "3a",
  "data": "ZDNE=1"
}
```
- Reaction, Daily use, Non-magical, costs 1 Energy

## Default Values
If an action/reaction has no special encoding:
- Type: Determined by name prefix
- Frequency: Instant (I)
- Magic: Non-magical (N)
- Energy: 1

## Parsing Notes
1. The parser looks for patterns matching `[XYZFD][IDCT][NM]E=\d+`
2. Actions are identified by their name containing "Action" or "Reaction"
3. The encoding supplements the name-based identification
4. Properties can be extracted and stored with the action/reaction data

## Integration with Character Model
When a character learns a module option with an action/reaction:
1. Parse the name to identify it as an action/reaction
2. Extract properties from the data field encoding
3. Store in the character's actions array with decoded properties