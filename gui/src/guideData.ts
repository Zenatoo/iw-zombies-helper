// The written guide of each map's main easter egg, in English then in French. The order and the details
// follow the guides credited in `source`, checked against the game's own tables where they disagree:
// recipes, Morse numbers, the word lists and how the chemistry number is computed.

import { chainOf, FINALS, PRODUCTS, REACTIONS } from "./chemistry";

export type Text = readonly [english: string, french: string];
/** A table cell: the same in both languages, or translated. */
export type Cell = string | Text;

/** A picture on the web: opened in the browser from the link, or shown in the page when it is a `figure`. */
export interface Shot {
  label: Text;
  url: string;
}

/**
 * What the host's game shows once a step is done, for the steps it can tell: a flag of `level.flag` set,
 * a quest line of the game's shared quest system past a step (it is at the step after), or a mix.
 */
export type Done = { flag: string } | { past: [line: string, step: number] } | { any: Done[] };

export interface Step {
  title: Text;
  /** Ticked from the game once it shows it, when the player hosts the match; by hand otherwise. */
  done?: Done;
  text?: Text[];
  points?: Text[];
  table?: { head: Text[]; rows: Cell[][] };
  figure?: Shot;
  shots?: Shot[];
}

export interface Part {
  title: Text;
  steps: Step[];
}

export interface MapGuide {
  /** Name of the map as the window's other pages write it. */
  map: string;
  /** Name of the map as the game's scripts write it (`level.script`). */
  code: string;
  quest: Text;
  intro: Text;
  source: string;
  parts: Part[];
}

const SITE = "https://mmmrkennedyzombiesguides.pages.dev/games/";

/** A maker of links to one map's pictures on the guide's site. */
const pictures =
  (folder: string) =>
  (english: string, french: string, file: string): Shot => ({ label: [english, french], url: `${SITE}IW/${folder}/${file}` });

const zmb = pictures("zombies_in_spaceland/pictures");
const rave = pictures("rave_in_the_redwoods/pictures");
const disco = pictures("shaolin_shuffle/pictures");
const town = pictures("attack_of_the_radioactive_thing/pictures");
const final = pictures("the_beast_from_beyond/pictures");

const SPACELAND: MapGuide = {
  map: "Spaceland",
  code: "cp_zmb",
  quest: ["Zombies in Spaceland: Sooooul Key", "Zombies in Spaceland : Sooooul Key"],
  intro: [
    "Allow 40 minutes to an hour. Solo is the easiest way. Pack-a-Punch your starting pistol early: it helps during the whole quest.",
    "Comptez 40 minutes à une heure. Le solo est le plus simple. Améliorez tôt votre pistolet de départ au Pack-a-Punch : il sert pendant toute la quête.",
  ],
  source: `${SITE}IW/zombies_in_spaceland/zombies_in_spaceland_guide`,
  parts: [
    {
      title: ["Power and Pack-a-Punch", "Courant et Pack-a-Punch"],
      steps: [
        {
          title: ["Turn on the five power switches", "Activez les cinq interrupteurs"],
          text: [["Each switch only powers its own area.", "Chaque interrupteur n'alimente que sa zone."]],
          shots: [
            zmb("Spawn: employees-only room, near the M1 wallbuy", "Départ : local réservé aux employés, près de l'arme murale M1", "power/power_spawn.webp"),
            zmb("Journey into Space: hallway between Star Mission and Rover Rampage", "Journey into Space : couloir entre Star Mission et Rover Rampage", "power/power_journey.webp"),
            zmb("Astrocade: left of the gateway portal, near the NV4", "Astrocade : à gauche du portail, près de la NV4", "power/power_arcade.webp"),
            zmb("Polar Peak: right of the Magic Wheel, near Quickies", "Polar Peak : à droite de la roue magique, près de Quickies", "power/power_polar.webp"),
            zmb("Kepler: Moonlight Cafe upstairs, near the portal", "Kepler : étage du Moonlight Cafe, près du portail", "power/power_kepler.webp"),
          ],
        },
        {
          title: ["Use the four teleporters", "Empruntez les quatre téléporteurs"],
          done: { any: [{ flag: "pap_portal_used" }, { past: ["ufo", 1] }] },
          text: [
            [
              "The lights above the main teleporter come on, left to right: Journey, Astrocade, Polar Peak, Kepler. Once all four are lit, the middle teleporter takes you to the projector room.",
              "Les lumières au-dessus du téléporteur principal s'allument de gauche à droite : Journey, Astrocade, Polar Peak, Kepler. Quand les quatre sont allumées, le téléporteur du milieu mène à la salle du projecteur.",
            ],
            [
              "You have 30 seconds to use the Pack-a-Punch there. The teleporter then rests for about a minute.",
              "Vous y avez 30 secondes pour utiliser le Pack-a-Punch. Le téléporteur se repose ensuite environ une minute.",
            ],
          ],
          shots: [
            zmb("Journey: near Star Mission, right of the Volk", "Journey : près de Star Mission, à droite de la Volk", "pap/tele_journey.webp"),
            zmb("Astrocade: between the switch and the entrance", "Astrocade : entre l'interrupteur et l'entrée", "pap/tele_arcade.webp"),
            zmb("Polar Peak: in the Gift Shop", "Polar Peak : dans la boutique", "pap/tele_polar.webp"),
            zmb("Kepler: bottom of the Moonlight Cafe stairs", "Kepler : en bas de l'escalier du Moonlight Cafe", "pap/tele_kepler.webp"),
            zmb("The lights to watch", "Les lumières à surveiller", "pap/tele_indicator.webp"),
            zmb("The middle teleporter, active", "Le téléporteur du milieu, activé", "pap/pap_tele_activated.webp"),
          ],
        },
      ],
    },
    {
      title: ["The easter egg", "Le secret"],
      steps: [
        {
          title: ["Find the three parts of the SETI-COM", "Trouvez les trois pièces du SETI-COM"],
          done: { any: [{ flag: "dj_fetch_quest_completed" }, { past: ["ufo", 0] }] },
          text: [["Each part is at one of three places, drawn at random.", "Chaque pièce se trouve à l'un de trois endroits, tiré au hasard."]],
          shots: [
            zmb("Calculator: Cosmic Way bench, before the Pack-a-Punch portal", "Calculatrice : banc de Cosmic Way, devant le portail du Pack-a-Punch", "main_ee/seti_com/calc_cosmic.webp"),
            zmb("Calculator: Astrocade bin, by the broken railing", "Calculatrice : poubelle de l'Astrocade, près de la rambarde cassée", "main_ee/seti_com/calc_astrocade.webp"),
            zmb("Calculator: Kepler yellow table, above the ERAD", "Calculatrice : table jaune de Kepler, au-dessus de l'ERAD", "main_ee/seti_com/calc_kepler.webp"),
            zmb("Boombox: lower level of the bridge from spawn", "Radio : niveau inférieur du pont du départ", "main_ee/seti_com/boombox_spawn.webp"),
            zmb("Boombox: Moonlight Cafe counter", "Radio : comptoir du Moonlight Cafe", "main_ee/seti_com/boombox_kepler.webp"),
            zmb("Boombox: underground counter, Racin' Stripes room", "Radio : comptoir du sous-sol, salle de Racin' Stripes", "main_ee/seti_com/boombox_underground.webp"),
            zmb("Umbrella: bench at the bottom of the Hyper Slopes", "Parapluie : banc en bas des Hyper Slopes", "main_ee/seti_com/umbrella_cosmic.webp"),
            zmb("Umbrella: Journey, right of the trap box", "Parapluie : Journey, à droite du boîtier de piège", "main_ee/seti_com/umbrella_journey.webp"),
            zmb("Umbrella: Polar Peak Gift Shop counter", "Parapluie : comptoir de la boutique de Polar Peak", "main_ee/seti_com/umbrella_polar.webp"),
          ],
        },
        {
          title: ["Get the SETI-COM from David Hasselhoff", "Récupérez le SETI-COM auprès de David Hasselhoff"],
          done: { any: [{ flag: "dj_request_defense_done" }, { past: ["ufo", 2] }] },
          text: [
            [
              "One round after the third part, the screen shakes and the UFO on the side of Polar Peak flashes with four loud sounds. Hasselhoff is then at one of the Cosmic Tunes stands and gives you the finished SETI-COM.",
              "Une manche après la troisième pièce, l'écran tremble et l'OVNI sur le flanc de Polar Peak clignote avec quatre sons forts. Hasselhoff se trouve alors à l'un des stands Cosmic Tunes et vous remet le SETI-COM terminé.",
            ],
          ],
          shots: [
            zmb("The UFO on Polar Peak", "L'OVNI sur Polar Peak", "main_ee/ufo_on_polar_peak.webp"),
            zmb("Stand: Kepler, left of Octonian Hunter", "Stand : Kepler, à gauche d'Octonian Hunter", "main_ee/tunes_kepler_octonian.webp"),
            zmb("Stand: Kepler, near the geysers", "Stand : Kepler, près des geysers", "main_ee/tunes_kepler_geysers.webp"),
            zmb("Stand: Journey, near Mule Munchies", "Stand : Journey, près de Mule Munchies", "main_ee/tunes_journey.webp"),
          ],
        },
        {
          title: ["Defend the SETI-COM three times", "Défendez le SETI-COM trois fois"],
          done: { past: ["ufo", 4] },
          text: [
            [
              "One defence per round, at three of the seven spots below. Walk around: the screen shakes at the right one. Place the SETI-COM there and survive endless zombies until the timer ends: 60, then 90, then 120 seconds.",
              "Une défense par manche, à trois des sept endroits ci-dessous. Marchez : l'écran tremble au bon endroit. Posez-y le SETI-COM et tenez face aux zombies sans fin jusqu'à la fin du chrono : 60, puis 90, puis 120 secondes.",
            ],
          ],
          points: [
            ["Success: take the SETI-COM back; a zombie drops a Max Ammo. Wait for the next round.", "Réussite : reprenez le SETI-COM ; un zombie lâche des munitions max. Attendez la manche suivante."],
            ["Failure: a Brute appears and Hasselhoff moves to another stand. Fetch a new SETI-COM from him and try again in the same round.", "Échec : une Brute apparaît et Hasselhoff change de stand. Reprenez un SETI-COM auprès de lui et recommencez dans la même manche."],
            ["After the third defence, wait one full round and bring the SETI-COM back to Hasselhoff: he gives you four speakers.", "Après la troisième défense, attendez une manche complète et rapportez le SETI-COM à Hasselhoff : il vous donne quatre enceintes."],
          ],
          shots: [
            zmb("Kepler: fountain near Bombstoppers", "Kepler : fontaine près de Bombstoppers", "main_ee/seti_kepler_gator.webp"),
            zmb("Kepler: between the purple and orange geysers", "Kepler : entre les geysers violet et orange", "main_ee/seti_kepler_geysers.webp"),
            zmb("Polar Peak: middle of the Gift Shop", "Polar Peak : milieu de la boutique", "main_ee/seti_polar_gift.webp"),
            zmb("Cosmic Way: before the Polar Peak entrance", "Cosmic Way : devant l'entrée de Polar Peak", "main_ee/seti_cosmic.webp"),
            zmb("Journey: Blood Pool, before Escape Velocity", "Journey : mare de sang, devant Escape Velocity", "main_ee/seti_journey.webp"),
            zmb("Underground: break room, before Racin' Stripes", "Sous-sol : salle de pause, devant Racin' Stripes", "main_ee/seti_underground.webp"),
            zmb("Outside the Bumper Cars", "Devant les autos tamponneuses", "main_ee/seti_bumpers.webp"),
          ],
        },
        {
          title: ["Place the speakers", "Placez les enceintes"],
          done: { past: ["ufo", 7] },
          text: [
            [
              "Put three speakers on the three golden symbols around the Pack-a-Punch portal, and the fourth right in front of the portal. Have a Weapon of Rock ready if you can: it does heavy damage in the next fight.",
              "Posez trois enceintes sur les trois symboles dorés autour du portail du Pack-a-Punch, et la quatrième juste devant le portail. Si possible, ayez une arme du rock : elle fait de gros dégâts au combat suivant.",
            ],
          ],
          shots: [
            zmb("The golden symbols", "Les symboles dorés", "main_ee/golden_symbols.webp"),
            zmb("The last speaker's spot", "L'emplacement de la dernière enceinte", "main_ee/final_speaker_location.webp"),
          ],
        },
        {
          title: ["Repeat the UFO's colours three times", "Répétez trois fois les couleurs de l'OVNI"],
          done: { any: [{ flag: "tones_played_successfully" }, { past: ["ufo", 8] }] },
          text: [
            [
              "Interact with a speaker in Cosmic Way (in co-op, all players together). You are locked in Cosmic Way and spawn. The speakers shine red, blue, yellow and green: note which is which.",
              "Interagissez avec une enceinte de Cosmic Way (en coop, tous les joueurs ensemble). Vous êtes enfermés dans Cosmic Way et au départ. Les enceintes éclairent en rouge, bleu, jaune et vert : notez laquelle est laquelle.",
            ],
            [
              "The UFO flashes four colours, each with a sound. Write the order down. When it and the speakers turn white, use the speakers in the same order.",
              "L'OVNI fait clignoter quatre couleurs, chacune avec un son. Notez l'ordre. Quand il devient blanc avec les enceintes, utilisez les enceintes dans le même ordre.",
            ],
          ],
          points: [
            ["Solo, you have 15 seconds for the first colour, then 4 seconds between colours. Co-op gives less time.", "En solo, vous avez 15 secondes pour la première couleur, puis 4 secondes entre chaque. La coop laisse moins de temps."],
            ["Unsure? Don't answer: not answering costs nothing, a wrong order brings a Brute. The UFO then shows the same order again.", "Pas sûr ? Ne répondez pas : ne rien faire ne coûte rien, une erreur fait venir une Brute. L'OVNI remontre ensuite le même ordre."],
            ["After a right answer, the UFO floats for about 40 seconds and starts again. Three sequences are needed.", "Après une bonne réponse, l'OVNI flotte environ 40 secondes puis recommence. Il faut trois séquences."],
          ],
        },
        {
          title: ["Kill 50 clowns", "Tuez 50 clowns"],
          done: { past: ["ufo", 9] },
          text: [["They come after the third sequence and run at you to explode: keep your distance and shoot them from afar. Then one alien per player leaves the portal.", "Ils arrivent après la troisième séquence et foncent sur vous pour exploser : gardez vos distances et tirez de loin. Un alien par joueur sort ensuite du portail."]],
        },
        {
          title: ["Beat the aliens: shoot the collar, hit the back", "Battez les aliens : tirez sur le collier, frappez le dos"],
          done: { past: ["ufo", 10] },
          text: [
            [
              "This is the step that looks endless if you only shoot. The glowing collar on its neck shows its health: green, yellow, then red. Shoot it until the alien lands in the playable area, raises a bubble and kneels.",
              "C'est l'étape qui semble sans fin si vous ne faites que tirer. Le collier lumineux à son cou indique sa vie : vert, jaune, puis rouge. Tirez dessus jusqu'à ce que l'alien se pose dans la zone jouable, lève une bulle et s'agenouille.",
            ],
            [
              "While it kneels, melee the fuse in its backpack, from behind. A breaking sound confirms the hit. Do this twice; the third time it falls, it dies by itself.",
              "Quand il est à genoux, frappez au corps à corps le fusible de son sac à dos, par derrière. Un bruit de casse confirme le coup. Faites-le deux fois ; la troisième fois qu'il tombe, il meurt tout seul.",
            ],
          ],
          points: [
            ["Far away, it fires a small quick shot. Close by, its slower blast takes about half your health and slows you.", "De loin, il tire un petit projectile rapide. De près, sa décharge plus lente enlève environ la moitié de la vie et ralentit."],
            ["Keep moving in a circle: Cosmic Way portal, spawn, upper bridge, lower bridge, portal.", "Tournez sans vous arrêter : portail de Cosmic Way, départ, pont du haut, pont du bas, portail."],
            ["Killing a lot of zombies makes it spawn more at your feet.", "Tuer beaucoup de zombies en fait apparaître d'autres à vos pieds."],
          ],
          shots: [
            zmb("The alien", "L'alien", "main_ee/alien_example.webp"),
            zmb("The collar to shoot", "Le collier à viser", "main_ee/alien_collar.webp"),
            zmb("Kneeling: hit the back now", "À genoux : frappez le dos maintenant", "main_ee/alien_downed.webp"),
          ],
        },
        {
          title: ["Upgrade the projector", "Améliorez le projecteur"],
          done: { flag: "fuses_inserted" },
          text: [
            [
              "The fuses appear before the portal and you can leave Cosmic Way. Put them in the projector: for this game, weapons can be upgraded a second time for 10,000 points and Weapons of Rock once for 5,000.",
              "Les fusibles apparaissent devant le portail et vous pouvez quitter Cosmic Way. Mettez-les dans le projecteur : pour cette partie, les armes s'améliorent une seconde fois pour 10 000 points et les armes du rock une fois pour 5 000.",
            ],
          ],
          shots: [zmb("The fuses", "Les fusibles", "main_ee/fuses.webp"), zmb("The upgraded projector", "Le projecteur amélioré", "main_ee/upgraded_pap.webp")],
        },
        {
          title: ["Destroy the UFO", "Détruisez l'OVNI"],
          done: { any: [{ flag: "ufo_destroyed" }, { flag: "ufo_quest_finished" }] },
          text: [
            [
              "Craft and upgrade a Weapon of Rock. On the Spaceland ring, around the bridge from spawn, shoot four of the five nodes: each one turns orange.",
              "Fabriquez et améliorez une arme du rock. Sur l'anneau de Spaceland, autour du pont du départ, tirez sur quatre des cinq points : chacun devient orange.",
            ],
            [
              "Wait for the UFO to be right above the Pack-a-Punch portal, then shoot the fifth. The ring charges for about 3 seconds and fires up through the device above the portal. A UFO in the path explodes, and the Soul Key appears before the portal.",
              "Attendez que l'OVNI soit juste au-dessus du portail du Pack-a-Punch, puis tirez sur le cinquième. L'anneau se charge environ 3 secondes et tire vers le haut par l'appareil au-dessus du portail. Si l'OVNI est sur la trajectoire, il explose et la Soul Key apparaît devant le portail.",
            ],
            [
              "The final film only plays if you are playing as Willard Wyler.",
              "La cinématique de fin ne se joue que si vous jouez Willard Wyler.",
            ],
          ],
          shots: [
            zmb("The five nodes on the ring", "Les cinq points de l'anneau", "main_ee/power_nodes_on_ring.webp"),
            zmb("A node once shot", "Un point après le tir", "main_ee/orange_node.webp"),
            zmb("The Soul Key", "La Soul Key", "main_ee/soul_key.webp"),
          ],
        },
      ],
    },
  ],
};

