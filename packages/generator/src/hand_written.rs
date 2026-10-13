//! The hand-written commands that are spliced into the generated tree.
//!
//! cf registers a short list of hand-written commands, in
//! `src/commands/hand-written.ts`, that replace a generated leaf, add one,
//! add a whole group, or sit at the root, each with a `meta.ts` sidecar
//! describing it, listed in `src/commands/hand-written-meta.ts`. The
//! generator reads both from its `--config` JSON: `{ handWritten, sidecars }`.

use std::collections::HashMap;

use serde::{Deserialize, Deserializer, de};
use serde_json::{Map, Value, json};

use crate::js::first_word;

#[derive(Deserialize)]
pub struct Root {
    pub command: String,
    /// The description, or none for a hidden root, which registers `false`.
    #[serde(deserialize_with = "description")]
    pub describe: Option<String>,
    pub dir: String,
}

/// Reads `describe: string | false`.
fn description<'de, D: Deserializer<'de>>(deserializer: D) -> Result<Option<String>, D::Error> {
    #[derive(Deserialize)]
    #[serde(untagged)]
    enum Describe {
        Shown(String),
        Hidden(bool),
    }
    match Describe::deserialize(deserializer)? {
        Describe::Shown(describe) => Ok(Some(describe)),
        Describe::Hidden(false) => Ok(None),
        Describe::Hidden(true) => Err(de::Error::custom("describe must be a string or false")),
    }
}

