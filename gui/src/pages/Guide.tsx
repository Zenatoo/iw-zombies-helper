import { ChevronRight16Regular, Open16Regular } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { api, type Quest, type View } from "../api";
import { type Cell, type Done, GUIDES, type MapGuide, type Part, type Shot, type Step, type Text } from "../guideData";
import { t } from "../i18n";

interface Props {
  view: View;
  act: (command: Promise<void>) => void;
}

const say = ([english, french]: Text) => t(english, french);
const sayCell = (cell: Cell) => (typeof cell === "string" ? cell : say(cell));

/** A picture on the web: it opens in the browser, next to the game. */
function ShotLink({ shot, text, act, icon }: { shot: Shot; text?: string; act: Props["act"]; icon?: boolean }) {
  return (
    <a
      className="guide-link"
      href={shot.url}
      title={shot.url}
      onClick={(event) => {
        event.preventDefault();
        act(api.openLink(shot.url));
      }}
    >
      {icon && <Open16Regular aria-hidden="true" />}
      {text ?? say(shot.label)}
    </a>
  );
}

interface ShotGroup {
  title: string;
  links: { shot: Shot; text: string }[];
}

/**
 * Pictures gathered by what they show: labels sharing a name before their colon ("Reel: on a couch")
 * form a group under that name; the others stay together under a general title.
 */
function groupShots(shots: Shot[]): ShotGroup[] {
  const named = new Map<string, ShotGroup["links"]>();
  const parts = shots.map((shot) => /^(.+?) ?: (.+)$/.exec(say(shot.label)));
  shots.forEach((shot, index) => {
    const part = parts[index];
    if (part?.[1] && part[2]) {
      const links = named.get(part[1]) ?? [];
      links.push({ shot, text: part[2].charAt(0).toUpperCase() + part[2].slice(1) });
      named.set(part[1], links);
    }
  });
  const grouped = [...named].filter(([, links]) => links.length > 1);
  const inGroup = new Set(grouped.flatMap(([, links]) => links.map((link) => link.shot)));
  const loose = shots.filter((shot) => !inGroup.has(shot)).map((shot) => ({ shot, text: say(shot.label) }));
  return [...(loose.length > 0 ? [{ title: t("Pictures", "Images"), links: loose }] : []), ...grouped.map(([title, links]) => ({ title, links }))];
}

