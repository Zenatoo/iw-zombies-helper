// iw-helper extras for Zombies, run by iw7-mod's script loader.
//
// iw7-mod only: the Steam game never loads custom_scripts, and this file must stay that way. It calls the
// game's own Zombies functions, which the external tool cannot reach from memory (Pack-a-Punch, bonuses).
//
// Install: copy the iw7-mod folder of this repository into the game folder, so that this file ends up in
// <game folder>\iw7-mod\custom_scripts\cp\iw_helper.gsc. It is compiled when a Zombies match loads.
//
// Two ways to send a command, as the host:
// - the iw-helper window, page Match, section "iw7-mod extras": it writes the command's number into
//   level.command_given (the mailbox below);
// - the iw7-mod console: `set iwh <command>`, or a key bound once, for example: bind F5 "set iwh pap"
// Console commands:
//   pap            upgrade every player's weapons one Pack-a-Punch level (again for the next level)
//   killall        kill every zombie alive (bosses may be immune)
//   doors          turn on the power and open the doors
//   perks          give you every perk of the map
//   weapon         give you a random weapon from the map's list
//   character      switch to the next of the map's characters, hidden ones included
//   revive         get every downed player back up, from last stand or the afterlife arcade
//   thirdperson    switch between first and third-person view
//   explosive      switch explosive bullets on or off: each shot explodes where it lands
//   counter        show or hide how many zombies the round still has
//   rain           five random bonuses around you
//   launch         kill every zombie and throw the bodies in the air
//   burn           set every zombie on fire
//   shock          stun every zombie with electric shocks
//   sprint         run almost twice as fast for 30 seconds
//   xray           switch the outline that shows zombies through walls on or off
//   maxpap         upgrade every player's weapons two levels at once
//   revives        switch unlimited self-revives (solo) on or off
//   lucky          switch a bonus per zombie killed on or off
//   deck           refill your Fate & Fortune card deck
//   money          $10000 for every player
//   bring          bring every other player next to you
//   follow         go next to another player (the next one each time)
//   horde          ten zombies of the kind last spawned from the window, around you
//   gungame        switch gun game on or off: a random weapon every 5 kills
//   stats          show or hide a timer and the zombies killed
//   keep           switch on or off: your weapons come back when you get up after going down
//   quest          the map's whole main easter egg, step after step, up to its end (Spaceland)
// From the window only: a Fate & Fortune card, a weapon, a crafted trap, a zombie, a place to go to or the
// zombies' speed, chosen in a list.
//   drop <bonus>   drop a bonus in front of you: ammo, kill, instakill, cash, upgrade, fire, infinite,
//                  grenade, power, board (what exists depends on the map)
//   bonuses        list the bonuses of this map
//   help           list the commands

// The mailbox: the script waits with 7600 + the map's number (idle_value), iw-helper writes 7700 + a
// command number, the script runs it and writes its waiting value back. Numbers kept in step with
// OneShot::script_code in src/trainer.rs.
init()
{
    setdvarifuninitialized("iwh", "");
    // Explosive bullets start off at every match.
    setdvar("iwh_explosive", 0);
    setdvar("iwh_counter", 0);
    setdvar("iwh_xray", 0);
    setdvar("iwh_revives", 0);
    setdvar("iwh_lucky", 0);
    setdvar("iwh_pace", 100);
    setdvar("iwh_gungame", 0);
    setdvar("iwh_stats", 0);
    setdvar("iwh_keep", 0);
    setdvar("iwh_last_zombie", "");
    setdvar("iwh_quest_running", 0);
    level.command_given = idle_value();
    level thread watch_commands();
}

watch_commands()
{
    level endon("game_ended");
    idle = idle_value();

    for (;;)
    {
        wait 0.1;

        // The host: the console and the window are theirs.
        player = level.players[0];
        if (!isdefined(player))
            continue;

        if (level.command_given >= 7700)
        {
            code = level.command_given - 7700;
            level.command_given = idle;
            run_code(player, code);
        }

        line = getdvar("iwh");
        if (line == "")
            continue;
        setdvar("iwh", "");

        words = strtok(line, " ");
        argument = "";
        if (words.size > 1)
            argument = words[1];
        run_word(player, words[0], argument);
    }
}

// What the mailbox holds while waiting: 7600 plus the map's number, from 1 in the order of MAPS in
// src/picks.rs (0 for a map not listed), so that the window knows the map without asking.
idle_value()
{
    names = ["cp_zmb", "cp_rave", "cp_disco", "cp_town", "cp_final"];
    for (i = 0; i < names.size; i++)
    {
        if (names[i] == level.script)
            return 7601 + i;
    }

    return 7600;
}

// Commands from iw-helper, by number.
run_code(player, code)
{
    // The lists: cards from 100, weapons from 200, traps from 300, zombies from 320, places from 400,
    // zombie speeds from 420, easter egg steps from 440.
    if (code >= 100 && code < 200)
        return run_pick(player, "card", code - 100);
    if (code >= 200 && code < 300)
        return run_pick(player, "weapon", code - 200);
    if (code >= 300 && code < 320)
        return run_pick(player, "craftable", code - 300);
    if (code >= 320 && code < 340)
        return run_pick(player, "zombie", code - 320);
    if (code >= 400 && code < 420)
        return run_pick(player, "place", code - 400);
    if (code >= 420 && code < 430)
        return run_pick(player, "pace", code - 420);
    if (code >= 440 && code < 540)
        return run_pick(player, "quest", code - 440);

    switch (code)
    {
        case 1: upgrade_weapons(player); break;
        case 2: kill_all(player); break;
        case 3: open_doors(player); break;
        case 4: give_perks(player); break;
        case 5: give_weapon(player); break;
        case 10: drop_bonus(player, "ammo"); break;
        case 11: drop_bonus(player, "kill"); break;
        case 12: drop_bonus(player, "instakill"); break;
        case 13: drop_bonus(player, "cash"); break;
        case 14: drop_bonus(player, "fire"); break;
        case 15: drop_bonus(player, "infinite"); break;
        case 20: next_character(player); break;
        case 21: revive_players(player); break;
        case 22: switch_third_person(player); break;
        case 23: switch_explosive_bullets(player); break;
        case 24: switch_zombie_counter(player); break;
        case 25: level thread bonus_rain(player); break;
        case 26: level thread launch_zombies(player); break;
        case 27: burn_zombies(player); break;
        case 28: shock_zombies(player); break;
        case 29: player thread super_sprint(player); break;
        case 30: switch_xray(player); break;
        case 31: level thread max_pap(player); break;
        case 32: switch_unlimited_revives(player); break;
        case 33: switch_bonus_on_kill(player); break;
        case 34: refill_deck(player); break;
        case 35: money_for_everyone(player); break;
        case 36: bring_players(player); break;
        case 37: go_to_player(player); break;
        case 38: level thread horde(player); break;
        case 39: switch_gun_game(player); break;
        case 40: switch_stats(player); break;
        case 41: switch_keep_weapons(player); break;
        case 42: level thread whole_quest(player); break;
        default: player iprintln("iw-helper: unknown command " + code); break;
    }
}

