/**
 * Flattens a JSON request body into flags.
 *
 * A port of `extractBodyProperties` from `@cloudflare/forge`'s
 * `openapi-resolver.ts` and the functions it calls. They read raw schemas,
 * and merged them into new ones, so they read forge's types through
 * `Schema`: a view of a type that answers what they asked of a schema, such
 * as its `type`, `properties` or `oneOf`, and that merged schemas can be
 * built as. Their rules are kept as they were, quirks included, since every
 * flag of the CLI follows from them: nested objects stop four levels down,
 * and a union's members conflict with each other.
 *
 * Some of what they read is not in forge's model, and is read as near as it
 * can be: an exclusive union is read as a `oneOf`, and one that is not as an
 * `anyOf`, which the resolver left alone; an intersection as an `allOf`,
 * though properties next to a `oneOf` make one too; an enum's `type` from
 * its values; and a union with null as the schema without `nullable`.
 *
 * Schemas and properties are never changed once made: merging makes new
 * ones.
 */

import {
	dedup,
	isArrayIndex,
	kebab,
	last,
	pushUnique,
	setEntry,
	type Value,
} from "./js.js";
import {
	type BodyDiscriminator,
	type BodyParamInfo,
	deref,
	enumType,
	nonNullMembers,
	referencedDescription,
	renamed,
	unwrapNull,
} from "./operation.js";
import type { Model, Type } from "@cloudflare/forge/plugin";

/** The JSON `type` of a schema. */
type Kind = "string" | "number" | "boolean" | "array" | "object";

/** A schema, as the resolver read it: a type of forge, one level at a time. */
interface Schema {
	/** The model a `$ref` points to, for a schema that is one, which `resolve` follows. */
	readonly reference?: Model;
	readonly kind?: Kind;
	readonly map?: boolean;
	/** The properties, when the schema has `properties`. */
	readonly properties?: readonly Prop[];
	readonly required: readonly string[];
	/** The members of an exclusive union, from `oneOf`. */
	readonly oneOf?: readonly Schema[];
	/**
	 * The members of a union that is not exclusive, from `anyOf`, which gives
	 * no flags. It is only read to tell whether its values are objects, which
	 * the resolver read from the `type: object` that forge leaves out next to
	 * `anyOf`.
	 */
	readonly anyOf?: readonly Schema[];
	/** The members of an intersection, from `allOf`, or `properties` next to a `oneOf`. */
	readonly allOf?: readonly Schema[];
	/** The values of an `enum`. */
	readonly values?: readonly (string | number | boolean)[];
	readonly items?: Schema;
}

/** A property of a schema, with what the resolver read of the property's own schema. */
interface Prop {
	/** The wire name. */
	readonly name: string;
	readonly schema: Schema;
	readonly description?: string;
	readonly default?: Value;
	readonly readOnly: boolean;
	readonly sensitive: boolean;
	/** The kebab-case name `x-fern-property-name` gives the property. */
	readonly fernName?: string;
}

/** The view of each type, which is the same each time it is read. */
const views = new WeakMap<Type, Schema>();

/**
 * The view of `type`. A model is a `$ref` to it, which is read only when it
 * is resolved, so that recursive models are not read forever.
 */
function view(type: Type): Schema {
	let schema = views.get(type);
	if (schema === undefined) {
		schema = makeView(type);
		views.set(type, schema);
	}
	return schema;
}

