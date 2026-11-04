//! Projects nested tagged unions for validation of flag-assembled bodies.

use forge::{EnumValue, Object, Scalar, Type};
use serde_json::{Value, json};

use crate::operation::{deref, unwrap_null};

fn value(v: EnumValue<'_>) -> Value {
    match v {
        EnumValue::String(s) => json!(s),
        EnumValue::Number(n) => json!(n),
        EnumValue::Boolean(b) => json!(b),
    }
}

fn tagged_members(t: Type<'_>) -> Option<(String, Vec<Object<'_>>)> {
    let Type::Union(union) = unwrap_null(deref(t)) else {
        return None;
    };
    if !union.is_exclusive() {
        return None;
    }
    let members = union
        .members()
        .map(|m| match unwrap_null(deref(m)) {
            Type::Object(o) => Some(o),
            _ => None,
        })
        .collect::<Option<Vec<_>>>()?;
    if members.len() < 2 {
        return None;
    }
    for candidate in members[0].fields() {
        let mut seen = Vec::new();
        if members.iter().all(|member| {
            let Some(field) = member.fields().find(|f| f.wire_name() == candidate.wire_name()) else {
                return false;
            };
            if !field.is_required() {
                return false;
            }
            let Type::Enum(e) = unwrap_null(deref(field.ty())) else {
                return false;
            };
            let values: Vec<_> = e.values().collect();
            if values.iter().any(|v| seen.contains(v)) {
                return false;
            }
            seen.extend(values);
            true
        }) {
            return Some((candidate.wire_name().to_owned(), members));
        }
    }
    None
}

fn schema(t: Type<'_>, active: &[Type<'_>]) -> Value {
    let raw = t;
    let t = deref(t);
    if active
        .iter()
        .any(|a| matches!((a, raw), (Type::Model(a), Type::Model(b)) if *a == b))
        || active.len() > 16
    {
        return json!({});
    }
    let next = [active, &[raw]].concat();
    match t {
        Type::Scalar(Scalar::Unknown) | Type::Model(_) => json!({}),
        Type::Scalar(s) => {
            json!({"type": match s { Scalar::Number(_) => "number", Scalar::Boolean => "boolean", Scalar::Null => "null", _ => "string" }})
        }
        Type::Enum(e) => json!({"enum": e.values().map(value).collect::<Vec<_>>()}),
        Type::Array(a) => {
            let mut s = json!({"type":"array", "items": schema(a.elem(), &next)});
            if let Some(max) = a.max_items() {
                s["maxItems"] = json!(max);
            }
            s
        }
        Type::Object(o) => json!({
            "type": "object",
            "properties": o.fields().map(|f| (f.wire_name().to_owned(), schema(f.ty(), &next))).collect::<serde_json::Map<_,_>>(),
            "required": o.fields().filter(|f| f.is_required() && !f.is_read_only()).map(|f| f.wire_name()).collect::<Vec<_>>(),
            "additionalProperties": o.extra().map_or(json!(false), |e| schema(e, &next)),
        }),
        Type::Union(u) => json!({"anyOf": u.members().map(|m| schema(m, &next)).collect::<Vec<_>>()}),
        Type::Intersection(i) => json!({"allOf": i.members().map(|m| schema(m, &next)).collect::<Vec<_>>()}),
    }
}

pub fn body_unions(t: Type<'_>) -> Vec<Value> {
    fn visit(t: Type<'_>, path: Vec<String>, active: &[Type<'_>]) -> Vec<Value> {
        let raw = t;
        let t = unwrap_null(deref(t));
        if active
            .iter()
            .any(|a| matches!((a, raw), (Type::Model(a), Type::Model(b)) if *a == b))
            || path.len() > 4
            || active.len() > 32
        {
            return Vec::new();
        }
        let next = [active, &[raw]].concat();
        if !path.is_empty()
            && let Some((selector, members)) = tagged_members(t)
        {
            let variants: Vec<_> = members
                .into_iter()
                .map(|member| {
                    let values = member
                        .fields()
                        .find(|f| f.wire_name() == selector)
                        .and_then(|f| match unwrap_null(deref(f.ty())) {
                            Type::Enum(e) => Some(e.values().map(value).collect::<Vec<_>>()),
                            _ => None,
                        })
                        .unwrap_or_default();
                    json!({"values": values, "schema": schema(Type::Object(member), &[])})
                })
                .collect();
            return vec![json!({"path": path, "selector": selector, "variants": variants})];
        }
        match t {
            Type::Object(o) => o
                .fields()
                .filter(|f| !f.is_read_only())
                .flat_map(|f| visit(f.ty(), [path.as_slice(), &[f.wire_name().to_owned()]].concat(), &next))
                .collect(),
            Type::Union(u) => {
                let nested: Vec<_> = u.members().flat_map(|m| visit(m, path.clone(), &next)).collect();
                if nested.is_empty() {
                    nested
                } else {
                    vec![json!({"path":path, "schema": schema(t, &[])})]
                }
            }
            Type::Intersection(i) => i.members().flat_map(|m| visit(m, path.clone(), &next)).collect(),
            _ => Vec::new(),
        }
    }
    visit(t, Vec::new(), &[])
}