// Commands from the console, by name.
run_word(player, command, argument)
{
    switch (command)
    {
        case "pap": upgrade_weapons(player); break;
        case "killall": kill_all(player); break;
        case "doors": open_doors(player); break;
        case "perks": give_perks(player); break;
        case "weapon": give_weapon(player); break;
        case "character": next_character(player); break;
        case "revive": revive_players(player); break;
        case "thirdperson": switch_third_person(player); break;
        case "explosive": switch_explosive_bullets(player); break;
        case "counter": switch_zombie_counter(player); break;
        case "rain": level thread bonus_rain(player); break;
        case "launch": level thread launch_zombies(player); break;
        case "burn": burn_zombies(player); break;
        case "shock": shock_zombies(player); break;
        case "sprint": player thread super_sprint(player); break;
        case "xray": switch_xray(player); break;
        case "maxpap": level thread max_pap(player); break;
        case "revives": switch_unlimited_revives(player); break;
        case "lucky": switch_bonus_on_kill(player); break;
        case "deck": refill_deck(player); break;
        case "money": money_for_everyone(player); break;
        case "bring": bring_players(player); break;
        case "follow": go_to_player(player); break;
        case "horde": level thread horde(player); break;
        case "gungame": switch_gun_game(player); break;
        case "stats": switch_stats(player); break;
        case "keep": switch_keep_weapons(player); break;
        case "quest": level thread whole_quest(player); break;
        case "drop": drop_bonus(player, argument); break;
        case "bonuses": list_bonuses(player); break;
        default: player iprintln("iw-helper: pap, killall, doors, perks, weapon, character, revive, thirdperson, explosive, counter, rain, launch, burn, shock, sprint, xray, maxpap, revives, lucky, deck, money, bring, follow, horde, gungame, stats, keep, quest, drop <bonus>, bonuses"); break;
    }
}

// The same function as the "upgrade" bonus and the boss rewards: every weapon that can go one level
// higher does, and the weapon in hand is switched to its new version.
upgrade_weapons(player)
{
    if (!isdefined(level.upgrade_weapons_func))
    {
        player iprintln("iw-helper: no Pack-a-Punch on this map");
        return;
    }

    level thread [[level.upgrade_weapons_func]]();
    player iprintln("iw-helper: weapons upgraded");
}

kill_all(player)
{
    count = kill_enemies();
    player iprintln("iw-helper: " + count + " zombies killed");
}

// Every enemy alive, killed; how many.
kill_enemies()
{
    count = 0;
    foreach (enemy in scripts\cp\cp_agent_utils::get_alive_enemies())
    {
        if (!isdefined(enemy) || !isalive(enemy))
            continue;

        enemy dodamage(enemy.health + 100, enemy.origin);
        count++;
    }

    return count;
}

// Defined and true. The game's own version of this check fails to link from this script ("script link
// error"), so it is kept here.
is_true(value)
{
    return isdefined(value) && value;
}

// What the game's direct boss fight mode runs at the start: generators on, paid doors opened for free,
// Spaceland's donations done, team door switches used. Done here rather than by calling that mode's
// script, whose name the game does not publish: a script that refers to it fails to load.
open_doors(player)
{
    if (is_true(level.open_sesame))
    {
        player iprintln("iw-helper: doors already opened");
        return;
    }

    level.open_sesame = 1;
    level thread open_doors_now();
    player iprintln("iw-helper: power on, doors opening");
}

open_doors_now()
{
    if (isdefined(level.generators))
    {
        foreach (generator in level.generators)
        {
            thread scripts\cp\zombies\zombie_power::generic_generator(generator);
            wait 0.1;
        }
    }

    foreach (door in getentarray("door_buy", "targetname"))
    {
        door notify("trigger", "open_sesame");
        wait 0.1;
    }

    level.moon_donations = 3;
    level.kepler_donations = 3;
    level.triton_donations = 3;

    switches = [];
    foreach (spot in scripts\engine\utility::getstructarray("interaction", "targetname"))
    {
        if (isdefined(spot.script_noteworthy) && spot.script_noteworthy == "team_door_switch")
            switches[switches.size] = spot;
    }

    // Its script is loaded on the maps that have such switches only, hence the lookup by name.
    if (switches.size > 0)
        level thread use_team_door_switches(switches);

    if (scripts\engine\utility::flag_exist("restorepower_step1"))
        scripts\engine\utility::flag_set("restorepower_step1");
}

use_team_door_switches(switches)
{
    use = getfunction("scripts/cp/zombies/interaction_openareas", "use_team_door_switch");
    used = [];
    foreach (spot in switches)
    {
        if (isdefined(spot.target))
        {
            if (isdefined(used[spot.target]))
                continue;

            used[spot.target] = 1;
        }

        [[use]](spot, level.players[0]);
    }
}

// Every perk the map registered, given the way a perk machine does.
give_perks(player)
{
    if (!isdefined(level.coop_perk_callbacks))
    {
        player iprintln("iw-helper: no perks on this map");
        return;
    }

    count = 0;
    foreach (perk in getarraykeys(level.coop_perk_callbacks))
    {
        if (player scripts\cp\utility::has_zombie_perk(perk))
            continue;

        player scripts\cp\zombies\zombies_perk_machines::give_zombies_perk(perk, 0);
        count++;
        wait 0.1;
    }

    player iprintln("iw-helper: " + count + " perks given");
}

// A random weapon from the map's list (wall weapons and the mystery box's).
give_weapon(player)
{
    if (!isdefined(level.magic_weapons) || level.magic_weapons.size == 0)
    {
        player iprintln("iw-helper: no weapon list on this map");
        return;
    }

    names = getarraykeys(level.magic_weapons);
    give_this_weapon(player, level.magic_weapons[names[randomint(names.size)]]);
}

// Gives a weapon at level 1. If the player already carries as many weapons as allowed, the one in hand
// is taken, as the box does.
give_this_weapon(player, weapon)
{
    if (scripts\cp\zombies\zombies_weapons::should_take_players_current_weapon(player))
    {
        current = player getcurrentweapon();
        base = scripts\cp\utility::getrawbaseweaponname(current);
        player takeweapon(current);
        if (isdefined(player.pap[base]))
            player.pap[base] = undefined;
    }

    given = player scripts\cp\utility::_giveweapon(weapon, undefined, undefined, 0);
    if (!isdefined(given))
        given = weapon;

    // The level Pack-a-Punch reads to upgrade it later.
    entry = spawnstruct();
    entry.lvl = 1;
    player.pap[scripts\cp\utility::getrawbaseweaponname(given)] = entry;
    player notify("weapon_level_changed");
    player switchtoweapon(given);
    player iprintln("iw-helper: weapon given (" + given + ")");
}

// The map registers its characters by number (1 to 4, then its hidden ones: 5 and 6 on Spaceland,
// 5 on Rave and Shaolin), and only loads their models. The player's photo index is their number
// minus one. The next number up is applied the way the match start does, wrapping around.
next_character(player)
{
    if (!isdefined(level.player_character_info) || !isdefined(player.player_character_index))
    {
        player iprintln("iw-helper: characters not ready yet");
        return;
    }

    numbers = getarraykeys(level.player_character_info);
    current = player.player_character_index + 1;
    target = undefined;
    lowest = undefined;

    foreach (number in numbers)
    {
        if (number > current && (!isdefined(target) || number < target))
            target = number;
        if (!isdefined(lowest) || number < lowest)
            lowest = number;
    }

    if (!isdefined(target))
        target = lowest;

    player thread scripts\cp\zombies\zombies_loadout::setmodelfromcustomization(target);
    player iprintln("iw-helper: character " + target);
}

// Every player down, in last stand or in the afterlife arcade, gets back up the way a revive does.
revive_players(player)
{
    count = 0;
    foreach (other in level.players)
    {
        if (!is_true(scripts\cp\cp_laststand::player_in_laststand(other)) && !scripts\cp\zombies\zombie_afterlife_arcade::is_in_afterlife_arcade(other))
            continue;

        other scripts\cp\cp_laststand::instant_revive(other);
        count++;
    }

    player iprintln("iw-helper: " + count + " players revived");
}

// cg_thirdPerson is iw7-mod's own setting; the host's game is also the server, so the script can set it.
switch_third_person(player)
{
    if (getdvarint("cg_thirdPerson") == 1)
    {
        setdvar("cg_thirdPerson", 0);
        player iprintln("iw-helper: first-person view");
    }
    else
    {
        setdvar("cg_thirdPerson", 1);
        player iprintln("iw-helper: third-person view");
    }
}

// The state is kept in a console variable, iwh_explosive, so the script needs no field of its own.
switch_explosive_bullets(player)
{
    if (getdvarint("iwh_explosive") == 1)
    {
        setdvar("iwh_explosive", 0);
        player notify("iwh_explosive_stop");
        player iprintln("iw-helper: explosive bullets off");
        return;
    }

    setdvar("iwh_explosive", 1);
    player thread explosive_bullets();
    player iprintln("iw-helper: explosive bullets on");
}

