//! Derives the positionals and flags of a command from its operation: the
//! single source of both the generated command and its metadata.

use forge::HttpMethod;
use serde_json::{Map, Value};

use crate::commands::Method;
use crate::js::{kebab, template_params, to_js_string, truthy};
use crate::operation::{JsonType, MultipartField, MultipartInfo, OperationInfo};

/// The kind of value an argument takes: an `Enum` is a string from a fixed
/// list, an `Array` repeated scalar values, and an `ObjectArray` one
/// JSON-valued flag holding an array of objects.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ArgType {
    String,
    Number,
    Boolean,
    Enum,
    Array,
    ObjectArray,
    NestedArray,
    ObjectMap,
    ScalarUnion,
}

impl ArgType {
    /// The type yargs is told, and that the metadata lists: enums and
    /// arrays are strings.
    pub fn scalar(self) -> &'static str {
        match self {
            ArgType::Number => "number",
            ArgType::Boolean => "boolean",
            _ => "string",
        }
    }
}

/// Where an argument's value goes.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Origin {
    Path(String),
    Query(String),
    Header(String),
    Body(Vec<String>),
}

/// How `@file` values are read, for string body flags.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct FromFile {
    /// The format, or none for an override without one.
    pub format: Option<String>,
}

/// A positional or flag of a command.
#[derive(Clone, Debug)]
pub struct Arg {
    /// The kebab-case name yargs registers.
    pub name: String,
    pub description: String,
    pub ty: ArgType,
    pub choices: Option<Vec<String>>,
    pub default: Option<Value>,
    pub required: bool,
    pub positional: bool,
    pub origin: Origin,
    pub optional_parent_path: Option<Vec<String>>,
    pub conflicts: Option<Vec<String>>,
    pub implies: Option<Vec<String>>,
    pub secret: bool,
    pub from_file: Option<FromFile>,
    pub is_zone: bool,
    pub is_worker_name: bool,
}

impl Arg {
    pub fn new(
        name: String,
        description: String,
        ty: ArgType,
        required: bool,
        positional: bool,
        origin: Origin,
    ) -> Arg {
        Arg {
            name,
            description,
            ty,
            choices: None,
            default: None,
            required,
            positional,
            origin,
            optional_parent_path: None,
            conflicts: None,
            implies: None,
            secret: false,
            from_file: None,
            is_zone: false,
            is_worker_name: false,
        }
    }

    fn classified(mut self, cls: Classification) -> Arg {
        self.is_zone = cls.is_zone;
        self.is_worker_name = cls.is_worker_name;
        self
    }

    pub fn is_path(&self) -> bool {
        matches!(self.origin, Origin::Path(_))
    }

    pub fn is_body(&self) -> bool {
        matches!(self.origin, Origin::Body(_))
    }

    pub fn is_query(&self) -> bool {
        matches!(self.origin, Origin::Query(_))
    }

    pub fn has_choices(&self) -> bool {
        self.choices.as_ref().is_some_and(|c| !c.is_empty())
    }

    pub fn body_path(&self) -> Option<&[String]> {
        match &self.origin {
            Origin::Body(path) => Some(path),
            _ => None,
        }
    }

    /// The emitted `format` argument of `resolveFileToken`.
    pub fn file_format(&self) -> String {
        match self.from_file.as_ref().and_then(|f| f.format.as_deref()) {
            Some(format) => crate::js::quote(format),
            None => "undefined".to_owned(),
        }
    }
}

/// A body object that is optional but has required fields: they are only
/// required when some flag of the object is set.
#[derive(Clone, Debug)]
pub struct OptionalParentGroup {
    pub parent_name: String,
    /// The flags of the object without a default, which show it was set.
    pub group_set_flags: Vec<String>,
    pub required_flags: Vec<String>,
}

/// What a command takes, and the facts about its operation every part of
/// the generator branches on.
#[derive(Clone, Debug)]
pub struct Derived {
    pub args: Vec<Arg>,
    pub optional_parent_groups: Vec<OptionalParentGroup>,
    pub is_mutating: bool,
    pub has_body: bool,
    pub has_empty_body: bool,
    pub has_body_params: bool,
    pub has_file_upload: bool,
    pub multipart: Option<MultipartInfo>,
    pub multipart_flag_fields: Vec<MultipartFieldFlag>,
    pub multipart_file_fields: Vec<MultipartFieldFlag>,
}

impl Derived {
    pub fn positionals(&self) -> impl Iterator<Item = &Arg> {
        self.args.iter().filter(|a| a.positional)
    }

    pub fn options(&self) -> impl Iterator<Item = &Arg> {
        self.args.iter().filter(|a| !a.positional)
    }

    pub fn body_options(&self) -> impl Iterator<Item = &Arg> {
        self.args.iter().filter(|a| a.is_body() && !a.positional)
    }

    pub fn query_args(&self) -> impl Iterator<Item = &Arg> {
        self.args.iter().filter(|a| a.is_query())
    }

    pub fn header_args(&self) -> impl Iterator<Item = &Arg> {
        self.args.iter().filter(|a| matches!(a.origin, Origin::Header(_)))
    }
}

#[derive(Clone, Debug, Default, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FlagPolicy {
    pub global_options: Vec<String>,
    pub future_options: Vec<String>,
    pub owner_text: std::collections::HashMap<String, String>,
}

struct FlagNames<'a> {
    where_: String,
    overrides: &'a Map<String, Value>,
    policy: &'a FlagPolicy,
    command: Vec<String>,
    claims: Vec<(String, String, bool, String)>,
    clashes: Vec<String>,
}

