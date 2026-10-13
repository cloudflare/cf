//! Builders for the unit tests. Deriving arguments and emitting a command
//! read only the resolved operation, so tests build one directly.

use crate::args::{Arg, ArgType, Origin};
use crate::commands::Method;
use crate::emit::{Ctx, context as emit_context};
use crate::operation::{BodyParamInfo, OperationInfo, ParameterInfo, ResponseInfo};

/// A method named `name` for the operation `operation_id`.
pub fn method(name: &str, operation_id: &str) -> Method {
    Method {
        name: name.to_owned(),
        operation_id: operation_id.to_owned(),
        description: "Example operation".to_owned(),
        ..Method::default()
    }
}

/// A required string parameter named `name`, renamed to `sdk_name`.
pub fn param(name: &str, sdk_name: Option<&str>) -> ParameterInfo {
    ParameterInfo {
        name: name.to_owned(),
        sdk_name: sdk_name.map(str::to_owned),
        required: true,
        ty: "string",
        ..ParameterInfo::default()
    }
}

/// An optional body property named `name`, of type `ty`, at `path`.
pub fn body_param(name: &str, ty: &'static str, path: &[&str]) -> BodyParamInfo {
    BodyParamInfo {
        name: name.to_owned(),
        ty,
        api_field_path: path.iter().map(|s| s.to_string()).collect(),
        ..BodyParamInfo::default()
    }
}

/// A `200` response with a JSON body.
pub fn json_ok() -> Vec<(String, ResponseInfo)> {
    vec![(
        "200".to_owned(),
        ResponseInfo {
            content: vec!["application/json".to_owned()],
        },
    )]
}

/// An operation `method path` with a JSON response and nothing else.
pub fn operation(method: &str, path: &str) -> OperationInfo {
    OperationInfo {
        path: path.to_owned(),
        method: method.to_owned(),
        responses: json_ok(),
        ..OperationInfo::default()
    }
}

/// A JSON request body.
pub fn json_body(op: OperationInfo) -> OperationInfo {
    OperationInfo {
        has_request_body: true,
        request_content_types: vec!["application/json".to_owned()],
        ..op
    }
}

/// An optional, non-positional argument `name` of type `ty` from `origin`.
pub fn arg(name: &str, ty: ArgType, origin: Origin) -> Arg {
    Arg::new(name.to_owned(), format!("{name} description"), ty, false, false, origin)
}

/// The names of `args`.
pub fn names(args: &[Arg]) -> Vec<&str> {
    args.iter().map(|a| a.name.as_str()).collect()
}

/// The argument of `args` named `name`.
pub fn find<'a>(args: &'a [Arg], name: &str) -> &'a Arg {
    args.iter()
        .find(|a| a.name == name)
        .unwrap_or_else(|| panic!("no argument {name} in {:?}", names(args)))
}

/// The emit context of a command of `resource` with no group.
pub fn context<'a>(m: &'a Method, resource: &'a str, op: &'a OperationInfo) -> Ctx<'a> {
    emit_context(m, resource, None, op, "./".to_owned())
        .expect("the command emits")
        .0
}

/// The strings `items`, owned.
pub fn strings(items: &[&str]) -> Vec<String> {
    items.iter().map(|s| s.to_string()).collect()
}
