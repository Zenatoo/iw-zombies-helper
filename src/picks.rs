//! Choices the window offers for the iw7-mod script: Fate & Fortune cards, weapons, crafted traps,
//! special zombies, places to go to, the zombies' speed and the steps of a map's main quest. The script holds the same lists in the same order (`pick_list` in
//! iw7-mod/custom_scripts/cp/iw_helper.gsc) and receives `base + index`; a test checks they match.

use crate::lang::tr;

/// One choice: the script's name for it, then its label in English and in French.
pub struct Entry {
    pub script: &'static str,
    pub en: &'static str,
    pub fr: &'static str,
}

impl Entry {
    pub fn label(&self) -> &'static str {
        tr(self.en, self.fr)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Pick {
    Card,
    Weapon,
    Craftable,
    Zombie,
    Place,
    Pace,
    Quest,
}

impl Pick {
    pub const ALL: [Pick; 7] = [Pick::Card, Pick::Weapon, Pick::Craftable, Pick::Zombie, Pick::Place, Pick::Pace, Pick::Quest];

    /// Name used by the interface, and by the script for its list.
    pub fn key(self) -> &'static str {
        match self {
            Pick::Card => "card",
            Pick::Weapon => "weapon",
            Pick::Craftable => "craftable",
            Pick::Zombie => "zombie",
            Pick::Place => "place",
            Pick::Pace => "pace",
            Pick::Quest => "quest",
        }
    }

    pub fn parse(key: &str) -> Option<Self> {
        Self::ALL.into_iter().find(|pick| pick.key() == key)
    }

    pub fn label(self) -> &'static str {
        match self {
            Pick::Card => tr("Fate & Fortune card", "Carte Fate & Fortune"),
            Pick::Weapon => tr("Weapon", "Arme"),
            Pick::Craftable => tr("Crafted trap", "Piège à fabriquer"),
            Pick::Zombie => tr("Spawn a zombie", "Faire apparaître un zombie"),
            Pick::Place => tr("Go to", "Aller à"),
            Pick::Pace => tr("Zombie speed", "Vitesse des zombies"),
            Pick::Quest => tr("Easter egg step", "Étape d'easter egg"),
        }
    }

    pub fn hint(self) -> &'static str {
        match self {
            Pick::Card => tr(
                "Its effect starts right away, without using a card from your deck. A card with a duration stops at its end.",
                "Son effet démarre tout de suite, sans utiliser de carte du paquet. Une carte à durée s'arrête à la fin.",
            ),
            Pick::Weapon => tr(
                "In place of the one in hand if you carry the maximum. Only weapons the current map has.",
                "À la place de celle en main si vous êtes plein. Seulement les armes que la carte en cours possède.",
            ),
            Pick::Craftable => tr(
                "Ready to place, as if built at the crafting station. Only on the maps named.",
                "Prêt à poser, comme s'il sortait de l'atelier. Seulement sur les cartes indiquées.",
            ),
            Pick::Zombie => tr(
                "Appears a few steps in front of you. Only the kinds the current map has; bosses are not offered.",
                "Apparaît à quelques pas devant vous. Seulement les types que la carte possède ; les boss ne sont pas proposés.",
            ),
            Pick::Place => tr(
                "Teleports you there. Again for the next one of the same kind, when the map has several.",
                "Vous y téléporte. Encore une fois pour le suivant du même genre, quand la carte en a plusieurs.",
            ),
            Pick::Pace => tr(
                "For every zombie, new ones included, until set back to Normal.",
                "Pour tous les zombies, nouveaux compris, jusqu'au retour à Normale.",
            ),
            Pick::Quest => tr(
                "Validates the step you are at in the map's main quest. A step not reached yet does nothing: choose the one in progress.",
                "Valide l'étape où vous en êtes dans la quête principale de la carte. Une étape pas encore atteinte ne fait rien : choisissez celle en cours.",
            ),
        }
    }

    pub fn button(self) -> &'static str {
        match self {
            Pick::Card => tr("Use", "Utiliser"),
            Pick::Weapon | Pick::Craftable => tr("Get", "Obtenir"),
            Pick::Zombie => tr("Spawn", "Faire apparaître"),
            Pick::Place => tr("Go", "Y aller"),
            Pick::Pace => tr("Apply", "Appliquer"),
            Pick::Quest => tr("Validate", "Valider"),
        }
    }

    /// Name of the shortcut that repeats the last choice made in this list.
    pub fn repeat_key(self) -> String {
        format!("repeat_{}", self.key())
    }

    /// Label of that shortcut.
    pub fn repeat_label(self) -> &'static str {
        match self {
            Pick::Card => tr("Last card chosen", "Dernière carte choisie"),
            Pick::Weapon => tr("Last weapon chosen", "Dernière arme choisie"),
            Pick::Craftable => tr("Last trap chosen", "Dernier piège choisi"),
            Pick::Zombie => tr("Last zombie chosen", "Dernier zombie choisi"),
            Pick::Place => tr("Last place chosen", "Dernier endroit choisi"),
            Pick::Pace => tr("Last zombie speed chosen", "Dernière vitesse choisie"),
            Pick::Quest => tr("Last easter egg step chosen", "Dernière étape d'easter egg choisie"),
        }
    }

    /// Not seen working in game yet.
    pub fn trial(self) -> bool {
        true
    }

    pub fn entries(self) -> &'static [Entry] {
        match self {
            Pick::Card => &CARDS,
            Pick::Weapon => &WEAPONS,
            Pick::Craftable => &CRAFTABLES,
            Pick::Zombie => &ZOMBIES,
            Pick::Place => &PLACES,
            Pick::Pace => &PACES,
            Pick::Quest => &QUEST_STEPS,
        }
    }

    /// Command number for the script: the list's base plus the index, if the index is in the list.
    pub fn code(self, index: usize) -> Option<i32> {
        let base = match self {
            Pick::Card => 100,
            Pick::Weapon => 200,
            Pick::Craftable => 300,
            Pick::Zombie => 320,
            Pick::Place => 400,
            Pick::Pace => 420,
            Pick::Quest => 440,
        };
        (index < self.entries().len()).then(|| base + index as i32)
    }
}

