//! Emits a command's yargs builder.

use std::collections::HashMap;
use std::fmt::{self, Write};

use serde::Serialize;
use serde_json::Value;

use super::{Ctx, OutputKind, escape_single};
use crate::args::{ArgType, multipart_file_flag_description, option_defaults};
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
    let defaults = option_defaults(d, op);
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
    for arg in &options {
        let name = kebab(&arg.name);
        let scalar_array = arg.ty == ArgType::Array;
        let array = scalar_array || matches!(arg.ty, ArgType::ObjectArray | ArgType::NestedArray | ArgType::ObjectMap);
        let skip_demand = arg.is_body() && d.has_body;
        let option = YargsOption {
            ty: if array { "string" } else { arg.ty.scalar() },
            array: scalar_array,
            alias: arg.is_worker_name.then_some("script-name"),
            description: &arg.description,
            choices: arg.choices.as_deref(),
            default: defaults.get(arg.name.as_str()).copied(),
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
    if ctx.is_delete() {
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
        let k = &f.flag;
        if options.iter().chain(&positionals).any(|a| kebab(&a.name) == *k) {
            continue;
        }
        let ty = match f.field.ty {
            JsonType::Number => "number",
            JsonType::Boolean => "boolean",
            _ => "string",
        };
        writeln!(
            out,
            ".option('{k}', {{\ntype: '{ty}',\ndescription: '{}',\n}})",
            escape_single(&f.field.description)
        )?;
    }
    for f in &d.multipart_file_fields {
        let mut option = serde_json::json!({"type":"string"});
        if f.field.ty == JsonType::Array {
            option["array"] = Value::Bool(true);
            option["requiresArg"] = Value::Bool(true);
        }
        option["description"] = Value::String(multipart_file_flag_description(&f.field));
        writeln!(out, ".option('{}', {})", f.flag, option)?;
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
        if group.group_set_flags.is_empty()
            || (group.required_flags.len() == 1 && group.group_set_flags == group.required_flags)
        {
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
        writeln!(out, "if (!argv.body && groupSet) {{")?;
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
