// Fake engine to see the interface in a browser, without the game or the Tauri window.
// `?tab=reglages` picks the open page, `?etat=absent|menu|match` the game state, `?lang=fr` the language.
import type { Action, Group, Pick, TabId, Tweak, View } from "./api";
import { type Lang, setLang, t } from "./i18n";

const params = new URLSearchParams(location.search);
const game = (params.get("etat") ?? "match") as View["game"];
const playing = game === "match";
// On opening, everything is off, as in the real tool. `?actives=1` turns three options on in a
// match, so previews can show the on state too.
const lit = playing && params.get("actives") === "1";

/** The whole view in one language: the text is what the engine would send. */
function makeView(language: Lang): View {
  setLang(language);
  const groups: Group[] = [
    {
      title: t("Player", "Joueur"),
      options: [
        { key: "god_mode", label: t("God mode", "Invincibilité"), hint: t("You no longer take damage.", "Vous ne prenez plus de dégâts."), hotkey: "F1", on: lit, code: false, trial: false },
        {
          key: "no_target",
          label: t("No target", "Sans cible"),
          hint: t("Zombies ignore you, but still hit you if you bump into them.", "Les zombies vous ignorent, mais frappent encore si vous les touchez."),
          hotkey: "F6",
          on: false,
          code: false,
          trial: false,
        },
        { key: "noclip", label: "Noclip", hint: t("Walk through walls. Turn it off with your feet on the ground.", "Traversez les murs. À couper les pieds au sol."), hotkey: "F5", on: false, code: false, trial: false },
        {
          key: "jump_pack",
          label: "Jump pack",
          hint: t("Brings back double jump, wall running and ledge climbing.", "Rend le double saut, la course sur les murs et l'escalade des rebords."),
          hotkey: "F11",
          on: false,
          code: false,
          trial: false,
        },
      ],
    },
    {
      title: t("Weapons", "Armes"),
      options: [
        {
          key: "infinite_ammo",
          label: t("Infinite ammo", "Munitions infinies"),
          hint: t("Magazine and reserve stay full; the magazine shows 511.", "Chargeur et réserve pleins ; le chargeur affiche 511."),
          hotkey: "F2",
          on: false,
          code: false,
          trial: false,
        },
        { key: "one_hit_kill", label: t("One-hit kill", "Un coup = un mort"), hint: t("Any hit kills a zombie.", "Le moindre coup tue un zombie."), hotkey: "F3", on: false, code: false, trial: false },
        { key: "no_recoil", label: t("No recoil", "Sans recul"), hint: t("The weapon no longer climbs when you fire.", "L'arme ne monte plus quand vous tirez."), hotkey: "F8", on: lit, code: true, trial: false },
        { key: "rapid_fire", label: t("Rapid fire", "Tir rapide"), hint: t("Faster rate of fire.", "Cadence de tir accélérée."), hotkey: "F9", on: false, code: true, trial: false },
      ],
    },
    {
      title: t("Match", "Partie"),
      options: [
        { key: "infinite_money", label: t("Infinite money", "Argent infini"), hint: t("Money kept at 100,000.", "Argent maintenu à 100 000."), hotkey: "F4", on: lit, code: false, trial: false },
        { key: "slow_motion", label: t("Game speed", "Vitesse du jeu"), hint: t("Game speed multiplied by 0.5.", "Vitesse du jeu multipliée par 0,5."), hotkey: "F7", on: false, code: false, trial: false },
        { key: "low_gravity", label: t("Low gravity", "Faible gravité"), hint: t("Higher, slower jumps.", "Sauts plus hauts et plus lents."), hotkey: "F10", on: false, code: true, trial: false },
        {
          key: "pause_zombies",
          label: t("Pause zombies", "Pause des zombies"),
          hint: t("Current zombies vanish and no new ones spawn. They come back when you turn it off.", "Les zombies présents disparaissent et plus aucun n'apparaît. Ils reviennent en coupant."),
          hotkey: "",
          on: false,
          code: false,
          trial: false,
        },
      ],
    },
  ];

  // The same values and actions as the engine (src/trainer.rs: `Tweak` and `OneShot`), in the same order.
  const tweaks: Tweak[] = [
    {
      key: "timescale",
      label: t("Game speed", "Vitesse du jeu"),
      hint: t("Slows down or speeds up the whole match. Back to 1 when the match ends.", "Ralentit ou accélère toute la partie. Revient à 1 en fin de partie."),
      value: 1,
      min: 0.1,
      max: 3,
      step: 0.05,
      default: 1,
      unit: "×",
      code: false,
      trial: false,
    },
    {
      key: "move_speed",
      label: t("Movement speed", "Vitesse de déplacement"),
      hint: t("How fast the player runs. Back to 190 when the match ends.", "Vitesse de course du joueur. Revient à 190 en fin de partie."),
      value: 190,
      min: 50,
      max: 600,
      step: 10,
      default: 190,
      unit: "",
      code: false,
      trial: false,
    },
    {
      key: "jump_height",
      label: t("Jump height", "Hauteur de saut"),
      hint: t("How high a jump goes, set in the Zombies suit. Back to 39 when the match ends.", "Hauteur d'un saut, réglée dans la tenue Zombies. Revient à 39 en fin de partie."),
      value: 39,
      min: 10,
      max: 400,
      step: 1,
      default: 39,
      unit: "",
      code: false,
      trial: false,
    },
    {
      key: "cash_scalar",
      label: t("Money multiplier", "Multiplicateur d'argent"),
      hint: t(
        "Money earned per zombie killed, like Double Points but at the rate you pick. Lasts for the current match.",
        "Argent gagné par zombie tué, comme les points doubles mais au choix. Vaut pour la partie en cours.",
      ),
      value: 1,
      min: 1,
      max: 10,
      step: 1,
      default: 1,
      unit: "×",
      code: false,
      trial: true,
    },
  ];

  const actions: Action[] = [
    { key: "refill_ammo", label: t("Refill ammo", "Remplir les munitions"), hint: t("Magazines to 511 and reserves to 9999, once.", "Chargeurs à 511 et réserves à 9999, une seule fois."), button: t("Refill", "Remplir"), trial: false },
    {
      key: "add_money",
      label: t("Add $10,000", "Ajouter 10 000 $"),
      hint: t("Once. The in-game counter catches up on your next gain or purchase.", "Une seule fois. L'affichage du jeu suit au prochain gain ou achat."),
      button: t("Add", "Ajouter"),
      trial: false,
    },
    {
      key: "weaken_zombies",
      label: t("Weaken current zombies", "Affaiblir les zombies présents"),
      hint: t("Health set to 1 for zombies already spawned. For later ones too, use One-hit kill.", "Vie à 1 pour ceux déjà apparus. Pour les suivants aussi : « Un coup = un mort »."),
      button: t("Weaken", "Affaiblir"),
      trial: false,
    },
    {
      key: "end_round",
      label: t("End the round", "Finir la manche"),
      hint: t("The round counts as won and the next one starts. Zombies still alive stay.", "La manche compte comme gagnée et la suivante commence. Les zombies encore là restent."),
      button: t("End", "Finir"),
      trial: false,
    },
    {
      key: "charge_cards",
      label: t("Recharge Fate & Fortune cards", "Recharger les cartes Fate & Fortune"),
      hint: t("The card meter fills up on your next money gain.", "La jauge des cartes se remplit au prochain gain d'argent."),
      button: t("Recharge", "Recharger"),
      trial: false,
    },
    {
      key: "add_tickets",
      label: t("Add 1,000 tickets", "Ajouter 1 000 tickets"),
      hint: t("Zombies in Spaceland arcade tickets. The counter catches up on your next ticket won.", "Tickets d'arcade de Zombies in Spaceland. Le compteur suit au prochain ticket gagné."),
      button: t("Add", "Ajouter"),
      trial: false,
    },
  ];

  // Carried out by the iw7-mod script (src/trainer.rs: `OneShot::script_code`).
  const bonus = t("Appears in front of you: walk into it. Not every map has every bonus.", "Apparaît devant vous : passez dessus. Toutes les cartes n'ont pas tous les bonus.");
  const drop = (key: string, label: string): Action => ({ key, label, hint: bonus, button: t("Drop", "Faire apparaître"), trial: false });
  const extras: Action[] = [
    {
      key: "whole_quest",
      label: t("Whole easter egg (Spaceland)", "Tout le secret (Spaceland)"),
      hint: t(
        "Every step of the main easter egg, one after the other, from wherever the match is up to the soul key. A few minutes: messages in game follow it.",
        "Toutes les étapes du grand secret, l'une après l'autre, depuis là où en est la partie jusqu'à la clé d'âme. Quelques minutes : des messages en jeu suivent l'avancée.",
      ),
      button: t("Run", "Lancer"),
      trial: true,
    },
    {
      key: "upgrade_weapons",
      label: "Pack-a-Punch",
      hint: t("Every player's weapons go up one level. Again for the next level.", "Les armes de tous les joueurs montent d'un niveau. Encore une fois pour le niveau suivant."),
      button: t("Upgrade", "Améliorer"),
      trial: false,
    },
    { key: "kill_all", label: t("Kill every zombie", "Tuer tous les zombies"), hint: t("Every zombie alive, at once. Bosses may resist.", "Tous les zombies en vie, d'un coup. Les boss peuvent résister."), button: t("Kill", "Tuer"), trial: false },
    {
      key: "open_doors",
      label: t("Open doors and turn on power", "Ouvrir les portes et allumer le courant"),
      hint: t("What the game's direct boss fight mode does: power, doors and paid passages.", "Ce que fait le mode combat de boss direct du jeu : courant, portes et passages payants."),
      button: t("Open", "Ouvrir"),
      trial: false,
    },
    { key: "all_perks", label: t("All perks", "Tous les atouts"), hint: t("Every perk of this map, for you.", "Tous les atouts de cette carte, pour vous."), button: t("Get", "Obtenir"), trial: false },
    {
      key: "box_weapon",
      label: t("Mystery weapon", "Arme mystère"),
      hint: t("A random weapon from this map's list, in place of the one in hand if you are full.", "Une arme au hasard dans la liste de la carte, à la place de celle en main si vous êtes plein."),
      button: t("Get", "Obtenir"),
      trial: false,
    },
    drop("drop_max_ammo", t("Max ammo bonus", "Bonus munitions max")),
    drop("drop_nuke", t("Nuke bonus", "Bonus nuke")),
    drop("drop_instakill", t("Instakill bonus", "Bonus instakill")),
    drop("drop_double_money", t("Double money bonus", "Bonus argent double")),
    drop("drop_fire_sale", t("Fire sale bonus", "Bonus soldes")),
    drop("drop_infinite_ammo", t("Infinite ammo bonus", "Bonus munitions infinies")),
    {
      key: "next_character",
      label: t("Change character", "Changer de personnage"),
      hint: t(
        "The next of this map's characters, hidden ones included (Hasselhoff, Wyler, Kevin Smith, Pam Grier). Other maps' characters are not loaded.",
        "Le personnage suivant de cette carte, cachés compris (Hasselhoff, Wyler, Kevin Smith, Pam Grier). Ceux des autres cartes ne sont pas chargés.",
      ),
      button: t("Change", "Changer"),
      trial: false,
    },
    {
      key: "revive",
      label: t("Revive", "Se relever"),
      hint: t("Every player down gets back up, from last stand or the afterlife arcade.", "Tout joueur à terre se relève, en dernier recours ou depuis l'arcade de l'au-delà."),
      button: t("Revive", "Relever"),
      trial: true,
    },
    {
      key: "third_person",
      label: t("Third-person view", "Vue à la troisième personne"),
      hint: t("Switches between first and third-person view.", "Passe de la vue à la première personne à la troisième, et inversement."),
      button: t("Switch", "Basculer"),
      trial: true,
    },
    {
      key: "explosive_bullets",
      label: t("Explosive bullets", "Balles explosives"),
      hint: t("Switches on or off: each shot explodes where it lands, away from you.", "S'active ou se coupe : chaque tir explose là où il touche, loin de vous."),
      button: t("Switch", "Basculer"),
      trial: true,
    },
    {
      key: "zombie_counter",
      label: t("Zombie counter", "Compteur de zombies"),
      hint: t("Shows on screen how many zombies the round still has. Again to hide it.", "Affiche à l'écran combien de zombies il reste dans la manche. Encore une fois pour le cacher."),
      button: t("Switch", "Basculer"),
      trial: true,
    },
    { key: "bonus_rain", label: t("Bonus rain", "Pluie de bonus"), hint: t("Five random bonuses fall around you.", "Cinq bonus au hasard tombent autour de vous."), button: t("Drop", "Faire tomber"), trial: true },
    {
      key: "launch_zombies",
      label: t("Launch the zombies", "Faire voler les zombies"),
      hint: t("Every zombie alive dies and flies up in the air.", "Tous les zombies en vie meurent et s'envolent."),
      button: t("Launch", "Lancer"),
      trial: true,
    },
    {
      key: "burn_zombies",
      label: t("Set zombies on fire", "Mettre le feu aux zombies"),
      hint: t("Every zombie alive catches fire and burns out within a few seconds.", "Tous les zombies en vie prennent feu et se consument en quelques secondes."),
      button: t("Ignite", "Enflammer"),
      trial: true,
    },
    {
      key: "shock_zombies",
      label: t("Electrocute zombies", "Électrocuter les zombies"),
      hint: t("Every zombie alive is stunned by an electric shock for a moment.", "Tous les zombies en vie sont paralysés un moment par une décharge."),
      button: t("Shock", "Électrocuter"),
      trial: true,
    },
    { key: "super_sprint", label: t("Super sprint", "Super sprint"), hint: t("You run almost twice as fast for 30 seconds.", "Vous courez presque deux fois plus vite pendant 30 secondes."), button: t("Sprint", "Sprinter"), trial: true },
    {
      key: "xray",
      label: t("See zombies through walls", "Voir les zombies à travers les murs"),
      hint: t("Switches on or off: every zombie gets an outline you see through walls.", "S'active ou se coupe : chaque zombie a un contour visible à travers les murs."),
      button: t("Switch", "Basculer"),
      trial: true,
    },
    {
      key: "max_pap",
      label: t("Pack-a-Punch to the top", "Pack-a-Punch au maximum"),
      hint: t("Every player's weapons go up two levels at once.", "Les armes de tous les joueurs montent de deux niveaux d'un coup."),
      button: t("Upgrade", "Améliorer"),
      trial: true,
    },
    {
      key: "unlimited_revives",
      label: t("Unlimited self-revives", "Auto-réanimations illimitées"),
      hint: t("Switches on or off: in solo, the revive machine never stops selling.", "S'active ou se coupe : en solo, la machine de réanimation n'arrête jamais de vendre."),
      button: t("Switch", "Basculer"),
      trial: true,
    },
    {
      key: "bonus_on_kill",
      label: t("A bonus per zombie killed", "Un bonus par zombie tué"),
      hint: t("Switches on or off: every zombie that spawns from now drops a random bonus when it dies.", "S'active ou se coupe : chaque zombie qui apparaît ensuite lâche un bonus au hasard en mourant."),
      button: t("Switch", "Basculer"),
      trial: true,
    },
    {
      key: "refill_deck",
      label: t("Refill the card deck", "Recharger le paquet de cartes"),
      hint: t(
        "Your Fate & Fortune cards all come back, as from the machine. The meter starts again from zero.",
        "Toutes vos cartes Fate & Fortune reviennent, comme à la machine. La jauge repart de zéro.",
      ),
      button: t("Refill", "Recharger"),
      trial: true,
    },
    {
      key: "money_for_all",
      label: t("$10,000 for everyone", "10 000 $ pour tout le monde"),
      hint: t(
        "Every player gets $10,000, the game's own way: the counter follows right away.",
        "Chaque joueur reçoit 10 000 $, à la manière du jeu : le compteur suit tout de suite.",
      ),
      button: t("Give", "Donner"),
      trial: true,
    },
    {
      key: "bring_players",
      label: t("Bring everyone to me", "Ramener tout le monde"),
      hint: t(
        "Every other player is teleported next to you (co-op).",
        "Tous les autres joueurs sont téléportés à côté de vous (coop).",
      ),
      button: t("Bring", "Ramener"),
      trial: true,
    },
    {
      key: "go_to_player",
      label: t("Go to a player", "Aller vers un joueur"),
      hint: t(
        "Teleports you next to another player; again for the next one (co-op).",
        "Vous téléporte à côté d'un autre joueur ; encore une fois pour le suivant (coop).",
      ),
      button: t("Go", "Y aller"),
      trial: true,
    },
    {
      key: "horde",
      label: t("Spawn a horde", "Faire apparaître une horde"),
      hint: t(
        "Ten zombies around you, of the kind last chosen in Spawn a zombie (regular zombies otherwise).",
        "Dix zombies autour de vous, du type choisi en dernier dans Faire apparaître un zombie (des zombies normaux sinon).",
      ),
      button: t("Spawn", "Faire apparaître"),
      trial: true,
    },
    {
      key: "gun_game",
      label: t("Gun game", "Gun game"),
      hint: t(
        "Switches on or off: every 5 zombies killed, the weapon in hand becomes a random one.",
        "S'active ou se coupe : tous les 5 zombies tués, l'arme en main est remplacée au hasard.",
      ),
      button: t("Switch", "Basculer"),
      trial: true,
    },
    {
      key: "match_stats",
      label: t("Timer and kills", "Chrono et kills"),
      hint: t(
        "Shows on screen the time since switched on and the zombies killed since. Again to hide it.",
        "Affiche à l'écran le temps écoulé et les zombies tués depuis l'activation. Encore une fois pour le cacher.",
      ),
      button: t("Switch", "Basculer"),
      trial: true,
    },
    {
      key: "keep_weapons",
      label: t("Keep weapons", "Garder ses armes"),
      hint: t(
        "Switches on or off: the weapons you carried come back when you get up after going down.",
        "S'active ou se coupe : vos armes reviennent quand vous vous relevez après être tombé.",
      ),
      button: t("Switch", "Basculer"),
      trial: true,
    },
  ];

  // Choices from the script's lists (src/picks.rs), a few of each, numbered as the script would.
  const list = (labels: string[]) => labels.map((label, index) => ({ index, label }));
  const picks: Pick[] = [
    {
      key: "card",
      label: t("Fate & Fortune card", "Carte Fate & Fortune"),
      hint: t("Its effect starts right away, without using a card from your deck. A card with a duration stops at its end.", "Son effet démarre tout de suite, sans utiliser de carte du paquet. Une carte à durée s'arrête à la fin."),
      button: t("Use", "Utiliser"),
      trial: true,
      options: list(["Nade Party (Fate)", "Mana Up (Fate)", "Black Hole Fun (Fortune)", "Kabooom! (Fortune)", "Packin' Heat (Fortune)"]),
    },
    {
      key: "weapon",
      label: t("Weapon", "Arme"),
      hint: t("In place of the one in hand if you carry the maximum. Only weapons the current map has.", "À la place de celle en main si vous êtes plein. Seulement les armes que la carte en cours possède."),
      button: t("Get", "Obtenir"),
      trial: true,
      // Long enough to show the search field.
      options: list([
        "Dischord (Spaceland)",
        "Face Melter (Spaceland)",
        "Headcutter (Spaceland)",
        "Shredder (Spaceland)",
        "Katana (Shaolin)",
        "Venom-X (Beast from Beyond)",
        "Atlas",
        "Banshee",
        "EBR-800",
        "Kendall 44",
        "NV4",
        "R3K",
        "Volk",
        "Widowmaker",
      ]),
    },
    {
      key: "craftable",
      label: t("Crafted trap", "Piège à fabriquer"),
      hint: t("Ready to place, as if built at the crafting station. Only on the maps named.", "Prêt à poser, comme s'il sortait de l'atelier. Seulement sur les cartes indiquées."),
      button: t("Get", "Obtenir"),
      trial: true,
      options: list([t("Sentry turret (Spaceland, Rave, Shaolin)", "Tourelle (Spaceland, Rave, Shaolin)"), t("Boombox (Spaceland, Rave, Shaolin)", "Boombox (Spaceland, Rave, Shaolin)")]),
    },
    {
      key: "zombie",
      label: t("Spawn a zombie", "Faire apparaître un zombie"),
      hint: t("Appears a few steps in front of you. Only the kinds the current map has; bosses are not offered.", "Apparaît à quelques pas devant vous. Seulement les types que la carte possède ; les boss ne sont pas proposés."),
      button: t("Spawn", "Faire apparaître"),
      trial: true,
      options: list(["Zombie", "Clown (Spaceland)", "Brute", t("Grey alien", "Extraterrestre gris")]),
    },
    {
      key: "place",
      label: t("Go to", "Aller à"),
      hint: t("Teleports you there. Again for the next one of the same kind, when the map has several.", "Vous y téléporte. Encore une fois pour le suivant du même genre, quand la carte en a plusieurs."),
      button: t("Go", "Y aller"),
      trial: true,
      options: list([t("Next zone of the map", "Zone suivante de la carte"), t("Fast travel portal", "Portail de voyage rapide"), "Pack-a-Punch", t("Mystery wheel", "Roue mystère"), t("Perk machine", "Machine à atout"), t("Fate & Fortune machine", "Machine Fate & Fortune"), t("Crafting station", "Atelier")]),
    },
    {
      key: "pace",
      label: t("Zombie speed", "Vitesse des zombies"),
      hint: t("For every zombie, new ones included, until set back to Normal.", "Pour tous les zombies, nouveaux compris, jusqu'au retour à Normale."),
      button: t("Apply", "Appliquer"),
      trial: true,
      options: list([t("Normal", "Normale"), t("All fast", "Tous rapides"), t("All slow", "Tous lents")]),
    },
    {
      key: "quest",
      label: t("Easter egg step", "Étape d'easter egg"),
      hint: t(
        "Validates the step you are at in the map's main quest. A step not reached yet does nothing: choose the one in progress.",
        "Valide l'étape où vous en êtes dans la quête principale de la carte. Une étape pas encore atteinte ne fait rien : choisissez celle en cours.",
      ),
      button: t("Validate", "Valider"),
      trial: true,
      options: list([
        t("Spaceland 1: the DJ's three parts", "Spaceland 1 : les trois pièces du DJ"),
        t("Spaceland 2: Pack-a-Punch portal", "Spaceland 2 : portail du Pack-a-Punch"),
        t("Spaceland 12: destroy the UFO (soul key)", "Spaceland 12 : détruire l'OVNI (clé d'âme)"),
      ]),
    },
  ];

  const keys = { allOff: t("End", "Fin"), savePosition: t("Page Up", "Page préc."), teleport: t("Page Down", "Page suiv.") };
  return {
    startTab: (params.get("tab") ?? "accueil") as TabId,
    language,
    accent: "#60cdff",
    game,
    state: { absent: t("Game not running", "Jeu non lancé"), menu: t("Game running, not in a match", "Jeu lancé, hors partie"), match: t("In a match", "En partie") }[game],
    message: {
      absent: { text: t("Start Infinite Warfare from Steam: this window will follow it.", "Lancez Infinite Warfare depuis Steam : cette fenêtre le suivra."), tone: "guide" as const },
      menu: {
        text: t("Options unlock once the round has started. The game runs on 12 threads.", "Les options se débloquent une fois la manche commencée. Le jeu tourne sur 12 threads."),
        tone: "guide" as const,
      },
      match: { text: t("Click an option, or use its key in game. The game runs on 12 threads.", "Cliquez une option, ou utilisez sa touche en jeu. Le jeu tourne sur 12 threads."), tone: "guide" as const },
    }[game],
    ready: game !== "absent",
    profileReady: game !== "absent",
    groups,
    tweaks,
    actions,
    extras,
    picks,
    // `?client=mod`: the game is iw7-mod.
    modClient: game !== "absent" && params.get("client") === "mod",
    // In a match on iw7-mod, the script reports its map.
    map: playing && params.get("client") === "mod" ? "Spaceland" : null,
    keys,
    savedPosition: playing ? [1204, -388, 64] : null,
    character: game === "absent" ? null : 0,
    characters: [
      { code: 0, name: t("Normal draw", "Tirage normal"), map: t("All maps", "Toutes les cartes") },
      { code: 1, name: "David Hasselhoff", map: "Zombies in Spaceland" },
      { code: 5, name: "Willard Wyler", map: "Zombies in Spaceland" },
      { code: 2, name: "Kevin Smith", map: "Rave in the Redwoods" },
      { code: 3, name: "Pam Grier", map: "Shaolin Shuffle" },
      { code: 4, name: "Elvira", map: "Attack of the Radioactive Thing" },
    ],
    hotkeys: [
      ...groups.flatMap((group) => group.options).map((option) => ({ label: option.label, key: option.hotkey })),
      // One-off actions have no key until the configuration gives them one.
      ...actions.map((action) => ({ label: action.label, key: "" })),
      ...extras.map((action) => ({ label: action.label, key: "" })),
      { label: t("Save position", "Enregistrer la position"), key: keys.savePosition },
      { label: t("Back to saved position", "Revenir à la position"), key: keys.teleport },
      { label: t("Turn everything off", "Tout désactiver"), key: keys.allOff },
    ],
    watching: false,
    settings: {
      cpu: {
        enabled: true,
        smt: false,
        cores: 12,
        coreCount: 12,
        priority: "high",
        priorities: [
          { key: "normal", label: t("Normal", "Normale") },
          { key: "above_normal", label: t("Above", "Supérieure") },
          { key: "high", label: t("High", "Haute") },
        ],
        outcome: t("The game will start with 12 of 24 threads.", "Le jeu démarrera avec 12 threads sur 24."),
        threads: 12,
        totalThreads: 24,
      },
      fps: { enabled: true, limit: 240, effective: 250 },
      windows: { dedicatedGpu: true, windowedOptimizationsOff: false },
      onTop: false,
      sound: true,
    },
    logPath: "C:\\iw-helper\\logs\\session-20261013-190214.log",
  };
}