// Each shot explodes where it lands: the effect of the game's big equipment explosion, and damage
// around that point. Not near the player, who would be hurt.
explosive_bullets()
{
    self endon("disconnect");
    self endon("iwh_explosive_stop");
    level endon("game_ended");

    for (;;)
    {
        self waittill("weapon_fired");

        start = self geteye();
        end = start + anglestoforward(self getplayerangles()) * 5000;
        trace = bullettrace(start, end, 0, self);
        spot = trace["position"];

        if (distance(spot, self.origin) < 200)
            continue;

        if (isdefined(level._effect["equipment_explode_big"]))
            playfx(level._effect["equipment_explode_big"], spot);

        radiusdamage(spot, 160, 800, 150, self, "MOD_EXPLOSIVE");
    }
}

// --- Choices from the window's lists ------------------------------------------------------------

// The four lists, in the order src/picks.rs sends their indexes (a test there checks they match).
// Weapons: the raw name the game keys its lists with; "name|full name|map" for the ones only one map
// has. Traps: "script file|function|maps that have it".
pick_list(kind)
{
    switch (kind)
    {
        // pick: card
        case "card":
            return [
                "grenade_cooldown",
                "spawn_reboard_windows",
                "burned_out",
                "faster_health_regen_upgrade",
                "sniper_soft_upgrade",
                "coagulant",
                "extra_sniping_points",
                "shock_melee_upgrade",
                "faster_revive_upgrade",
                "penetration_gun",
                "bonus_damage_on_last_bullets",
                "reload_damage_increase",
                "welfare",
                "door_buy_refund",
                "faster_window_reboard",
                "headshot_explosion",
                "increased_melee_damage",
                "increased_team_efficiency",
                "more_power_up_drops",
                "sharp_shooter_upgrade",
                "spawn_double_money",
                "anywhere_but_here",
                "atomizer_gun",
                "bh_gun",
                "claw_gun",
                "damage_booster_upgrade",
                "headshot_reload",
                "hit_reward_upgrade",
                "killing_time",
                "now_you_see_me",
                "phoenix_up",
                "slow_enemy_movement",
                "spawn_infinite_ammo",
                "spawn_instakill",
                "spawn_max_ammo",
                "spawn_nuke",
                "wall_power",
                "ephemeral_enhancement",
                "secret_service",
                "life_link",
                "cant_miss",
                "spawn_fire_sale",
                "self_revive",
                "just_a_flesh_wound",
                "force_push_near_death",
                "next_purchase_free",
                "masochist",
                "magic_wheel_upgrade",
                "steel_dragon",
                "timely_torrent",
                "purify",
                "explosive_touch",
                "shared_fate",
                "fire_chains",
                "temporal_increase",
                "twist_of_fate",
                "dodge_mode",
                "ammo_crate",
                "stimulus",
                "activate_gns_machine",
                "double_pap_weap"
            ];
        // pick: weapon
        case "weapon":
            return [
                "dischord",
                "facemelter",
                "headcutter",
                "shredder",
                "forgefreeze",
                "wylerdagger|iw7_wylerdagger_zm|cp_zmb",
                "harpoon1|iw7_harpoon1_zm|cp_rave",
                "harpoon2|iw7_harpoon2_zm|cp_rave",
                "harpoon3|iw7_harpoon3_zm+akimbo|cp_rave",
                "harpoon4|iw7_harpoon4_zm|cp_rave",
                "katana",
                "nunchucks",
                "venomx|iw7_venomx_zm|cp_final",
                "axe",
                "tacburst",
                "unsalmg",
                "minilmg",
                "sonic",
                "sdfshotty",
                "m1",
                "m8",
                "emc",
                "erad",
                "fhr",
                "g18c",
                "gauss",
                "revolver",
                "glprox",
                "ump45",
                "cheytacc",
                "crb",
                "ar57",
                "kbs",
                "g18",
                "m1c",
                "mod2187",
                "mauler",
                "m4",
                "nrg",
                "arclassic",
                "chargeshot",
                "longshot",
                "sdfar",
                "spas",
                "sdflmg",
                "devastator",
                "ripper",
                "rvn",
                "lockon",
                "spasc",
                "mag",
                "lmg03",
                "mp28",
                "ba50cal",
                "fmg",
                "udm45",
                "ump45c",
                "ake",
                "crdb",
                "cheytac",
                "vr"
            ];
        // pick: craftable
        case "craftable":
            return [
                "scripts/cp/cp_weapon_autosentry|give_crafted_sentry|cp_zmb cp_rave cp_disco",
                "scripts/cp/crafted_trap_boombox|give_crafted_boombox|cp_zmb cp_rave cp_disco",
                "scripts/cp/crafted_trap_fireworks|give_crafted_fireworks_trap|cp_zmb cp_rave",
                "scripts/cp/crafted_trap_electric|give_crafted_trap|cp_zmb cp_rave",
                "scripts/cp/cp_weapon_medusa|give_crafted_medusa|cp_zmb cp_rave",
                "scripts/cp/crafted_trap_revocator|give_crafted_revocator|cp_zmb cp_rave",
                "scripts/cp/crafted_trap_gascan|give_crafted_gascan|cp_zmb cp_rave"
            ];
        // pick: zombie
        case "zombie":
            return [
                "generic_zombie",
                "zombie_clown",
                "zombie_brute",
                "zombie_grey",
                "skater",
                "lumberjack",
                "skeleton",
                "karatemaster",
                "crab_mini",
                "crab_brute",
                "alien_goon",
                "alien_phantom",
                "alien_rhino"
            ];
        // pick: place
        case "place":
            return [
                "zone",
                "portal",
                "weapon_upgrade",
                "magic_wheel",
                "perk",
                "jaroslav_machine",
                "crafting_station"
            ];
        // pick: pace
        case "pace":
            return [
                "100",
                "170",
                "45"
            ];
        // pick: quest
        case "quest":
            return [
                "cp_zmb|0",
                "cp_zmb|1",
                "cp_zmb|2",
                "cp_zmb|3",
                "cp_zmb|4",
                "cp_zmb|5",
                "cp_zmb|6",
                "cp_zmb|7",
                "cp_zmb|8",
                "cp_zmb|9",
                "cp_zmb|10",
                "cp_zmb|11",
                "cp_rave|0",
                "cp_rave|1",
                "cp_rave|2",
                "cp_rave|3",
                "cp_rave|4",
                "cp_rave|5",
                "cp_rave|6",
                "cp_rave|7",
                "cp_rave|8",
                "cp_rave|9",
                "cp_rave|10",
                "cp_town|0",
                "cp_town|1",
                "cp_town|2",
                "cp_town|3",
                "cp_town|4",
                "cp_town|5",
                "cp_town|6",
                "cp_town|7",
                "cp_town|8",
                "cp_town|9",
                "cp_town|10",
                "cp_town|11",
                "cp_town|12",
                "cp_town|13",
                "cp_town|14",
                "cp_town|15",
                "cp_town|16",
                "cp_town|17",
                "cp_town|18",
                "cp_town|19",
                "cp_disco|0",
                "cp_disco|1",
                "cp_disco|2",
                "cp_disco|3",
                "cp_disco|4",
                "cp_disco|5",
                "cp_disco|6",
                "cp_disco|7",
                "cp_disco|8",
                "cp_disco|9",
                "cp_disco|10",
                "cp_disco|11",
                "cp_disco|12",
                "cp_disco|13",
                "cp_disco|14",
                "cp_disco|15",
                "cp_disco|16",
                "cp_disco|17",
                "cp_disco|18",
                "cp_final|0",
                "cp_final|1",
                "cp_final|2",
                "cp_final|3",
                "cp_final|4",
                "cp_final|5",
                "cp_final|6",
                "cp_final|7"
            ];
    }

    return [];
}