function makeView(type: Type): Schema {
	switch (type.kind) {
		case "model":
			return { reference: type.model, required: [] };
		case "scalar": {
			let kind: Kind | undefined;
			switch (type.scalar) {
				case "string":
				case "date":
				case "date-time":
				case "bytes":
				case "binary":
					kind = "string";
					break;
				case "number":
					kind = "number";
					break;
				case "boolean":
					kind = "boolean";
					break;
				default:
					kind = undefined;
			}
			return { kind, required: [] };
		}
		case "enum": {
			const t = enumType(type);
			return {
				kind:
					t === "string" || t === "number" || t === "boolean" ? t : undefined,
				values: type.values,
				required: [],
			};
		}
		case "array":
			return { kind: "array", items: view(type.elem), required: [] };
		case "object":
			return {
				kind: "object",
				map: type.fields.length === 0 && type.extra !== undefined,
				properties: type.fields.map((f) => {
					const d = f.default;
					return {
						name: f.wireName,
						schema: view(f.type),
						description:
							f.description.trim() === ""
								? referencedDescription(f.type, 0)
								: f.description,
						default:
							typeof d === "string" ||
							typeof d === "number" ||
							typeof d === "boolean"
								? d
								: undefined,
						readOnly: f.readOnly,
						sensitive: f.sensitive,
						fernName: renamed(f),
					};
				}),
				required: type.fields.filter((f) => f.required).map((f) => f.wireName),
			};
		case "union": {
			// A nullable schema is a union with null, which the resolver did
			// not see. It left `anyOf` alone.
			const members = nonNullMembers(type);
			if (members.length === 1) {
				return view(members[0] as Type);
			}
			if (!type.exclusive) {
				return { anyOf: members.map(view), required: [] };
			}
			return { oneOf: members.map(view), required: [] };
		}
		case "intersection":
			return { allOf: type.members.map(view), required: [] };
	}
}

/**
 * `resolveSchemaRef`: follows a `$ref`.
 *
 * The resolver followed one level, but a model that is another model in
 * forge is mostly a union or intersection of one member, which it saw
 * through, so every level is followed.
 */
function resolve(schema: Schema): Schema {
	return schema.reference ? view(deref(schema.reference.type)) : schema;
}

function isObjectKind(schema: Schema): boolean {
	return schema.kind === "object" || schema.properties !== undefined;
}

/** Preserve scalar constraints when an intersection adds metadata to an enum. */
function scalarSchema(schema: Schema, depth = 0): Schema | undefined {
	if (depth > 20) {
		return undefined;
	}
	const resolved = resolve(schema);
	if (resolved.allOf !== undefined) {
		const members = resolved.allOf.map((s) => scalarSchema(s, depth + 1));
		const first = members[0];
		if (
			first === undefined ||
			members.some((s) => s === undefined || s.kind !== first.kind)
		) {
			return undefined;
		}
		let values: Schema["values"];
		for (const member of members) {
			if (member?.values !== undefined) {
				values =
					values === undefined
						? member.values
						: values.filter((value) => member.values?.includes(value));
			}
		}
		return { kind: first.kind, values, required: [] };
	}
	return resolved.kind === "string" ||
		resolved.kind === "number" ||
		resolved.kind === "boolean"
		? resolved
		: undefined;
}

/** Extract scalar flags before traversing object compositions. */
function scalarProperty(
	schema: Schema,
	prop: Prop,
	flag: string,
	path: string[],
	required: boolean
): BodyParamInfo | undefined {
	const scalar = scalarSchema(schema);
	if (scalar !== undefined)
		return scalarBodyParam(scalar, prop, flag, path, required);
	const variants = schema.oneOf ?? schema.anyOf;
	if (variants === undefined || variants.length === 0) return undefined;
	const members = variants.map((variant) => scalarSchema(variant));
	if (!members.every((member): member is Schema => member !== undefined))
		return undefined;
	const first = members[0];
	if (
		first !== undefined &&
		members.every((member) => member.kind === first.kind)
	) {
		const values = members.every((member) => member.values !== undefined)
			? dedup(members.flatMap((member) => member.values ?? []))
			: undefined;
		return scalarBodyParam(
			{ kind: first.kind, values, required: [] },
			prop,
			flag,
			path,
			required
		);
	}
	return {
		name: flag,
		required,
		type: "scalarUnion",
		apiFieldPath: path,
		description: prop.description,
		sensitive: prop.sensitive,
	};
}

/** `flattenAllOf`: merges the properties and requirements of `schemas`. */
function flattenAllOf(schemas: readonly Schema[]): Schema {
	const properties: Prop[] = [];
	const required: string[] = [];
	let oneOf: readonly Schema[] | undefined;
	let map = false;
	const insert = (prop: Prop) => {
		const i = properties.findIndex((p) => p.name === prop.name);
		if (i >= 0) {
			properties[i] = prop;
		} else {
			properties.push(prop);
		}
	};
	for (const s of schemas) {
		const resolved = resolve(s);
		map ||= resolved.map === true;
		for (const prop of resolved.properties ?? []) {
			insert(prop);
		}
		required.push(...resolved.required);
		if (oneOf === undefined) {
			oneOf = resolved.oneOf;
		}
		if (resolved.allOf !== undefined) {
			const nested = flattenAllOf(resolved.allOf);
			map ||= nested.map === true;
			for (const prop of nested.properties ?? []) {
				insert(prop);
			}
			required.push(...nested.required);
			if (oneOf === undefined) {
				oneOf = nested.oneOf;
			}
		}
	}
	return {
		kind: "object",
		map: map && properties.length === 0,
		properties,
		required: dedup(required),
		oneOf,
	};
}

