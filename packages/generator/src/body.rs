//! Flattens a JSON request body into flags.
//!
//! A port of `extractBodyProperties`, the function of cf's first generator
//! that read raw schemas and merged them into new ones. It reads forge's
//! types through [`Schema`]: a view of a type that answers what it asked of
//! a schema, such as its `type`, `properties` or `oneOf`, and that merged
//! schemas can be built as. Its rules are kept as they were, quirks
//! included, since every flag of the CLI follows from them: nested objects
//! stop four levels down, and a union's members conflict with each other.
//!
//! Some of what it read is not in forge's model, and is read as near as it
//! can be: an exclusive union is read as a `oneOf`, and one that is not as
//! an `anyOf`, which it left alone; an intersection as an `allOf`; an
//! enum's `type` from its values; and a union with null as the schema
//! without `nullable`.
//!
//! Schemas and properties are never changed once made: merging makes new
//! ones.

use std::rc::Rc;

use forge::{EnumValue, Model, Scalar, Type};

use serde_json::Value;

use crate::js::{dedup, from_forge, is_array_index, kebab, trim};
use crate::operation::{
    BodyDiscriminator, BodyParamInfo, JsonType, deref, enum_type, non_null_members, referenced_description, renamed,
    unwrap_null,
};

/// A schema, as cf's first generator read it: a type of forge, one level at
/// a time.
#[derive(Clone, Default)]
struct Schema<'f> {
    /// The model a `$ref` points to, for a schema that is one, which
    /// [`resolve`] follows.
    reference: Option<Model<'f>>,
    /// The JSON `type`.
    kind: Option<JsonType>,
    map: bool,
    /// The properties, when the schema has `properties`.
    properties: Option<Vec<Prop<'f>>>,
    required: Vec<String>,
    /// The members of an exclusive union, from `oneOf`.
    one_of: Option<Vec<Rc<Schema<'f>>>>,
    /// The members of a union that is not exclusive, from `anyOf`, which
    /// gives no flags. It is only read to tell whether its values are
    /// objects.
    any_of: Option<Vec<Rc<Schema<'f>>>>,
    /// The members of an intersection, from `allOf`.
    all_of: Option<Vec<Rc<Schema<'f>>>>,
    /// The values of an `enum`.
    values: Option<Vec<EnumValue<'f>>>,
    items: Option<Rc<Schema<'f>>>,
}

impl<'f> Schema<'f> {
    fn object(properties: Vec<Prop<'f>>, required: Vec<String>) -> Self {
        Schema {
            kind: Some(JsonType::Object),
            properties: Some(properties),
            required,
            ..Schema::default()
        }
    }

    fn is_object(&self) -> bool {
        self.kind == Some(JsonType::Object) || self.properties.is_some()
    }

    fn properties(&self) -> &[Prop<'f>] {
        self.properties.as_deref().unwrap_or_default()
    }

    /// The schema with its `allOf` merged, if it has one.
    fn flattened(self: Rc<Self>) -> Rc<Self> {
        match &self.all_of {
            Some(all_of) => Rc::new(flatten_all_of(all_of)),
            None => self,
        }
    }
}

/// A property of a schema, with what was read of the property's own schema.
#[derive(Clone)]
struct Prop<'f> {
    /// The wire name.
    name: String,
    schema: Rc<Schema<'f>>,
    description: Option<String>,
    default: Option<Value>,
    read_only: bool,
    sensitive: bool,
    /// The kebab-case name `x-fern-property-name` gives the property.
    fern_name: Option<String>,
}

