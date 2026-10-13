//! Emits a command's module: its yargs builder and its handler, with the
//! templates cf's commands have always been written with. A command sends
//! its request through the runtime library: with a typed
//! `client.send(operation, request)` where it can, or else a passthrough
//! `requestApi` call.

pub mod builder;
pub mod handler;
pub mod sdk;

use std::fmt::{self, Write};

use forge::HttpMethod;

use crate::args::{
    ACCOUNT_PATH_PARAMS, Arg, CLI_ONLY_OPTIONS, Derived, ZONE_PATH_PARAMS, account_or_zone_local, derive_downgraded,
    has_account_or_zone_scope, path_param_read_key,
};
use crate::commands::Method;
use crate::js::{dedup, kebab, quote, replace_params, template_params};
use crate::operation::OperationInfo;

/// How a command's response is read.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum OutputKind {
    Json,
    Binary,
    Text,
    Websocket,
}

/// The IDs a command's request is sent with.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Scope {
    /// The account's, or the zone's that `--zone` names: the path is under
    /// `{accountOrZone}/{accountOrZoneId}`.
    AccountOrZone,
    /// The account's, the zone's, both or neither.
    Ids { account: bool, zone: bool },
}

impl Scope {
    pub fn needs_account(self) -> bool {
        matches!(self, Scope::AccountOrZone | Scope::Ids { account: true, .. })
    }

    pub fn needs_zone(self) -> bool {
        matches!(self, Scope::AccountOrZone | Scope::Ids { zone: true, .. })
    }
}

/// Everything the emitters of one command read.
pub struct Ctx<'a> {
    pub method: &'a Method,
    pub op: &'a OperationInfo,
    pub output_kind: OutputKind,
    pub resource: &'a str,
    pub group: Option<&'a str>,
    pub derived: Derived,
    pub scope: Scope,
    /// Whether the command resolves a Worker's name, which its path has.
    pub needs_worker_name: bool,
    /// The request's path, as the contents of a template literal.
    pub request_path: String,
    pub progress_label: &'static str,
    pub success_label: &'static str,
    /// The generated root, relative to the command's module: `./` or
    /// `../…`.
    pub root: String,
}

impl Ctx<'_> {
    /// Whether the command confirms before it sends its request.
    pub fn is_delete(&self) -> bool {
        self.op.method == HttpMethod::Delete || self.method.require_confirmation.is_some()
    }

    /// Whether the response is written as it is, rather than as JSON.
    pub fn is_raw_output(&self) -> bool {
        matches!(self.output_kind, OutputKind::Binary | OutputKind::Text)
    }

    pub fn has_query(&self) -> bool {
        self.derived.query_args().next().is_some()
    }

    pub fn has_headers(&self) -> bool {
        self.derived.header_args().next().is_some()
    }

    pub fn first_positional_is_zone(&self) -> bool {
        self.positionals().next().is_some_and(|a| a.is_zone)
    }

    pub fn first_positional_is_worker_name(&self) -> bool {
        self.positionals().next().is_some_and(|a| a.is_worker_name)
    }

    /// The required options other than the CLI's own, the query and path
    /// parameters, and the Worker's name.
    pub fn required_options(&self) -> impl Iterator<Item = &Arg> {
        self.derived.options().filter(|o| {
            o.required
                && !CLI_ONLY_OPTIONS.contains(&o.name.as_str())
                && !o.is_query()
                && !o.is_path()
                && !o.is_worker_name
        })
    }

    /// The names of the path parameters, and of the path's placeholders.
    pub fn path_param_names(&self) -> Vec<String> {
        let names = self.op.path_params.iter().map(|p| p.name.clone());
        dedup(names.chain(template_params(&self.op.path)))
    }

    /// `request` awaited with the command's progress label.
    pub fn wrap_await(&self, request: &str) -> String {
        format!(
            "await withProgress(`{}`, async () => ({request}))",
            escape_template(self.progress_label)
        )
    }

    /// The statement that prints `result` with the command's success label.
    pub fn format_output(&self) -> String {
        format!(
            "formatOutput(result, {{ successLabel: `{}` }});",
            escape_template(self.success_label)
        )
    }

    /// Sends `request`, and prints its result.
    pub fn send(&self, out: &mut String, request: &str) -> fmt::Result {
        writeln!(out, "const result = {};", self.wrap_await(request))?;
        writeln!(out, "{}", self.format_output())
    }

    /// Fetches `url` with the request's `parts` and writes the response's
    /// bytes, then returns.
    pub fn send_raw(&self, out: &mut String, url: &str, parts: &[String]) -> fmt::Result {
        let method = format!("method: '{}'", self.op.method.as_str());
        let parts: Vec<&str> = [
            method.as_str(),
            "local: argv.local === true",
            "persistTo: argv.persistTo as string | undefined",
        ]
        .into_iter()
        .chain(parts.iter().map(String::as_str))
        .collect();
        writeln!(
            out,
            "const __cfRawBytes = await withProgress(`{}`, async () => fetchRawBytes({url}, {{ {} }}));",
            escape_template(self.progress_label),
            parts.join(", ")
        )?;
        if self.output_kind == OutputKind::Text {
            writeln!(out, "writeRawOutput(__cfRawBytes.toString('utf-8'));")?;
        } else {
            writeln!(
                out,
                "writeRawOutput(argv.text === true ? __cfRawBytes.toString('utf-8') : __cfRawBytes);"
            )?;
        }
        writeln!(out, "return;")
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
            op.method.as_str().to_lowercase(),
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

/// The progress and success labels of a command named `method` that sends
/// `http_method`.
fn labels(http_method: &HttpMethod, method: &str) -> (&'static str, &'static str) {
    if READ_SHAPED.contains(&method) {
        return ("Loading", "Loaded");
    }
    match http_method {
        HttpMethod::Post => ("Creating", "Created"),
        HttpMethod::Put | HttpMethod::Patch => ("Updating", "Updated"),
        HttpMethod::Delete => ("Deleting", "Deleted"),
        HttpMethod::Get | HttpMethod::Head => ("Loading", "Loaded"),
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
    let derived = derive_downgraded(method, resource, op)?;
    let positional: Vec<&Arg> = derived.positionals().collect();
    let first_positional_is_zone = positional.first().is_some_and(|a| a.is_zone);
    let scope = if has_account_or_zone_scope(path) {
        Scope::AccountOrZone
    } else {
        let has = |names: [&str; 3]| names.iter().any(|name| path.contains(&format!("{{{name}}}")));
        Scope::Ids {
            account: has(["account_id", "account_identifier", "accountId"])
                || op.path_params.iter().any(|p| p.name == "account_id"),
            zone: first_positional_is_zone || has(["zone_id", "zone_identifier", "zoneId"]),
        }
    };
    let path_needs_worker = workers && (path.contains("{script_name}") || path.contains("{scriptName}"));
    let needs_worker_name = positional.first().is_some_and(|a| a.is_worker_name) || path_needs_worker;
    let requires_confirmation = method.require_confirmation.is_some();

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
        &HttpMethod::Delete
    } else {
        &op.method
    };
    let (progress_label, success_label) = labels(label_method, &method.name);

    let param = |name: &str| format!("${{encodeURIComponent(String(argv[{}]))}}", quote(name));
    let request_path = substitute_path(
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
        scope,
        needs_worker_name,
        request_path,
        progress_label,
        success_label,
        root,
    };
    Ok((ctx, command))
}

#[cfg(test)]
mod tests;
