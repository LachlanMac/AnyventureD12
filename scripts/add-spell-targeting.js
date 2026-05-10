import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map of spell file paths to their targetCheck and delivery values
// Format: { "school/subschool/filename": { targetCheck, delivery } }
const spellTargeting = {
  // === ARCANE / CHAOS ===
  "arcane/chaos/2_entropy_bolt.json": { targetCheck: "defense", delivery: "projectile" },
  "arcane/chaos/3_distortion.json": { targetCheck: null, delivery: null },
  "arcane/chaos/4_chaos_step.json": { targetCheck: "resilience", delivery: "area" }, // charge: AoE on arrival
  "arcane/chaos/5_feedback.json": { targetCheck: null, delivery: null }, // reaction, targets attacker
  "arcane/chaos/6_anarchy.json": { targetCheck: "resilience", delivery: "area" },
  "arcane/chaos/7_erode.json": { targetCheck: "resilience", delivery: "direct" },
  "arcane/chaos/8_breach.json": { targetCheck: null, delivery: null },
  "arcane/chaos/9_catastrophe.json": { targetCheck: "defense", delivery: "projectile" },
  "arcane/chaos/10_chaos_tendril.json": { targetCheck: "defense", delivery: "direct" }, // tendril attacks
  "arcane/chaos/11_null_field.json": { targetCheck: null, delivery: "area" },
  "arcane/chaos/12_warp.json": { targetCheck: "endurance", delivery: "direct" },

  // === ARCANE / CONJURATION ===
  "arcane/conjuration/2_fetch.json": { targetCheck: null, delivery: null },
  "arcane/conjuration/3_arcane_nails.json": { targetCheck: "defense", delivery: "projectile" },
  "arcane/conjuration/4_arcane_armor.json": { targetCheck: null, delivery: null },
  "arcane/conjuration/5_assistant.json": { targetCheck: null, delivery: null },
  "arcane/conjuration/6_armoire.json": { targetCheck: null, delivery: null },
  "arcane/conjuration/7_array_of_blades.json": { targetCheck: "defense", delivery: "area" },
  "arcane/conjuration/8_summon.json": { targetCheck: null, delivery: null },
  "arcane/conjuration/9_armory.json": { targetCheck: null, delivery: null },
  "arcane/conjuration/10_platform.json": { targetCheck: null, delivery: null },
  "arcane/conjuration/11_bombardment.json": { targetCheck: "defense", delivery: "area" },
  "arcane/conjuration/12_haven.json": { targetCheck: null, delivery: null },

  // === ARCANE / ENCHANTMENT ===
  "arcane/enchantment/2_memory.json": { targetCheck: null, delivery: null },
  "arcane/enchantment/3_alliance.json": { targetCheck: null, delivery: null },
  "arcane/enchantment/4_sleep.json": { targetCheck: "resilience", delivery: "direct" },
  "arcane/enchantment/5_clarity.json": { targetCheck: null, delivery: null },
  "arcane/enchantment/6_sensory_enhancement.json": { targetCheck: null, delivery: null },
  "arcane/enchantment/7_compulsion.json": { targetCheck: "resilience", delivery: "direct" },
  "arcane/enchantment/8_cancel_magic.json": { targetCheck: null, delivery: null },
  "arcane/enchantment/9_dominate.json": { targetCheck: null, delivery: null },
  "arcane/enchantment/10_mind_palace.json": { targetCheck: null, delivery: null },
  "arcane/enchantment/11_enlightenment.json": { targetCheck: null, delivery: null },
  "arcane/enchantment/12_suspend.json": { targetCheck: null, delivery: null },

  // === BLACK / NECROMANCY ===
  "black/necromancy/2_dark_missile.json": { targetCheck: "defense", delivery: "projectile" },
  "black/necromancy/3_spirit_whisp.json": { targetCheck: null, delivery: null },
  "black/necromancy/4_fear.json": { targetCheck: "resilience", delivery: "direct" },
  "black/necromancy/5_ebony_shield.json": { targetCheck: null, delivery: null },
  "black/necromancy/6_walking_corpse.json": { targetCheck: null, delivery: null },
  "black/necromancy/7_tainted_breath.json": { targetCheck: "endurance", delivery: "area" },
  "black/necromancy/8_word_of_death.json": { targetCheck: "resilience", delivery: "direct" },
  "black/necromancy/9_dark_debt.json": { targetCheck: null, delivery: null },
  "black/necromancy/10_death_ray.json": { targetCheck: "defense", delivery: "projectile" },
  "black/necromancy/11_brittle_bones.json": { targetCheck: "endurance", delivery: "direct" },
  "black/necromancy/12_siphon.json": { targetCheck: "endurance", delivery: "direct" },

  // === BLACK / WITCHCRAFT ===
  "black/witchcraft/2_hemorrhage.json": { targetCheck: "endurance", delivery: "direct" },
  "black/witchcraft/3_bind_sight.json": { targetCheck: null, delivery: null },
  "black/witchcraft/4_curse.json": { targetCheck: "resilience", delivery: "direct" },
  "black/witchcraft/5_read_thoughts.json": { targetCheck: "concentration", delivery: "direct" },
  "black/witchcraft/6_poison_ray.json": { targetCheck: "defense", delivery: "projectile" },
  "black/witchcraft/7_witch_brew.json": { targetCheck: null, delivery: null },
  "black/witchcraft/8_pins_and_needles.json": { targetCheck: "coordination", delivery: "direct" },
  "black/witchcraft/9_break_enchantment.json": { targetCheck: null, delivery: null },
  "black/witchcraft/10_possess_object.json": { targetCheck: null, delivery: null },
  "black/witchcraft/11_malediction.json": { targetCheck: null, delivery: null }, // static RC, out of combat
  "black/witchcraft/12_spite.json": { targetCheck: "resilience", delivery: "direct" },

  // === BLACK / FIEND ===
  "black/fiend/2_detect_humanoid.json": { targetCheck: null, delivery: null },
  "black/fiend/3_fiendish_whip.json": { targetCheck: null, delivery: null },
  "black/fiend/4_blood_shield.json": { targetCheck: null, delivery: null },
  "black/fiend/5_gathering_shadows.json": { targetCheck: null, delivery: null },
  "black/fiend/6_fiendflesh.json": { targetCheck: null, delivery: null },
  "black/fiend/7_incendium.json": { targetCheck: "resilience", delivery: "direct" },
  "black/fiend/8_change_form.json": { targetCheck: null, delivery: null },
  "black/fiend/9_influence.json": { targetCheck: "resilience", delivery: "direct" },
  "black/fiend/10_mind_eater.json": { targetCheck: "concentration", delivery: "direct" },
  "black/fiend/11_torment.json": { targetCheck: null, delivery: null },
  "black/fiend/12_devilfire.json": { targetCheck: "resilience", delivery: "direct" },

  // === PRIMAL / ELEMENTAL ===
  "primal/elemental/2_shock.json": { targetCheck: "resilience", delivery: "direct" },
  "primal/elemental/2_weaponized_pebbles.json": { targetCheck: "defense", delivery: "projectile" },
  "primal/elemental/3_burn.json": { targetCheck: "defense", delivery: "direct" },
  "primal/elemental/3_conjure_elements.json": { targetCheck: null, delivery: null },
  "primal/elemental/4_mantle.json": { targetCheck: null, delivery: null },
  "primal/elemental/4_sand_slinger.json": { targetCheck: "coordination", delivery: "direct" },
  "primal/elemental/5_icicles.json": { targetCheck: "defense", delivery: "projectile" },
  "primal/elemental/5_windwall.json": { targetCheck: null, delivery: null },
  "primal/elemental/6_earthen_pocket.json": { targetCheck: null, delivery: null },
  "primal/elemental/6_flamethrower.json": { targetCheck: "defense", delivery: "area" },
  "primal/elemental/7_electrocute.json": { targetCheck: "defense", delivery: "projectile" },
  "primal/elemental/7_ground.json": { targetCheck: null, delivery: null },
  "primal/elemental/8_flamewhorl.json": { targetCheck: "defense", delivery: "projectile" },
  "primal/elemental/8_freezeray.json": { targetCheck: "defense", delivery: "projectile" },
  "primal/elemental/9_jagged_spear.json": { targetCheck: "defense", delivery: "projectile" },
  "primal/elemental/9_summon_elemental.json": { targetCheck: null, delivery: null },
  "primal/elemental/10_shock_field.json": { targetCheck: "resilience", delivery: "area" },
  "primal/elemental/11_fireball.json": { targetCheck: "defense", delivery: "area" },
  "primal/elemental/12_absolute_zero.json": { targetCheck: "resilience", delivery: "area" },

  // === PRIMAL / NATURE ===
  "primal/nature/2_dew_frost.json": { targetCheck: "resilience", delivery: "direct" },
  "primal/nature/3_nature_sense.json": { targetCheck: null, delivery: null },
  "primal/nature/4_petrify_wood.json": { targetCheck: null, delivery: null },
  "primal/nature/5_beast_speak.json": { targetCheck: null, delivery: null },
  "primal/nature/6_camouflage.json": { targetCheck: null, delivery: null },
  "primal/nature/7_sprouting_thorns.json": { targetCheck: null, delivery: null },
  "primal/nature/8_decompose.json": { targetCheck: "resilience", delivery: "direct" },
  "primal/nature/9_charm_beast.json": { targetCheck: "resilience", delivery: "direct" },
  "primal/nature/10_eyes_of_the_eagle.json": { targetCheck: null, delivery: null },
  "primal/nature/11_harmony.json": { targetCheck: "resilience", delivery: "direct" },
  "primal/nature/12_awaken.json": { targetCheck: null, delivery: null },

  // === PRIMAL / DRACONIC ===
  "primal/draconic/2_silver_tongue.json": { targetCheck: null, delivery: null },
  "primal/draconic/3_rake.json": { targetCheck: "defense", delivery: "direct" },
  "primal/draconic/4_presence.json": { targetCheck: "resilience", delivery: "area" },
  "primal/draconic/5_wyrmfire.json": { targetCheck: "resilience", delivery: "area" },
  "primal/draconic/6_iridescent_scales.json": { targetCheck: null, delivery: null },
  "primal/draconic/7_salve.json": { targetCheck: null, delivery: null },
  "primal/draconic/8_dragon_raystrike.json": { targetCheck: "defense", delivery: "projectile" },
  "primal/draconic/9_decree.json": { targetCheck: "resilience", delivery: "direct" },
  "primal/draconic/10_claim.json": { targetCheck: null, delivery: null },
  "primal/draconic/11_chromatic_flames.json": { targetCheck: "defense", delivery: "projectile" },
  "primal/draconic/12_ascension.json": { targetCheck: null, delivery: null },

  // === META / TRANSMUTATION ===
  "meta/transmutation/2_repair.json": { targetCheck: null, delivery: null },
  "meta/transmutation/3_elastic_limbs.json": { targetCheck: null, delivery: null },
  "meta/transmutation/4_beckon.json": { targetCheck: null, delivery: null },
  "meta/transmutation/5_levitate.json": { targetCheck: null, delivery: null },
  "meta/transmutation/6_fracture.json": { targetCheck: "endurance", delivery: "direct" },
  "meta/transmutation/7_breach_beam.json": { targetCheck: "defense", delivery: "projectile" },
  "meta/transmutation/8_lock_unlock.json": { targetCheck: null, delivery: null },
  "meta/transmutation/9_chassis.json": { targetCheck: null, delivery: null },
  "meta/transmutation/10_shapeshift.json": { targetCheck: null, delivery: null },
  "meta/transmutation/11_transmute_metal.json": { targetCheck: "coordination", delivery: "direct" },
  "meta/transmutation/12_dematerialize.json": { targetCheck: "endurance", delivery: "direct" },

  // === META / ILLUSION ===
  "meta/illusion/2_illusify.json": { targetCheck: null, delivery: null },
  "meta/illusion/3_illusion.json": { targetCheck: null, delivery: null }, // passive detection, not an attack
  "meta/illusion/4_phantom_pain.json": { targetCheck: "logic", delivery: "direct" },
  "meta/illusion/5_allure.json": { targetCheck: null, delivery: null },
  "meta/illusion/6_smoke_cloud.json": { targetCheck: null, delivery: "area" },
  "meta/illusion/7_shift.json": { targetCheck: null, delivery: null },
  "meta/illusion/8_dazzle.json": { targetCheck: "concentration", delivery: "area" },
  "meta/illusion/9_magical_disguise.json": { targetCheck: null, delivery: null },
  "meta/illusion/10_invisibility.json": { targetCheck: null, delivery: null },
  "meta/illusion/11_mindrub.json": { targetCheck: "concentration", delivery: "direct" },
  "meta/illusion/12_waking_nightmare.json": { targetCheck: "resilience", delivery: "direct" },

  // === META / FEY ===
  "meta/fey/2_glitteray.json": { targetCheck: "defense", delivery: "projectile" },
  "meta/fey/3_malice.json": { targetCheck: "resilience", delivery: "direct" },
  "meta/fey/4_etherblink.json": { targetCheck: null, delivery: null },
  "meta/fey/5_clumsy.json": { targetCheck: "resilience", delivery: "direct" },
  "meta/fey/6_tricksy.json": { targetCheck: "concentration", delivery: "direct" },
  "meta/fey/7_feyfire.json": { targetCheck: "resilience", delivery: "projectile" },
  "meta/fey/8_polify.json": { targetCheck: "resilience", delivery: "direct" },
  "meta/fey/9_befriendment.json": { targetCheck: "resilience", delivery: "direct" },
  "meta/fey/10_tonguetwister.json": { targetCheck: "concentration", delivery: "direct" },
  "meta/fey/11_scatterdust.json": { targetCheck: "concentration", delivery: "area" },
  "meta/fey/12_feywild_form.json": { targetCheck: null, delivery: null },

  // === WHITE / PROTECTION ===
  "white/protection/2_radiant_aegis.json": { targetCheck: null, delivery: null },
  "white/protection/3_courage.json": { targetCheck: null, delivery: null },
  "white/protection/3_repulsing_ray.json": { targetCheck: "fitness", delivery: "projectile" },
  "white/protection/4_invigorate.json": { targetCheck: null, delivery: null },
  "white/protection/5_abjure.json": { targetCheck: null, delivery: null },
  "white/protection/6_sanctuary.json": { targetCheck: null, delivery: null },
  "white/protection/7_banish.json": { targetCheck: "resilience", delivery: "direct" },
  "white/protection/8_riftbolt.json": { targetCheck: "defense", delivery: "projectile" },
  "white/protection/9_restore.json": { targetCheck: null, delivery: null },
  "white/protection/10_resolution.json": { targetCheck: null, delivery: null },
  "white/protection/11_remove_curse.json": { targetCheck: null, delivery: null },
  "white/protection/12_mass_aegis.json": { targetCheck: null, delivery: null },

  // === WHITE / RADIANT ===
  "white/radiant/2_favor.json": { targetCheck: null, delivery: null },
  "white/radiant/3_faith_shield.json": { targetCheck: null, delivery: null },
  "white/radiant/4_mend_wounds.json": { targetCheck: null, delivery: null },
  "white/radiant/5_valor.json": { targetCheck: null, delivery: null },
  "white/radiant/6_chasten.json": { targetCheck: null, delivery: null },
  "white/radiant/7_ward_the_dead.json": { targetCheck: null, delivery: null }, // auto-hit undead
  "white/radiant/8_prayer.json": { targetCheck: null, delivery: null },
  "white/radiant/9_tend_the_wounded.json": { targetCheck: null, delivery: null },
  "white/radiant/10_repentance.json": { targetCheck: "resilience", delivery: "projectile" },
  "white/radiant/11_miracle.json": { targetCheck: null, delivery: null },
  "white/radiant/12_destroy_darkness.json": { targetCheck: "resilience", delivery: "direct" },

  // === WHITE / CELESTIAL ===
  "white/celestial/2_detect_evil.json": { targetCheck: null, delivery: null },
  "white/celestial/3_command.json": { targetCheck: "resilience", delivery: "direct" },
  "white/celestial/4_strike_of_faith.json": { targetCheck: null, delivery: null },
  "white/celestial/5_divine_protection.json": { targetCheck: null, delivery: null },
  "white/celestial/6_chorus.json": { targetCheck: "resilience", delivery: "area" },
  "white/celestial/7_holy_fire.json": { targetCheck: "resilience", delivery: "direct" },
  "white/celestial/8_halo.json": { targetCheck: "endurance", delivery: "area" },
  "white/celestial/9_holy_messenger.json": { targetCheck: "defense", delivery: "area" },
  "white/celestial/10_true_form.json": { targetCheck: null, delivery: null },
  "white/celestial/11_paladins_wrath.json": { targetCheck: "defense", delivery: "projectile" },
  "white/celestial/12_eye_of_the_seraphim.json": { targetCheck: "defense", delivery: "projectile" },

  // === MYSTICISM / SPIRIT ===
  "mysticism/spirit/2_spirit_strike.json": { targetCheck: "resilience", delivery: "direct" },
  "mysticism/spirit/3_message.json": { targetCheck: null, delivery: null },
  "mysticism/spirit/4_ghost_hand.json": { targetCheck: null, delivery: null },
  "mysticism/spirit/5_rekindle.json": { targetCheck: null, delivery: null },
  "mysticism/spirit/6_commune.json": { targetCheck: null, delivery: null },
  "mysticism/spirit/7_spirit_shroud.json": { targetCheck: null, delivery: null },
  "mysticism/spirit/8_wraith_blade.json": { targetCheck: null, delivery: null },
  "mysticism/spirit/9_restore.json": { targetCheck: null, delivery: null },
  "mysticism/spirit/10_sunder.json": { targetCheck: "resilience", delivery: "direct" },
  "mysticism/spirit/11_soul_tether.json": { targetCheck: "resilience", delivery: "direct" },
  "mysticism/spirit/12_reincarnation.json": { targetCheck: null, delivery: null },

  // === MYSTICISM / DIVINATION ===
  "mysticism/divination/2_omen.json": { targetCheck: null, delivery: null },
  "mysticism/divination/3_throw_presence.json": { targetCheck: null, delivery: null },
  "mysticism/divination/4_decipher.json": { targetCheck: null, delivery: null },
  "mysticism/divination/5_jinx.json": { targetCheck: null, delivery: null },
  "mysticism/divination/6_portent.json": { targetCheck: null, delivery: null },
  "mysticism/divination/7_paradox.json": { targetCheck: null, delivery: null },
  "mysticism/divination/8_alacrity.json": { targetCheck: null, delivery: null },
  "mysticism/divination/9_impending_doom.json": { targetCheck: null, delivery: null },
  "mysticism/divination/10_project.json": { targetCheck: null, delivery: null },
  "mysticism/divination/11_glimpse.json": { targetCheck: null, delivery: null },
  "mysticism/divination/12_hold_fate.json": { targetCheck: null, delivery: null },

  // === MYSTICISM / COSMIC ===
  "mysticism/cosmic/2_star_lantern.json": { targetCheck: null, delivery: null },
  "mysticism/cosmic/3_astral_armor.json": { targetCheck: null, delivery: null },
  "mysticism/cosmic/4_ray_of_starlight.json": { targetCheck: "defense", delivery: "projectile" },
  "mysticism/cosmic/5_orbit.json": { targetCheck: "defense", delivery: "projectile" },
  "mysticism/cosmic/6_polarity.json": { targetCheck: "fitness", delivery: "direct" },
  "mysticism/cosmic/7_comet.json": { targetCheck: "defense", delivery: "direct" },
  "mysticism/cosmic/8_gravity_flux.json": { targetCheck: null, delivery: null },
  "mysticism/cosmic/9_cosmic_vision.json": { targetCheck: null, delivery: null },
  "mysticism/cosmic/10_sunflare.json": { targetCheck: "defense", delivery: "projectile" },
  "mysticism/cosmic/11_starfall.json": { targetCheck: "defense", delivery: "area" },
  "mysticism/cosmic/12_astral_gateway.json": { targetCheck: null, delivery: null },
};

const spellsDir = path.join(__dirname, '..', 'data', 'spells');
let updated = 0;
let skipped = 0;

for (const [relativePath, targeting] of Object.entries(spellTargeting)) {
  const filePath = path.join(spellsDir, relativePath);

  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${relativePath}`);
    skipped++;
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.targetCheck = targeting.targetCheck;
  data.delivery = targeting.delivery;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  updated++;
}

console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