const RAVE: MapGuide = {
  map: "Rave",
  code: "cp_rave",
  quest: ["Rave in the Redwoods: Locksmith", "Rave in the Redwoods : Locksmith"],
  intro: [
    "Allow 40 minutes to an hour. Keep a Banshee from the wallbuy outside spawn: shotguns knock off arms and legs easily, which the first two challenges ask for.",
    "Comptez 40 minutes à une heure. Gardez une Banshee, l'arme murale à la sortie du départ : les fusils à pompe arrachent facilement bras et jambes, ce que demandent les deux premiers défis.",
  ],
  source: `${SITE}IW/rave_in_the_redwoods/rave_in_the_redwoods_guide`,
  parts: [
    {
      title: ["Power, boat and Pack-a-Punch", "Courant, bateau et Pack-a-Punch"],
      steps: [
        {
          title: ["Turn on the power", "Activez le courant"],
          done: { flag: "power_on" },
          text: [["The only switch is in the basement of the Bear Lodge, under spawn, reached through the mines.", "L'unique interrupteur est au sous-sol du Bear Lodge, sous le départ, accessible par les mines."]],
          shots: [rave("The power switch", "L'interrupteur", "power/power_switch.webp")],
        },
        {
          title: ["Repair the boat", "Réparez le bateau"],
          text: [["Bring the three parts to the boathouse on the docks. Pick up the film reel on the docks before you leave.", "Rapportez les trois pièces au hangar à bateaux sur les quais. Ramassez la bobine de film sur les quais avant de partir."]],
          shots: [
            rave("Handle: Rave Area, near Quickies", "Poignée : zone de la rave, près de Quickies", "pap/handle.webp"),
            rave("Engine: Mess Hall, on the middle pillar", "Moteur : réfectoire, contre le pilier central", "pap/engine.webp"),
            rave("Propeller: Tuff 'Nuff room above spawn", "Hélice : salle de Tuff 'Nuff au-dessus du départ", "pap/propeller.webp"),
            rave("Film reel on the docks", "Bobine sur les quais", "pap/film_reel_docks.webp"),
            rave("The boathouse", "Le hangar à bateaux", "pap/boathouse.webp"),
          ],
        },
        {
          title: ["Open the Pack-a-Punch", "Ouvrez le Pack-a-Punch"],
          text: [
            [
              "The boat drops you on Turtle Island. Take the second reel just outside the cabin's back door and use the broken projector inside. Its portal gives 30 seconds in the Pack-a-Punch room, then rests for about a minute.",
              "Le bateau vous dépose sur Turtle Island. Prenez la seconde bobine juste derrière la porte arrière de la cabane et utilisez le projecteur cassé à l'intérieur. Son portail donne 30 secondes dans la salle du Pack-a-Punch, puis se repose environ une minute.",
            ],
          ],
          shots: [rave("Second reel", "Seconde bobine", "pap/film_reel_cabin.webp"), rave("The projector", "Le projecteur", "pap/broken_proj.webp")],
        },
      ],
    },
    {
      title: ["The easter egg", "Le secret"],
      steps: [
        {
          title: ["Talk to Kevin Smith", "Parlez à Kevin Smith"],
          done: { past: ["jmem", 0] },
          text: [["He is in the attic of the cabin on Turtle Island: this unlocks the first challenge.", "Il est dans le grenier de la cabane de Turtle Island : cela débloque le premier défi."]],
          shots: [rave("Kevin in the attic", "Kevin au grenier", "main_ee/kevin_in_attic.webp")],
        },
        {
          title: ["First photo: 10 arms", "Première photo : 10 bras"],
          done: { any: [{ flag: "photo_1_kev_given" }, { past: ["jmem", 2] }] },
          points: [
            ["Take the photo piece behind the Burning Man, in the Rave Area.", "Prenez le morceau de photo derrière le Burning Man, dans la zone de la rave."],
            ["Place it on the ground before the big bonfire of the Thunderbird Amphitheatre. Rave Mode starts. In co-op, every player must be nearby and nobody already in Rave Mode.", "Posez-le au sol devant le grand feu de l'amphithéâtre Thunderbird. Le mode rave démarre. En coop, tous les joueurs doivent être à côté, et personne déjà en mode rave."],
            ["Shoot the arms off 10 zombies within 60 seconds. Too slow: you lose a random perk, but you can retry at once.", "Arrachez les bras de 10 zombies en 60 secondes. Trop lent : vous perdez un atout au hasard, mais vous pouvez recommencer aussitôt."],
            ["The photo glows: use it within 30 seconds, or you lose a random perk and start over. Using it brings a Slasher.", "La photo brille : utilisez-la dans les 30 secondes, sinon vous perdez un atout au hasard et recommencez. L'utiliser fait venir un Slasher."],
            ["Kill him within 60 seconds, otherwise start this challenge over. You get a Max Ammo and a nuke.", "Tuez-le en 60 secondes, sinon recommencez ce défi. Vous obtenez des munitions max et une bombe."],
            ["Take the photo and go back to Kevin in the attic.", "Reprenez la photo et retournez voir Kevin au grenier."],
          ],
          shots: [
            rave("Where to take it", "Où le prendre", "main_ee/photo_1.webp"),
            rave("Where to place it", "Où le poser", "main_ee/photo_1_amphitheater.webp"),
            rave("Once it glows", "Quand elle brille", "main_ee/photo_1_glowing.webp"),
          ],
        },
        {
          title: ["Second photo: 10 legs", "Seconde photo : 10 jambes"],
          done: { any: [{ flag: "photo_2_kev_given" }, { past: ["jmem", 5] }] },
          points: [
            ["Take the photo piece by the doorway of the Tuff 'Nuff room, upstairs in the Bear Lodge.", "Prenez le morceau de photo près de la porte de la salle de Tuff 'Nuff, à l'étage du Bear Lodge."],
            ["Place it on the ground before the Quickies machine, in the Rave Area. Rave Mode starts. In co-op, every player must be nearby and nobody already in Rave Mode.", "Posez-le au sol devant la machine Quickies, dans la zone de la rave. Le mode rave démarre. En coop, tous les joueurs doivent être à côté, et personne déjà en mode rave."],
            ["Shoot the legs off 10 zombies within 60 seconds. Too slow: you lose a random perk, but you can retry at once.", "Arrachez les jambes de 10 zombies en 60 secondes. Trop lent : vous perdez un atout au hasard, mais vous pouvez recommencer aussitôt."],
            ["The photo glows: use it within 30 seconds, or you lose a random perk and start over. Using it brings a Slasher.", "La photo brille : utilisez-la dans les 30 secondes, sinon vous perdez un atout au hasard et recommencez. L'utiliser fait venir un Slasher."],
            ["Kill him within 60 seconds, otherwise start this challenge over. You get a Max Ammo and a nuke.", "Tuez-le en 60 secondes, sinon recommencez ce défi. Vous obtenez des munitions max et une bombe."],
            ["Take the photo and go back to Kevin in the attic.", "Reprenez la photo et retournez voir Kevin au grenier."],
          ],
          shots: [
            rave("Where to take it", "Où le prendre", "main_ee/photo_2.webp"),
            rave("Where to place it", "Où le poser", "main_ee/photo_2_ground_quickies.webp"),
            rave("Once it glows", "Quand elle brille", "main_ee/photo_2_glowing.webp"),
          ],
        },
        {
          title: ["Skull: 10 headshots", "Crâne : 10 tirs à la tête"],
          done: { any: [{ flag: "survivor_trapped" }, { past: ["jmem", 7] }] },
          points: [
            ["Take the skull on the floor, left of the Magic Wheel in the Bear Lodge basement.", "Prenez le crâne au sol, à gauche de la roue magique, au sous-sol du Bear Lodge."],
            ["Place it on the beach, before Slappy Taffy. Rave Mode starts. In co-op, every player must be nearby and nobody already in Rave Mode.", "Posez-le sur la plage, devant Slappy Taffy. Le mode rave démarre. En coop, tous les joueurs doivent être à côté, et personne déjà en mode rave."],
            ["Get 10 headshots within 60 seconds. Too slow: you lose a random perk, but you can retry at once.", "Réussissez 10 tirs à la tête en 60 secondes. Trop lent : vous perdez un atout au hasard, mais vous pouvez recommencer aussitôt."],
            ["The skull glows: use it within 30 seconds, or you lose a random perk and start over. Using it brings a Slasher.", "Le crâne brille : utilisez-le dans les 30 secondes, sinon vous perdez un atout au hasard et recommencez. L'utiliser fait venir un Slasher."],
            ["Kill him within 60 seconds, otherwise start this challenge over. You get a Max Ammo and a nuke.", "Tuez-le en 60 secondes, sinon recommencez ce défi. Vous obtenez des munitions max et une bombe."],
            ["Take the skull: the buttons below can now be pressed.", "Reprenez le crâne : les boutons ci-dessous peuvent maintenant être utilisés."],
          ],
          shots: [
            rave("Where to take it", "Où le prendre", "main_ee/skull_pickup.webp"),
            rave("Where to place it", "Où le poser", "main_ee/skull_place_down.webp"),
            rave("Once it glows", "Quand il brille", "main_ee/skull_glowing.webp"),
          ],
        },
        {
          title: ["Press the buttons, take the boat", "Appuyez sur les boutons, prenez le bateau"],
          text: [
            [
              "In the basement, all players press, at the same time, wall buttons with no light above them: three are right of the stairs, the fourth left of the Magic Wheel. An alarm confirms it.",
              "Au sous-sol, tous les joueurs appuient, en même temps, sur des boutons muraux sans lumière au-dessus : trois à droite de l'escalier, le quatrième à gauche de la roue magique. Une alarme le confirme.",
            ],
            ["Everyone then enters the boat at the same time: it stops near the island and the Super Slasher appears.", "Tout le monde monte ensuite en même temps dans le bateau : il s'arrête près de l'île et le Super Slasher apparaît."],
          ],
          shots: [
            rave("A button without a light", "Un bouton sans lumière", "main_ee/button_no_light.webp"),
            rave("The three by the stairs", "Les trois près de l'escalier", "main_ee/three_buttons.webp"),
            rave("The fourth", "Le quatrième", "main_ee/one_button.webp"),
          ],
        },
        {
          title: ["Beat the Super Slasher", "Battez le Super Slasher"],
          done: { flag: "super_slasher_fight_complete" },
          text: [["Good weapons: FHR-40, Mauler, RPR-Evo, NV4, Acid Rain, Whirlwind. A round has these stages, and the fight has three rounds:", "Bonnes armes : FHR-40, Mauler, RPR-Evo, NV4, Acid Rain, Whirlwind. Un tour a ces étapes, et le combat compte trois tours :"]],
          points: [
            ["Rave Mode: charge two skulls (more in co-op) with about 30 zombie souls each, until a beam of light shines. A full skull slowly falls and can be recharged.", "Mode rave : chargez deux crânes (plus en coop) avec environ 30 âmes de zombies chacun, jusqu'au rayon de lumière. Un crâne plein descend lentement et peut être rechargé."],
            ["The skulls form a circle on the ground. Lure him into it: walking in or slamming onto it. His lower torso glows: shoot it to leave Rave Mode.", "Les crânes forment un cercle au sol. Attirez-le dedans, en marchant ou par son saut frappé. Le bas de son torse brille : tirez dessus pour quitter le mode rave."],
            ["A symbol appears on his body. Shoot it until it disappears, 8 times, until he pounds his chest.", "Un symbole apparaît sur son corps. Tirez dessus jusqu'à ce qu'il disparaisse, 8 fois, jusqu'à ce qu'il se frappe la poitrine."],
            ["He summons two saw blades, jumps on the cabin and starts a wind storm. Everyone hides behind a rock, in a green circle. Skeletons appear: they take much more damage than zombies.", "Il lance deux lames de scie, saute sur la cabane et déclenche une tempête. Tout le monde se cache derrière un rocher, dans un cercle vert. Des squelettes apparaissent : ils encaissent bien plus que des zombies."],
            ["The dreamcatchers above the cabin show the remaining rounds. On the third, there is no storm: shoot until he dies, and take the Soul Key piece for the ending.", "Les attrape-rêves au-dessus de la cabane indiquent les tours restants. Au troisième, pas de tempête : tirez jusqu'à sa mort et prenez le morceau de Soul Key pour la fin."],
          ],
          shots: [
            rave("A skull to charge", "Un crâne à charger", "main_ee/boss_fight_skull.webp"),
            rave("A charged skull", "Un crâne chargé", "main_ee/charged_skull.webp"),
            rave("The circle", "Le cercle", "main_ee/boss_circle.webp"),
            rave("The glowing torso", "Le torse brillant", "main_ee/glowing_part_on_slasher.webp"),
            rave("The symbol to shoot", "Le symbole à viser", "main_ee/symbol.webp"),
            rave("The green circles", "Les cercles verts", "main_ee/green_circle.webp"),
            rave("The dreamcatchers", "Les attrape-rêves", "main_ee/dreamcatcher.webp"),
          ],
        },
      ],
    },
  ],
};