function ShotGroups({ shots, act }: { shots: Shot[]; act: Props["act"] }) {
  return (
    <div className="guide-shots">
      {groupShots(shots).map((group) => (
        <div key={group.title} className="guide-shot-group">
          <h4>{group.title}</h4>
          <ul>
            {group.links.map((link) => (
              <li key={link.shot.url}>
                <ShotLink shot={link.shot} text={link.text} act={act} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Steps ticked by hand, kept between sessions: "map/part/step", from their English titles. */
const DONE_STORED = "iwh-guide-done";

function readDone(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(DONE_STORED) ?? "null");
    return Array.isArray(stored) ? stored.filter((key): key is string => typeof key === "string") : [];
  } catch {
    return [];
  }
}

function saveDone(done: string[]) {
  try {
    localStorage.setItem(DONE_STORED, JSON.stringify(done));
  } catch {
    // Only a convenience: the ticks are lost when the window forgets them.
  }
}

const stepKey = (guide: MapGuide, part: Part, step: Step) => `${guide.map}/${part.title[0]}/${step.title[0]}`;

/** Every step of a map in order, with its key. */
function stepsOf(guide: MapGuide) {
  return guide.parts.flatMap((part) => part.steps.map((step) => ({ part, step, key: stepKey(guide, part, step) })));
}

/** True once the host's game shows the condition met. */
function reached(done: Done, quest: Quest): boolean {
  if ("flag" in done) {
    return quest.flags[done.flag] === true;
  }
  if ("past" in done) {
    const [line, step] = done.past;
    return (quest.steps[line] ?? -1) > step;
  }
  return done.any.some((one) => reached(one, quest));
}

/** Whether a step is done, and whether the game says so (then it cannot be ticked by hand). */
interface StepState {
  done: boolean;
  fromGame: boolean;
}

interface StepProps {
  step: Step;
  state: StepState;
  onDone: (done: boolean) => void;
  act: Props["act"];
}

function StepBlock({ step, state, onDone, act }: StepProps) {
  return (
    <li className="guide-step" data-done={state.done}>
      <label className="guide-check" data-game={state.fromGame}>
        <input type="checkbox" checked={state.done} disabled={state.fromGame} onChange={(event) => onDone(event.target.checked)} />
        <h3>{say(step.title)}</h3>
        {state.fromGame && <span className="guide-source">{t("from the game", "d'après le jeu")}</span>}
      </label>
      {step.text?.map((paragraph) => <p key={paragraph[0]}>{say(paragraph)}</p>)}
      {step.points && (
        <ul>
          {step.points.map((point) => (
            <li key={point[0]}>{say(point)}</li>
          ))}
        </ul>
      )}
      {step.figure && (
        <figure className="guide-figure">
          <img src={step.figure.url} alt={say(step.figure.label)} loading="lazy" />
          <figcaption>{say(step.figure.label)}</figcaption>
        </figure>
      )}
      {step.table && (
        <div className="guide-table">
          <table>
            <thead>
              <tr>
                {step.table.head.map((cell) => (
                  <th key={cell[0]} scope="col">
                    {say(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {step.table.rows.map((row) => (
                <tr key={row.map((cell) => (typeof cell === "string" ? cell : cell[0])).join("|")}>
                  {row.map((cell, column) => (
                    <td key={column}>{sayCell(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {step.shots && <ShotGroups shots={step.shots} act={act} />}
    </li>
  );
}

interface PartProps {
  guide: MapGuide;
  part: Part;
  open: boolean;
  onToggle: () => void;
  stateOf: (step: Step, key: string) => StepState;
  onDone: (key: string, done: boolean) => void;
  act: Props["act"];
}

function PartBlock({ guide, part, open, onToggle, stateOf, onDone, act }: PartProps) {
  const ticked = part.steps.filter((step) => stateOf(step, stepKey(guide, part, step)).done).length;
  return (
    <div className="group fold">
      <button type="button" className="fold-head" aria-expanded={open} onClick={onToggle}>
        <ChevronRight16Regular aria-hidden="true" />
        <span>{say(part.title)}</span>
        <span className="fold-count" data-complete={ticked === part.steps.length}>
          {t(`${ticked} of ${part.steps.length}`, `${ticked} sur ${part.steps.length}`)}
        </span>
      </button>
      {open && (
        <ol className="guide-steps">
          {part.steps.map((step) => {
            const key = stepKey(guide, part, step);
            return <StepBlock key={key} step={step} state={stateOf(step, key)} onDone={(value) => onDone(key, value)} act={act} />;
          })}
        </ol>
      )}
    </div>
  );
}

/** The guide of the map being played, or of the first one. */
function guideOf(map: string | null | undefined): MapGuide {
  return GUIDES.find((guide) => guide.map === map) ?? (GUIDES[0] as MapGuide);
}

/** What the page says about where the ticks come from, or nothing when there is nothing to say. */
function followLine(view: View, chosen: MapGuide, live: Quest | null): string | null {
  if (live) {
    return t(
      "Followed from the game: you host this match, so the steps marked “from the game” tick themselves. Tick the others by hand.",
      "Suivi depuis le jeu : vous êtes l'hôte, les étapes marquées « d'après le jeu » se cochent seules. Cochez les autres à la main.",
    );
  }
  if (view.seat === "guest") {
    return t(
      "You are a guest: only the host's game knows where the easter egg is. Tick the steps by hand.",
      "Vous êtes invité : seul le jeu de l'hôte sait où en est le secret. Cochez les étapes à la main.",
    );
  }
  const playing = GUIDES.find((guide) => guide.code === view.quest?.map);
  if (playing && playing !== chosen) {
    return t(`The match is on ${playing.map}: this map's steps are ticked by hand.`, `La partie est sur ${playing.map} : les étapes de cette carte se cochent à la main.`);
  }
  return null;
}

/** Each map's main easter egg, written out step by step. As the host, the steps the game can tell tick themselves. */
export function Guide({ view, act }: Props) {
  // The map being played: from the iw7-mod script, otherwise from the host's game (also on Steam).
  const playing = view.map ?? GUIDES.find((guide) => guide.code === view.quest?.map)?.map ?? null;
  const [chosen, setChosen] = useState(() => guideOf(playing));
  const [opened, setOpened] = useState<string[]>([]);

  // Arriving on a map brings up its guide; choosing another one by hand stays until the next map.
  useEffect(() => {
    if (playing) {
      setChosen(guideOf(playing));
    }
  }, [playing]);

  const toggle = (key: string) => setOpened((all) => (all.includes(key) ? all.filter((other) => other !== key) : [...all, key]));

  const [done, setDone] = useState(readDone);
  const changeDone = (next: string[]) => {
    setDone(next);
    saveDone(next);
  };
  const tick = (key: string, value: boolean) => changeDone(value ? [...done.filter((other) => other !== key), key] : done.filter((other) => other !== key));

  // One list: as the host of this map, the game's word for the steps it can tell, the hand's for the rest.
  const live = view.quest && view.quest.map === chosen.code ? view.quest : null;
  const stateOf = (step: Step, key: string): StepState =>
    live && step.done ? { done: reached(step.done, live), fromGame: true } : { done: done.includes(key), fromGame: false };
  const steps = stepsOf(chosen).map((entry) => ({ ...entry, state: stateOf(entry.step, entry.key) }));
  const ticked = steps.filter(({ state }) => state.done).length;
  const next = steps.find(({ state }) => !state.done);
  const byHand = steps.filter(({ key, state }) => !state.fromGame && done.includes(key));
  const follow = followLine(view, chosen, live);

  return (
    <>
      <div className="guide-maps" role="group" aria-label={t("Map", "Carte")}>
        {GUIDES.map((guide) => (
          <button key={guide.map} type="button" className="btn" aria-pressed={guide === chosen} onClick={() => setChosen(guide)}>
            {guide.map}
          </button>
        ))}
      </div>

      <section>
        <h2>{say(chosen.quest)}</h2>
        <p className="guide-intro">{say(chosen.intro)}</p>
        <div className="guide-progress">
          <span>
            <b>{t(`${ticked} of ${steps.length} steps done.`, `${ticked} étapes faites sur ${steps.length}.`)}</b>{" "}
            {next ? t(`Next: ${next.step.title[0]}.`, `Prochaine : ${next.step.title[1]}.`) : t("All done.", "Tout est fait.")}
          </span>
          <button type="button" className="btn" disabled={byHand.length === 0} onClick={() => changeDone(done.filter((key) => !steps.some((step) => step.key === key)))}>
            {t("Untick this map", "Tout décocher sur cette carte")}
          </button>
        </div>
        {follow && (
          <p className="guide-follow" data-live={live !== null}>
            {follow}
          </p>
        )}
        {chosen.parts.map((part, index) => {
          const key = `${chosen.map}/${part.title[0]}`;
          // The part where the quest itself starts is open first.
          const open = opened.includes(key) !== (index === 1);
          return <PartBlock key={key} guide={chosen} part={part} open={open} onToggle={() => toggle(key)} stateOf={stateOf} onDone={tick} act={act} />;
        })}
        <p className="caption">
          {t("Places and objects keep their English names: the French game may write some of them differently. Pictures open in your browser. ", "Les lieux et objets gardent leur nom anglais : le jeu en français peut en écrire certains autrement. Les images s'ouvrent dans votre navigateur. ")}
          <ShotLink shot={{ label: ["Full guide with its side quests, by mmmrkennedy", "Guide complet avec ses quêtes annexes, par mmmrkennedy"], url: chosen.source }} act={act} icon />
        </p>
      </section>
    </>
  );
}
