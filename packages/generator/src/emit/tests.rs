use super::builder::builder_lines;
use super::handler::{body_object, body_prompts, dry_run, handler, variant_prompt_block};
use super::{OutputKind, output_kind};
use crate::args::{Arg, ArgType, Origin};
use crate::commands::Method;
use crate::operation::{BodyDiscriminator, BodyParamInfo, OperationInfo, ParameterInfo, ResponseInfo, Wire};
use crate::test_support::{arg, body_param, context, find, json_body, method, operation, param, strings};

fn responding(content_type: &str, op: OperationInfo) -> OperationInfo {
    OperationInfo {
        responses: vec![(
            "200".to_owned(),
            ResponseInfo {
                content: strings(&[content_type]),
            },
        )],
        ..op
    }
}

#[test]
fn classifies_responses_by_content_type() {
    for (content_type, kind) in [
        ("application/vnd.google.protobuf", OutputKind::Binary),
        ("application/octet-stream", OutputKind::Binary),
        ("application/zip", OutputKind::Binary),
        ("image/png", OutputKind::Binary),
        ("text/plain", OutputKind::Text),
        ("text/csv", OutputKind::Text),
        ("application/json", OutputKind::Json),
        ("application/geo+json", OutputKind::Json),
    ] {
        assert_eq!(
            output_kind(&responding(content_type, operation("get", "/"))),
            Ok(kind),
            "{content_type}"
        );
    }
}

#[test]
fn previews_the_file_selected_by_the_live_handler_before_a_json_body() {
    let op = OperationInfo {
        has_request_body: true,
        request_content_types: strings(&["application/json", "application/merge-patch+json"]),
        ..operation("patch", "/uploads")
    };
    let m = method("upload", "uploads-upload");
    let ctx = context(&m, "uploads", &op);
    let d = &ctx.derived;
    assert!(d.args.is_empty());
    assert_eq!(
        [d.is_mutating, d.has_body, d.has_body_params, d.has_file_upload],
        [true, true, false, true]
    );
    let output = dry_run(&ctx).join("\n");
    assert!(
        output.contains("bodyKind: argv.file !== undefined ? 'octet-stream' : 'json'"),
        "{output}"
    );
    assert!(
        output.contains(
            "body: argv.file !== undefined\n            ? { file: argv.file }\n            : argv.body !== undefined\n            ? parseBody(argv.body)"
        ),
        "{output}"
    );
}

#[test]
fn writes_profile_bytes_directly_while_sending_the_json_request_body() {
    let op = OperationInfo {
        path_params: vec![
            param("account_id", None),
            param("worker_id", None),
            param("version_id", None),
        ],
        body_params: vec![BodyParamInfo {
            required: true,
            ..body_param("duration_ms", "number", &["duration_ms"])
        }],
        request_body_required: strings(&["duration_ms"]),
        ..responding(
            "application/vnd.google.protobuf",
            json_body(operation(
                "post",
                "/accounts/{account_id}/workers/workers/{worker_id}/versions/{version_id}/profile",
            )),
        )
    };
    let m = method("profile", "workers.versions.profile");
    let ctx = context(&m, "workers", &op);
    assert_eq!(ctx.output_kind, OutputKind::Binary);
    let output = handler(&ctx).join("\n");
    for expected in [
        "fetchRawBytes(",
        "method: 'POST'",
        "body: JSON.stringify(bodyData)",
        "body: Object.keys(bodyData).length > 0 ? bodyData : undefined",
        "contentType: 'application/json'",
        "writeRawOutput(argv.text === true ? __cfRawBytes.toString('utf-8') : __cfRawBytes)",
    ] {
        assert!(output.contains(expected), "{expected} in {output}");
    }
    assert!(!output.contains("formatOutput("));
}

fn body_arg(name: &str, ty: ArgType) -> Arg {
    arg(name, ty, Origin::Body(vec![name.replace('-', "_")]))
}