function isObjectValued(schema: Schema, active: readonly Model[]): boolean {
	const m = schema.reference;
	if (m) {
		if (active.includes(m)) {
			return false;
		}
		return isObjectValued(view(m.type), [...active, m]);
	}
	if (isObjectKind(schema)) {
		return true;
	}
	const union = schema.oneOf ?? schema.anyOf;
	if (union !== undefined && union.length > 0) {
		return union.every((s) => isObjectValued(s, active));
	}
	if (schema.allOf !== undefined && schema.allOf.length > 0) {
		return schema.allOf.some((s) => isObjectValued(s, active));
	}
	return false;
}

function arrayBodyParam(
	array: Schema,
	prop: Prop,
	name: string,
	path: string[],
	required: boolean
): BodyParamInfo | undefined {
	const items = array.items;
	if (!items) {
		return undefined;
	}
	const resolvedItems = resolve(items);
	const scalar =
		resolvedItems.kind === "string" || resolvedItems.kind === "number";
	const objects = path.length === 1 && isObjectValued(items, []);
	if (!scalar && !objects) {
		return undefined;
	}
	const info: BodyParamInfo = {
		name,
		required,
		type: "array",
		apiFieldPath: path,
		sensitive: false,
	};
	if (objects) {
		info.itemType = "object";
	}
	info.description = prop.description;
	info.sensitive = prop.sensitive;
	return info;
}

function mapBodyParam(
	prop: Prop,
	name: string,
	path: string[],
	required: boolean
): BodyParamInfo {
	return {
		name,
		required,
		type: "object",
		apiFieldPath: path,
		description: prop.description,
		sensitive: prop.sensitive,
	};
}

function scalarBodyParam(
	resolved: Schema,
	prop: Prop,
	name: string,
	path: string[],
	required: boolean
): BodyParamInfo {
	return {
		name,
		required,
		type:
			resolved.kind === "number"
				? "number"
				: resolved.kind === "boolean"
					? "boolean"
					: "string",
		apiFieldPath: path,
		description: prop.description,
		enumValues: resolved.values?.filter(
			(v): v is string => typeof v === "string" && v !== ""
		),
		default: prop.default,
		sensitive: prop.sensitive,
	};
}

/**
 * The flag segment of a body property: the name `x-fern-property-name`
 * gives it, or else its wire name, kebab-cased with forge's `toKebabCase`.
 */
function flagSegment(prop: Prop): string {
	return prop.fernName ?? kebab(prop.name);
}

const UNFLAGGABLE = /[/~.[\]{}()]/;

/**
 * `extractPropertiesFromSchema`: flattens the properties of `schema` into
 * flags named after `prefix`.
 */
function propertiesFromSchema(
	schema: Schema,
	prefix: string,
	path: readonly string[],
	required: readonly string[],
	depth: number
): BodyParamInfo[] {
	if (depth > 3) {
		return [];
	}
	const results: BodyParamInfo[] = [];
	if (schema.properties === undefined) {
		return results;
	}
	for (const prop of schema.properties) {
		const resolved = resolve(prop.schema);
		if (prop.readOnly) {
			continue;
		}
		const name = prop.name;
		if (UNFLAGGABLE.test(name)) {
			continue;
		}
		const segment = flagSegment(prop);
		const flag = prefix === "" ? segment : `${prefix}-${segment}`;
		const current = [...path, name];
		const isRequired = required.includes(name);
		const scalar = scalarProperty(resolved, prop, flag, current, isRequired);
		if (scalar !== undefined) {
			results.push(scalar);
			continue;
		}
		if (resolved.oneOf !== undefined) {
			results.push(
				...oneOfConstraints(resolved.oneOf, flag, current, depth + 1)
			);
			continue;
		}
		if (resolved.allOf !== undefined) {
			const merged = flattenAllOf(resolved.allOf);
			if (merged.oneOf !== undefined) {
				results.push(
					...oneOfConstraints(merged.oneOf, flag, current, depth + 1)
				);
				continue;
			}
		}
		if (isObjectKind(resolved) || resolved.allOf !== undefined) {
			const nested =
				resolved.allOf !== undefined ? flattenAllOf(resolved.allOf) : resolved;
			if (nested.map) {
				results.push(mapBodyParam(prop, flag, current, isRequired));
				continue;
			}
			results.push(
				...propertiesFromSchema(
					nested,
					flag,
					current,
					nested.required,
					depth + 1
				)
			);
		} else if (
			resolved.kind === "string" ||
			resolved.kind === "number" ||
			resolved.kind === "boolean"
		) {
			results.push(scalarBodyParam(resolved, prop, flag, current, isRequired));
		} else if (resolved.kind === "array" && resolved.items !== undefined) {
			const info = arrayBodyParam(resolved, prop, flag, current, isRequired);
			if (info) {
				results.push(info);
			}
		}
	}
	return results;
}