impl FlagNames<'_> {
    fn name(&mut self, location: &str, key: &str, natural: String) -> String {
        let at = match location {
            "body" => format!("body field `{key}`"),
            "form" => format!("form-data field `{key}`"),
            "header" => format!("header `{key}`"),
            _ => format!("{location} parameter `{key}`"),
        };
        let raw = Override::of(self.overrides, key).nullish("flagName");
        let valid = |s: &str| {
            s.split('-').enumerate().all(|(i, part)| {
                !part.is_empty()
                    && part.bytes().all(|b| b.is_ascii_lowercase() || b.is_ascii_digit())
                    && (i > 0 || part.as_bytes()[0].is_ascii_lowercase())
            })
        };
        if raw.is_some_and(|v| !v.as_str().is_some_and(valid)) {
            self.clashes.push(format!(
                "{at} has x-forge-params[\"{key}\"].flagName {}, which is not a kebab-case flag name.",
                raw.unwrap()
            ));
            return natural;
        }
        let explicit = raw.is_some();
        let flag = raw.and_then(Value::as_str).map(str::to_owned).unwrap_or(natural);
        let normalized = kebab(&flag);
        let owner = if self.policy.global_options.contains(&normalized) {
            Some("global")
        } else if self.policy.future_options.contains(&normalized) {
            Some("future")
        } else if normalized.starts_with("experimental-") {
            Some("experimental")
        } else if normalized.len() == 1 && normalized.as_bytes()[0].is_ascii_lowercase() {
            Some("single-letter")
        } else if self.command.contains(&normalized) {
            Some("command")
        } else {
            None
        };
        let source = |key: &str, explicit| {
            if explicit {
                format!(" (from x-forge-params[\"{key}\"].flagName)")
            } else {
                String::new()
            }
        };
        if let Some(owner) = owner {
            let text = self
                .policy
                .owner_text
                .get(owner)
                .map_or("is reserved by cf", String::as_str);
            let fix = if explicit {
                "Choose another flagName.".to_owned()
            } else {
                format!("Set x-forge-params[\"{key}\"].flagName.")
            };
            self.clashes.push(format!(
                "{at} → --{normalized}{}, which {text}. {fix}",
                source(key, explicit)
            ));
        }
        if let Some((other, _, other_explicit, other_key)) = self.claims.iter().find(|(_, f, _, _)| f == &normalized)
            && (explicit || *other_explicit)
        {
            self.clashes.push(format!(
                "{at}{} and {other}{} both resolve to --{normalized}. Give each its own flagName.",
                source(key, explicit),
                source(other_key, *other_explicit)
            ));
        }
        self.claims.push((at, normalized, explicit, key.to_owned()));
        flag
    }
    fn refuse_override(&mut self, key: &str, filled_by: &str) {
        if Override::of(self.overrides, key).nullish("flagName").is_some() {
            self.clashes.push(format!("path parameter `{key}` is filled by {filled_by}, so x-forge-params[\"{key}\"].flagName has no effect. Remove it."));
        }
    }
    fn assert_no_clashes(&self) -> Result<(), String> {
        if self.clashes.is_empty() {
            return Ok(());
        }
        Err(format!(
            "{}: API fields need other CLI flag names:\n{}\n    A flagName renames only the CLI flag; the wire name stays. Until the API schema sets one, add a guarded entry to packages/cli/generator/flag-names-cli-compat.ts.",
            self.where_,
            self.clashes
                .iter()
                .map(|c| format!("      {c}"))
                .collect::<Vec<_>>()
                .join("\n")
        ))
    }
}

pub fn is_zone_path_param(name: &str) -> bool {
    ZONE_ARG_NAMES.contains(&flag_name(name).as_str())
}

pub fn option_defaults<'a>(d: &'a Derived, op: &OperationInfo) -> std::collections::HashMap<&'a str, &'a Value> {
    let conflict_flags: Vec<_> = d
        .args
        .iter()
        .filter_map(|a| {
            a.conflicts
                .as_ref()
                .filter(|v| !v.is_empty())
                .map(|v| std::iter::once(kebab(&a.name)).chain(v.iter().map(|n| kebab(n))))
        })
        .flatten()
        .collect();
    d.options().filter(|a| {
        let discriminator = matches!((&op.body_discriminator, &a.origin), (Some(disc), Origin::Body(path)) if path.len() == 1 && path[0] == disc.field);
        !(matches!(a.ty, ArgType::Array | ArgType::ObjectArray | ArgType::NestedArray | ArgType::ObjectMap | ArgType::ScalarUnion) || conflict_flags.contains(&kebab(&a.name)) || a.is_body() && matches!(op.method, HttpMethod::Patch | HttpMethod::Put) && !discriminator)
    }).filter_map(|a| a.default.as_ref().map(|v| (a.name.as_str(), v))).collect()
}

#[derive(Clone, Debug)]
pub struct MultipartFieldFlag {
    pub field: MultipartField,
    pub flag: String,
}

pub fn multipart_file_flag_description(field: &MultipartField) -> String {
    let repeat = if field.ty == JsonType::Array {
        " Repeat for multiple files."
    } else {
        ""
    };
    format!(
        "Literal content or @path/to/file for the `{}` form field.{repeat} {}",
        field.name, field.description
    )
}

