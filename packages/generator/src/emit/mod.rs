//! Emits a command's module: its yargs builder and its handler, with the
//! templates cf's commands have always been written with. A command sends
//! its request through the runtime library: with a typed
//! `client.send(operation, request)` where it can, or else a passthrough
//! `requestApi` call.

pub mod builder;
pub mod handler;
pub mod sdk;

use crate::args::{
    ACCOUNT_PATH_PARAMS, Arg, CLI_ONLY_OPTIONS, Derived, ZONE_PATH_PARAMS, account_or_zone_local, derive_downgraded,
    has_account_or_zone_scope, path_param_read_key,
};
use crate::commands::Method;
use crate::js::{kebab, quote, replace_params, template_params};
use crate::operation::OperationInfo;

/// How a command's response is read.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum OutputKind {
    Json,
    Binary,
    Text,
    Websocket,
}

/// Everything the emitters of one command read.
pub struct Ctx<'a> {
    pub method: &'a Method,
    pub op: &'a OperationInfo,
    pub output_kind: OutputKind,
    pub resource: &'a str,
    pub group: Option<&'a str>,
    pub derived: Derived,
    pub all_path_param_names: Vec<String>,
    pub needs_account_id: bool,
    pub needs_zone_id: bool,
    pub has_account_or_zone_scope: bool,
    pub needs_worker_name: bool,
    pub first_positional_is_zone: bool,
    pub first_positional_is_worker_name: bool,
    pub is_delete: bool,
    pub variant_prompt_block: Vec<String>,
    pub variant_prompt_needs_text: bool,
    pub required_option_args: Vec<Arg>,
    pub resolved_request_path: String,
    pub has_params: bool,
    pub has_headers: bool,
    pub is_raw_output: bool,
    pub progress_label: &'static str,
    pub success_label: &'static str,
    /// The generated root, relative to the command's module: `./` or
    /// `../…`.
    pub root: String,
}

impl Ctx<'_> {
    pub fn format_output_call(&self, indent: &str) -> String {
        format!(
            "{indent}formatOutput(result, {{ successLabel: `{}` }});",
            escape_template(self.success_label)
        )
    }

    pub fn wrap_await(&self, expr: &str) -> String {
        format!(
            "await withProgress(`{}`, async () => ({expr}))",
            escape_template(self.progress_label)
        )
    }

    pub fn emit_raw_tail(&self, indent: &str, url: &str, body_parts: &[String]) -> Vec<String> {
        let mut parts = vec![
            format!("method: '{}'", self.op.method.to_uppercase()),
            "local: argv.local === true".to_owned(),
            "persistTo: argv.persistTo as string | undefined".to_owned(),
        ];
        parts.extend(body_parts.iter().cloned());
        let mut lines = vec![format!(
            "{indent}const __cfRawBytes = await withProgress(`{}`, async () => fetchRawBytes({url}, {{ {} }}));",
            escape_template(self.progress_label),
            parts.join(", ")
        )];
        if self.output_kind == OutputKind::Text {
            lines.push(format!("{indent}writeRawOutput(__cfRawBytes.toString('utf-8'));"));
        } else {
            lines.push(format!(
                "{indent}writeRawOutput(argv.text === true ? __cfRawBytes.toString('utf-8') : __cfRawBytes);"
            ));
        }
        lines.push(format!("{indent}return;"));
        lines
    }

    pub fn positionals(&self) -> impl Iterator<Item = &Arg> {
        self.derived.positionals()
    }

    pub fn accepts_json(&self) -> bool {
        self.op.request_content_types.iter().any(|c| c == "application/json")
    }
}

/// `escapeForSingleQuote`.
pub fn escape_single(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        match c {
            '\\' => out.push_str("\\\\"),
            '\'' => out.push_str("\\'"),
            '`' => out.push_str("\\`"),
            '$' if chars.peek() == Some(&'{') => {
                chars.next();
                out.push_str("\\${");
            }
            '\r' | '\n' | '\u{2028}' | '\u{2029}' => out.push(' '),
            c => out.push(c),
        }
    }
    out
}