const SHAOLIN: MapGuide = {
  map: "Shaolin",
  code: "cp_disco",
  quest: ["Shaolin Shuffle: Pest Control", "Shaolin Shuffle : Pest Control"],
  intro: [
    "Allow 1 to 1.5 hours. The quest has three parts, each ending in a fight with the Rat King: the Eye, the Brain and the Heart. Bring a weapon with plenty of ammo to the last fight.",
    "Comptez 1 h à 1 h 30. La quête a trois parties, chacune finie par un combat contre le Rat King : l'Œil, le Cerveau et le Cœur. Gardez une arme avec beaucoup de munitions pour le dernier combat.",
  ],
  source: `${SITE}IW/shaolin_shuffle/shaolin_shuffle_guide`,
  parts: [
    {
      title: ["Power and Pack-a-Punch", "Courant et Pack-a-Punch"],
      steps: [
        {
          title: ["Turn on the four power switches", "Activez les quatre interrupteurs"],
          done: { flag: "power_on" },
          shots: [
            disco("Spawn subway, on a pillar", "Métro du départ, sur un pilier", "power/power_spawn.webp"),
            disco("Disco roof, left of Quickies", "Toit du disco, à gauche de Quickies", "power/power_roof.webp"),
            disco("Park, left of Deadeye Dewdrops", "Parc, à gauche de Deadeye Dewdrops", "power/power_deadeye.webp"),
            disco("Main Street subway, left of Bang Bangs", "Métro de Main Street, à gauche de Bang Bangs", "power/power_bang_bangs.webp"),
          ],
        },
        {
          title: ["Find the flyer, the coin and the film reel", "Trouvez le flyer, la pièce et la bobine"],
          done: { flag: "pap_portal_used" },
          text: [
            [
              "The flyer opens the Pink Cat, the coin opens the left room from the street, the reel repairs the projector inside. Its portal gives 30 seconds in the Pack-a-Punch room.",
              "Le flyer ouvre le Pink Cat, la pièce ouvre la salle de gauche depuis la rue, la bobine répare le projecteur à l'intérieur. Son portail donne 30 secondes dans la salle du Pack-a-Punch.",
            ],
          ],
          shots: [
            disco("Flyer: garbage left of the Dojo", "Flyer : ordures à gauche du Dojo", "pap/flyer_dojo.webp"),
            disco("Flyer: rooftop chair before Racin' Stripes", "Flyer : chaise sur le toit, devant Racin' Stripes", "pap/flyer_racin_stripes.webp"),
            disco("Flyer: Disco roof stool", "Flyer : tabouret du toit du disco", "pap/flyer_roof.webp"),
            disco("Flyer: ground before the Pink Cat", "Flyer : au sol devant le Pink Cat", "pap/flyer_street.webp"),
            disco("Coin: under Tuff 'Nuff, in the sewers (all power needed)", "Pièce : sous Tuff 'Nuff, dans les égouts (tout le courant requis)", "pap/coin_jug.webp"),
            disco("Reel: Disco couch, 2nd floor", "Bobine : canapé du disco, 2e étage", "pap/film_reel_disco.webp"),
            disco("Reel: Pink Cat couch", "Bobine : canapé du Pink Cat", "pap/film_reel_pink_cat.webp"),
            disco("Reel: boxes by the ticket booth", "Bobine : caisses près du guichet", "pap/film_reel_ticket_booth.webp"),
            disco("Reel: sewers, box near Tuff 'Nuff", "Bobine : égouts, caisse près de Tuff 'Nuff", "pap/film_reel_jug.webp"),
            disco("Reel: Rat King's lair", "Bobine : repaire du Rat King", "pap/film_reel_sewer.webp"),
            disco("The projector", "Le projecteur", "pap/projector.webp"),
          ],
        },
        {
          title: ["Get a Chi ability", "Obtenez un pouvoir Chi"],
          done: { flag: "first_kung_fu_mode" },
          text: [
            [
              "From round 5, talk to Pam Grier in the Dojo and take one of the four gourds around it. Kill with melee to level it up: the shuriken, which the quest needs, comes at tier 2. A gourd recharges the ability.",
              "À partir de la manche 5, parlez à Pam Grier dans le Dojo et prenez l'une des quatre gourdes autour. Tuez au corps à corps pour progresser : le shuriken, nécessaire à la quête, arrive au niveau 2. Une gourde recharge le pouvoir.",
            ],
          ],
          shots: [disco("Pam Grier", "Pam Grier", "pam.webp"), disco("The gourds around the Dojo", "Les gourdes autour du Dojo", "chi_fast_travel/all_gourds_dojo.webp")],
        },
      ],
    },
    {
      title: ["First part: the Eye", "Première partie : l'Œil"],
      steps: [
        {
          title: ["Follow the rat", "Suivez le rat"],
          done: { flag: "skq_p2t1_2" },
          text: [
            [
              "Talk to Pam until she says « The one who terrorizes these streets… »: cages appear. Throw a shuriken at a cage, then follow the rat to the next one and break it the same way. Open most doors first, so you don't lose it. Only shoot the cage the rat went into: hitting another one starts the chase over. The sixth cage is empty and a big yellow circle appears nearby.",
              "Parlez à Pam jusqu'à ce qu'elle dise « Celui qui terrorise ces rues… » : des cages apparaissent. Lancez un shuriken sur une cage, puis suivez le rat jusqu'à la suivante et cassez-la pareil. Ouvrez d'abord la plupart des portes pour ne pas le perdre. Ne tirez que sur la cage où le rat est entré : en toucher une autre fait recommencer la poursuite. La sixième cage est vide et un grand cercle jaune apparaît à côté.",
            ],
          ],
          shots: [disco("Cage up the ramp from the Dojo", "Cage en haut de la rampe du Dojo", "main_ee/eye/rat_cage_ramp.webp"), disco("Cage in the Heebie Geebies", "Cage au Heebie Geebies", "main_ee/eye/rat_cage_heebie.webp")],
        },
        {
          title: ["Earn the key", "Gagnez la clé"],
          done: { flag: "skq_p2t1_2" },
          text: [
            [
              "Kill 15 zombies while they are inside the circle; you don't have to stand in it. Eight ninjas then come. Once they are dead, a key appears where the circle was.",
              "Tuez 15 zombies pendant qu'ils sont dans le cercle ; vous n'avez pas besoin d'y être. Huit ninjas arrivent ensuite. Une fois morts, une clé apparaît à la place du cercle.",
            ],
          ],
          shots: [disco("The circle", "Le cercle", "main_ee/eye/glowing_circle_key.webp"), disco("The key", "La clé", "main_ee/eye/key.webp")],
        },
        {
          title: ["Open the locker, shoot the four symbols", "Ouvrez le casier, tirez sur les quatre symboles"],
          done: { flag: "skq_p2t1_4" },
          text: [["The locker with symbols is in the Bang Bangs subway station. Then shoot once each, in this order. A wrong shot, or a second shot on the same symbol, starts it over. A gong follows each right shot.", "Le casier à symboles est à la station de métro de Bang Bangs. Tirez ensuite une seule fois sur chacun, dans cet ordre. Un mauvais tir, ou un second tir sur le même symbole, fait tout recommencer. Un gong suit chaque bon tir."]],
          shots: [
            disco("The locker", "Le casier", "main_ee/eye/locker.webp"),
            disco("1: right of the Dojo, the left symbol", "1 : à droite du Dojo, le symbole de gauche", "main_ee/eye/symbols_1.webp"),
            disco("2: Disco bathroom, bottom floor, second from the left", "2 : toilettes du disco, rez-de-chaussée, deuxième en partant de la gauche", "main_ee/eye/symbols_2.webp"),
            disco("3 and 4: right of the Volk near Deadeye, first then second from the left", "3 et 4 : à droite de la Volk près de Deadeye, le premier puis le deuxième en partant de la gauche", "main_ee/eye/symbols_3.webp"),
          ],
        },
        {
          title: ["First fight", "Premier combat"],
          done: { any: [{ flag: "eye_picked" }, { flag: "skq_p2t1_5" }] },
          text: [["Use the circle before the Black Cat Dojo to call the Rat King. Kill him and take the Eye he drops.", "Utilisez le cercle devant le Black Cat Dojo pour appeler le Rat King. Tuez-le et prenez l'Œil qu'il lâche."]],
          shots: [disco("The circle before the Dojo", "Le cercle devant le Dojo", "main_ee/eye/eye_fight_symbol.webp")],
        },
      ],
    },
    {
      title: ["Second part: the Brain", "Deuxième partie : le Cerveau"],
      steps: [
        {
          title: ["Find six orange symbols with the Eye", "Trouvez six symboles orange avec l'Œil"],
          done: { flag: "skq_p2t2_1" },
          text: [
            [
              "Talk to Pam until she says « You must once again face your enemy… ». The Eye goes in your tactical slot. Use it to reveal the Rat King's orange symbols and shoot them. One shows at a time, six in total, among these places:",
              "Parlez à Pam jusqu'à ce qu'elle dise « Tu dois encore affronter ton ennemi… ». L'Œil se place dans l'emplacement tactique. Utilisez-le pour révéler les symboles orange du Rat King et tirez dessus. Un seul à la fois, six en tout, parmi ces endroits :",
            ],
          ],
          shots: [
            disco("Above the train, at spawn", "Au-dessus du train, au départ", "main_ee/brain/eye_symbols/symbol_spawn.webp"),
            disco("Barber shop window", "Vitrine du barbier", "main_ee/brain/eye_symbols/symbol_barbershop.webp"),
            disco("Above the Dojo's door", "Au-dessus de la porte du Dojo", "main_ee/brain/eye_symbols/symbol_dojo.webp"),
            disco("Behind a speaker, Heebie Geebies stage", "Derrière une enceinte, scène du Heebie Geebies", "main_ee/brain/eye_symbols/symbol_heebie.webp"),
            disco("Police car behind Bombstoppers", "Voiture de police derrière Bombstoppers", "main_ee/brain/eye_symbols/symbol_police_car.webp"),
            disco("Up the ramp from the Heebie Geebies", "En haut de la rampe du Heebie Geebies", "main_ee/brain/eye_symbols/symbol_up_the_ramp.webp"),
            disco("Far building, right of the RPR Evo", "Immeuble au loin, à droite de la RPR Evo", "main_ee/brain/eye_symbols/symbol_rpr_evo.webp"),
            disco("Clothesline by the Magic Wheel", "Corde à linge près de la roue magique", "main_ee/brain/eye_symbols/symbol_clothsline.webp"),
            disco("Blue room floor, Trail Blazers hallway (jump)", "Sol de la salle bleue, couloir de Trail Blazers (sautez)", "main_ee/brain/eye_symbols/symbol_blue_room.webp"),
            disco("Water tower, Disco roof", "Château d'eau, toit du disco", "main_ee/brain/eye_symbols/symbol_water_tower.webp"),
            disco("Air duct through the skylight", "Conduit d'air par la verrière", "main_ee/brain/eye_symbols/symbol_skylight.webp"),
            disco("Disco Inferno sign, Main Street", "Enseigne Disco Inferno, Main Street", "main_ee/brain/eye_symbols/symbol_disco_sign.webp"),
            disco("Behind the stairs, Bang Bangs side", "Derrière l'escalier, côté Bang Bangs", "main_ee/brain/eye_symbols/symbol_bang_bangs.webp"),
          ],
        },
        {
          title: ["Read the Morse on the phone", "Lisez le morse au téléphone"],
          done: { flag: "skq_p2t2_3" },
          text: [
            [
              "After the sixth symbol, a phone rings in one of the subway stations. Pick up and listen to the end: hanging up early, or being hit, forces you to listen again. It plays a three-digit number in Morse: a short beep is · and a long beep is −, and each digit has exactly five beeps.",
              "Après le sixième symbole, un téléphone sonne dans l'une des stations de métro. Décrochez et écoutez jusqu'au bout : raccrocher trop tôt, ou être touché, oblige à réécouter. Il joue un nombre à trois chiffres en morse : un bip court vaut · et un bip long vaut −, et chaque chiffre fait exactement cinq bips.",
            ],
            [
              "Only six numbers exist, so you only need the first five beeps. Note them in the first column below and read the number. Only 407 and 420 start the same way: the sixth beep separates them, long for 407, short for 420.",
              "Il n'existe que six nombres, donc les cinq premiers bips suffisent. Cherchez-les dans la première colonne ci-dessous et lisez le nombre. Seuls 407 et 420 commencent pareil : le sixième bip les sépare, long pour 407, court pour 420.",
            ],
          ],
          table: {
            head: [
              ["First digit", "Premier chiffre"],
              ["Second digit", "Deuxième chiffre"],
              ["Third digit", "Troisième chiffre"],
              ["Number", "Nombre"],
            ],
            rows: [
              ["· · − − −", "− − − · ·", "· − − − −", "281"],
              ["· · · · −", "− − − − −", "− − · · ·", "407"],
              ["· · · · −", "· · − − −", "− − − − −", "420"],
              ["· · · · ·", "− − − − ·", "− · · · ·", "596"],
              ["− − · · ·", "· − − − −", "· · · − −", "713"],
              ["− − − · ·", "· − − − −", "− − − · ·", "818"],
            ],
          },
          shots: [
            disco("Chart of the first digits", "Tableau des premiers chiffres", "main_ee/brain/phone_morse_code_map.webp"),
            { label: ["The whole Morse alphabet", "L'alphabet morse complet"], url: `${SITE}common_images/morse_code.webp` },
          ],
        },
        {
          title: ["Take the matching poster", "Prenez l'affiche correspondante"],
          done: { any: [{ flag: "correct_poster_got" }, { flag: "skq_p2t2_4" }] },
          text: [
            [
              "Find the Nightmare Summer poster whose « Film Registration » number, bottom left, is the one you heard. With the wrong poster, Willard Wyler laughs and you must shoot the six symbols again for a new number.",
              "Trouvez l'affiche Nightmare Summer dont le numéro « Film Registration », en bas à gauche, est celui entendu. Avec la mauvaise affiche, Willard Wyler rit et il faut retirer sur les six symboles pour obtenir un nouveau nombre.",
            ],
          ],
          shots: [
            disco("Example of a poster", "Exemple d'affiche", "main_ee/brain/poster_example.webp"),
            disco("Spawn subway, Up & Atoms side", "Métro du départ, côté Up & Atoms", "main_ee/brain/poster_spawn.webp"),
            disco("Left of the Dojo", "À gauche du Dojo", "main_ee/brain/poster_dojo.webp"),
            disco("Up the ramp from the Dojo", "En haut de la rampe du Dojo", "main_ee/brain/poster_ramp.webp"),
            disco("Bombstoppers alley", "Ruelle de Bombstoppers", "main_ee/brain/poster_alley.webp"),
            disco("Disco roof, by the skylight", "Toit du disco, près de la verrière", "main_ee/brain/poster_roof.webp"),
            disco("Main Street subway, bottom of the stairs", "Métro de Main Street, bas de l'escalier", "main_ee/brain/poster_bang_bangs.webp"),
          ],
        },
        {
          title: ["The spotlight and the X", "Le projecteur et le X"],
          text: [["Put the poster on the spotlight on the Disco roof. An X appears on a window: blow it up with any explosive and kill the ninjas that come.", "Posez l'affiche sur le projecteur du toit du disco. Un X apparaît sur une fenêtre : faites-le sauter avec n'importe quel explosif et tuez les ninjas qui arrivent."]],
          shots: [disco("The spotlight", "Le projecteur", "main_ee/brain/spotlight.webp"), disco("The X on the window", "Le X sur la fenêtre", "main_ee/brain/x_window.webp")],
        },
        {
          title: ["Spell the word with the map's alphabet", "Écrivez le mot avec l'alphabet de la carte"],
          done: { flag: "skq_p2t2_6" },
          text: [
            [
              "A letter appears on the wall, right of the drop to the street, and six symbols appear around the roof. These symbols are the map's own alphabet, shown below. The letter on the wall is the first letter of a hidden word, taken from the lists below.",
              "Une lettre apparaît sur le mur, à droite de la descente vers la rue, et six symboles apparaissent autour du toit. Ces symboles sont l'alphabet propre à la carte, montré ci-dessous. La lettre du mur est la première lettre d'un mot caché, tiré des listes ci-dessous.",
            ],
            [
              "Read the symbols with the chart, and shoot the one that gives the word's next letter. A right shot adds the letter to the wall. A wrong shot erases the word and draws another from the same list, so you can start over at once. A gong marks the end of the word.",
              "Lisez les symboles avec le tableau, puis tirez sur celui qui donne la lettre suivante du mot. Un bon tir ajoute la lettre au mur. Un mauvais tir efface le mot et en tire un autre de la même liste : vous pouvez recommencer aussitôt. Un gong marque la fin du mot.",
            ],
          ],
          points: [
            ["After ten wrong words, the list changes and you wait for the next round.", "Après dix mauvais mots, la liste change et il faut attendre la manche suivante."],
            ["A long word like ROLLERCOASTER? Failing on purpose can give you a shorter one.", "Un mot long comme ROLLERCOASTER ? Se tromper exprès peut en donner un plus court."],
            ["Beware of Blue Bolts: its electric reload can hit a symbol by accident.", "Attention à Blue Bolts : son rechargement électrique peut toucher un symbole par accident."],
            ["SAVAGEMADETHIS can come up from any list, rarely.", "SAVAGEMADETHIS peut sortir depuis n'importe quelle liste, rarement."],
          ],
          figure: {
            label: ["The map's alphabet, by RayPoopertonIII (RP3 Gaming Guides)", "L'alphabet de la carte, par RayPoopertonIII (RP3 Gaming Guides)"],
            url: `${SITE}IW/iw_symbols.webp`,
          },
          table: {
            head: [
              ["List", "Liste"],
              ["Words", "Mots"],
            ],
            rows: [
              ["Spaceland", "ARCADE, BRUTE, BUMPERCARS, FORGEFREEZE, GEYSER, OCTONIAN, ROLLERCOASTER, SLIDE, YETIEYES, ZAPPER"],
              ["Rave", "BASEMENT, BOAT, CHARMS, DANCE, FAIRIES, HARPOON, KEVINSMITH, MEMORIES, SLASHER, TREES"],
              ["Shaolin 1", "ARTHUR, CRANE, DRAGON, KATANA, KUNGFU, NUNCHUCKS, PAMGRIER, ROLLERSKATES, SNAKE, TIGER"],
              ["Shaolin 2", "BLACKCAT, DISCO, INFERNO, MCINTOSH, PINKCAT, PUNKS, RATKING, SHIELD, STAFF, SUBWAY"],
              ["Extinction", "ANCESTOR, BREEDER, CRYPTID, DAVIDARCHER, DRCROSS, HIVES, KRAKEN, NIGHTFALL, OBELISK, SAMANTHA"],
              ["Willard", "AFTERLIFE, DEATH, DIRECTOR, MEPHISTOPHELES, REDWOODS, SHAOLIN, SHUFFLE, SIXTYMILLION, SPACELAND, WINONAWYLER"],
              [["Characters", "Personnages"], "ACTORS, AUDITION, BEVERLYHILLS, BROADWAY, COMICBOOKS, GHETTO, LOSANGELES, NEWYORK, REALITYTV, WEREWOLFPOETS"],
            ],
          },
          shots: [
            disco("The letter on the wall", "La lettre sur le mur", "main_ee/brain/letter_on_wall.webp"),
            disco("Symbol left of the word", "Symbole à gauche du mot", "main_ee/brain/letter/letter_word.webp"),
            disco("Symbol round the corner, behind Quickies", "Symbole après l'angle, derrière Quickies", "main_ee/brain/letter/letter_around_the_corner.webp"),
            disco("Symbol under the scaffolding", "Symbole sous l'échafaudage", "main_ee/brain/letter/letter_magic_wheel.webp"),
            disco("Symbol by the clock", "Symbole près de l'horloge", "main_ee/brain/letter/letter_clock.webp"),
            disco("Symbol in the back left corner", "Symbole au fond à gauche", "main_ee/brain/letter/letter_back_left_corner.webp"),
            disco("Symbol on the white table", "Symbole sur la table blanche", "main_ee/brain/letter/letter_white_table.webp"),
          ],
        },
        {
          title: ["Second fight", "Deuxième combat"],
          done: { any: [{ flag: "brain_picked" }, { flag: "skq_p2t2_7" }] },
          text: [["Go to the RPR Evo near Deadeye Dewdrops and use the Rat King's symbol. Kill him and take the Brain.", "Allez à la RPR Evo près de Deadeye Dewdrops et utilisez le symbole du Rat King. Tuez-le et prenez le Cerveau."]],
          shots: [disco("The symbol to use", "Le symbole à utiliser", "main_ee/brain/brain_fight.webp")],
        },
      ],
    },
    {
      title: ["Third part: the Heart", "Troisième partie : le Cœur"],
      steps: [
        {
          title: ["The fire street", "La rue en feu"],
          text: [
            [
              "Talk to Pam until she says « The enemy you face possess the final ingredient… ». A cigarette burn shows top right for three rounds. The game then jumps three rounds ahead and locks you outside the Dojo: kill everything and take the turnstile piece.",
              "Parlez à Pam jusqu'à ce qu'elle dise « L'ennemi que tu affrontes possède le dernier ingrédient… ». Une brûlure de cigarette apparaît en haut à droite pendant trois manches. Le jeu saute ensuite trois manches et vous enferme devant le Dojo : tuez tout et prenez la pièce de tourniquet.",
            ],
          ],
          shots: [disco("The cigarette burn", "La brûlure de cigarette", "main_ee/heart/cigarette_burn.webp"), disco("The piece", "La pièce", "main_ee/heart/turnstile.webp")],
        },
        {
          title: ["The window and the circles", "La fenêtre et les cercles"],
          text: [
            [
              "Repair the broken turnstile in the spawn subway. Climb the wooden ladder in the alley near Mule Munchies and shoot the symbol in the window. A glowing circle appears somewhere: kill 6 to 9 zombies inside it, then find the next one. There are six circles; a gong marks the end.",
              "Réparez le tourniquet cassé dans le métro du départ. Montez à l'échelle en bois de la ruelle près de Mule Munchies et tirez sur le symbole de la fenêtre. Un cercle lumineux apparaît quelque part : tuez-y 6 à 9 zombies, puis trouvez le suivant. Il y a six cercles ; un gong marque la fin.",
            ],
          ],
          shots: [
            disco("The turnstile", "Le tourniquet", "main_ee/heart/broken_turnstile.webp"),
            disco("The ladder", "L'échelle", "main_ee/heart/wooden_ladder.webp"),
            disco("The window", "La fenêtre", "main_ee/heart/symbol_in_window.webp"),
            disco("Circle: Mule Munchies alley", "Cercle : ruelle de Mule Munchies", "main_ee/heart/glowing_circle_mule.webp"),
            disco("Circle: Disco private room", "Cercle : salon privé du disco", "main_ee/heart/glowing_circle_private_room.webp"),
            disco("Circle: park path", "Cercle : allée du parc", "main_ee/heart/glowing_circle_park_path.webp"),
            disco("Circle: by the RPR Evo", "Cercle : près de la RPR Evo", "main_ee/heart/glowing_circle_rpr_evo.webp"),
            disco("Circle: spawn subway, near the Hornet", "Cercle : métro du départ, près de la Hornet", "main_ee/heart/glowing_circle_hornet.webp"),
          ],
        },
        {
          title: ["The disco ball", "La boule à facettes"],
          done: { flag: "skq_p2t3_4" },
          text: [
            [
              "Use the DJ booth on the Disco's second floor: a dancing zombie with a disco ball appears on the floor below. Kill it while another zombie stands on the dance floor, and the ball jumps to that one. Do this ten times, until a gong sounds.",
              "Utilisez la cabine de DJ au 2e étage du disco : un zombie danseur avec une boule à facettes apparaît sur la piste en bas. Tuez-le pendant qu'un autre zombie est sur la piste, et la boule passe sur celui-ci. Faites-le dix fois, jusqu'au gong.",
            ],
            ["Killing it with nobody else on the floor resets the count, so keep a few zombies coming.", "Le tuer alors que personne d'autre n'est sur la piste remet le compte à zéro : gardez donc quelques zombies à proximité."],
          ],
          shots: [disco("The DJ booth", "La cabine de DJ", "main_ee/heart/dj_booth.webp"), disco("The disco ball zombie", "Le zombie à la boule", "main_ee/heart/disco_ball_zombie.webp")],
        },
        {
          title: ["Third fight", "Troisième combat"],
          done: { any: [{ flag: "heart_picked" }, { flag: "skq_p2t3_6" }] },
          text: [["Use the symbol on the street before the Pink Cat. Kill the Rat King and take the Heart. Talk to Pam in the Dojo, then enter his lair in the sewers.", "Utilisez le symbole dans la rue devant le Pink Cat. Tuez le Rat King et prenez le Cœur. Parlez à Pam dans le Dojo, puis entrez dans son repaire, dans les égouts."]],
          shots: [disco("The symbol", "Le symbole", "main_ee/heart/heart_fight.webp")],
        },
        {
          title: ["Last fight in the lair", "Dernier combat dans le repaire"],
          done: { flag: "rk_fight_ended" },
          text: [
            [
              "Damage him until he climbs to the rafters: the Eye, the Brain and the Heart then lie on the ground. Take one and use the big symbol in the middle to start its challenge, in the order you want. Each challenge leaves a Max Ammo in the middle: take it only when needed. After each one, damage him until he retreats again.",
              "Blessez-le jusqu'à ce qu'il monte aux poutres : l'Œil, le Cerveau et le Cœur sont alors au sol. Prenez-en un et utilisez le grand symbole au centre pour lancer son défi, dans l'ordre voulu. Chaque défi laisse des munitions max au centre : ne les prenez qu'au besoin. Après chacun, blessez-le jusqu'à ce qu'il se retire encore.",
            ],
          ],
          points: [
            ["Eye: the Eye reveals pink symbols on the walls and ceiling. Shoot them all. Without ammo, you are stuck here.", "Œil : l'Œil révèle des symboles roses sur les murs et le plafond. Tirez sur tous. Sans munitions, vous restez bloqué ici."],
            ["Heart: acid covers the edge of the arena. Kill a zombie in a puddle to clear it, and clear the whole edge before more comes.", "Cœur : de l'acide couvre le bord de l'arène. Tuez un zombie dans une flaque pour la dissiper, et nettoyez tout le bord avant la suite."],
            ["Brain: blue-eyed zombies attack the Brain, not you. Don't kill them. Protect them by breaking his staff with a shuriken.", "Cerveau : des zombies aux yeux bleus attaquent le Cerveau, pas vous. Ne les tuez pas. Protégez-les en cassant son bâton d'un shuriken."],
            ["After the third, kill him: the film plays and the Soul Key appears in the middle.", "Après le troisième, tuez-le : le film se lance et la Soul Key apparaît au centre."],
          ],
          shots: [disco("The Soul Key", "La Soul Key", "main_ee/soul_key.webp")],
        },
      ],
    },
  ],
};

