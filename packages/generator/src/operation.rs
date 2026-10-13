//! Resolves each method of the forge into what the CLI is built from: its
//! parameters, the flags its body flattens into, its content types and its
//! responses.
//!
//! These are the facts cf's first generator read from the OpenAPI document
//! itself. They are read from forge's model by the rules it followed, so
//! that every flag stays what it was. The body's flags are flattened in
//! `body.rs`.
//!
//! It also resolves how a typed call sends the operation, its [`Wire`],
//! which the runtime's `Operation` describes.

use forge::{Body, Content, EnumValue, Field, Location, Method, Scalar, Type, Union};

use crate::body::{body_properties, discriminator, required_names};
use crate::js::{Obj, Value, name_words, number_to_string, push_unique, trim};

/// A parameter of an operation.
#[derive(Clone, Debug, Default)]
pub struct ParameterInfo {
    /// The wire name.
    pub name: String,
    /// The kebab-case name of the field, when `x-fern-parameter-name`
    /// renames it.
    pub sdk_name: Option<String>,
    pub required: bool,
    /// What cf's first generator said of the parameter's schema: `string`,
    /// `number`, `boolean`, `array`, `object` or `unknown`.
    pub ty: &'static str,
    pub description: Option<String>,
    pub enum_values: Option<Vec<String>>,
}

/// A body property that becomes a flag.
#[derive(Clone, Debug, Default)]
pub struct BodyParamInfo {
    pub name: String,
    pub required: bool,
    pub ty: &'static str,
    pub item_type: Option<&'static str>,
    pub description: Option<String>,
    pub enum_values: Option<Vec<String>>,
    pub default: Option<Value>,
    pub sensitive: bool,
    pub api_field_path: Vec<String>,
    pub conflicts: Option<Vec<String>>,
    pub implies: Option<Vec<String>>,
}

/// The kind of value a field of a `multipart/form-data` body takes.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum FieldType {
    Number,
    Boolean,
    Array,
    Object,
    String,
}

/// A field of a `multipart/form-data` body.
#[derive(Clone, Debug)]
pub struct MultipartField {
    pub name: String,
    pub ty: FieldType,
    pub is_binary: bool,
    pub description: String,
}

/// The fields of a `multipart/form-data` body, and the one that carries its
/// content.
#[derive(Clone, Debug, Default)]
pub struct MultipartInfo {
    pub fields: Vec<MultipartField>,
    pub payload_field: Option<String>,
}

/// A body that is a discriminated union.
#[derive(Clone, Debug)]
pub struct BodyDiscriminator {
    pub field: String,
    /// The fields each variant requires beyond those all of them do, by the
    /// value of the discriminator.
    pub variants: Vec<(String, Vec<String>)>,
}

/// A response of an operation: the media types of its content.
#[derive(Clone, Debug, Default)]
pub struct ResponseInfo {
    pub content: Vec<String>,
}

/// The kind of body a typed call sends.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum WireBody {
    Json,
    Form,
}

/// How a typed call sends an operation's request. A JSON body is the
/// request's `body`; a form body is the request's fields other than its
/// parameters.
#[derive(Clone, Debug, Default)]
pub struct Wire {
    /// Whether a typed call passes a request: not for a raw body alone, nor
    /// with no parameters and no object or form body.
    pub has_request: bool,
    /// The body's kind, if a typed call sends one.
    pub body: Option<WireBody>,
    /// Whether the body must be passed: the operation requires it, it is not
    /// a JSON object or a form, or it has fields that must be set, other
    /// than ones with a single allowed value, which are filled in.
    pub body_required: bool,
    /// The query parameters whose arrays are joined with commas.
    pub joined: Vec<String>,
    /// Body fields with a single allowed value, which are always sent.
    pub constants: Obj,
    /// The media type of the body.
    pub content_type: Option<String>,
    /// Whether the response has no body to return.
    pub no_response: bool,
    /// How the response body is read, when not as JSON.
    pub response_type: Option<&'static str>,
    /// The names of the errors for the statuses the operation declares.
    pub errors: Vec<(&'static str, &'static str)>,
}

