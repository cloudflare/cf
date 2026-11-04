//! Emits a command's handler and its imports.

use std::collections::HashMap;
use std::fmt::{self, Display, Write};

use super::{
    Ctx, OutputKind, PathTemplate, Scope, arg_local_ident, argv_key, escape_single, escape_template, sdk,
    substitute_path,
};
use crate::args::{
    ACCOUNT_PATH_PARAMS, Arg, ArgType, Origin, ZONE_PATH_PARAMS, account_or_zone_local, path_param_read_key,
};
use crate::js::{code_unit_compare, is_identifier, kebab, push_unique, quote};
use crate::operation::{JsonType, OperationInfo};
use serde_json::json;

const HEADERS_GUARDED: &str = "Object.keys(headers).length > 0 ? headers : undefined";
const QS_FROM_PARAMS: &str = "new URLSearchParams(Object.entries(queryParams).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()";
const FILE_NAME: &str = "argv.file.split(/[\\\\/]/).filter(Boolean).pop()";

fn request_api(ctx: &Ctx, url: &str, opts: &str) -> String {
    let method = quote(ctx.op.method.as_str());
    if opts.is_empty() {
        format!("requestApi<unknown>(client, {method}, {url})")
    } else {
        format!("requestApi<unknown>(client, {method}, {url}, {opts})")
    }
}

/// The options of a passthrough request with `body`, and the headers when
/// the command has them.
fn body_opts(ctx: &Ctx, body: &str) -> String {
    if ctx.has_headers() {
        format!("{{ body: {body}, headers: {HEADERS_GUARDED} }}")
    } else {
        format!("{{ body: {body} }}")
    }
}

/// The parts of a raw request with `parts`, and the headers when the
/// command has them.
fn raw_parts(ctx: &Ctx, parts: &[&str]) -> Vec<String> {
    let mut parts: Vec<String> = parts.iter().map(|p| p.to_string()).collect();
    if ctx.has_headers() {
        parts.push(format!("headers: {HEADERS_GUARDED}"));
    }
    parts
}

/// Sends `formData`, then returns.
fn send_form(ctx: &Ctx, out: &mut String, url: &str) -> fmt::Result {
    if ctx.is_raw_output() {
        ctx.send_raw(out, url, &raw_parts(ctx, &["body: formData"]))
    } else {
        ctx.send(out, &request_api(ctx, url, &body_opts(ctx, "formData")))?;
        writeln!(out, "return;")
    }
}

/// Builds the query string `qs`, when the command has query parameters.
fn query_string(ctx: &Ctx, out: &mut String) -> fmt::Result {
    if ctx.has_query() {
        writeln!(out, "const qs = {QS_FROM_PARAMS};")?;
    }
    Ok(())
}

/// The request's URL, with the query string [`query_string`] builds.
fn request_url(ctx: &Ctx) -> String {
    if ctx.has_query() {
        format!("`{}${{qs ? '?' + qs : ''}}`", ctx.request_path)
    } else {
        format!("`{}`", ctx.request_path)
    }
}

/// Writes a command's handler.
pub fn handler(ctx: &Ctx, out: &mut String) -> fmt::Result {
    prelude(ctx, out)?;
    dry_run(ctx, out)?;
    required_body(ctx, out)?;
    auth(ctx, out)?;
    if ctx.is_delete() {
        delete_confirm(ctx, out)?;
    }
    multipart(ctx, out)?;
    file_upload(ctx, out)?;
    body_bypass(ctx, out)?;
    body_prompts(ctx, out)?;
    if ctx.derived.has_body_params {
        body_assembly(ctx, out)
    } else {
        plain_call(ctx, out)
    }
}

fn prelude(ctx: &Ctx, out: &mut String) -> fmt::Result {
    if ctx.has_query() {
        writeln!(out)?;
        writeln!(out, "const queryParams: Record<string, unknown> = {{")?;
        for a in ctx.derived.query_args() {
            if let Origin::Query(name) = &a.origin {
                writeln!(out, "'{name}': {},", argv_key(&a.name))?;
            }
        }
        writeln!(out, "}};")?;
    }
    if ctx.has_headers() {
        writeln!(out)?;
        writeln!(out, "const headers: Record<string, string> = {{}};")?;
        for a in ctx.derived.header_args() {
            if let Origin::Header(name) = &a.origin {
                let read = argv_key(&a.name);
                writeln!(out, "if ({read} !== undefined) headers['{name}'] = String({read});")?;
            }
        }
    }
    if ctx.op.request_body_mandatory
        && ctx.derived.has_body_params
        && ctx
            .derived
            .args
            .iter()
            .filter(|a| a.is_body())
            .all(|a| a.ty == ArgType::ObjectMap && !a.required)
    {
        let fields: Vec<_> = ctx.derived.args.iter().filter(|a| a.is_body()).collect();
        let mut reads = vec!["argv.body".to_owned()];
        if ctx.derived.has_file_upload {
            reads.push("argv.file".to_owned());
        }
        reads.extend(fields.iter().map(|a| argv_key(&a.name)));
        let missing = reads
            .iter()
            .map(|r| format!("{r} === undefined"))
            .collect::<Vec<_>>()
            .join(" && ");
        let flags = fields
            .iter()
            .map(|a| format!("--{}", a.name))
            .collect::<Vec<_>>()
            .join(", ");
        writeln!(
            out,
            "if ({missing}) {{ throw new Error({}); }}",
            quote(&format!(
                "--body is required unless at least one JSON map flag is provided ({flags})."
            ))
        )?;
    }
    Ok(())
}

