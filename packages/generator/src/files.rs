//! Walks the command tree and emits every file: a module per command, an
//! index per command group, the root index, and the metadata in `_meta/`.

use std::collections::HashMap;

use serde::Serialize;
use serde_json::{Map, Value, json};

use crate::args::{Arg, ArgType, Origin, derive_downgraded, is_worker_name};
use crate::commands::{Command, Group, Item, Method};
use crate::emit::builder::builder;
use crate::emit::handler::{handler, imports};
use crate::emit::sdk::{operation_literal, operation_path, uses_path_tag};
use crate::emit::{context, escape_single, output_kind};
use crate::hand_written::{HandWritten, Leaf, SubGroup};
use crate::js::{code_unit_compare, first_word, kebab, locale_compare, normalize_spaces, quote, to_js_string, trim};
use crate::operation::{JsonType, OperationInfo, ParameterInfo};

/// A generated file.
pub struct Out {
    pub path: String,
    pub content: String,
}

impl Out {
    fn new(path: impl Into<String>, content: impl Into<String>) -> Out {
        Out {
            path: path.into(),
            content: content.into(),
        }
    }
}

impl forge::File for Out {
    fn path(&self) -> &str {
        &self.path
    }

    fn content(&self) -> Result<std::borrow::Cow<'_, [u8]>, forge::Err> {
        Ok(self.content.as_bytes().into())
    }
}

/// The resolved operations, by operation ID.
pub type Operations = HashMap<String, OperationInfo>;

/// A command's entry in `_meta/commands.json`.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CommandMeta<'a> {
    command: String,
    name: &'a str,
    full_path: Vec<String>,
    description: &'a str,
    summary: String,
    usage: String,
    arguments: Vec<ArgumentMeta<'a>>,
    options: Vec<OptionMeta<'a>>,
    category: &'static str,
    has_request_body: bool,
    http_method: &'a str,
    api_path: &'a str,
    operation_id: &'a str,
    hide_command: bool,
}

#[derive(Serialize)]
struct ArgumentMeta<'a> {
    name: &'a str,
    position: usize,
    #[serde(rename = "type")]
    ty: &'static str,
    required: bool,
    description: &'a str,
    #[serde(rename = "enum", skip_serializing_if = "Option::is_none")]
    choices: Option<&'a [String]>,
}

#[derive(Serialize)]
struct OptionMeta<'a> {
    name: &'a str,
    #[serde(rename = "type")]
    ty: &'static str,
    required: bool,
    description: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    default: Option<&'a Value>,
    #[serde(rename = "enum", skip_serializing_if = "Option::is_none")]
    choices: Option<&'a [String]>,
}

impl OptionMeta<'_> {
    /// An option every command of some kind has.
    fn generated(name: &'static str, ty: &'static str, description: &'static str) -> OptionMeta<'static> {
        OptionMeta {
            name,
            ty,
            required: false,
            description,
            default: None,
            choices: None,
        }
    }
}

/// A command's entry in `_meta/schemas.json`.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SchemaInfo<'a> {
    operation_id: &'a str,
    http_method: &'a str,
    path: &'a str,
    path_params: Vec<ParamMeta<'a>>,
    query_params: Vec<ParamMeta<'a>>,
    has_request_body: bool,
    request_body_fields: Vec<FieldMeta<'a>>,
}

#[derive(Serialize)]
struct ParamMeta<'a> {
    name: &'a str,
    #[serde(rename = "type")]
    ty: &'static str,
    required: bool,
}

#[derive(Serialize)]
struct FieldMeta<'a> {
    name: &'a str,
    #[serde(rename = "type")]
    ty: &'static str,
    required: bool,
    description: &'a str,
}

/// Where a hand-written command's entry in
/// `_meta/hand-written-commands.json` comes from.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Provenance<'a> {
    kind: &'static str,
    overrides: bool,
    dir: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    parent: Option<&'a str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    emit_key: Option<&'a str>,
}

/// A file of `_meta/`.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct MetaFile<T> {
    version: &'static str,
    generated_at: &'static str,
    #[serde(flatten)]
    contents: T,
}

#[derive(Serialize)]
struct Commands<'a> {
    commands: &'a [Value],
    #[serde(skip_serializing_if = "Option::is_none")]
    descriptions: Option<&'a Map<String, Value>>,
}

#[derive(Serialize)]
struct Schemas {
    schemas: Map<String, Value>,
}

/// `value` as pretty JSON, as `JSON.stringify(value, null, 2)` prints it.
fn pretty(value: &impl Serialize) -> String {
    serde_json::to_string_pretty(value).expect("the metadata serializes")
}

/// `value` as a JSON value.
fn to_value(value: impl Serialize) -> Value {
    serde_json::to_value(value).expect("the metadata serializes")
}

/// Reports whether `group` has a method the CLI calls, at any depth.
fn has_live_content(group: &Group) -> bool {
    has_live_items(&group.items)
}

/// Reports whether `items` have a method the CLI calls, at any depth.
fn has_live_items(items: &[Item]) -> bool {
    items.iter().any(|item| match item {
        Item::Group(group) => has_live_content(group),
        Item::Method(method) => !method.deprecated,
    })
}