/// An operation, resolved.
#[derive(Clone, Debug, Default)]
pub struct OperationInfo {
    pub path: String,
    /// The method in lowercase, such as `get`.
    pub method: String,
    /// The path parameters, in the order of the path template.
    pub path_params: Vec<ParameterInfo>,
    pub query_params: Vec<ParameterInfo>,
    pub header_params: Vec<ParameterInfo>,
    pub body_params: Vec<BodyParamInfo>,
    pub has_request_body: bool,
    pub request_content_types: Vec<String>,
    /// The model the JSON body is, if it is one.
    pub request_body_ref: Option<String>,
    /// Whether the operation requires its JSON body, which is an object with
    /// fields: sent empty, it would say nothing.
    pub request_body_mandatory: bool,
    pub request_body_required: Vec<String>,
    pub request_body_description: Option<String>,
    pub multipart: Option<MultipartInfo>,
    pub body_discriminator: Option<BodyDiscriminator>,
    pub max_items: Option<u64>,
    pub request_body_is_array: bool,
    /// Each response by status: the success responses, then the others.
    pub responses: Vec<(String, ResponseInfo)>,
    /// How a typed call sends the operation.
    pub wire: Wire,
}

impl OperationInfo {
    /// The response with `status`.
    pub fn response(&self, status: &str) -> Option<&ResponseInfo> {
        self.responses.iter().find(|(s, _)| s == status).map(|(_, r)| r)
    }
}

/// Resolves `method`.
pub fn resolve(method: Method<'_>) -> OperationInfo {
    let mut path_params = Vec::new();
    let mut query_params = Vec::new();
    for field in params(method).unwrap_or_default() {
        match method.location(field) {
            Some(Location::Path) => path_params.push(parameter(field, true)),
            Some(Location::Query { .. }) => query_params.push(parameter(field, false)),
            None => {}
        }
    }
    let header_params = method
        .headers()
        .into_iter()
        .flat_map(|h| h.fields())
        .map(|f| parameter(f, false))
        .collect();

    let body = method.body().filter(|&b| !is_semantically_empty(b));
    let json = body.and_then(|b| content(b, "application/json")).map(|c| c.ty());
    // The JSON schema, through every `$ref`.
    let json_resolved = json.map(deref);
    let unwrapped = json_resolved.map(unwrap_null);
    let is_array = matches!(unwrapped, Some(Type::Array(_)));
    let mut info = OperationInfo {
        path: method.path().to_owned(),
        method: method.http_method().as_str().to_lowercase(),
        path_params,
        query_params,
        header_params,
        body_params: json.map(body_properties).unwrap_or_default(),
        has_request_body: body.is_some(),
        request_content_types: body
            .map(|b| b.contents().map(|c| c.media_type().to_owned()).collect())
            .unwrap_or_default(),
        request_body_ref: json.and_then(|t| match t {
            Type::Model(m) => Some(format!("components['schemas']['{}']", m.schema_name())),
            _ => None,
        }),
        request_body_mandatory: body.is_some_and(|b| b.is_required()) && json_resolved.is_some_and(is_object_body),
        request_body_required: match json_resolved {
            Some(t) if !is_array => required_names(t),
            _ => Vec::new(),
        },
        request_body_description: body.and_then(request_body_description),
        multipart: body.and_then(multipart),
        body_discriminator: json_resolved.and_then(discriminator),
        max_items: unwrapped.and_then(|t| match t {
            Type::Array(array) => array.max_items(),
            _ => None,
        }),
        request_body_is_array: is_array,
        responses: method
            .responses()
            .chain(method.errors())
            .map(|r| {
                let content = r.contents().map(|c| c.media_type().to_owned()).collect();
                (r.status().to_owned(), ResponseInfo { content })
            })
            .collect(),
        wire: Wire::default(),
    };
    info.wire = wire(method, &info);
    info
}

/// The content of `body` with `media_type`.
fn content<'f>(body: Body<'f>, media_type: &str) -> Option<Content<'f>> {
    body.contents().find(|c| c.media_type() == media_type)
}

fn request_body_description(body: Body<'_>) -> Option<String> {
    if !body.description().is_empty() {
        return Some(body.description().to_owned());
    }
    // The first of these media types with a schema: one with a shape or a
    // description.
    ["application/json", "application/octet-stream", "multipart/form-data"]
        .into_iter()
        .filter_map(|t| content(body, t))
        .find(|c| !is_scalar(c.ty(), Scalar::Unknown) || !c.description().is_empty())
        .filter(|c| !c.description().is_empty())
        .map(|c| c.description().to_owned())
}