// Cards: the game's table (cp/loot/iw7_zombiefatefortune_loot_master.csv) with their English names,
// without Irish Luck, which the game activates in its own way. Weapons: the raw names the game keys
// its lists with; "name|full name|map" for the ones only one map has, outside those lists. Traps:
// "script file|function|maps". Zombies: the agent types. Places: the kind of interaction point, "perk"
// for any perk machine. Speeds: the zombies' move rate, in hundredths. Quest steps: "map|step", the step's
// number in the map's quest line (Spaceland: "ufo", which ends with the soul key).
const CARDS: [Entry; 61] = [
    Entry { script: "grenade_cooldown", en: "Nade Party (Fate)", fr: "Nade Party (Fate)" },
    Entry { script: "spawn_reboard_windows", en: "Shop Class (Fate)", fr: "Shop Class (Fate)" },
    Entry { script: "burned_out", en: "Scorching Skin (Fate)", fr: "Scorching Skin (Fate)" },
    Entry { script: "faster_health_regen_upgrade", en: "Mana Up (Fate)", fr: "Mana Up (Fate)" },
    Entry { script: "sniper_soft_upgrade", en: "Eagle Eyed (Fate)", fr: "Eagle Eyed (Fate)" },
    Entry { script: "coagulant", en: "Blood Clot (Fate)", fr: "Blood Clot (Fate)" },
    Entry { script: "extra_sniping_points", en: "Scoped Dollars (Fate)", fr: "Scoped Dollars (Fate)" },
    Entry { script: "shock_melee_upgrade", en: "Static Shock (Fate)", fr: "Static Shock (Fate)" },
    Entry { script: "faster_revive_upgrade", en: "Med Kit (Fate)", fr: "Med Kit (Fate)" },
    Entry { script: "penetration_gun", en: "Getting Railed (Fate)", fr: "Getting Railed (Fate)" },
    Entry { script: "bonus_damage_on_last_bullets", en: "Best For Last (Fate)", fr: "Best For Last (Fate)" },
    Entry { script: "reload_damage_increase", en: "5 Second Muscle (Fate)", fr: "5 Second Muscle (Fate)" },
    Entry { script: "welfare", en: "Socialist (Fate)", fr: "Socialist (Fate)" },
    Entry { script: "door_buy_refund", en: "Refund Policy (Fortune)", fr: "Refund Policy (Fortune)" },
    Entry { script: "faster_window_reboard", en: "Home Remodel (Fortune)", fr: "Home Remodel (Fortune)" },
    Entry { script: "headshot_explosion", en: "Get Head (Fortune)", fr: "Get Head (Fortune)" },
    Entry { script: "increased_melee_damage", en: "Pimp Slap (Fortune)", fr: "Pimp Slap (Fortune)" },
    Entry { script: "increased_team_efficiency", en: "On The Money (Fortune)", fr: "On The Money (Fortune)" },
    Entry { script: "more_power_up_drops", en: "Power Play (Fortune)", fr: "Power Play (Fortune)" },
    Entry { script: "sharp_shooter_upgrade", en: "Ego Trip (Fortune)", fr: "Ego Trip (Fortune)" },
    Entry { script: "spawn_double_money", en: "Pay Day (Fortune)", fr: "Pay Day (Fortune)" },
    Entry { script: "anywhere_but_here", en: "Escape Route (Fortune)", fr: "Escape Route (Fortune)" },
    Entry { script: "atomizer_gun", en: "Atomic Massacre (Fortune)", fr: "Atomic Massacre (Fortune)" },
    Entry { script: "bh_gun", en: "Black Hole Fun (Fortune)", fr: "Black Hole Fun (Fortune)" },
    Entry { script: "claw_gun", en: "Scratch Post (Fortune)", fr: "Scratch Post (Fortune)" },
    Entry { script: "damage_booster_upgrade", en: "Twice The Pain (Fortune)", fr: "Twice The Pain (Fortune)" },
    Entry { script: "headshot_reload", en: "Head Reloaded (Fortune)", fr: "Head Reloaded (Fortune)" },
    Entry { script: "hit_reward_upgrade", en: "Money Shot (Fortune)", fr: "Money Shot (Fortune)" },
    Entry { script: "killing_time", en: "Hide N' Seek (Fortune)", fr: "Hide N' Seek (Fortune)" },
    Entry { script: "now_you_see_me", en: "Zombie Magnet (Fortune)", fr: "Zombie Magnet (Fortune)" },
    Entry { script: "phoenix_up", en: "Rising Phoenix (Fortune)", fr: "Rising Phoenix (Fortune)" },
    Entry { script: "slow_enemy_movement", en: "Slug Butt (Fortune)", fr: "Slug Butt (Fortune)" },
    Entry { script: "spawn_infinite_ammo", en: "Raining Bullets (Fortune)", fr: "Raining Bullets (Fortune)" },
    Entry { script: "spawn_instakill", en: "Death's Party (Fortune)", fr: "Death's Party (Fortune)" },
    Entry { script: "spawn_max_ammo", en: "All The Ammos (Fortune)", fr: "All The Ammos (Fortune)" },
    Entry { script: "spawn_nuke", en: "Kabooom! (Fortune)", fr: "Kabooom! (Fortune)" },
    Entry { script: "wall_power", en: "Get Packed (Fortune)", fr: "Get Packed (Fortune)" },
    Entry { script: "ephemeral_enhancement", en: "Super Minute Man (Fortune)", fr: "Super Minute Man (Fortune)" },
    Entry { script: "secret_service", en: "Turn Coat (Fortune)", fr: "Turn Coat (Fortune)" },
    Entry { script: "life_link", en: "The Z-team (Fortune)", fr: "The Z-team (Fortune)" },
    Entry { script: "cant_miss", en: "Restored Losses (Fortune)", fr: "Restored Losses (Fortune)" },
    Entry { script: "spawn_fire_sale", en: "Black Friday (Fortune)", fr: "Black Friday (Fortune)" },
    Entry { script: "self_revive", en: "Reanimated (Fortune)", fr: "Reanimated (Fortune)" },
    Entry { script: "just_a_flesh_wound", en: "Perk Insured (Fortune)", fr: "Perk Insured (Fortune)" },
    Entry { script: "force_push_near_death", en: "Second Wind (Fortune)", fr: "Second Wind (Fortune)" },
    Entry { script: "next_purchase_free", en: "Coupon Clipper (Fortune)", fr: "Coupon Clipper (Fortune)" },
    Entry { script: "masochist", en: "Punching Bag (Fortune)", fr: "Punching Bag (Fortune)" },
    Entry { script: "magic_wheel_upgrade", en: "Packed Magic (Fortune)", fr: "Packed Magic (Fortune)" },
    Entry { script: "steel_dragon", en: "Dragon Breath (Fortune)", fr: "Dragon Breath (Fortune)" },
    Entry { script: "timely_torrent", en: "Timely Torrent (Fate)", fr: "Timely Torrent (Fate)" },
    Entry { script: "purify", en: "Purify (Fortune)", fr: "Purify (Fortune)" },
    Entry { script: "explosive_touch", en: "Explosive Touch (Fortune)", fr: "Explosive Touch (Fortune)" },
    Entry { script: "shared_fate", en: "Shared Fate (Fortune)", fr: "Shared Fate (Fortune)" },
    Entry { script: "fire_chains", en: "Fire Chains (Fortune)", fr: "Fire Chains (Fortune)" },
    Entry { script: "temporal_increase", en: "Temporal Increase (Fortune)", fr: "Temporal Increase (Fortune)" },
    Entry { script: "twist_of_fate", en: "Twist Of Fate (Fortune)", fr: "Twist Of Fate (Fortune)" },
    Entry { script: "dodge_mode", en: "Evade (Fortune)", fr: "Evade (Fortune)" },
    Entry { script: "ammo_crate", en: "Ammo Crate (Fortune)", fr: "Ammo Crate (Fortune)" },
    Entry { script: "stimulus", en: "Stimulus (Fate)", fr: "Stimulus (Fate)" },
    Entry { script: "activate_gns_machine", en: "Skull Hacker (Fortune)", fr: "Skull Hacker (Fortune)" },
    Entry { script: "double_pap_weap", en: "Packin' Heat (Fortune)", fr: "Packin' Heat (Fortune)" },
];

