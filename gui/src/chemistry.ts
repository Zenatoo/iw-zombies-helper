// Attack of the Radioactive Thing's chemistry, as the game's own tables have it (cp\zombies\compounds.csv and
// elements.csv): what each product is called, the board that shows its diamond, and what each reaction takes.
import type { Text } from "./guideData";

export interface Product {
  /** As it reads inside a sentence. */
  name: Text;
  /** The French name with its article, inside a sentence. */
  the: string;
  board: Text;
}

const SPAWN: Text = ["spawn", "départ"];
const POWER: Text = ["Power Station", "Power Station"];
const RV: Text = ["RV Park", "RV Park"];
const BEACH: Text = ["beach", "plage"];
const GAS: Text = ["Gas Station", "station-service"];
const TV: Text = ["TV Studio", "studio de télé"];

export const PRODUCTS = {
  racingFuel: { name: ["Racing Fuel", "carburant"], the: "le carburant", board: SPAWN },
  vodka: { name: ["Vodka", "vodka"], the: "la vodka", board: SPAWN },
  bakingSoda: { name: ["Baking Soda", "bicarbonate"], the: "le bicarbonate", board: SPAWN },
  detergent: { name: ["Detergent", "lessive"], the: "la lessive", board: SPAWN },
  insectRepellent: { name: ["Insect Repellent", "anti-insectes"], the: "l'anti-insectes", board: SPAWN },
  quarters: { name: ["Quarters", "pièces de 25 cents"], the: "les pièces de 25 cents", board: POWER },
  glassCleaner: { name: ["Glass Cleaner", "nettoyant vitres"], the: "le nettoyant vitres", board: POWER },
  pennies: { name: ["Pennies", "pennies"], the: "les pennies", board: POWER },
  nailPolishRemover: { name: ["Nail Polish Remover", "dissolvant"], the: "le dissolvant", board: POWER },
  drainOpener: { name: ["Drain Opener", "déboucheur"], the: "le déboucheur", board: POWER },
  ice: { name: ["Ice", "glace"], the: "la glace", board: RV },
  vinegar: { name: ["Vinegar", "vinaigre"], the: "le vinaigre", board: RV },
  plantFood: { name: ["Plant Food", "engrais"], the: "l'engrais", board: RV },
  paint: { name: ["Paint", "peinture"], the: "la peinture", board: RV },
  motorOil: { name: ["Motor Oil", "huile moteur"], the: "l'huile moteur", board: BEACH },
  wheelCleaner: { name: ["Wheel Cleaner", "nettoyant jantes"], the: "le nettoyant jantes", board: BEACH },
  fat: { name: ["Fat", "graisse"], the: "la graisse", board: BEACH },
  formaldehyde: { name: ["Formaldehyde", "formaldéhyde"], the: "le formaldéhyde", board: GAS },
  hexamine: { name: ["Hexamine", "hexamine"], the: "l'hexamine", board: GAS },
  phenol: { name: ["Phenol", "phénol"], the: "le phénol", board: GAS },
  phenolsulfonic: { name: ["Phenolsulfonic Acid", "acide phénolsulfonique"], the: "l'acide phénolsulfonique", board: GAS },
  aldehydeSludge: { name: ["Aldehyde Sludge", "boue d'aldéhyde"], the: "la boue d'aldéhyde", board: GAS },
  dinitro: { name: ["Dinitro", "dinitro"], the: "le dinitro", board: GAS },
  acetaldehyde: { name: ["Acetaldehyde", "acétaldéhyde"], the: "l'acétaldéhyde", board: TV },
  methylbenzene: { name: ["Methylbenzene", "méthylbenzène"], the: "le méthylbenzène", board: TV },
  // The final products are never put on the table, so their board does not matter.
  tnp: { name: ["1,3,5 tera-nitro-phenol", "1,3,5 tera-nitro-phenol"], the: "le 1,3,5 tera-nitro-phenol", board: GAS },
  tnt: { name: ["3-methyl-2,4-di-nitrobenzene", "3-methyl-2,4-di-nitrobenzene"], the: "le 3-methyl-2,4-di-nitrobenzene", board: GAS },
  hmx: { name: ["Octa-hydro-2,5-nitro-3,4,7-para-zokine", "Octa-hydro-2,5-nitro-3,4,7-para-zokine"], the: "l'Octa-hydro-2,5-nitro-3,4,7-para-zokine", board: GAS },
  petn: { name: ["3,4-di-nitroxy-methyl-propane", "3,4-di-nitroxy-methyl-propane"], the: "le 3,4-di-nitroxy-methyl-propane", board: GAS },
} satisfies Record<string, Product>;

export type ProductKey = keyof typeof PRODUCTS;

/** What each reaction takes, by the product it makes. */
export const REACTIONS: Partial<Record<ProductKey, ProductKey[]>> = {
  formaldehyde: ["racingFuel", "quarters"],
  acetaldehyde: ["vodka", "pennies"],
  aldehydeSludge: ["formaldehyde", "acetaldehyde", "detergent"],
  petn: ["aldehydeSludge", "nailPolishRemover"],
  phenol: ["insectRepellent", "motorOil", "wheelCleaner"],
  phenolsulfonic: ["phenol", "drainOpener"],
  tnp: ["phenolsulfonic", "detergent"],
  hexamine: ["formaldehyde", "glassCleaner"],
  hmx: ["hexamine", "vinegar", "detergent", "plantFood"],
  methylbenzene: ["paint", "detergent", "drainOpener"],
  dinitro: ["detergent", "bakingSoda", "vinegar", "methylbenzene"],
  tnt: ["dinitro", "racingFuel"],
};

/** The four the game can ask for, the quickest to make first. */
export const FINALS: ProductKey[] = ["tnp", "tnt", "hmx", "petn"];

/** The reactions that make a product, in the order they must be run. */
export function chainOf(product: ProductKey): ProductKey[] {
  const order: ProductKey[] = [];
  const visit = (key: ProductKey) => {
    const inputs = REACTIONS[key];
    if (!inputs || order.includes(key)) {
      return;
    }
    inputs.forEach(visit);
    order.push(key);
  };
  visit(product);
  return order;
}

/** The keypad's number: both numbers of every diamond put on the table, added up, minus O. */
export function reactionNumber(diamonds: [number, number][], o: number): number {
  return diamonds.reduce((sum, [left, top]) => sum + left + top, 0) - o;
}

/** The possible values of O. */
export const O_VALUES = [2, 4, 8, 9, 11, 15];