pub const ACCOUNT_PATH_PARAMS: &[&str] = &["account_id", "account_identifier", "accountId"];
pub const ZONE_PATH_PARAMS: &[&str] = &["zone_id", "zone_identifier", "zoneId"];

const ZONE_ARG_NAMES: &[&str] = &["zoneId", "zone_id", "zone-id", "zone"];
const WORKER_NAME_ARGS: &[&str] = &["worker", "script-name", "scriptName", "script_name"];

pub fn is_worker_name(name: &str) -> bool {
    WORKER_NAME_ARGS.contains(&name)
}

const PAIR: &str = "{account_or_zone}/{account_or_zone_id}";

/// Reports whether `path` pairs `{account_or_zone}/{account_or_zone_id}` as
/// whole segments.
pub fn has_account_or_zone_scope(path: &str) -> bool {
    path.match_indices(PAIR).any(|(i, _)| {
        let end = i + PAIR.len();
        (i == 0 || path[..i].ends_with('/')) && (end == path.len() || path[end..].starts_with('/'))
    })
}

/// The generated local that holds a paired account/zone path parameter.
pub fn account_or_zone_local(path: &str, param: &str) -> Option<&'static str> {
    if !has_account_or_zone_scope(path) {
        return None;
    }
    match param {
        "account_or_zone" => Some("accountOrZone"),
        "account_or_zone_id" => Some("accountOrZoneId"),
        _ => None,
    }
}

/// The argv key that holds the value of the `{wire}` placeholder.
pub fn path_param_read_key(args: &[Arg], wire: &str) -> String {
    let arg = args
        .iter()
        .find(|a| matches!(&a.origin, Origin::Path(name) if name == wire) && !a.is_worker_name);
    kebab(arg.map_or(wire, |a| &a.name))
}

fn flag_name(name: &str) -> String {
    name.replace(['_', '.'], "-")
}

fn natural_flag(p: &crate::operation::ParameterInfo) -> String {
    p.sdk_name.as_ref().map_or_else(|| flag_name(&p.name), |s| kebab(s))
}

fn description_from_name(name: &str) -> String {
    name.split('_')
        .enumerate()
        .map(|(i, word)| match word {
            "id" | "identifier" => "ID".to_owned(),
            word if i == 0 => crate::js::upper_first(word),
            word => word.to_owned(),
        })
        .collect::<Vec<_>>()
        .join(" ")
}

fn body_arg_type(ty: JsonType, item_type: Option<JsonType>) -> ArgType {
    match ty {
        JsonType::Number => ArgType::Number,
        JsonType::Boolean => ArgType::Boolean,
        JsonType::Array if item_type == Some(JsonType::Object) => ArgType::ObjectArray,
        JsonType::Array if item_type == Some(JsonType::Array) => ArgType::NestedArray,
        JsonType::Array => ArgType::Array,
        JsonType::Object => ArgType::ObjectMap,
        JsonType::ScalarUnion => ArgType::ScalarUnion,
        JsonType::String => ArgType::String,
    }
}

#[derive(Clone, Copy)]
struct Classification {
    is_zone: bool,
    is_worker_name: bool,
}

fn classify(name: &str, workers: bool) -> Classification {
    Classification {
        is_zone: ZONE_ARG_NAMES.contains(&name),
        is_worker_name: workers && is_worker_name(name),
    }
}

/// A plain-object override of `x-forge-params`, read as JavaScript reads
/// `override?.key`.
#[derive(Clone, Copy)]
struct Override<'a>(Option<&'a Value>);

impl<'a> Override<'a> {
    fn of(overrides: &'a Map<String, Value>, key: &str) -> Self {
        Override(overrides.get(key))
    }

    fn get(self, key: &str) -> Option<&'a Value> {
        self.0.and_then(|v| v.get(key))
    }

    /// `override?.key ?? ...`: the member unless it is null or missing.
    fn nullish(self, key: &str) -> Option<&'a Value> {
        self.get(key).filter(|v| !v.is_null())
    }

    fn string(self, key: &str) -> Option<String> {
        self.nullish(key).map(to_js_string)
    }

    fn truthy(self, key: &str) -> bool {
        self.get(key).is_some_and(truthy)
    }

    /// The override of `required`, or else `required`.
    fn required(self, required: bool) -> bool {
        self.nullish("required").map_or(required, truthy)
    }

    fn present(self) -> bool {
        self.0.is_some_and(|v| !v.is_null())
    }
}