/// The names of the methods of `items` the CLI calls.
fn live_method_names(items: &[Item]) -> Vec<&str> {
    items
        .iter()
        .filter_map(|item| match item {
            Item::Method(m) if !m.deprecated => Some(m.name.as_str()),
            _ => None,
        })
        .collect()
}

/// The first line of a method's description, unless it has a summary.
pub fn summary(method: &Method) -> String {
    if let Some(s) = method
        .summary
        .as_deref()
        .map(normalize_spaces)
        .filter(|s| !s.is_empty())
    {
        return s;
    }
    let description = trim(&method.description);
    let first = trim(
        description
            .split(['\r', '\n', '\u{2028}', '\u{2029}'])
            .next()
            .unwrap_or_default(),
    );
    if first.is_empty() { description } else { first }.to_owned()
}

/// `getLeafUsage`: the usage of a leaf command, followed by its full
/// description.
pub fn leaf_usage(method: &Method, resource: &str, group: Option<&str>, command: &str) -> String {
    let segments = group.into_iter().flat_map(|g| g.split('/')).filter(|s| !s.is_empty());
    let path: Vec<&str> = ["$0", resource].into_iter().chain(segments).chain([command]).collect();
    format!("{}\n\n{}", path.join(" "), trim(&method.description))
}

/// `getTelemetrySafeFlags`: the flags whose values telemetry may record,
/// with the generated `--force` and `--text` when the command has them.
pub fn telemetry_safe_flags(args: &[Arg], include_force: bool, include_text: bool) -> Vec<String> {
    let mut safe = Vec::new();
    let flags = args
        .iter()
        .filter(|a| !a.positional && !a.secret && matches!(a.ty, ArgType::Boolean | ArgType::Enum))
        .map(|a| kebab(&a.name));
    let generated = ["dry-run"]
        .into_iter()
        .chain(include_force.then_some("force"))
        .chain(include_text.then_some("text"));
    for flag in flags.chain(generated.map(str::to_owned)) {
        crate::js::push_unique(&mut safe, flag);
    }
    safe
}

fn category(name: &str) -> &'static str {
    match name {
        "list" | "info" | "get" | "export" | "status" | "insights" | "report" | "bytime" => "read",
        "create" => "create",
        "update" | "edit" | "patch" => "update",
        "delete" | "remove" => "delete",
        _ => "action",
    }
}

/// The relative path from the module at `path` to the generated root.
fn root_prefix(path: &str) -> String {
    match path.matches('/').count() {
        0 => "./".to_owned(),
        depth => "../".repeat(depth),
    }
}

/// The first line of `s`.
fn first_line(s: &str) -> &str {
    s.split('\n').next().unwrap_or_default()
}

fn command_of(meta: &Value) -> String {
    meta.get("command").map(to_js_string).unwrap_or_default()
}

fn full_path_of(meta: &Value) -> Vec<String> {
    meta.get("fullPath")
        .and_then(Value::as_array)
        .map(|path| path.iter().map(to_js_string).collect())
        .unwrap_or_default()
}

/// Adds the error `result` has to `errors`.
fn collect<T>(errors: &mut Vec<String>, result: Result<T, String>) -> Option<T> {
    result.map_err(|err| errors.push(err)).ok()
}

/// What a walk emits: the files of commands, or their metadata. Each
/// top-level command's files depend on that command alone, so they are
/// emitted for each group in parallel, and the metadata, which lists every
/// command, once.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Mode {
    Files,
    Metadata,
}

struct Walk<'a> {
    ops: &'a Operations,
    hand: &'a HandWritten,
    mode: Mode,
    files: Vec<Out>,
    metas: Vec<Value>,
    /// By command, in the order they are first set.
    schemas: Map<String, Value>,
    errors: Vec<String>,
}

impl<'a> Walk<'a> {
    fn new(ops: &'a Operations, hand: &'a HandWritten, mode: Mode) -> Self {
        Walk {
            ops,
            hand,
            mode,
            files: Vec::new(),
            metas: Vec::new(),
            schemas: Map::new(),
            errors: Vec::new(),
        }
    }