fn discriminated(variants: &[(&str, &[&str])]) -> OperationInfo {
    let variants = variants
        .iter()
        .map(|&(value, required)| (value.to_owned(), strings(required)))
        .collect();
    OperationInfo {
        body_discriminator: Some(BodyDiscriminator {
            field: "kind".to_owned(),
            variants,
        }),
        ..operation("post", "/")
    }
}

fn block(op: &OperationInfo, args: &[Arg]) -> (String, bool) {
    let args: Vec<&Arg> = args.iter().collect();
    let (lines, needs_text) = variant_prompt_block(op, &args);
    (lines.join("\n"), needs_text)
}

#[test]
fn prompts_for_missing_string_variant_fields() {
    let (lines, needs_text) = block(
        &discriminated(&[("report", &["reason"])]),
        &[body_arg("kind", ArgType::String), body_arg("reason", ArgType::String)],
    );
    assert!(needs_text);
    assert!(
        lines.contains(r#"argv["reason"] = await promptForRequiredField('reason'"#),
        "{lines}"
    );
}

#[test]
fn recognizes_a_positional_discriminator() {
    let kind = Arg {
        positional: true,
        ..body_arg("kind", ArgType::String)
    };
    let (lines, needs_text) = block(
        &discriminated(&[("report", &["reason"])]),
        &[kind, body_arg("reason", ArgType::String)],
    );
    assert!(needs_text);
    assert!(
        lines.contains(r#"if (argv["kind"] === 'report' && argv["reason"] === undefined)"#),
        "{lines}"
    );
}

#[test]
fn requires_missing_non_string_variant_fields_without_prompting() {
    for ty in [ArgType::Number, ArgType::Boolean, ArgType::Array] {
        let (lines, needs_text) = block(
            &discriminated(&[("report", &["value"])]),
            &[body_arg("kind", ArgType::String), body_arg("value", ty)],
        );
        assert!(!needs_text);
        assert!(
            lines.contains("throw new Error('--value is required (or pass --body with this field set).');"),
            "{lines}"
        );
        assert!(!lines.contains("promptForRequiredField"));
    }
}

#[test]
fn requires_body_when_a_variant_has_an_unexposed_required_field() {
    let (lines, needs_text) = block(
        &discriminated(&[("key", &["algorithm", "format"])]),
        &[body_arg("kind", ArgType::String), body_arg("format", ArgType::Enum)],
    );
    assert!(!needs_text);
    assert!(
        lines.contains("The key variant requires algorithm, which cannot be supplied as flags. Pass --body"),
        "{lines}"
    );
    assert!(!lines.contains("promptForRequiredField"));
}

#[test]
fn resolves_enum_file_tokens_before_choices_validation_without_reading_twice() {
    let op = OperationInfo {
        query_params: vec![ParameterInfo {
            enum_values: Some(strings(&["asc", "desc"])),
            ..param("sort", None)
        }],
        body_params: vec![
            BodyParamInfo {
                enum_values: Some(strings(&["first", "second"])),
                ..body_param("selection", "string", &["selection"])
            },
            body_param("description", "string", &["description"]),
        ],
        ..json_body(operation("post", "/example"))
    };
    let m = method("create", "example-create");
    let ctx = context(&m, "example", &op);
    let builder = builder_lines(&ctx).join("\n");
    let body = body_object(&ctx, "").join("\n");

    assert!(builder.contains(r#""choices":["first","second"]"#), "{builder}");
    assert!(
        builder.contains(r#".coerce("selection", (value) => resolveFileToken(value, "selection", "text"))"#),
        "{builder}"
    );
    assert!(!builder.contains(r#".coerce("sort""#));
    assert!(!builder.contains(r#".coerce("description""#));
    assert!(body.contains(r#"selection: argv["selection"]"#), "{body}");
    assert!(body.contains(r#"resolveFileToken(argv["description"]"#), "{body}");
}

#[test]
fn sends_an_assembled_body_even_when_no_flag_set_a_field() {
    // A renamed path parameter keeps the command off the typed call.
    let op = OperationInfo {
        path_params: vec![param("account_id", None), param("id", Some("instance-id"))],
        body_params: vec![body_param("description", "string", &["description"])],
        ..json_body(operation("post", "/accounts/{account_id}/things/{id}/jobs"))
    };
    let m = method("create", "example-create");
    let output = handler(&context(&m, "example", &op)).join("\n");
    assert!(output.contains("requestApi<unknown>("), "{output}");
    assert!(output.contains("{ body: bodyData }"), "{output}");
    assert!(!output.contains("Object.keys(bodyData).length > 0"));
}

fn object_array_create(tags: bool) -> OperationInfo {
    let versions = BodyParamInfo {
        item_type: Some("object"),
        required: true,
        ..body_param("versions", "array", &["versions"])
    };
    let tags = tags.then(|| BodyParamInfo {
        item_type: Some("string"),
        ..body_param("tags", "array", &["tags"])
    });
    OperationInfo {
        body_params: [versions].into_iter().chain(tags).collect(),
        ..json_body(operation("post", "/tests"))
    }
}

#[test]
fn emits_one_string_flag_while_scalar_arrays_remain_repeatable() {
    let op = object_array_create(true);
    let m = method("create", "tests-create");
    let ctx = context(&m, "tests", &op);
    assert_eq!(find(&ctx.derived.args, "versions").ty, ArgType::ObjectArray);
    assert_eq!(find(&ctx.derived.args, "tags").ty, ArgType::Array);
    let lines = builder_lines(&ctx);
    let option = |name: &str| {
        let prefix = format!(".option('{name}'");
        lines
            .iter()
            .find(|l| l.starts_with(&prefix))
            .unwrap_or_else(|| panic!("no --{name} in {lines:?}"))
            .clone()
    };
    assert!(option("versions").contains(r#""type":"string""#));
    assert!(!option("versions").contains(r#""array":true"#));
    assert!(!option("versions").contains(r#""demandOption":true"#));
    assert!(option("tags").contains(r#""type":"string""#));
    assert!(option("tags").contains(r#""array":true"#));
}

#[test]
fn parses_the_complete_json_value_when_assembling_the_body() {
    let op = object_array_create(false);
    let m = method("create", "tests-create");
    let body = body_object(&context(&m, "tests", &op), "").join("\n");
    assert!(
        body.contains(r#"versions: parseObjectArray(argv["versions"], "versions")"#),
        "{body}"
    );
}

#[test]
fn requires_the_json_flag_after_the_body_bypass() {
    let op = object_array_create(false);
    let m = method("create", "tests-create");
    let ctx = context(&m, "tests", &op);
    assert!(ctx.variant_prompt_block.is_empty());
    let prompts = body_prompts(&ctx).join("\n");
    assert!(
        prompts.contains("throw new Error('--versions is required (or pass --body with this field set).')"),
        "{prompts}"
    );
}

/// `queues-get-consumer`, with its path parameters renamed.
fn renamed_consumer_get() -> OperationInfo {
    OperationInfo {
        path_params: vec![
            param("account_id", None),
            param("queue_id", Some("queue")),
            param("consumer_id", Some("consumer")),
        ],
        ..operation(
            "get",
            "/accounts/{account_id}/queues/{queue_id}/consumers/{consumer_id}",
        )
    }
}

/// The handler, builder and resolved request path of a command of `example`.
fn emit(m: &Method, op: &OperationInfo) -> (String, String, String) {
    let ctx = context(m, "example", op);
    (
        handler(&ctx).join("\n"),
        builder_lines(&ctx).join("\n"),
        ctx.resolved_request_path.clone(),
    )
}

#[test]
fn reads_renamed_path_args_in_the_request_and_dry_run() {
    let op = OperationInfo {
        wire: Wire {
            has_request: true,
            ..Wire::default()
        },
        ..renamed_consumer_get()
    };
    let (h, builder, _) = emit(&method("get", "queues-get-consumer"), &op);
    assert!(builder.contains(".positional('consumer'"), "{builder}");
    assert!(builder.contains(".option('queue'"), "{builder}");
    assert!(!builder.contains("queue-id"));
    assert!(!builder.contains("consumer-id"));

    // A renamed path parameter is sent with a passthrough request.
    assert!(!h.contains("client.send("));
    for expected in [
        r#"/queues/${encodeURIComponent(String(argv["queue"]))}/consumers/${encodeURIComponent(String(argv["consumer"]))}"#,
        r#"/queues/${argv["queue"] == null ? '<queue>' : encodeURIComponent(String(argv["queue"]))}"#,
        r#"/consumers/${argv["consumer"] == null ? '<consumer>' : encodeURIComponent(String(argv["consumer"]))}"#,
        r#""queue": String(argv["queue"] ?? '')"#,
        r#""consumer": String(argv["consumer"] ?? '')"#,
    ] {
        assert!(h.contains(expected), "{expected} in {h}");
    }
    assert!(!h.contains(r#"argv["queue-id"]"#));
    assert!(!h.contains(r#"argv["consumer-id"]"#));
}

#[test]
fn substitutes_renamed_path_args_into_the_raw_request_url() {
    let (h, _, resolved_request_path) = emit(&method("get", "example-without-sdk-entry"), &renamed_consumer_get());
    assert_eq!(
        resolved_request_path,
        r#"/accounts/${accountId}/queues/${encodeURIComponent(String(argv["queue"]))}/consumers/${encodeURIComponent(String(argv["consumer"]))}"#
    );
    assert!(!h.contains(r#"argv["queue-id"]"#));
}

#[test]
fn does_not_treat_a_renamed_path_positional_as_a_body_field() {
    let op = OperationInfo {
        path_params: vec![param("account_id", None), param("thing_id", Some("thing"))],
        body_params: vec![BodyParamInfo {
            description: Some("Label".to_owned()),
            ..body_param("label", "string", &["label"])
        }],
        ..json_body(operation("put", "/accounts/{account_id}/things/{thing_id}"))
    };
    let (h, _, _) = emit(&method("update", "example-without-sdk-entry"), &op);
    assert!(h.contains(r#"encodeURIComponent(String(argv["thing"]))"#), "{h}");
    assert!(h.contains(r#"setNestedValue(bodyData, ["label"]"#), "{h}");
    assert!(!h.contains(r#"bodyData["thing"]"#));
    assert!(!h.contains("thing: "));
}

#[test]
fn emits_forges_renamed_body_flags_conflicts_and_wire_paths() {
    let op = OperationInfo {
        path_params: vec![param("account_id", None)],
        body_params: vec![
            BodyParamInfo {
                description: Some("Certificate".to_owned()),
                conflicts: Some(strings(&["token"])),
                ..body_param("mtls-certificate-id", "string", &["mtls", "mtls_certificate_id"])
            },
            BodyParamInfo {
                description: Some("Token".to_owned()),
                conflicts: Some(strings(&["mtls-certificate-id"])),
                ..body_param("token", "string", &["access_token"])
            },
        ],
        ..json_body(operation("post", "/accounts/{account_id}/configs"))
    };
    let (h, builder, _) = emit(&method("create", "example-without-sdk-entry"), &op);
    for expected in [
        ".option('mtls-certificate-id'",
        ".option('token'",
        ".conflicts('mtls-certificate-id', ['token'])",
        ".conflicts('token', ['mtls-certificate-id'])",
    ] {
        assert!(builder.contains(expected), "{expected} in {builder}");
    }
    assert!(
        h.contains(
            r#"setNestedValue(bodyData, ["mtls", "mtls_certificate_id"], resolveFileToken(argv["mtls-certificate-id"]"#
        ),
        "{h}"
    );
    assert!(
        h.contains(r#"setNestedValue(bodyData, ["access_token"], resolveFileToken(argv["token"]"#),
        "{h}"
    );
}