/// `deriveArgsFromOp`.
pub fn derive(method: &Method, resource: &str, op: &OperationInfo) -> Result<Derived, String> {
    if method.has_args {
        return Err(format!("Method provided explicit CLI args: {}", op.path));
    }
    let workers = resource == "workers";
    let empty = Map::new();
    let overrides = method.params.as_ref().unwrap_or(&empty);
    let has_file_upload = op.request_content_types.iter().any(|c| c != "application/json");
    let mut command = vec![
        "dry-run".to_owned(),
        "body".to_owned(),
        "force".to_owned(),
        "f".to_owned(),
    ];
    if has_file_upload {
        command.push("file".to_owned());
    }
    if crate::emit::output_kind(op)? == crate::emit::OutputKind::Binary {
        command.push("text".to_owned());
    }
    if workers && template_params(&op.path).iter().any(|p| is_worker_name(&flag_name(p))) {
        command.push("script-name".to_owned());
    }
    let mut names = FlagNames {
        where_: format!("{} {} ({})", op.method.as_str(), op.path, method.operation_id),
        overrides,
        policy: &op.flag_policy,
        command,
        claims: Vec::new(),
        clashes: Vec::new(),
    };
    let mut args = Vec::new();
    path_params(&mut args, op, overrides, method, workers, &mut names);
    query_params(&mut args, op, overrides, workers, &mut names);
    header_params(&mut args, op, workers, &mut names);
    body_params(&mut args, op, overrides, workers, &mut names);

    let optional_parent_groups = optional_parents(&args);
    let is_mutating = !matches!(op.method, HttpMethod::Get | HttpMethod::Head);
    let only_json = op.request_content_types.iter().all(|c| c == "application/json");
    let multipart = op
        .request_content_types
        .iter()
        .any(|c| c == "multipart/form-data")
        .then(|| op.multipart.clone())
        .flatten();
    let mut multipart_flag_fields = Vec::new();
    let mut multipart_file_fields = Vec::new();
    if let Some(m) = &multipart {
        for field in m
            .fields
            .iter()
            .filter(|f| !f.is_binary && m.payload_field.as_ref() != Some(&f.name))
        {
            let twin = args
                .iter()
                .find(|a| matches!(&a.origin, Origin::Body(path) if path.len() == 1 && path[0] == field.name));
            let flag = twin.map_or_else(
                || names.name("form", &field.name, kebab(&field.name)),
                |a| a.name.clone(),
            );
            multipart_flag_fields.push(MultipartFieldFlag {
                field: field.clone(),
                flag: kebab(&flag),
            });
        }
        let mut taken: Vec<_> = args
            .iter()
            .map(|a| kebab(&a.name))
            .chain(multipart_flag_fields.iter().map(|f| f.flag.clone()))
            .collect();
        for field in m
            .fields
            .iter()
            .filter(|f| f.is_binary && (m.payload_field.as_ref() != Some(&f.name) || f.ty == JsonType::Array))
        {
            let natural = kebab(&flag_name(field.name.trim_start_matches(['_', '.'])));
            if natural.is_empty()
                || !natural.as_bytes()[0].is_ascii_alphanumeric()
                || !natural
                    .bytes()
                    .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'-')
            {
                continue;
            }
            let flag = names.name("form", &field.name, natural);
            if taken.contains(&flag) {
                continue;
            }
            taken.push(flag.clone());
            multipart_file_fields.push(MultipartFieldFlag {
                field: field.clone(),
                flag,
            });
        }
    }
    names.assert_no_clashes()?;
    Ok(Derived {
        has_body_params: args.iter().any(Arg::is_body) && is_mutating,
        args,
        optional_parent_groups,
        is_mutating,
        has_body: is_mutating && op.has_request_body,
        has_empty_body: op.has_request_body
            && op.request_body_ref.is_none()
            && op.body_params.is_empty()
            && op.multipart.is_none()
            && !op.request_body_is_array
            && only_json,
        has_file_upload: op.request_content_types.iter().any(|c| c != "application/json"),
        multipart,
        multipart_flag_fields,
        multipart_file_fields,
    })
}

/// `applyOptionalParentDowngrade`: makes the required fields of optional
/// body objects optional, as a `.check()` enforces them instead.
pub fn downgrade_optional_parents(derived: &mut Derived) {
    let downgraded: Vec<String> = derived
        .optional_parent_groups
        .iter()
        .flat_map(|g| g.required_flags.iter().cloned())
        .collect();
    for arg in &mut derived.args {
        if arg.is_body() && !arg.positional && downgraded.contains(&arg.name) {
            arg.required = false;
        }
    }
}

/// [`derive`], then [`downgrade_optional_parents`].
pub fn derive_downgraded(method: &Method, resource: &str, op: &OperationInfo) -> Result<Derived, String> {
    let mut derived = derive(method, resource, op)?;
    downgrade_optional_parents(&mut derived);
    Ok(derived)
}

fn optional_parents(args: &[Arg]) -> Vec<OptionalParentGroup> {
    let body_args: Vec<_> = args.iter().filter(|a| a.is_body() && !a.positional).collect();
    let mut parents = Vec::new();
    for a in &body_args {
        if a.required
            && let Some(parent) = &a.optional_parent_path
            && !parents.contains(parent)
        {
            parents.push(parent.clone());
        }
    }
    parents
        .into_iter()
        .map(|parent| OptionalParentGroup {
            parent_name: parent.iter().map(|p| kebab(p)).collect::<Vec<_>>().join("-"),
            group_set_flags: body_args
                .iter()
                .filter(|a| {
                    a.body_path()
                        .is_some_and(|p| p.len() > parent.len() && p.starts_with(&parent))
                        && a.default.is_none()
                })
                .map(|a| a.name.clone())
                .collect(),
            required_flags: body_args
                .iter()
                .filter(|a| a.required && a.optional_parent_path.as_ref() == Some(&parent))
                .map(|a| a.name.clone())
                .collect(),
        })
        .collect()
}