run_pick(player, kind, index)
{
    list = pick_list(kind);
    if (index < 0 || index >= list.size)
    {
        player iprintln("iw-helper: unknown choice " + index);
        return;
    }

    entry = list[index];
    switch (kind)
    {
        case "card": use_card(player, entry); break;
        case "weapon": give_listed_weapon(player, entry); break;
        case "craftable": give_craftable(player, entry); break;
        case "zombie": spawn_listed_zombie(player, entry); break;
        case "place": go_to_place(player, entry); break;
        case "pace": set_pace(player, entry); break;
        case "quest": quest_step(player, entry); break;
    }
}

// A Fate & Fortune card's effect, as when it is played, without taking a card from the deck. A card
// with a duration is turned off at its end, the way the game does.
use_card(player, name)
{
    if (!isdefined(level.consumables) || !isdefined(level.consumables[name]))
    {
        player iprintln("iw-helper: no " + name + " card on this map");
        return;
    }

    player thread run_card(name);
    player iprintln("iw-helper: card " + name);
}

run_card(name)
{
    self endon("disconnect");
    level endon("game_ended");

    card = level.consumables[name];
    if (!isdefined(self.consumables))
        self.consumables = [];
    if (!isdefined(self.consumables[name]))
    {
        held = spawnstruct();
        held.on = 0;
        held.times_used = 0;
        self.consumables[name] = held;
    }

    self.consumables[name].uses = card.uses;
    if (isdefined(card.set))
        self [[card.set]](name);
    if (isdefined(card.usefunc))
        self thread [[card.usefunc]](name);

    if (isdefined(card.type) && card.type == "timedactivations" && isdefined(card.usageperiod) && card.usageperiod > 0)
    {
        wait card.usageperiod;
        self notify(name + "_timeup");
        if (isdefined(card.unset))
            self [[card.unset]](name);
    }
}

give_listed_weapon(player, entry)
{
    parts = strtok(entry, "|");
    raw = parts[0];
    weapon = undefined;

    if (isdefined(level.magic_weapons) && isdefined(level.magic_weapons[raw]))
        weapon = level.magic_weapons[raw];
    else if (isdefined(level.pap) && isdefined(level.pap[raw]))
        weapon = level.pap[raw];
    else if (parts.size > 2 && level.script == parts[2])
        weapon = parts[1];

    if (!isdefined(weapon))
    {
        player iprintln("iw-helper: no " + raw + " on this map");
        return;
    }

    give_this_weapon(player, weapon);
}

// The trap's own give function, found by name: its script is only loaded on the maps that have it,
// hence the map check first, and a thread of its own so that a failure stays there.
give_craftable(player, entry)
{
    parts = strtok(entry, "|");
    here = 0;
    foreach (allowed in strtok(parts[2], " "))
    {
        if (allowed == level.script)
            here = 1;
    }

    if (!here)
    {
        player iprintln("iw-helper: this trap is not on this map");
        return;
    }

    level thread give_craftable_now(player, parts[0], parts[1]);
}

give_craftable_now(player, file, name)
{
    give = getfunction(file, name);
    [[give]](undefined, player);
    player iprintln("iw-helper: trap given, place it with its key");
}

// A zombie of that kind, spawned the way the game spawns its waves, a few steps in front of the
// player and facing them.
spawn_listed_zombie(player, kind)
{
    if (!isdefined(level.agent_definition) || !isdefined(level.agent_definition[kind]))
    {
        player iprintln("iw-helper: no " + kind + " on this map");
        return;
    }

    setdvar("iwh_last_zombie", kind);
    spawner = spawnstruct();
    spawner.origin = player.origin + anglestoforward((0, player.angles[1], 0)) * 220;
    spawner.angles = (0, player.angles[1] + 180, 0);
    level thread spawn_now(player, spawner, kind);
}

spawn_now(player, spawner, kind)
{
    enemy = spawner scripts\cp\zombies\zombies_spawning::spawn_wave_enemy(kind, 1);
    if (isdefined(enemy))
        player iprintln("iw-helper: " + kind + " spawned");
    else
        player iprintln("iw-helper: " + kind + " could not spawn here");
}

// --- Useful -------------------------------------------------------------------------------------

// The outline the game's x-ray bonus puts on zombies, kept on until switched off.
switch_xray(player)
{
    if (getdvarint("iwh_xray") == 1)
    {
        setdvar("iwh_xray", 0);
        level notify("deactivatediwh_xray");
        foreach (enemy in scripts\cp\cp_agent_utils::get_alive_enemies())
        {
            if (isdefined(enemy))
                scripts\cp\cp_outline::disable_outline_for_players(enemy, level.players);
        }
        player iprintln("iw-helper: x-ray off");
        return;
    }

    setdvar("iwh_xray", 1);
    level thread scripts\cp\loot::outline_all_enemies("iwh_xray");
    player iprintln("iw-helper: x-ray on");
}

// The upgrade twice, as the bosses' reward does.
max_pap(player)
{
    if (!isdefined(level.upgrade_weapons_func))
    {
        player iprintln("iw-helper: no Pack-a-Punch on this map");
        return;
    }

    level [[level.upgrade_weapons_func]]();
    wait 0.5;
    level thread [[level.upgrade_weapons_func]]();
    player iprintln("iw-helper: weapons upgraded twice");
}

// In solo, the revive machine stops selling after a few self-revives: the count is kept at zero.
switch_unlimited_revives(player)
{
    if (getdvarint("iwh_revives") == 1)
    {
        setdvar("iwh_revives", 0);
        level notify("iwh_revives_stop");
        player iprintln("iw-helper: self-revives limited again");
        return;
    }

    setdvar("iwh_revives", 1);
    level thread keep_revives();
    player iprintln("iw-helper: unlimited self-revives");
}

keep_revives()
{
    level endon("game_ended");
    level endon("iwh_revives_stop");

    for (;;)
    {
        foreach (other in level.players)
            other.self_revives_purchased = 0;
        wait 1;
    }
}

// Every zombie spawned from now drops a random bonus where it dies.
switch_bonus_on_kill(player)
{
    if (getdvarint("iwh_lucky") == 1)
    {
        setdvar("iwh_lucky", 0);
        level notify("iwh_lucky_stop");
        player iprintln("iw-helper: bonus per kill off");
        return;
    }

    setdvar("iwh_lucky", 1);
    level thread watch_spawns_for_bonus();
    player iprintln("iw-helper: bonus per kill on");
}

watch_spawns_for_bonus()
{
    level endon("game_ended");
    level endon("iwh_lucky_stop");

    for (;;)
    {
        level waittill("agent_spawned", enemy);
        if (isdefined(enemy))
            enemy thread drop_bonus_on_death();
    }
}

drop_bonus_on_death()
{
    level endon("iwh_lucky_stop");
    level endon("game_ended");

    // Where it stands, until it dies: the body may be gone right after.
    spot = self.origin;
    while (isdefined(self) && isalive(self))
    {
        spot = self.origin;
        wait 0.1;
    }

    if (!isdefined(level.loot_id))
        return;

    ids = getarraykeys(level.loot_id);
    scripts\cp\loot::drop_loot(spot, undefined, ids[randomint(ids.size)]);
}

// The zombies' move rate, in hundredths: kept on every zombie, new ones included, until set back to 100.
set_pace(player, entry)
{
    rate = int(entry);
    setdvar("iwh_pace", rate);
    level notify("iwh_pace_restart");

    if (rate == 100)
    {
        foreach (enemy in scripts\cp\cp_agent_utils::get_alive_enemies())
        {
            if (isdefined(enemy) && isalive(enemy))
                enemy.moveratescale = 1;
        }
        player iprintln("iw-helper: zombies at normal speed");
        return;
    }

    level thread keep_pace(rate / 100.0);
    player iprintln("iw-helper: zombie speed x" + (rate / 100.0));
}

