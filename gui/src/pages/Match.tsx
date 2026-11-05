import { useState } from "react";
import { api, type Tweak, type View } from "../api";
import { Extras } from "../extras";
import { t } from "../i18n";
import { usePending, useToggles } from "../toggles";
import { formatNumber, Key, Legend, NumberBox, OptionRow, Row, Section, Slider } from "../ui";

interface Props {
  view: View;
  act: (command: Promise<void>) => void;
}

interface TweakRowProps {
  tweak: Tweak;
  disabled: boolean;
  act: (command: Promise<void>) => void;
}

/** Options turned on together by the "Quiet mode" preset. */
const QUIET_MODE = ["god_mode", "infinite_ammo", "infinite_money"];

/** A numeric setting: slider for rough changes, number box for the exact value, back to the original. */
function TweakRow({ tweak, disabled, act }: TweakRowProps) {
  const [value, hold] = usePending(tweak.value);
  // While the slider moves, the number box follows without sending anything to the game.
  const [dragged, setDragged] = useState<number | null>(null);
  const set = (next: number) => {
    if (next !== value) {
      hold(next);
      act(api.setTweak(tweak.key, next));
    }
  };
  const origin = `${formatNumber(tweak.default, tweak.step)}${tweak.unit && ` ${tweak.unit}`}`;
  return (
    <Row label={tweak.label} hint={tweak.hint} code={tweak.code} trial={tweak.trial} off={disabled}>
      <Slider label={tweak.label} value={value} min={tweak.min} max={tweak.max} step={tweak.step} disabled={disabled} onDraft={setDragged} onCommit={set} />
      <NumberBox label={tweak.label} value={dragged ?? value} min={tweak.min} max={tweak.max} step={tweak.step} unit={tweak.unit} disabled={disabled} onChange={set} />
      <button
        type="button"
        className="btn"
        data-quiet="true"
        data-hidden={value === tweak.default}
        disabled={disabled || value === tweak.default}
        title={t(`Original value: ${origin}`, `Valeur d'origine : ${origin}`)}
        onClick={() => set(tweak.default)}
      >
        {t("Reset", "Rétablir")}
      </button>
    </Row>
  );
}

/** The working page: options as a table, then the match's values and actions. */
export function Match({ view, act }: Props) {
  const [round, setRound] = useState(10);
  const { playing, isOn, canToggle, toggle } = useToggles(view, act);
  const position = view.savedPosition;
  const extras = view.modClient ? view.extras : [];
  const picks = view.modClient ? view.picks : [];
  const marked = [...view.groups.flatMap((group) => group.options), ...view.tweaks, ...[...view.actions, ...extras, ...picks].map((action) => ({ ...action, code: false }))];
  const quiet = view.groups.flatMap((group) => group.options).filter((option) => QUIET_MODE.includes(option.key));
  const quietOn = quiet.length > 0 && quiet.every((option) => isOn(option));

  return (
    <>
      <Section title={t("Presets", "Préréglages")}>
        <Row
          label={t("Quiet mode", "Mode tranquille")}
          hint={t("God mode, infinite ammo and infinite money, all at once. Each one turns off on its own.", "Invincibilité, munitions infinies et argent infini, d'un coup. Chacun se coupe séparément.")}
          off={!playing}
        >
          <button
            type="button"
            className="btn"
            disabled={!playing || quietOn}
            onClick={() => quiet.filter((option) => !isOn(option)).forEach((option) => toggle(option, true))}
          >
            {quietOn ? t("On", "Actif") : t("Turn on", "Activer")}
          </button>
        </Row>
      </Section>

      {view.groups
        .filter((group) => group.options.length > 0)
        .map((group) => (
          <Section key={group.title} title={group.title}>
            {group.options.map((option) => (
              <OptionRow
                key={option.key}
                label={option.label}
                hint={option.hint}
                code={option.code}
                trial={option.trial}
                hotkey={option.hotkey}
                on={isOn(option)}
                disabled={!canToggle(option)}
                onChange={(on) => toggle(option, on)}
              />
            ))}
          </Section>
        ))}
      <Legend code={marked.some((item) => item.code)} trial={marked.some((item) => item.trial)} />

      {view.tweaks.length > 0 && (
        <Section title={t("Values", "Valeurs")}>
          {view.tweaks.map((tweak) => (
            <TweakRow key={tweak.key} tweak={tweak} disabled={!playing} act={act} />
          ))}
        </Section>
      )}

      <Section title={t("Actions", "Actions")}>
        {view.actions.map((action) => (
          <Row key={action.key} label={action.label} hint={action.hint} trial={action.trial} off={!playing}>
            <button type="button" className="btn" disabled={!playing} onClick={() => act(api.runAction(action.key))}>
              {action.button}
            </button>
          </Row>
        ))}
        <Row label={t("Go to round", "Aller à une manche")} hint={t("Takes effect when the current round ends.", "Prend effet à la fin de la manche en cours.")} off={!playing}>
          <NumberBox label={t("Round", "Manche")} value={round} min={1} max={999} disabled={!playing} onChange={setRound} />
          <button type="button" className="btn" disabled={!playing} onClick={() => act(api.setRound(round))}>
            {t("Go", "Y aller")}
          </button>
        </Row>
        <Row
          label={t("Saved position", "Position enregistrée")}
          hint={
            position
              ? t(`Coordinates ${position.map((axis) => formatNumber(Math.round(axis))).join(", ")}.`, `Coordonnées ${position.map((axis) => formatNumber(Math.round(axis))).join(" ; ")}.`)
              : t("None yet. Save where you are to come back to it.", "Aucune pour l'instant. Enregistrez l'endroit où vous êtes pour y revenir.")
          }
          off={!playing}
        >
          <button type="button" className="btn" disabled={!playing} onClick={() => act(api.savePosition())}>
            {t("Save", "Enregistrer")}
            <Key name={view.keys.savePosition} />
          </button>
          <button type="button" className="btn" disabled={!playing || !position} onClick={() => act(api.teleport())}>
            {t("Go back", "Y revenir")}
            <Key name={view.keys.teleport} />
          </button>
        </Row>
      </Section>

      {view.modClient && <Extras view={view} playing={playing} act={act} />}
    </>
  );
}