pub const ACCOUNT_OR_ZONE_HELP: &str =
    "Runs against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.";

fn parse_body_expression(ctx: &Ctx) -> String {
    let maps: Vec<_> = ctx
        .derived
        .body_options()
        .filter(|a| a.ty == ArgType::ObjectMap && a.required)
        .map(|a| json!({"path": a.body_path().unwrap_or_default(), "flag": a.name}))
        .collect();
    let mut args = vec!["argv.body".to_owned()];
    if !maps.is_empty() || ctx.op.max_items.is_some() {
        args.push(serde_json::to_string(&maps).expect("maps serialize"));
    }
    if let Some(max) = ctx.op.max_items {
        args.push(max.to_string());
    }
    format!("parseBody({})", args.join(", "))
}

fn preserved_body_paths(ctx: &Ctx) -> String {
    let paths: Vec<_> = ctx
        .derived
        .body_options()
        .filter(|a| a.ty == ArgType::ObjectMap)
        .map(|a| a.body_path().unwrap_or_default())
        .collect();
    if paths.is_empty() {
        String::new()
    } else {
        format!(", {}", serde_json::to_string(&paths).expect("paths serialize"))
    }
}

fn required_body(ctx: &Ctx, out: &mut String) -> fmt::Result {
    let d = &ctx.derived;
    if d.has_body_params || !body_unsatisfiable(ctx, sdk::can_emit_typed_call(ctx)) {
        return Ok(());
    }
    let mut reads = vec!["argv.body".to_owned()];
    if d.has_file_upload {
        reads.push("argv.file".to_owned());
    }
    reads.extend(
        d.multipart_flag_fields
            .iter()
            .chain(&d.multipart_file_fields)
            .map(|f| argv_key(&f.flag)),
    );
    let missing = reads
        .iter()
        .map(|r| format!("{r} === undefined"))
        .collect::<Vec<_>>()
        .join(" && ");
    let message = if d.has_file_upload {
        "--body or --file is required for this command. Pass --body '<value>' or --file path/to/file."
    } else {
        "--body is required for this command. Pass --body '<json>' or --body @path/to/file.json."
    };
    writeln!(out, "if ({missing}) {{ throw new Error({}); }}", quote(message))
}

/// Whether any multipart flag is set, as code, or `false`.
fn uses_multipart(ctx: &Ctx) -> String {
    let reads: Vec<String> = ctx
        .derived
        .multipart_flag_fields
        .iter()
        .chain(&ctx.derived.multipart_file_fields)
        .map(|f| format!("{} !== undefined", argv_key(&f.flag)))
        .collect();
    if reads.is_empty() {
        "false".to_owned()
    } else {
        reads.join(" || ")
    }
}