/// The view of `ty`. A model is a `$ref` to it, which is read only when it
/// is resolved, so that recursive models are not read forever.
fn view(ty: Type<'_>) -> Rc<Schema<'_>> {
    let schema = match ty {
        Type::Model(model) => Schema {
            reference: Some(model),
            ..Schema::default()
        },
        Type::Scalar(scalar) => Schema {
            kind: match scalar {
                Scalar::Uuid | Scalar::String | Scalar::Date | Scalar::DateTime | Scalar::Bytes | Scalar::Binary => {
                    Some(JsonType::String)
                }
                Scalar::Number(_) => Some(JsonType::Number),
                Scalar::Boolean => Some(JsonType::Boolean),
                Scalar::Unknown | Scalar::Null => None,
            },
            ..Schema::default()
        },
        Type::Enum(values) => Schema {
            kind: enum_type(values.values()),
            values: Some(values.values().collect()),
            ..Schema::default()
        },
        Type::Array(array) => Schema {
            kind: Some(JsonType::Array),
            items: Some(view(array.elem())),
            ..Schema::default()
        },
        Type::Object(object) => Schema {
            map: object.fields().len() == 0 && object.extra().is_some(),
            ..Schema::object(
                object
                    .fields()
                    .map(|f| Prop {
                        name: f.wire_name().to_owned(),
                        schema: view(f.ty()),
                        description: if trim(f.description()).is_empty() {
                            referenced_description(f.ty(), 0)
                        } else {
                            Some(f.description().to_owned())
                        },
                        default: f
                            .default()
                            .map(from_forge)
                            .filter(|d| matches!(d, Value::String(_) | Value::Number(_) | Value::Bool(_))),
                        read_only: f.is_read_only(),
                        sensitive: f.is_sensitive(),
                        fern_name: renamed(f),
                    })
                    .collect(),
                object
                    .fields()
                    .filter(|f| f.is_required())
                    .map(|f| f.wire_name().to_owned())
                    .collect(),
            )
        },
        Type::Union(union) => {
            // A nullable schema is a union with null, which was read as the
            // schema itself. An `anyOf` was left alone.
            let members: Vec<Type> = non_null_members(union).collect();
            if let [member] = members[..] {
                return view(member);
            }
            let views = Some(members.into_iter().map(view).collect());
            if union.is_exclusive() {
                Schema {
                    one_of: views,
                    ..Schema::default()
                }
            } else {
                Schema {
                    any_of: views,
                    ..Schema::default()
                }
            }
        }
        Type::Intersection(intersection) => Schema {
            all_of: Some(intersection.members().map(view).collect()),
            ..Schema::default()
        },
    };
    Rc::new(schema)
}

/// `resolveSchemaRef`: follows a `$ref`, through every model it is.
fn resolve<'f>(schema: &Rc<Schema<'f>>) -> Rc<Schema<'f>> {
    match schema.reference {
        Some(model) => view(deref(model.ty())),
        None => schema.clone(),
    }
}

/// Sets `prop` in `props`: in place of one of the same name, or at the end.
fn insert_prop<'f>(props: &mut Vec<Prop<'f>>, prop: Prop<'f>) {
    match props.iter_mut().find(|p| p.name == prop.name) {
        Some(existing) => *existing = prop,
        None => props.push(prop),
    }
}

/// `flattenAllOf`: merges the properties and requirements of `schemas`.
fn flatten_all_of<'f>(schemas: &[Rc<Schema<'f>>]) -> Schema<'f> {
    let mut properties = Vec::new();
    let mut required = Vec::new();
    let mut one_of = None;
    let mut map = false;
    for schema in schemas {
        let resolved = resolve(schema);
        map |= resolved.map;
        for prop in resolved.properties() {
            insert_prop(&mut properties, prop.clone());
        }
        required.extend(resolved.required.iter().cloned());
        if one_of.is_none() {
            one_of = resolved.one_of.clone();
        }
        if let Some(all_of) = &resolved.all_of {
            let nested = flatten_all_of(all_of);
            map |= nested.map;
            for prop in nested.properties() {
                insert_prop(&mut properties, prop.clone());
            }
            required.extend(nested.required);
            if one_of.is_none() {
                one_of = nested.one_of;
            }
        }
    }
    Schema {
        map: map && properties.is_empty(),
        one_of,
        ..Schema::object(properties, dedup(required))
    }
}

fn is_object_valued(schema: &Schema<'_>, active: &[Model<'_>]) -> bool {
    if let Some(model) = schema.reference {
        if active.contains(&model) {
            return false;
        }
        let active = [active, &[model]].concat();
        return is_object_valued(&view(model.ty()), &active);
    }
    if schema.is_object() {
        return true;
    }
    if let Some(union) = schema.one_of.as_ref().or(schema.any_of.as_ref())
        && !union.is_empty()
    {
        return union.iter().all(|s| is_object_valued(s, active));
    }
    match &schema.all_of {
        Some(all_of) if !all_of.is_empty() => all_of.iter().any(|s| is_object_valued(s, active)),
        _ => false,
    }
}

