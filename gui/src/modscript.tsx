import { api, type View } from "./api";
import { t } from "./i18n";
import { Row } from "./ui";

interface Props {
  state: View["modScript"];
  act: (command: Promise<void>) => void;
}

/** The script behind the iw7-mod extras: where it stands, and the button to put it in place. */
export function ModScriptRow({ state, act }: Props) {
  const hint = {
    none: t("iw7-mod is not in the game folder: put it there first (iw7-mod.exe next to iw7_ship.exe).", "iw7-mod n'est pas dans le dossier du jeu : placez-le d'abord là-bas (iw7-mod.exe à côté de iw7_ship.exe)."),
    missing: t("Not installed yet. Without it, the extras do not respond. Takes effect at the next match.", "Pas encore installé. Sans lui, les extras ne répondent pas. Effet à la prochaine partie."),
    outdated: t("Another version is installed: update it so the extras match this tool. Takes effect at the next match.", "Une autre version est installée : mettez-la à jour pour que les extras correspondent à cet outil. Effet à la prochaine partie."),
    current: t("Installed and up to date.", "Installé et à jour."),
  }[state];
  return (
    <Row label={t("Extras script", "Script des extras")} hint={hint} off={state === "none"}>
      {(state === "missing" || state === "outdated") && (
        <button type="button" className="btn" data-accent="true" onClick={() => act(api.installModScript())}>
          {state === "missing" ? t("Install", "Installer") : t("Update", "Mettre à jour")}
        </button>
      )}
    </Row>
  );
}