impl Root {
    pub fn name(&self) -> &str {
        first_word(&self.command).unwrap_or(&self.command)
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LeafOverride {
    pub emit_key: String,
    pub dir: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Leaf {
    pub dry_run: String,
    /// Slash-separated parent path within the generated command tree.
    pub parent: String,
    pub name: String,
    pub dir: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParentOverride {
    pub parent: String,
    pub describe: String,
    #[serde(default)]
    pub expose: bool,
    /// Create the root for local leaves when the document does not have it.
    #[serde(default)]
    pub create_if_missing: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubGroup {
    pub dry_run: String,
    pub parent: String,
    pub name: String,
    pub dir: String,
    pub describe: String,
}

/// A registration in `src/commands/hand-written.ts`.
#[derive(Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
enum Registration {
    Root(Root),
    LeafOverride(LeafOverride),
    Leaf(Leaf),
    Subgroup(SubGroup),
    ParentOverride(ParentOverride),
}

/// The sidecars of the hand-written commands, by directory.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Sidecars {
    /// Every command under each root.
    roots: HashMap<String, Vec<Value>>,
    /// Every leaf of each subgroup.
    subgroups: HashMap<String, Vec<Value>>,
    leaves: HashMap<String, Value>,
    /// The fields each override replaces.
    leaf_overrides: HashMap<String, Map<String, Value>>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Config {
    hand_written: Vec<Registration>,
    sidecars: Sidecars,
}

/// The hand-written commands, and their sidecars by directory.
pub struct HandWritten {
    pub roots: Vec<Root>,
    pub leaf_overrides: Vec<LeafOverride>,
    pub leaves: Vec<Leaf>,
    pub subgroups: Vec<SubGroup>,
    parents: Vec<ParentOverride>,
    sidecars: Sidecars,
}

impl HandWritten {
    /// Reads the configuration from its JSON text.
    pub fn parse(text: &str) -> Result<HandWritten, String> {
        let config: Config = serde_json::from_str(text).map_err(|err| err.to_string())?;
        let mut hand = HandWritten {
            roots: Vec::new(),
            leaf_overrides: Vec::new(),
            leaves: Vec::new(),
            subgroups: Vec::new(),
            parents: Vec::new(),
            sidecars: config.sidecars,
        };
        for registration in config.hand_written {
            match registration {
                Registration::Root(root) => hand.roots.push(root),
                Registration::LeafOverride(o) => hand.leaf_overrides.push(o),
                Registration::Leaf(leaf) => hand.leaves.push(leaf),
                Registration::Subgroup(group) => hand.subgroups.push(group),
                Registration::ParentOverride(parent) => hand.parents.push(parent),
            }
        }
        Ok(hand)
    }

    /// The directory of the command that replaces the leaf at `emit_key`.
    pub fn leaf_override_dir(&self, emit_key: &str) -> Option<&str> {
        // A later registration of the same key replaces an earlier one.
        self.leaf_overrides
            .iter()
            .rev()
            .find(|o| o.emit_key == emit_key)
            .map(|o| o.dir.as_str())
    }

    /// The leaves added under `parent`.
    pub fn leaves(&self, parent: &str) -> Vec<&Leaf> {
        self.leaves.iter().filter(|l| l.parent == parent).collect()
    }

    /// The module an index imports the added leaf at `emit_key` from.
    pub fn leaf_module(&self, emit_key: &str) -> Option<String> {
        let (parent, name) = emit_key.rsplit_once('/')?;
        let leaf = self.leaves.iter().find(|l| l.parent == parent && l.name == name)?;
        Some(format!("#commands/{}/index.js", leaf.dir))
    }

    /// Reports whether a leaf's parent is one `under` accepts.
    pub fn leaves_under(&self, under: impl Fn(&str) -> bool) -> bool {
        self.leaves.iter().any(|l| under(&l.parent))
    }

    /// Reports whether a subgroup's parent is one `under` accepts.
    pub fn subgroups_under(&self, under: impl Fn(&str) -> bool) -> bool {
        self.subgroups.iter().any(|s| under(&s.parent))
    }

    pub fn subgroups(&self, parent: &str) -> Vec<&SubGroup> {
        self.subgroups.iter().filter(|s| s.parent == parent).collect()
    }

    /// The description override and whether `parent` is exposed.
    pub fn parent_override(&self, parent: &str) -> (Option<&str>, bool) {
        match self.parents.iter().find(|o| o.parent == parent) {
            Some(p) => (Some(&p.describe), p.expose),
            None => (None, false),
        }
    }

    /// The parent overrides that create their root when the document has no
    /// group of that name, so their hand-written leaves have a parent before
    /// the API does. Only top-level roots can be created.
    pub fn created_roots(&self) -> Result<Vec<&ParentOverride>, String> {
        let created: Vec<_> = self.parents.iter().filter(|p| p.create_if_missing).collect();
        if let Some(p) = created.iter().find(|p| p.parent.contains('/')) {
            return Err(format!(
                "Parent override \"{}\": createIfMissing only supports top-level command roots.",
                p.parent
            ));
        }
        Ok(created)
    }

    pub fn assert_unique_leaves(&self, resource: &str, leaves: &[&Leaf]) -> Result<(), String> {
        for (i, leaf) in leaves.iter().enumerate() {
            if leaves[..i].iter().any(|l| l.name == leaf.name) {
                return Err(format!(
                    "Hand-written leaf command \"{resource} {}\" is registered more than once.",
                    leaf.name
                ));
            }
        }
        Ok(())
    }

    /// The fields an override's sidecar replaces.
    pub fn leaf_override_meta(&self, dir: &str) -> Result<&Map<String, Value>, String> {
        sidecar(&self.sidecars.leaf_overrides, dir)
    }

    /// An added leaf's complete metadata, whose identity must match where it
    /// is registered: types can't tie a sidecar to its registration.
    pub fn leaf_meta(&self, resource: &str, leaf: &Leaf) -> Result<Value, String> {
        let meta = sidecar(&self.sidecars.leaves, &leaf.dir)?;
        let expected: Vec<&str> = resource.split('/').chain([leaf.name.as_str()]).collect();
        let command = format!("cf {}", expected.join(" "));
        let identical = meta["name"] == leaf.name.as_str()
            && meta["command"] == command.as_str()
            && meta["fullPath"] == json!(expected);
        if !identical {
            return Err(format!(
                "src/commands/{}/meta.ts identity must match its registration: name \"{}\", fullPath {}, command \"{command}\"",
                leaf.dir,
                leaf.name,
                json!(expected),
            ));
        }
        Ok(meta.clone())
    }

    /// Every command under a root.
    pub fn root_meta(&self, root: &Root) -> Result<&[Value], String> {
        sidecar(&self.sidecars.roots, &root.dir).map(Vec::as_slice)
    }

    /// Every leaf of a subgroup.
    pub fn subgroup_meta(&self, group: &SubGroup) -> Result<&[Value], String> {
        sidecar(&self.sidecars.subgroups, &group.dir).map(Vec::as_slice)
    }
}

/// The sidecar of the command in `dir`.
fn sidecar<'a, T>(sidecars: &'a HashMap<String, T>, dir: &str) -> Result<&'a T, String> {
    sidecars
        .get(dir)
        .ok_or_else(|| format!("src/commands/{dir}/meta.ts is not listed in src/commands/hand-written-meta.ts"))
}