fn scalar_schema<'f>(schema: &Rc<Schema<'f>>, depth: usize) -> Option<Rc<Schema<'f>>> {
    if depth > 20 {
        return None;
    }
    let resolved = resolve(schema);
    if let Some(all) = &resolved.all_of {
        let members = all
            .iter()
            .map(|s| scalar_schema(s, depth + 1))
            .collect::<Option<Vec<_>>>()?;
        let first = members.first()?;
        if members.iter().any(|s| s.kind != first.kind) {
            return None;
        }
        let mut values: Option<Vec<EnumValue<'f>>> = None;
        for member in &members {
            if let Some(v) = &member.values {
                values = Some(match values {
                    None => v.clone(),
                    Some(old) => old.into_iter().filter(|x| v.contains(x)).collect(),
                });
            }
        }
        return Some(Rc::new(Schema {
            kind: first.kind,
            values,
            ..Schema::default()
        }));
    }
    matches!(
        resolved.kind,
        Some(JsonType::String | JsonType::Number | JsonType::Boolean)
    )
    .then_some(resolved)
}

fn scalar_body_param(
    resolved: &Schema<'_>,
    prop: &Prop<'_>,
    name: String,
    path: Vec<String>,
    required: bool,
    optional_parent_path: Option<Vec<String>>,
) -> BodyParamInfo {
    BodyParamInfo {
        name,
        required,
        optional_parent_path,
        ty: match resolved.kind {
            Some(ty @ (JsonType::Number | JsonType::Boolean)) => ty,
            _ => JsonType::String,
        },
        api_field_path: path,
        description: prop.description.clone(),
        enum_values: resolved.values.as_ref().map(|values| {
            values
                .iter()
                .filter_map(|v| match v {
                    EnumValue::String(s) if !s.is_empty() => Some(s.to_string()),
                    _ => None,
                })
                .collect()
        }),
        default: prop.default.clone(),
        sensitive: prop.sensitive,
        ..BodyParamInfo::default()
    }
}

fn scalar_property(
    schema: &Rc<Schema<'_>>,
    prop: &Prop<'_>,
    name: String,
    path: Vec<String>,
    required: bool,
    parent: Option<Vec<String>>,
) -> Option<BodyParamInfo> {
    if let Some(scalar) = scalar_schema(schema, 0) {
        return Some(scalar_body_param(&scalar, prop, name, path, required, parent));
    }
    let variants = schema.one_of.as_ref().or(schema.any_of.as_ref())?;
    if variants.is_empty() {
        return None;
    }
    let members = variants
        .iter()
        .map(|v| scalar_schema(v, 0))
        .collect::<Option<Vec<_>>>()?;
    let first = members.first()?;
    if members.iter().all(|m| m.kind == first.kind) {
        let values = members
            .iter()
            .map(|m| m.values.clone())
            .collect::<Option<Vec<_>>>()
            .map(|v| dedup(v.into_iter().flatten()));
        return Some(scalar_body_param(
            &Schema {
                kind: first.kind,
                values,
                ..Schema::default()
            },
            prop,
            name,
            path,
            required,
            parent,
        ));
    }
    Some(BodyParamInfo {
        name,
        required,
        optional_parent_path: parent,
        ty: JsonType::ScalarUnion,
        api_field_path: path,
        description: prop.description.clone(),
        sensitive: prop.sensitive,
        ..BodyParamInfo::default()
    })
}

fn leaf_param(
    resolved: &Schema<'_>,
    prop: &Prop<'_>,
    name: String,
    path: Vec<String>,
    required: bool,
    parent: Option<Vec<String>>,
) -> Option<BodyParamInfo> {
    let mut info = BodyParamInfo {
        name: name.clone(),
        required,
        optional_parent_path: parent.clone(),
        api_field_path: path.clone(),
        description: prop.description.clone(),
        sensitive: prop.sensitive,
        ..BodyParamInfo::default()
    };
    if resolved.map {
        info.ty = JsonType::Object;
        return Some(info);
    }
    match resolved.kind {
        Some(JsonType::String | JsonType::Number | JsonType::Boolean) => {
            Some(scalar_body_param(resolved, prop, name, path, required, parent))
        }
        Some(JsonType::Array) => {
            let items = resolved.items.as_ref()?;
            let item = resolve(items);
            let objects = is_object_valued(items, &[]);
            let nested = item.kind == Some(JsonType::Array);
            if !objects && !nested && !matches!(item.kind, Some(JsonType::String | JsonType::Number)) {
                return None;
            }
            info.ty = JsonType::Array;
            info.item_type = if objects {
                Some(JsonType::Object)
            } else if nested {
                Some(JsonType::Array)
            } else {
                None
            };
            Some(info)
        }
        _ => None,
    }
}