const WEAPONS: [Entry; 60] = [
    Entry { script: "dischord", en: "Dischord (Spaceland)", fr: "Dischord (Spaceland)" },
    Entry { script: "facemelter", en: "Face Melter (Spaceland)", fr: "Face Melter (Spaceland)" },
    Entry { script: "headcutter", en: "Headcutter (Spaceland)", fr: "Headcutter (Spaceland)" },
    Entry { script: "shredder", en: "Shredder (Spaceland)", fr: "Shredder (Spaceland)" },
    Entry { script: "forgefreeze", en: "Forge Freeze (Spaceland)", fr: "Forge Freeze (Spaceland)" },
    Entry { script: "harpoon1|iw7_harpoon1_zm|cp_rave", en: "Acid Rain harpoon (Rave)", fr: "Harpon Acid Rain (Rave)" },
    Entry { script: "harpoon2|iw7_harpoon2_zm|cp_rave", en: "Ben Franklin harpoon (Rave)", fr: "Harpon Ben Franklin (Rave)" },
    Entry { script: "harpoon3|iw7_harpoon3_zm+akimbo|cp_rave", en: "Trap-O-Matic harpoon (Rave)", fr: "Harpon Trap-O-Matic (Rave)" },
    Entry { script: "harpoon4|iw7_harpoon4_zm|cp_rave", en: "Whirlwind EF-5 harpoon (Rave)", fr: "Harpon Whirlwind EF-5 (Rave)" },
    Entry { script: "katana", en: "Katana (Shaolin)", fr: "Katana (Shaolin)" },
    Entry { script: "nunchucks", en: "Nunchucks (Shaolin)", fr: "Nunchakus (Shaolin)" },
    Entry { script: "venomx|iw7_venomx_zm|cp_final", en: "Venom-X (Beast from Beyond)", fr: "Venom-X (Beast from Beyond)" },
    Entry { script: "axe", en: "Axe", fr: "Hache" },
    Entry { script: "tacburst", en: "Raijin-EMX", fr: "Raijin-EMX" },
    Entry { script: "unsalmg", en: "Atlas", fr: "Atlas" },
    Entry { script: "minilmg", en: "Auger", fr: "Auger" },
    Entry { script: "sonic", en: "Banshee", fr: "Banshee" },
    Entry { script: "sdfshotty", en: "DCM-8", fr: "DCM-8" },
    Entry { script: "m1", en: "DMR-1", fr: "DMR-1" },
    Entry { script: "m8", en: "EBR-800", fr: "EBR-800" },
    Entry { script: "emc", en: "EMC", fr: "EMC" },
    Entry { script: "erad", en: "Erad", fr: "Erad" },
    Entry { script: "fhr", en: "FHR-40", fr: "FHR-40" },
    Entry { script: "g18c", en: "G18", fr: "G18" },
    Entry { script: "gauss", en: "G-Rail", fr: "G-Rail" },
    Entry { script: "revolver", en: "Hailstorm", fr: "Hailstorm" },
    Entry { script: "glprox", en: "Howitzer", fr: "Howitzer" },
    Entry { script: "ump45", en: "HVR", fr: "HVR" },
    Entry { script: "cheytacc", en: "Intervention", fr: "Intervention" },
    Entry { script: "crb", en: "Karma-45", fr: "Karma-45" },
    Entry { script: "ar57", en: "KBAR-32", fr: "KBAR-32" },
    Entry { script: "kbs", en: "KBS Longbow", fr: "KBS Longbow" },
    Entry { script: "g18", en: "Kendall 44", fr: "Kendall 44" },
    Entry { script: "m1c", en: "M1", fr: "M1" },
    Entry { script: "mod2187", en: "M.2187", fr: "M.2187" },
    Entry { script: "mauler", en: "Mauler", fr: "Mauler" },
    Entry { script: "m4", en: "NV4", fr: "NV4" },
    Entry { script: "nrg", en: "Oni", fr: "Oni" },
    Entry { script: "arclassic", en: "OSA", fr: "OSA" },
    Entry { script: "chargeshot", en: "P-LAW", fr: "P-LAW" },
    Entry { script: "longshot", en: "Proteus", fr: "Proteus" },
    Entry { script: "sdfar", en: "R3K", fr: "R3K" },
    Entry { script: "spas", en: "Rack-9", fr: "Rack-9" },
    Entry { script: "sdflmg", en: "R.A.W.", fr: "R.A.W." },
    Entry { script: "devastator", en: "Reaver", fr: "Reaver" },
    Entry { script: "ripper", en: "RPR Evo", fr: "RPR Evo" },
    Entry { script: "rvn", en: "R-VN", fr: "R-VN" },
    Entry { script: "lockon", en: "Spartan SA3", fr: "Spartan SA3" },
    Entry { script: "spasc", en: "SPAS-12", fr: "SPAS-12" },
    Entry { script: "mag", en: "Stallion .44", fr: "Stallion .44" },
    Entry { script: "lmg03", en: "Titan", fr: "Titan" },
    Entry { script: "mp28", en: "Trencher", fr: "Trencher" },
    Entry { script: "ba50cal", en: "Trek-50", fr: "Trek-50" },
    Entry { script: "fmg", en: "Type-2", fr: "Type-2" },
    Entry { script: "udm45", en: "UDM", fr: "UDM" },
    Entry { script: "ump45c", en: "UMP45", fr: "UMP45" },
    Entry { script: "ake", en: "Volk", fr: "Volk" },
    Entry { script: "crdb", en: "VPR", fr: "VPR" },
    Entry { script: "cheytac", en: "Widowmaker", fr: "Widowmaker" },
    Entry { script: "vr", en: "X-Eon", fr: "X-Eon" },
];