pub fn dry_run(ctx: &Ctx, out: &mut String) -> fmt::Result {
    let d = &ctx.derived;
    let op = ctx.op;
    let positional: Vec<&Arg> = d.positionals().collect();
    let sensitive: Vec<&[String]> = op
        .body_params
        .iter()
        .filter(|p| p.sensitive)
        .map(|p| p.api_field_path.as_slice())
        .collect();
    let param = |name: &str| {
        let q = quote(name);
        format!("${{argv[{q}] == null ? '<{name}>' : encodeURIComponent(String(argv[{q}]))}}")
    };
    let template = substitute_path(
        &op.path,
        &PathTemplate {
            needs_worker_name: ctx.needs_worker_name,
            args: &d.args,
            positional: &positional,
            first_positional_is_zone: false,
            account_id: "${__cfDryRunAccountId ?? '<account-id>'}",
            script_name: "${argv[\"worker\"] ?? '<worker>'}",
            zone: "${argv.zone ?? argv.zoneId ?? '<zone>'}",
            param: &param,
        },
    );
    let path_entries = ctx
        .path_param_names()
        .into_iter()
        .filter(|n| !ACCOUNT_PATH_PARAMS.contains(&n.as_str()))
        .map(|name| {
            let read_key = path_param_read_key(&d.args, &name);
            let (key, read) = (quote(&read_key), argv_key(&read_key));
            if let Some(local) = account_or_zone_local(&op.path, &name) {
                format!("{key}: String({local})")
            } else if ZONE_PATH_PARAMS.contains(&name.as_str()) {
                format!("{key}: String(argv.zone ?? {read} ?? '')")
            } else {
                format!("{key}: String({read} ?? '')")
            }
        })
        .collect::<Vec<_>>()
        .join(", ");
    let mut body_keys: Vec<String> = Vec::new();
    if d.is_mutating {
        for a in positional.iter().filter(|a| !a.is_path()) {
            push_unique(&mut body_keys, a.name.clone());
        }
        if d.has_body_params {
            for a in d.body_options() {
                push_unique(&mut body_keys, a.name.clone());
            }
        }
        if d.has_body {
            push_unique(&mut body_keys, "body".to_owned());
        }
        if d.has_file_upload {
            push_unique(&mut body_keys, "file".to_owned());
        }
        for f in d.multipart_flag_fields.iter().chain(&d.multipart_file_fields) {
            push_unique(&mut body_keys, f.flag.clone());
        }
    }
    let body_entries = body_keys
        .iter()
        .map(|k| format!("{}: {}", quote(k), argv_key(k)))
        .collect::<Vec<_>>()
        .join(", ");
    let json = ctx.accepts_json();
    let multipart_only =
        d.multipart.is_some() && !op.request_content_types.iter().any(|c| c == "application/octet-stream");
    let has_flag_reads = !d.multipart_flag_fields.is_empty() || !d.multipart_file_fields.is_empty();
    let uses_multipart = uses_multipart(ctx);
    let group = ctx.group.filter(|g| !g.is_empty()).map(|g| g.replace('/', " "));
    let command = ["cf", ctx.resource]
        .into_iter()
        .chain(group.as_deref())
        .chain([ctx.method.name.as_str()])
        .filter(|c| !c.is_empty())
        .collect::<Vec<_>>()
        .join(" ");
    let body_kind = if !d.is_mutating {
        "'none'".to_owned()
    } else if multipart_only {
        "'multipart'".to_owned()
    } else if d.multipart.is_some() && has_flag_reads {
        format!("{uses_multipart} ? 'multipart' : 'octet-stream'")
    } else if d.has_file_upload && json {
        "argv.file !== undefined ? 'octet-stream' : 'json'".to_owned()
    } else if !op.request_content_types.is_empty() && !json {
        "'octet-stream'".to_owned()
    } else if !body_keys.is_empty() || d.has_body {
        "'json'".to_owned()
    } else {
        "'none'".to_owned()
    };

    writeln!(out, "if (argv.dryRun) {{")?;
    match ctx.scope {
        Scope::AccountOrZone => out.push_str(
            r#"const __cfDryRunAccountId = argv.zone === undefined ? await resolveAccountIdSilent() : undefined;
            const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
            const accountOrZoneId = argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
            "#,
        ),
        Scope::Ids { account: true, .. } => {
            out.push_str("const __cfDryRunAccountId = await resolveAccountIdSilent();\n");
        }
        Scope::Ids { .. } => {}
    }
    writeln!(
        out,
        "formatDryRun({{
        command: '{command}',
        method: '{}',
        url: `https://api.cloudflare.com/client/v4{template}`,
        pathParams: {{ {path_entries} }},",
        op.method.as_str(),
    )?;
    if ctx.has_query() {
        writeln!(out, "query: queryParams,")?;
    }
    writeln!(out, "bodyKind: {body_kind},")?;
    if d.has_body {
        if multipart_only {
            writeln!(out, "body: {{ {body_entries} }},")?;
        } else if d.multipart.is_some() && has_flag_reads {
            writeln!(
                out,
                "body: {uses_multipart}
                ? {{ {body_entries} }}
                : argv.body,"
            )?;
        } else if json {
            if d.has_file_upload {
                out.push_str(
                    "body: argv.file !== undefined
                    ? { file: argv.file }
                    : argv.body !== undefined
                    ",
                );
            } else {
                writeln!(out, "body: argv.body !== undefined")?;
            }
            writeln!(out, "? {}", parse_body_expression(ctx))?;
            if d.has_body_params {
                writeln!(
                    out,
                    ": {}compactBody(\n{}{}\n){} ,",
                    if op.body_unions.is_empty() {
                        ""
                    } else {
                        "validateBodyUnions("
                    },
                    body_object(ctx),
                    preserved_body_paths(ctx),
                    if op.body_unions.is_empty() { "" } else { ", bodyUnions)" }
                )?;
            } else {
                writeln!(out, ": undefined,")?;
            }
        } else {
            writeln!(out, "body: argv.body,")?;
        }
    } else if !body_keys.is_empty() {
        writeln!(out, "body: {{ {body_entries} }},")?;
    }
    if !sensitive.is_empty() {
        let paths = serde_json::to_string(&sensitive).expect("paths serialize");
        writeln!(out, "sensitiveBodyPaths: {paths},")?;
    }
    out.push_str("});\nreturn;\n}\n");
    Ok(())
}

fn auth(ctx: &Ctx, out: &mut String) -> fmt::Result {
    writeln!(out, "const client = await createCommandClient(argv);")?;
    let first = ctx.positionals().next();
    match ctx.scope {
        Scope::AccountOrZone => out.push_str(
            r#"const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
            const accountOrZoneId = accountOrZone === "zones"
              ? await getZoneId({ zone: argv.zone }, client, { quiet: argv.quiet })
              : argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
            if (accountOrZone === "zones") {
              argv.zoneId = accountOrZoneId;
            } else {
              argv.accountId = accountOrZoneId;
            }
            "#,
        ),
        Scope::Ids { account, zone } => {
            if account {
                out.push_str(
                    "const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
                    argv.accountId = accountId;
                    ",
                );
            }
            if zone {
                match first.filter(|_| ctx.first_positional_is_zone()) {
                    Some(pos) => {
                        let local = arg_local_ident(&pos.name);
                        let read = argv_key(&pos.name);
                        writeln!(
                            out,
                            "const {local} = await getZoneId({{ zone: argv.zone, zoneId: {read} }}, client, {{ quiet: argv.quiet }});
                            {read} = {local};"
                        )?;
                    }
                    None => out.push_str(
                        "const zoneId = await getZoneId({ zone: argv.zone }, client, { quiet: argv.quiet });
                        argv.zoneId = zoneId;
                        ",
                    ),
                }
            }
        }
    }
    if ctx.needs_worker_name {
        let read = match first.filter(|_| ctx.first_positional_is_worker_name()) {
            Some(pos) => argv_key(&kebab(&pos.name)),
            None => r#"argv["worker"]"#.to_owned(),
        };
        writeln!(
            out,
            "const scriptName = getWorkerName({{ scriptName: {read} }});
            {read} = scriptName;"
        )?;
    }
    Ok(())
}

