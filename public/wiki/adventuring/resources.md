# Resources

All characters have resources that they need to manage. These include Health, Resolve, Morale and Energy.

## Health
<div class="triangle-line"></div>
All characters have health which is an abstraction of how close to death they are. By default, a player character has 20 health. This number is able to be improved by certain traits in modules as well as equipment.


### Recovering Health
Losing and managing health is a large part of AnyventureDX. Character's have several ways of recovering health, but the most simple is **resting**. When a character completes a full rest with favorable conditions, such as staying in an inn or a safe and sheltered location, they recover 4 health. If they complete a full rest in unfavorable conditions, like a tent or sleeping on the ground, they only recover 2 health.

<br>

There are also several ways to recover health:
- Potions
- Treatment from someone with the Medic Module
- Magic
- Items and Skills that impact your regeneration rate

### Reaching 0 Health
When a character reaches 0 health, they are not immediately dead. A player can have their character and continue to fight on, although at great risk using their resolve. At the start of their turn where they have 0 health, a player can spend 2 resolve to continue to take a turn as normal. This is considered being in **lifeline**. Once in lifeline, any further damage that would normally be taken as damage to health, is instead deducted from resolve.

<div class="example-box">
An arcane archer had their position compromised and have two angry goblins surrounding them. The battle has turned for the worse, and our hero is at 5 health. One of the goblins manages to land a brutal blow for 9 physical damage. The arcane archer reduces their health to 0 and enters lifeline. No other action is needed at this point.
</div>

When a character takes 10 or more damage while in lifeline, they must roll on the lifeline table:

### Lifeline Table (Roll 1d10)

| Roll | Result |
|------|--------|
| 1 | **Death** - You die immediately. |
| 2 | **Missing Part** - One of your limbs or body parts is either severed or mangled beyond repair without high level magic. |
| 3 | **Severe Physical Injury** - You receive a severe physical injury that increases pain by 3. |
| 4 | **Severe Mental Injury** - You receive a severe mental injury that increases stress by 3. |
| 5 | **Major Physical Injury** - You receive a major physical injury that increases pain by 2. |
| 6 | **Major Mental Injury** - You receive a major mental injury that increases stress by 2. |
| 7 | **Minor Physical Injury** - You receive a minor physical injury that increases pain by 1. |
| 8 | **Minor Mental Injury** - You receive a minor mental injury that increases stress by 1. |
| 9 | **Cosmetic Injury** - You receive a cosmetic injury such as a massive gash, severed ear or broken horn. |
| 10 | **Nothing Happens** - Adrenaline and luck carry you through as you shrug off the blow. |

<div class="example-box">
It is the arcane archer's turn, and the first thing they have to do is decide if they want to risk staying up and fighting or going down. Because of their predicament; two goblins surrounding them with no  help on the way, they have no choice but to spend 2 resolve to take a turn instead of falling unconscious. They  attempt to make a daring escape and use their movement to create as much distance as they can. Both the goblins take attacks of opportunity, with one hitting our hero and dealing 4 physical damage. Because the arcane
archer is in lifeline and has 0 health, they take 4 more damage to resolve. However, because the damage is not 10 or higher, they do not need to roll on the Lifeline table.
</div>



### Going Unconscious
When a character falls unconscious due to having 0 health, they will regain consciousness in 1 hour if they gain at least 10 health back. Otherwise, they use the normal rules for recovering from being unconscious listed in [Conditions](/wiki/conditions).

<div class="example-box">
The archer manages to take out one of the goblins, but the situation is looking dire when the second scores a critical hit dealing a total of 11 damage. Because this is over the threshold, the arcane archer must roll on the lifeline table and take the damage to resolve. They roll a 1d10 and land on a 9, getting fairly lucky with a cosmetic injury. However; once it comes to their turn again, they only have 3 resolve remaining. They have no choice but to spend 2 of it, knowing that this is their last turn of consciousness and make a desperate attack with a melee weapon. Success! The goblin falls.
</div>


## Resolve
<div class="triangle-line"></div>
Resolve is a representation of mental health. By default, a player character has 20 resolve. There are many ways to gain and lose resolve during a campaign, and much of that will vary by the type of game you are playing in. A game with horror elements may
see resolve being tested much more often. Likewise, a game with lots of combats with opponents who employ skills and spells that deal psychic damage will also test resolve.

### Recovering Resolve
Recovering resolve is not always cut or dry. Unlike health, players do not recover resolve over time and instead must actively see out activities or consumables that help them mentally recover. Consumables are the easiest way to recover resolve; anything from a homecooked meal to dangerous, addictive substances.

### Reaching 0 Resolve
When a character reaches 0 resolve, they become vulnerable to several mental breaks after gaining the Broken [Condition](/wiki/conditions).


<div class="example-box">
Our bloodied arcane archer stand over the corpses of the two goblins. Rather than naturally dropping to 0 resolve which would result in hte broken condition, they elect on their next turn to fall unconscious. Because they are not bleeding and the threat seems to have been eliminated, this is the safest option.
</div>

## Morale
<div class="triangle-line"></div>
Morale is a buffer that sits between Health and Resolve. If there is ever a situation where a character would take damage to either resource, the damage would be first done to morale. A player character by default has 0 morale, but can store a maximum of 10.


## Energy
<div class="triangle-line"></div>
Energy is a short term resource that determines how much a character can exert on a single round of combat. By default, a character has 5 energy and regenerates 3 at the start of their turn.

A character can use more energy than they have at the risk of becoming winded. When a character has negative energy, they must immediately make an endurance check of 10 or become winded. The winded condition and it's effects are described in [Condition](/wiki/conditions).