const CRAFTABLES: [Entry; 9] = [
    Entry { script: "scripts/cp/cp_weapon_autosentry|give_crafted_sentry|cp_zmb cp_rave cp_disco", en: "Sentry turret (Spaceland, Rave, Shaolin)", fr: "Tourelle (Spaceland, Rave, Shaolin)" },
    Entry { script: "scripts/cp/zombies/craftables/_boombox|give_crafted_boombox|cp_zmb cp_rave cp_disco", en: "Boombox (Spaceland, Rave, Shaolin)", fr: "Boombox (Spaceland, Rave, Shaolin)" },
    Entry { script: "scripts/cp/zombies/craftables/_fireworks_trap|give_crafted_fireworks_trap|cp_zmb cp_rave", en: "Fireworks trap (Spaceland, Rave)", fr: "Piège feu d'artifice (Spaceland, Rave)" },
    Entry { script: "scripts/cp/zombies/craftables/_electric_trap|give_crafted_trap|cp_zmb cp_rave", en: "Electric trap (Spaceland, Rave)", fr: "Piège électrique (Spaceland, Rave)" },
    Entry { script: "scripts/cp/zombies/craftables/_zm_soul_collector|give_crafted_medusa|cp_zmb cp_rave", en: "Medusa (Spaceland, Rave)", fr: "Méduse (Spaceland, Rave)" },
    Entry { script: "scripts/cp/zombies/craftables/_revocator|give_crafted_revocator|cp_zmb cp_rave", en: "Revocator (Spaceland, Rave)", fr: "Révocateur (Spaceland, Rave)" },
    Entry { script: "scripts/cp/zombies/craftables/_gascan|give_crafted_gascan|cp_zmb cp_rave", en: "Gas can (Spaceland, Rave)", fr: "Bidon d'essence (Spaceland, Rave)" },
    Entry { script: "scripts/cp/crafted_trap_balloons|give_crafted_trap|cp_rave", en: "Balloon trap (Rave)", fr: "Piège à ballons (Rave)" },
    Entry { script: "scripts/cp/crafted_trap_mower|give_crafted_trap|cp_rave", en: "Lawn mower trap (Rave)", fr: "Piège tondeuse (Rave)" },
];

