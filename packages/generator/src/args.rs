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
    pub multipart_flag_fields: Vec<MultipartField>,
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

/// Options that only the CLI uses, which never become body flags.
pub const CLI_ONLY_OPTIONS: &[&str] = &[
    "dry-run",
    "body",
    "file",
    "local",
    "remote",
    "preview",
    "persist-to",
    "yes",
    "output",
    "table",
];

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

fn cli_flag_name(name: &str) -> Option<String> {
    let flag = flag_name(name);
    (flag.to_lowercase() != "mode").then_some(flag)
}

fn parameter_flag_name(name: &str, sdk_name: Option<&str>) -> Option<String> {
    match sdk_name {
        None => cli_flag_name(name),
        Some(sdk_name) => cli_flag_name(&kebab(sdk_name)),
    }
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
        JsonType::Array => ArgType::Array,
        JsonType::String | JsonType::Object => ArgType::String,
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
    let mut args = Vec::new();
    path_params(&mut args, op, overrides, method, workers);
    query_params(&mut args, op, overrides, workers);
    header_params(&mut args, op, workers);
    body_params(&mut args, op, overrides, workers);

    let optional_parent_groups = optional_parents(&args, op);
    let is_mutating = !matches!(op.method, HttpMethod::Get | HttpMethod::Head);
    let only_json = op.request_content_types.iter().all(|c| c == "application/json");
    let multipart = op
        .request_content_types
        .iter()
        .any(|c| c == "multipart/form-data")
        .then(|| op.multipart.clone())
        .flatten();
    let multipart_flag_fields = multipart
        .as_ref()
        .map(|m| {
            m.fields
                .iter()
                .filter(|f| {
                    !f.is_binary && m.payload_field.as_ref() != Some(&f.name) && cli_flag_name(&f.name).is_some()
                })
                .cloned()
                .collect()
        })
        .unwrap_or_default();
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

fn optional_parents(args: &[Arg], op: &OperationInfo) -> Vec<OptionalParentGroup> {
    struct Entry<'a> {
        flag: &'a str,
        required: bool,
        has_default: bool,
    }
    let mut by_parent: Vec<(&str, Vec<Entry>)> = Vec::new();
    for arg in args.iter().filter(|a| !a.positional) {
        let Some(path) = arg.body_path().filter(|p| p.len() >= 2) else {
            continue;
        };
        let entry = Entry {
            flag: &arg.name,
            required: arg.required,
            has_default: arg.default.is_some(),
        };
        let parent = path[0].as_str();
        match by_parent.iter_mut().find(|(p, _)| *p == parent) {
            Some((_, entries)) => entries.push(entry),
            None => by_parent.push((parent, vec![entry])),
        }
    }
    by_parent
        .into_iter()
        .filter(|(parent, _)| !op.request_body_required.iter().any(|r| r == parent))
        .filter_map(|(parent, entries)| {
            let required: Vec<String> = entries
                .iter()
                .filter(|e| e.required)
                .map(|e| e.flag.to_owned())
                .collect();
            (!required.is_empty()).then(|| OptionalParentGroup {
                parent_name: parent.to_owned(),
                group_set_flags: entries
                    .iter()
                    .filter(|e| !e.has_default)
                    .map(|e| e.flag.to_owned())
                    .collect(),
                required_flags: required,
            })
        })
        .collect()
}

fn path_params(out: &mut Vec<Arg>, op: &OperationInfo, overrides: &Map<String, Value>, method: &Method, workers: bool) {
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
            continue;
        }
        let positional = !cls.is_worker_name && Some(p) == subject;
        let emitted = if cls.is_worker_name {
            Some("worker".to_owned())
        } else {
            match parameter {
                Some(parameter) => parameter_flag_name(&parameter.name, parameter.sdk_name.as_deref()),
                None => cli_flag_name(p),
            }
        };
        let Some(emitted) = emitted else {
            continue;
        };
        let description = o
            .string("description")
            .or_else(|| parameter.and_then(|p| p.description.clone()))
            .unwrap_or_else(|| description_from_name(p));
        out.push(
            Arg::new(
                emitted,
                description,
                ArgType::String,
                true,
                positional,
                Origin::Path(p.clone()),
            )
            .classified(cls),
        );
    }
}

