//! Runs the existing resolved-operation fixtures against the native emitters.
//! This binary is available only with the test-harness feature.
#![allow(dead_code)]

mod args;
mod body;
mod body_unions;
mod commands;
mod emit;
mod files;
mod hand_written;
mod js;
mod operation;
mod test_support;

use args::{Arg, ArgType, Derived, FromFile, Origin};
use forge::{Err, HttpMethod};
use operation::*;
use serde_json::{Value, json};
use std::io::{self, Read};

fn text(v: &Value, key: &str) -> String {
    v[key].as_str().unwrap_or_default().to_owned()
}
fn opt(v: &Value, key: &str) -> Option<String> {
    v[key].as_str().map(str::to_owned)
}
fn boolean(v: &Value, key: &str) -> bool {
    v[key].as_bool().unwrap_or(false)
}
fn list(v: &Value) -> &[Value] {
    v.as_array().map(Vec::as_slice).unwrap_or_default()
}
fn strings(v: &Value) -> Vec<String> {
    list(v)
        .iter()
        .map(|v| v.as_str().unwrap_or_default().to_owned())
        .collect()
}
fn optional_strings(v: &Value) -> Option<Vec<String>> {
    v.as_array().map(|_| strings(v))
}
fn json_type(v: &Value) -> JsonType {
    match v.as_str().unwrap_or_default() {
        "number" => JsonType::Number,
        "boolean" => JsonType::Boolean,
        "array" => JsonType::Array,
        "object" => JsonType::Object,
        "scalarUnion" => JsonType::ScalarUnion,
        _ => JsonType::String,
    }
}
fn arg_type(v: &Value) -> ArgType {
    match v.as_str().unwrap_or_default() {
        "number" => ArgType::Number,
        "boolean" => ArgType::Boolean,
        "enum" => ArgType::Enum,
        "array" => ArgType::Array,
        "objectArray" => ArgType::ObjectArray,
        "nestedArray" => ArgType::NestedArray,
        "objectMap" => ArgType::ObjectMap,
        "scalarUnion" => ArgType::ScalarUnion,
        _ => ArgType::String,
    }
}
fn method(v: &Value) -> commands::Method {
    commands::Method {
        name: text(v, "name"),
        operation_id: text(v, "operationId"),
        deprecated: boolean(v, "deprecated"),
        params: v["params"].as_object().cloned(),
        require_confirmation: opt(v, "requireConfirmation"),
        summary: opt(v, "summary"),
        description: text(v, "description"),
        has_args: boolean(v, "hasArgs"),
    }
}
fn param(v: &Value) -> ParameterInfo {
    ParameterInfo {
        name: text(v, "name"),
        sdk_name: opt(v, "sdkName"),
        required: boolean(v, "required"),
        ty: v.get("type").map(json_type),
        description: opt(v, "description"),
        enum_values: optional_strings(&v["enumValues"]),
    }
}
fn operation(v: &Value, policy: &Value) -> Result<OperationInfo, Err> {
    let http_method = match text(v, "method").as_str() {
        "get" => HttpMethod::Get,
        "post" => HttpMethod::Post,
        "put" => HttpMethod::Put,
        "patch" => HttpMethod::Patch,
        "delete" => HttpMethod::Delete,
        "head" => HttpMethod::Head,
        other => HttpMethod::Other(other.to_uppercase()),
    };
    let mut op = test_support::operation(http_method, &text(v, "path"));
    op.flag_policy = serde_json::from_value(policy.clone())?;
    op.path_params = list(&v["pathParams"]).iter().map(param).collect();
    op.query_params = list(&v["queryParams"]).iter().map(param).collect();
    op.header_params = list(&v["headerParams"]).iter().map(param).collect();
    op.body_params = list(&v["bodyParams"])
        .iter()
        .map(|b| BodyParamInfo {
            name: text(b, "name"),
            required: boolean(b, "required"),
            optional_parent_path: optional_strings(&b["optionalParentPath"]),
            ty: json_type(&b["type"]),
            item_type: b.get("itemType").map(json_type),
            description: opt(b, "description"),
            enum_values: optional_strings(&b["enumValues"]),
            default: b.get("default").cloned(),
            sensitive: boolean(b, "sensitive"),
            api_field_path: strings(&b["apiFieldPath"]),
            conflicts: optional_strings(&b["conflicts"]),
            implies: optional_strings(&b["implies"]),
        })
        .collect();
    op.has_request_body = boolean(v, "hasRequestBody");
    op.request_content_types = strings(&v["requestContentTypes"]);
    op.request_body_ref = opt(v, "requestBodyRef");
    op.request_body_mandatory = boolean(v, "requestBodyMandatory");
    op.request_body_description = opt(v, "requestBodyDescription");
    op.request_body_is_array = boolean(v, "requestBodyIsArray");
    op.max_items = v["maxItems"].as_u64();
    op.body_unions = list(&v["bodyUnions"]).to_vec();
    op.multipart = v.get("multipart").map(|m| MultipartInfo {
        fields: list(&m["fields"])
            .iter()
            .map(|f| MultipartField {
                name: text(f, "name"),
                ty: json_type(&f["type"]),
                is_binary: boolean(f, "isBinary"),
                description: text(f, "description"),
            })
            .collect(),
        payload_field: opt(m, "payloadField"),
    });
    op.body_discriminator = v.get("bodyDiscriminator").map(|d| BodyDiscriminator {
        field: text(d, "field"),
        variants: list(&d["variants"])
            .iter()
            .map(|v| (v[0].as_str().unwrap_or_default().to_owned(), strings(&v[1])))
            .collect(),
    });
    op.responses = list(&v["responses"])
        .iter()
        .map(|r| {
            (
                r[0].as_str().unwrap_or_default().to_owned(),
                ResponseInfo {
                    content: strings(&r[1]["content"]),
                },
            )
        })
        .collect();
    let w = &v["wire"];
    if !w["responseType"].is_null() || !list(&w["errors"]).is_empty() {
        return Err("response decoding and status errors require an OpenAPI fixture".into());
    }
    op.wire = Wire {
        has_request: boolean(w, "hasRequest"),
        body: match w["body"].as_str() {
            Some("json") => Some(WireBody::Json),
            Some("form") => Some(WireBody::Form),
            _ => None,
        },
        body_required: boolean(w, "bodyRequired"),
        joined: strings(&w["joined"]),
        constants: w["constants"].as_object().cloned().unwrap_or_default(),
        content_type: opt(w, "contentType"),
        no_response: boolean(w, "noResponse"),
        ..Wire::default()
    };
    Ok(op)
}
fn arg(v: &Value) -> Arg {
    let o = &v["origin"];
    let origin = match text(o, "in").as_str() {
        "path" => Origin::Path(text(o, "name")),
        "query" => Origin::Query(text(o, "name")),
        "header" => Origin::Header(text(o, "name")),
        _ => Origin::Body(strings(&o["path"])),
    };
    let mut a = Arg::new(
        text(v, "name"),
        text(v, "description"),
        arg_type(&v["type"]),
        boolean(v, "required"),
        boolean(v, "positional"),
        origin,
    );
    a.choices = optional_strings(&v["choices"]);
    a.default = v.get("default").cloned();
    a.optional_parent_path = optional_strings(&v["optionalParentPath"]);
    a.conflicts = optional_strings(&v["conflicts"]);
    a.implies = optional_strings(&v["implies"]);
    a.secret = boolean(v, "secret");
    a.is_zone = boolean(v, "isZone");
    a.is_worker_name = boolean(v, "isWorkerName");
    a.from_file = v.get("fromFile").map(|f| FromFile {
        format: opt(f, "format"),
    });
    a
}
fn arg_json(a: &Arg) -> Value {
    let ty = match a.ty {
        ArgType::String => "string",
        ArgType::Number => "number",
        ArgType::Boolean => "boolean",
        ArgType::Enum => "enum",
        ArgType::Array => "array",
        ArgType::ObjectArray => "objectArray",
        ArgType::NestedArray => "nestedArray",
        ArgType::ObjectMap => "objectMap",
        ArgType::ScalarUnion => "scalarUnion",
    };
    let origin = match &a.origin {
        Origin::Path(n) => json!({"in":"path","name":n}),
        Origin::Query(n) => json!({"in":"query","name":n}),
        Origin::Header(n) => json!({"in":"header","name":n}),
        Origin::Body(p) => json!({"in":"body","path":p}),
    };
    let mut v = json!({"name":a.name,"description":a.description,"type":ty,"required":a.required,"positional":a.positional,"origin":origin,"secret":a.secret,"isZone":a.is_zone,"isWorkerName":a.is_worker_name});
    if let Some(x) = &a.choices {
        v["choices"] = json!(x);
    }
    if let Some(x) = &a.default {
        v["default"] = x.clone();
    }
    if let Some(x) = &a.optional_parent_path {
        v["optionalParentPath"] = json!(x);
    }
    if let Some(x) = &a.conflicts {
        v["conflicts"] = json!(x);
    }
    if let Some(x) = &a.implies {
        v["implies"] = json!(x);
    }
    if let Some(x) = &a.from_file {
        v["fromFile"] = json!({});
        if let Some(f) = &x.format {
            v["fromFile"]["format"] = json!(f);
        }
    }
    v
}
fn derived_json(d: &Derived) -> Value {
    let flags = |fields: &[args::MultipartFieldFlag]| {
        fields.iter().map(|f| json!({"flag":f.flag,"field":{"name":f.field.name,"type":f.field.ty.as_str(),"isBinary":f.field.is_binary,"description":f.field.description}})).collect::<Vec<_>>()
    };
    json!({"args":d.args.iter().map(arg_json).collect::<Vec<_>>(),"optionalParentGroups":d.optional_parent_groups.iter().map(|g|json!({"parentName":g.parent_name,"groupSetFlags":g.group_set_flags,"requiredFlags":g.required_flags})).collect::<Vec<_>>(),"isMutating":d.is_mutating,"hasBody":d.has_body,"hasEmptyBody":d.has_empty_body,"hasBodyParams":d.has_body_params,"hasFileUpload":d.has_file_upload,"multipartFlagFields":flags(&d.multipart_flag_fields),"multipartFileFields":flags(&d.multipart_file_fields)})
}
fn output_kind(op: &OperationInfo) -> Result<&'static str, String> {
    Ok(match emit::output_kind(op)? {
        emit::OutputKind::Json => "json",
        emit::OutputKind::Binary => "binary",
        emit::OutputKind::Text => "text",
        emit::OutputKind::Websocket => "websocket",
    })
}
fn run(v: Value) -> Result<Value, Err> {
    let task = text(&v, "task");
    if task == "accountOrZoneLocal" {
        return Ok(json!(args::account_or_zone_local(
            &text(&v, "path"),
            &text(&v, "param")
        )));
    }
    if task == "summary" {
        return Ok(json!(files::summary(&method(&v["method"]))));
    }
    if task == "leafUsage" {
        let mut s = files::leaf_usage(
            &method(&v["method"]),
            &text(&v, "resource"),
            v["group"].as_str(),
            &text(&v, "command"),
        );
        if boolean(&v, "accountOrZone") {
            s.push_str("\n\n");
            s.push_str(emit::handler::ACCOUNT_OR_ZONE_HELP);
        }
        return Ok(json!(s));
    }
    if task == "telemetrySafeFlags" {
        return Ok(json!(files::telemetry_safe_flags(
            &list(&v["args"]).iter().map(arg).collect::<Vec<_>>(),
            boolean(&v, "force"),
            boolean(&v, "text")
        )));
    }
    let op = operation(&v["op"], &v["flagPolicy"])?;
    if task == "outputKind" {
        return Ok(json!(output_kind(&op)?));
    }
    if task == "variantPromptBlock" {
        let args = list(&v["args"]).iter().map(arg).collect::<Vec<_>>();
        let refs = args.iter().collect::<Vec<_>>();
        let checks = emit::handler::variant_checks(&op, &refs);
        return Ok(json!([
            checks.iter().map(ToString::to_string).collect::<Vec<_>>(),
            checks.iter().any(|c| c.prompts())
        ]));
    }
    let method = method(&v["method"]);
    let resource = text(&v, "resource");
    if task == "derive" {
        return Ok(derived_json(&args::derive(&method, &resource, &op)?));
    }
    let root = opt(&v, "root").unwrap_or_else(|| "./".to_owned());
    let (ctx, command) = emit::context(&method, &resource, v["group"].as_str(), &op, root)?;
    let mut out = String::new();
    match task.as_str() {
        "context" => {
            let mut result = v.clone();
            result["derived"] = derived_json(&ctx.derived);
            result["command"] = json!(command);
            result["outputKind"] = json!(output_kind(&op)?);
            result["progressLabel"] = json!(ctx.progress_label);
            result["successLabel"] = json!(ctx.success_label);
            result["resolvedRequestPath"] = json!(ctx.request_path);
            let checks = emit::handler::variant_checks(
                &op,
                &ctx.derived.args.iter().filter(|a| a.is_body()).collect::<Vec<_>>(),
            );
            result["variantPromptBlock"] = json!(checks.iter().map(ToString::to_string).collect::<Vec<_>>());
            return Ok(result);
        }
        "builderLines" => emit::builder::builder(&ctx, &mut out)?,
        "handler" => emit::handler::handler(&ctx, &mut out)?,
        "dryRun" => emit::handler::dry_run(&ctx, &mut out)?,
        "bodyPrompts" => emit::handler::body_prompts(&ctx, &mut out)?,
        "bodyObject" => out = emit::handler::body_object(&ctx).to_string(),
        "imports" => out = emit::handler::imports(&ctx).to_string(),
        _ => return Err(format!("unknown test task {task}").into()),
    }
    Ok(json!(out))
}
fn main() {
    let result: Result<Value, Err> = (|| {
        let mut input = String::new();
        io::stdin().read_to_string(&mut input)?;
        run(serde_json::from_str(&input)?)
    })();
    match result {
        Ok(value) => println!("{value}"),
        Err(error) => {
            eprintln!("{error}");
            std::process::exit(1);
        }
    }
}