    fn operation(&self, method: &Method) -> Option<&'a OperationInfo> {
        self.ops.get(&method.operation_id)
    }

    fn resolve(&self, method: &Method) -> Result<&'a OperationInfo, String> {
        self.operation(method)
            .ok_or_else(|| format!("Operation ID missing for {}", method.name))
    }

    /// `generateCommandMeta`.
    fn command_meta(
        &self,
        method: &Method,
        resource: &str,
        group: Option<&str>,
        hide: bool,
    ) -> Result<Map<String, Value>, String> {
        let op = self
            .operation(method)
            .ok_or_else(|| format!("Failed to resolve operation for method: {}", method.operation_id))?;
        let derived = derive_downgraded(method, resource, op)?;
        let positional: Vec<&Arg> = derived.positionals().collect();
        let mut options: Vec<Arg> = derived.options().cloned().collect();
        if resource == "workers" {
            for p in &op.path_params {
                if !is_worker_name(&p.name.replace('_', "-")) || options.iter().any(|a| a.name == "worker") {
                    continue;
                }
                let description = p
                    .description
                    .clone()
                    .unwrap_or_else(|| format!("The {}", p.name.replace('_', " ")));
                let mut worker = Arg::new(
                    "worker".to_owned(),
                    description,
                    ArgType::String,
                    true,
                    false,
                    Origin::Path(p.name.clone()),
                );
                worker.is_worker_name = true;
                options.push(worker);
            }
        }
        let mut full_path = vec![resource.to_owned()];
        full_path.extend(group.into_iter().flat_map(|g| g.split('/')).map(str::to_owned));
        full_path.push(method.name.clone());
        let command = format!("cf {}", full_path.join(" "));
        let positional_usage = positional
            .iter()
            .map(|a| {
                let name = if a.ty == ArgType::Array {
                    format!("{}...", a.name)
                } else {
                    a.name.clone()
                };
                if a.required {
                    format!("<{name}>")
                } else {
                    format!("[{name}]")
                }
            })
            .collect::<Vec<_>>()
            .join(" ");
        let suffix = if options.is_empty() { "" } else { " [options]" };
        let usage = if positional_usage.is_empty() {
            format!("{command}{suffix}")
        } else {
            format!("{command} {positional_usage}{suffix}")
        };
        let arguments = positional
            .iter()
            .enumerate()
            .map(|(position, a)| ArgumentMeta {
                name: &a.name,
                position,
                ty: a.ty.scalar(),
                required: a.required,
                description: &a.description,
                choices: a.choices.as_deref().filter(|c| !c.is_empty()),
            })
            .collect();
        let mut option_metas: Vec<OptionMeta> = options
            .iter()
            .map(|a| OptionMeta {
                name: &a.name,
                ty: a.ty.scalar(),
                required: a.required,
                description: &a.description,
                default: a.default.as_ref(),
                choices: a.choices.as_deref().filter(|c| !c.is_empty()),
            })
            .collect();
        const FALSE: Value = Value::Bool(false);
        option_metas.push(OptionMeta {
            default: Some(&FALSE),
            ..OptionMeta::generated(
                "dry-run",
                "boolean",
                "Validate and show what would happen without executing",
            )
        });
        if derived.has_body {
            option_metas.push(OptionMeta::generated(
                "body",
                "string",
                "Raw JSON request body (bypasses individual flags)",
            ));
        }
        if derived.has_file_upload {
            option_metas.push(OptionMeta::generated(
                "file",
                "string",
                "Path to a file to upload as the request body",
            ));
        }
        let meta = CommandMeta {
            command,
            name: &method.name,
            full_path,
            description: &method.description,
            summary: summary(method),
            usage,
            arguments,
            options: option_metas,
            category: category(&method.name),
            has_request_body: op.has_request_body,
            http_method: op.method.as_str(),
            api_path: &op.path,
            operation_id: &method.operation_id,
            hide_command: hide,
        };
        match to_value(meta) {
            Value::Object(meta) => Ok(meta),
            _ => unreachable!("a struct serializes to an object"),
        }
    }

    /// `generateSchemaInfo`.
    fn schema_info(&self, method: &Method, resource: &str) -> Result<Option<Value>, String> {
        let Some(op) = self.operation(method) else {
            return Ok(None);
        };
        let derived = derive_downgraded(method, resource, op)?;
        let params = |list: &'a [ParameterInfo]| {
            list.iter()
                .map(|p| ParamMeta {
                    name: &p.name,
                    ty: p.ty.map_or("unknown", JsonType::as_str),
                    required: p.required,
                })
                .collect()
        };
        let request_body_fields = derived
            .args
            .iter()
            .filter(|a| a.is_body())
            .map(|a| FieldMeta {
                name: &a.name,
                ty: a.ty.scalar(),
                required: a.required,
                description: &a.description,
            })
            .collect();
        Ok(Some(to_value(SchemaInfo {
            operation_id: &method.operation_id,
            http_method: op.method.as_str(),
            path: &op.path,
            path_params: params(&op.path_params),
            query_params: params(&op.query_params),
            has_request_body: op.has_request_body,
            request_body_fields,
        })))
    }

    /// `generateCommandFile`.
    fn command_file(
        &self,
        method: &Method,
        resource: &str,
        group: Option<&str>,
        emit_path: &str,
    ) -> Result<String, String> {
        let op = self.resolve(method)?;
        let (ctx, command) = context(method, resource, group, op, root_prefix(emit_path))?;
        let mut handler_body = String::new();
        handler(&ctx, &mut handler_body).map_err(|e| e.to_string())?;
        let mut builder_body = String::new();
        builder(&ctx, &mut builder_body).map_err(|e| e.to_string())?;
        let usage = leaf_usage(method, resource, group, &command);
        let telemetry_path = match group {
            Some(group) if !group.is_empty() => format!("{resource} {} {}", group.replace('/', " "), method.name),
            _ => format!("{resource} {}", method.name),
        };
        let has_force = ctx.derived.args.iter().any(|a| a.name == "force");
        let generated_force = ctx.is_delete() && !has_force;
        let safe_flags = telemetry_safe_flags(
            &ctx.derived.args,
            generated_force,
            ctx.output_kind == crate::emit::OutputKind::Binary,
        );
        let safe = format!(
            "[{}]",
            safe_flags
                .iter()
                .map(|f| format!("'{}'", escape_single(f)))
                .collect::<Vec<_>>()
                .join(", ")
        );
        let aliases = if generated_force {
            ", shortFlagAliases: { f: { canonical: 'force', type: 'boolean' } }"
        } else {
            ""
        };
        Ok(format!(
            "/**
 * {name} command
 * @generated from apis/overlays/{resource}.ts
 */
{imports}

function builder(yargs: Argv<CommonYargsOptions>) {{
return yargs
.usage({usage})
{builder_body};
}}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {{
  command: '{command}',
  describe: '{describe}',
  builder,
  handler: async (argv): Promise<void> =>
    runWithTelemetry(
      {{
        command: '{telemetry}',
        classification: {{ safeFlags: {safe}{aliases} }} satisfies ArgClassification<Args>,
      }},
      argv as Record<string, unknown>,
      async () => {{
{handler_body}}},
    ),
}};

export default command;
",
            name = method.name,
            imports = imports(&ctx),
            usage = quote(&usage),
            describe = escape_single(&summary(method)),
            telemetry = escape_single(&telemetry_path),
        ))
    }

    /// `emitLeafCommand`.
    fn leaf(
        &mut self,
        method: &Method,
        resource: &str,
        group: Option<&str>,
        hide: bool,
        emit_path: &str,
        leaves: &mut Vec<String>,
    ) {
        let key = emit_path.trim_end_matches(".ts");
        let files = self.mode == Mode::Files;
        let result = match self.hand.leaf_override_dir(key) {
            None if files => self
                .command_file(method, resource, group, emit_path)
                .map(|code| (Some(code), None)),
            // What writing the file checks, so that the metadata pass
            // reports what the files would.
            None => self
                .resolve(method)
                .and_then(output_kind)
                .and_then(|_| self.command_meta(method, resource, group, hide))
                .map(|meta| (None, Some(meta))),
            Some(dir) => self.command_meta(method, resource, group, hide).and_then(|mut meta| {
                for (k, v) in self.hand.leaf_override_meta(dir)? {
                    meta.insert(k.clone(), v.clone());
                }
                Ok((None, Some(meta)))
            }),
        };
        let Some((code, meta)) = collect(&mut self.errors, result) else {
            return;
        };
        if !files {
            if let Some(meta) = meta {
                self.metas.push(Value::Object(meta));
            }
            let info = self.schema_info(method, resource);
            if let Some(Some(info)) = collect(&mut self.errors, info) {
                let path = match group {
                    None => format!("{resource} {}", method.name),
                    Some(group) => format!("{resource} {} {}", group.replace('/', " "), method.name),
                };
                self.schemas.insert(path, info);
            }
        }
        if let Some(code) = code {
            self.files.push(Out::new(emit_path, code));
        }
        leaves.push(method.name.clone());
    }

    /// `processMethodGroup`: the names of the group's leaves and subgroups.
    fn group(
        &mut self,
        group: &Group,
        prefix: &str,
        resource: &str,
        group_path: &str,
        hide: bool,
    ) -> (Vec<String>, Vec<String>) {
        let mut leaves = Vec::new();
        let mut subgroups = Vec::new();
        let leaf_names = live_method_names(&group.items);
        for item in &group.items {
            match item {
                Item::Method(method) => {
                    if !method.deprecated {
                        let path = format!("{prefix}{}.ts", method.name);
                        self.leaf(method, resource, Some(group_path), hide, &path, &mut leaves);
                    }
                }
                Item::Group(child) => {
                    if leaf_names.contains(&child.name.as_str()) || !has_live_content(child) {
                        continue;
                    }
                    let child_prefix = format!("{prefix}{}/", child.name);
                    let child_path = format!("{group_path}/{}", child.name);
                    let (commands, subs) = self.group(child, &child_prefix, resource, &child_path, hide);
                    let index = self.group_index(child, resource, &commands, &subs, &child_prefix);
                    if let Some(index) = collect(&mut self.errors, index)
                        && self.mode == Mode::Files
                    {
                        self.files.push(Out::new(format!("{child_prefix}index.ts"), index));
                    }
                    subgroups.push(child.name.clone());
                }
            }
        }
        if self.mode == Mode::Metadata {
            let parent = prefix.trim_end_matches('/');
            for leaf in self.hand.leaves(parent) {
                let meta = self.hand.leaf_meta(&leaf.parent, leaf);
                if let Some(meta) = collect(&mut self.errors, meta) {
                    self.metas.push(meta);
                }
            }
        }
        leaves.sort_by(|a, b| code_unit_compare(a, b));
        subgroups.sort_by(|a, b| locale_compare(a, b));
        (leaves, subgroups)
    }

    #[allow(clippy::too_many_arguments)]
    fn index_file(
        &self,
        command: &str,
        describe: &str,
        resource: &str,
        header: &str,
        commands: &[String],
        prefix: &str,
        subgroups: &[(String, Option<&SubGroup>)],
    ) -> String {
        let mut import_lines = Vec::new();
        let mut registrations = Vec::new();
        // A hand-written command handles `--dry-run` by the strategy it
        // chose, which the index wraps it with.
        let mut wraps = false;
        let mut register = |v: &str, dry_run: Option<&str>| match dry_run {
            None => registrations.push(format!(".command({v})")),
            Some(dry_run) => {
                wraps = true;
                registrations.push(format!(".command(withHandWrittenDryRun({v}, '{dry_run}'))"));
            }
        };
        let parent = prefix.trim_end_matches('/');
        for cmd in commands {
            let v = format!("${}", cmd.replace('-', ""));
            let key = format!("{prefix}{cmd}");
            let module = self
                .hand
                .leaf_module(&key)
                .unwrap_or_else(|| match self.hand.leaf_override_dir(&key) {
                    Some(dir) => format!("#commands/{dir}/index.js"),
                    None => format!("./{cmd}.js"),
                });
            import_lines.push(format!("import {v} from '{module}';"));
            let leaves = self.hand.leaves(parent);
            let leaf = leaves.iter().find(|l| l.name == *cmd);
            register(&v, leaf.map(|l| l.dry_run.as_str()));
        }
        for (name, hand_written) in subgroups {
            let v = format!("${}", name.replace('-', ""));
            let module = match hand_written {
                Some(group) => format!("#commands/{}/index.js", group.dir),
                None => format!("./{name}/index.js"),
            };
            import_lines.push(format!("import {v} from '{module}';"));
            register(&v, hand_written.map(|g| g.dry_run.as_str()));
        }
        let wrapper = if wraps {
            "import { withHandWrittenDryRun } from '#lib/hand-written-dry-run.js';"
        } else {
            ""
        };
        format!(
            "/**
 * {header}
 * @generated from apis/overlays/{resource}.ts
 */
import type {{ CommandModule }} from 'yargs';
import type {{ CommonYargsOptions }} from '#lib/cli-types.js';
{wrapper}
{imports}

const command: CommandModule<CommonYargsOptions> = {{
  command: '{command}',
  describe: '{describe}',

  builder: (yargs) => {{
    return yargs
{registrations}
    .demandCommand(1, \"Please specify a subcommand\");
  }},

  handler: () => {{}},
}};

export default command;
",
            imports = import_lines.join("\n"),
            describe = escape_single(describe),
            registrations = registrations.join("\n"),
        )
    }

    fn assert_no_collisions(
        parent: &str,
        leaves: &[&Leaf],
        commands: &[String],
        groups: &[String],
    ) -> Result<(), String> {
        match leaves
            .iter()
            .find(|l| commands.contains(&l.name) || groups.contains(&l.name))
        {
            Some(leaf) => Err(format!(
                "Hand-written leaf command \"{parent} {}\" collides with a command or group of the same name in the spec. Remove or update it in src/commands/hand-written.ts.",
                leaf.name
            )),
            None => Ok(()),
        }
    }

    /// `generateGroupIndexFile`.
    fn group_index(
        &self,
        group: &Group,
        resource: &str,
        commands: &[String],
        subgroups: &[String],
        prefix: &str,
    ) -> Result<String, String> {
        let parent = prefix.trim_end_matches('/');
        let leaves = self.hand.leaves(parent);
        self.hand.assert_unique_leaves(parent, &leaves)?;
        Self::assert_no_collisions(&parent.replace('/', " "), &leaves, commands, subgroups)?;
        let mut all: Vec<String> = commands
            .iter()
            .cloned()
            .chain(leaves.iter().map(|l| l.name.clone()))
            .collect();
        all.sort_by(|a, b| code_unit_compare(a, b));
        let subs: Vec<(String, Option<&SubGroup>)> = subgroups.iter().map(|s| (s.clone(), None)).collect();
        Ok(self.index_file(
            &group.name,
            &group.description,
            resource,
            &format!("{} command group", group.name),
            &all,
            prefix,
            &subs,
        ))
    }

    /// `generateResourceIndexFile`.
    fn resource_index(&self, command: &Command, commands: &[String], groups: &[String]) -> Result<String, String> {
        let name = command.name.as_str();
        let leaves = self.hand.leaves(name);
        self.hand.assert_unique_leaves(name, &leaves)?;
        let hand_groups = self.hand.subgroups(name);
        for &leaf in &leaves {
            Self::assert_no_collisions(name, &[leaf], commands, groups)?;
            if hand_groups.iter().any(|g| g.name == leaf.name) {
                return Err(format!(
                    "Hand-written leaf command \"{name} {}\" collides with a hand-written sub-group of the same name.",
                    leaf.name
                ));
            }
        }
        if let Some(group) = hand_groups
            .iter()
            .find(|g| commands.contains(&g.name) || groups.contains(&g.name))
        {
            return Err(format!(
                "Hand-written sub-group \"{name} {}\" collides with a command or group of the same name in the spec. Remove or update it in src/commands/hand-written.ts.",
                group.name
            ));
        }
        let mut direct: Vec<String> = commands
            .iter()
            .cloned()
            .chain(leaves.iter().map(|l| l.name.clone()))
            .collect();
        direct.sort_by(|a, b| locale_compare(a, b));
        let mut subs: Vec<(String, Option<&SubGroup>)> = groups
            .iter()
            .map(|g| (g.clone(), None))
            .chain(hand_groups.iter().map(|&g| (g.name.clone(), Some(g))))
            .collect();
        subs.sort_by(|a, b| locale_compare(&a.0, &b.0));
        let (describe, _) = self.hand.parent_override(name);
        Ok(self.index_file(
            name,
            describe.unwrap_or_else(|| first_line(&command.description)),
            name,
            &format!("{name} command"),
            &direct,
            &format!("{name}/"),
            &subs,
        ))
    }

    /// Walks `command`: its leaves and groups, and its resource index, which
    /// the files of its groups and leaves are imported from, and which is
    /// written with `index`. Either mode checks everything the other does,
    /// so the metadata pass reports every error the files would.
    fn command(&mut self, command: &Command, index: bool) -> Result<(), String> {
        let hand = self.hand;
        let (_, expose) = hand.parent_override(&command.name);
        let hide = command.hide_command && !expose;
        let mut direct = Vec::new();
        let mut groups = Vec::new();
        let direct_names = live_method_names(&command.items);
        for item in &command.items {
            match item {
                Item::Method(method) => {
                    if !method.deprecated {
                        let path = format!("{}/{}.ts", command.name, method.name);
                        self.leaf(method, &command.name, None, hide, &path, &mut direct);
                    }
                }
                Item::Group(group) => {
                    if direct_names.contains(&group.name.as_str()) || !has_live_content(group) {
                        continue;
                    }
                    let prefix = format!("{}/{}/", command.name, group.name);
                    let (commands, subs) = self.group(group, &prefix, &command.name, &group.name, hide);
                    let index = self.group_index(group, &command.name, &commands, &subs, &prefix);
                    if let Some(index) = collect(&mut self.errors, index)
                        && self.mode == Mode::Files
                    {
                        self.files.push(Out::new(format!("{prefix}index.ts"), index));
                    }
                    groups.push(group.name.clone());
                }
            }
        }
        direct.sort_by(|a, b| code_unit_compare(a, b));
        groups.sort_by(|a, b| locale_compare(a, b));
        let content = self.resource_index(command, &direct, &groups)?;
        if index {
            self.files.push(Out::new(format!("{}/index.ts", command.name), content));
        }
        if self.mode == Mode::Metadata {
            for leaf in hand.leaves(&command.name) {
                if let Some(meta) = collect(&mut self.errors, hand.leaf_meta(&command.name, leaf)) {
                    self.metas.push(meta);
                }
            }
            for group in hand.subgroups(&command.name) {
                if let Some(metas) = collect(&mut self.errors, hand.subgroup_meta(group)) {
                    self.metas.extend_from_slice(metas);
                }
            }
        }
        Ok(())
    }

    /// Fails with the errors the walk collected, if there are any.
    fn check(&self) -> Result<(), String> {
        if self.errors.is_empty() {
            return Ok(());
        }
        let mut errors = self.errors.clone();
        errors.sort_by(|a, b| code_unit_compare(a, b));
        let lines: Vec<String> = errors.iter().map(|e| format!("  • {e}")).collect();
        Err(format!(
            "{} command(s) failed to generate — cannot generate CLI.\n{}",
            errors.len(),
            lines.join("\n")
        ))
    }
}

