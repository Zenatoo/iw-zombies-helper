import { ChevronRight16Regular, Image16Regular, Open16Regular } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { api, type View } from "../api";
import { type Cell, GUIDES, type MapGuide, type Part, type Shot, type Step, type Text } from "../guideData";
import { t } from "../i18n";

interface Props {
  view: View;
  act: (command: Promise<void>) => void;
}

const say = ([english, french]: Text) => t(english, french);
const sayCell = (cell: Cell) => (typeof cell === "string" ? cell : say(cell));

/** A picture on the web: it opens in the browser, next to the game. */
function ShotLink({ shot, act, icon }: { shot: Shot; act: Props["act"]; icon?: boolean }) {
  const Icon = icon ? Open16Regular : Image16Regular;
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
      <Icon aria-hidden="true" />
      {say(shot.label)}
    </a>
  );
}

function StepBlock({ step, act }: { step: Step; act: Props["act"] }) {
  return (
    <li className="guide-step">
      <h3>{say(step.title)}</h3>
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
      {step.shots && (
        <div className="guide-shots">
          {step.shots.map((shot) => (
            <ShotLink key={shot.url} shot={shot} act={act} />
          ))}
        </div>
      )}
    </li>
  );
}

function PartBlock({ part, open, onToggle, act }: { part: Part; open: boolean; onToggle: () => void; act: Props["act"] }) {
  return (
    <div className="group fold">
      <button type="button" className="fold-head" aria-expanded={open} onClick={onToggle}>
        <ChevronRight16Regular aria-hidden="true" />
        <span>{say(part.title)}</span>
        <span className="fold-count">{part.steps.length}</span>
      </button>
      {open && (
        <ol className="guide-steps">
          {part.steps.map((step) => (
            <StepBlock key={step.title[0]} step={step} act={act} />
          ))}
        </ol>
      )}
    </div>
  );
}

/** The guide of the map being played, or of the first one. */
function guideOf(map: string | null | undefined): MapGuide {
  return GUIDES.find((guide) => guide.map === map) ?? (GUIDES[0] as MapGuide);
}

/** Each map's main easter egg, written out step by step. It reads the game's state for nothing but the map. */
export function Guide({ view, act }: Props) {
  const [chosen, setChosen] = useState(() => guideOf(view.map));
  const [opened, setOpened] = useState<string[]>([]);

  // Arriving on a map brings up its guide; choosing another one by hand stays until the next map.
  useEffect(() => {
    if (view.map) {
      setChosen(guideOf(view.map));
    }
  }, [view.map]);

  const toggle = (key: string) => setOpened((all) => (all.includes(key) ? all.filter((other) => other !== key) : [...all, key]));

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
        {chosen.parts.map((part, index) => {
          const key = `${chosen.map}/${part.title[0]}`;
          // The part where the quest itself starts is open first.
          const open = opened.includes(key) !== (index === 1);
          return <PartBlock key={key} part={part} open={open} onToggle={() => toggle(key)} act={act} />;
        })}
        <p className="caption">
          {t("Places and objects keep their English names: the French game may write some of them differently. Pictures open in your browser. ", "Les lieux et objets gardent leur nom anglais : le jeu en français peut en écrire certains autrement. Les images s'ouvrent dans votre navigateur. ")}
          <ShotLink shot={{ label: ["Full guide with its side quests, by mmmrkennedy", "Guide complet avec ses quêtes annexes, par mmmrkennedy"], url: chosen.source }} act={act} icon />
        </p>
      </section>
    </>
  );
}
