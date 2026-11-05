import { ChevronRight16Regular } from "@fluentui/react-icons";
import { useState } from "react";
import { api, type Action, type Pick, type View } from "./api";
import { t } from "./i18n";
import { ModScriptRow } from "./modscript";
import { Choice, Row } from "./ui";

interface Props {
  view: View;
  playing: boolean;
  act: (command: Promise<void>) => void;
}

/** One row of a group: an action, or a list reduced to the choices still shown. */
type Item = { action: Action } | { pick: Pick; options: Pick["options"] };

/** The groups open until the person changes them, then what they left open. */
const OPEN_FIRST = ["easter_egg"];
const OPEN_STORED = "iwh-extras-open";

function readOpen(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(OPEN_STORED) ?? "null");
    return Array.isArray(stored) ? stored : OPEN_FIRST;
  } catch {
    return OPEN_FIRST;
  }
}

function saveOpen(open: string[]) {
  try {
    localStorage.setItem(OPEN_STORED, JSON.stringify(open));
  } catch {
    // Only a convenience: the groups go back to their first state at the next opening.
  }
}

/** Lower case, without accents: typing "pieges" finds "pièges". */
function plain(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * The item as the search leaves it, or nothing. A row whose name or hint matches keeps all its
 * choices; otherwise a list stays with the choices that match, so "dischord" is ready to be sent.
 */
function searched(item: Item, wanted: string): Item | null {
  const row = "action" in item ? item.action : item.pick;
  if (plain(row.label).includes(wanted) || plain(row.hint).includes(wanted)) {
    return item;
  }
  if ("pick" in item) {
    const options = item.options.filter((option) => plain(option.label).includes(wanted));
    return options.length > 0 ? { pick: item.pick, options } : null;
  }
  return null;
}

interface PickRowProps {
  pick: Pick;
  options: Pick["options"];
  disabled: boolean;
  act: Props["act"];
}

/** A choice from one of the script's lists, sent with its button; the choice stays for the next time. */
function PickRow({ pick, options, disabled, act }: PickRowProps) {
  const [index, setIndex] = useState(options[0]?.index ?? 0);
  const chosen = options.find((option) => option.index === index) ?? options[0];
  if (!chosen) {
    return null;
  }
  return (
    <Row label={pick.label} hint={pick.hint} trial={pick.trial} off={disabled}>
      <Choice
        label={pick.label}
        value={options.indexOf(chosen)}
        options={options.map((option) => option.label)}
        disabled={disabled}
        onChange={(position) => setIndex(options[position]?.index ?? index)}
      />
      <button type="button" className="btn" disabled={disabled} onClick={() => act(api.runPick(pick.key, chosen.index))}>
        {pick.button}
      </button>
    </Row>
  );
}

/** The iw7-mod extras: one search for everything, then groups that fold away. */
export function Extras({ view, playing, act }: Props) {
  const [open, setOpen] = useState(readOpen);
  const [search, setSearch] = useState("");
  const wanted = plain(search.trim());
  const searching = wanted !== "";

  const items = new Map<string, Item>();
  view.extras.forEach((action) => items.set(action.key, { action }));
  // A list with nothing for this map has no row.
  view.picks.filter((pick) => pick.options.length > 0).forEach((pick) => items.set(pick.key, { pick, options: pick.options }));

  const groups = view.extraGroups.map((group) => {
    const inGroup = group.items.flatMap((key) => items.get(key) ?? []);
    // Searching for a group's name shows the whole group.
    const shown = !searching || plain(group.title).includes(wanted) ? inGroup : inGroup.flatMap((item) => searched(item, wanted) ?? []);
    return { ...group, shown };
  });
  const visible = groups.filter((group) => group.shown.length > 0);

  const toggle = (key: string) => {
    const next = open.includes(key) ? open.filter((other) => other !== key) : [...open, key];
    setOpen(next);
    saveOpen(next);
  };

  return (
    <section>
      <h2>{t("iw7-mod extras", "Extras iw7-mod")}</h2>
      {view.modScript !== "current" && (
        <div className="group fold">
          <ModScriptRow state={view.modScript} act={act} />
        </div>
      )}
      <input
        type="search"
        className="search extras-search"
        aria-label={t("Search the extras", "Rechercher dans les extras")}
        placeholder={t("Search an extra, a weapon, a card, a zombie…", "Rechercher un extra, une arme, une carte, un zombie…")}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      {visible.map((group) => {
        const unfolded = searching || open.includes(group.key);
        return (
          <div key={group.key} className="group fold">
            <button type="button" className="fold-head" aria-expanded={unfolded} disabled={searching} onClick={() => toggle(group.key)}>
              <ChevronRight16Regular aria-hidden="true" />
              <span>{group.title}</span>
              <span className="fold-count">{group.shown.length}</span>
            </button>
            {unfolded &&
              group.shown.map((item) =>
                "action" in item ? (
                  <Row key={item.action.key} label={item.action.label} hint={item.action.hint} trial={item.action.trial} off={!playing}>
                    <button type="button" className="btn" disabled={!playing} onClick={() => act(api.runAction(item.action.key))}>
                      {item.action.button}
                    </button>
                  </Row>
                ) : (
                  <PickRow key={item.pick.key} pick={item.pick} options={item.options} disabled={!playing} act={act} />
                ),
              )}
          </div>
        );
      })}
      {searching && visible.length === 0 && (
        <p className="caption">
          {t(`Nothing matches "${search.trim()}". Only what this map has is listed: try a shorter word.`, `Rien ne correspond à « ${search.trim()} ». Seul ce que cette carte possède est proposé : essayez un mot plus court.`)}
        </p>
      )}
      <p className="caption">
        {view.map
          ? t(`Map: ${view.map}. Only what has a use on it is listed.`, `Carte : ${view.map}. Seul ce qui sert sur cette carte est proposé.`)
          : t(
              "Carried out by the iw_helper.gsc script, which iw7-mod loads from its custom_scripts folder: see the README, iw7-mod extras.",
              "Réalisés par le script iw_helper.gsc, qu'iw7-mod charge depuis son dossier custom_scripts : voir le README, iw7-mod extras.",
            )}
      </p>
    </section>
  );
}