keep_pace(scale)
{
    level endon("game_ended");
    level endon("iwh_pace_restart");

    for (;;)
    {
        foreach (enemy in scripts\cp\cp_agent_utils::get_alive_enemies())
        {
            if (isdefined(enemy) && isalive(enemy))
                enemy.moveratescale = scale;
        }
        wait 0.5;
    }
}

// The zones the game splits the map into (its zombies' spawn zones, by name), one per use, in turn: the
// middle of the zone's spawn points, or the zone's own origin when it has one, on the walkable ground.
go_to_next_zone(player)
{
    if (!isdefined(level.spawn_volume_array) || level.spawn_volume_array.size == 0)
    {
        player iprintln("iw-helper: no zones on this map");
        return;
    }

    names = getarraykeys(level.spawn_volume_array);
    turn = getdvarint("iwh_place_zone") % names.size;
    setdvar("iwh_place_zone", turn + 1);
    zone = level.spawn_volume_array[names[turn]];

    spot = zone.origin;
    if (spot == (0, 0, 0) && isdefined(zone.spawners) && zone.spawners.size > 0)
    {
        total = (0, 0, 0);
        foreach (spawner in zone.spawners)
            total = total + spawner.origin;
        spot = total / zone.spawners.size;
    }

    player setorigin(getclosestpointonnavmesh(spot) + (0, 0, 2));
    player iprintln("iw-helper: zone " + names[turn] + " (" + (turn + 1) + "/" + names.size + ")");
}

// Teleports to an interaction point of that kind ("perk": any perk machine), to a mystery wheel or to a
// fast travel portal.
// When the map has several, each use goes to the next one.
go_to_place(player, place)
{
    if (place == "zone")
        return go_to_next_zone(player);

    spots = [];
    if (place == "portal")
    {
        if (isdefined(level.fast_travel_spots))
        {
            foreach (portal in level.fast_travel_spots)
                spots[spots.size] = portal.origin;
        }
    }
    else if (place == "magic_wheel")
    {
        foreach (wheel in getentarray("magic_wheel", "script_noteworthy"))
            spots[spots.size] = wheel.origin;
    }
    else
    {
        foreach (point in scripts\engine\utility::getstructarray("interaction", "targetname"))
        {
            if (place == "perk")
            {
                if (isdefined(point.perk_type))
                    spots[spots.size] = point.origin;
            }
            else if (isdefined(point.script_noteworthy) && point.script_noteworthy == place)
            {
                spots[spots.size] = point.origin;
            }
        }
    }

    if (spots.size == 0)
    {
        player iprintln("iw-helper: no " + place + " on this map");
        return;
    }

    turn = getdvarint("iwh_place_" + place) % spots.size;
    setdvar("iwh_place_" + place, turn + 1);
    player setorigin(getclosestpointonnavmesh(spots[turn]) + (0, 0, 2));
    player iprintln("iw-helper: " + place + " " + (turn + 1) + "/" + spots.size);
}

// --- Cards, co-op, horde, gun game, statistics, weapons kept -----------------------------------

// The deck comes back the way the game gives a new one (as after the bomb on Radioactive Thing): the
// meter starts again from zero.
refill_deck(player)
{
    player notify("give_new_deck");
    player.consumable_meter = 0;
    player thread scripts\cp\zombies\zombies_consumables::init_consumable_meter();
    player thread scripts\cp\zombies\zombies_consumables::lightbar_off();
    player setclientomnvar("zm_dpad_up_activated", 5);
    player setclientomnvar("zm_consumable_selection_ready", 0);
    player thread scripts\cp\zombies\zombies_consumables::turn_on_cards();
    player iprintln("iw-helper: card deck refilled");
}

// The game's own way to give money: the counter follows right away.
money_for_everyone(player)
{
    foreach (other in level.players)
        other scripts\cp\cp_persistence::give_player_currency(10000, undefined, undefined, 1);
    player iprintln("iw-helper: $10000 for " + level.players.size + " players");
}

bring_players(player)
{
    count = 0;
    foreach (other in level.players)
    {
        if (other == player)
            continue;

        count++;
        other setorigin(getclosestpointonnavmesh(player.origin + anglestoforward((0, count * 90, 0)) * 60) + (0, 0, 2));
    }

    player iprintln("iw-helper: " + count + " players brought");
}

// Next to another player; each use goes to the next one.
go_to_player(player)
{
    others = [];
    foreach (other in level.players)
    {
        if (other != player)
            others[others.size] = other;
    }

    if (others.size == 0)
    {
        player iprintln("iw-helper: no other player");
        return;
    }

    turn = getdvarint("iwh_follow") % others.size;
    setdvar("iwh_follow", turn + 1);
    player setorigin(getclosestpointonnavmesh(others[turn].origin + (40, 0, 0)) + (0, 0, 2));
    player iprintln("iw-helper: next to " + others[turn].name);
}

// Ten zombies of the kind last spawned from the list (regular zombies otherwise), in a circle.
horde(player)
{
    kind = getdvar("iwh_last_zombie");
    if (kind == "")
        kind = "generic_zombie";

    if (!isdefined(level.agent_definition) || !isdefined(level.agent_definition[kind]))
    {
        player iprintln("iw-helper: no " + kind + " on this map");
        return;
    }

    count = 0;
    for (i = 0; i < 10; i++)
    {
        spawner = spawnstruct();
        spawner.origin = player.origin + anglestoforward((0, i * 36, 0)) * 320;
        spawner.angles = (0, i * 36 + 180, 0);
        enemy = spawner scripts\cp\zombies\zombies_spawning::spawn_wave_enemy(kind, 1);
        if (isdefined(enemy))
            count++;
        wait 0.2;
    }

    player iprintln("iw-helper: horde of " + count + " " + kind);
}

// Zombies killed, counted from the round's death counter (which starts again at every round).
kills_since(last)
{
    now = level.current_enemy_deaths;
    if (!isdefined(now))
        return 0;
    if (!isdefined(last) || now < last)
        return now;
    return now - last;
}

switch_gun_game(player)
{
    if (getdvarint("iwh_gungame") == 1)
    {
        setdvar("iwh_gungame", 0);
        level notify("iwh_gungame_stop");
        player iprintln("iw-helper: gun game off");
        return;
    }

    setdvar("iwh_gungame", 1);
    level thread gun_game(player);
    player iprintln("iw-helper: gun game on, a new weapon every 5 kills");
}

gun_game(player)
{
    player endon("disconnect");
    level endon("game_ended");
    level endon("iwh_gungame_stop");

    last = level.current_enemy_deaths;
    count = 0;
    for (;;)
    {
        wait 0.2;
        count = count + kills_since(last);
        last = level.current_enemy_deaths;
        if (count < 5)
            continue;

        count = 0;
        gun_game_swap(player);
    }
}

// The weapon in hand is replaced by a random one from the map's list.
gun_game_swap(player)
{
    if (!isdefined(level.magic_weapons) || level.magic_weapons.size == 0)
        return;
    if (is_true(player.inlaststand))
        return;

    names = getarraykeys(level.magic_weapons);
    weapon = level.magic_weapons[names[randomint(names.size)]];
    current = player getcurrentweapon();
    base = scripts\cp\utility::getrawbaseweaponname(current);
    player takeweapon(current);
    if (isdefined(player.pap[base]))
        player.pap[base] = undefined;

    given = player scripts\cp\utility::_giveweapon(weapon, undefined, undefined, 0);
    if (!isdefined(given))
        given = weapon;

    entry = spawnstruct();
    entry.lvl = 1;
    player.pap[scripts\cp\utility::getrawbaseweaponname(given)] = entry;
    player notify("weapon_level_changed");
    player switchtoweapon(given);
}

// A timer from the moment it is switched on, and the zombies killed since.
switch_stats(player)
{
    if (getdvarint("iwh_stats") == 1)
    {
        setdvar("iwh_stats", 0);
        player notify("iwh_stats_stop");
        return;
    }

    setdvar("iwh_stats", 1);
    player thread stats_hud();
}

