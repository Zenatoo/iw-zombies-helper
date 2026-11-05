import { useState } from "react";
import { api } from "../api";
import { chainOf, FINALS, O_VALUES, PRODUCTS, type ProductKey, REACTIONS, reactionNumber } from "../chemistry";
import { t } from "../i18n";
import { Choice, Row, Section, Segmented } from "../ui";

/** What the person typed, kept until they start a new match. */
interface Sheet {
  o: number | null;
  final: ProductKey;
  diamonds: Partial<Record<ProductKey, [string, string]>>;
}

const STORED = "iwh-chemistry";
const EMPTY: Sheet = { o: null, final: "tnp", diamonds: {} };

function readSheet(): Sheet {
  try {
    const stored = JSON.parse(localStorage.getItem(STORED) ?? "null") as Sheet | null;
    return stored && FINALS.includes(stored.final) ? { ...EMPTY, ...stored } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function saveSheet(sheet: Sheet) {
  try {
    localStorage.setItem(STORED, JSON.stringify(sheet));
  } catch {
    // Only a convenience: the numbers are typed again if the window forgets them.
  }
}

const name = (key: ProductKey) => t(...PRODUCTS[key].name);
const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** One number of a diamond: a single digit, or empty while not read yet. */
function Digit({ label, corner, value, onChange }: { label: string; corner: "red" | "blue"; value: string; onChange: (value: string) => void }) {
  return (
    <span className="numberbox chem-digit" data-corner={corner}>
      <input
        type="text"
        inputMode="numeric"
        maxLength={1}
        aria-label={label}
        placeholder={label}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(-1))}
        onFocus={(event) => event.target.select()}
      />
    </span>
  );
}

/**
 * The sums of Attack of the Radioactive Thing's chemistry. It reads nothing from the game and changes
 * nothing in it: the person types what the boards show, the page does the addition.
 */