const ZOMBIES: [Entry; 13] = [
    Entry { script: "generic_zombie", en: "Zombie", fr: "Zombie" },
    Entry { script: "zombie_clown", en: "Clown (Spaceland)", fr: "Clown (Spaceland)" },
    Entry { script: "zombie_brute", en: "Brute", fr: "Brute" },
    Entry { script: "zombie_grey", en: "Grey alien", fr: "Extraterrestre gris" },
    Entry { script: "skater", en: "Skater", fr: "Patineur" },
    Entry { script: "lumberjack", en: "Lumberjack (Rave)", fr: "Bûcheron (Rave)" },
    Entry { script: "skeleton", en: "Skeleton", fr: "Squelette" },
    Entry { script: "karatemaster", en: "Karate master (Shaolin)", fr: "Maître de karaté (Shaolin)" },
    Entry { script: "crab_mini", en: "Small crab (Radioactive Thing)", fr: "Petit crabe (Radioactive Thing)" },
    Entry { script: "crab_brute", en: "Big crab (Radioactive Thing)", fr: "Gros crabe (Radioactive Thing)" },
    Entry { script: "alien_goon", en: "Cryptid goon (Beast from Beyond)", fr: "Sbire cryptide (Beast from Beyond)" },
    Entry { script: "alien_phantom", en: "Cryptid phantom (Beast from Beyond)", fr: "Fantôme cryptide (Beast from Beyond)" },
    Entry { script: "alien_rhino", en: "Cryptid rhino (Beast from Beyond)", fr: "Rhino cryptide (Beast from Beyond)" },
];

