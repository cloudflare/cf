//! Emits a command's handler and its imports.

use super::{
    Ctx, OutputKind, PathTemplate, arg_local_ident, argv_key, escape_single, escape_template, sdk, substitute_path,
};
use crate::args::{
    ACCOUNT_PATH_PARAMS, Arg, ArgType, Origin, ZONE_PATH_PARAMS, account_or_zone_local, path_param_read_key,
};
use crate::js::{Value, code_unit_compare, get_entry, is_identifier, kebab, push_unique, quote, set_entry, stringify};
use crate::operation::{FieldType, OperationInfo};

const HEADERS_GUARDED: &str = "Object.keys(headers).length > 0 ? headers : undefined";
const QS_FROM_PARAMS: &str = "new URLSearchParams(Object.entries(queryParams).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()";

fn request_api(ctx: &Ctx, url: &str, opts: &str) -> String {
    let method = quote(&ctx.op.method.to_uppercase());
    if opts.is_empty() {
        format!("requestApi<unknown>(client, {method}, {url})")
    } else {
        format!("requestApi<unknown>(client, {method}, {url}, {opts})")
    }
}

/// The options of a passthrough request with `body`, and the headers when
/// the command has them.
fn body_opts(ctx: &Ctx, body: &str) -> String {
    if ctx.has_headers {
        format!("{{ body: {body}, headers: {HEADERS_GUARDED} }}")
    } else {
        format!("{{ body: {body} }}")
    }
}

/// The parts of a raw request with `parts`, and the headers when the
/// command has them.
fn raw_parts(ctx: &Ctx, parts: &[&str]) -> Vec<String> {
    let mut parts: Vec<String> = parts.iter().map(|p| p.to_string()).collect();
    if ctx.has_headers {
        parts.push(format!("headers: {HEADERS_GUARDED}"));
    }
    parts
}

/// The lines that send `formData` and return.
fn send_form(ctx: &Ctx, url: &str, lines: &mut Vec<String>) {
    if ctx.is_raw_output {
        lines.extend(ctx.emit_raw_tail("        ", url, &raw_parts(ctx, &["body: formData"])));
    } else {
        let request = request_api(ctx, url, &body_opts(ctx, "formData"));
        lines.push(format!("        const result = {};", ctx.wrap_await(&request)));
        lines.push(ctx.format_output_call("        "));
        lines.push("        return;".to_owned());
    }
}

/// The request's URL, with its query string when the command has one, and
/// the line that builds the query string.
fn url_with_query(ctx: &Ctx, indent: &str, lines: &mut Vec<String>) -> String {
    if ctx.has_params {
        lines.push(format!("{indent}const qs = {QS_FROM_PARAMS};"));
        format!("`{}${{qs ? '?' + qs : ''}}`", ctx.resolved_request_path)
    } else {
        format!("`{}`", ctx.resolved_request_path)
    }
}

/// `emitHandler`.
pub fn handler(ctx: &Ctx) -> Vec<String> {
    let mut lines = prelude(ctx);
    lines.extend(dry_run(ctx));
    lines.extend(auth(ctx));
    if ctx.is_delete {
        lines.extend(delete_confirm(ctx));
    }
    lines.extend(multipart(ctx));
    lines.extend(file_upload(ctx));
    lines.extend(body_bypass(ctx));
    lines.extend(body_prompts(ctx));
    if ctx.derived.has_body_params {
        lines.extend(body_assembly(ctx));
    } else {
        lines.extend(plain_call(ctx));
    }
    lines
}

fn prelude(ctx: &Ctx) -> Vec<String> {
    let mut lines = Vec::new();
    if ctx.has_params {
        lines.push(String::new());
        lines.push("      const queryParams: Record<string, unknown> = {".to_owned());
        for a in ctx.derived.query_args() {
            if let Origin::Query(name) = &a.origin {
                lines.push(format!("        '{name}': {},", argv_key(&a.name)));
            }
        }
        lines.push("      };".to_owned());
    }
    if ctx.has_headers {
        lines.push(String::new());
        lines.push("      const headers: Record<string, string> = {};".to_owned());
        for a in ctx.derived.header_args() {
            if let Origin::Header(name) = &a.origin {
                let read = argv_key(&a.name);
                lines.push(format!(
                    "      if ({read} !== undefined) headers['{name}'] = String({read});"
                ));
            }
        }
    }
    lines
}