let view = makeView(params.get("lang") === "fr" ? "fr" : "en");

const journal = [
  t("19:02:14  iw7_ship.exe started (pid 4242), affinity set from the start.", "19:02:14  iw7_ship.exe lancé (pid 4242), affinité en place dès le démarrage."),
  t("19:02:14  iw7_ship.exe found (pid 4242).", "19:02:14  iw7_ship.exe détecté (pid 4242)."),
  t("19:02:14  High priority applied.", "19:02:14  Priorité Haute appliquée."),
  t("19:02:31  Game version recognised.", "19:02:31  Version du jeu reconnue."),
  t("19:02:31  FPS limit set (91 -> 240).", "19:02:31  Limite de FPS réglée (91 -> 240)."),
  t("19:04:02  Match detected.", "19:04:02  Partie détectée."),
  t("19:04:40  God mode: ON", "19:04:40  Invincibilité : ON"),
  t("19:04:51  Infinite money: ON", "19:04:51  Argent infini : ON"),
  t("19:05:20  No recoil: ON", "19:05:20  Sans recul : ON"),
  t(
    "19:05:44  Round change impossible (round variable not found in this match).",
    "19:05:44  Changement de manche impossible (variable de la manche introuvable dans cette partie).",
  ),
];

function setMessage(text: string, tone: View["message"]["tone"]) {
  view.message = { text, tone };
  journal.push(`19:06:00  ${text}`);
}