function variantPropNames(schema: Schema, depth: number): string[] {
	const names: string[] = [];
	if (depth > 3 || schema.properties === undefined) {
		return names;
	}
	for (const prop of schema.properties) {
		pushUnique(names, prop.name);
		let resolved = resolve(prop.schema);
		if (resolved.allOf !== undefined) {
			resolved = flattenAllOf(resolved.allOf);
		}
		if (isObjectKind(resolved)) {
			for (const deep of variantPropNames(resolved, depth + 1)) {
				pushUnique(names, deep);
			}
		}
	}
	return names;
}

function mergeEnumSchemas(a: Prop, b: Prop): Prop | undefined {
	const ra = resolve(a.schema);
	const rb = resolve(b.schema);
	if (ra.values === undefined || rb.values === undefined) {
		return undefined;
	}
	const values = dedup([...ra.values, ...rb.values]);
	return {
		...a,
		schema: { ...ra, values },
		fernName: a.fernName ?? b.fernName,
	};
}

function deepMergeObjects(a: Prop, b: Prop): Prop | undefined {
	let ra = resolve(a.schema);
	let rb = resolve(b.schema);
	if (ra.allOf !== undefined) {
		ra = flattenAllOf(ra.allOf);
	}
	if (rb.allOf !== undefined) {
		rb = flattenAllOf(rb.allOf);
	}
	if (!isObjectKind(ra) || !isObjectKind(rb)) {
		return undefined;
	}
	const props: Prop[] = [...(ra.properties ?? [])];
	for (const pb of rb.properties ?? []) {
		const i = props.findIndex((p) => p.name === pb.name);
		if (i < 0) {
			props.push(pb);
		} else {
			const pa = props[i] as Prop;
			const merged = deepMergeObjects(pa, pb) ?? mergeEnumSchemas(pa, pb);
			if (merged) {
				props[i] = merged;
			}
		}
	}
	const required = rb.required.filter((r) => ra.required.includes(r));
	return {
		name: a.name,
		schema: { kind: "object", properties: props, required },
		description: a.description,
		default: undefined,
		readOnly: false,
		sensitive: false,
		fernName: a.fernName ?? b.fernName,
	};
}

/**
 * `deriveOneOfConstraints`: the flags of a union, with the flags unique to
 * one variant conflicting with those unique to another.
 */