fn delete_confirm(ctx: &Ctx, out: &mut String) -> fmt::Result {
    let opts = match &ctx.method.require_confirmation {
        Some(message) => format!(
            "{{ force: Boolean(argv.force), message: `{}` }}",
            escape_template(message)
        ),
        None => "{ force: Boolean(argv.force) }".to_owned(),
    };
    writeln!(out)?;
    writeln!(
        out,
        "if (!(await confirmDelete({opts}))) {{
          return;
        }}"
    )
}

fn multipart(ctx: &Ctx, out: &mut String) -> fmt::Result {
    let d = &ctx.derived;
    let Some(info) = &d.multipart else {
        return Ok(());
    };
    let any = uses_multipart(ctx);
    let has_reads = !d.multipart_flag_fields.is_empty() || !d.multipart_file_fields.is_empty();
    let only = !ctx
        .op
        .request_content_types
        .iter()
        .any(|c| c == "application/octet-stream");
    let guard = match (only, has_reads) {
        (true, false) => "(argv.file !== undefined) || (argv.body !== undefined)".to_owned(),
        (true, true) => format!("(argv.file !== undefined) || (argv.body !== undefined) || {any}"),
        (false, _) => any,
    };
    if guard == "false" {
        return Ok(());
    }
    let payload = info.payload_field.as_deref().unwrap_or("file");
    writeln!(out)?;
    writeln!(
        out,
        "if ({guard}) {{
          const formData = new FormData();
          if (argv.file !== undefined) {{
            const fileContent = readFileForFlag(argv.file);
            formData.append('{payload}', new Blob([fileContent]), {FILE_NAME});
          }} else if (argv.body !== undefined) {{
            formData.append('{payload}', argv.body);
          }}"
    )?;
    for f in &d.multipart_flag_fields {
        let flag = &f.flag;
        let read = argv_key(flag);
        let name = &f.field.name;
        match f.field.ty {
            JsonType::Object | JsonType::Array => writeln!(
                out,
                "if ({read} !== undefined) {{
                  const v = typeof {read} === 'string' ? resolveFileToken({read}, '{flag}', 'text') : {read};
                  formData.append('{name}', typeof v === 'string' ? v : JSON.stringify(v));
                }}"
            )?,
            JsonType::String => writeln!(
                out,
                "if ({read} !== undefined) formData.append('{name}', String(resolveFileToken({read} as string | undefined, '{flag}', 'text') ?? ''));"
            )?,
            JsonType::Number | JsonType::Boolean | JsonType::ScalarUnion => writeln!(
                out,
                "if ({read} !== undefined) formData.append('{name}', String({read}));"
            )?,
        }
    }
    for f in &d.multipart_file_fields {
        let read = argv_key(&f.flag);
        writeln!(out, "if ({read} !== undefined) {{")?;
        if f.field.ty == JsonType::Array {
            writeln!(out, "for (const value of {read}) {{")?;
        } else {
            writeln!(out, "const value = String({read});")?;
        }
        writeln!(
            out,
            "if (value.startsWith('@')) {{
const filePath = value.slice(1);
const fileContent = resolveFileToken(value, {}, 'binary') as Buffer<ArrayBuffer>;
formData.append({}, new Blob([fileContent]), filePath.split(/[\\\\/]/).filter(Boolean).pop());
}} else {{
formData.append({}, new Blob([value]), {});
}}",
            quote(&f.flag),
            quote(&f.field.name),
            quote(&f.field.name),
            quote(&f.field.name)
        )?;
        if f.field.ty == JsonType::Array {
            writeln!(out, "}}")?;
        }
        writeln!(out, "}}")?;
    }
    send_form(ctx, out, &format!("`{}`", ctx.request_path))?;
    writeln!(out, "}}")
}

fn file_upload(ctx: &Ctx, out: &mut String) -> fmt::Result {
    let d = &ctx.derived;
    let cts = &ctx.op.request_content_types;
    if !d.has_file_upload || d.multipart.is_some() && !cts.iter().any(|c| c == "application/octet-stream") {
        return Ok(());
    }
    writeln!(out)?;
    out.push_str("if (argv.file !== undefined) {\nconst fileContent = readFileForFlag(argv.file);\n");
    let primary = cts
        .iter()
        .find(|c| *c != "application/json")
        .map_or("application/octet-stream", String::as_str);
    let url = format!("`{}`", ctx.request_path);
    if primary == "multipart/form-data" {
        let field = d
            .multipart
            .as_ref()
            .and_then(|m| m.payload_field.as_deref())
            .unwrap_or("file");
        writeln!(
            out,
            "const formData = new FormData();
            formData.append('{field}', new Blob([fileContent]), {FILE_NAME});"
        )?;
        send_form(ctx, out, &url)?;
    } else if ctx.is_raw_output() {
        let content_type = format!("contentType: '{primary}'");
        ctx.send_raw(out, &url, &raw_parts(ctx, &["body: fileContent", &content_type]))?;
    } else {
        let headers = if ctx.has_headers() {
            format!("{{ 'Content-Type': '{primary}', ...{HEADERS_GUARDED} }}")
        } else {
            format!("{{ 'Content-Type': '{primary}' }}")
        };
        let opts = format!("{{ body: fileContent, headers: {headers} }}");
        ctx.send(out, &request_api(ctx, &url, &opts))?;
        writeln!(out, "return;")?;
    }
    writeln!(out, "}}")
}