/// Returns `meta` with `handWritten` set.
fn with_hand_written(meta: &Value, provenance: Provenance) -> Value {
    let mut meta = meta.clone();
    if let Some(m) = meta.as_object_mut() {
        m.insert("handWritten".to_owned(), to_value(provenance));
    }
    meta
}

/// Reports whether a command has something to call, generated or
/// hand-written.
fn is_live(command: &Command, hand: &HandWritten) -> bool {
    let nested = format!("{}/", command.name);
    let under = |parent: &str| parent == command.name || parent.starts_with(&nested);
    has_live_items(&command.items) || hand.leaves_under(under) || hand.subgroups_under(under)
}

/// Emits the files of the top-level command `command`: a module for each of
/// its leaves, an index for it and each of its groups, and a module for each
/// of its operations. `ops` has its operations. A command with nothing to
/// call has only the operations.
pub fn command_files(ops: &Operations, command: &Command, hand: &HandWritten) -> Result<Vec<Out>, String> {
    // `metadata_files` reports a command that collides with the Access root.
    if command.name == ACCESS {
        return Ok(Vec::new());
    }
    let operations = operation_files(ops);
    if !is_live(command, hand) {
        return Ok(operations);
    }
    let mut walk = Walk::new(ops, hand, Mode::Files);
    walk.command(command, true)?;
    walk.check()?;
    walk.files.extend(operations);
    Ok(walk.files)
}

