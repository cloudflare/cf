//! Typed calls: whether a command can make one, how it is written, and the
//! `Operation` it sends.
//!
//! A typed call is `client.send(operation, request)`, with an `operation`
//! that tells the runtime what to do with the request. Commands that can't
//! make one send a passthrough request with `requestApi`.

use super::{Ctx, argv_key};
use crate::args::{ACCOUNT_PATH_PARAMS, Origin, ZONE_PATH_PARAMS, account_or_zone_local, path_param_read_key};
use crate::js::{Obj, Value, dedup, is_array_index, is_identifier, quote, replace_params, stringify, template_params};
use crate::operation::{OperationInfo, WireBody};

fn property(name: &str) -> String {
    if is_identifier(name) {
        name.to_owned()
    } else {
        quote(name)
    }
}

fn path_value(ctx: &Ctx, name: &str) -> String {
    if let Some(local) = account_or_zone_local(&ctx.op.path, name) {
        return local.to_owned();
    }
    if ACCOUNT_PATH_PARAMS.contains(&name) {
        return "accountId".to_owned();
    }
    if ZONE_PATH_PARAMS.contains(&name) {
        return if ctx.first_positional_is_zone {
            "zone_id"
        } else {
            "zoneId"
        }
        .to_owned();
    }
    if ctx.needs_worker_name && (name == "script_name" || name == "scriptName") {
        return "scriptName".to_owned();
    }
    argv_key(&path_param_read_key(&ctx.derived.args, name))
}

/// The request's fields for the placeholders of the path.
fn path_fields(ctx: &Ctx) -> Vec<String> {
    template_params(&ctx.op.path)
        .iter()
        .map(|name| format!("{}: {}", property(name), path_value(ctx, name)))
        .collect()
}

fn base_typed_guards(ctx: &Ctx) -> bool {
    let blocking = ctx.required_option_args.iter().any(|a| !a.is_body());
    // A path parameter renamed with `x-fern-parameter-name` is sent with a
    // passthrough request.
    !ctx.op.path_params.iter().any(|p| p.sdk_name.is_some()) && !ctx.has_headers && !ctx.is_raw_output && !blocking
}

pub fn can_emit_typed_call(ctx: &Ctx) -> bool {
    let w = &ctx.op.wire;
    let query_names: Vec<&str> = ctx
        .derived
        .query_args()
        .map(|a| match &a.origin {
            Origin::Query(name) => name.as_str(),
            _ => "",
        })
        .collect();
    // A body without flags can be left to `--body` when it needs nothing,
    // and every parameter the request needs has a flag.
    let body_optional = w.has_request
        && !w.body_required
        && !ctx.op.header_params.iter().any(|p| p.required)
        && ctx
            .op
            .query_params
            .iter()
            .all(|p| !p.required || query_names.contains(&p.name.as_str()));
    let has_no_wire_body = !ctx.derived.has_body || body_optional;
    base_typed_guards(ctx) && !ctx.derived.has_body_params && has_no_wire_body
}

pub fn can_emit_typed_json_body_call(ctx: &Ctx) -> bool {
    base_typed_guards(ctx) && !ctx.derived.has_file_upload && ctx.derived.multipart.is_none() && ctx.op.wire.has_request
}

pub fn can_emit_typed_body_call(ctx: &Ctx) -> bool {
    can_emit_typed_json_body_call(ctx) && ctx.derived.has_body_params
}

fn call(args: &str) -> String {
    if args.is_empty() {
        "client.send(operation)".to_owned()
    } else {
        format!("client.send(operation, {args})")
    }
}

pub fn typed_call(ctx: &Ctx) -> String {
    if !ctx.op.wire.has_request {
        return call("");
    }
    // A body that needs none of its fields is sent empty.
    let mut fields = Vec::new();
    if ctx.op.wire.body == Some(WireBody::Json) && ctx.derived.has_body {
        fields.push("body: {}".to_owned());
    }
    fields.extend(path_fields(ctx));
    let has_query = ctx.derived.query_args().next().is_some();
    if fields.is_empty() && has_query {
        return call("queryParams");
    }
    if has_query {
        fields.push("...queryParams".to_owned());
    }
    call(&format!("{{ {} }}", fields.join(", ")))
}

/// A typed call with the assembled or parsed `bodyData`.
pub fn body_call(ctx: &Ctx) -> String {
    let mut fields = vec!["body: bodyData".to_owned()];
    fields.extend(path_fields(ctx));
    if ctx.derived.query_args().next().is_some() {
        fields.push("...queryParams".to_owned());
    }
    call(&format!("{{ {} }}", fields.join(", ")))
}

/// Reports whether the command makes a typed call, and so declares an
/// `operation`.
pub fn makes_typed_call(ctx: &Ctx) -> bool {
    if ctx.is_raw_output {
        return false;
    }
    let d = &ctx.derived;
    let bypass = d.has_body
        && ctx.accepts_json()
        && ctx.op.max_items.is_none_or(|n| n == 0)
        && can_emit_typed_json_body_call(ctx);
    let assembled = d.has_body_params && can_emit_typed_body_call(ctx);
    let plain = !d.has_body_params && !ctx.has_headers && can_emit_typed_call(ctx);
    bypass || assembled || plain
}

