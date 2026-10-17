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
// From the window only: a Fate & Fortune card, a weapon, a crafted trap or a zombie, chosen in a list.
//   drop <bonus>   drop a bonus in front of you: ammo, kill, instakill, cash, upgrade, fire, infinite,
//                  grenade, power, board (what exists depends on the map)
//   bonuses        list the bonuses of this map
//   help           list the commands

// The mailbox: iw-helper writes 7700 + a command number, the script runs it and writes
// 7700 back. Numbers kept in step with OneShot::script_code in src/trainer.rs.
init()
{
    setdvarifuninitialized("iwh", "");
    // Explosive bullets start off at every match.
    setdvar("iwh_explosive", 0);
    setdvar("iwh_counter", 0);
    level.command_given = 7700;
    level thread watch_commands();
}

watch_commands()
{
    level endon("game_ended");

    for (;;)
    {
        wait 0.1;

        // The host: the console and the window are theirs.
        player = level.players[0];
        if (!isdefined(player))
            continue;

        if (level.command_given != 7700)
        {
            code = level.command_given - 7700;
            level.command_given = 7700;
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

// Commands from iw-helper, by number.
run_code(player, code)
{
    // The lists: cards from 100, weapons from 200, traps from 300, zombies from 320.
    if (code >= 100 && code < 200)
        return run_pick(player, "card", code - 100);
    if (code >= 200 && code < 300)
        return run_pick(player, "weapon", code - 200);
    if (code >= 300 && code < 320)
        return run_pick(player, "craftable", code - 300);
    if (code >= 320 && code < 400)
        return run_pick(player, "zombie", code - 320);

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
        case "drop": drop_bonus(player, argument); break;
        case "bonuses": list_bonuses(player); break;
        default: player iprintln("iw-helper: pap, killall, doors, perks, weapon, character, revive, thirdperson, explosive, counter, rain, launch, burn, shock, sprint, drop <bonus>, bonuses"); break;
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
    enemies = scripts\cp\cp_agent_utils::get_alive_enemies();
    count = 0;

    foreach (enemy in enemies)
    {
        if (!isdefined(enemy) || !isalive(enemy))
            continue;

        enemy dodamage(enemy.health + 100, enemy.origin);
        count++;
    }

    player iprintln("iw-helper: " + count + " zombies killed");
}

// What the game's direct boss fight mode runs at the start: each map's own way to turn on the power
// and open its doors (or the generic one: generators, paid doors, chi doors, team doors). Calling it a
// second time does nothing.
open_doors(player)
{
    level thread scripts\cp\zombies\direct_boss_fight::open_sesame();
    player iprintln("iw-helper: power on, doors opening");
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
        if (!scripts\engine\utility::istrue(scripts\cp\cp_laststand::player_in_laststand(other)) && !scripts\cp\zombies\zombie_afterlife_arcade::is_in_afterlife_arcade(other))
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
                "scripts/cp/zombies/craftables/_boombox|give_crafted_boombox|cp_zmb cp_rave cp_disco",
                "scripts/cp/zombies/craftables/_fireworks_trap|give_crafted_fireworks_trap|cp_zmb cp_rave",
                "scripts/cp/zombies/craftables/_electric_trap|give_crafted_trap|cp_zmb cp_rave",
                "scripts/cp/zombies/craftables/_zm_soul_collector|give_crafted_medusa|cp_zmb cp_rave",
                "scripts/cp/zombies/craftables/_revocator|give_crafted_revocator|cp_zmb cp_rave",
                "scripts/cp/zombies/craftables/_gascan|give_crafted_gascan|cp_zmb cp_rave",
                "scripts/cp/crafted_trap_balloons|give_crafted_trap|cp_rave",
                "scripts/cp/crafted_trap_mower|give_crafted_trap|cp_rave"
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