/// The module of each of `ops`, at its path in the group tree, as
/// `_operations/d1/database/query.ts` for `d1.database.query`, whose
/// default export is its `Operation`, which its command, and hand-written
/// ones, send with `Client.send`. It imports only the runtime's `path` tag,
/// when its path has parameters, so any module can import it.
fn operation_files(ops: &Operations) -> Vec<Out> {
    ops.iter()
        .map(|(id, op)| {
            let import = if uses_path_tag(&op.path) {
                "import { path } from \"#api\";\n\n"
            } else {
                ""
            };
            Out::new(
                format!("{}.ts", operation_path(id)),
                format!(
                    "/** @generated from {id} */\n{import}export default {} as const;\n",
                    operation_literal(op)
                ),
            )
        })
        .collect()
}

/// The name of the synthetic Access root, which only has hand-written
/// commands.
const ACCESS: &str = "access";

fn access() -> Command {
    Command {
        name: ACCESS.to_owned(),
        description: "Access protected applications and services".to_owned(),
        items: Vec::new(),
        hide_command: false,
    }
}

/// The roots of the parent overrides that create theirs, which `commands`
/// doesn't have yet: empty, until hand-written leaves are spliced in.
fn created_roots(commands: &[Command], hand: &HandWritten) -> Result<Vec<Command>, String> {
    Ok(hand
        .created_roots()?
        .into_iter()
        .filter(|p| !commands.iter().any(|c| c.name == p.parent))
        .map(|p| Command {
            name: p.parent.clone(),
            description: p.describe.clone(),
            items: Vec::new(),
            hide_command: !p.expose,
        })
        .collect())
}

