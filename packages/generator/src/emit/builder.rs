//! Emits a command's yargs builder.

use super::{Ctx, OutputKind, escape_single};
use crate::args::{ArgType, Origin};
use crate::js::{Obj, Value, get_entry, kebab, set_entry, stringify};
use crate::operation::FieldType;

fn option(name: &str, fields: Vec<(&str, Option<Value>)>) -> String {
    let map: Obj = fields.into_iter().filter_map(|(k, v)| v.map(|v| (k, v))).collect();
    format!(".option('{name}', {})", stringify(&Value::Object(map)))
}

fn quoted(items: &[String]) -> String {
    items.iter().map(|c| format!("'{c}'")).collect::<Vec<_>>().join(", ")
}

fn kebabs(items: &[String]) -> Vec<String> {
    items.iter().map(|i| kebab(i)).collect()
}

/// `generateBuilderLines`.
pub fn builder_lines(ctx: &Ctx) -> Vec<String> {
    let d = &ctx.derived;
    let op = ctx.op;
    let options: Vec<_> = d.options().collect();
    let positionals: Vec<_> = d.positionals().collect();
    let mut conflict_flags = Vec::new();
    for a in &d.args {
        if let Some(conflicts) = a.conflicts.as_ref().filter(|c| !c.is_empty()) {
            conflict_flags.push(kebab(&a.name));
            conflict_flags.extend(kebabs(conflicts));
        }
    }
    let mut lines = Vec::new();
    for arg in &positionals {
        lines.push(format!("      .positional('{}', {{", kebab(&arg.name)));
        lines.push(format!("        type: '{}',", arg.ty.scalar()));
        if arg.ty == ArgType::Array {
            lines.push("        array: true,".to_owned());
        }
        let base = escape_single(&arg.description);
        let desc = if arg.is_zone {
            format!("{base} (or use --zone flag)")
        } else {
            base
        };
        lines.push(format!("        description: '{desc}',"));
        if arg.required && !arg.is_zone && !arg.is_worker_name {
            lines.push("        demandOption: true,".to_owned());
        }
        lines.push("      })".to_owned());
    }
    let partial_update = op.method == "patch" || op.method == "put";
    for arg in &options {
        let name = kebab(&arg.name);
        let scalar_array = arg.ty == ArgType::Array;
        let array = scalar_array || arg.ty == ArgType::ObjectArray;
        let skip_demand = arg.is_body() && d.has_body;
        let discriminator = match (&op.body_discriminator, &arg.origin) {
            (Some(disc), Origin::Body(path)) => path.len() == 1 && path[0] == disc.field,
            _ => false,
        };
        let suppress_default =
            array || conflict_flags.contains(&name) || (arg.is_body() && partial_update && !discriminator);
        let ty = if array { "string" } else { arg.ty.scalar() };
        let demand = arg.required && !arg.is_zone && !arg.is_worker_name && !skip_demand;
        lines.push(option(
            &name,
            vec![
                ("type", Some(Value::from(ty))),
                ("array", scalar_array.then_some(Value::Bool(true))),
                ("alias", arg.is_worker_name.then(|| Value::from("script-name"))),
                ("description", Some(Value::from(&arg.description))),
                ("choices", arg.choices.clone().map(Value::from)),
                ("default", if suppress_default { None } else { arg.default.clone() }),
                ("demandOption", demand.then_some(Value::Bool(true))),
            ],
        ));
        // Resolve `@file` before yargs validates `choices` against the value,
        // so the handler gets the file's contents without reading it twice.
        if arg.from_file.is_some() && arg.has_choices() {
            let quoted_name = stringify(&Value::from(&name));
            lines.push(format!(
                ".coerce({quoted_name}, (value) => resolveFileToken(value, {quoted_name}, {}))",
                arg.file_format()
            ));
        }
    }
    lines.push(
        r#".option("dry-run", {"type":"boolean","description":"Validate and show what would happen without executing","default":false})"#
            .to_owned(),
    );
    let has_force = options.iter().chain(&positionals).any(|a| a.name == "force");
    let is_delete = op.method == "delete"
        || ctx
            .method
            .require_confirmation
            .as_deref()
            .is_some_and(|c| !c.is_empty());
    if is_delete && !has_force {
        lines.push(
            r#".option("force", {"type":"boolean","alias":"f","description":"Skip confirmation (useful in scripts and CI)","default":false})"#
                .to_owned(),
        );
    }
    if d.has_body {
        let desc = op
            .request_body_description
            .as_deref()
            .filter(|d| !d.is_empty())
            .unwrap_or("Raw JSON request body (bypasses individual flags)");
        lines.push("      .option('body', {".to_owned());
        lines.push("        type: 'string',".to_owned());
        lines.push(format!("        description: '{}',", escape_single(desc)));
        lines.push("      })".to_owned());
    }
    if ctx.output_kind == OutputKind::Binary {
        lines.push(
            r#".option("text", {"type":"boolean","description":"Decode the response body as UTF-8 text instead of writing raw bytes","default":false})"#
                .to_owned(),
        );
    }
    if op.request_content_types.iter().any(|c| c != "application/json") {
        lines.push(
            r#".option("file", {"type":"string","description":"Path to a file to upload as the request body"})"#
                .to_owned(),
        );
    }
    for f in &d.multipart_flag_fields {
        let k = kebab(&f.name);
        if options.iter().chain(&positionals).any(|a| kebab(&a.name) == k) {
            continue;
        }
        let ty = match f.ty {
            FieldType::Number => "number",
            FieldType::Boolean => "boolean",
            _ => "string",
        };
        lines.push(format!("      .option('{k}', {{"));
        lines.push(format!("        type: '{ty}',"));
        lines.push(format!("        description: '{}',", escape_single(&f.description)));
        lines.push("      })".to_owned());
    }
    let body_flags: Vec<_> = d.body_options().collect();
    for arg in &body_flags {
        let me = kebab(&arg.name);
        if let Some(conflicts) = arg.conflicts.as_ref().filter(|c| !c.is_empty()) {
            lines.push(format!("      .conflicts('{me}', [{}])", quoted(&kebabs(conflicts))));
        }
        if let Some(implies) = arg.implies.as_ref().filter(|c| !c.is_empty()) {
            lines.push(format!("      .implies('{me}', [{}])", quoted(&kebabs(implies))));
        }
    }
    let mut conflicts_by_flag: Vec<(String, Vec<String>)> = Vec::new();
    for a in &body_flags {
        if let Some(conflicts) = a.conflicts.as_ref().filter(|c| !c.is_empty()) {
            set_entry(&mut conflicts_by_flag, &kebab(&a.name), kebabs(conflicts));
        }
    }
    for group in &d.optional_parent_groups {
        if group.group_set_flags.is_empty() {
            continue;
        }
        let set = format!("[{}]", quoted(&group.group_set_flags));
        let required = format!("[{}]", quoted(&group.required_flags));
        let pairs: Vec<(&String, &Vec<String>)> = group
            .required_flags
            .iter()
            .filter_map(|f| {
                get_entry(&conflicts_by_flag, f)
                    .filter(|c| !c.is_empty())
                    .map(|c| (f, c))
            })
            .collect();
        lines.push("      .check((argv) => {".to_owned());
        lines.push(format!(
            "        const groupSet = {set}.some((k) => argv[k] !== undefined);"
        ));
        lines.push("        if (groupSet) {".to_owned());
        if pairs.is_empty() {
            lines.push(format!(
                "          const missing = {required}.filter((k) => argv[k] === undefined);"
            ));
        } else {
            let map = pairs
                .iter()
                .map(|(f, c)| format!("'{f}': [{}]", quoted(c)))
                .collect::<Vec<_>>()
                .join(", ");
            lines.push(format!(
                "          const requiredConflicts: Record<string, string[]> = {{ {map} }};"
            ));
            lines.push(format!(
                "          const missing = {required}.filter((k) => argv[k] === undefined && !(requiredConflicts[k] ?? []).some((x) => argv[x] !== undefined));"
            ));
        }
        lines.push("          if (missing.length > 0) {".to_owned());
        lines.push(format!(
            "            throw new Error(`${{missing.map((m) => '--' + m).join(', ')}} ${{missing.length === 1 ? 'is' : 'are'}} required when any --{}-* flag is set`);",
            group.parent_name
        ));
        lines.push("          }".to_owned());
        lines.push("        }".to_owned());
        lines.push("        return true;".to_owned());
        lines.push("      })".to_owned());
    }
    lines
}