pub fn body_bypass_uses_request_api(ctx: &Ctx) -> bool {
    if !ctx.derived.has_body || ctx.is_raw_output() {
        return false;
    }
    !(ctx.accepts_json() && sdk::can_emit_typed_json_body_call(ctx))
}

fn body_bypass(ctx: &Ctx, out: &mut String) -> fmt::Result {
    if !ctx.derived.has_body {
        return Ok(());
    }
    let op = ctx.op;
    let json = ctx.accepts_json();
    let raw_ct = op
        .request_content_types
        .iter()
        .find(|c| *c != "application/json")
        .map_or("application/octet-stream", String::as_str);
    writeln!(out)?;
    writeln!(
        out,
        "if ({}) {{",
        if json { "argv.body" } else { "argv.body !== undefined" }
    )?;
    if json {
        writeln!(out, "const bodyData = {};", parse_body_expression(ctx))?;
    } else {
        out.push_str(
            "// Endpoint does not accept application/json — send --body as raw bytes,
            // resolving @file references as binary file contents.
            const bodyData = resolveFileToken(argv.body, 'body', 'binary');
            ",
        );
    }
    let headers = match (ctx.has_headers(), json) {
        (true, true) => Some(HEADERS_GUARDED.to_owned()),
        (true, false) => Some(format!("{{ 'Content-Type': '{raw_ct}', ...headers }}")),
        (false, false) => Some(format!("{{ 'Content-Type': '{raw_ct}' }}")),
        (false, true) => None,
    };
    let with_headers = |body: &str| match &headers {
        Some(headers) => format!("{{ body: {body}, headers: {headers} }}"),
        None => format!("{{ body: {body} }}"),
    };
    query_string(ctx, out)?;
    let url = request_url(ctx);
    if ctx.is_raw_output() {
        let content_type = format!("contentType: '{raw_ct}'");
        let parts: &[&str] = if json {
            &["body: JSON.stringify(bodyData)", "contentType: 'application/json'"]
        } else {
            &["body: bodyData", &content_type]
        };
        ctx.send_raw(out, &url, &raw_parts(ctx, parts))?;
    } else {
        let request = if json && sdk::can_emit_typed_json_body_call(ctx) {
            sdk::body_call(ctx)
        } else {
            request_api(ctx, &url, &with_headers("bodyData"))
        };
        ctx.send(out, &request)?;
        writeln!(out, "return;")?;
    }
    writeln!(out, "}}")
}

pub fn body_prompts(ctx: &Ctx, out: &mut String) -> fmt::Result {
    if ctx.derived.has_body_params {
        for arg in ctx.derived.body_options().filter(|a| a.required) {
            let desc = escape_single(&arg.description);
            let read = argv_key(&arg.name);
            let name = &arg.name;
            writeln!(out, "if ({read} === undefined) {{")?;
            match &arg.choices {
                Some(choices) if !choices.is_empty() => {
                    let list = choices
                        .iter()
                        .map(|c| format!("'{}'", escape_single(c)))
                        .collect::<Vec<_>>()
                        .join(", ");
                    writeln!(
                        out,
                        "{read} = await promptForRequiredEnumField('{name}', '{desc}', [{list}] as const);"
                    )?;
                }
                _ if arg.ty == ArgType::String => {
                    let opts = if arg.secret { ", { kind: 'secret' }" } else { "" };
                    writeln!(out, "{read} = await promptForRequiredField('{name}', '{desc}'{opts});")?;
                }
                _ => writeln!(
                    out,
                    "throw new Error('--{name} is required (or pass --body with this field set).');"
                )?,
            }
            writeln!(out, "}}")?;
        }
    }
    let checks = variant_checks(ctx.op, &body_fields(ctx));
    if !checks.is_empty() {
        writeln!(out)?;
        for check in &checks {
            write!(out, "{check}")?;
        }
    }
    Ok(())
}

/// The non-path positionals and required options that go into the body,
/// as their argv keys and API field names.
fn body_field_args<'a>(ctx: &'a Ctx) -> Vec<(&'a Arg, String)> {
    let mut out = Vec::new();
    for arg in ctx
        .positionals()
        .filter(|a| !a.is_path() && !a.is_zone && !a.is_worker_name)
    {
        let field = match arg.body_path() {
            Some([field]) => field.clone(),
            _ => arg.name.replace('-', "_"),
        };
        out.push((arg, field));
    }
    out
}

/// The value a body flag gives its field, as code.
fn body_arg_value(arg: &Arg, read: &str) -> String {
    let parser = match arg.ty {
        ArgType::ScalarUnion => Some("parseScalarValue"),
        ArgType::NestedArray => Some("parseNestedArray"),
        ArgType::ObjectMap => Some("parseJsonMap"),
        _ => None,
    };
    if let Some(parser) = parser {
        return format!(
            "{parser}({read}, {}{})",
            quote(&arg.name),
            if arg.ty == ArgType::ObjectMap && arg.required {
                ", true"
            } else {
                ""
            }
        );
    }

    if arg.ty == ArgType::ObjectArray {
        return format!("parseObjectArray({read}, {})", quote(&arg.name));
    }
    // Enum flags resolve `@file` in their builder's coerce, before
    // validation.
    if arg.from_file.is_some() && !arg.has_choices() {
        return format!(
            "resolveFileToken({read} as string | undefined, {}, {})",
            quote(&arg.name),
            arg.file_format()
        );
    }
    read.to_owned()
}