/// `escapeForTemplateLiteral`.
pub fn escape_template(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        if matches!(c, '`' | '$' | '\\') {
            out.push('\\');
        }
        out.push(c);
    }
    out
}

/// `argvKey`: `argv["kebab-name"]`.
pub fn argv_key(name: &str) -> String {
    format!("argv[{}]", quote(&kebab(name)))
}

/// `argLocalIdent`.
pub fn arg_local_ident(name: &str) -> String {
    kebab(name).replace('-', "_")
}

const BINARY: &[&str] = &[
    "application/octet-stream",
    "application/vnd.google.protobuf",
    "application/zip",
    "application/pdf",
    "application/vnd.tcpdump.pcap",
    "multipart/form-data",
];
const TEXT: &[&str] = &["text/plain", "text/csv", "text/html", "text/vtt"];

/// `deriveOutputKind`.
pub fn output_kind(op: &OperationInfo) -> Result<OutputKind, String> {
    let mut success = ["200", "201", "202", "204"].iter().find_map(|s| op.response(s));
    if success.is_none() && op.response("101").is_some() {
        return Ok(OutputKind::Websocket);
    }
    if let Some(range) = op.response("2XX") {
        success = Some(range);
    }
    let Some(success) = success else {
        let found: Vec<&str> = op.responses.iter().map(|(s, _)| s.as_str()).collect();
        return Err(format!(
            "No \"success\" responses found for:\n  {}:{}\n Found: {}",
            op.method,
            op.path,
            found.join(",")
        ));
    };
    if success
        .content
        .iter()
        .any(|c| BINARY.contains(&c.as_str()) || c.starts_with("image/"))
    {
        return Ok(OutputKind::Binary);
    }
    if success.content.iter().any(|c| TEXT.contains(&c.as_str())) {
        return Ok(OutputKind::Text);
    }
    Ok(OutputKind::Json)
}

/// The context needed to substitute a path template's placeholders.
pub struct PathTemplate<'a> {
    pub needs_worker_name: bool,
    pub args: &'a [Arg],
    pub positional: &'a [&'a Arg],
    pub first_positional_is_zone: bool,
    pub account_id: &'a str,
    pub script_name: &'a str,
    pub zone: &'a str,
    pub param: &'a dyn Fn(&str) -> String,
}

/// `substitutePathTemplate`.
pub fn substitute_path(path: &str, ctx: &PathTemplate) -> String {
    replace_params(path, |name| {
        if let Some(local) = account_or_zone_local(path, name) {
            return format!("${{{local}}}");
        }
        if ACCOUNT_PATH_PARAMS.contains(&name) {
            return ctx.account_id.to_owned();
        }
        if ctx.needs_worker_name && (name == "script_name" || name == "scriptName") {
            return ctx.script_name.to_owned();
        }
        if ZONE_PATH_PARAMS.contains(&name) {
            if ctx.first_positional_is_zone {
                let key = kebab(name);
                let found = ctx.positional.iter().position(|a| kebab(&a.name) == key);
                if found == Some(0) && ctx.positional[0].is_zone {
                    return format!("${{{}}}", arg_local_ident(name));
                }
            }
            return ctx.zone.to_owned();
        }
        (ctx.param)(&path_param_read_key(ctx.args, name))
    })
}

const READ_SHAPED: &[&str] = &["query", "raw", "read", "search", "bulk-get", "export", "preview"];

/// `buildLabels`.
fn labels(http_method: &str, method: &str) -> (&'static str, &'static str) {
    if READ_SHAPED.contains(&method) {
        return ("Loading", "Loaded");
    }
    match http_method {
        "POST" => ("Creating", "Created"),
        "PUT" | "PATCH" => ("Updating", "Updated"),
        "DELETE" => ("Deleting", "Deleted"),
        "GET" | "HEAD" => ("Loading", "Loaded"),
        _ => ("Processing", "Done"),
    }
}