fn flag_segment(prop: &Prop<'_>) -> String {
    prop.fern_name.clone().unwrap_or_else(|| kebab(&prop.name))
}
fn unflaggable(name: &str) -> bool {
    name.contains(['/', '~', '.', '[', ']', '{', '}', '(', ')'])
}

fn properties_from_schema(
    schema: &Schema<'_>,
    prefix: &str,
    path: &[String],
    required: &[String],
    parent: Option<&[String]>,
    depth: usize,
) -> Vec<BodyParamInfo> {
    let mut results = Vec::new();
    if depth > 3 {
        return results;
    }
    for prop in schema.properties() {
        if prop.read_only || unflaggable(&prop.name) {
            continue;
        }
        let resolved = resolve(&prop.schema);
        let segment = flag_segment(prop);
        let flag = if prefix.is_empty() {
            segment
        } else {
            format!("{prefix}-{segment}")
        };
        let current = [path, std::slice::from_ref(&prop.name)].concat();
        let is_required = required.contains(&prop.name);
        if let Some(info) = scalar_property(
            &resolved,
            prop,
            flag.clone(),
            current.clone(),
            is_required,
            parent.map(<[String]>::to_vec),
        ) {
            results.push(info);
            continue;
        }
        let child_parent = if is_required { parent } else { Some(current.as_slice()) };
        if let Some(one) = &resolved.one_of {
            results.extend(one_of_constraints(one, &flag, &current, child_parent, depth + 1));
            continue;
        }
        if let Some(all) = &resolved.all_of {
            let merged = flatten_all_of(all);
            if let Some(one) = &merged.one_of {
                results.extend(one_of_constraints(one, &flag, &current, child_parent, depth + 1));
                continue;
            }
        }
        if resolved.is_object() || resolved.all_of.is_some() {
            let nested = resolved.flattened();
            if nested.map {
                results.push(
                    leaf_param(
                        &nested,
                        prop,
                        flag,
                        current.clone(),
                        is_required,
                        parent.map(<[String]>::to_vec),
                    )
                    .unwrap(),
                );
            } else {
                results.extend(properties_from_schema(
                    &nested,
                    &flag,
                    &current,
                    &nested.required,
                    child_parent,
                    depth + 1,
                ));
            }
        } else if let Some(info) = leaf_param(
            &resolved,
            prop,
            flag,
            current.clone(),
            is_required,
            parent.map(<[String]>::to_vec),
        ) {
            results.push(info);
        }
    }
    results
}

fn has_property(schema: &Rc<Schema<'_>>, path: &[String]) -> bool {
    if path.is_empty() {
        return true;
    }
    let resolved = resolve(schema).flattened();
    if let Some(one) = &resolved.one_of {
        return one.iter().any(|v| has_property(v, path));
    }
    resolved
        .properties()
        .iter()
        .find(|p| p.name == path[0])
        .is_some_and(|p| has_property(&p.schema, &path[1..]))
}

fn required_property(schema: &Rc<Schema<'_>>, path: &[String], trigger: &[String]) -> bool {
    let resolved = resolve(schema).flattened();
    if let Some(one) = &resolved.one_of {
        let variants: Vec<_> = one.iter().filter(|v| has_property(v, trigger)).collect();
        return !variants.is_empty() && variants.iter().all(|v| required_property(v, path, trigger));
    }
    let Some((name, rest)) = path.split_first() else {
        return false;
    };
    let Some(prop) = resolved.properties().iter().find(|p| &p.name == name) else {
        return false;
    };
    if !(resolved.required.contains(name) || !rest.is_empty() && trigger.first() == Some(name)) {
        return false;
    }
    rest.is_empty()
        || required_property(
            &prop.schema,
            rest,
            if trigger.first() == Some(name) {
                &trigger[1..]
            } else {
                &[]
            },
        )
}