/// The fields of a body object, nested by their paths, which displays as
/// the object's literal.
#[derive(Default)]
struct Tree {
    value: Option<String>,
    children: Vec<(String, Tree)>,
}

impl Tree {
    fn add(&mut self, segments: &[String], value: String) {
        let mut node = self;
        for segment in segments {
            let i = match node.children.iter().position(|(n, _)| n == segment) {
                Some(i) => i,
                None => {
                    node.children.push((segment.clone(), Tree::default()));
                    node.children.len() - 1
                }
            };
            node = &mut node.children[i].1;
        }
        node.value = Some(value);
    }
}

impl Display for Tree {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        writeln!(f, "{{")?;
        for (name, child) in &self.children {
            let key = if is_identifier(name) { name.clone() } else { quote(name) };
            if child.children.is_empty() {
                writeln!(f, "{key}: {},", child.value.as_deref().unwrap_or("undefined"))?;
            } else {
                writeln!(f, "{key}: {child},")?;
            }
        }
        write!(f, "}}")
    }
}

/// The body's object literal, assembled from its flags.
pub fn body_object(ctx: &Ctx) -> impl Display {
    let mut root = Tree::default();
    for arg in ctx.derived.body_options() {
        if let Some(path) = arg.body_path() {
            root.add(path, body_arg_value(arg, &argv_key(&arg.name)));
        }
    }
    for (arg, field) in body_field_args(ctx) {
        root.add(&[field], body_arg_value(arg, &argv_key(&arg.name)));
    }
    root
}

pub fn sdk_call_uses_request_api(ctx: &Ctx) -> bool {
    if ctx.is_raw_output() {
        return false;
    }
    if ctx.derived.has_body_params {
        return !sdk::can_emit_typed_body_call(ctx);
    }
    let typed = sdk::can_emit_typed_call(ctx);
    !body_unsatisfiable(ctx, typed) && !typed
}

/// Whether a command without body flags needs `--body`: its body has a
/// shape to fill in, or is required and has fields, and a typed call can't
/// send it.
fn body_unsatisfiable(ctx: &Ctx, typed: bool) -> bool {
    let d = &ctx.derived;
    d.has_body && (!d.has_empty_body || ctx.op.request_body_mandatory) && !typed
}

fn body_assembly(ctx: &Ctx, out: &mut String) -> fmt::Result {
    writeln!(out)?;
    writeln!(out, "// Assemble request body from individual flags")?;
    let typed = sdk::can_emit_typed_body_call(ctx);
    if typed {
        writeln!(
            out,
            "const bodyData = compactBody(\n{}{}\n);",
            body_object(ctx),
            preserved_body_paths(ctx)
        )?;
    } else {
        writeln!(out, "const bodyData: Record<string, unknown> = {{}};")?;
        for arg in ctx.derived.body_options() {
            let Some(path) = arg.body_path() else {
                continue;
            };
            let p = path.iter().map(|s| quote(s)).collect::<Vec<_>>().join(", ");
            let read = argv_key(&arg.name);
            let value = body_arg_value(arg, &read);
            writeln!(
                out,
                "if ({read} !== undefined) setNestedValue(bodyData, [{p}], {value});"
            )?;
        }
        for (arg, field) in body_field_args(ctx) {
            let read = argv_key(&arg.name);
            writeln!(
                out,
                "if ({read} !== undefined) bodyData[{}] = {};",
                quote(&field),
                body_arg_value(arg, &read)
            )?;
        }
    }
    if !ctx.op.body_unions.is_empty() {
        writeln!(out, "validateBodyUnions(bodyData, bodyUnions);")?;
    }
    query_string(ctx, out)?;
    if ctx.is_raw_output() {
        let parts = raw_parts(ctx, &["body: Object.keys(bodyData).length > 0 ? bodyData : undefined"]);
        ctx.send_raw(out, &request_url(ctx), &parts)
    } else if typed {
        ctx.send(out, &sdk::body_call(ctx))
    } else {
        // Like a typed call, which sends a body that needs none of its
        // fields empty, rather than leaving it out.
        ctx.send(out, &request_api(ctx, &request_url(ctx), &body_opts(ctx, "bodyData")))
    }
}

fn plain_call(ctx: &Ctx, out: &mut String) -> fmt::Result {
    let d = &ctx.derived;
    writeln!(out)?;
    let typed = sdk::can_emit_typed_call(ctx);
    let unsatisfiable = body_unsatisfiable(ctx, typed);
    if ctx.is_raw_output() {
        query_string(ctx, out)?;
        return ctx.send_raw(out, &request_url(ctx), &raw_parts(ctx, &[]));
    }
    if unsatisfiable {
        return Ok(());
    }
    let url = format!("`{}`", ctx.request_path);
    let request = if ctx.has_headers() {
        let mut opts = Vec::new();
        if d.has_body {
            let fields: Vec<String> = body_field_args(ctx)
                .iter()
                .map(|(arg, field)| format!("'{field}': {}", body_arg_value(arg, &argv_key(&arg.name))))
                .collect();
            if !fields.is_empty() {
                opts.push(format!("body: {{ {} }}", fields.join(", ")));
            }
        }
        if ctx.has_query() {
            opts.push("query: queryParams".to_owned());
        }
        opts.push(format!("headers: {HEADERS_GUARDED}"));
        request_api(ctx, &url, &format!("{{ {} }}", opts.join(", ")))
    } else if typed {
        sdk::typed_call(ctx)
    } else {
        request_api(ctx, &url, if ctx.has_query() { "{ query: queryParams }" } else { "" })
    };
    ctx.send(out, &request)
}