/// Whether any multipart flag is set, as code, or `false`.
fn uses_multipart(ctx: &Ctx) -> String {
    let reads: Vec<String> = ctx
        .derived
        .multipart_flag_fields
        .iter()
        .map(|f| format!("{} !== undefined", argv_key(&kebab(&f.name))))
        .collect();
    if reads.is_empty() {
        "false".to_owned()
    } else {
        reads.join(" || ")
    }
}

pub fn dry_run(ctx: &Ctx) -> Vec<String> {
    let d = &ctx.derived;
    let op = ctx.op;
    let positional: Vec<&Arg> = d.positionals().collect();
    let sensitive: Vec<Value> = op
        .body_params
        .iter()
        .filter(|p| p.sensitive)
        .map(|p| Value::from(p.api_field_path.clone()))
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
        .all_path_param_names
        .iter()
        .filter(|n| !ACCOUNT_PATH_PARAMS.contains(&n.as_str()))
        .map(|name| {
            let key = path_param_read_key(&d.args, name);
            let read = argv_key(&key);
            if let Some(local) = account_or_zone_local(&op.path, name) {
                format!("{}: String({local})", quote(&key))
            } else if ZONE_PATH_PARAMS.contains(&name.as_str()) {
                format!("{}: String(argv.zone ?? {read} ?? '')", quote(&key))
            } else {
                format!("{}: String({read} ?? '')", quote(&key))
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
        for f in &d.multipart_flag_fields {
            push_unique(&mut body_keys, kebab(&f.name));
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
    let has_flag_reads = !d.multipart_flag_fields.is_empty();
    let uses_multipart = uses_multipart(ctx);
    let mut command = vec!["cf", ctx.resource];
    let group = ctx.group.filter(|g| !g.is_empty()).map(|g| g.replace('/', " "));
    if let Some(group) = &group {
        command.push(group);
    }
    command.push(&ctx.method.name);
    let command_str = command
        .into_iter()
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
    let mut lines = vec!["      if (argv.dryRun) {".to_owned()];
    if ctx.needs_account_id {
        lines.push(if ctx.has_account_or_zone_scope {
            "        const __cfDryRunAccountId = argv.zone === undefined ? await resolveAccountIdSilent() : undefined;"
        } else {
            "        const __cfDryRunAccountId = await resolveAccountIdSilent();"
        }
        .to_owned());
    }
    if ctx.has_account_or_zone_scope {
        lines.push(r#"        const accountOrZone = argv.zone === undefined ? "accounts" : "zones";"#.to_owned());
        lines.push(r#"        const accountOrZoneId = argv.zone ?? __cfDryRunAccountId ?? "<account-id>";"#.to_owned());
    }
    lines.push("        formatDryRun({".to_owned());
    lines.push(format!("          command: '{command_str}',"));
    lines.push(format!("          method: '{}',", op.method.to_uppercase()));
    lines.push(format!(
        "          url: `https://api.cloudflare.com/client/v4{template}`,"
    ));
    lines.push(format!("          pathParams: {{ {path_entries} }},"));
    if ctx.has_params {
        lines.push("          query: queryParams,".to_owned());
    }
    lines.push(format!("          bodyKind: {body_kind},"));
    if d.has_body {
        if multipart_only {
            lines.push(format!("          body: {{ {body_entries} }},"));
        } else if d.multipart.is_some() && has_flag_reads {
            lines.push(format!("          body: {uses_multipart}"));
            lines.push(format!("            ? {{ {body_entries} }}"));
            lines.push("            : argv.body,".to_owned());
        } else if json {
            if d.has_file_upload {
                lines.push("          body: argv.file !== undefined".to_owned());
                lines.push("            ? { file: argv.file }".to_owned());
                lines.push("            : argv.body !== undefined".to_owned());
            } else {
                lines.push("          body: argv.body !== undefined".to_owned());
            }
            lines.push("            ? parseBody(argv.body)".to_owned());
            if d.has_body_params {
                lines.push("            : compactBody(".to_owned());
                for line in body_object(ctx, "\t\t\t\t") {
                    lines.push(format!("              {line}"));
                }
                lines.push("            ),".to_owned());
            } else {
                lines.push("            : undefined,".to_owned());
            }
        } else {
            lines.push("          body: argv.body,".to_owned());
        }
    } else if !body_keys.is_empty() {
        lines.push(format!("          body: {{ {body_entries} }},"));
    }
    if !sensitive.is_empty() {
        lines.push(format!(
            "          sensitiveBodyPaths: {},",
            stringify(&Value::Array(sensitive))
        ));
    }
    lines.push("        });".to_owned());
    lines.push("        return;".to_owned());
    lines.push("      }".to_owned());
    lines
}

fn auth(ctx: &Ctx) -> Vec<String> {
    let mut lines = vec!["      const client = await createCommandClient(argv);".to_owned()];
    if ctx.has_account_or_zone_scope {
        lines.extend(
            [
                r#"      const accountOrZone = argv.zone === undefined ? "accounts" : "zones";"#,
                r#"      const accountOrZoneId = accountOrZone === "zones""#,
                "        ? await getZoneId({ zone: argv.zone }, client, { quiet: argv.quiet })",
                "        : argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();",
                r#"      if (accountOrZone === "zones") {"#,
                "        argv.zoneId = accountOrZoneId;",
                "      } else {",
                "        argv.accountId = accountOrZoneId;",
                "      }",
            ]
            .map(str::to_owned),
        );
    } else if ctx.needs_account_id {
        lines.push("      const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();".to_owned());
        lines.push("      argv.accountId = accountId;".to_owned());
    }
    let first = ctx.positionals().next();
    if ctx.needs_zone_id && !ctx.has_account_or_zone_scope {
        match first.filter(|_| ctx.first_positional_is_zone) {
            Some(pos) => {
                let local = arg_local_ident(&pos.name);
                let read = argv_key(&pos.name);
                lines.push(format!(
                    "      const {local} = await getZoneId({{ zone: argv.zone, zoneId: {read} }}, client, {{ quiet: argv.quiet }});"
                ));
                lines.push(format!("      {read} = {local};"));
            }
            None => {
                lines.push(
                    "      const zoneId = await getZoneId({ zone: argv.zone }, client, { quiet: argv.quiet });"
                        .to_owned(),
                );
                lines.push("      argv.zoneId = zoneId;".to_owned());
            }
        }
    }
    if ctx.needs_worker_name {
        let read = match first.filter(|_| ctx.first_positional_is_worker_name) {
            Some(pos) => argv_key(&kebab(&pos.name)),
            None => r#"argv["worker"]"#.to_owned(),
        };
        lines.push(format!(
            "      const scriptName = getWorkerName({{ scriptName: {read} }});"
        ));
        lines.push(format!("      {read} = scriptName;"));
    }
    lines
}

fn delete_confirm(ctx: &Ctx) -> Vec<String> {
    let opts = match &ctx.method.require_confirmation {
        Some(message) => format!(
            "{{ force: Boolean(argv.force), message: `{}` }}",
            escape_template(message)
        ),
        None => "{ force: Boolean(argv.force) }".to_owned(),
    };
    vec![
        String::new(),
        format!("      if (!(await confirmDelete({opts}))) {{"),
        "        process.stderr.write('Aborted.\\n');".to_owned(),
        "        return;".to_owned(),
        "      }".to_owned(),
    ]
}

const FILE_NAME: &str = "argv.file.split(/[\\\\/]/).filter(Boolean).pop()";

fn multipart(ctx: &Ctx) -> Vec<String> {
    let d = &ctx.derived;
    let Some(info) = &d.multipart else {
        return Vec::new();
    };
    let any = uses_multipart(ctx);
    let has_reads = !d.multipart_flag_fields.is_empty();
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
        return Vec::new();
    }
    let payload = info.payload_field.as_deref().unwrap_or("file");
    let mut lines = vec![
        String::new(),
        format!("      if ({guard}) {{"),
        "        const formData = new FormData();".to_owned(),
        "        if (argv.file) {".to_owned(),
        "          const fileContent = readFileForFlag(argv.file);".to_owned(),
        format!("          formData.append('{payload}', new Blob([fileContent]), {FILE_NAME});"),
        "        } else if (argv.body !== undefined) {".to_owned(),
        format!("          formData.append('{payload}', argv.body);"),
        "        }".to_owned(),
    ];
    for f in &d.multipart_flag_fields {
        let flag = kebab(&f.name);
        let read = argv_key(&flag);
        let name = &f.name;
        match f.ty {
            FieldType::Object | FieldType::Array => {
                lines.push(format!("        if ({read} !== undefined) {{"));
                lines.push(format!(
                    "          const v = typeof {read} === 'string' ? resolveFileToken({read}, '{flag}', 'text') : {read};"
                ));
                lines.push(format!("          formData.append('{name}', typeof v === 'string' ? v : JSON.stringify(v));"));
                lines.push("        }".to_owned());
            }
            FieldType::String => lines.push(format!(
                "        if ({read} !== undefined) formData.append('{name}', String(resolveFileToken({read} as string | undefined, '{flag}', 'text') ?? ''));"
            )),
            _ => lines.push(format!("        if ({read} !== undefined) formData.append('{name}', String({read}));")),
        }
    }
    send_form(ctx, &format!("`{}`", ctx.resolved_request_path), &mut lines);
    lines.push("      }".to_owned());
    lines
}

fn file_upload(ctx: &Ctx) -> Vec<String> {
    let d = &ctx.derived;
    if !d.has_file_upload {
        return Vec::new();
    }
    let cts = &ctx.op.request_content_types;
    if d.multipart.is_some() && !cts.iter().any(|c| c == "application/octet-stream") {
        return Vec::new();
    }
    let mut lines = vec![
        String::new(),
        "      if (argv.file) {".to_owned(),
        "        const fileContent = readFileForFlag(argv.file);".to_owned(),
    ];
    let primary = cts
        .iter()
        .find(|c| *c != "application/json")
        .map_or("application/octet-stream", String::as_str);
    let url = format!("`{}`", ctx.resolved_request_path);
    if primary == "multipart/form-data" {
        let field = d
            .multipart
            .as_ref()
            .and_then(|m| m.payload_field.as_deref())
            .unwrap_or("file");
        lines.push("        const formData = new FormData();".to_owned());
        lines.push(format!(
            "        formData.append('{field}', new Blob([fileContent]), {FILE_NAME});"
        ));
        send_form(ctx, &url, &mut lines);
    } else if ctx.is_raw_output {
        let content_type = format!("contentType: '{primary}'");
        lines.extend(ctx.emit_raw_tail("        ", &url, &raw_parts(ctx, &["body: fileContent", &content_type])));
    } else {
        let ct = if ctx.has_headers {
            format!("{{ 'Content-Type': '{primary}', ...{HEADERS_GUARDED} }}")
        } else {
            format!("{{ 'Content-Type': '{primary}' }}")
        };
        let request = request_api(ctx, &url, &format!("{{ body: fileContent, headers: {ct} }}"));
        lines.push(format!("        const result = {};", ctx.wrap_await(&request)));
        lines.push(ctx.format_output_call("        "));
        lines.push("        return;".to_owned());
    }
    lines.push("      }".to_owned());
    lines
}

fn batch_size(op: &OperationInfo) -> Option<u64> {
    op.max_items.filter(|&n| n > 0)
}

pub fn body_bypass_uses_request_api(ctx: &Ctx) -> bool {
    if !ctx.derived.has_body || ctx.is_raw_output {
        return false;
    }
    !(ctx.accepts_json() && batch_size(ctx.op).is_none() && sdk::can_emit_typed_json_body_call(ctx))
}

fn body_bypass(ctx: &Ctx) -> Vec<String> {
    if !ctx.derived.has_body {
        return Vec::new();
    }
    let op = ctx.op;
    let json = ctx.accepts_json();
    let raw_ct = op
        .request_content_types
        .iter()
        .find(|c| *c != "application/json")
        .map_or("application/octet-stream", String::as_str);
    let batch = batch_size(op);
    let mut lines = vec![String::new(), "      if (argv.body) {".to_owned()];
    if json {
        lines.push("        const bodyData = parseBody(argv.body);".to_owned());
    } else {
        lines.push("        // Endpoint does not accept application/json — send --body as raw bytes,".to_owned());
        lines.push("        // resolving @file references as binary file contents.".to_owned());
        lines.push("        const bodyData = resolveFileToken(argv.body, 'body', 'binary');".to_owned());
    }
    let header_opt = match (ctx.has_headers, json) {
        (true, true) => Some(HEADERS_GUARDED.to_owned()),
        (true, false) => Some(format!("{{ 'Content-Type': '{raw_ct}', ...headers }}")),
        (false, false) => Some(format!("{{ 'Content-Type': '{raw_ct}' }}")),
        (false, true) => None,
    };
    let with_headers = |body: &str| match &header_opt {
        Some(headers) => format!("{{ body: {body}, headers: {headers} }}"),
        None => format!("{{ body: {body} }}"),
    };
    let url = url_with_query(ctx, "        ", &mut lines);
    if let Some(size) = batch.filter(|_| !ctx.is_raw_output) {
        lines.push(format!(
            "        if (Array.isArray(bodyData) && bodyData.length > {size}) {{"
        ));
        lines.push(format!("          const total = Math.ceil(bodyData.length / {size});"));
        lines.push("          let result: unknown = null;".to_owned());
        lines.push(format!(
            "          for (let i = 0; i < bodyData.length; i += {size}) {{"
        ));
        lines.push(format!("            const batch = bodyData.slice(i, i + {size});"));
        lines.push(format!("            const batchNum = Math.floor(i / {size}) + 1;"));
        lines.push(format!(
            "            result = await withProgress(`{}: batch ${{batchNum}}/${{total}}`, async () => ({}));",
            escape_template(ctx.progress_label),
            request_api(ctx, &url, &with_headers("batch"))
        ));
        lines.push("          }".to_owned());
        lines.push(ctx.format_output_call("          "));
        lines.push("          return;".to_owned());
        lines.push("        }".to_owned());
    }
    if ctx.is_raw_output {
        let content_type = format!("contentType: '{raw_ct}'");
        let parts: &[&str] = if json {
            &["body: JSON.stringify(bodyData)", "contentType: 'application/json'"]
        } else {
            &["body: bodyData", &content_type]
        };
        lines.extend(ctx.emit_raw_tail("        ", &url, &raw_parts(ctx, parts)));
    } else if json && batch.is_none() && sdk::can_emit_typed_json_body_call(ctx) {
        lines.push(format!(
            "        const result = {};",
            ctx.wrap_await(&sdk::body_call(ctx))
        ));
        lines.push(ctx.format_output_call("        "));
        lines.push("        return;".to_owned());
    } else {
        let request = request_api(ctx, &url, &with_headers("bodyData"));
        lines.push(format!("        const result = {};", ctx.wrap_await(&request)));
        lines.push(ctx.format_output_call("        "));
        lines.push("        return;".to_owned());
    }
    lines.push("      }".to_owned());
    lines
}

pub fn body_prompts(ctx: &Ctx) -> Vec<String> {
    let mut lines = Vec::new();
    if ctx.derived.has_body_params {
        for arg in ctx.derived.body_options().filter(|a| a.required) {
            let desc = escape_single(&arg.description);
            let read = argv_key(&arg.name);
            let name = &arg.name;
            lines.push(format!("      if ({read} === undefined) {{"));
            match &arg.choices {
                Some(choices) if !choices.is_empty() => {
                    let list = choices
                        .iter()
                        .map(|c| format!("'{}'", escape_single(c)))
                        .collect::<Vec<_>>()
                        .join(", ");
                    lines.push(format!(
                        "        {read} = await promptForRequiredEnumField('{name}', '{desc}', [{list}] as const);"
                    ));
                }
                _ if arg.ty == ArgType::String => {
                    let opts = if arg.secret { ", { kind: 'secret' }" } else { "" };
                    lines.push(format!(
                        "        {read} = await promptForRequiredField('{name}', '{desc}'{opts});"
                    ));
                }
                _ => lines.push(format!(
                    "        throw new Error('--{name} is required (or pass --body with this field set).');"
                )),
            }
            lines.push("      }".to_owned());
        }
    }
    if !ctx.variant_prompt_block.is_empty() {
        lines.push(String::new());
        lines.extend(ctx.variant_prompt_block.iter().cloned());
    }
    lines
}

/// The non-path positionals and required options that go into the body,
/// as their argv keys and API field names.
fn body_field_args(ctx: &Ctx) -> Vec<(String, String)> {
    let mut out = Vec::new();
    for arg in ctx
        .positionals()
        .filter(|a| !a.is_path() && !a.is_zone && !a.is_worker_name)
    {
        let field = match arg.body_path() {
            Some([field]) => field.clone(),
            _ => arg.name.replace('-', "_"),
        };
        out.push((arg.name.clone(), field));
    }
    for opt in ctx.required_option_args.iter().filter(|o| !o.is_body()) {
        out.push((opt.name.clone(), opt.name.replace('-', "_")));
    }
    out
}

/// `emitBodyArgValue`.
fn body_arg_value(arg: &Arg, read: &str) -> String {
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

/// The fields of a body object, nested by their paths.
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

    fn emit(&self, indent: &str) -> Vec<String> {
        let mut lines = vec!["{".to_owned()];
        for (name, child) in &self.children {
            let key = if is_identifier(name) { name.clone() } else { quote(name) };
            if child.children.is_empty() {
                lines.push(format!(
                    "{indent}\t{key}: {},",
                    child.value.as_deref().unwrap_or("undefined")
                ));
                continue;
            }
            let nested = child.emit(&format!("{indent}\t"));
            lines.push(format!("{indent}\t{key}: {}", nested[0]));
            lines.extend(nested[1..nested.len() - 1].iter().cloned());
            lines.push(format!("{indent}\t}},"));
        }
        lines.push(format!("{indent}}}"));
        lines
    }
}

/// `emitBodyObject`.
pub fn body_object(ctx: &Ctx, indent: &str) -> Vec<String> {
    let mut root = Tree::default();
    for arg in ctx.derived.body_options() {
        if let Some(path) = arg.body_path() {
            root.add(path, body_arg_value(arg, &argv_key(&arg.name)));
        }
    }
    for (key, field) in body_field_args(ctx) {
        root.add(&[field], argv_key(&key));
    }
    root.emit(indent)
}

pub fn sdk_call_uses_request_api(ctx: &Ctx) -> bool {
    if ctx.is_raw_output {
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

fn body_assembly(ctx: &Ctx) -> Vec<String> {
    let mut lines = vec![
        String::new(),
        "      // Assemble request body from individual flags".to_owned(),
    ];
    let typed = sdk::can_emit_typed_body_call(ctx);
    if typed {
        lines.push("      const bodyData = compactBody(".to_owned());
        for line in body_object(ctx, "\t\t") {
            lines.push(format!("        {line}"));
        }
        lines.push("      );".to_owned());
    } else {
        lines.push("      const bodyData: Record<string, unknown> = {};".to_owned());
        for arg in ctx.derived.body_options() {
            let Some(path) = arg.body_path() else {
                continue;
            };
            let p = path.iter().map(|s| quote(s)).collect::<Vec<_>>().join(", ");
            let read = argv_key(&arg.name);
            let value = body_arg_value(arg, &read);
            lines.push(format!(
                "      if ({read} !== undefined) setNestedValue(bodyData, [{p}], {value});"
            ));
        }
        for (key, field) in body_field_args(ctx) {
            let read = argv_key(&key);
            lines.push(format!(
                "      if ({read} !== undefined) bodyData[{}] = {read};",
                quote(&field)
            ));
        }
    }
    let url = url_with_query(ctx, "      ", &mut lines);
    if ctx.is_raw_output {
        let parts = raw_parts(ctx, &["body: Object.keys(bodyData).length > 0 ? bodyData : undefined"]);
        lines.extend(ctx.emit_raw_tail("      ", &url, &parts));
    } else if typed {
        lines.push(format!(
            "      const result = {};",
            ctx.wrap_await(&sdk::body_call(ctx))
        ));
        lines.push(ctx.format_output_call("      "));
    } else {
        // Like a typed call, which sends a body that needs none of its
        // fields empty, rather than leaving it out.
        let request = request_api(ctx, &url, &body_opts(ctx, "bodyData"));
        lines.push(format!("      const result = {};", ctx.wrap_await(&request)));
        lines.push(ctx.format_output_call("      "));
    }
    lines
}

fn plain_call(ctx: &Ctx) -> Vec<String> {
    let d = &ctx.derived;
    let mut lines = vec![String::new()];
    let typed = sdk::can_emit_typed_call(ctx);
    let unsatisfiable = body_unsatisfiable(ctx, typed);
    if unsatisfiable {
        lines.push("      if (argv.body === undefined) {".to_owned());
        lines.push(
            "        throw new Error('--body is required for this command. Pass --body \\'<json>\\' or --body @path/to/file.json.');"
                .to_owned(),
        );
        lines.push("      }".to_owned());
    }
    if ctx.is_raw_output {
        let url = url_with_query(ctx, "      ", &mut lines);
        lines.extend(ctx.emit_raw_tail("      ", &url, &[]));
    } else if !unsatisfiable {
        let url = format!("`{}`", ctx.resolved_request_path);
        let request = if ctx.has_headers {
            let mut opts = Vec::new();
            if d.has_body {
                let fields: Vec<String> = body_field_args(ctx)
                    .iter()
                    .map(|(key, field)| format!("'{field}': {}", argv_key(key)))
                    .collect();
                if !fields.is_empty() {
                    opts.push(format!("body: {{ {} }}", fields.join(", ")));
                }
            }
            if ctx.has_params {
                opts.push("query: queryParams".to_owned());
            }
            opts.push(format!("headers: {HEADERS_GUARDED}"));
            request_api(ctx, &url, &format!("{{ {} }}", opts.join(", ")))
        } else if typed {
            sdk::typed_call(ctx)
        } else {
            request_api(ctx, &url, if ctx.has_params { "{ query: queryParams }" } else { "" })
        };
        lines.push(format!("      const result = {};", ctx.wrap_await(&request)));
        lines.push(ctx.format_output_call("      "));
    }
    lines
}

/// `computeVariantPromptBlock`.
pub fn variant_prompt_block(op: &OperationInfo, body_fields: &[&Arg]) -> (Vec<String>, bool) {
    let Some(disc) = &op.body_discriminator else {
        return (Vec::new(), false);
    };
    let mut api_to_flag: Vec<(String, String)> = Vec::new();
    let mut available: Vec<String> = Vec::new();
    let mut descriptions: Vec<(String, String)> = Vec::new();
    for a in body_fields {
        let Some(path) = a.body_path().filter(|p| !p.is_empty()) else {
            continue;
        };
        let head = &path[0];
        push_unique(&mut available, head.clone());
        if path.len() != 1 {
            continue;
        }
        set_entry(&mut api_to_flag, head, a.name.clone());
        if !a.description.is_empty() {
            set_entry(&mut descriptions, &a.name, a.description.clone());
        }
    }
    let flag_of = |f: &str| get_entry(&api_to_flag, f).cloned();
    let by_kebab = |f: &str| body_fields.iter().rev().find(|a| a.name == f);
    let Some(disc_flag) = flag_of(&disc.field) else {
        return (Vec::new(), false);
    };
    let disc_read = argv_key(&disc_flag);
    let mut block = Vec::new();
    let mut needs_text = false;
    for (value, fields) in &disc.variants {
        let value_esc = escape_single(value);
        let unavailable: Vec<&str> = fields
            .iter()
            .filter(|f| !available.contains(f))
            .map(String::as_str)
            .collect();
        if !unavailable.is_empty() {
            let list = unavailable.join(", ");
            block.push(format!("      if ({disc_read} === '{value_esc}') {{"));
            block.push(format!(
                "        throw new Error('The {value_esc} variant requires {}, which cannot be supplied as flags. Pass --body with a complete request body.');",
                escape_single(&list)
            ));
            block.push("      }".to_owned());
            continue;
        }
        for flag in fields.iter().filter_map(|f| flag_of(f)).filter(|f| !f.is_empty()) {
            let read = argv_key(&flag);
            let arg = by_kebab(&flag);
            let desc = get_entry(&descriptions, &flag)
                .cloned()
                .unwrap_or_else(|| format!("value for --{flag}"));
            block.push(format!(
                "      if ({disc_read} === '{value_esc}' && {read} === undefined) {{"
            ));
            let Some(arg) = arg.filter(|a| matches!(a.ty, ArgType::String | ArgType::Enum)) else {
                block.push(format!(
                    "        throw new Error('--{flag} is required (or pass --body with this field set).');"
                ));
                block.push("      }".to_owned());
                continue;
            };
            needs_text = true;
            let opts = if arg.secret {
                format!("{{ kind: 'secret', question: 'Enter value for --{flag}' }}")
            } else {
                format!("{{ question: 'Enter value for --{flag}' }}")
            };
            block.push(format!(
                "        {read} = await promptForRequiredField('{flag}', '{}', {opts});",
                escape_single(&desc)
            ));
            block.push("      }".to_owned());
        }
    }
    (block, needs_text)
}

/// The imports of a command, in the order cf rendered them.
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

    pub fn render(&self) -> Vec<String> {
        let sorted = |names: &[String]| {
            let mut names = names.to_vec();
            names.sort_by(|a, b| code_unit_compare(a, b));
            names.join(", ")
        };
        let typed = self.typed.iter().filter(|(_, n)| !n.is_empty());
        let named = self.named.iter().filter(|(_, n)| !n.is_empty());
        typed
            .map(|(path, names)| format!("import type {{ {} }} from '{path}';", sorted(names)))
            .chain(named.map(|(path, names)| format!("import {{ {} }} from '{path}';", sorted(names))))
            .chain(
                self.defaults
                    .iter()
                    .map(|(name, path)| format!("import {name} from '{path}';")),
            )
            .collect()
    }
}

/// `buildImportSet`.
pub fn imports(ctx: &Ctx) -> Imports {
    let d = &ctx.derived;
    let mut i = Imports::default();
    i.type_from("yargs", &["Argv", "CommandModule"]);
    i.type_from("#lib/cli-types.js", &["CommonYargsOptions", "InferArgs"]);
    let mut auth = vec!["createCommandClient"];
    if ctx.needs_account_id {
        auth.extend(["getAccountId", "resolveAccountIdSilent"]);
    }
    if ctx.needs_zone_id {
        auth.push("getZoneId");
    }
    if ctx.needs_worker_name {
        auth.push("getWorkerName");
    }
    if body_bypass_uses_request_api(ctx) || sdk_call_uses_request_api(ctx) {
        auth.push("requestApi");
    }
    i.from("#lib/auth.js", &auth);
    if ctx.needs_account_id {
        i.from("#lib/local.js", &["LOCAL_ACCOUNT_ID"]);
    }
    i.from("#lib/output.js", &["formatOutput"]);
    i.from("#lib/dry-run.js", &["formatDryRun"]);
    i.from("#lib/progress.js", &["withProgress"]);
    i.from("#lib/telemetry/index.js", &["runWithTelemetry"]);
    i.type_from("#lib/telemetry/index.js", &["ArgClassification"]);
    if matches!(ctx.output_kind, OutputKind::Binary | OutputKind::Text) {
        i.from("#lib/raw-fetch.js", &["fetchRawBytes", "writeRawOutput"]);
    }
    let body_flags: Vec<&Arg> = d.body_options().collect();
    let needs_token = body_flags.iter().any(|a| a.from_file.is_some())
        || !d.multipart_flag_fields.is_empty()
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
        if body_flags.iter().any(|a| a.ty == ArgType::ObjectArray) {
            names.push("parseObjectArray");
        }
        if d.has_body_params && !sdk::can_emit_typed_body_call(ctx) {
            names.push("setNestedValue");
        }
        i.from("#lib/body-parser.js", &names);
    }
    let mut text = ctx.variant_prompt_needs_text;
    let mut enumerated = false;
    for a in body_flags.iter().filter(|a| a.required) {
        if a.has_choices() {
            enumerated = true;
        } else if a.ty == ArgType::String {
            text = true;
        }
    }
    if text || enumerated || ctx.is_delete {
        let mut names = Vec::new();
        if text {
            names.push("promptForRequiredField");
        }
        if enumerated {
            names.push("promptForRequiredEnumField");
        }
        if ctx.is_delete {
            names.push("confirmDelete");
        }
        i.from("#lib/prompt.js", &names);
    }
    if sdk::makes_typed_call(ctx) {
        i.default_from(sdk::operation_module(ctx), "operation");
    }
    i
}
