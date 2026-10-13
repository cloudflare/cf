//! Builds the command tree from forge's groups: a command for each top-level
//! group, with its methods as leaf commands, nested in groups.
//!
//! Commands, groups and leaves are named in kebab-case after forge's names,
//! and each method has an operation ID made of the names of its groups and
//! its own, such as `kv.namespaces.list`.

use forge::{Availability, Forge, Json};

use crate::js::{Obj, Value, locale_compare, normalize_spaces};

/// A method: one operation, as a leaf command.
#[derive(Clone, Debug, Default)]
pub struct Method {
    pub name: String,
    pub operation_id: String,
    pub deprecated: bool,
    /// The `x-forge-params` overrides, by parameter name, when not empty.
    pub params: Option<Obj>,
    pub require_confirmation: Option<String>,
    /// The operation's summary with its whitespace collapsed.
    pub summary: Option<String>,
    /// The operation's description, or else its summary, with its
    /// whitespace collapsed.
    pub description: String,
    /// Whether the operation declares `x-forge-args`, which the CLI does not
    /// support.
    pub has_args: bool,
}

/// A method group: methods and method groups under a name.
pub struct Group {
    pub name: String,
    pub description: String,
    pub items: Vec<Item>,
}

/// A member of a command or method group.
pub enum Item {
    Method(Method),
    Group(Group),
}

/// A top-level command.
pub struct Command {
    pub name: String,
    pub description: String,
    pub items: Vec<Item>,
    pub hide_command: bool,
}

/// The operation ID of `method`: the kebab-case names of its groups, top
/// level first, and its own, joined with dots.
pub fn operation_id(method: forge::Method<'_>) -> String {
    let group = method.group().path().map(|name| name.kebab());
    group.chain([method.name().kebab()]).collect::<Vec<_>>().join(".")
}

/// The commands of the document, sorted by name.
pub fn commands(forge: &Forge) -> Result<Vec<Command>, String> {
    let mut errors = Vec::new();
    let mut out: Vec<Command> = forge
        .groups()
        .filter(|g| g.parent().is_none())
        .map(|g| command(g, &mut errors))
        .collect();
    out.sort_by(|a, b| locale_compare(&a.name, &b.name));
    if !errors.is_empty() {
        let lines: Vec<String> = errors.iter().map(|e| format!("  {e}")).collect();
        return Err(format!(
            "OpenAPI command metadata validation errors:\n{}",
            lines.join("\n")
        ));
    }
    Ok(out)
}

/// The command of the top-level group `group`. A method without a
/// description adds an error to `errors`.
pub fn command(group: forge::Group<'_>, errors: &mut Vec<String>) -> Command {
    let name = group.name().kebab();
    let description = if group.description().is_empty() {
        name.clone()
    } else {
        group.description().to_owned()
    };
    let hide_command = std::iter::once(group)
        .chain(group.descendants())
        .flat_map(|g| g.methods())
        .all(|m| m.is_hidden());
    Command {
        items: items(group, &name, None, errors),
        name,
        description,
        hide_command,
    }
}

/// The methods of `group`, then its subgroups sorted by name. `command` is
/// the name of its command, and `path` the names of the groups below the
/// command down to it, joined with dots.
fn items(group: forge::Group<'_>, command: &str, path: Option<&str>, errors: &mut Vec<String>) -> Vec<Item> {
    let mut out: Vec<Item> = group
        .methods()
        .map(|m| Item::Method(method(m, command, path, errors)))
        .collect();
    let mut groups: Vec<Group> = group
        .children()
        .map(|child| {
            let name = child.name().kebab();
            let child_path = match path {
                None => name.clone(),
                Some(path) => format!("{path}.{name}"),
            };
            let description = if child.description().is_empty() {
                format!("Operations for {child_path}")
            } else {
                child.description().to_owned()
            };
            Group {
                items: items(child, command, Some(&child_path), errors),
                name,
                description,
            }
        })
        .collect();
    groups.sort_by(|a, b| locale_compare(&a.name, &b.name));
    out.extend(groups.into_iter().map(Item::Group));
    out
}

fn method(m: forge::Method<'_>, command: &str, path: Option<&str>, errors: &mut Vec<String>) -> Method {
    let name = m.name().kebab();
    let id = operation_id(m);
    let summary = (!m.summary().is_empty()).then(|| normalize_spaces(m.summary()));
    let description = if m.description().is_empty() && m.summary().is_empty() {
        let at = match path {
            None => format!("{command}.{name}"),
            Some(path) => format!("{command}.{path}.{name}"),
        };
        errors.push(format!(
            "{at}: method has no description and no OpenAPI description found for \"{id}\". Add a description to the schema file."
        ));
        String::new()
    } else if m.description().is_empty() {
        normalize_spaces(m.summary())
    } else {
        normalize_spaces(m.description())
    };
    let params = match m.extension("x-forge-params").map(Value::from) {
        Some(Value::Object(params)) if !params.is_empty() => Some(params),
        _ => None,
    };
    Method {
        name,
        operation_id: id,
        deprecated: m.availability() == Some(Availability::Deprecated),
        params,
        require_confirmation: m.confirmation().map(str::to_owned),
        summary,
        description,
        has_args: matches!(m.extension("x-forge-args"), Some(Json::Array(_))),
    }
}