/// Emits the files that list every one of `commands`, whose operations
/// `ops` has: the root index and the metadata in `_meta/`, and the indexes
/// of the roots no group generates, the Access root and created ones.
pub fn metadata_files(ops: &Operations, commands: Vec<Command>, hand: &HandWritten) -> Result<Vec<Out>, String> {
    let mut w = Walk::new(ops, hand, Mode::Metadata);
    if commands.iter().any(|c| c.name == ACCESS) {
        return Err("The synthetic Access root collides with a Forge command.".to_owned());
    }
    let synthetic = [access()].into_iter().chain(created_roots(&commands, hand)?);
    let all: Vec<(Command, bool)> = commands
        .into_iter()
        .filter(|c| is_live(c, hand))
        .map(|c| (c, false))
        .chain(synthetic.map(|c| (c, true)))
        .collect();
    for (command, synthetic) in &all {
        w.command(command, *synthetic)?;
    }

    let product_names: Vec<&str> = all.iter().map(|(c, _)| c.name.as_str()).collect();
    let mut root_metas = Vec::new();
    for root in &hand.roots {
        let name = root.name();
        if product_names.contains(&name) {
            w.errors.push(format!(
                "Root hand-written command \"{name}\" collides with a generated product of the same name."
            ));
            continue;
        }
        if let Some(metas) = collect(&mut w.errors, hand.root_meta(root)) {
            root_metas.extend_from_slice(metas);
            w.metas.extend_from_slice(metas);
        }
    }
    let mut all: Vec<Command> = all.into_iter().map(|(c, _)| c).collect();
    all.sort_by(|a, b| locale_compare(&a.name, &b.name));
    w.metas.sort_by(|a, b| locale_compare(&command_of(a), &command_of(b)));

    let entries: Vec<String> = all
        .iter()
        .map(|s| {
            let (describe, expose) = hand.parent_override(&s.name);
            let desc = escape_single(describe.unwrap_or_else(|| first_line(&s.description)));
            let hide = s.hide_command && !expose;
            format!(
                "  {{ command: lazyCommand<CommonYargsOptions>('{name}', '{desc}', () => import('./{name}/index.js'), null), hideCommand: {hide} }}",
                name = s.name
            )
        })
        .collect();
    w.files.push(Out::new(
        "index.ts",
        format!(
            "/**
 * Generated CLI commands
 * @generated
 */
import {{ lazyCommand }} from '#lib/lazy-command.js';
import type {{ CommandModule }} from 'yargs';
import type {{ CommonYargsOptions }} from '#lib/cli-types.js';

export interface GeneratedCommand {{
  command: CommandModule<CommonYargsOptions>;
  hideCommand: boolean;
}}

export const generatedCommands: GeneratedCommand[] = [
{}
];
",
            entries.join(",\n")
        ),
    ));

    fn collect_groups(descriptions: &mut Map<String, Value>, items: &[Item], prefix: &str) {
        for item in items {
            if let Item::Group(group) = item
                && has_live_content(group)
            {
                let key = format!("{prefix} {}", group.name);
                descriptions.insert(key.clone(), json!(group.description));
                collect_groups(descriptions, &group.items, &key);
            }
        }
    }
    let mut descriptions = Map::new();
    for s in &all {
        let (describe, _) = hand.parent_override(&s.name);
        descriptions.insert(s.name.clone(), json!(describe.unwrap_or(&s.description)));
        collect_groups(&mut descriptions, &s.items, &s.name);
        for group in hand.subgroups(&s.name) {
            descriptions.insert(format!("{} {}", s.name, group.name), json!(group.describe));
        }
    }
    for root in &hand.roots {
        descriptions.insert(
            first_word(&root.command).unwrap_or_default().to_owned(),
            json!(root.describe.as_deref().unwrap_or_default()),
        );
    }
    w.files
        .push(Out::new("_meta/commands.json", metadata_file(&w.metas, &descriptions)));

    let mut hand_metas: Vec<Value> = Vec::new();
    for root in &hand.roots {
        for meta in root_metas
            .iter()
            .filter(|m| full_path_of(m).first().map(String::as_str) == Some(root.name()))
        {
            hand_metas.push(with_hand_written(
                meta,
                Provenance {
                    kind: "root",
                    overrides: false,
                    dir: &root.dir,
                    parent: None,
                    emit_key: None,
                },
            ));
        }
    }
    let find = |metas: &[Value], command: &str| metas.iter().rev().find(|m| command_of(m) == command).cloned();
    for leaf in &hand.leaves {
        let key = format!("cf {} {}", leaf.parent.replace('/', " "), leaf.name);
        match find(&w.metas, &key) {
            None => w.errors.push(format!(
                "Hand-written leaf command \"{} {}\" did not produce command metadata.",
                leaf.parent, leaf.name
            )),
            Some(meta) => hand_metas.push(with_hand_written(
                &meta,
                Provenance {
                    kind: "leaf",
                    overrides: false,
                    dir: &leaf.dir,
                    parent: Some(&leaf.parent),
                    emit_key: None,
                },
            )),
        }
    }
    for group in &hand.subgroups {
        for meta in &w.metas {
            let p = full_path_of(meta);
            if p.first() == Some(&group.parent) && p.get(1) == Some(&group.name) {
                hand_metas.push(with_hand_written(
                    meta,
                    Provenance {
                        kind: "subgroup",
                        overrides: false,
                        dir: &group.dir,
                        parent: Some(&group.parent),
                        emit_key: None,
                    },
                ));
            }
        }
    }
    for o in &hand.leaf_overrides {
        let key = format!("cf {}", o.emit_key.replace('/', " "));
        match find(&w.metas, &key) {
            None => w.errors.push(format!(
                "Hand-written leaf override \"{}\" did not produce command metadata.",
                o.emit_key
            )),
            Some(meta) => hand_metas.push(with_hand_written(
                &meta,
                Provenance {
                    kind: "leafOverride",
                    overrides: true,
                    dir: &o.dir,
                    parent: None,
                    emit_key: Some(&o.emit_key),
                },
            )),
        }
    }
    hand_metas.sort_by(|a, b| locale_compare(&command_of(a), &command_of(b)));
    // Every hand-written command handles `--dry-run`: the registry's types
    // make it choose how, and its metadata must declare the flag.
    for meta in &hand_metas {
        let dry_runs: Vec<&Value> = meta["options"]
            .as_array()
            .into_iter()
            .flatten()
            .filter(|option| option["name"] == "dry-run")
            .collect();
        if !matches!(dry_runs[..], [option] if option["type"] == "boolean") {
            let dir = to_js_string(&meta["handWritten"]["dir"]);
            w.errors.push(format!(
                "{} ({dir}/meta.ts) must declare exactly one boolean --dry-run option.",
                command_of(meta)
            ));
        }
    }
    let mut keys: Vec<String> = Vec::new();
    for meta in &hand_metas {
        let p = full_path_of(meta);
        for i in 1..p.len() {
            crate::js::push_unique(&mut keys, p[..i].join(" "));
        }
    }
    let hand_descriptions: Map<String, Value> = descriptions
        .iter()
        .filter(|(k, _)| keys.contains(k))
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect();
    w.files.push(Out::new(
        "_meta/hand-written-commands.json",
        metadata_file(&hand_metas, &hand_descriptions),
    ));

    let mut schemas: Vec<(String, Value)> = std::mem::take(&mut w.schemas).into_iter().collect();
    schemas.sort_by(|(a, _), (b, _)| locale_compare(a, b));
    let schemas = MetaFile {
        version: "1.0",
        generated_at: "build-time",
        contents: Schemas {
            schemas: schemas.into_iter().collect(),
        },
    };
    w.files.push(Out::new("_meta/schemas.json", pretty(&schemas)));

    w.check()?;
    Ok(w.files)
}