/// The fields of the object of the path and query parameters of `method`,
/// the first member of its request when the request intersects them with
/// the body, or none if it has none. A request that is the body alone has
/// no field with a location.
pub fn params(method: Method<'_>) -> Option<Vec<Field<'_>>> {
    let object = match method.request()? {
        Type::Object(object) => object,
        Type::Intersection(intersection) => intersection.members().find_map(|m| match m {
            Type::Object(object) => Some(object),
            _ => None,
        })?,
        _ => return None,
    };
    let fields: Vec<Field> = object.fields().collect();
    fields.iter().any(|&f| method.location(f).is_some()).then_some(fields)
}

/// The kebab-case name a field is renamed to, by `x-fern-parameter-name` or
/// `x-fern-property-name`, or none if it keeps its wire name.
pub fn renamed(field: Field<'_>) -> Option<String> {
    (name_words(field.wire_name()) != field.name().words()).then(|| field.name().kebab())
}

fn non_empty(s: &str) -> Option<String> {
    (!s.is_empty()).then(|| s.to_owned())
}

fn parameter(field: Field<'_>, path: bool) -> ParameterInfo {
    ParameterInfo {
        name: field.wire_name().to_owned(),
        sdk_name: renamed(field),
        required: field.is_required(),
        ty: if path { "string" } else { parameter_type(field.ty()) },
        description: non_empty(trim(field.description())).or_else(|| referenced_description(field.ty(), 0)),
        enum_values: if path { None } else { parameter_enum(field.ty()) },
    }
}

/// The description of the schema a field's `allOf` refers to, which forge
/// leaves off the field. A property is often written `allOf: [$ref]` only
/// to carry `x-fern-property-name` or a default next to the reference. cf's
/// first generator fell back to it, so flags keep their help text; the
/// field's own description is the right source, and this fallback can go
/// once forge reads it through the `allOf`. A later member's description
/// wins.
pub fn referenced_description(ty: Type<'_>, depth: usize) -> Option<String> {
    if depth > 32 {
        return None;
    }
    match unwrap_null(ty) {
        Type::Model(model) => {
            non_empty(trim(model.description())).or_else(|| referenced_description(model.ty(), depth + 1))
        }
        Type::Intersection(intersection) => intersection
            .members()
            .collect::<Vec<_>>()
            .into_iter()
            .rev()
            .find_map(|member| referenced_description(member, depth + 1)),
        _ => None,
    }
}

/// `ty`, through every model it is.
pub fn deref(mut ty: Type<'_>) -> Type<'_> {
    for _ in 0..64 {
        match ty {
            Type::Model(model) => ty = model.ty(),
            _ => return ty,
        }
    }
    ty
}

/// The one member of a union with null other than null, or else `ty`: what
/// a nullable schema was before `nullable`.
pub fn unwrap_null(ty: Type<'_>) -> Type<'_> {
    if let Type::Union(union) = ty
        && let [member] = non_null_members(union).collect::<Vec<_>>()[..]
    {
        return member;
    }
    ty
}

/// The members of a union other than null.
pub fn non_null_members(union: Union<'_>) -> impl Iterator<Item = Type<'_>> {
    union.members().filter(|&m| !is_scalar(m, Scalar::Null))
}

/// Reports whether `ty` is the scalar `scalar`.
pub fn is_scalar(ty: Type<'_>, scalar: Scalar) -> bool {
    matches!(ty, Type::Scalar(s) if s == scalar)
}

/// The type cf's first generator gave a value of `ty`, without looking
/// inside unions and intersections: none for `unknown`.
fn simple_type(ty: Type<'_>) -> Option<&'static str> {
    match unwrap_null(deref(ty)) {
        Type::Scalar(Scalar::Number(_)) => Some("number"),
        Type::Scalar(Scalar::Boolean) => Some("boolean"),
        Type::Scalar(Scalar::String | Scalar::Date | Scalar::DateTime | Scalar::Bytes | Scalar::Binary) => {
            Some("string")
        }
        Type::Enum(values) => enum_type(values.values()),
        Type::Array(_) => Some("array"),
        Type::Object(_) => Some("object"),
        _ => None,
    }
}

/// `typeof value`.
pub fn type_of(value: EnumValue<'_>) -> &'static str {
    match value {
        EnumValue::String(_) => "string",
        EnumValue::Number(_) => "number",
        EnumValue::Boolean(_) => "boolean",
    }
}

/// `String(value)`.
pub fn enum_string(value: EnumValue<'_>) -> String {
    match value {
        EnumValue::String(s) => s.to_owned(),
        EnumValue::Number(n) => number_to_string(n),
        EnumValue::Boolean(b) => b.to_string(),
    }
}

/// The type of an enum's values, when they all have one.
pub fn enum_type<'f>(values: impl IntoIterator<Item = EnumValue<'f>>) -> Option<&'static str> {
    let mut ty = None;
    for value in values {
        let t = type_of(value);
        if ty.is_some_and(|ty| ty != t) {
            return None;
        }
        ty = Some(t);
    }
    ty
}

/// What `resolveParameterSchema` gave: a type, or the unknown schema that
/// merging members without a type makes.
#[derive(Clone, Copy)]
enum ParamSchema<'f> {
    Type(Type<'f>),
    Unknown,
}

impl ParamSchema<'_> {
    fn simple_type(self) -> Option<&'static str> {
        match self {
            ParamSchema::Type(ty) => simple_type(ty),
            ParamSchema::Unknown => None,
        }
    }
}

/// `extractType(resolveParameterSchema(schema))`.
fn parameter_type(ty: Type<'_>) -> &'static str {
    parameter_schema(ty)
        .and_then(ParamSchema::simple_type)
        .unwrap_or("unknown")
}

/// `resolveParameterSchema`: the type a parameter's value has, through the
/// unions and intersections that agree on one type.
fn parameter_schema(ty: Type<'_>) -> Option<ParamSchema<'_>> {
    let t = unwrap_null(deref(ty));
    match t {
        Type::Union(union) => {
            let members: Vec<ParamSchema> = non_null_members(union).filter_map(parameter_schema).collect();
            let mut types = Vec::new();
            for s in members.iter().filter_map(|m| m.simple_type()) {
                push_unique(&mut types, s);
            }
            if types.len() == 1 {
                return members.first().copied();
            }
            // An `anyOf` of strings and lists of strings is a string; a
            // `oneOf` of them has no one type.
            if !union.is_exclusive() && types.len() == 2 && types.contains(&"string") && types.contains(&"array") {
                let array_of_strings = members.iter().any(|m| match m {
                    ParamSchema::Type(m) => match unwrap_null(deref(*m)) {
                        Type::Array(array) => {
                            parameter_schema(array.elem()).and_then(ParamSchema::simple_type) == Some("string")
                        }
                        _ => false,
                    },
                    ParamSchema::Unknown => false,
                });
                if array_of_strings {
                    return members.iter().copied().find(|m| m.simple_type() == Some("string"));
                }
            }
            None
        }
        Type::Intersection(intersection) => {
            let mut types = Vec::new();
            let mut last = None;
            for m in intersection.members().filter_map(parameter_schema) {
                if let Some(s) = m.simple_type() {
                    push_unique(&mut types, s);
                    last = Some(m);
                }
            }
            if types.len() > 1 {
                return None;
            }
            // The merged schema: the last member with a type gives it.
            Some(last.unwrap_or(ParamSchema::Unknown))
        }
        _ => Some(ParamSchema::Type(t)),
    }
}

/// The values of the parameter's enum, as strings.
fn parameter_enum(ty: Type<'_>) -> Option<Vec<String>> {
    let resolved = match unwrap_null(deref(ty)) {
        Type::Intersection(intersection) => intersection
            .members()
            .map(|m| unwrap_null(deref(m)))
            .filter(|m| matches!(m, Type::Enum(_)))
            .last(),
        _ => match parameter_schema(ty) {
            Some(ParamSchema::Type(schema)) => Some(unwrap_null(deref(schema))),
            _ => None,
        },
    };
    match resolved? {
        Type::Enum(values) => Some(values.values().map(enum_string).collect()),
        _ => None,
    }
}

/// Reports whether a body has no content worth sending: only JSON media
/// types, each without a schema, or with one that gives no shape. An object
/// without properties is any object, and is worth sending.
fn is_semantically_empty(body: Body<'_>) -> bool {
    body.contents()
        .all(|c| c.media_type().to_lowercase().contains("json") && is_scalar(c.ty(), Scalar::Unknown))
}

fn multipart(body: Body<'_>) -> Option<MultipartInfo> {
    let form = content(body, "multipart/form-data")?;
    let Type::Object(object) = deref(form.ty()) else {
        return None;
    };
    let octet = content(body, "application/octet-stream").and_then(|c| match c.ty() {
        Type::Model(model) => Some(model),
        _ => None,
    });
    let mut fields = Vec::new();
    let mut payload_field = None;
    for field in object.fields() {
        let name = field.wire_name().to_owned();
        let resolved = unwrap_null(deref(field.ty()));
        let is_binary = is_scalar(resolved, Scalar::Binary);
        let ty = match resolved {
            Type::Scalar(Scalar::Number(_)) => FieldType::Number,
            Type::Scalar(Scalar::Boolean) => FieldType::Boolean,
            Type::Enum(values) => match enum_type(values.values()) {
                Some("number") => FieldType::Number,
                Some("boolean") => FieldType::Boolean,
                _ => FieldType::String,
            },
            Type::Array(_) => FieldType::Array,
            Type::Object(_) => FieldType::Object,
            _ => FieldType::String,
        };
        let description = if field.description().is_empty() {
            format!("The {}", name.replace('_', " "))
        } else {
            field.description().to_owned()
        };
        if payload_field.is_none() {
            let same_model = matches!(field.ty(), Type::Model(m) if Some(m) == octet);
            if same_model || is_binary || name == "file" {
                payload_field = Some(name.clone());
            }
        }
        fields.push(MultipartField {
            name,
            ty,
            is_binary,
            description,
        });
    }
    Some(MultipartInfo { fields, payload_field })
}

// How a typed call sends the operation. These rules are the ones of the Fern
// SDK the commands called before, which what they send still follows.

const ERRORS: &[(&str, &str)] = &[
    ("400", "BadRequestError"),
    ("401", "UnauthorizedError"),
    ("403", "ForbiddenError"),
    ("404", "NotFoundError"),
    ("405", "MethodNotAllowedError"),
    ("408", "RequestTimeoutError"),
    ("409", "ConflictError"),
    ("410", "GoneError"),
    ("412", "PreconditionFailedError"),
    ("413", "ContentTooLargeError"),
    ("415", "UnsupportedMediaTypeError"),
    ("422", "UnprocessableEntityError"),
    ("423", "LockedError"),
    ("429", "TooManyRequestsError"),
    ("499", "ClientClosedRequestError"),
    ("500", "InternalServerError"),
    ("501", "NotImplementedError"),
    ("502", "BadGatewayError"),
    ("503", "ServiceUnavailableError"),
    ("504", "GatewayTimeoutError"),
    ("507", "InsufficientStorageError"),
];

/// Reports whether a body of type `ty`, through its models, is an object:
/// one with properties, or an intersection.
fn is_object_body(ty: Type<'_>) -> bool {
    match unwrap_null(ty) {
        Type::Intersection(_) => true,
        Type::Object(object) => object.fields().len() > 0,
        _ => false,
    }
}

/// How a typed call sends `method`, which `info` resolves.
fn wire(method: Method<'_>, info: &OperationInfo) -> Wire {
    // The path and query parameters, in the order they are declared.
    let params: Vec<(Field, Location)> = params(method)
        .unwrap_or_default()
        .into_iter()
        .filter_map(|f| method.location(f).map(|l| (f, l)))
        .collect();
    let no_params = params.is_empty() && info.header_params.is_empty();
    let mut body = method.body();
    // The CLI sends no body for GET or HEAD, and a typed call leaves a
    // plain-text body out.
    if info.method == "get" || info.method == "head" {
        body = None;
    }
    if body.is_some_and(|b| b.contents().len() > 0 && b.contents().all(|c| c.media_type().starts_with("text/plain"))) {
        body = None;
    }
    let contents: Vec<Content> = body.into_iter().flat_map(|b| b.contents()).collect();
    let has = |t: &str| contents.iter().any(|c| c.media_type() == t);
    let form_encoded = contents
        .first()
        .is_some_and(|c| c.media_type() == "application/x-www-form-urlencoded");
    let octet_only = !contents.is_empty() && contents.iter().all(|c| c.media_type() == "application/octet-stream");
    let is_multipart = has("multipart/form-data") && !has("application/json");
    // The body's schema: the JSON one, or else that of the first media type.
    let resolved_schema = contents
        .iter()
        .find(|c| c.media_type() == "application/json")
        .or(contents.first())
        .map(|c| deref(c.ty()));
    let has_request = if octet_only {
        false
    } else if no_params {
        body.is_some() && (is_multipart || resolved_schema.is_some_and(is_object_body))
    } else {
        true
    };
    let resolved_json = if is_multipart || octet_only {
        None
    } else {
        resolved_schema.filter(|&t| is_object_body(t))
    };
    let mut constants = Obj::new();
    let body_required = match resolved_json {
        Some(json) if !form_encoded => {
            let mut required = Vec::new();
            object_body(json, &mut required, &mut constants);
            // A body the operation requires must be passed even when none of
            // its fields is, as for a map of changes: an empty one says
            // nothing.
            info.request_body_mandatory || !required.is_empty()
        }
        _ if is_multipart => contents
            .iter()
            .find(|c| c.media_type() == "multipart/form-data")
            .is_some_and(|form| matches!(deref(form.ty()), Type::Object(o) if o.fields().any(|f| f.is_required()))),
        _ => body.is_some() && !octet_only,
    };
    let joined = params
        .iter()
        .filter(|(_, l)| *l == Location::Query { exploded: false })
        .map(|(f, _)| f.wire_name().to_owned())
        .collect();
    // The response is read by the first media type of the first success
    // response that has content.
    let first = method.responses().find_map(|r| r.contents().next());
    let (no_response, response_type) = match first {
        None => (true, None),
        Some(c) if c.media_type().contains("json") => (false, None),
        Some(c) => {
            let ct = c.media_type();
            let binary = is_scalar(deref(c.ty()), Scalar::Binary)
                || ct == "application/octet-stream"
                || ct == "application/pdf"
                || ct == "application/zip"
                || ct.starts_with("image/");
            if binary {
                (false, Some("binary-response"))
            } else if ct.starts_with("text/") {
                (false, Some("text"))
            } else {
                (true, None)
            }
        }
    };
    let errors = info
        .responses
        .iter()
        .filter_map(|(status, _)| ERRORS.iter().find(|(s, _)| s == status).copied())
        .collect();
    Wire {
        has_request,
        body: body.map(|_| if is_multipart { WireBody::Form } else { WireBody::Json }),
        body_required,
        joined,
        constants,
        content_type: contents.first().map(|c| c.media_type().to_owned()),
        no_response,
        response_type,
        errors,
    }
}

/// Adds the required properties of an object body of type `schema` to
/// `required`, and its properties with a single allowed value to
/// `constants`. A read-only property is left out of both.
fn object_body(schema: Type<'_>, required: &mut Vec<String>, constants: &mut Obj) {
    fn collect<'f>(ty: Type<'f>, depth: usize, fields: &mut Vec<Field<'f>>) {
        if depth > 8 {
            return;
        }
        match unwrap_null(deref(ty)) {
            Type::Object(object) => {
                for field in object.fields() {
                    if field.is_required() && !fields.iter().any(|f| f.wire_name() == field.wire_name()) {
                        fields.push(field);
                    }
                }
            }
            Type::Intersection(intersection) => {
                for member in intersection.members() {
                    collect(member, depth + 1, fields);
                }
            }
            _ => {}
        }
    }
    let mut fields = Vec::new();
    collect(schema, 0, &mut fields);
    for field in fields.iter().filter(|f| !f.is_read_only()) {
        match literal(field.ty()) {
            Some(value) => constants.insert(field.wire_name().to_owned(), value),
            None => required.push(field.wire_name().to_owned()),
        }
    }
}

/// The one value a type allows, when it allows one string or boolean: an
/// enum of one value.
fn literal(ty: Type<'_>) -> Option<Value> {
    match unwrap_null(deref(ty)) {
        Type::Enum(values) => match values.values().collect::<Vec<_>>()[..] {
            [EnumValue::String(s)] => Some(Value::from(s)),
            [EnumValue::Boolean(b)] => Some(Value::Bool(b)),
            _ => None,
        },
        _ => None,
    }
}