fn merge_enum_schemas<'f>(a: &Prop<'f>, b: &Prop<'f>) -> Option<Prop<'f>> {
    let ra = resolve(&a.schema);
    let rb = resolve(&b.schema);
    let values = dedup(ra.values.iter().flatten().chain(rb.values.as_ref()?).cloned());
    ra.values.as_ref()?;
    Some(Prop {
        schema: Rc::new(Schema {
            values: Some(values),
            ..(*ra).clone()
        }),
        fern_name: a.fern_name.clone().or_else(|| b.fern_name.clone()),
        ..a.clone()
    })
}

fn deep_merge_objects<'f>(a: &Prop<'f>, b: &Prop<'f>) -> Option<Prop<'f>> {
    let ra = resolve(&a.schema).flattened();
    let rb = resolve(&b.schema).flattened();
    if !ra.is_object() || !rb.is_object() {
        return None;
    }
    let mut props = ra.properties().to_vec();
    for pb in rb.properties() {
        match props.iter().position(|p| p.name == pb.name) {
            None => props.push(pb.clone()),
            Some(i) => {
                if let Some(merged) = deep_merge_objects(&props[i], pb).or_else(|| merge_enum_schemas(&props[i], pb)) {
                    props[i] = merged;
                }
            }
        }
    }
    let required = rb
        .required
        .iter()
        .filter(|r| ra.required.contains(r))
        .cloned()
        .collect();
    Some(Prop {
        name: a.name.clone(),
        schema: Rc::new(Schema::object(props, required)),
        description: a.description.clone(),
        default: None,
        read_only: false,
        sensitive: false,
        fern_name: a.fern_name.clone().or_else(|| b.fern_name.clone()),
    })
}

