//! Emits a command's yargs builder.

use std::collections::HashMap;
use std::fmt::{self, Write};

use forge::HttpMethod;
use serde::Serialize;
use serde_json::Value;

use super::{Ctx, OutputKind, escape_single};
use crate::args::{ArgType, Origin};
use crate::js::{kebab, quote};
use crate::operation::JsonType;

/// The options of a flag yargs registers, written as JSON.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct YargsOption<'a> {
    #[serde(rename = "type")]
    ty: &'static str,
    #[serde(skip_serializing_if = "std::ops::Not::not")]
    array: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    alias: Option<&'static str>,
    description: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    choices: Option<&'a [String]>,
    #[serde(skip_serializing_if = "Option::is_none")]
    default: Option<&'a Value>,
    #[serde(skip_serializing_if = "std::ops::Not::not")]
    demand_option: bool,
}

fn quoted(items: &[String]) -> String {
    items.iter().map(|c| format!("'{c}'")).collect::<Vec<_>>().join(", ")
}

fn kebabs(items: &[String]) -> Vec<String> {
    items.iter().map(|i| kebab(i)).collect()
}

/// Writes the chained calls of a command's yargs builder, after `.usage`.
pub fn builder(ctx: &Ctx, out: &mut String) -> fmt::Result {
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
    for arg in &positionals {
        writeln!(out, ".positional('{}', {{", kebab(&arg.name))?;
        writeln!(out, "type: '{}',", arg.ty.scalar())?;
        if arg.ty == ArgType::Array {
            writeln!(out, "array: true,")?;
        }
        let zone_hint = if arg.is_zone { " (or use --zone flag)" } else { "" };
        writeln!(out, "description: '{}{zone_hint}',", escape_single(&arg.description))?;
        if arg.required && !arg.is_zone && !arg.is_worker_name {
            writeln!(out, "demandOption: true,")?;
        }
        writeln!(out, "}})")?;
    }
    let partial_update = matches!(op.method, HttpMethod::Patch | HttpMethod::Put);
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
        let option = YargsOption {
            ty: if array { "string" } else { arg.ty.scalar() },
            array: scalar_array,
            alias: arg.is_worker_name.then_some("script-name"),
            description: &arg.description,
            choices: arg.choices.as_deref(),
            default: arg.default.as_ref().filter(|_| !suppress_default),
            demand_option: arg.required && !arg.is_zone && !arg.is_worker_name && !skip_demand,
        };
        let option = serde_json::to_string(&option).map_err(|_| fmt::Error)?;
        writeln!(out, ".option('{name}', {option})")?;
        // Resolve `@file` before yargs validates `choices` against the value,
        // so the handler gets the file's contents without reading it twice.
        if arg.from_file.is_some() && arg.has_choices() {
            let quoted_name = quote(&name);
            writeln!(
                out,
                ".coerce({quoted_name}, (value) => resolveFileToken(value, {quoted_name}, {}))",
                arg.file_format()
            )?;
        }
    }
    writeln!(
        out,
        r#".option("dry-run", {{"type":"boolean","description":"Validate and show what would happen without executing","default":false}})"#
    )?;
    let has_force = options.iter().chain(&positionals).any(|a| a.name == "force");
    if ctx.is_delete() && !has_force {
        writeln!(
            out,
            r#".option("force", {{"type":"boolean","alias":"f","description":"Skip confirmation (useful in scripts and CI)","default":false}})"#
        )?;
    }
    if d.has_body {
        let desc = op
            .request_body_description
            .as_deref()
            .filter(|d| !d.is_empty())
            .unwrap_or("Raw JSON request body (bypasses individual flags)");
        writeln!(
            out,
            ".option('body', {{\ntype: 'string',\ndescription: '{}',\n}})",
            escape_single(desc)
        )?;
    }
    if ctx.output_kind == OutputKind::Binary {
        writeln!(
            out,
            r#".option("text", {{"type":"boolean","description":"Decode the response body as UTF-8 text instead of writing raw bytes","default":false}})"#
        )?;
    }
    if op.request_content_types.iter().any(|c| c != "application/json") {
        writeln!(
            out,
            r#".option("file", {{"type":"string","description":"Path to a file to upload as the request body"}})"#
        )?;
    }
    for f in &d.multipart_flag_fields {
        let k = kebab(&f.name);
        if options.iter().chain(&positionals).any(|a| kebab(&a.name) == k) {
            continue;
        }
        let ty = match f.ty {
            JsonType::Number => "number",
            JsonType::Boolean => "boolean",
            _ => "string",
        };
        writeln!(
            out,
            ".option('{k}', {{\ntype: '{ty}',\ndescription: '{}',\n}})",
            escape_single(&f.description)
        )?;
    }
    let body_flags: Vec<_> = d.body_options().collect();
    let mut conflicts_by_flag: HashMap<String, Vec<String>> = HashMap::new();
    for arg in &body_flags {
        let me = kebab(&arg.name);
        if let Some(conflicts) = arg.conflicts.as_ref().filter(|c| !c.is_empty()) {
            writeln!(out, ".conflicts('{me}', [{}])", quoted(&kebabs(conflicts)))?;
            conflicts_by_flag.insert(me.clone(), kebabs(conflicts));
        }
        if let Some(implies) = arg.implies.as_ref().filter(|c| !c.is_empty()) {
            writeln!(out, ".implies('{me}', [{}])", quoted(&kebabs(implies)))?;
        }
    }
    for group in &d.optional_parent_groups {
        if group.group_set_flags.is_empty() {
            continue;
        }
        let set = quoted(&group.group_set_flags);
        let required = quoted(&group.required_flags);
        let pairs: Vec<String> = group
            .required_flags
            .iter()
            .filter_map(|f| conflicts_by_flag.get(f).map(|c| format!("'{f}': [{}]", quoted(c))))
            .collect();
        writeln!(out, ".check((argv) => {{")?;
        writeln!(out, "const groupSet = [{set}].some((k) => argv[k] !== undefined);")?;
        writeln!(out, "if (groupSet) {{")?;
        if pairs.is_empty() {
            writeln!(
                out,
                "const missing = [{required}].filter((k) => argv[k] === undefined);"
            )?;
        } else {
            writeln!(
                out,
                "const requiredConflicts: Record<string, string[]> = {{ {} }};",
                pairs.join(", ")
            )?;
            writeln!(
                out,
                "const missing = [{required}].filter((k) => argv[k] === undefined && !(requiredConflicts[k] ?? []).some((x) => argv[x] !== undefined));"
            )?;
        }
        writeln!(out, "if (missing.length > 0) {{")?;
        writeln!(
            out,
            "throw new Error(`${{missing.map((m) => '--' + m).join(', ')}} ${{missing.length === 1 ? 'is' : 'are'}} required when any --{}-* flag is set`);",
            group.parent_name
        )?;
        writeln!(out, "}}\n}}\nreturn true;\n}})")?;
    }
    Ok(())
}
