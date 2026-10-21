//! The window that asks which game to start, when Steam starts the tool on an install that also has
//! iw7-mod. A Windows task dialog: it opens before the interface, so the game never waits for the web
//! view.

use iw_helper::config::LaunchGame;
use iw_helper::lang::tr;
use windows_sys::Win32::Foundation::BOOL;
use windows_sys::Win32::UI::Controls::{TaskDialogIndirect, TASKDIALOGCONFIG, TASKDIALOG_BUTTON, TDF_ALLOW_DIALOG_CANCELLATION, TDF_USE_COMMAND_LINKS, TD_INFORMATION_ICON};

const STEAM_BUTTON: i32 = 100;
const MOD_BUTTON: i32 = 101;

/// What the person chose.
pub struct Answer {
    /// `None` when the window was closed: nothing starts.
    pub game: Option<LaunchGame>,
    /// "Remember this choice" was ticked.
    pub remember: bool,
}

pub fn ask() -> Answer {
    let wide = |text: &str| text.encode_utf16().chain(Some(0)).collect::<Vec<u16>>();
    let title = wide("iw-helper");
    let instruction = wide(tr("Which game to start?", "Quel jeu lancer ?"));
    let content = wide(tr("iw7-mod is in the game folder.", "iw7-mod est présent dans le dossier du jeu."));
    // The text after the line break is the button's second, smaller line.
    let steam = wide(tr(
        "Infinite Warfare (Steam)\nThe game as Steam starts it.",
        "Infinite Warfare (Steam)\nLe jeu tel que Steam le lance.",
    ));
    let iw7_mod = wide(tr(
        "iw7-mod\nThe community client, with the extras of the iw_helper.gsc script.",
        "iw7-mod\nLe client communautaire, avec les extras du script iw_helper.gsc.",
    ));
    let remember = wide(tr("Remember this choice (Settings page to change it)", "Retenir ce choix (modifiable dans Réglages)"));
    let buttons = [
        TASKDIALOG_BUTTON { nButtonID: STEAM_BUTTON, pszButtonText: steam.as_ptr() },
        TASKDIALOG_BUTTON { nButtonID: MOD_BUTTON, pszButtonText: iw7_mod.as_ptr() },
    ];

    // SAFETY: every field the dialog reads is set below; the others are null or zero, which the
    // API reads as "none". The texts and buttons outlive the call.
    let mut config: TASKDIALOGCONFIG = unsafe { std::mem::zeroed() };
    config.cbSize = std::mem::size_of::<TASKDIALOGCONFIG>() as u32;
    config.dwFlags = TDF_USE_COMMAND_LINKS | TDF_ALLOW_DIALOG_CANCELLATION;
    config.pszWindowTitle = title.as_ptr();
    config.Anonymous1.pszMainIcon = TD_INFORMATION_ICON;
    config.pszMainInstruction = instruction.as_ptr();
    config.pszContent = content.as_ptr();
    config.cButtons = buttons.len() as u32;
    config.pButtons = buttons.as_ptr();
    config.nDefaultButton = STEAM_BUTTON;
    config.pszVerificationText = remember.as_ptr();

    let (mut pressed, mut ticked): (i32, BOOL) = (0, 0);
    // SAFETY: `config` is a complete TASKDIALOGCONFIG; the output pointers are valid locals.
    let result = unsafe { TaskDialogIndirect(&config, &mut pressed, std::ptr::null_mut(), &mut ticked) };
    let game = match (result, pressed) {
        (0, STEAM_BUTTON) => Some(LaunchGame::Steam),
        (0, MOD_BUTTON) => Some(LaunchGame::Mod),
        _ => None,
    };
    Answer { game, remember: game.is_some() && ticked != 0 }
}
