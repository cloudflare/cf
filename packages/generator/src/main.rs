//! cf's command generator: writes a yargs command for every operation of
//! the Cloudflare API, in TypeScript, from forge's model of the OpenAPI
//! document.
//!
//! ```text
//! cf-generator openapi.json --config hand-written.json --out src/commands/_generated
//! ```
//!
//! The commands follow forge's model: a command for each top-level group,
//! and a leaf command for each method, named in kebab-case. What each
//! command takes and sends is resolved from the method by the rules cf's
//! first generator followed when it read the OpenAPI document itself, in
//! `operation.rs` and `body.rs`. The commands send their requests through
//! cf's runtime library, `#api` (`src/api/`), which the generator doesn't
//! write.
//!
//! Each top-level group's commands are generated in parallel: what a
//! command's files say depends on its own operations alone. The files that
//! list every command are generated once. `--config` is the JSON of cf's
//! hand-written commands and their metadata, `{ handWritten, sidecars }`,
//! which are spliced into the generated tree.

use std::fs;
use std::iter;
use std::path::PathBuf;
use std::process::ExitCode;

use forge::{Err, Forge, Group, Plugin};

mod args;
mod body;
mod commands;
mod emit;
mod files;
mod hand_written;
mod js;
mod operation;
#[cfg(test)]
mod test_support;

use files::{Operations, Out};
use hand_written::HandWritten;

/// The generator, with cf's hand-written commands.
struct Cli {
    hand: HandWritten,
}

/// The resolved operations of the methods of `groups`.
fn operations<'f>(groups: impl Iterator<Item = Group<'f>>) -> Operations {
    groups
        .flat_map(|group| group.methods())
        .map(|method| (commands::operation_id(method), operation::resolve(method)))
        .collect()
}

impl Plugin for Cli {
    type File = Out;

    /// Generates the files that list every command: the root index and the
    /// metadata.
    fn generate(&self, forge: &Forge) -> Result<impl Iterator<Item = Out>, Err> {
        let commands = commands::commands(forge)?;
        Ok(files::metadata_files(&operations(forge.groups()), commands, &self.hand)?.into_iter())
    }

    /// Generates the files of the command of `group`, if it is a top-level
    /// group: a module for each of its leaves, and an index for it and each
    /// of its groups.
    fn generate_group(&self, group: Group<'_>) -> Result<impl Iterator<Item = Out>, Err> {
        if group.parent().is_some() {
            return Ok(Vec::new().into_iter());
        }
        let ops = operations(iter::once(group).chain(group.descendants()));
        let command = commands::command(group, &mut Vec::new());
        Ok(files::command_files(&ops, &command, &self.hand)?.into_iter())
    }
}

/// What the command line asks for.
struct Args {
    spec: PathBuf,
    config: PathBuf,
    out: PathBuf,
}

const USAGE: &str = "usage: cf-generator <openapi.json> --config <hand-written.json> --out <dir>";

impl Args {
    fn parse(mut args: impl Iterator<Item = String>) -> Result<Args, String> {
        let (mut spec, mut config, mut out) = (None, None, None);
        while let Some(arg) = args.next() {
            let slot = match arg.as_str() {
                "--config" => &mut config,
                "--out" => &mut out,
                _ if !arg.starts_with("--") && spec.is_none() => {
                    spec = Some(PathBuf::from(arg));
                    continue;
                }
                _ => return Err(format!("unexpected argument {arg:?}\n{USAGE}")),
            };
            *slot = Some(PathBuf::from(
                args.next().ok_or_else(|| format!("{arg} needs a value\n{USAGE}"))?,
            ));
        }
        match (spec, config, out) {
            (Some(spec), Some(config), Some(out)) => Ok(Args { spec, config, out }),
            _ => Err(USAGE.to_owned()),
        }
    }
}

fn run(args: Args) -> Result<(), Err> {
    let read = |path: &PathBuf| fs::read_to_string(path).map_err(|err| format!("{}: {err}", path.display()));
    let forge: Forge =
        serde_json::from_str(&read(&args.spec)?).map_err(|err| format!("{}: {err}", args.spec.display()))?;
    let hand = HandWritten::parse(&read(&args.config)?).map_err(|err| format!("{}: {err}", args.config.display()))?;
    forge::write(&args.out, forge::run(&forge, &Cli { hand })?)
}

fn main() -> ExitCode {
    let result = Args::parse(std::env::args().skip(1)).map_err(Err::from).and_then(run);
    match result {
        Ok(()) => ExitCode::SUCCESS,
        Err(err) => {
            eprintln!("cf-generator: {err}");
            ExitCode::FAILURE
        }
    }
}
