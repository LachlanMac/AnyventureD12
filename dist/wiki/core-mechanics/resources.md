# Resources

All characters have resources that they need to manage. These include Health, Resolve, Morale and Energy.

## Health
<div class="triangle-line"></div>
All characters have health which is an abstraction of how close to death they are. By default, a player character has 20 health. This number is able to be improved by certain traits in modules as well as equipment.


### Recovering Health
Losing and managing health is a large part of AnyventureDX. Character's have several ways of recovering health, but the most simple is **resting**. When a character completes a full rest with favorable conditions, such as staying in an inn or a safe and sheltered location, they recover 4 health. If they complete a full rest in unfavorable conditions, like a tent or sleeping on the ground, they recover 2 health.

<br>

There are also several ways to recover health:
- Potions
- Treatment from someone with the Medic Module
- Magic
- Items and Skills that impact your regeneration rate

### Reaching 0 Health
When a character reaches 0 health, they are not immediately dead. A player can have their character and continue to fight on, although at great risk using their resolve. At the start of their turn where they have 0 health, a player can spend 2 resolve to continue to take a turn as normal. This is considered being in **lifeline**. 

When a character takes more than 5 damage while in lifeline, they must roll on the lifeline table:

### Lifeline Table (Roll 1d8)

| Roll | Result |
|------|--------|
| 1 | **Death Check** - You make a death check by rolling a d12. On a 7 or lower, you die. Otherwise, you fall unconscious. |
| 2 | **Lost Limb** - One of your limbs is either severed or mangled beyond repair without high level magic. |
| 3 | **Lingering Injury** - You receive an injury that is not permanent but will take some time to heal. This can include losing eyesight, hearing or damaging a limb. |
| 4 | **Severe Wound** - You receive a wound so dire, you will never truly recover. Your maximum health is permanently lowered by 1 and gain the bleeding condition.|
| 5 | **Cosmetic Injury** - You receive a cosmetic injury such as a massive gash, severed ear or broken horn. |
| 6 | **Fall Unconscious** - You are unable to stay conscious and drop where you stand. |
| 7 | **Fall Prone** - You are unable to stay on your feet. If you attempt to stand back up you must make a resilience or endurance check of 15 or higher. |
| 8 | **Nothing Happens** - Adrenaline and luck carry you through as you shrug off the blow |


### Going Unconscious
When a character falls unconscious due to having 0 health, they will regain consciousness in 1 hour if they gain at least 10 health back. Otherwise, they use the normal rules for recovering from being unconscious listed in [Conditions](/wiki/conditions).

## Resolve
<div class="triangle-line"></div>
Resolve is a representation of mental health. By default, a player character has 20 resolve. There are many ways to gain and lose resolve during a campaign, and much of that will vary by the type of game you are playing in. A game with horror elements may
see resolve being tested much more often. Likewise, a game with lots of combats with opponents who employ skills and spells that deal psychic damage will also test resolve. 

### Recovering Resolve
Recovering resolve is not always cut or dry. Unlike health, players do not recover resolve over time and instead must actively see out activities or consumables that help them mentally recover. Consumables are the easiest way to recover resolve; anything from a homecooked meal to dangerous, addictive substances. 

### Reaching 0 Resolve
When a character reaches 0 resolve, they become vulnerable to several mental breaks after gaining the Broken [Condition](/wiki/conditions). 



## Morale
<div class="triangle-line"></div>
Morale is a buffer that sits between Health and Resolve. If there is ever a situation where a character would take damage to either resource, the damage would be first done to morale. A player character by default has 0 morale, but can store a maximum of 20.



## Energy
<div class="triangle-line"></div>
Energy is a short term resource that determines how much a character can exert on a single round of combat. By default, a character has 5 energy and regenerates 3 per turn.

A character can use more energy than they have at the risk of becoming winded. When a character has negative energy, they must immediately make an endurance check of 10 or become winded. The winded condition and it's effects are described in [Condition](/wiki/conditions). 


## Wonder & Woe
<div class="triangle-line"></div>
Wonder and woe are a sort of meta currency that can be obtained through various means. The awarding of these currencies is done by the GM when an event of note occurs. Depending on the event, these can be given to the entire party or just an individual character.

A character can only have 1 wonder and 1 woe at a single time and either can be cashed in at any moment, even when it is not the character's turn.

### Wonder
Throughout an adventure, characters will experience great triumphs that they can lean on in times of need. When a creature has wonder, they gain 1 resolve at the end of a full rest.

Reasons to award **wonder**:
- Defeated an Elite Tier creature
- Completed an important goal
- Made an epic discovery
- Did something heroic

Uses of **wonder**

  | Wonder Ability Name    | Description |
  |------------------------|-------------|
  | Immediate Morale Boost | The character immediately gains 10 morale. If they have the numb or broken condition, it is removed.            |
  | Mental Recovery        | Immediately recover from any mental condition, besides the numb or broken condition.|
  | Enhanced Crafting      | Guarantee an extra overcraft on a crafted item.            |
  | Inspirational Song     | Learn or upgrade the **Song of Inspiration** template by one tier |            |

### Woe
Not even adventurers are immune from the despair and grief that can accumulate over time. When a creature has woe, they take 1 damage to their resolve at the end of a full rest.

Reasons to award **woe**:
- The death of an ally
- The failure of a goal
- A serious betrayal
- Recovering from the broken condition

<div class="note-box">
    Whenever you cash in a woe, you gain the numbed condition.
</div>

Uses of **woe**

  | Woe Ability Name | Description |
  |------------------|-------------|
  | Empowered Performance| Double a performance check             |
  | Inspirational Song     | Learn or upgrade the **Song of Lament** template by one tier |    
  | Desperate Flurry | For the next minute, you have an additional action on your turn that you can only use to attack. Each time you use it, it costs 2 resolve. |
  | Desperate Spell  | Put your soul into channeling, casting a spell with **manaburn** that deals double damage to you, but also cannot fail. This can be used even while not on your turn.             |