fn path_params(
    out: &mut Vec<Arg>,
    op: &OperationInfo,
    overrides: &Map<String, Value>,
    method: &Method,
    workers: bool,
    names: &mut FlagNames,
) {
    let detected: Vec<String> = template_params(&op.path)
        .into_iter()
        .filter(|name| !ACCOUNT_PATH_PARAMS.contains(&name.as_str()) && account_or_zone_local(&op.path, name).is_none())
        .collect();
    let no_positionals = method.name == "list" || method.name.starts_with("bulk");
    let subject = if no_positionals { None } else { detected.last() };
    for p in &detected {
        let o = Override::of(overrides, p);
        if o.truthy("hidden") {
            continue;
        }
        let parameter = op.path_params.iter().find(|a| a.name == *p);
        let cls = classify(&flag_name(p), workers);
        if cls.is_zone {
            names.refuse_override(p, "--zone");
            continue;
        }
        let default = o.nullish("default").cloned();
        let positional =
            !cls.is_worker_name && default.is_none() && o.nullish("positional").map_or(Some(p) == subject, truthy);
        let emitted = if cls.is_worker_name {
            names.refuse_override(p, "--worker");
            "worker".to_owned()
        } else {
            names.name("path", p, parameter.map_or_else(|| flag_name(p), natural_flag))
        };
        let description = o
            .string("description")
            .or_else(|| parameter.and_then(|p| p.description.clone()))
            .unwrap_or_else(|| description_from_name(p));
        let mut arg = Arg::new(
            emitted,
            description,
            ArgType::String,
            default.is_none() && o.required(true),
            positional,
            Origin::Path(p.clone()),
        )
        .classified(cls);
        arg.default = default;
        out.push(arg);
    }
}

fn query_params(
    out: &mut Vec<Arg>,
    op: &OperationInfo,
    overrides: &Map<String, Value>,
    workers: bool,
    names: &mut FlagNames,
) {
    for p in &op.query_params {
        let o = Override::of(overrides, &p.name);
        if o.truthy("hidden") || p.name.contains(['<', '>', '[', ']', '{', '}', '~']) {
            continue;
        }
        let required = o.required(p.required);
        let name = names.name("query", &p.name, natural_flag(p));
        let description = o
            .string("description")
            .or_else(|| p.description.clone())
            .unwrap_or_else(|| description_from_name(&p.name));
        let choices = p.enum_values.clone().filter(|v| !v.is_empty());
        let ty = match (choices.is_some(), p.ty) {
            (true, _) => ArgType::Enum,
            (false, Some(JsonType::Number)) => ArgType::Number,
            (false, Some(JsonType::Boolean)) => ArgType::Boolean,
            (false, Some(JsonType::Array)) => ArgType::Array,
            _ => ArgType::String,
        };
        let mut arg = Arg::new(name, description, ty, required, false, Origin::Query(p.name.clone()))
            .classified(classify(&flag_name(&p.name), workers));
        if !(required || choices.is_some()) {
            arg.default = o.nullish("default").cloned();
        }
        arg.choices = choices;
        out.push(arg);
    }
}

fn header_params(out: &mut Vec<Arg>, op: &OperationInfo, workers: bool, names: &mut FlagNames) {
    for hp in &op.header_params {
        let name = names.name("header", &hp.name, natural_flag(hp).to_lowercase());
        if out.iter().any(|a| a.name == name) {
            continue;
        }
        let description = hp
            .description
            .clone()
            .unwrap_or_else(|| format!("The {} header", hp.name));
        let cls = classify(&flag_name(&hp.name).to_lowercase(), workers);
        out.push(
            Arg::new(
                name,
                description,
                ArgType::String,
                hp.required,
                false,
                Origin::Header(hp.name.clone()),
            )
            .classified(cls),
        );
    }
}