export function respond(command: string, args: Record<string, unknown>): unknown {
  const options = view.groups.flatMap((group) => group.options);
  switch (command) {
    case "view":
      return structuredClone(view);
    case "journal":
      return [...journal];
    case "toggle": {
      const option = options.find((candidate) => candidate.key === args.feature);
      if (option) {
        option.on = !option.on;
        setMessage(t(`${option.label}: ${option.on ? "on" : "off"}`, `${option.label} : ${option.on ? "activé" : "coupé"}`), "done");
      }
      return;
    }
    case "all_off":
      options.forEach((option) => (option.on = false));
      view.tweaks.forEach((tweak) => (tweak.value = tweak.default));
      return setMessage(t("Everything is off.", "Tout est désactivé."), "done");
    case "set_tweak": {
      // Like the engine: the value is brought within bounds, and the message gives the old and new ones.
      const tweak = view.tweaks.find((candidate) => candidate.key === args.key);
      if (tweak) {
        const previous = tweak.value;
        tweak.value = Math.min(tweak.max, Math.max(tweak.min, Number(args.value)));
        setMessage(t(`${tweak.label}: ${previous} -> ${tweak.value}`, `${tweak.label} : ${previous} -> ${tweak.value}`), "done");
      }
      return;
    }
    case "run_pick": {
      const pick = view.picks.find((candidate) => candidate.key === args.pick);
      const choice = pick?.options[Number(args.index)];
      return pick && choice ? setMessage(t(`${pick.label}: ${choice}: done`, `${pick.label} : ${choice} : fait`), "done") : undefined;
    }
    case "run_action": {
      const action = [...view.actions, ...view.extras].find((candidate) => candidate.key === args.key);
      return action ? setMessage(t(`${action.label}: done`, `${action.label} : fait`), "done") : undefined;
    }
    case "survey":
      return setMessage(t("Survey written: releve-20261014-190600.txt", "Relevé écrit : releve-20261014-190600.txt"), "done");
    case "set_round":
      return setMessage(
        t("Round change impossible (round variable not found in this match).", "Changement de manche impossible (variable de la manche introuvable dans cette partie)."),
        "refused",
      );
    case "save_position":
      view.savedPosition = [1204, -388, 64];
      return setMessage(t("Position saved: [1204.0, -388.0, 64.0]", "Position enregistrée : [1204.0, -388.0, 64.0]"), "done");
    case "teleport":
      return setMessage(t("Teleported to [1204.0, -388.0, 64.0]", "Téléporté en [1204.0, -388.0, 64.0]"), "done");
    case "profile": {
      const code = /^character-(\d)$/.exec(String(args.action))?.[1];
      if (code !== undefined) {
        view.character = Number(code);
        return setMessage(t("Character: choice saved for the next match", "Personnage : choix enregistré pour la prochaine partie"), "done");
      }
      return setMessage(t(`Profile: ${String(args.action)}`, `Profil : ${String(args.action)}`), "done");
    }
    case "set_language":
      // The whole view is rebuilt in the other language, as the engine would send it.
      view = makeView(args.language === "fr" ? "fr" : "en");
      return;
    case "set_watch":
      view.watching = Boolean(args.on);
      return;
    case "set_cpu_enabled":
      view.settings.cpu.enabled = Boolean(args.on);
      return;
    case "set_smt":
      view.settings.cpu.smt = Boolean(args.on);
      return;
    case "set_cores":
      view.settings.cpu.cores = Number(args.cores);
      return;
    case "set_priority":
      view.settings.cpu.priority = String(args.priority);
      return;
    case "set_fps": {
      const limit = Number(args.limit);
      const effective = Math.floor(1000 / Math.max(1, Math.floor(1000 / limit)));
      view.settings.fps = { enabled: Boolean(args.enabled), limit, effective };
      return;
    }
    case "apply_windows_settings":
      view.settings.windows = { dedicatedGpu: true, windowedOptimizationsOff: true };
      return;
    case "set_on_top":
      view.settings.onTop = Boolean(args.on);
      return;
    case "set_sound":
      view.settings.sound = Boolean(args.on);
      return;
    default:
      return;
  }
}