const PLACES: [Entry; 5] = [
    Entry { script: "weapon_upgrade", en: "Pack-a-Punch", fr: "Pack-a-Punch" },
    Entry { script: "magic_wheel", en: "Mystery wheel", fr: "Roue mystère" },
    Entry { script: "perk", en: "Perk machine", fr: "Machine à atout" },
    Entry { script: "jaroslav_machine", en: "Fate & Fortune machine", fr: "Machine Fate & Fortune" },
    Entry { script: "crafting_station", en: "Crafting station", fr: "Atelier" },
];

const PACES: [Entry; 3] = [
    Entry { script: "100", en: "Normal", fr: "Normale" },
    Entry { script: "170", en: "All fast", fr: "Tous rapides" },
    Entry { script: "45", en: "All slow", fr: "Tous lents" },
];

const QUEST_STEPS: [Entry; 12] = [
    Entry { script: "cp_zmb|0", en: "Spaceland 1: the DJ's three parts", fr: "Spaceland 1 : les trois pièces du DJ" },
    Entry { script: "cp_zmb|1", en: "Spaceland 2: Pack-a-Punch portal", fr: "Spaceland 2 : portail du Pack-a-Punch" },
    Entry { script: "cp_zmb|2", en: "Spaceland 3: first speaker defense", fr: "Spaceland 3 : première défense de l'enceinte" },
    Entry { script: "cp_zmb|3", en: "Spaceland 4: second speaker defense", fr: "Spaceland 4 : deuxième défense de l'enceinte" },
    Entry { script: "cp_zmb|4", en: "Spaceland 5: third speaker defense", fr: "Spaceland 5 : troisième défense de l'enceinte" },
    Entry { script: "cp_zmb|5", en: "Spaceland 6: wait one round", fr: "Spaceland 6 : attendre une manche" },
    Entry { script: "cp_zmb|6", en: "Spaceland 7: tone generators from the DJ", fr: "Spaceland 7 : générateurs de tonalité du DJ" },
    Entry { script: "cp_zmb|7", en: "Spaceland 8: place the tone generators", fr: "Spaceland 8 : poser les générateurs" },
    Entry { script: "cp_zmb|8", en: "Spaceland 9: match the UFO's tones", fr: "Spaceland 9 : reproduire les tonalités de l'OVNI" },
    Entry { script: "cp_zmb|9", en: "Spaceland 10: the UFO's kamikaze clowns", fr: "Spaceland 10 : les clowns kamikazes de l'OVNI" },
    Entry { script: "cp_zmb|10", en: "Spaceland 11: the greys fight", fr: "Spaceland 11 : le combat contre les gris" },
    Entry { script: "cp_zmb|11", en: "Spaceland 12: destroy the UFO (soul key)", fr: "Spaceland 12 : détruire l'OVNI (clé d'âme)" },
];