fn one_of_constraints(
    variants: &[Rc<Schema<'_>>],
    prefix: &str,
    path: &[String],
    parent: Option<&[String]>,
    depth: usize,
) -> Vec<BodyParamInfo> {
    if depth > 3 {
        return Vec::new();
    }
    let variants: Vec<_> = variants.iter().map(|v| resolve(v).flattened()).collect();
    let common = match variants.split_first() {
        Some((first, rest)) => rest.iter().fold(dedup(first.required.clone()), |c, v| {
            c.into_iter().filter(|n| v.required.contains(n)).collect()
        }),
        None => Vec::new(),
    };
    let mut props: Vec<Prop> = Vec::new();
    for prop in variants.iter().flat_map(|v| v.properties()) {
        match props.iter().position(|p| p.name == prop.name) {
            None => props.push(prop.clone()),
            Some(i) => {
                if let Some(merged) =
                    deep_merge_objects(&props[i], prop).or_else(|| merge_enum_schemas(&props[i], prop))
                {
                    props[i] = merged;
                }
            }
        }
    }
    let merged = Schema::object(props, common.clone());
    let mut params = properties_from_schema(&merged, prefix, path, &common, parent, depth);
    for param in &mut params {
        param.required = variants
            .iter()
            .all(|v| required_property(v, &param.api_field_path[path.len()..], &[]));
    }
    let infer_conflicts = variants.iter().any(|v| !v.required.is_empty());
    let others = params.clone();
    for param in &mut params {
        let containing: Vec<_> = variants
            .iter()
            .filter(|v| has_property(v, &param.api_field_path[path.len()..]))
            .collect();
        if containing.is_empty() {
            continue;
        }
        for other in &others {
            if other.name == param.name {
                continue;
            }
            if infer_conflicts
                && !containing
                    .iter()
                    .any(|v| has_property(v, &other.api_field_path[path.len()..]))
            {
                add_all(&mut param.conflicts, std::slice::from_ref(&other.name));
            } else if !other.required
                && containing.iter().all(|v| {
                    required_property(
                        v,
                        &other.api_field_path[path.len()..],
                        &param.api_field_path[path.len()..],
                    )
                })
            {
                add_all(&mut param.implies, std::slice::from_ref(&other.name));
            }
        }
    }
    params
}

/// Adds `items` to `list`, creating it, without repeats.
fn add_all(list: &mut Option<Vec<String>>, items: &[String]) {
    let existing = list.take().unwrap_or_default();
    *list = Some(dedup(existing.into_iter().chain(items.iter().cloned())));
}

/// `extractBodyProperties`: the flags of a JSON body of type `ty`.
pub fn body_properties(ty: Type<'_>) -> Vec<BodyParamInfo> {
    let resolved = resolve(&view(ty)).flattened();
    if let (Some(one), None) = (&resolved.one_of, &resolved.properties) {
        return one_of_constraints(one, "", &[], None, 0);
    }
    let mut results = Vec::new();
    for raw in resolved.properties() {
        if raw.read_only {
            continue;
        }
        let prop = resolve(&raw.schema);
        let prefix = flag_segment(raw);
        let path = vec![raw.name.clone()];
        let required = resolved.required.contains(&raw.name);
        if let Some(info) = scalar_property(&prop, raw, prefix.clone(), path.clone(), required, None) {
            results.push(info);
            continue;
        }
        let parent = if required { None } else { Some(path.as_slice()) };
        if let Some(one) = &prop.one_of {
            results.extend(one_of_constraints(one, &prefix, &path, parent, 1));
            continue;
        }
        if let Some(all) = &prop.all_of {
            let merged = flatten_all_of(all);
            if merged.map {
                results.push(leaf_param(&merged, raw, prefix, path, required, None).unwrap());
                continue;
            }
            match &merged.one_of {
                Some(one) => results.extend(one_of_constraints(one, &prefix, &path, parent, 1)),
                None => results.extend(properties_from_schema(
                    &merged,
                    &prefix,
                    &path,
                    &merged.required,
                    parent,
                    1,
                )),
            }
            continue;
        }
        if prop.map {
            results.push(leaf_param(&prop, raw, prefix, path, required, None).unwrap());
            continue;
        }
        if prop.is_object() {
            results.extend(properties_from_schema(&prop, &prefix, &path, &prop.required, parent, 1));
            continue;
        }
        if let Some(info) = leaf_param(&prop, raw, prefix, path, required, None) {
            results.push(info);
        }
    }
    results
}

/// The discriminator of a JSON body that is a discriminated union of type
/// `ty`, and what each of its variants requires.
pub fn discriminator(ty: Type<'_>) -> Option<BodyDiscriminator> {
    let Type::Union(union) = unwrap_null(ty) else {
        return None;
    };
    let disc = union.discriminator()?;
    let field = disc.wire_name();
    if field.is_empty() {
        return None;
    }
    let mut requireds: Vec<(String, Vec<String>)> = Vec::new();
    for member in union.members() {
        let Type::Object(object) = deref(member) else {
            continue;
        };
        if object.fields().len() == 0 {
            continue;
        }
        // The one value of the property's enum, or else the value the
        // mapping gives the variant.
        let mut value = object.fields().find(|f| f.wire_name() == field).and_then(|property| {
            match unwrap_null(deref(property.ty())) {
                Type::Enum(values) => match values.values().collect::<Vec<_>>()[..] {
                    [EnumValue::String(s)] => Some(s.to_owned()),
                    _ => None,
                },
                _ => None,
            }
        });
        if value.is_none()
            && let Type::Model(model) = member
        {
            value = disc
                .cases()
                .find(|&(v, case)| matches!(case, Type::Model(m) if m == model) && v != model.schema_name())
                .map(|(v, _)| v.to_owned());
        }
        let Some(value) = value else {
            continue;
        };
        let required = object
            .fields()
            .filter(|f| f.is_required())
            .map(|f| f.wire_name().to_owned())
            .collect();
        requireds.push((value, required));
    }
    let (first, rest) = requireds.split_first()?;
    let common = rest.iter().fold(dedup(first.1.clone()), |common, (_, required)| {
        dedup(required.iter().filter(|r| common.contains(r)).cloned())
    });
    // The variants are keyed by value, so a later variant with the same
    // value replaces an earlier one in place.
    let mut variants: Vec<(String, Vec<String>)> = Vec::new();
    for (value, required) in &requireds {
        let specific = required.iter().filter(|r| !common.contains(r)).cloned().collect();
        match variants.iter_mut().find(|(v, _)| v == value) {
            Some(variant) => variant.1 = specific,
            None => variants.push((value.clone(), specific)),
        }
    }
    // `Object.entries` puts array indices first.
    let (mut indices, rest): (Vec<_>, Vec<_>) = variants.into_iter().partition(|(v, _)| is_array_index(v));
    indices.sort_by_key(|(v, _)| v.parse::<u32>().expect("an array index is a number"));
    indices.extend(rest);
    Some(BodyDiscriminator {
        field: field.to_owned(),
        variants: indices,
    })
}