stats_hud()
{
    self endon("disconnect");
    self endon("iwh_stats_stop");
    level endon("game_ended");

    title = newclienthudelem(self);
    timer = newclienthudelem(self);
    kills = newclienthudelem(self);
    foreach (element in [title, timer, kills])
    {
        element.alignx = "left";
        element.aligny = "top";
        element.horzalign = "left";
        element.vertalign = "top";
        element.x = 16;
        element.hidewheninmenu = 1;
        element.archived = 0;
        element.foreground = 1;
    }

    title.y = 200;
    title.fontscale = 1.1;
    title settext("Time / Kills");
    timer.y = 216;
    timer.fontscale = 1.5;
    timer settimerup(0);
    kills.y = 236;
    kills.fontscale = 1.5;
    self thread remove_stats(title, timer, kills);

    total = 0;
    last = level.current_enemy_deaths;
    for (;;)
    {
        total = total + kills_since(last);
        last = level.current_enemy_deaths;
        kills setvalue(total);
        wait 0.25;
    }
}

remove_stats(title, timer, kills)
{
    self waittill("iwh_stats_stop");
    title destroy();
    timer destroy();
    kills destroy();
}

// The weapons carried while standing are given back when the player gets up after going down.
switch_keep_weapons(player)
{
    if (getdvarint("iwh_keep") == 1)
    {
        setdvar("iwh_keep", 0);
        level notify("iwh_keep_stop");
        player iprintln("iw-helper: weapons no longer kept");
        return;
    }

    setdvar("iwh_keep", 1);
    level thread keep_weapons(player);
    player iprintln("iw-helper: weapons kept when you go down");
}

keep_weapons(player)
{
    player endon("disconnect");
    level endon("game_ended");
    level endon("iwh_keep_stop");

    saved = player getweaponslistprimaries();
    was_down = 0;
    for (;;)
    {
        wait 0.5;
        down = !isalive(player) || is_true(player.inlaststand) || scripts\cp\zombies\zombie_afterlife_arcade::is_in_afterlife_arcade(player);
        if (down)
        {
            was_down = 1;
            continue;
        }

        if (was_down)
        {
            was_down = 0;
            // Let the game give its own weapons first.
            wait 1.5;
            foreach (weapon in saved)
            {
                if (!player hasweapon(weapon))
                {
                    player giveweapon(weapon);
                    player givemaxammo(weapon);
                }
            }
            player iprintln("iw-helper: weapons given back");
            continue;
        }

        saved = player getweaponslistprimaries();
    }
}

// --- Easter egg steps -------------------------------------------------------------------------

// "map|step": the step's number in the map's main quest line. Each step of the game's quest system
// waits for a flag or a notification; giving it validates the step, and the game then runs its own end
// of step (for the DJ's parts, it picks up the missing ones itself). Only the step in progress responds:
// a later step's flag does not exist yet.
quest_step(player, entry)
{
    parts = strtok(entry, "|");
    if (parts[0] != level.script)
    {
        player iprintln("iw-helper: this step is for another map");
        return;
    }

    switch (parts[0])
    {
        case "cp_zmb":
            level thread spaceland_step(player, int(parts[1]));
            break;
        case "cp_rave":
            level thread rave_step(player, int(parts[1]));
            break;
        case "cp_town":
            level thread town_step(player, int(parts[1]));
            break;
        case "cp_disco":
            level thread shaolin_step(player, int(parts[1]));
            break;
        case "cp_final":
            level thread beast_step(player, int(parts[1]));
            break;
    }
}

// Sets the flag if the game created it, that is if its step has been reached. True if set.
set_quest_flag(name)
{
    if (!scripts\engine\utility::flag_exist(name))
        return 0;

    scripts\engine\utility::flag_set(name);
    return 1;
}

// Spaceland's "ufo" quest line, which ends with the soul key.
// Each step of the game's sequence runs inside one thread of the quest: a step is never skipped by a
// notification its function ends on ("endon"), which would end the whole quest with it.
spaceland_step(player, step)
{
    done = 1;
    switch (step)
    {
        case 0:
            done = set_quest_flag("dj_fetch_quest_completed");
            break;
        case 1:
            done = set_quest_flag("pap_portal_used");
            level notify("wave_start_sound_done");
            break;
        case 2:
        case 3:
        case 4:
            // The defense ends as if won; its step then waits for the speaker and a round start.
            done = scripts\engine\utility::flag_exist("dj_request_defense_done");
            if (done)
                level thread push_speaker_defense();
            break;
        case 5:
            // The step waits for the next round to start; that start's own signal ends it.
            level notify("regular_wave_starting");
            break;
        case 6:
            done = set_quest_flag("tone_generators_given");
            break;
        case 7:
            done = set_quest_flag("all_center_positions_used");
            break;
        case 8:
            done = set_quest_flag("tones_played_successfully");
            break;
        case 9:
            done = isdefined(level.num_ufo_zombies_killed);
            if (done)
                level thread finish_ufo_clowns(player);
            break;
        case 10:
            level thread finish_grey_fight(player);
            break;
        case 11:
            done = hit_ufo(player);
            break;
    }

    if (done)
        player iprintln("iw-helper: Spaceland step " + (step + 1) + " validated");
    else
        player iprintln("iw-helper: Spaceland step " + (step + 1) + " not reached yet");
}

// A speaker defense, won: requested from the DJ, completed, the speaker picked up and a round
// started, the four things its step waits for in turn.
push_speaker_defense()
{
    scripts\engine\utility::flag_set("dj_request_defense_done");
    wait 0.3;
    level notify("speaker_defense_completed");
    wait 0.3;
    level notify("speaker_picked_up");
    level notify("regular_wave_starting");
}

// The UFO's clowns: it spawns 51 of them over about half a minute and leaves once 50 are dead. They
// are killed as they come, the last one included. 1 once the 50 are dead and no clown is left, 0 after
// three minutes without it.
finish_ufo_clowns(player)
{
    level endon("game_ended");
    for (waited = 0; waited < 360; waited++)
    {
        kill_enemies();
        if (isdefined(level.num_ufo_zombies_killed) && level.num_ufo_zombies_killed >= 50 && !clown_left())
        {
            // The 51st may still be on its way.
            for (i = 0; i < 6; i++)
            {
                wait 0.5;
                kill_enemies();
            }

            return 1;
        }

        wait 0.5;
    }

    return 0;
}

// One of the UFO's clowns is still alive.
clown_left()
{
    foreach (enemy in scripts\cp\cp_agent_utils::get_alive_enemies())
    {
        if (isdefined(enemy) && is_true(enemy.is_suicide_bomber))
            return 1;
    }

    return 0;
}

// The greys: the fight ends with the last grey's death, the game's own way, so they are struck down as
// soon as they appear, and the zombies around them killed. 1 once no grey is left, 0 after three
// minutes without it.
finish_grey_fight(player)
{
    level endon("game_ended");
    seen = 0;
    for (waited = 0; waited < 360; waited++)
    {
        if (isdefined(level.spawned_grey) && level.spawned_grey.size > 0)
        {
            seen = 1;
            foreach (grey in level.spawned_grey)
                hit_grey(player, grey);

            foreach (enemy in scripts\cp\cp_agent_utils::get_alive_enemies())
            {
                if (isdefined(enemy) && isalive(enemy) && !is_grey(enemy))
                    enemy dodamage(enemy.health + 100, enemy.origin);
            }
        }
        else if (seen)
        {
            return 1;
        }

        wait 0.5;
    }

    return 0;
}

is_grey(enemy)
{
    foreach (grey in level.spawned_grey)
    {
        if (grey == enemy)
            return 1;
    }

    return 0;
}

// A grey low on health goes down to regenerate and ignores damage, except a melee blow on the fuse it
// shows in its back, which takes one of its regenerations away: that blow, struck as a player would.
// Standing, it gets no more regeneration and enough damage to go down, or to die.
hit_grey(player, grey)
{
    if (!isdefined(grey) || !isalive(grey))
        return;

    grey.can_do_health_regen = 0;
    if (is_true(grey.is_regening_health))
    {
        if (isdefined(grey.alien_fuse_exposed))
            grey dodamage(1, grey.alien_fuse_exposed.origin, player, player, "MOD_MELEE");
        return;
    }

    grey dodamage(grey.health + 100, grey.origin, player, player);
}