fn query_params(out: &mut Vec<Arg>, op: &OperationInfo, overrides: &Map<String, Value>, workers: bool) {
    for p in &op.query_params {
        let o = Override::of(overrides, &p.name);
        if o.truthy("hidden") || p.name.contains(['<', '>', '[', ']', '{', '}', '~']) {
            continue;
        }
        let required = o.required(p.required);
        let Some(name) = parameter_flag_name(&p.name, p.sdk_name.as_deref()) else {
            continue;
        };
        let description = o
            .string("description")
            .or_else(|| p.description.clone())
            .unwrap_or_else(|| description_from_name(&p.name));
        let choices = p.enum_values.clone().filter(|v| !v.is_empty());
        let ty = match (choices.is_some(), p.ty) {
            (true, _) => ArgType::Enum,
            (false, Some(JsonType::Number)) => ArgType::Number,
            (false, Some(JsonType::Boolean)) => ArgType::Boolean,
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

fn header_params(out: &mut Vec<Arg>, op: &OperationInfo, workers: bool) {
    for hp in &op.header_params {
        let Some(name) = parameter_flag_name(&hp.name, hp.sdk_name.as_deref()).map(|n| n.to_lowercase()) else {
            continue;
        };
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

fn body_params(out: &mut Vec<Arg>, op: &OperationInfo, overrides: &Map<String, Value>, workers: bool) {
    if op.body_params.is_empty() {
        return;
    }
    let template = template_params(&op.path);
    let path_has = |params: &[&str]| params.iter().any(|p| template.iter().any(|t| t == p));
    let path_has_account = path_has(ACCOUNT_PATH_PARAMS);
    let path_has_zone = path_has(ZONE_PATH_PARAMS);
    for bp in &op.body_params {
        let Some(name) = cli_flag_name(&bp.name) else {
            continue;
        };
        if out.iter().any(|a| a.name == name) {
            continue;
        }
        let path = &bp.api_field_path;
        let single = path.len() == 1;
        let first = path.first().map_or("", String::as_str);
        let is_account_field = single && (first == "account_id" || first == "accountId");
        let is_zone_field = single && (first == "zone_id" || first == "zoneId");
        if (is_account_field || name == "account-id") && path_has_account {
            continue;
        }
        if (is_zone_field || name == "zone-id") && path_has_zone {
            continue;
        }
        if CLI_ONLY_OPTIONS.contains(&name.as_str()) {
            continue;
        }
        let joined = path.join(".");
        let o = match overrides.get(&joined) {
            Some(by_path) if !by_path.is_null() => Override(Some(by_path)),
            _ => Override::of(overrides, first),
        };
        let override_choices = o
            .get("choices")
            .and_then(Value::as_array)
            .map(|c| c.iter().map(to_js_string).collect::<Vec<_>>())
            .filter(|c| !c.is_empty());
        let enum_values = override_choices.or_else(|| bp.enum_values.clone().filter(|v| !v.is_empty()));
        let cls = classify(&name, workers);
        let array = o.get("array") == Some(&Value::Bool(true));
        if o.get("positional") == Some(&Value::Bool(true))
            && single
            && bp.ty != JsonType::Boolean
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
            arg.choices = enum_values;
            out.push(arg);
            continue;
        }
        let effective_type = if array { JsonType::Array } else { bp.ty };
        let mut from_file_override = o.nullish("fromFile");
        if from_file_override.is_none() && single {
            from_file_override = overrides
                .get(first)
                .and_then(|v| v.get("fromFile"))
                .filter(|v| !v.is_null());
        }
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
        let nested_under_optional = path.len() > 1 && !op.request_body_required.iter().any(|r| r == first);
        let body_type = body_arg_type(effective_type, bp.item_type);
        let ty = match body_type {
            ArgType::ObjectArray => body_type,
            _ if enum_values.is_some() => ArgType::Enum,
            _ => body_type,
        };
        let base = bp.description.clone().unwrap_or_else(|| format!("The {joined} field"));
        let description = if ty == ArgType::ObjectArray {
            let separator = if base.ends_with(['.', '!', '?']) { " " } else { ". " };
            format!("{base}{separator}Provide as a JSON array of objects or @path/to/file.json.")
        } else {
            base
        };
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
        out.push(arg);
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
        assert!(
            derived(&search(), "example", &query_operation("mode", None))
                .args
                .is_empty()
        );
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
    fn omits_reserved_mode_multipart_fields_case_insensitively() {
        let field = |name: &str, description: &str| MultipartField {
            name: name.to_owned(),
            ty: JsonType::String,
            is_binary: false,
            description: description.to_owned(),
        };
        let op = OperationInfo {
            has_request_body: true,
            request_content_types: strings(&["multipart/form-data"]),
            multipart: Some(MultipartInfo {
                fields: vec![
                    field("mode", "Mode"),
                    field("Mode", "Mixed-case mode"),
                    field("MODE", "Uppercase mode"),
                    field("label", "Label"),
                ],
                payload_field: None,
            }),
            ..operation(HttpMethod::Post, "/accounts/{account_id}/example")
        };
        let d = derived(&search(), "example", &op);
        let fields: Vec<&str> = d.multipart_flag_fields.iter().map(|f| f.name.as_str()).collect();
        assert_eq!(fields, ["label"]);
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
            request_body_required: strings(&["versions"]),
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

    fn create(body_params: Vec<BodyParamInfo>, required: &[&str]) -> OperationInfo {
        OperationInfo {
            path_params: vec![param("account_id", None)],
            body_params,
            request_body_required: strings(required),
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
    fn omits_the_reserved_top_level_mode_field() {
        let op = create(vec![field("mode", &["mode"], false, Some("automatic"))], &[]);
        assert!(!names(&derived(&create_method(), "test", &op).args).contains(&"mode"));
    }
}