/** "a, b and c" in each language. */
function listed(items: string[], and: string): string {
  return items.length < 2 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

/** Every reaction of one final chemical, in order, with what to put on the table. */
const WALKTHROUGHS: Step[] = FINALS.map((final) => ({
  title: [`Step by step: ${PRODUCTS[final].name[0]}`, `Pas à pas : ${PRODUCTS[final].name[1]}`],
  points: chainOf(final).map((made): Text => {
    const inputs = REACTIONS[made] ?? [];
    const last = made === final;
    const [product, used] = [PRODUCTS[made], inputs.map((key) => PRODUCTS[key])] as const;
    return [
      `Make ${product.name[0]}: put ${listed(used.map((item) => item.name[0]), "and")} on the table, enter the reaction's number, press the big button. ${last ? "Take the result to the bomb." : "The result waits in the garage for the next one."}`,
      `Fabriquez ${product.the} : posez ${listed(used.map((item) => item.the), "et")} sur la table, entrez le nombre de la réaction, appuyez sur le gros bouton. ${last ? "Portez le résultat à la bombe." : "Le résultat attend dans le garage pour la suite."}`,
    ];
  }),
}));

const RADIOACTIVE: MapGuide = {
  map: "Radioactive Thing",
  code: "cp_town",
  quest: ["Attack of the Radioactive Thing", "Attack of the Radioactive Thing"],
  intro: [
    "The longest of the quests, because of its chemistry. Keep paper at hand: several numbers change every match and can't be read again later. The Crowbar in the Motel maintenance room and the Cleaver in the Market are used all along.",
    "La plus longue des quêtes, à cause de la chimie. Gardez du papier sous la main : plusieurs nombres changent à chaque partie et certains ne se relisent pas. Le pied-de-biche, dans le local d'entretien du motel, et le hachoir, au Market, servent tout du long.",
  ],
  source: `${SITE}IW/attack_of_the_radioactive_thing/attack_of_the_radioactive_thing_guide`,
  parts: [
    {
      title: ["Power and Pack-a-Punch", "Courant et Pack-a-Punch"],
      steps: [
        {
          title: ["Turn on the power", "Activez le courant"],
          done: { flag: "power_on" },
          text: [["Take the handle from the zombie hand on the beach, near the OSA, and bring it to the box in the Power Station, near the drive-in.", "Prenez la poignée dans la main de zombie sur la plage, près de l'OSA, et apportez-la au boîtier de la Power Station, près du drive-in."]],
          shots: [town("The handle", "La poignée", "power/power_switch.webp"), town("The box", "Le boîtier", "power/power_box.webp")],
        },
        {
          title: ["Have Elvira open the Pack-a-Punch", "Faites ouvrir le Pack-a-Punch par Elvira"],
          done: { flag: "pap_portal_used" },
          points: [
            ["Take Elvira's book from the safe at the back of the Ice Cream Parlour and bring it to her in the TV studio: she gives you an empty vial.", "Prenez le livre d'Elvira dans le coffre au fond de l'Ice Cream Parlour et apportez-le-lui au studio de télé : elle vous donne une fiole vide."],
            ["Take the Cleaver behind the counter near Deadeye Dewdrops, in the Market. Kill about 20 zombies with it to fill the vial.", "Prenez le hachoir derrière le comptoir près de Deadeye Dewdrops, au Market. Tuez environ 20 zombies avec pour remplir la fiole."],
            ["Give it back to Elvira: she now follows you. Stand near the closed portal outside the studio and she opens it. It gives 30 seconds in the Pack-a-Punch room.", "Rendez-la à Elvira : elle vous suit maintenant. Tenez-vous près du portail fermé devant le studio et elle l'ouvre. Il donne 30 secondes dans la salle du Pack-a-Punch."],
          ],
          shots: [town("The book", "Le livre", "pap/elviras_book.webp"), town("The Cleaver", "Le hachoir", "cleaver.webp"), town("The Crowbar", "Le pied-de-biche", "crowbar.webp")],
        },
      ],
    },
    {
      title: ["The body and the key", "Le corps et la clé"],
      steps: [
        {
          title: ["Collect the six body parts", "Récupérez les six morceaux du corps"],
          points: [
            ["Head: press the button on the wall of the Pack-a-Punch room. You land in a locked RV: the head is on the ledge before the big window.", "Tête : appuyez sur le bouton mural de la salle du Pack-a-Punch. Vous arrivez dans un camping-car fermé : la tête est sur le rebord devant la grande fenêtre."],
            ["Torso: repair the freezer trap (part on boxes left of the Gas Station, repair on the Market freezer's wall). Start the trap and hit the hanging pig right of the torso with the Crowbar.", "Torse : réparez le piège congélateur (pièce sur des caisses à gauche de la station-service, réparation sur le mur du congélateur du Market). Lancez le piège et frappez au pied-de-biche le cochon suspendu à droite du torse."],
            ["Left arm: in the firepit right of the Volk, in the RV Park.", "Bras gauche : dans le foyer à droite de la Volk, au RV Park."],
            ["Right arm: build a Seismic Wave Generator and place it close to the arm in the beach's ground, the one that held the power handle. Wait for it to rise.", "Bras droit : fabriquez un générateur d'ondes sismiques et posez-le près du bras planté sur la plage, celui qui tenait la poignée. Attendez qu'il sorte."],
            ["Left leg: from round 5, kill a radioactive soldier zombie with the Cleaver. The first one drops the leg.", "Jambe gauche : dès la manche 5, tuez au hachoir un zombie soldat radioactif. Le premier lâche la jambe."],
            ["Right leg: in the last tree on the left of the path from the Snack Shack to the TV Station. Cook a frag or cluster grenade and throw it.", "Jambe droite : dans le dernier arbre à gauche du chemin entre le Snack Shack et la TV Station. Dégoupillez une grenade à fragmentation ou à sous-munitions en la gardant en main, puis lancez-la."],
          ],
          shots: [
            town("Head", "Tête", "main_ee/head.webp"),
            town("Torso", "Torse", "main_ee/torso.webp"),
            town("Pig to hit", "Cochon à frapper", "main_ee/torso_meat.webp"),
            town("Left arm", "Bras gauche", "main_ee/left_arm.webp"),
            town("Right arm", "Bras droit", "main_ee/right_arm.webp"),
            town("Radioactive soldier", "Soldat radioactif", "main_ee/radioactive_zombie.webp"),
            town("Right leg in the tree", "Jambe droite dans l'arbre", "main_ee/right_leg_tree.webp"),
          ],
        },
        {
          title: ["Collect the three glass pieces", "Récupérez les trois morceaux de verre"],
          points: [
            ["Elvira's mirror: give her a filled vial, wait for her to leave, and take the mirror on the TV station's couch.", "Miroir d'Elvira : donnez-lui une fiole pleine, attendez qu'elle parte, et prenez le miroir sur le canapé de la TV Station."],
            ["Broken mirror: hit the mirror of the RV Park bathroom with the Crowbar. A piece falls in the sink.", "Miroir cassé : frappez au pied-de-biche le miroir des toilettes du RV Park. Un morceau tombe dans le lavabo."],
            ["Car mirror: on the main street, hit the right side mirror of the white car with a roof with the Crowbar.", "Rétroviseur : dans la rue principale, frappez au pied-de-biche le rétroviseur droit de la voiture blanche à toit."],
          ],
          shots: [
            town("Elvira's mirror", "Miroir d'Elvira", "main_ee/elviras_mirror.webp"),
            town("Bathroom mirror", "Miroir des toilettes", "main_ee/unbroken_mirror.webp"),
            town("Car mirror", "Rétroviseur", "main_ee/car_mirror.webp"),
          ],
        },
        {
          title: ["Lay everything out at spawn", "Installez tout au départ"],
          points: [
            ["Body parts: on the upright bed, right of the tunnel out of the Up & Atoms room.", "Morceaux du corps : sur le lit dressé, à droite du tunnel de sortie de la salle d'Up & Atoms."],
            ["Broken mirror: on the table with pill bottles, left of the body.", "Miroir cassé : sur la table aux flacons, à gauche du corps."],
            ["Elvira's mirror: on the crates right of the zombie spawn.", "Miroir d'Elvira : sur les caisses à droite de l'apparition de zombies."],
            ["Car mirror: on the large crate facing Up & Atoms.", "Rétroviseur : sur la grande caisse en face d'Up & Atoms."],
          ],
          shots: [
            town("The bed", "Le lit", "main_ee/upright_bed.webp"),
            town("The pill table", "La table aux flacons", "main_ee/pill_bottles.webp"),
            town("The crates", "Les caisses", "main_ee/crates_zm_spawn.webp"),
            town("The large crate", "La grande caisse", "main_ee/large_crate.webp"),
          ],
        },
        {
          title: ["Enter the code in the machine", "Entrez le code dans la machine"],
          text: [
            [
              "Take the punch card from the desk at the back of the Ice Cream Parlour and put it in the machine at spawn. Find the order of the digits 3, 4, 5, 6 and 8 on the film reels of the TV Station: on the shelf before the colour console, four reels on the shelf and one on the floor, read left to right with the floor reel third.",
              "Prenez la carte perforée sur le bureau au fond de l'Ice Cream Parlour et mettez-la dans la machine du départ. Trouvez l'ordre des chiffres 3, 4, 5, 6 et 8 sur les bobines de la TV Station : sur l'étagère devant la console de couleur, quatre bobines sur l'étagère et une au sol, à lire de gauche à droite avec celle du sol en troisième.",
            ],
            [
              "On the machine, a light runs over the digits, the leftmost being 0: press use when it lights the digit you want. Three errors or being hit throws you out, but what you entered stays. A laser forms a zombie from the parts.",
              "Sur la machine, une lumière passe sur les chiffres, celui de gauche valant 0 : appuyez sur utiliser quand elle éclaire le chiffre voulu. Trois erreurs ou un coup vous éjectent, mais ce qui est entré reste. Un laser forme un zombie à partir des morceaux.",
            ],
            [
              "Interact again and enter the same order backwards: the zombie becomes a key. It opens the Gas Station's garage door, on the main street.",
              "Interagissez encore et entrez le même ordre à l'envers : le zombie devient une clé. Elle ouvre la porte du garage de la station-service, dans la rue principale.",
            ],
          ],
          shots: [
            town("The punch card", "La carte perforée", "main_ee/punch_card.webp"),
            town("The machine", "La machine", "main_ee/machine_in_spawn.webp"),
            town("The reels", "Les bobines", "main_ee/reels.webp"),
            town("A number on a reel", "Un chiffre sur une bobine", "main_ee/number_on_reel.webp"),
            town("The garage door", "La porte du garage", "main_ee/garage_door.webp"),
          ],
        },
      ],
    },
    {
      title: ["The garage and the safe", "Le garage et le coffre"],
      steps: [
        {
          title: ["Build the chemistry set", "Montez le matériel de chimie"],
          done: { flag: "chemistry_step1" },
          text: [["Put the three parts on the empty table in the garage.", "Posez les trois pièces sur la table vide du garage."]],
          shots: [
            town("Tube: couch at the back of the Market", "Tube : canapé au fond du Market", "main_ee/tube.webp"),
            town("Gauge: picnic table near Mule Munchies, RV Park", "Manomètre : table de pique-nique près de Mule Munchies, RV Park", "main_ee/gauge.webp"),
            town("Screen: picnic table, path from the RV Park to the beach", "Écran : table de pique-nique, chemin du RV Park à la plage", "main_ee/screen.webp"),
            town("The empty table", "La table vide", "main_ee/empty_table_garage.webp"),
          ],
        },
        {
          title: ["Build the bomb", "Montez la bombe"],
          done: { flag: "launchcode_step3" },
          text: [["Put the three parts on the bomb in the garage.", "Posez les trois pièces sur la bombe du garage."]],
          shots: [
            town("Under the front of the red car, between the Motel and the TV Station", "Sous l'avant de la voiture rouge, entre le motel et la TV Station", "main_ee/nuke_red_car.webp"),
            town("Beach: end of the stream, below the wooden bridge", "Plage : bout du ruisseau, sous le pont en bois", "main_ee/nuke_beach.webp"),
            town("TV Station: right fence, behind a gate", "TV Station : clôture de droite, derrière un portail", "main_ee/nuke_tv_station.webp"),
            town("The bomb", "La bombe", "main_ee/nuke.webp"),
          ],
        },
        {
          title: ["Open the safe: note this code", "Ouvrez le coffre : notez ce code"],
          done: { any: [{ flag: "launchcode_step1" }, { flag: "launchcode_step2" }] },
          text: [
            [
              "At the back of the Market, lie prone on the left of the desk and note its four numbers. Set each one on one of the four gauges, in any order: hit a gauge with the Crowbar while its needle is on the number, and again to start over.",
              "Au fond du Market, allongez-vous à gauche du bureau et notez ses quatre nombres. Réglez-en un sur chacune des quatre jauges, dans n'importe quel ordre : frappez une jauge au pied-de-biche quand son aiguille est sur le nombre, et encore pour recommencer.",
            ],
            [
              "Back at the safe, use the paper inside. A series of numbers appears on the scoreboard. Write it down outside the game, right now: it is the code you will need inside the monster, and it can't be read again.",
              "Revenez au coffre et utilisez le papier à l'intérieur. Une suite de nombres apparaît sur le tableau des scores. Notez-la hors du jeu, tout de suite : c'est le code à entrer à l'intérieur du monstre, et elle ne se relit pas.",
            ],
          ],
          shots: [
            town("The desk", "Le bureau", "main_ee/desk.webp"),
            town("Its numbers, seen lying down", "Ses nombres, vus allongé", "main_ee/desk_prone.webp"),
            town("Gauge: back of the Gas Station", "Jauge : arrière de la station-service", "main_ee/gauge_gas.webp"),
            town("Gauge: right of the Snack Shack", "Jauge : à droite du Snack Shack", "main_ee/gauge_snack.webp"),
            town("Gauge: back of the Power Station", "Jauge : arrière de la Power Station", "main_ee/gauge_power.webp"),
            town("Gauge: Motel maintenance room", "Jauge : local d'entretien du motel", "main_ee/gauge_motel.webp"),
            town("The paper", "Le papier", "main_ee/open_safe.webp"),
            town("The scoreboard", "Le tableau des scores", "main_ee/scoreboard.webp"),
          ],
        },
      ],
    },
    {
      title: ["The chemistry, step by step", "La chimie, pas à pas"],
      steps: [
        {
          title: ["What you are looking for", "Ce que vous cherchez"],
          text: [
            [
              "You must make one final chemical and put it on the bomb. There are only four possible ones, and you can make them without waiting for the radio. Every reaction also asks for a number on the keypad, which depends on this match: the number O, the right colour and the numbers on the boards. All of this is explained below.",
              "Vous devez fabriquer un produit final et le mettre sur la bombe. Il n'y en a que quatre possibles, et vous pouvez les fabriquer sans attendre la radio. Chaque réaction demande aussi un nombre au clavier, qui dépend de la partie : le nombre O, la bonne couleur et les nombres des tableaux. Tout est expliqué ci-dessous.",
            ],
          ],
          shots: [town("All the recipes as one picture, by RayPoopertonIII", "Toutes les recettes en une image, par RayPoopertonIII", "main_ee/chemicals.webp")],
        },
        {
          title: ["The four possible chemicals", "Les quatre produits possibles"],
          text: [
            [
              "The game picks one of these four each match. Make one, take it from the garage and bring it to the bomb. With the right one, your character reacts as you take it and the bomb accepts it. With a wrong one, the bomb simply refuses it, at no cost: move on to the next.",
              "Le jeu choisit l'un de ces quatre à chaque partie. Fabriquez-en un, prenez-le dans le garage et portez-le à la bombe. Avec le bon, votre personnage réagit quand vous le prenez et la bombe l'accepte. Avec un mauvais, la bombe le refuse simplement, sans pénalité : passez au suivant.",
            ],
          ],
          table: {
            head: [
              ["Final chemical", "Produit final"],
              ["Make, in this order", "À fabriquer, dans cet ordre"],
            ],
            rows: [
              ["1,3,5 tera-nitro-phenol", ["Phenol, Phenolsulfonic Acid, then the final one", "Phénol, acide phénolsulfonique, puis le produit final"]],
              ["3-methyl-2,4-di-nitrobenzene", ["Methylbenzene, Dinitro, then the final one", "Méthylbenzène, dinitro, puis le produit final"]],
              ["Octa-hydro-2,5-nitro-3,4,7-para-zokine", ["Formaldehyde, Hexamine, then the final one", "Formaldéhyde, hexamine, puis le produit final"]],
              ["3,4-di-nitroxy-methyl-propane", ["Formaldehyde, Acetaldehyde, Aldehyde Sludge, then the final one", "Formaldéhyde, acétaldéhyde, boue d'aldéhyde, puis le produit final"]],
            ],
          },
          points: [
            ["The garage holds four finished products. A fifth pushes the oldest out, so keep the Formaldehyde close if you need it twice.", "Le garage garde quatre produits finis. Un cinquième fait sortir le plus ancien : gardez donc le formaldéhyde à portée si vous en avez besoin deux fois."],
            ["You carry one thing at a time. Ingredients stay in their place, so you can take them again.", "Vous portez une seule chose à la fois. Les ingrédients restent à leur place : vous pouvez les reprendre."],
          ],
        },
        {
          title: ["Optional: the radio gives the right one at once", "Facultatif : la radio donne le bon d'un coup"],
          text: [
            [
              "The radio isn't needed: it only saves you from trying. From a round between 7 and 10, drawn each match, zombies drop batteries. Bring one to a radio: on the ground near the portable toilet at the Power Station, or on the couch of the Motel Office. Use it to repair it, then again to play the recordings. When all have been played, end the round to play them again.",
              "La radio n'est pas obligatoire : elle évite seulement les essais. À partir d'une manche entre 7 et 10, tirée à chaque partie, les zombies lâchent des piles. Apportez-en une à une radio : au sol près des toilettes portables de la Power Station, ou sur le canapé du bureau du motel. Utilisez-la pour la réparer, puis encore pour lancer les enregistrements. Une fois tout écouté, finissez la manche pour réécouter.",
            ],
            [
              "Ignore the man explaining how to make chemicals. Listen to Dr. Bright: only one recording gives the answer, and the others reject a chemical.",
              "Ignorez l'homme qui explique comment fabriquer les produits. Écoutez le Dr Bright : un seul enregistrement donne la réponse, les autres écartent un produit.",
            ],
          ],
          table: {
            head: [
              ["What he says", "Ce qu'il dit"],
              ["What it means", "Ce que ça veut dire"],
            ],
            rows: [
              [["« I've devised the perfect solution to our mutated crab problem: » and the name", "« J'ai mis au point la solution parfaite à notre problème de crabe mutant : » puis le nom"], ["This is the one to make", "C'est celui à fabriquer"]],
              [["« I don't think (name) will be useful in the current circumstance »", "« Je ne pense pas que (nom) sera utile dans les circonstances actuelles »"], ["Not this one", "Pas celui-là"]],
              [["« (name) may be a rather crude solution for what faces us »", "« (nom) serait une solution plutôt grossière face à ce qui nous attend »"], ["Not this one, despite how it sounds", "Pas celui-là, malgré les apparences"]],
            ],
          },
          shots: [
            town("A battery", "Une pile", "main_ee/battery.webp"),
            town("Radio at the Power Station", "Radio de la Power Station", "main_ee/radio_power.webp"),
            town("Radio at the Motel", "Radio du motel", "main_ee/radio_motel.webp"),
          ],
        },
        {
          title: ["Find the number O", "Trouvez le nombre O"],
          text: [
            [
              "The panel at the TV Station changes the colour of the map: full colour (normal), red, green, blue. Four places show « O = a number », and O is one of 2, 4, 8, 9, 11 or 15.",
              "La console de la TV Station change la couleur de la carte : pleine couleur (normal), rouge, vert, bleu. Quatre endroits affichent « O = un nombre », et O vaut 2, 4, 8, 9, 11 ou 15.",
            ],
            [
              "In full colour, all four say « = ». With the map in red, in green, then in blue, one of them changes each time to « ≠ »: that one is false. Check all four in red, green and blue: the number that always keeps « = » is O. Write it down.",
              "En pleine couleur, les quatre disent « = ». Avec la carte en rouge, en vert, puis en bleu, l'un d'eux passe à chaque fois à « ≠ » : celui-là est faux. Vérifiez les quatre en rouge, vert et bleu : le nombre qui garde toujours « = » est O. Notez-le.",
            ],
          ],
          shots: [
            town("The colour panel", "La console de couleur", "main_ee/control_panel.webp"),
            town("Gas Station front door", "Porte d'entrée de la station-service", "main_ee/o_num_gas.webp"),
            town("Market backroom, above the couch", "Arrière du Market, au-dessus du canapé", "main_ee/o_num_market.webp"),
            town("Beach, under the concrete bridge", "Plage, sous le pont en béton", "main_ee/o_num_bridge.webp"),
            town("Fridge in the closed RV", "Frigo du camping-car fermé", "main_ee/o_num_rv.webp"),
            town("Seen by jumping at the RV's front window", "Vu en sautant devant la fenêtre avant du camping-car", "main_ee/o_num_rv_front_window.webp"),
            town("« = » is kept", "« = » reste", "main_ee/o_num_equal.webp"),
            town("« ≠ » is false", "« ≠ » est faux", "main_ee/o_num_not_equal.webp"),
          ],
        },
        {
          title: ["Find the map's colour", "Trouvez la couleur de la carte"],
          text: [
            [
              "One colour for the whole match and every ingredient: it doesn't depend on the ingredient. Read the number M on the wall right of the window, in the Motel Office. Multiply O by M. The TV beside Elvira gives ranges of numbers with a colour. Take the one that contains your result.",
              "Une seule couleur pour toute la partie et tous les ingrédients : elle ne dépend pas de l'ingrédient. Lisez le nombre M sur le mur à droite de la fenêtre, dans le bureau du motel. Multipliez O par M. La télé à côté d'Elvira donne des plages de nombres avec une couleur. Prenez celle qui contient votre résultat.",
            ],
            [
              "Example: O × M = 106 and the TV says « < 107 Green, 107 - 109 Blue, > 109 Red »: the colour is green.",
              "Exemple : O × M = 106 et la télé dit « moins de 107 vert, 107 à 109 bleu, plus de 109 rouge » : la couleur est le vert.",
            ],
          ],
          shots: [town("M on the wall", "M sur le mur", "main_ee/m_number.webp"), town("The TV beside Elvira", "La télé à côté d'Elvira", "main_ee/elvira_tv.webp")],
        },
        {
          title: ["Read the red and blue numbers", "Lisez les chiffres rouge et bleu"],
          text: [
            [
              "Set the panel to the map's colour first: all the diamonds change with it, and only that colour shows the right numbers. Within the match, in that colour, they don't move: note them once.",
              "Réglez d'abord la console sur la couleur de la carte : tous les losanges changent avec elle, et seule cette couleur montre les bons chiffres. Pendant la partie, dans cette couleur, ils ne bougent plus : notez-les une fois.",
            ],
            [
              "Each ingredient, and each product you make, has its own diamond on one of the six boards, with four numbers. Their corners are coloured the same way on every diamond: red on top, blue on the left, green on the right, white at the bottom. Only the red and the blue count; the other two are there to mislead.",
              "Chaque ingrédient, et chaque produit fabriqué, a son propre losange sur l'un des six tableaux, avec quatre chiffres. Leurs coins ont les mêmes couleurs sur tous les losanges : rouge en haut, bleu à gauche, vert à droite, blanc en bas. Seuls le rouge et le bleu comptent ; les deux autres sont là pour tromper.",
            ],
          ],
          table: {
            head: [
              ["Board", "Tableau"],
              ["Where", "Où"],
              ["What it lists", "Ce qu'il contient"],
            ],
            rows: [
              [["Spawn", "Départ"], ["Tent hallway", "Couloir de la tente"], ["Racing Fuel, Vodka, Baking Soda, Detergent, Insect Repellent", "Carburant, vodka, bicarbonate, lessive, anti-insectes"]],
              [["Power Station", "Power Station"], ["Dirt path behind the Market", "Chemin de terre derrière le Market"], ["Quarters, Glass Cleaner, Pennies, Nail Polish Remover, Drain Opener", "Pièces de 25 cents, nettoyant vitres, pennies, dissolvant, déboucheur"]],
              ["RV Park", ["Beside the RV near Mule Munchies", "À côté du camping-car près de Mule Munchies"], ["Ice, Vinegar, Plant Food, Paint", "Glace, vinaigre, engrais, peinture"]],
              [["Beach", "Plage"], ["Below the path to the RV Park", "Sous le chemin du RV Park"], ["Motor Oil, Wheel Cleaner, Fat", "Huile moteur, nettoyant jantes, graisse"]],
              [["Gas Station", "Station-service"], ["In the garage, near the bomb", "Dans le garage, près de la bombe"], ["Hexamine, Phenolsulfonic Acid, Phenol, Aldehyde Sludge, Formaldehyde, Dinitro", "Hexamine, acide phénolsulfonique, phénol, boue d'aldéhyde, formaldéhyde, dinitro"]],
              [["TV Studio", "Studio de télé"], ["Right of Bang Bangs", "À droite de Bang Bangs"], ["Acetaldehyde, Glycerol, Methylbenzene, Mixed Acid, Nitrated Glycerol", "Acétaldéhyde, glycérol, méthylbenzène, acide mélangé, glycérol nitré"]],
            ],
          },
          shots: [
            town("A diamond: the arrows point at the red and the blue", "Un losange : les flèches montrent le rouge et le bleu", "main_ee/chemical_diamond_with_arrow.webp"),
            town("Example of a board", "Exemple de tableau", "main_ee/board_example.webp"),
            town("Board: spawn", "Tableau : départ", "main_ee/board_spawn.webp"),
            town("Board: Power Station", "Tableau : Power Station", "main_ee/board_power.webp"),
            town("Board: RV Park", "Tableau : RV Park", "main_ee/board_rv.webp"),
            town("Board: beach", "Tableau : plage", "main_ee/board_beach.webp"),
            town("Board: Gas Station", "Tableau : station-service", "main_ee/board_gas.webp"),
            town("Board: TV Studio", "Tableau : studio de télé", "main_ee/board_tv.webp"),
          ],
        },
        {
          title: ["The recipes", "Les recettes"],
          text: [["These come from the game's own tables. Each reaction only needs what its line lists.", "Elles viennent des tables du jeu. Chaque réaction ne demande que ce qui figure sur sa ligne."]],
          table: {
            head: [
              ["To make", "À fabriquer"],
              ["Put in", "À poser"],
            ],
            rows: [
              [["Formaldehyde", "Formaldéhyde"], ["Racing Fuel + Quarters", "Carburant + pièces de 25 cents"]],
              [["Acetaldehyde", "Acétaldéhyde"], ["Vodka + Pennies", "Vodka + pennies"]],
              [["Aldehyde Sludge", "Boue d'aldéhyde"], ["Formaldehyde + Acetaldehyde + Detergent", "Formaldéhyde + acétaldéhyde + lessive"]],
              ["3,4-di-nitroxy-methyl-propane", ["Aldehyde Sludge + Nail Polish Remover", "Boue d'aldéhyde + dissolvant"]],
              [["Phenol", "Phénol"], ["Insect Repellent + Motor Oil + Wheel Cleaner", "Anti-insectes + huile moteur + nettoyant jantes"]],
              [["Phenolsulfonic Acid", "Acide phénolsulfonique"], ["Phenol + Drain Opener", "Phénol + déboucheur"]],
              ["1,3,5 tera-nitro-phenol", ["Phenolsulfonic Acid + Detergent", "Acide phénolsulfonique + lessive"]],
              ["Hexamine", ["Formaldehyde + Glass Cleaner", "Formaldéhyde + nettoyant vitres"]],
              ["Octa-hydro-2,5-nitro-3,4,7-para-zokine", ["Hexamine + Vinegar + Detergent + Plant Food", "Hexamine + vinaigre + lessive + engrais"]],
              [["Methylbenzene", "Méthylbenzène"], ["Paint + Detergent + Drain Opener", "Peinture + lessive + déboucheur"]],
              ["Dinitro", ["Detergent + Baking Soda + Vinegar + Methylbenzene", "Lessive + bicarbonate + vinaigre + méthylbenzène"]],
              ["3-methyl-2,4-di-nitrobenzene", ["Dinitro + Racing Fuel", "Dinitro + carburant"]],
            ],
          },
        },
        {
          title: ["Run a reaction", "Lancez une réaction"],
          points: [
            ["Put each product on a square before the tubes, on the garage's table.", "Posez chaque produit sur une case devant les tubes, sur la table du garage."],
            ["Work out the reaction's code: for each product put in, its red number plus its blue number; add all of them, then take away O. The Chemistry page does this sum.", "Calculez le code de la réaction : pour chaque produit posé, son chiffre rouge plus son chiffre bleu ; additionnez le tout, puis retirez O. La page Chimie fait ce calcul."],
            ["Type this code once on the table's keypad, one or two digits: look at a digit and use it. Then press the big button. One code per reaction, never one per ingredient.", "Tapez ce code une seule fois sur le clavier de la table, un ou deux chiffres : regardez un chiffre et utilisez-le. Appuyez ensuite sur le gros bouton. Un code par réaction, jamais un par ingrédient."],
            ["Success: gas shows at the edges of the screen and the product appears on the right of the garage.", "Réussite : du gaz apparaît sur les bords de l'écran et le produit arrive à droite du garage."],
            ["Failure: you lose almost all your health and the table is emptied. The number or a product was wrong, so check them before trying again.", "Échec : vous perdez presque toute votre vie et la table se vide. Le nombre ou un produit était faux : vérifiez-les avant de réessayer."],
          ],
          text: [
            [
              "Worked example, with made-up numbers: O = 8. Phenol takes Insect Repellent (red 1, blue 5), Motor Oil (red 7, blue 2) and Wheel Cleaner (red 4, blue 9). So 6 + 9 + 13 = 28, and 28 − 8 = 20: put the three on the table, type 20 once, press the button.",
              "Exemple, avec des nombres inventés : O = 8. Le phénol demande l'anti-insectes (rouge 1, bleu 5), l'huile moteur (rouge 7, bleu 2) et le nettoyant jantes (rouge 4, bleu 9). Donc 6 + 9 + 13 = 28, et 28 − 8 = 20 : posez les trois sur la table, tapez 20 une seule fois, appuyez sur le bouton.",
            ],
            [
              "Carry the final chemical to the bomb and use it. If the bomb refuses it, try the next one.",
              "Portez le produit final jusqu'à la bombe et utilisez-le. Si la bombe le refuse, essayez le suivant.",
            ],
          ],
          shots: [
            town("The squares", "Les cases", "main_ee/squares_chem.webp"),
            town("The keypad", "Le clavier", "main_ee/keypard_number.webp"),
            town("The big button", "Le gros bouton", "main_ee/big_button.webp"),
          ],
        },
        ...WALKTHROUGHS,
      ],
    },
    {
      title: ["Where to find the ingredients", "Où trouver les ingrédients"],
      steps: [
        {
          title: ["The 17 ingredients", "Les 17 ingrédients"],
          text: [["« Crowbar » means hitting the object with it. Other objects lie around the map, but they aren't used.", "« Pied-de-biche » veut dire frapper l'objet avec. D'autres objets traînent sur la carte, mais ils ne servent à rien."]],
          table: {
            head: [
              ["Ingredient", "Ingrédient"],
              ["Where", "Où"],
            ],
            rows: [
              [["Racing Fuel", "Carburant (Racing Fuel)"], ["In front of the Gas Station", "Devant la station-service"]],
              [["Motor Oil", "Huile moteur (Motor Oil)"], ["Floor of the garage", "Au sol du garage"]],
              [["Quarters", "Pièces de 25 cents (Quarters)"], ["Crowbar: a payphone, right of the Gas Station", "Pied-de-biche : une cabine, à droite de la station-service"]],
              ["Vodka", ["Market: liquor shelf", "Market : rayon alcool"]],
              [["Baking Soda", "Bicarbonate (Baking Soda)"], ["Market: right of the middle shelf", "Market : à droite du rayon du milieu"]],
              [["Detergent", "Lessive (Detergent)"], ["Market: left of the left shelf", "Market : à gauche du rayon de gauche"]],
              [["Ice", "Glace (Ice)"], ["Market. Crowbar: the ice machine", "Market. Pied-de-biche : la machine à glaçons"]],
              [["Vinegar", "Vinaigre (Vinegar)"], ["Market: table in the backroom", "Market : table de l'arrière-salle"]],
              [["Glass Cleaner", "Nettoyant vitres (Glass Cleaner)"], ["Market: front of the right shelf", "Market : devant du rayon de droite"]],
              [["Wheel Cleaner", "Nettoyant jantes (Wheel Cleaner)"], ["Market: left of the middle shelf", "Market : à gauche du rayon du milieu"]],
              [["Fat", "Graisse (Fat)"], ["Market freezer. Crowbar: top of the leftmost hanging meat", "Congélateur du Market. Pied-de-biche : haut de la viande suspendue la plus à gauche"]],
              ["Pennies", ["Market. Crowbar: the cash register", "Market. Pied-de-biche : la caisse"]],
              [["Insect Repellent", "Anti-insectes (Insect Repellent)"], ["Spawn: table in the hallway right of Up & Atoms", "Départ : table du couloir à droite d'Up & Atoms"]],
              [["Plant Food", "Engrais (Plant Food)"], ["Snack Shack: left of the building", "Snack Shack : à gauche du bâtiment"]],
              [["Paint", "Peinture (Paint)"], ["Path to the TV Station: behind the shack near Racin' Stripes", "Chemin de la TV Station : derrière la cabane près de Racin' Stripes"]],
              [["Nail Polish Remover", "Dissolvant (Nail Polish Remover)"], ["Motel: desk in the office", "Motel : bureau de l'accueil"]],
              [["Drain Opener", "Déboucheur (Drain Opener)"], ["RV Park: on a toilet in the bathroom", "RV Park : sur des toilettes"]],
            ],
          },
          shots: [
            town("Racing Fuel", "Carburant", "ingredients/racing_fuel.webp"),
            town("Motor Oil", "Huile moteur", "ingredients/motor_oil.webp"),
            town("Quarters", "Pièces de 25 cents", "ingredients/quarters.webp"),
            town("Vodka", "Vodka", "ingredients/vodka.webp"),
            town("Baking Soda", "Bicarbonate", "ingredients/baking_soda.webp"),
            town("Detergent", "Lessive", "ingredients/detergent.webp"),
            town("Ice", "Glace", "ingredients/ice.webp"),
            town("Vinegar", "Vinaigre", "ingredients/vinegar.webp"),
            town("Glass Cleaner", "Nettoyant vitres", "ingredients/glass_cleaner.webp"),
            town("Wheel Cleaner", "Nettoyant jantes", "ingredients/wheel_cleaner.webp"),
            town("Fat", "Graisse", "ingredients/fat.webp"),
            town("Pennies", "Pennies", "ingredients/pennies.webp"),
            town("Insect Repellent", "Anti-insectes", "ingredients/insect.webp"),
            town("Plant Food", "Engrais", "ingredients/plant_food.webp"),
            town("Paint", "Peinture", "ingredients/paint.webp"),
            town("Nail Polish Remover", "Dissolvant", "ingredients/nail_polish.webp"),
            town("Drain Opener", "Déboucheur", "ingredients/drain_opener.webp"),
          ],
        },
      ],
    },
    {
      title: ["The last fight", "Le dernier combat"],
      steps: [
        {
          title: ["Start it and push the bomb", "Lancez-le et poussez la bombe"],
          done: { past: ["crabBoss", 1] },
          text: [
            [
              "All players use the bomb to charge it, then use it again. You are taken to the beach. Stand near the cart to push it towards the water. Every time it stops and starts again, the monster fires eggs and fireballs, and zombies come. Shoot the eggs and fireballs down so the cart keeps moving. A Max Ammo waits near the OSA and returns after a few minutes.",
              "Tous les joueurs utilisent la bombe pour la charger, puis la réutilisent. Vous êtes emmenés sur la plage. Restez près du chariot pour le pousser vers l'eau. Chaque fois qu'il s'arrête et repart, le monstre lance œufs et boules de feu, et des zombies arrivent. Abattez œufs et boules de feu pour que le chariot continue. Des munitions max attendent près de l'OSA et reviennent après quelques minutes.",
            ],
          ],
          shots: [town("The cart", "Le chariot", "main_ee/nuke_cart_spawn.webp"), town("The Max Ammo", "Les munitions max", "main_ee/max_ammo_boss_fight.webp")],
        },
        {
          title: ["Hit the chest with the death rays", "Frappez la poitrine avec les rayons"],
          done: { past: ["crabBoss", 2] },
          text: [
            [
              "At the water, the bomb flies into its mouth. It now has a deadly ground slam, when one or both claws rise: run, for example across the bridge towards the RV Park. Its laser, when the antenna glows, is easy to dodge.",
              "Arrivée à l'eau, la bombe part dans sa gueule. Il a maintenant une frappe au sol mortelle, quand une ou deux pinces se lèvent : courez, par exemple sur le pont vers le RV Park. Son laser, quand l'antenne brille, s'évite facilement.",
            ],
            [
              "A part of its chest glows. Aim at it with a death ray around the beach. After a first hit, marked by a skull, the chest keeps glowing and the Spartan SA3, a wallbuy near where the cart started, can damage it too. After 3 or 4 hits it stops attacking: everyone uses the cart to charge it.",
              "Une partie de sa poitrine brille. Visez-la avec un rayon autour de la plage. Après un premier coup, marqué d'un crâne, la poitrine continue de briller et la Spartan SA3, arme murale près du départ du chariot, peut aussi la blesser. Après 3 ou 4 coups, il cesse d'attaquer : tout le monde utilise le chariot pour le charger.",
            ],
          ],
          shots: [
            town("The glowing spot", "La zone brillante", "main_ee/glowing_spot.webp"),
            town("Ray: beside the OSA", "Rayon : à côté de l'OSA", "main_ee/ray_osa.webp"),
            town("Ray: path to the RV Park", "Rayon : chemin du RV Park", "main_ee/ray_rv.webp"),
            town("Ray: path to the main street", "Rayon : chemin vers la rue principale", "main_ee/ray_gas.webp"),
            town("Ray: concrete bridge", "Rayon : pont en béton", "main_ee/ray_bridge.webp"),
            town("The Spartan SA3", "La Spartan SA3", "main_ee/spartan_wallbuy.webp"),
            town("The cart to charge", "Le chariot à charger", "main_ee/nuke_cart_empty.webp"),
          ],
        },
        {
          title: ["Radiation and lasers", "Radiations et lasers"],
          done: { flag: "boss_fight_finished" },
          text: [
            [
              "It spits radiation on the front of the beach, then two sets of eggs and fireballs, then more radiation, which pushes you back to the wall under the bridge. Then the radiation clears and lasers appear. Everyone jumps and slides through them to the cart, before the timer ends, and uses it.",
              "Il crache des radiations sur l'avant de la plage, puis deux salves d'œufs et de boules de feu, puis encore des radiations qui vous repoussent jusqu'au mur sous le pont. Les radiations disparaissent alors et des lasers apparaissent. Tout le monde saute et glisse au travers jusqu'au chariot, avant la fin du chrono, et l'utilise.",
            ],
            ["If someone is too slow, the lasers vanish: use the cart again and redo this part.", "Si quelqu'un est trop lent, les lasers disparaissent : réutilisez le chariot et refaites cette partie."],
          ],
          shots: [town("The radiation", "Les radiations", "main_ee/raditation_spit.webp"), { label: ["Video of the route through the lasers", "Vidéo du trajet entre les lasers"], url: "https://youtu.be/WyuYjiJlzaI" }],
        },
        {
          title: ["Enter the safe's code in its belly", "Entrez le code du coffre dans son ventre"],
          done: { flag: "boss_fight_finished" },
          text: [
            [
              "Inside, each player must enter the code from the safe, nobody can do it for another. It works like the machine at spawn: press use when the light is on the digit. Three errors per attempt and three attempts are allowed. Failing or taking too long sends you back to the radiation and the lasers.",
              "À l'intérieur, chaque joueur doit entrer le code du coffre, personne ne peut le faire pour un autre. Cela marche comme la machine du départ : appuyez sur utiliser quand la lumière est sur le chiffre. Trois erreurs par essai et trois essais sont permis. Échouer ou tarder renvoie aux radiations et aux lasers.",
            ],
            ["With the right code, you are taken out and the film plays. You receive the Soul Key directly.", "Avec le bon code, vous êtes sortis et le film se lance. Vous recevez directement la Soul Key."],
          ],
        },
      ],
    },
  ],
};

const BEAST: MapGuide = {
  map: "Beast from Beyond",
  code: "cp_final",
  quest: ["The Beast from Beyond: The End?", "The Beast from Beyond : The End?"],
  intro: [
    "Shorter than the others, but it needs the Entangler, which comes first. Be careful: once finished without Director's Cut, the match breaks, so don't plan on playing further.",
    "Plus courte que les autres, mais elle demande l'Entangler, à obtenir d'abord. Attention : une fois finie sans Director's Cut, la partie se dérègle, ne comptez donc pas continuer à jouer.",
  ],
  source: `${SITE}IW/the_beast_from_beyond/the_beast_from_beyond_guide`,
  parts: [
    {
      title: ["Power, Pack-a-Punch and Entangler", "Courant, Pack-a-Punch et Entangler"],
      steps: [
        {
          title: ["Bring N31L's head back", "Rapportez la tête de N31L"],
          done: { any: [{ flag: "neil_head_placed" }, { flag: "restorepower_step1" }] },
          text: [
            [
              "In the Ops Center, drop through the hole in the middle of the room, and land on the lowest ledge or you die. Take the head at the end of the hallway and put it in the slot on the wall near the spawn door. Power comes on, and from the next round zombies replace cryptids.",
              "Dans l'Ops Center, descendez par le trou au milieu de la salle, et atterrissez sur la corniche la plus basse sous peine de mourir. Prenez la tête au bout du couloir et mettez-la dans la fente du mur, près de la porte du départ. Le courant revient, et dès la manche suivante les zombies remplacent les cryptides.",
            ],
          ],
          shots: [final("The hole", "Le trou", "power/hole.webp"), final("The head", "La tête", "power/head.webp"), final("The slot", "La fente", "power/slot.webp")],
        },
        {
          title: ["Open the way to the Theatre", "Ouvrez le passage vers le théâtre"],
          text: [["In the Cargo Bay, press the button on the wall of the upper catwalk. A turret opens a portal across the room.", "Dans la Cargo Bay, appuyez sur le bouton du mur de la passerelle du haut. Une tourelle ouvre un portail de l'autre côté de la salle."]],
          shots: [final("The button", "Le bouton", "theatre/button.webp"), final("The portal", "Le portail", "theatre/portal_cargo.webp")],
        },
        {
          title: ["Build the bridge to the Pack-a-Punch", "Construisez le pont vers le Pack-a-Punch"],
          done: { flag: "bridge_constructed" },
          text: [
            [
              "Each of the three scraps of metal brings three cryptids when taken. Place them on the broken bridge outside. The portal across it gives 30 seconds in the Pack-a-Punch room. The first time you come back in a round, a Phantom or three cryptids appear: the first Phantom you kill drops a disk you need, so note where it dies.",
              "Chacun des trois morceaux de ferraille fait venir trois cryptides quand on le prend. Posez-les sur le pont cassé à l'extérieur. Le portail de l'autre côté donne 30 secondes dans la salle du Pack-a-Punch. Au premier retour d'une manche, un Phantom ou trois cryptides apparaissent : le premier Phantom tué lâche une disquette nécessaire, notez donc où il meurt.",
            ],
          ],
          shots: [
            final("Cargo Bay, lowest level, left of the stairs", "Cargo Bay, niveau le plus bas, à gauche de l'escalier", "pap/metal_cargo_bay.webp"),
            final("Medical Bay, right of Blue Bolts", "Medical Bay, à droite de Blue Bolts", "pap/metal_med_bay.webp"),
            final("Theatre, on a burning car", "Théâtre, sur une voiture en feu", "pap/metal_theatre.webp"),
            final("The broken bridge", "Le pont cassé", "pap/broken_bridge.webp"),
          ],
        },
        {
          title: ["Get the Entangler", "Obtenez l'Entangler"],
          text: [
            [
              "First skull: a power box appears in one of three places. Blow it open with a grenade and shoot the skull inside.",
              "Premier crâne : un boîtier électrique apparaît à l'un de trois endroits. Ouvrez-le avec une grenade et tirez sur le crâne à l'intérieur.",
            ],
            [
              "Second skull: four red Xs lie around the Cargo Bay. Each player stands on a different one to start a lockdown, and stays in the green circle until the skull in the middle reaches the top of its beam. Zombies keep coming, in the Cargo Bay only. The skull then moves: jump into it before it disappears. The Entangler appears in the middle of the Cargo Bay.",
              "Second crâne : quatre X rouges se trouvent dans la Cargo Bay. Chaque joueur se place sur un X différent pour lancer un verrouillage, et reste dans le cercle vert jusqu'à ce que le crâne du milieu atteigne le haut de son rayon. Les zombies arrivent sans fin, seulement dans la Cargo Bay. Le crâne se déplace ensuite : sautez dedans avant qu'il disparaisse. L'Entangler apparaît au milieu de la Cargo Bay.",
            ],
          ],
          shots: [
            final("Box: Flooded Room, above the stairs to the Medical Bay", "Boîtier : salle inondée, au-dessus de l'escalier du Medical Bay", "skull_breaker/skull_1/box_medical.webp"),
            final("Box: Ops Center, above Bombstoppers", "Boîtier : Ops Center, au-dessus de Bombstoppers", "skull_breaker/skull_1/box_ops.webp"),
            final("Box: Cargo Bay, above the stairs by the P-LAW", "Boîtier : Cargo Bay, au-dessus de l'escalier près du P-LAW", "skull_breaker/skull_1/box_cargo.webp"),
            final("X: upper catwalk", "X : passerelle du haut", "skull_breaker/skull_2/red_x_upper.webp"),
            final("X: bottom of the P-LAW stairs", "X : bas de l'escalier du P-LAW", "skull_breaker/skull_2/red_x_stairs.webp"),
            final("X: below the catwalk, by the Theatre portal", "X : sous la passerelle, près du portail du théâtre", "skull_breaker/skull_2/red_x_portal.webp"),
            final("X: near the X-Eon", "X : près de la X-Eon", "skull_breaker/skull_2/red_x_xeon.webp"),
            final("The skull and its beam", "Le crâne et son rayon", "skull_breaker/skull_2/skull_middle_room.webp"),
          ],
        },
      ],
    },
    {
      title: ["The easter egg", "Le secret"],
      steps: [
        {
          title: ["Collect the four floppy disks", "Récupérez les quatre disquettes"],
          text: [["Each one shows a symbol, bottom left above your points. You can only hold one at a time.", "Chacune affiche un symbole, en bas à gauche au-dessus de vos points. Vous n'en portez qu'une à la fois."]],
          points: [
            ["First: dropped by the first Phantom you kill, after leaving the Pack-a-Punch room.", "Première : lâchée par le premier Phantom tué, après la sortie de la salle du Pack-a-Punch."],
            ["Second: in the snow at the foot of a pillar, left of the Pack-a-Punch portal.", "Deuxième : dans la neige au pied d'un pilier, à gauche du portail du Pack-a-Punch."],
            ["Third: in the Proteus hallway, a fence closes a red room. Grab the disk with the Entangler and shoot it into the floor vent while it smokes. It comes out of one of seven vents, and stays there.", "Troisième : dans le couloir de la Proteus, un grillage ferme une salle rouge. Attrapez la disquette à l'Entangler et tirez-la dans la grille au sol pendant qu'elle fume. Elle ressort par l'une de sept grilles, et y reste."],
            ["Fourth: take a space helmet in the hallway between outside and the Cargo Bay. At the Medical Bay's force field, shoot it through the field at the active monitor above the microscope. The disk is on the table left of the monitor.", "Quatrième : prenez un casque spatial dans le couloir entre l'extérieur et la Cargo Bay. Au champ de force du Medical Bay, tirez-le à travers le champ sur l'écran actif au-dessus du microscope. La disquette est sur la table à gauche de l'écran."],
          ],
          shots: [
            final("Second disk", "Deuxième disquette", "main_ee/floppy_pap.webp"),
            final("The red room's fence", "Le grillage de la salle rouge", "main_ee/red_room_fence.webp"),
            final("The vent", "La grille", "main_ee/vent.webp"),
            final("The vent smoking", "La grille qui fume", "main_ee/vent_smoke.webp"),
            final("Third disk", "Troisième disquette", "main_ee/red_room_floppy.webp"),
            final("Exit: spawn, left of the Magic Wheel", "Sortie : départ, à gauche de la roue magique", "main_ee/floppy_red_room/floppy_vent_spawn.webp"),
            final("Exit: Cafeteria, left of the freezer", "Sortie : cafétéria, à gauche du congélateur", "main_ee/floppy_red_room/floppy_vent_cafe.webp"),
            final("Exit: right of the Cargo Bay door", "Sortie : à droite de la porte de la Cargo Bay", "main_ee/floppy_red_room/floppy_vent_cargo.webp"),
            final("Exit: across from that one", "Sortie : en face de la précédente", "main_ee/floppy_red_room/floppy_vent_cargo_2.webp"),
            final("Exit: right of the fence", "Sortie : à droite du grillage", "main_ee/floppy_red_room/floppy_vent_red_room.webp"),
            final("Exit: top of the stairs", "Sortie : en haut de l'escalier", "main_ee/floppy_red_room/floppy_vent_stairs.webp"),
            final("Exit: near the Ops Center door", "Sortie : près de la porte de l'Ops Center", "main_ee/floppy_red_room/floppy_vent_ops.webp"),
            final("The space helmet", "Le casque spatial", "main_ee/space_helmet.webp"),
            final("The force field door", "La porte au champ de force", "main_ee/force_field_door.webp"),
            final("The monitor to hit", "L'écran à toucher", "main_ee/force_field_monitor.webp"),
            final("Fourth disk", "Quatrième disquette", "main_ee/floppy_force_field.webp"),
          ],
        },
        {
          title: ["Put the disks in N31L", "Insérez les disquettes dans N31L"],
          text: [
            [
              "Use the four slots before N31L. Find, on the chart, the row that has your four symbols and follow it from left to right. If it works, the screen flashes yellow then red and N31L turns evil: he shuts doors and starts traps at random. Doors can be opened again.",
              "Utilisez les quatre fentes devant N31L. Cherchez, sur le tableau, la ligne qui contient vos quatre symboles et suivez-la de gauche à droite. Si c'est bon, l'écran clignote en jaune puis en rouge et N31L devient mauvais : il ferme des portes et lance des pièges au hasard. Les portes se rouvrent.",
            ],
          ],
          shots: [final("The chart of the symbols", "Le tableau des symboles", "main_ee/floppy_cheat.webp")],
        },
        {
          title: ["Open the handle panel", "Ouvrez le panneau de poignées"],
          points: [
            ["In the Theatre, grab the wall button behind the Brute cutout with the Entangler, carry it to the concession area and shoot it into a Beast from Beyond poster.", "Au théâtre, attrapez à l'Entangler le bouton mural derrière le carton de la Brute, portez-le vers le comptoir et tirez-le dans une affiche Beast from Beyond."],
            ["In the Medical Bay's force field room, lie prone before the desk where the disk was, and use the button under it.", "Dans la salle à champ de force du Medical Bay, allongez-vous devant le bureau de la disquette, et utilisez le bouton dessous."],
            ["In the room with the dead cryptid, a panel with 16 handles opens.", "Dans la salle au cryptide mort, un panneau de 16 poignées s'ouvre."],
          ],
          shots: [
            final("The Theatre's button", "Le bouton du théâtre", "main_ee/button_theatre.webp"),
            final("The poster", "L'affiche", "main_ee/beast_poster.webp"),
            final("The button under the desk", "Le bouton sous le bureau", "main_ee/button_med_bay.webp"),
          ],
        },
        {
          title: ["Put all the handles in the same direction", "Mettez toutes les poignées dans le même sens"],
          done: { flag: "completed_toggle_puzzle_once" },
          text: [
            [
              "The game accepts all 16 handles in one direction, whichever it is. Using a handle also moves others. The method that works: write down which handles are horizontal now, then use only those, once each, even if they turn meanwhile. If some are still horizontal at the end, write them down and do the same again.",
              "Le jeu accepte les 16 poignées dans un même sens, peu importe lequel. Utiliser une poignée en fait aussi bouger d'autres. La méthode qui marche : notez lesquelles sont horizontales au départ, puis utilisez seulement celles-là, une fois chacune, même si elles tournent entre-temps. S'il en reste d'horizontales à la fin, notez-les et recommencez.",
            ],
            ["N31L is then hacked for about 5 minutes. After that he turns evil again, and you can redo the panel straight away.", "N31L est alors piraté pendant environ 5 minutes. Il redevient ensuite mauvais, et vous pouvez refaire le panneau aussitôt."],
          ],
          shots: [final("The panel", "Le panneau", "main_ee/handles.webp")],
        },
        {
          title: ["Carry N31L to the projector room", "Portez N31L à la salle du projecteur"],
          text: [
            [
              "Grab N31L with the Entangler: every door shuts and zombies come. Doors only open if N31L faces them. Turn around in front of a closed door until it opens. Shoot him at the computer right of the projector. Using him there starts the last fight.",
              "Attrapez N31L à l'Entangler : toutes les portes se ferment et des zombies arrivent. Les portes ne s'ouvrent que si N31L leur fait face. Tournez sur vous-même devant une porte fermée jusqu'à ce qu'elle s'ouvre. Tirez-le sur l'ordinateur à droite du projecteur. L'utiliser là lance le dernier combat.",
            ],
          ],
          shots: [final("The computer", "L'ordinateur", "main_ee/neil_computer_pap.webp")],
        },
        {
          title: ["The last fight", "Le dernier combat"],
          points: [
            ["You are in another Cargo Bay. The yellow glowing box in an open crate refills your weapon, without limit.", "Vous êtes dans une autre Cargo Bay. La boîte jaune lumineuse d'une caisse ouverte recharge votre arme, sans limite."],
            ["A laser cannon opens crates one by one and releases four Rhinos. Portals on one side give cryptids and Phantoms for about a minute, then the other side's, then all of them.", "Un canon laser ouvre des caisses une à une et libère quatre rhinos. Des portails d'un côté donnent cryptides et Phantoms pendant environ une minute, puis ceux de l'autre côté, puis tous."],
            ["Camp in the sloped crate with a roof: the laser can't shoot through it, and cryptids only reach you from below.", "Restez dans la caisse inclinée à toit : le laser ne la traverse pas, et les cryptides ne vous atteignent que par le bas."],
            ["After about 45 seconds, three monitors light up. Turn them all off quickly, or they and their portals start again.", "Après environ 45 secondes, trois écrans s'allument. Éteignez-les tous vite, sinon eux et leurs portails repartent."],
            ["A crate opens on a computer showing 99. It counts down for about 2 min 30 while enemies keep coming. At zero, use it: the cryptids vanish.", "Une caisse s'ouvre sur un ordinateur qui affiche 99. Il décompte pendant environ 2 min 30 pendant que les ennemis continuent d'arriver. À zéro, utilisez-le : les cryptides disparaissent."],
            ["Two Mammoths, blue Rhinos, come out of the crate above the ammo. They take a lot of damage and their blue fire stays on the ground, so don't block a doorway with it. Kill both for the final film.", "Deux mammouths, des rhinos bleus, sortent de la caisse au-dessus des munitions. Ils encaissent beaucoup et leur feu bleu reste au sol : n'en bouchez pas un passage. Tuez-les tous les deux pour le film de fin."],
          ],
          shots: [
            final("The ammo box", "La boîte de munitions", "main_ee/ammo_crate.webp"),
            final("The sloped crate", "La caisse inclinée", "main_ee/sloped_crate.webp"),
            final("Monitor: corner behind and left of the ammo", "Écran : angle derrière et à gauche des munitions", "main_ee/console_1.webp"),
            final("Monitor: corner behind and right of the ammo", "Écran : angle derrière et à droite des munitions", "main_ee/console_2.webp"),
            final("Monitor: bottom of the sloped crate", "Écran : bas de la caisse inclinée", "main_ee/console_3.webp"),
            final("The Mammoths' crate", "La caisse des mammouths", "main_ee/mammoth_crate.webp"),
          ],
        },
      ],
    },
  ],
};

export const GUIDES: MapGuide[] = [SPACELAND, RAVE, SHAOLIN, RADIOACTIVE, BEAST];