function oneOfConstraints(
	variants: readonly Schema[],
	prefix: string,
	path: readonly string[],
	depth: number
): BodyParamInfo[] {
	if (depth > 3) {
		return [];
	}
	const resolvedVariants = variants.map((variant) => {
		let resolved = resolve(variant);
		if (resolved.allOf !== undefined) {
			resolved = flattenAllOf(resolved.allOf);
		}
		return {
			schema: resolved,
			props: variantPropNames(resolved, 0),
			required: dedup(resolved.required),
		};
	});
	let commonOrNone: string[] | undefined;
	for (const v of resolvedVariants) {
		commonOrNone =
			commonOrNone === undefined
				? [...v.required]
				: commonOrNone.filter((n) => v.required.includes(n));
	}
	const common = commonOrNone ?? [];
	const mergedProps: Prop[] = [];
	for (const v of resolvedVariants) {
		for (const prop of v.schema.properties ?? []) {
			const i = mergedProps.findIndex((p) => p.name === prop.name);
			if (i < 0) {
				mergedProps.push(prop);
			} else {
				const existing = mergedProps[i] as Prop;
				const merged =
					deepMergeObjects(existing, prop) ?? mergeEnumSchemas(existing, prop);
				if (merged) {
					mergedProps[i] = merged;
				}
			}
		}
	}
	const mergedSchema: Schema = {
		kind: "object",
		properties: mergedProps,
		required: common,
	};
	const params = propertiesFromSchema(
		mergedSchema,
		prefix,
		path,
		common,
		depth
	);

	// The last segment of each flag's API path, to the flag's name. A later
	// flag with the same segment replaces an earlier one.
	const propToFlag: [string, string][] = [];
	for (const p of params) {
		const tail = last(p.apiFieldPath);
		if (tail !== undefined && tail !== "") {
			setEntry(propToFlag, tail, p.name);
		}
	}
	const flagOf = (n: string) => propToFlag.find(([k]) => k === n)?.[1];
	const flags = (names: readonly string[]) =>
		names.map(flagOf).filter((f): f is string => f !== undefined && f !== "");

	for (let i = 0; i < resolvedVariants.length; i++) {
		for (let j = i + 1; j < resolvedVariants.length; j++) {
			const vi = resolvedVariants[i] as (typeof resolvedVariants)[number];
			const vj = resolvedVariants[j] as (typeof resolvedVariants)[number];
			const uniqueI = vi.props.filter((n) => !vj.props.includes(n));
			const uniqueJ = vj.props.filter((n) => !vi.props.includes(n));
			if (uniqueI.length === 0 || uniqueJ.length === 0) {
				continue;
			}
			const flagsI = flags(uniqueI);
			const flagsJ = flags(uniqueJ);
			for (const param of params) {
				const tail = last(param.apiFieldPath);
				if (tail === undefined || tail === "") {
					continue;
				}
				if (uniqueI.includes(tail)) {
					param.conflicts = dedup([...(param.conflicts ?? []), ...flagsJ]);
				}
				if (uniqueJ.includes(tail)) {
					param.conflicts = dedup([...(param.conflicts ?? []), ...flagsI]);
				}
			}
		}
	}

	const specificCount: [string, number][] = [];
	for (const v of resolvedVariants) {
		for (const name of v.required) {
			if (common.includes(name)) {
				continue;
			}
			const entry = specificCount.find(([k]) => k === name);
			if (entry) {
				entry[1]++;
			} else {
				specificCount.push([name, 1]);
			}
		}
	}
	for (const v of resolvedVariants) {
		const specific = v.required.filter((n) => !common.includes(n));
		if (specific.length <= 1) {
			continue;
		}
		for (const prop of specific) {
			if ((specificCount.find(([k]) => k === prop)?.[1] ?? 0) > 1) {
				continue;
			}
			const flag = flagOf(prop);
			if (flag === undefined || flag === "") {
				continue;
			}
			const param = params.find((p) => p.name === flag);
			if (!param) {
				continue;
			}
			const others = flags(specific.filter((n) => n !== prop));
			if (others.length > 0) {
				param.implies = dedup([...(param.implies ?? []), ...others]);
			}
		}
	}
	return params;
}