/// The path of the module of the operation `operation_id` in the output,
/// without its extension: its path in the group tree under `_operations/`,
/// as `_operations/d1/database/query` for `d1.database.query`.
pub fn operation_path(operation_id: &str) -> String {
    format!("_operations/{}", operation_id.replace('.', "/"))
}

/// The module of a command's operation, relative to the command's module,
/// which imports its operation from there.
pub fn operation_module(ctx: &Ctx) -> String {
    format!("{}{}.js", ctx.root, operation_path(&ctx.method.operation_id))
}

/// Reports whether the module of an operation whose path is `template`
/// builds it with the runtime's `path` tag, and so imports it: when the
/// path has parameters.
pub fn uses_path_tag(template: &str) -> bool {
    !template_params(template).is_empty()
}

/// The function that returns a request's path for `template`, as code:
/// each `{name}` takes the request's field `name`, which the runtime's
/// `path` tag encodes as a path segment.
fn path_function(template: &str) -> String {
    if !uses_path_tag(template) {
        return format!("() => {}", quote(template));
    }
    // A placeholder's name has none of the characters escaped here.
    let body = replace_params(&super::escape_template(template), |name| {
        if is_identifier(name) {
            format!("${{request.{name}}}")
        } else {
            format!("${{request[{}]}}", quote(name))
        }
    });
    format!("(request: Record<string, unknown>) => path`{body}`")
}

/// A member of the `Operation` literal: source code, printed as it is, or a
/// value.
enum Member {
    Code(String),
    Value(Value),
}

/// The `Operation` that describes `op` for `Client.send`, as a literal.
pub fn operation_literal(op: &OperationInfo) -> String {
    let w = &op.wire;
    let strings = |items: Vec<String>| Member::Value(Value::from(items));
    let mut members: Vec<(&str, Member)> = vec![
        ("method", Member::Value(Value::from(op.method.to_uppercase()))),
        ("path", Member::Code(path_function(&op.path))),
    ];
    // A form body is made of the request's other fields, so it has to know
    // which ones the path takes.
    let path_params = dedup(template_params(&op.path));
    if w.body == Some(WireBody::Form) && !path_params.is_empty() {
        members.push(("pathParams", strings(path_params)));
    }
    if !op.query_params.is_empty() {
        members.push((
            "query",
            strings(op.query_params.iter().map(|p| p.name.clone()).collect()),
        ));
    }
    if !w.joined.is_empty() {
        members.push(("joined", strings(w.joined.clone())));
    }
    if !op.header_params.is_empty() {
        members.push((
            "headers",
            strings(op.header_params.iter().map(|p| p.name.clone()).collect()),
        ));
    }
    if let Some(body) = w.body {
        members.push((
            "body",
            Member::Value(Value::from(if body == WireBody::Form { "form" } else { "json" })),
        ));
        if let Some(content_type) = w.content_type.as_ref().filter(|_| body == WireBody::Json)
            && content_type != "application/json"
        {
            members.push(("contentType", Member::Value(Value::from(content_type))));
        }
    }
    if !w.constants.is_empty() {
        members.push(("constants", Member::Value(Value::Object(w.constants.clone()))));
    }
    if w.no_response {
        members.push(("response", Member::Value(Value::Bool(false))));
    } else if let Some(response_type) = w.response_type {
        members.push(("response", Member::Value(Value::from(response_type))));
    }
    if !w.errors.is_empty() {
        let errors: Obj = w.errors.iter().map(|&(status, name)| (status, name)).collect();
        members.push(("errors", Member::Value(Value::Object(errors))));
    }
    let mut out = "{\n".to_owned();
    for (key, member) in members {
        let value = match member {
            Member::Code(code) => code,
            Member::Value(value) => literal(&value, 1),
        };
        out.push_str(&format!("  {}: {value},\n", literal_key(key)));
    }
    out.push('}');
    out
}

fn literal_key(key: &str) -> String {
    if is_identifier(key) || is_array_index(key) {
        key.to_owned()
    } else {
        quote(key)
    }
}

/// Prints `value` as a TypeScript literal: an object a property per line,
/// with bare keys where they can be, and arrays on one line.
fn literal(value: &Value, depth: usize) -> String {
    match value {
        Value::Array(items) => {
            format!(
                "[{}]",
                items.iter().map(|i| literal(i, depth)).collect::<Vec<_>>().join(", ")
            )
        }
        Value::Object(obj) => {
            let indent = "  ".repeat(depth + 1);
            let mut out = "{\n".to_owned();
            for (k, v) in obj.iter() {
                out.push_str(&format!("{indent}{}: {},\n", literal_key(k), literal(v, depth + 1)));
            }
            out.push_str(&"  ".repeat(depth));
            out.push('}');
            out
        }
        value => stringify(value),
    }
}
