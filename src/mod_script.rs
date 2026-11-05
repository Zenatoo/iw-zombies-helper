//! The iw7-mod script (`iw_helper.gsc`) in the game folder. It only makes sense next to iw7-mod, which
//! must itself be in the game folder: the tool installs its own script there, never iw7-mod.

use crate::config::MOD_CLIENT;
use std::path::{Path, PathBuf};
use std::{fs, io};

/// The script of this version of the tool: what is installed must match it, their commands go together.
const SCRIPT: &str = include_str!("../iw7-mod/custom_scripts/cp/iw_helper.gsc");

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum State {
    /// iw7-mod is not in the game folder: nothing to install the script for.
    NoClient,
    Missing,
    /// Another version is installed.
    Outdated,
    Current,
}

impl State {
    /// Name the pages read.
    pub fn key(self) -> &'static str {
        match self {
            State::NoClient => "none",
            State::Missing => "missing",
            State::Outdated => "outdated",
            State::Current => "current",
        }
    }
}

fn script_path(game_folder: &Path) -> PathBuf {
    game_folder.join("iw7-mod").join("custom_scripts").join("cp").join("iw_helper.gsc")
}

/// The same script, whatever the line endings the copy was made with.
fn same_script(installed: &[u8]) -> bool {
    let without_returns = |bytes: &[u8]| bytes.iter().copied().filter(|&byte| byte != b'\r').collect::<Vec<u8>>();
    without_returns(installed) == without_returns(SCRIPT.as_bytes())
}

pub fn state(game_folder: &Path) -> State {
    if !game_folder.join(MOD_CLIENT).is_file() {
        return State::NoClient;
    }
    match fs::read(script_path(game_folder)) {
        Ok(installed) if same_script(&installed) => State::Current,
        Ok(_) => State::Outdated,
        Err(_) => State::Missing,
    }
}

/// Puts this version's script in place. Written beside it then renamed: a failed write leaves the
/// script already there untouched.
pub fn install(game_folder: &Path) -> io::Result<()> {
    let path = script_path(game_folder);
    if let Some(folder) = path.parent() {
        fs::create_dir_all(folder)?;
    }
    let temporary = path.with_extension("gsc.tmp");
    fs::write(&temporary, SCRIPT)?;
    fs::rename(&temporary, &path).inspect_err(|_| {
        let _ = fs::remove_file(&temporary);
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_script_follows_the_client_and_its_version() {
        let folder = std::env::temp_dir().join(format!("iw-helper-script-{}", std::process::id()));
        fs::create_dir_all(&folder).unwrap();
        // Without iw7-mod in the game folder, nothing to install it for.
        assert_eq!(state(&folder), State::NoClient);
        fs::write(folder.join(MOD_CLIENT), b"").unwrap();
        assert_eq!(state(&folder), State::Missing);
        install(&folder).unwrap();
        assert_eq!(state(&folder), State::Current);
        // The folder holds nothing but the script: no temporary file is left.
        let names: Vec<_> = fs::read_dir(script_path(&folder).parent().unwrap()).unwrap().map(|entry| entry.unwrap().file_name()).collect();
        assert_eq!(names, ["iw_helper.gsc"]);
        // Another version is seen, and replaced; other line endings are not another version.
        fs::write(script_path(&folder), "init() {}").unwrap();
        assert_eq!(state(&folder), State::Outdated);
        install(&folder).unwrap();
        assert_eq!(state(&folder), State::Current);
        let other_endings = SCRIPT.replace("\r\n", "\n").replace('\n', "\r\n");
        fs::write(script_path(&folder), other_endings).unwrap();
        assert_eq!(state(&folder), State::Current);
        fs::remove_dir_all(&folder).unwrap();
    }
}