export function Chemistry({ act }: { act: (command: Promise<void>) => void }) {
  const [sheet, setSheet] = useState(readSheet);
  const change = (next: Sheet) => {
    setSheet(next);
    saveSheet(next);
  };
  const setDigit = (key: ProductKey, side: 0 | 1, value: string) => {
    const pair: [string, string] = [...(sheet.diamonds[key] ?? ["", ""])];
    pair[side] = value;
    change({ ...sheet, diamonds: { ...sheet.diamonds, [key]: pair } });
  };

  const diamond = "https://mmmrkennedyzombiesguides.pages.dev/games/IW/attack_of_the_radioactive_thing/pictures/main_ee/chemical_diamond_with_arrow.webp";
  return (
    <>
      <div className="chem-how">
        <p>
          {t(
            "Each ingredient has a diamond on the boards, with four numbers. Copy two of them below: the red one (top) and the blue one (left). The page adds them up and gives one code per reaction, to type once on the garage's keypad.",
            "Chaque ingrédient a un losange sur les tableaux, avec quatre chiffres. Recopiez-en deux ci-dessous : le rouge (en haut) et le bleu (à gauche). La page les additionne et donne un code par réaction, à taper une seule fois sur le clavier du garage.",
          )}
        </p>
        <a
          className="guide-link"
          href={diamond}
          onClick={(event) => {
            event.preventDefault();
            act(api.openLink(diamond));
          }}
        >
          {t("See a diamond", "Voir un losange")}
        </a>
      </div>
      <Section
        title={t("This match", "Cette partie")}
        note={t(
          "This page only adds up what you type: it reads nothing from the game. How to find O and the boards' numbers: Guide page, Radioactive Thing.",
          "Cette page ne fait qu'additionner ce que vous tapez : elle ne lit rien du jeu. Pour trouver O et les nombres des tableaux : page Guide, Radioactive Thing.",
        )}
      >
        <Row label={t("Number O", "Nombre O")} hint={t("The one that keeps « = » with the map in red, green and blue.", "Celui qui garde « = » avec la carte en rouge, en vert et en bleu.")}>
          <Segmented
            label={t("Number O", "Nombre O")}
            value={sheet.o === null ? "" : String(sheet.o)}
            choices={O_VALUES.map((value) => ({ value: String(value), label: String(value) }))}
            onChange={(value) => change({ ...sheet, o: Number(value) })}
          />
        </Row>
        <Row label={t("Final chemical", "Produit final")} hint={t("The one the radio names, or the next one to try.", "Celui que nomme la radio, ou le prochain à essayer.")}>
          <Choice
            label={t("Final chemical", "Produit final")}
            value={FINALS.indexOf(sheet.final)}
            options={FINALS.map(name)}
            onChange={(index) => change({ ...sheet, final: FINALS[index] ?? sheet.final })}
          />
        </Row>
        <Row label={t("New match", "Nouvelle partie")} hint={t("O and the boards change every match.", "O et les tableaux changent à chaque partie.")}>
          <button type="button" className="btn" onClick={() => change({ ...EMPTY, final: sheet.final })}>
            {t("Clear everything", "Tout effacer")}
          </button>
        </Row>
      </Section>

      {chainOf(sheet.final).map((made, index) => {
        const inputs = REACTIONS[made] ?? [];
        const pairs = inputs.map((key) => sheet.diamonds[key] ?? ["", ""]);
        const complete = sheet.o !== null && pairs.every(([left, top]) => left !== "" && top !== "");
        const number = complete ? reactionNumber(pairs.map(([left, top]) => [Number(left), Number(top)]), sheet.o ?? 0) : null;
        return (
          <Section key={made} title={t(`Reaction ${index + 1}: ${name(made)}`, `Réaction ${index + 1} : ${name(made)}`)}>
            {inputs.map((key) => {
              const [left, top] = sheet.diamonds[key] ?? ["", ""];
              return (
                <Row key={key} label={capital(name(key))} hint={t(`Board: ${PRODUCTS[key].board[0]}`, `Tableau : ${PRODUCTS[key].board[1]}`)}>
                  <span className="chem-digits">
                    <Digit label={t("red", "rouge")} corner="red" value={top} onChange={(value) => setDigit(key, 1, value)} />
                    <span aria-hidden="true">+</span>
                    <Digit label={t("blue", "bleu")} corner="blue" value={left} onChange={(value) => setDigit(key, 0, value)} />
                    <span className="chem-subtotal">{left !== "" && top !== "" ? `= ${Number(left) + Number(top)}` : ""}</span>
                  </span>
                </Row>
              );
            })}
            <Row
              label={t("Code to type on the keypad", "Code à taper au clavier")}
              hint={
                number === null
                  ? sheet.o === null
                    ? t("Choose O first.", "Choisissez d'abord O.")
                    : t("Copy the red and the blue of every ingredient above.", "Recopiez le rouge et le bleu de chaque ingrédient ci-dessus.")
                  : number < 0 || number > 99
                    ? t("The keypad can't take this number: check the digits and O.", "Le clavier ne peut pas prendre ce nombre : vérifiez les chiffres et O.")
                    : number < 10
                      ? t(`Sum of the ingredients minus O. A single digit: press it once, then the big button.`, `Somme des ingrédients moins O. Un seul chiffre : appuyez dessus une fois, puis sur le gros bouton.`)
                      : t("Sum of the ingredients minus O. Press both digits, then the big button.", "Somme des ingrédients moins O. Appuyez sur les deux chiffres, puis sur le gros bouton.")
              }
            >
              <span className="chem-result" data-empty={number === null}>
                {number ?? "–"}
              </span>
            </Row>
          </Section>
        );
      })}
      <p className="caption">
        {t(
          "A product used twice keeps the numbers typed the first time. The garage then gives the product made: take it for the next reaction, or to the bomb for the final one.",
          "Un produit utilisé deux fois garde les nombres tapés la première fois. Le garage donne ensuite le produit fabriqué : prenez-le pour la réaction suivante, ou jusqu'à la bombe pour le dernier.",
        )}
      </p>
    </>
  );
}