#[cfg(test)]
mod tests {
    use super::*;

    /// The quoted names between `// pick: <key>` and the end of that array in the script.
    fn script_list(script: &str, key: &str) -> Vec<String> {
        let start = script.find(&format!("// pick: {key}\n")).unwrap_or_else(|| panic!("no list {key} in the script"));
        let body = &script[start..];
        let body = &body[..body.find("];").unwrap()];
        body.lines().filter_map(|line| line.trim().strip_prefix('"').and_then(|rest| rest.split('"').next())).map(str::to_string).collect()
    }

    #[test]
    fn the_script_holds_the_same_lists_in_the_same_order() {
        let script = include_str!("../iw7-mod/custom_scripts/cp/iw_helper.gsc").replace("\r\n", "\n");
        for pick in Pick::ALL {
            let ours: Vec<&str> = pick.entries().iter().map(|entry| entry.script).collect();
            assert_eq!(script_list(&script, pick.key()), ours, "{}", pick.key());
        }
    }

    #[test]
    fn codes_stay_within_their_list_and_do_not_overlap() {
        let mut codes: Vec<i32> = Pick::ALL.iter().flat_map(|&pick| (0..pick.entries().len()).map(move |index| pick.code(index).unwrap())).collect();
        let count = codes.len();
        codes.sort();
        codes.dedup();
        assert_eq!(codes.len(), count);
        assert!(codes.iter().all(|code| (100..1000).contains(code)));
        assert_eq!(Pick::Zombie.code(Pick::Zombie.entries().len()), None);
    }
}