/** `extractBodyProperties`: the flags of a JSON body of type `type`. */
export function bodyProperties(type: Type): BodyParamInfo[] {
	let resolved = resolve(view(type));
	if (resolved.allOf !== undefined) {
		resolved = flattenAllOf(resolved.allOf);
	}
	if (resolved.oneOf !== undefined && resolved.properties === undefined) {
		return oneOfConstraints(resolved.oneOf, "", [], 0);
	}
	const required = resolved.required;
	const results: BodyParamInfo[] = [];
	for (const raw of resolved.properties ?? []) {
		const prop = resolve(raw.schema);
		if (raw.readOnly) {
			continue;
		}
		const prefix = flagSegment(raw);
		const path = [raw.name];
		const isRequired = required.includes(raw.name);
		const scalar = scalarProperty(prop, raw, prefix, path, isRequired);
		if (scalar !== undefined) {
			results.push(scalar);
			continue;
		}
		if (prop.oneOf !== undefined) {
			results.push(...oneOfConstraints(prop.oneOf, prefix, path, 1));
			continue;
		}
		if (prop.allOf !== undefined) {
			const merged = flattenAllOf(prop.allOf);
			if (merged.map) {
				results.push(mapBodyParam(raw, prefix, path, isRequired));
				continue;
			}
			if (merged.oneOf !== undefined) {
				results.push(...oneOfConstraints(merged.oneOf, prefix, path, 1));
			} else {
				results.push(
					...propertiesFromSchema(merged, prefix, path, merged.required, 1)
				);
			}
			continue;
		}
		if (prop.map) {
			results.push(mapBodyParam(raw, prefix, path, isRequired));
			continue;
		}
		if (isObjectKind(prop)) {
			results.push(
				...propertiesFromSchema(prop, prefix, path, prop.required, 1)
			);
			continue;
		}
		if (
			prop.kind === "string" ||
			prop.kind === "number" ||
			prop.kind === "boolean"
		) {
			results.push(scalarBodyParam(prop, raw, prefix, path, isRequired));
		} else if (prop.kind === "array" && prop.items !== undefined) {
			const info = arrayBodyParam(prop, raw, prefix, path, isRequired);
			if (info) {
				results.push(info);
			}
		}
	}
	return results;
}

/**
 * The properties a JSON body of type `type` requires: those its object, and
 * the objects it is an intersection of, list as required.
 */
export function requiredNames(type: Type): string[] {
	const required: string[] = [];
	const collect = (t: Type, depth: number) => {
		if (depth > 32) {
			return;
		}
		const u = unwrapNull(deref(t));
		if (u.kind === "object") {
			for (const field of u.fields) {
				if (field.required) {
					pushUnique(required, field.wireName);
				}
			}
		} else if (u.kind === "intersection") {
			for (const member of u.members) {
				collect(member, depth + 1);
			}
		}
	};
	collect(type, 0);
	return required;
}

/**
 * The discriminator of a JSON body that is a discriminated union of type
 * `type`, and what each of its variants requires.
 */
export function discriminator(type: Type): BodyDiscriminator | undefined {
	const union = unwrapNull(type);
	if (union.kind !== "union") {
		return undefined;
	}
	const disc = union.discriminator;
	if (!disc) {
		return undefined;
	}
	const field = disc.wireName;
	if (field === "") {
		return undefined;
	}
	const requireds: [string, string[]][] = [];
	for (const member of union.members) {
		const variant = deref(member);
		if (variant.kind !== "object" || variant.fields.length === 0) {
			continue;
		}
		const property = variant.fields.find((f) => f.wireName === field);
		// The one value of the property's enum, or else the value the mapping
		// gives the variant.
		let value: string | undefined;
		if (property) {
			const t = unwrapNull(deref(property.type));
			if (
				t.kind === "enum" &&
				t.values.length === 1 &&
				typeof t.values[0] === "string"
			) {
				value = t.values[0];
			}
		}
		if (value === undefined && member.kind === "model") {
			const model = member.model;
			value = disc.cases.find(
				([v, c]) =>
					c.kind === "model" && c.model === model && v !== model.schemaName
			)?.[0];
		}
		if (value === undefined) {
			continue;
		}
		const required = variant.fields
			.filter((f) => f.required)
			.map((f) => f.wireName);
		requireds.push([value, required]);
	}
	if (requireds.length === 0) {
		return undefined;
	}
	let commonOrNone: string[] | undefined;
	for (const [, required] of requireds) {
		commonOrNone =
			commonOrNone === undefined
				? dedup(required)
				: dedup(required.filter((r) => (commonOrNone as string[]).includes(r)));
	}
	const common = commonOrNone ?? [];
	// The variants are keyed by value, so a later variant with the same value
	// replaces an earlier one in place.
	const variants: [string, string[]][] = [];
	for (const [value, required] of requireds) {
		setEntry(
			variants,
			value,
			required.filter((r) => !common.includes(r))
		);
	}
	// `Object.entries` puts array indices first.
	const indices = variants
		.filter(([v]) => isArrayIndex(v))
		.sort(([a], [b]) => Number(a) - Number(b));
	const rest = variants.filter(([v]) => !isArrayIndex(v));
	return { field, variants: [...indices, ...rest] };
}