/// `buildEmitContext`: the context, and the command string yargs
/// registers.
pub fn context<'a>(
    method: &'a Method,
    resource: &'a str,
    group: Option<&'a str>,
    op: &'a OperationInfo,
    root: String,
) -> Result<(Ctx<'a>, String), String> {
    let output_kind = output_kind(op)?;
    let workers = resource == "workers";
    let path = op.path.as_str();
    let combined = has_account_or_zone_scope(path);
    let path_needs_account =
        path.contains("{account_id}") || path.contains("{account_identifier}") || path.contains("{accountId}");
    let sdk_needs_account = op.path_params.iter().any(|p| p.name == "account_id");
    let needs_account_id = path_needs_account || sdk_needs_account || combined;
    let derived = derive_downgraded(method, resource, op)?;

    let path_needs_zone = path.contains("{zone_id}") || path.contains("{zone_identifier}") || path.contains("{zoneId}");
    let positional: Vec<&Arg> = derived.positionals().collect();
    let first_positional_is_zone = positional.first().is_some_and(|a| a.is_zone);
    let needs_zone_id = first_positional_is_zone || path_needs_zone || combined;
    let path_needs_worker = workers && (path.contains("{script_name}") || path.contains("{scriptName}"));
    let first_positional_is_worker_name = positional.first().is_some_and(|a| a.is_worker_name);
    let needs_worker_name = first_positional_is_worker_name || path_needs_worker;

    let body_fields: Vec<&Arg> = derived.args.iter().filter(|a| a.is_body()).collect();
    let (variant_prompt_block, variant_prompt_needs_text) = handler::variant_prompt_block(op, &body_fields);

    let requires_confirmation = method.require_confirmation.is_some();
    let is_delete = op.method.to_uppercase() == "DELETE" || requires_confirmation;

    let positional_str = positional
        .iter()
        .map(|a| {
            let name = if a.ty == crate::args::ArgType::Array {
                format!("{}...", a.name)
            } else {
                a.name.clone()
            };
            if a.is_zone || a.is_worker_name {
                format!("[{name}]")
            } else {
                format!("<{name}>")
            }
        })
        .collect::<Vec<_>>()
        .join(" ");
    let command = if positional_str.is_empty() {
        method.name.clone()
    } else {
        format!("{} {positional_str}", method.name)
    };

    let label_method = if requires_confirmation {
        "DELETE".to_owned()
    } else {
        op.method.to_uppercase()
    };
    let (progress_label, success_label) = labels(&label_method, &method.name);

    let mut all_path_param_names = Vec::new();
    for name in op
        .path_params
        .iter()
        .map(|p| p.name.clone())
        .chain(template_params(path))
    {
        crate::js::push_unique(&mut all_path_param_names, name);
    }
    let required_option_args = derived
        .options()
        .filter(|o| {
            o.required
                && !CLI_ONLY_OPTIONS.contains(&o.name.as_str())
                && !o.is_query()
                && !o.is_path()
                && !o.is_worker_name
        })
        .cloned()
        .collect();
    let has_params = derived.query_args().next().is_some();
    let has_headers = derived.header_args().next().is_some();
    let param = |name: &str| format!("${{encodeURIComponent(String(argv[{}]))}}", quote(name));
    let resolved_request_path = substitute_path(
        path,
        &PathTemplate {
            needs_worker_name,
            args: &derived.args,
            positional: &positional,
            first_positional_is_zone,
            account_id: "${accountId}",
            script_name: "${scriptName}",
            zone: "${argv.zoneId}",
            param: &param,
        },
    );
    drop(positional);
    let ctx = Ctx {
        method,
        op,
        output_kind,
        resource,
        group,
        derived,
        all_path_param_names,
        needs_account_id,
        needs_zone_id,
        has_account_or_zone_scope: combined,
        needs_worker_name,
        first_positional_is_zone,
        first_positional_is_worker_name,
        is_delete,
        variant_prompt_block,
        variant_prompt_needs_text,
        required_option_args,
        resolved_request_path,
        has_params,
        has_headers,
        is_raw_output: matches!(output_kind, OutputKind::Binary | OutputKind::Text),
        progress_label,
        success_label,
        root,
    };
    Ok((ctx, command))
}

#[cfg(test)]
mod tests;
