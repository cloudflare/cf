//! The hand-written commands that are spliced into the generated tree.
//!
//! cf registers a short list of hand-written commands, in
//! `src/commands/hand-written.ts`, that replace a generated leaf, add one,
//! add a whole group, or sit at the root, each with a `meta.ts` sidecar
//! describing it, listed in `src/commands/hand-written-meta.ts`. The
//! generator reads both from its `--config` JSON: `{ handWritten, sidecars }`.

use crate::js::{Obj, Value, first_word, stringify};

pub struct Root {
    pub command: String,
    /// The description, or none for a hidden root.
    pub describe: Option<String>,
    pub dir: String,
}

impl Root {
    pub fn name(&self) -> &str {
        first_word(&self.command).unwrap_or(&self.command)
    }
}

pub struct LeafOverride {
    pub emit_key: String,
    pub dir: String,
}

pub struct Leaf {
    pub dry_run: String,
    /// Slash-separated parent path within the generated command tree.
    pub parent: String,
    pub name: String,
    pub dir: String,
}

pub struct ParentOverride {
    pub parent: String,
    pub describe: String,
    pub expose: bool,
    /// Create the root for local leaves when the document does not have it.
    pub create_if_missing: bool,
}

pub struct SubGroup {
    pub dry_run: String,
    pub parent: String,
    pub name: String,
    pub dir: String,
    pub describe: String,
}

/// The sidecars of the hand-written commands, by directory.
struct Sidecars {
    /// Every command under each root.
    roots: Obj,
    /// Every leaf of each subgroup.
    subgroups: Obj,
    leaves: Obj,
    leaf_overrides: Obj,
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

fn string(entry: &Value, key: &str) -> Result<String, String> {
    entry
        .get(key)
        .and_then(Value::as_str)
        .map(str::to_owned)
        .ok_or_else(|| format!("hand-written command {} has no string {key}", stringify(entry)))
}

fn object(value: &Value, key: &str) -> Result<Obj, String> {
    value
        .get(key)
        .and_then(Value::as_object)
        .cloned()
        .ok_or_else(|| format!("the hand-written configuration has no {key}"))
}

impl HandWritten {
    /// Reads the configuration from its JSON text.
    pub fn parse(text: &str) -> Result<HandWritten, String> {
        let config = Value::parse(text)?;
        let mut hand = HandWritten {
            roots: Vec::new(),
            leaf_overrides: Vec::new(),
            leaves: Vec::new(),
            subgroups: Vec::new(),
            parents: Vec::new(),
            sidecars: {
                let sidecars = config
                    .get("sidecars")
                    .ok_or("the hand-written configuration has no sidecars")?;
                Sidecars {
                    roots: object(sidecars, "roots")?,
                    subgroups: object(sidecars, "subgroups")?,
                    leaves: object(sidecars, "leaves")?,
                    leaf_overrides: object(sidecars, "leafOverrides")?,
                }
            },
        };
        let commands = config
            .get("handWritten")
            .and_then(Value::as_array)
            .ok_or("the hand-written configuration has no handWritten list")?;
        for entry in commands {
            match string(entry, "kind")?.as_str() {
                "root" => hand.roots.push(Root {
                    command: string(entry, "command")?,
                    describe: entry.get("describe").and_then(Value::as_str).map(str::to_owned),
                    dir: string(entry, "dir")?,
                }),
                "leafOverride" => hand.leaf_overrides.push(LeafOverride {
                    emit_key: string(entry, "emitKey")?,
                    dir: string(entry, "dir")?,
                }),
                "leaf" => hand.leaves.push(Leaf {
                    dry_run: string(entry, "dryRun")?,
                    parent: string(entry, "parent")?,
                    name: string(entry, "name")?,
                    dir: string(entry, "dir")?,
                }),
                "subgroup" => hand.subgroups.push(SubGroup {
                    dry_run: string(entry, "dryRun")?,
                    parent: string(entry, "parent")?,
                    name: string(entry, "name")?,
                    dir: string(entry, "dir")?,
                    describe: string(entry, "describe")?,
                }),
                "parentOverride" => hand.parents.push(ParentOverride {
                    parent: string(entry, "parent")?,
                    describe: string(entry, "describe")?,
                    expose: entry.get("expose") == Some(&Value::Bool(true)),
                    create_if_missing: entry.get("createIfMissing") == Some(&Value::Bool(true)),
                }),
                kind => return Err(format!("unknown hand-written command kind {kind}")),
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
    pub fn leaf_override_meta(&self, dir: &str) -> Result<Obj, String> {
        sidecar(&self.sidecars.leaf_overrides, dir)?
            .as_object()
            .cloned()
            .ok_or_else(|| format!("src/commands/{dir}/meta.ts must export an object"))
    }

    /// An added leaf's complete metadata, whose identity must match where it
    /// is registered: types can't tie a sidecar to its registration.
    pub fn leaf_meta(&self, resource: &str, leaf: &Leaf) -> Result<Value, String> {
        let meta = sidecar(&self.sidecars.leaves, &leaf.dir)?;
        let expected: Vec<&str> = resource.split('/').chain([leaf.name.as_str()]).collect();
        let command = format!("cf {}", expected.join(" "));
        let full_path: Option<Vec<&str>> = meta
            .get("fullPath")
            .and_then(Value::as_array)
            .and_then(|path| path.iter().map(Value::as_str).collect());
        let identical = meta.get("name").and_then(Value::as_str) == Some(leaf.name.as_str())
            && meta.get("command").and_then(Value::as_str) == Some(command.as_str())
            && full_path.as_ref() == Some(&expected);
        if !identical {
            return Err(format!(
                "src/commands/{}/meta.ts identity must match its registration: name \"{}\", fullPath {}, command \"{command}\"",
                leaf.dir,
                leaf.name,
                stringify(&Value::from(expected)),
            ));
        }
        Ok(meta.clone())
    }

    /// Every command under a root.
    pub fn root_meta(&self, root: &Root) -> Result<Vec<Value>, String> {
        list(sidecar(&self.sidecars.roots, &root.dir)?)
    }

    /// Every leaf of a subgroup.
    pub fn subgroup_meta(&self, group: &SubGroup) -> Result<Vec<Value>, String> {
        list(sidecar(&self.sidecars.subgroups, &group.dir)?)
    }
}

fn list(value: &Value) -> Result<Vec<Value>, String> {
    value
        .as_array()
        .map(<[Value]>::to_vec)
        .ok_or_else(|| "a sidecar of a group must export a list".to_owned())
}

/// The sidecar of the command in `dir`.
fn sidecar<'a>(sidecars: &'a Obj, dir: &str) -> Result<&'a Value, String> {
    sidecars
        .get(dir)
        .ok_or_else(|| format!("src/commands/{dir}/meta.ts is not listed in src/commands/hand-written-meta.ts"))
}