/// The body fields of a command.
fn body_fields<'a>(ctx: &'a Ctx) -> Vec<&'a Arg> {
    ctx.derived.args.iter().filter(|a| a.is_body()).collect()
}

/// What a variant of a discriminated body needs of a flag the user didn't
/// set, which displays as the check's code.
pub enum VariantCheck<'a> {
    /// The variant needs `fields`, which have no flags.
    Unsupported {
        discriminator: String,
        value: &'a str,
        fields: Vec<&'a str>,
    },
    /// The variant needs `flag`: it is prompted for when `arg` takes text,
    /// or else required.
    Required {
        discriminator: String,
        value: &'a str,
        flag: String,
        arg: Option<&'a Arg>,
        description: String,
    },
}

impl VariantCheck<'_> {
    /// Whether the check prompts for text.
    pub fn prompts(&self) -> bool {
        matches!(self, VariantCheck::Required { arg: Some(arg), .. } if matches!(arg.ty, ArgType::String | ArgType::Enum))
    }
}

impl Display for VariantCheck<'_> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            VariantCheck::Unsupported {
                discriminator,
                value,
                fields,
            } => {
                let value = escape_single(value);
                let fields = escape_single(&fields.join(", "));
                writeln!(
                    f,
                    "if ({discriminator} === '{value}') {{
                      throw new Error('The {value} variant requires {fields}, which cannot be supplied as flags. Pass --body with a complete request body.');
                    }}"
                )
            }
            VariantCheck::Required {
                discriminator,
                value,
                flag,
                arg,
                description,
            } => {
                let read = argv_key(flag);
                writeln!(
                    f,
                    "if ({discriminator} === '{}' && {read} === undefined) {{",
                    escape_single(value)
                )?;
                if self.prompts() {
                    let secret = if arg.is_some_and(|a| a.secret) {
                        "kind: 'secret', "
                    } else {
                        ""
                    };
                    writeln!(
                        f,
                        "{read} = await promptForRequiredField('{flag}', '{}', {{ {secret}question: 'Enter value for --{flag}' }});",
                        escape_single(description)
                    )?;
                } else {
                    writeln!(
                        f,
                        "throw new Error('--{flag} is required (or pass --body with this field set).');"
                    )?;
                }
                writeln!(f, "}}")
            }
        }
    }
}

/// The checks of the fields each variant of a discriminated body needs.
pub fn variant_checks<'a>(op: &'a OperationInfo, body_fields: &[&'a Arg]) -> Vec<VariantCheck<'a>> {
    let Some(disc) = &op.body_discriminator else {
        return Vec::new();
    };
    let mut api_to_flag: HashMap<&str, &str> = HashMap::new();
    let mut available: Vec<String> = Vec::new();
    let mut descriptions: HashMap<&str, &str> = HashMap::new();
    for a in body_fields {
        let Some(path) = a.body_path().filter(|p| !p.is_empty()) else {
            continue;
        };
        let head = &path[0];
        push_unique(&mut available, head.clone());
        if path.len() != 1 {
            continue;
        }
        api_to_flag.insert(head, &a.name);
        if !a.description.is_empty() {
            descriptions.insert(&a.name, &a.description);
        }
    }
    let flag_of = |f: &str| api_to_flag.get(f).map(|flag| (*flag).to_owned());
    let Some(disc_flag) = flag_of(&disc.field) else {
        return Vec::new();
    };
    let discriminator = argv_key(&disc_flag);
    let mut checks = Vec::new();
    for (value, fields) in &disc.variants {
        let unavailable: Vec<&str> = fields
            .iter()
            .filter(|f| !available.contains(f))
            .map(String::as_str)
            .collect();
        if !unavailable.is_empty() {
            checks.push(VariantCheck::Unsupported {
                discriminator: discriminator.clone(),
                value,
                fields: unavailable,
            });
            continue;
        }
        for flag in fields.iter().filter_map(|f| flag_of(f)).filter(|f| !f.is_empty()) {
            checks.push(VariantCheck::Required {
                discriminator: discriminator.clone(),
                value,
                arg: body_fields.iter().rev().find(|a| a.name == flag).copied(),
                description: descriptions
                    .get(flag.as_str())
                    .map_or_else(|| format!("value for --{flag}"), |d| (*d).to_owned()),
                flag,
            });
        }
    }
    checks
}

/// The imports of a command, in the order cf rendered them, which display
/// as their statements.
#[derive(Default)]
pub struct Imports {
    typed: Vec<(String, Vec<String>)>,
    named: Vec<(String, Vec<String>)>,
    defaults: Vec<(String, String)>,
}

impl Imports {
    fn add(list: &mut Vec<(String, Vec<String>)>, path: &str, names: &[&str]) {
        let i = match list.iter().position(|(p, _)| p == path) {
            Some(i) => i,
            None => {
                list.push((path.to_owned(), Vec::new()));
                list.len() - 1
            }
        };
        for name in names {
            push_unique(&mut list[i].1, (*name).to_owned());
        }
    }

    fn from(&mut self, path: &str, names: &[&str]) {
        Self::add(&mut self.named, path, names);
    }

    fn type_from(&mut self, path: &str, names: &[&str]) {
        Self::add(&mut self.typed, path, names);
    }

    /// Imports the default export of `path` as `name`.
    fn default_from(&mut self, path: String, name: &str) {
        self.defaults.push((name.to_owned(), path));
    }
}

impl Display for Imports {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let sorted = |names: &[String]| {
            let mut names = names.to_vec();
            names.sort_by(|a, b| code_unit_compare(a, b));
            names.join(", ")
        };
        for (path, names) in self.typed.iter().filter(|(_, n)| !n.is_empty()) {
            writeln!(f, "import type {{ {} }} from '{path}';", sorted(names))?;
        }
        for (path, names) in self.named.iter().filter(|(_, n)| !n.is_empty()) {
            writeln!(f, "import {{ {} }} from '{path}';", sorted(names))?;
        }
        for (name, path) in &self.defaults {
            writeln!(f, "import {name} from '{path}';")?;
        }
        Ok(())
    }
}