fn body_params(
    out: &mut Vec<Arg>,
    op: &OperationInfo,
    overrides: &Map<String, Value>,
    workers: bool,
    names: &mut FlagNames,
) {
    if op.body_params.is_empty() {
        return;
    }
    let template = template_params(&op.path);
    let path_has = |params: &[&str]| params.iter().any(|p| template.iter().any(|t| t == p));
    let path_has_account = path_has(ACCOUNT_PATH_PARAMS);
    let path_has_zone = path_has(ZONE_PATH_PARAMS);
    let mut renamed = std::collections::HashMap::new();
    for bp in &op.body_params {
        let natural = flag_name(&bp.name);
        let path = &bp.api_field_path;
        let single = path.len() == 1;
        let first = path.first().map_or("", String::as_str);
        let is_account_field = single && (first == "account_id" || first == "accountId");
        let is_zone_field = single && (first == "zone_id" || first == "zoneId");
        if (is_account_field || natural == "account-id") && path_has_account {
            continue;
        }
        if (is_zone_field || natural == "zone-id") && path_has_zone {
            continue;
        }
        let name = names.name("body", &path.join("."), natural.clone());
        if out.iter().any(|a| a.name == name) {
            continue;
        }
        if name != natural {
            renamed.insert(kebab(&natural), name.clone());
        }
        let joined = path.join(".");
        let o = Override::of(overrides, &joined);
        let override_choices = o
            .get("choices")
            .and_then(Value::as_array)
            .map(|c| c.iter().map(to_js_string).collect::<Vec<_>>())
            .filter(|c| !c.is_empty());
        let enum_values = override_choices.or_else(|| bp.enum_values.clone().filter(|v| !v.is_empty()));
        let cls = classify(&natural, workers);
        let array = o.get("array") == Some(&Value::Bool(true));
        if o.get("positional") == Some(&Value::Bool(true))
            && single
            && bp.ty != JsonType::Boolean
            && bp.ty != JsonType::Object
            && bp.item_type != Some(JsonType::Array)
            && bp.item_type != Some(JsonType::Object)
        {
            let description = o
                .string("description")
                .or_else(|| bp.description.clone())
                .unwrap_or_else(|| format!("The {first} field"));
            let mut ty = body_arg_type(if array { JsonType::Array } else { bp.ty }, bp.item_type);
            if ty != ArgType::Array && enum_values.is_some() {
                ty = ArgType::Enum;
            }
            let mut arg = Arg::new(
                name,
                description,
                ty,
                o.required(bp.required),
                true,
                Origin::Body(path.clone()),
            )
            .classified(cls);
            arg.optional_parent_path = bp.optional_parent_path.clone();
            arg.choices = enum_values;
            out.push(arg);
            continue;
        }
        let effective_type = if array { JsonType::Array } else { bp.ty };
        let from_file_override = o.nullish("fromFile");
        let from_file = match from_file_override {
            _ if effective_type != JsonType::String => None,
            Some(Value::Bool(false)) => None,
            Some(value) if truthy(value) => Some(FromFile {
                format: value.get("format").map(to_js_string),
            }),
            _ => Some(FromFile {
                format: Some("text".to_owned()),
            }),
        };
        let effective_default = if o.present() && o.get("default").is_some() {
            o.nullish("default").cloned()
        } else {
            bp.default.clone()
        };
        let nested_under_optional = bp.optional_parent_path.is_some();
        let body_type = body_arg_type(effective_type, bp.item_type);
        let ty = match body_type {
            ArgType::ObjectArray | ArgType::NestedArray | ArgType::ObjectMap => body_type,
            _ if enum_values.is_some() => ArgType::Enum,
            _ => body_type,
        };
        let base = o
            .string("description")
            .or_else(|| bp.description.clone())
            .unwrap_or_else(|| format!("The {joined} field"));
        let suffix = match ty {
            ArgType::ObjectArray => Some("Provide as a JSON array of objects or @path/to/file.json."),
            ArgType::NestedArray => Some("Provide as a JSON array of arrays or @path/to/file.json."),
            ArgType::ObjectMap => Some("Provide as a JSON object or @path/to/file.json."),
            ArgType::ScalarUnion => Some("Accepts a JSON scalar or plain string, or @path/to/file."),
            _ => None,
        };
        let base = if matches!(ty, ArgType::ObjectMap | ArgType::ScalarUnion) {
            base.trim_end().to_owned()
        } else {
            base
        };
        let description = suffix.map_or_else(
            || base.clone(),
            |suffix| {
                format!(
                    "{base}{}{suffix}",
                    if base.ends_with(['.', '!', '?']) { " " } else { ". " }
                )
            },
        );
        let mut arg = Arg::new(
            name,
            description,
            ty,
            o.required(bp.required),
            false,
            Origin::Body(path.clone()),
        )
        .classified(cls);
        if ty == ArgType::Enum {
            arg.choices = enum_values;
        }
        arg.default = if nested_under_optional { None } else { effective_default };
        arg.from_file = from_file;
        arg.conflicts = bp.conflicts.clone();
        arg.implies = bp.implies.clone();
        arg.secret = bp.sensitive;
        arg.optional_parent_path = bp.optional_parent_path.clone();
        out.push(arg);
    }
    for arg in out.iter_mut().filter(|a| a.is_body()) {
        for flags in [&mut arg.conflicts, &mut arg.implies].into_iter().flatten() {
            for flag in flags {
                if let Some(final_name) = renamed.get(&kebab(flag)) {
                    *flag = final_name.clone();
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::operation::{BodyParamInfo, MultipartField, ParameterInfo};
    use crate::test_support::{body_param, find, json_body, method, names, operation, param, strings};
    use serde_json::json;

    fn search() -> Method {
        method("search", "example-search")
    }

    fn derived(m: &Method, resource: &str, op: &OperationInfo) -> Derived {
        derive(m, resource, op).expect("the arguments derive")
    }

    fn path(name: &str) -> Origin {
        Origin::Path(name.to_owned())
    }

    fn body(path: &[&str]) -> Origin {
        Origin::Body(strings(path))
    }

    /// A GET with the required query parameter `name`, renamed to `sdk_name`.
    fn query_operation(name: &str, sdk_name: Option<&str>) -> OperationInfo {
        let query = ParameterInfo {
            description: Some("Search query".to_owned()),
            ..param(name, sdk_name)
        };
        OperationInfo {
            query_params: vec![query],
            ..operation(HttpMethod::Get, "/accounts/{account_id}/example")
        }
    }

    /// A GET at `path` with the path parameters `account_id` and `params`.
    fn path_operation(path: &str, params: &[(&str, Option<&str>)]) -> OperationInfo {
        let params = [param("account_id", None)]
            .into_iter()
            .chain(params.iter().map(|&(name, sdk)| param(name, sdk)));
        OperationInfo {
            path_params: params.collect(),
            ..operation(HttpMethod::Get, path)
        }
    }

    #[test]
    fn maps_only_the_paired_placeholders_to_generated_locals() {
        let path = "/{account_or_zone}/{account_or_zone_id}/load_balancers";
        assert_eq!(account_or_zone_local(path, "account_or_zone"), Some("accountOrZone"));
        assert_eq!(
            account_or_zone_local(path, "account_or_zone_id"),
            Some("accountOrZoneId")
        );
        assert_eq!(account_or_zone_local(path, "load_balancer_id"), None);
        assert_eq!(
            account_or_zone_local("/things/{account_or_zone}", "account_or_zone"),
            None
        );
    }

    #[test]
    fn names_a_query_flag_from_its_sdk_name_keeping_the_wire_name() {
        let d = derived(&search(), "example", &query_operation("q", Some("query")));
        assert_eq!(find(&d.args, "query").origin, Origin::Query("q".to_owned()));
    }

    #[test]
    fn kebab_cases_a_camel_case_sdk_name() {
        let d = derived(
            &search(),
            "example",
            &query_operation("accountId", Some("filterAccountId")),
        );
        assert_eq!(names(&d.args), ["filter-account-id"]);
    }

    #[test]
    fn lets_an_sdk_name_move_a_query_param_off_the_reserved_mode_flag() {
        let mut op = query_operation("mode", None);
        op.flag_policy.global_options = strings(&["mode"]);
        assert!(derive(&search(), "example", &op).unwrap_err().contains("--mode"));
        let d = derived(&search(), "example", &query_operation("mode", Some("search-mode")));
        assert_eq!(find(&d.args, "search-mode").origin, Origin::Query("mode".to_owned()));
    }

    #[test]
    fn classifies_a_query_param_by_its_wire_name() {
        let d = derived(&search(), "example", &query_operation("zone_id", Some("zone_tag")));
        assert!(find(&d.args, "zone-tag").is_zone);
    }

    #[test]
    fn names_a_header_flag_from_its_sdk_name_keeping_the_wire_name() {
        let header = ParameterInfo {
            required: false,
            description: Some("Jurisdiction".to_owned()),
            ..param("cf-r2-jurisdiction", Some("jurisdiction"))
        };
        let op = OperationInfo {
            header_params: vec![header],
            ..operation(HttpMethod::Get, "/accounts/{account_id}/example")
        };
        let d = derived(&search(), "example", &op);
        assert_eq!(
            find(&d.args, "jurisdiction").origin,
            Origin::Header("cf-r2-jurisdiction".to_owned())
        );
    }

    const CONSUMER_PATH: &str = "/accounts/{account_id}/queues/{queue_id}/consumers/{consumer_id}";
    const RENAMED: &[(&str, Option<&str>)] = &[("queue_id", Some("queue")), ("consumer_id", Some("consumer"))];

    #[test]
    fn names_the_positional_and_demoted_flag_from_the_sdk_name() {
        let d = derived(
            &method("get", "example-search"),
            "example",
            &path_operation(CONSUMER_PATH, RENAMED),
        );
        assert_eq!(names(&d.args), ["queue", "consumer"]);
        let [queue, consumer] = &d.args[..] else {
            panic!("two arguments")
        };
        assert!(!queue.positional);
        assert!(queue.required);
        assert_eq!(queue.origin, path("queue_id"));
        assert!(consumer.positional);
        assert_eq!(consumer.origin, path("consumer_id"));
    }

    #[test]
    fn demotes_every_renamed_path_param_to_a_flag_for_list_operations() {
        let d = derived(
            &method("list", "example-search"),
            "example",
            &path_operation(CONSUMER_PATH, RENAMED),
        );
        let args: Vec<_> = d
            .args
            .iter()
            .map(|a| (a.name.as_str(), a.positional, &a.origin))
            .collect();
        assert_eq!(
            args,
            [
                ("queue", false, &path("queue_id")),
                ("consumer", false, &path("consumer_id"))
            ]
        );
    }

    #[test]
    fn keeps_wire_name_zone_and_worker_handling_when_renamed() {
        let get = method("get", "example-search");
        let zone = derived(
            &get,
            "example",
            &path_operation(
                "/zones/{zone_id}/things/{thing_id}",
                &[("zone_id", Some("zone_tag")), ("thing_id", None)],
            ),
        );
        assert_eq!(names(&zone.args), ["thing-id"]);

        let worker = derived(
            &get,
            "workers",
            &path_operation(
                "/accounts/{account_id}/workers/scripts/{script_name}/settings",
                &[("script_name", Some("worker_script"))],
            ),
        );
        assert_eq!(names(&worker.args), ["worker"]);
        let a = &worker.args[0];
        assert!(!a.positional);
        assert!(a.is_worker_name);
        assert_eq!(a.origin, path("script_name"));
    }

    #[test]
    fn does_not_let_a_rename_make_an_ordinary_param_look_like_a_zone() {
        let d = derived(
            &method("get", "example-search"),
            "example",
            &path_operation(
                "/accounts/{account_id}/things/{thing_id}",
                &[("thing_id", Some("zone_id"))],
            ),
        );
        assert_eq!(names(&d.args), ["zone-id"]);
        assert!(d.args[0].positional);
        assert!(!d.args[0].is_zone);
    }

    #[test]
    fn uses_forges_fern_derived_names_for_flags_and_conflicts() {
        let op = OperationInfo {
            body_params: vec![
                BodyParamInfo {
                    description: Some("Certificate".to_owned()),
                    conflicts: Some(strings(&["token"])),
                    ..body_param(
                        "mtls-certificate-id",
                        JsonType::String,
                        &["mtls", "mtls_certificate_id"],
                    )
                },
                BodyParamInfo {
                    description: Some("Token".to_owned()),
                    implies: Some(strings(&["mtls-certificate-id"])),
                    ..body_param("token", JsonType::String, &["access_token"])
                },
            ],
            ..json_body(operation(HttpMethod::Post, "/accounts/{account_id}/example"))
        };
        let d = derived(&method("create", "example-search"), "example", &op);
        assert_eq!(names(&d.args), ["mtls-certificate-id", "token"]);
        assert_eq!(d.args[0].origin, body(&["mtls", "mtls_certificate_id"]));
        assert_eq!(d.args[0].conflicts, Some(strings(&["token"])));
        assert_eq!(d.args[1].origin, body(&["access_token"]));
        assert_eq!(d.args[1].implies, Some(strings(&["mtls-certificate-id"])));
    }

    #[test]
    fn rejects_reserved_multipart_fields_case_insensitively() {
        for name in ["mode", "Mode", "MODE"] {
            let mut op = operation(HttpMethod::Post, "/accounts/{account_id}/example");
            op.has_request_body = true;
            op.request_content_types = strings(&["multipart/form-data"]);
            op.flag_policy.global_options = strings(&["mode"]);
            op.multipart = Some(MultipartInfo {
                fields: vec![MultipartField {
                    name: name.to_owned(),
                    ty: JsonType::String,
                    is_binary: false,
                    description: "Mode".to_owned(),
                }],
                payload_field: None,
            });
            assert!(derive(&search(), "example", &op).unwrap_err().contains("--mode"));
        }
    }

    /// A deployment POST whose required `versions` is an array of `item_type`.
    fn versions_operation(item_type: Option<JsonType>) -> OperationInfo {
        let versions = BodyParamInfo {
            item_type,
            required: true,
            description: Some("Deployment versions as JSON.".to_owned()),
            ..body_param("versions", JsonType::Array, &["versions"])
        };
        OperationInfo {
            body_params: vec![versions],

            ..json_body(operation(
                HttpMethod::Post,
                "/accounts/{account_id}/workers/deployments",
            ))
        }
    }

    #[test]
    fn keeps_an_object_array_as_one_json_valued_flag() {
        let d = derived(&search(), "workers", &versions_operation(Some(JsonType::Object)));
        let versions = find(&d.args, "versions");
        assert_eq!(versions.ty, ArgType::ObjectArray);
        assert!(versions.required);
        assert_eq!(
            versions.description,
            "Deployment versions as JSON. Provide as a JSON array of objects or @path/to/file.json."
        );
        assert_eq!(versions.origin, body(&["versions"]));
        assert!(d.has_body);
        assert!(d.has_body_params);
    }

    #[test]
    fn preserves_scalar_arrays_as_repeatable_flags() {
        let d = derived(&search(), "workers", &versions_operation(None));
        assert_eq!(find(&d.args, "versions").ty, ArgType::Array);
    }

    #[test]
    fn does_not_let_scalar_overlay_choices_replace_the_json_representation() {
        let overrides = json!({ "versions": { "choices": ["not-an-object-array"], "positional": true } });
        let m = Method {
            params: overrides.as_object().cloned(),
            ..search()
        };
        let d = derived(&m, "workers", &versions_operation(Some(JsonType::Object)));
        let versions = find(&d.args, "versions");
        assert_eq!(versions.ty, ArgType::ObjectArray);
        assert!(!versions.positional);
        assert_eq!(versions.choices, None);
    }

    fn create(mut body_params: Vec<BodyParamInfo>, required: &[&str]) -> OperationInfo {
        for param in &mut body_params {
            if param.api_field_path.len() > 1 && !required.contains(&param.api_field_path[0].as_str()) {
                param.optional_parent_path = Some(vec![param.api_field_path[0].clone()]);
            }
        }
        OperationInfo {
            path_params: vec![param("account_id", None)],
            body_params,

            ..json_body(operation(HttpMethod::Post, "/accounts/{account_id}/tests"))
        }
    }

    fn field(name: &str, path: &[&str], required: bool, default: Option<&str>) -> BodyParamInfo {
        BodyParamInfo {
            required,
            default: default.map(Value::from),
            ..body_param(name, JsonType::String, path)
        }
    }

    fn create_method() -> Method {
        Method {
            description: "Create a test resource".to_owned(),
            ..method("create", "test-create")
        }
    }

    fn default_for(op: &OperationInfo, name: &str) -> Option<Value> {
        derived(&create_method(), "test", op)
            .args
            .into_iter()
            .find(|a| a.name == name)?
            .default
    }

    #[test]
    fn does_not_create_an_optional_parent_object() {
        let op = create(
            vec![
                field("format-type", &["format", "type"], true, None),
                field(
                    "format-compression",
                    &["format", "compression"],
                    false,
                    Some("uncompressed"),
                ),
            ],
            &[],
        );
        let d = derived(&create_method(), "test", &op);
        assert_eq!(find(&d.args, "format-compression").default, None);
        let [group] = &d.optional_parent_groups[..] else {
            panic!("one optional parent group")
        };
        assert_eq!(group.parent_name, "format");
        assert_eq!(group.group_set_flags, ["format-type", "format-compression"]);
        assert_eq!(group.required_flags, ["format-type"]);
    }

    #[test]
    fn retains_a_nested_default_when_its_parent_is_required() {
        let op = create(
            vec![field("settings-mode", &["settings", "mode"], false, Some("automatic"))],
            &["settings"],
        );
        assert_eq!(default_for(&op, "settings-mode"), Some(Value::from("automatic")));
    }

    #[test]
    fn retains_a_default_on_a_top_level_field() {
        let op = create(vec![field("strategy", &["strategy"], false, Some("automatic"))], &[]);
        assert_eq!(default_for(&op, "strategy"), Some(Value::from("automatic")));
    }

    #[test]
    fn rejects_the_reserved_top_level_mode_field() {
        let mut op = create(vec![field("mode", &["mode"], false, Some("automatic"))], &[]);
        op.flag_policy.global_options = strings(&["mode"]);
        assert!(derive(&create_method(), "test", &op).unwrap_err().contains("--mode"));
    }
}