// The only weapon the UFO takes damage from is the park's cannon: a hit from it, and the UFO's own
// destruction follows.
hit_ufo(player)
{
    if (!isdefined(level.ufo))
        return 0;

    level.ufo notify("damage", 100, player, (0, 0, 1), level.ufo.origin, "MOD_EXPLOSIVE", "", "", "", 0, "iw7_spaceland_wmd");
    return 1;
}

// --- Whole easter egg ---------------------------------------------------------------------------------

// The map's whole main easter egg, from the step the match is at. One run at a time.
whole_quest(player)
{
    if (getdvarint("iwh_quest_running") == 1)
    {
        player iprintln("iw-helper: the easter egg is already running");
        return;
    }

    if (level.script != "cp_zmb")
    {
        player iprintln("iw-helper: the whole easter egg is not available on this map yet: use its steps");
        return;
    }

    setdvar("iwh_quest_running", 1);
    whole_spaceland(player);
    setdvar("iwh_quest_running", 0);
}

// Spaceland's UFO quest up to the soul key. Each step is pushed the way its own button does, then the
// next waits until the game has truly moved on: its flag created, its fight started.
whole_spaceland(player)
{
    level endon("game_ended");

    if (!scripts\engine\utility::flag_exist("dj_fetch_quest_completed"))
    {
        player iprintln("iw-helper: Spaceland's easter egg has not started yet");
        return;
    }

    quest_news(player, "1/12, the DJ's parts");
    scripts\engine\utility::flag_set("dj_fetch_quest_completed");

    // The portal, the three defenses and the round after them wait for signals: sent again until the
    // tone generators' step has begun, each pass moving the quest one step at most.
    quest_news(player, "2-6/12, portal, speaker defenses, one round");
    for (waited = 0; !scripts\engine\utility::flag_exist("tone_generators_given"); waited++)
    {
        if (waited >= 120)
            return quest_stuck(player, "2-6");

        set_quest_flag("pap_portal_used");
        level notify("wave_start_sound_done");
        if (scripts\engine\utility::flag_exist("dj_request_defense_done"))
            push_speaker_defense();
        else
            wait 0.6;

        wait 0.5;
    }

    quest_news(player, "7/12, tone generators");
    scripts\engine\utility::flag_set("tone_generators_given");
    if (!wait_quest_flag("all_center_positions_used", 60))
        return quest_stuck(player, 8);

    quest_news(player, "8/12, tone generators placed");
    scripts\engine\utility::flag_set("all_center_positions_used");
    if (!wait_quest_flag("tones_played_successfully", 60))
        return quest_stuck(player, 9);

    // The UFO first flies to the middle of the park, as when the players play the tones.
    for (waited = 0; waited < 60 && !(scripts\engine\utility::flag_exist("ufo_intro_reach_center_portal") && scripts\engine\utility::flag("ufo_intro_reach_center_portal")); waited++)
        wait 0.5;

    quest_news(player, "9/12, the UFO's tones");
    scripts\engine\utility::flag_set("tones_played_successfully");

    quest_news(player, "10/12, the UFO's clowns");
    if (!finish_ufo_clowns(player))
        return quest_stuck(player, 10);

    quest_news(player, "11/12, the greys");
    if (!finish_grey_fight(player))
        return quest_stuck(player, 11);

    // The end of the grey fight takes five seconds before the last step begins.
    wait 8;
    quest_news(player, "12/12, the UFO");
    for (waited = 0; !(scripts\engine\utility::flag_exist("ufo_quest_finished") && scripts\engine\utility::flag("ufo_quest_finished")); waited++)
    {
        if (waited >= 30)
            return quest_stuck(player, 12);

        if (!scripts\engine\utility::flag("ufo_destroyed"))
            hit_ufo(player);

        wait 2;
    }

    quest_news(player, "done, the soul key drops");
}

// Waits up to that many seconds for a quest flag to exist, which the game does when the step that
// uses it begins.
wait_quest_flag(name, seconds)
{
    for (waited = 0; waited < seconds * 2; waited++)
    {
        if (scripts\engine\utility::flag_exist(name))
            return 1;

        wait 0.5;
    }

    return 0;
}

quest_news(player, text)
{
    player iprintlnbold("Easter egg: " + text);
}

quest_stuck(player, step)
{
    player iprintlnbold("Easter egg stopped at step " + step + ": the game did not move on");
}

// Rave's main quest: Kevin Smith's three mementos (each found, charged in a circle fight, then given
// to him), then the survivor and the Super Slasher. Most of its fields have no public name, so a circle
// fight can only be won once started: the photo and the Slasher that follow stay to be done in game.
rave_step(player, step)
{
    done = 1;
    switch (step)
    {
        case 0:
            done = use_quest_object(player, "j_mem_1");
            break;
        case 3:
            done = use_quest_object(player, "j_mem_2");
            break;
        case 6:
            done = use_quest_object(player, "j_mem_3");
            break;
        case 1:
        case 4:
        case 7:
            level notify("speaker_defense_completed");
            break;
        case 2:
            done = set_quest_flag("photo_1_kev_vo_done");
            break;
        case 5:
            done = set_quest_flag("photo_2_kev_vo_done");
            break;
        case 8:
            done = set_quest_flag("survivor_released");
            break;
        case 9:
            done = set_quest_flag("survivor_got_to_island");
            break;
        case 10:
            level notify("super_slasher_death");
            kill_all(player);
            break;
    }

    if (done)
        player iprintln("iw-helper: Rave step " + (step + 1) + " validated");
    else
        player iprintln("iw-helper: Rave step " + (step + 1) + " not reached yet");
}

// The object of a quest step, used as if by the player.
use_quest_object(player, name)
{
    thing = getent(name, "targetname");
    if (!isdefined(thing))
        return 0;

    thing notify("trigger", player);
    return 1;
}

// Radioactive Thing: three lines that run side by side (launch codes, chemistry, death ray), each step
// waiting for its own flag, which the game's end of step expects to find set; then the crab boss, whose
// phases each end on an event.
town_step(player, step)
{
    done = 1;
    if (step < 4)
    {
        done = set_quest_flag("launchcode_step" + (step + 1));
    }
    else if (step < 8)
    {
        done = set_quest_flag("chemistry_step" + (step - 3));
    }
    else if (step < 15)
    {
        done = set_quest_flag("deathray_step" + (step - 7));
    }
    else
    {
        switch (step)
        {
            case 15:
                level notify("crab_boss_quest_completed");
                break;
            case 16:
                level notify("escort_sequence_ended");
                break;
            case 17:
                // The weak spot's first hit, then enough damage to end the phase at once.
                level notify("crab_boss_weak_spot_initial_hit");
                wait 0.5;
                level notify("crab_boss_weak_spot_hit", 9999999);
                break;
            case 18:
                level notify("wall_of_death_completed");
                break;
            case 19:
                level notify("sonic_ring_success");
                break;
        }
    }

    if (done)
        player iprintln("iw-helper: Radioactive Thing step " + (step + 1) + " validated");
    else
        player iprintln("iw-helper: Radioactive Thing step " + (step + 1) + " not reached yet");
}