fn metadata_file(commands: &[Value], descriptions: &Map<String, Value>) -> String {
    pretty(&MetaFile {
        version: "1.0",
        generated_at: "build-time",
        contents: Commands {
            commands,
            descriptions: Some(descriptions).filter(|d| !d.is_empty()),
        },
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_support::{arg, method};

    fn list(summary: Option<&str>, description: &str) -> Method {
        Method {
            summary: summary.map(str::to_owned),
            description: description.to_owned(),
            ..method("list", "test-list")
        }
    }

    const DESCRIPTION: &str = "Full first line.\nFull second line.";

    #[test]
    fn uses_the_method_summary_for_compact_contexts() {
        assert_eq!(
            summary(&list(Some("  List test records  "), DESCRIPTION)),
            "List test records"
        );
    }

    #[test]
    fn falls_back_to_the_first_description_line() {
        assert_eq!(summary(&list(None, &format!("\n{DESCRIPTION}"))), "Full first line.");
    }

    #[test]
    fn uses_the_full_description_in_leaf_help_usage() {
        assert_eq!(
            leaf_usage(&list(None, DESCRIPTION), "test", Some("records/nested"), "list <id>"),
            "$0 test records nested list <id>\n\nFull first line.\nFull second line."
        );
    }

    fn flag(name: &str, ty: ArgType) -> Arg {
        arg(name, ty, Origin::Body(vec![name.to_owned()]))
    }

    #[test]
    fn excludes_sensitive_boolean_and_enum_fields_from_telemetry() {
        let args = [
            flag("public-boolean", ArgType::Boolean),
            flag("public-enum", ArgType::Enum),
            flag("sortBy", ArgType::Enum),
            Arg {
                secret: true,
                ..flag("secret-boolean", ArgType::Boolean)
            },
            Arg {
                secret: true,
                ..flag("secret-enum", ArgType::Enum)
            },
            Arg {
                positional: true,
                ..flag("positional-boolean", ArgType::Boolean)
            },
            flag("free-form", ArgType::String),
        ];
        assert_eq!(
            telemetry_safe_flags(&args, false, false),
            ["public-boolean", "public-enum", "sort-by", "dry-run"]
        );
    }

    #[test]
    fn includes_generator_owned_boolean_flags_in_telemetry() {
        assert_eq!(telemetry_safe_flags(&[], true, false), ["dry-run", "force"]);
        assert_eq!(telemetry_safe_flags(&[], false, true), ["dry-run", "text"]);
    }
}