/// The imports of a command's module.
pub fn imports(ctx: &Ctx) -> Imports {
    let d = &ctx.derived;
    let mut i = Imports::default();
    i.type_from("yargs", &["Argv", "CommandModule"]);
    i.type_from("#lib/cli-types.js", &["CommonYargsOptions", "InferArgs"]);
    let mut auth = vec!["createCommandClient"];
    if ctx.scope.needs_account() {
        auth.extend(["getAccountId", "resolveAccountIdSilent"]);
    }
    if ctx.scope.needs_zone() {
        auth.push("getZoneId");
    }
    if ctx.needs_worker_name {
        auth.push("getWorkerName");
    }
    if body_bypass_uses_request_api(ctx) || sdk_call_uses_request_api(ctx) {
        auth.push("requestApi");
    }
    i.from("#lib/auth.js", &auth);
    if ctx.scope.needs_account() {
        i.from("#lib/local.js", &["LOCAL_ACCOUNT_ID"]);
    }
    i.from("#lib/output.js", &["formatOutput"]);
    i.from("#lib/dry-run.js", &["formatDryRun"]);
    if !ctx.op.body_unions.is_empty() && d.has_body_params {
        i.from("#lib/body-unions.js", &["validateBodyUnions"]);
    }
    i.from("#lib/progress.js", &["withProgress"]);
    i.from("#lib/telemetry/index.js", &["runWithTelemetry"]);
    i.type_from("#lib/telemetry/index.js", &["ArgClassification"]);
    if matches!(ctx.output_kind, OutputKind::Binary | OutputKind::Text) {
        i.from("#lib/raw-fetch.js", &["fetchRawBytes", "writeRawOutput"]);
    }
    let body_flags: Vec<&Arg> = d.body_options().collect();
    let body_args: Vec<_> = body_flags
        .iter()
        .copied()
        .chain(body_field_args(ctx).into_iter().map(|(arg, _)| arg))
        .collect();
    let needs_token = body_args.iter().any(|a| a.from_file.is_some())
        || !d.multipart_flag_fields.is_empty()
        || !d.multipart_file_fields.is_empty()
        || (d.has_body && !ctx.accepts_json());
    if needs_token || d.has_file_upload {
        let mut names = Vec::new();
        if needs_token {
            names.push("resolveFileToken");
        }
        if d.has_file_upload {
            names.push("readFileForFlag");
        }
        i.from("#lib/input-validation.js", &names);
    }
    if d.has_body || d.has_body_params {
        let mut names = Vec::new();
        if d.has_body {
            names.push("parseBody");
        }
        if d.has_body_params {
            names.push("compactBody");
        }
        if body_args.iter().any(|a| a.ty == ArgType::ObjectMap) {
            names.push("parseJsonMap");
        }
        if body_args.iter().any(|a| a.ty == ArgType::NestedArray) {
            names.push("parseNestedArray");
        }
        if body_args.iter().any(|a| a.ty == ArgType::ScalarUnion) {
            names.push("parseScalarValue");
        }
        if body_args.iter().any(|a| a.ty == ArgType::ObjectArray) {
            names.push("parseObjectArray");
        }
        if d.has_body_params && !sdk::can_emit_typed_body_call(ctx) {
            names.push("setNestedValue");
        }
        i.from("#lib/body-parser.js", &names);
    }
    let mut text = variant_checks(ctx.op, &body_fields(ctx))
        .iter()
        .any(VariantCheck::prompts);
    let mut enumerated = false;
    for a in body_flags.iter().filter(|a| a.required) {
        if a.has_choices() {
            enumerated = true;
        } else if a.ty == ArgType::String {
            text = true;
        }
    }
    if text || enumerated || ctx.is_delete() {
        let mut names = Vec::new();
        if text {
            names.push("promptForRequiredField");
        }
        if enumerated {
            names.push("promptForRequiredEnumField");
        }
        if ctx.is_delete() {
            names.push("confirmDelete");
        }
        i.from("#lib/prompt.js", &names);
    }
    if sdk::makes_typed_call(ctx) {
        i.default_from(sdk::operation_module(ctx), "operation");
    }
    i
}