// Shaolin's soul key quest: every step waits for its start flag, or the same flag ending in "dbg", which
// the developers used to skip and which the game still answers with a branch of its own. A step is
// skipped by starting the next one that way, once it has itself started, so the tasks stay in order.
// Each entry: "flag that says the step started|flag to set".
shaolin_step(player, step)
{
    steps = [
        "|skq_phase_1dbg",
        "skq_phase_1|skq_p2t1_0dbg",
        "skq_p2t1_1|skq_p2t1_2dbg",
        "skq_p2t1_2|skq_p2t1_3dbg",
        "skq_p2t1_3|skq_p2t1_4dbg",
        "skq_p2t1_4|skq_p2t1_5dbg",
        "skq_p2t2_0|skq_p2t2_1dbg",
        "skq_p2t2_1|skq_p2t2_3dbg",
        "skq_p2t2_3|skq_p2t2_4dbg",
        "skq_p2t2_4|skq_p2t2_5dbg",
        "skq_p2t2_5|skq_p2t2_6dbg",
        "skq_p2t2_6|skq_p2t2_7dbg",
        "skq_p2t3_0|skq_p2t3_1dbg",
        "skq_p2t3_1|skq_p2t3_2dbg",
        "skq_p2t3_2|skq_p2t3_3dbg",
        "skq_p2t3_3|skq_p2t3_4dbg",
        "skq_p2t3_4|skq_p2t3_5dbg",
        "skq_p2t3_5|skq_p2t3_6dbg",
        "skq_p2t3_6|skq_phase_3dbg"
    ];

    parts = strtok(steps[step], "|");
    started = 1;
    if (parts.size > 1)
        started = scripts\engine\utility::flag(parts[0]) || scripts\engine\utility::flag(parts[0] + "dbg");

    target = parts[parts.size - 1];
    if (!started || !scripts\engine\utility::flag_exist(target))
    {
        player iprintln("iw-helper: Shaolin step " + (step + 1) + " not reached yet");
        return;
    }

    scripts\engine\utility::flag_set(target);
    player iprintln("iw-helper: Shaolin step " + (step + 1) + " validated");
}

// Beast from Beyond: each step of N31L's quest waits for one flag, the one the developers' own
// shortcut sets.
beast_step(player, step)
{
    flags = [
        "neil_head_found",
        "neil_head_placed",
        "security_doors_deactivated",
        "fuse_puzzle_completed",
        "button_entered_poster",
        "toggle_puzzle_button_pressed",
        "neils_head_placed_in_pap",
        "players_triggered_bossfight"
    ];

    if (set_quest_flag(flags[step]))
        player iprintln("iw-helper: Beast from Beyond step " + (step + 1) + " validated");
    else
        player iprintln("iw-helper: Beast from Beyond step " + (step + 1) + " not reached yet");
}

// --- Fun ------------------------------------------------------------------------------------------

// How many zombies the round still has: its target minus the deaths so far. The state is kept in a
// console variable, like explosive bullets.
switch_zombie_counter(player)
{
    if (getdvarint("iwh_counter") == 1)
    {
        setdvar("iwh_counter", 0);
        player notify("iwh_counter_stop");
        return;
    }

    setdvar("iwh_counter", 1);
    player thread zombie_counter();
}

zombie_counter()
{
    self endon("disconnect");
    self endon("iwh_counter_stop");
    level endon("game_ended");

    title = newclienthudelem(self);
    count = newclienthudelem(self);
    foreach (element in [title, count])
    {
        element.alignx = "left";
        element.aligny = "top";
        element.horzalign = "left";
        element.vertalign = "top";
        element.x = 16;
        element.hidewheninmenu = 1;
        element.archived = 0;
        element.foreground = 1;
    }

    title.y = 150;
    title.fontscale = 1.1;
    title settext("Zombies");
    count.y = 166;
    count.fontscale = 1.8;
    self thread remove_counter(title, count);

    for (;;)
    {
        left = 0;
        if (isdefined(level.desired_enemy_deaths_this_wave) && isdefined(level.current_enemy_deaths))
            left = level.desired_enemy_deaths_this_wave - level.current_enemy_deaths;
        if (left < 0)
            left = 0;
        count setvalue(left);
        wait 0.25;
    }
}

remove_counter(title, count)
{
    self waittill("iwh_counter_stop");
    title destroy();
    count destroy();
}

// Five random bonuses from the map's table, in a circle around the player.
bonus_rain(player)
{
    if (!isdefined(level.loot_id))
    {
        player iprintln("iw-helper: no bonuses on this map");
        return;
    }

    ids = getarraykeys(level.loot_id);
    for (i = 0; i < 5; i++)
    {
        spot = player.origin + anglestoforward((0, i * 72, 0)) * 150;
        scripts\cp\loot::drop_loot(spot, undefined, ids[randomint(ids.size)]);
        wait 0.25;
    }
}

// Every zombie dies, then a physics blast under each body throws it in the air.
launch_zombies(player)
{
    spots = [];
    foreach (enemy in scripts\cp\cp_agent_utils::get_alive_enemies())
    {
        if (!isdefined(enemy) || !isalive(enemy))
            continue;

        spots[spots.size] = enemy.origin;
        enemy dodamage(enemy.health + 100, enemy.origin, player, player, "MOD_EXPLOSIVE");
    }

    // The bodies become ragdolls on the next frame.
    wait 0.1;
    foreach (spot in spots)
        physicsexplosionsphere(spot + (0, 0, -16), 160, 100, 7);

    player iprintln("iw-helper: " + spots.size + " zombies launched");
}

burn_zombies(player)
{
    count = 0;
    foreach (enemy in scripts\cp\cp_agent_utils::get_alive_enemies())
    {
        if (!isdefined(enemy) || !isalive(enemy))
            continue;

        enemy thread burn_out(player);
        count++;
    }

    player iprintln("iw-helper: " + count + " zombies on fire");
}

// The game's burning look (as after a nuke), then fire damage until the zombie dies.
burn_out(player)
{
    self endon("death");
    self.is_burning = 1;
    self thread scripts\cp\zombies\zombie_scriptable_states::applyzombiescriptablestate(self);

    for (i = 0; i < 6; i++)
    {
        wait 0.5;
        self dodamage(int(self.maxhealth / 5) + 10, self.origin, player, player, "MOD_BURNED");
    }

    self dodamage(self.health + 100, self.origin, player, player, "MOD_BURNED");
}

shock_zombies(player)
{
    count = 0;
    foreach (enemy in scripts\cp\cp_agent_utils::get_alive_enemies())
    {
        if (!isdefined(enemy) || !isalive(enemy))
            continue;

        enemy thread shock(player);
        count++;
    }

    player iprintln("iw-helper: " + count + " zombies electrocuted");
}

// The stun of the game's shock weapons, three times in a row, with the electric effect of the Zap perk.
shock(player)
{
    self endon("death");
    for (i = 0; i < 3; i++)
    {
        if (isdefined(level._effect["reload_zap_m"]))
            playfx(level._effect["reload_zap_m"], self.origin + (0, 0, 40));
        self thread scripts\cp\cp_weapon::fx_stun_damage(self, player);
        wait 1;
    }
}

super_sprint(player)
{
    player endon("disconnect");
    player setmovespeedscale(1.8);
    player iprintln("iw-helper: super sprint for 30 seconds");
    wait 30;
    player setmovespeedscale(1);
    player iprintln("iw-helper: super sprint over");
}

// Bonuses are named after the map's loot table, such as "kill_50" or "ammo_max": the first one whose
// name is the argument, or starts with it, is dropped.
drop_bonus(player, kind)
{
    if (!isdefined(level.loot_id))
    {
        player iprintln("iw-helper: no bonuses on this map");
        return;
    }

    if (kind == "")
    {
        player iprintln("iw-helper: drop what? (set iwh bonuses)");
        return;
    }

    foreach (id in getarraykeys(level.loot_id))
    {
        parts = strtok(id, "_");
        if (id != kind && parts[0] != kind)
            continue;

        spot = player.origin + anglestoforward(player.angles) * 80;
        scripts\cp\loot::drop_loot(spot, undefined, id);
        player iprintln("iw-helper: bonus dropped (" + id + ")");
        return;
    }

    player iprintln("iw-helper: no " + kind + " bonus on this map");
}

list_bonuses(player)
{
    if (!isdefined(level.loot_id))
    {
        player iprintln("iw-helper: no bonuses on this map");
        return;
    }

    names = "";
    foreach (id in getarraykeys(level.loot_id))
        names = names + id + " ";

    player iprintln("iw-helper bonuses: " + names);
}
