/**
 * JSON Schema → CLI flags.
 *
 * For endpoints whose request body can't be described in the OpenAPI spec
 * because its real shape depends on a value the caller supplies — the
 * model for `POST /ai/run/{model_name}` — the schema is fetched at run
 * time and turned into flags here. This module knows about JSON Schema,
 * not about any product: which endpoint to fetch and how to derive its
 * key stays with the command (see AGENTS.md "Critical Invariants").
 *
 * Nested objects flatten into the kebab-joined flags the generator
 * already emits for documented bodies, so `contacts.registrant.email` is
 * `--contacts-registrant-email` whether the schema came from the spec or
 * from a runtime lookup. Arrays stay whole: their nesting is per-element
 * and repeats, which a flag name can't express.
 */
import { isDeepStrictEqual } from "node:util";
import { setNestedValue } from "./body-parser.js";
import { resolveFileToken } from "./input-validation.js";
import { sanitizeTerminalText } from "./ui/sanitize.js";
import { theme } from "./ui/theme.js";

export { sanitizeTerminalText } from "./ui/sanitize.js";

/** The subset of JSON Schema these endpoints use. */
export interface JsonSchema {
	type?: string | string[];
	title?: string;
	description?: string;
	properties?: Record<string, JsonSchema>;
	required?: string[];
	additionalProperties?: boolean | JsonSchema;
	items?: JsonSchema | JsonSchema[];
	enum?: unknown[];
	const?: unknown;
	default?: unknown;
	oneOf?: JsonSchema[];
	anyOf?: JsonSchema[];
	allOf?: JsonSchema[];
	if?: JsonSchema;
	then?: JsonSchema;
	pattern?: string;
	minLength?: number;
	maxLength?: number;
	minimum?: number;
	maximum?: number;
	exclusiveMinimum?: number | boolean;
	exclusiveMaximum?: number | boolean;
	multipleOf?: number;
	minItems?: number;
	maxItems?: number;
	uniqueItems?: boolean;
	minProperties?: number;
	maxProperties?: number;
}

const SUPPORTED_SCHEMA_KEYS = new Set([
	"$comment",
	"$defs",
	"$id",
	"$schema",
	"additionalProperties",
	"allOf",
	"anyOf",
	"const",
	"default",
	"definitions",
	"deprecated",
	"description",
	"discriminator",
	"enum",
	"example",
	"examples",
	"exclusiveMaximum",
	"exclusiveMinimum",
	"externalDocs",
	"if",
	"items",
	"maxItems",
	"maxLength",
	"maxProperties",
	"maximum",
	"minItems",
	"minLength",
	"minProperties",
	"minimum",
	"multipleOf",
	"oneOf",
	"pattern",
	"properties",
	"readOnly",
	"required",
	"then",
	"title",
	"type",
	"uniqueItems",
	"writeOnly",
	"xml",
]);

function schemaChildren(schema: JsonSchema): JsonSchema[] {
	const additionalProperties =
		schema.additionalProperties !== undefined &&
		typeof schema.additionalProperties === "object"
			? [schema.additionalProperties]
			: [];
	const items =
		schema.items === undefined
			? []
			: Array.isArray(schema.items)
				? schema.items
				: [schema.items];
	return [
		...Object.values(schema.properties ?? {}),
		...additionalProperties,
		...items,
		...(schema.oneOf ?? []),
		...(schema.anyOf ?? []),
		...(schema.allOf ?? []),
		...(schema.if ? [schema.if] : []),
		...(schema.then ? [schema.then] : []),
	];
}

function isFullySupportedJsonSchemaInner(
	schema: JsonSchema,
	seen: WeakSet<object>
): boolean {
	if (seen.has(schema)) {
		return false;
	}
	seen.add(schema);
	const raw = schema as Record<string, unknown>;
	if (raw.nullable === true || raw["x-nullable"] === true) {
		return false;
	}
	const keys = Object.keys(raw);
	return (
		keys.every(
			(key) => SUPPORTED_SCHEMA_KEYS.has(key) || key.startsWith("x-")
		) &&
		schemaChildren(schema).every((child) =>
			isFullySupportedJsonSchemaInner(child, seen)
		)
	);
}

/** Whether complete local validation can safely enforce this schema. */
export function isFullySupportedJsonSchema(schema: JsonSchema): boolean {
	return isFullySupportedJsonSchemaInner(schema, new WeakSet());
}

export type FlagType =
	| "string"
	| "number"
	| "boolean"
	| "array"
	| "object"
	| "json"
	| "string-or-array";

export interface FlagDescriptor {
	/** Flag as typed on the CLI. */
	name: string;
	/** Path to the field in the request body. */
	path: string[];
	type: FlagType;
	required: boolean;
	/** Optional object whose presence makes this field required. */
	requiredWhen?: string[];
	/** First line of the schema's prose. */
	description?: string;
	/** `enum`, stringified for help and comparison. */
	choices?: string[];
	/** Human-readable labels for choices whose wire values are opaque. */
	choiceLabels?: Record<string, string>;
	/**
	 * The field's own schema, kept rather than copied field-by-field: it
	 * stays the authority for `const`, `default` and the bounds.
	 */
	schema: JsonSchema;
	/**
	 * A required object retained alongside its flattened descendants because
	 * none of those descendants is itself required. Passing any descendant
	 * satisfies the container; otherwise callers can pass the object as JSON.
	 */
	requiredContainer?: boolean;
	/** Simple JSON Schema `if`/`then` conditions that require this field. */
	requiredIf?: RequiredIf[];
}

function fieldTitle(field: string): string {
	return field
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.split(/[-_\s]+/)
		.filter(Boolean)
		.map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
		.join(" ");
}

/** A prompt question that always identifies the field as well as its help. */
export function renderPromptQuestion(descriptor: FlagDescriptor): string {
	const field = descriptor.path.at(-1) ?? descriptor.name;
	const title = sanitizeTerminalText(
		descriptor.schema.title?.trim() || fieldTitle(field)
	);
	const detail = descriptor.description
		? sanitizeTerminalText(descriptor.description.trim())
		: undefined;
	if (!detail || detail.toLocaleLowerCase() === title.toLocaleLowerCase()) {
		return title;
	}
	return `${title} — ${detail}`;
}

interface RequiredIf {
	predicates: Array<{
		path: string[];
		values?: unknown[];
	}>;
}

/**
 * Field name → flag segment, matching forge's `toKebabCase` so a
 * runtime-derived flag is indistinguishable from a generated one.
 * Re-implemented because forge is a generate-time dependency and must not
 * enter the runtime bundle.
 */
export function fieldToFlag(field: string): string {
	return field
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/_/g, "-")
		.toLowerCase();
}

const UNSAFE_PROPERTY_SEGMENTS = new Set([
	"__proto__",
	"constructor",
	"prototype",
]);

function isSafePropertyPath(path: readonly string[]): boolean {
	return path.every((segment) => !UNSAFE_PROPERTY_SEGMENTS.has(segment));
}

function ownSchemaProperty(
	properties: Readonly<Record<string, JsonSchema>> | undefined,
	field: string
): JsonSchema | undefined {
	return properties !== undefined && Object.hasOwn(properties, field)
		? properties[field]
		: undefined;
}

function camelCase(name: string): string {
	return name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

/**
 * A schema that says nothing about its value accepts any JSON — the AI
 * `response_format.json_schema` shape. Treating it as a string would put
 * `{"a":1}` on the wire as that literal text.
 */
function constrainsNothing(schema: JsonSchema): boolean {
	return (
		schema.type === undefined &&
		schema.properties === undefined &&
		schema.enum === undefined &&
		schema.const === undefined &&
		schema.oneOf === undefined &&
		schema.anyOf === undefined
	);
}

function schemaValueType(value: unknown): FlagType {
	if (value === null) {
		return "json";
	}
	if (Array.isArray(value)) {
		return "array";
	}
	switch (typeof value) {
		case "boolean":
			return "boolean";
		case "number":
			return "number";
		case "object":
			return "object";
		default:
			return "string";
	}
}

function toFlagType(schema: JsonSchema): FlagType | undefined {
	const variants = variantsOf(schema);
	if (variants.length > 1) {
		const types = new Set(variants.map(toFlagType));
		if (types.size === 2 && types.has("string") && types.has("array")) {
			return "string-or-array";
		}
		if (types.has(undefined)) {
			return undefined;
		}
		return types.size === 1 ? ([...types][0] ?? "json") : "json";
	}
	if (variants[0] !== schema) {
		return toFlagType(variants[0] ?? {});
	}
	if (
		Array.isArray(schema.type) &&
		schema.type.includes("object") &&
		schema.type.some((type) => type !== "object")
	) {
		return "json";
	}
	// Nullable fields arrive as ["string", "null"]; the non-null entry
	// determines coercion.
	const type = Array.isArray(schema.type)
		? schema.type.find((t) => t !== "null")
		: schema.type;
	if (
		type === "null" ||
		(Array.isArray(schema.type) &&
			schema.type.length === 1 &&
			schema.type[0] === "null")
	) {
		return "json";
	}
	if (type === undefined) {
		const values = schema.const !== undefined ? [schema.const] : schema.enum;
		if (values?.length) {
			const types = new Set(values.map(schemaValueType));
			return types.size === 1 ? ([...types][0] ?? "json") : "json";
		}
	}
	if (type === undefined && schema.properties) {
		return "object";
	}
	if (type === undefined && constrainsNothing(schema)) {
		return "json";
	}
	switch (type) {
		case "number":
		case "integer":
			return "number";
		case "boolean":
			return "boolean";
		case "array":
			return "array";
		case "object":
			return "object";
		default:
			return "string";
	}
}

/**
 * There's no way to express "these flags, or those flags" in yargs, so
 * `oneOf` / `anyOf` variants are unioned: a field is offered if any variant
 * accepts it, while branch-specific `required` lists remain optional. The API
 * stays the authority on invalid combinations.
 */
function variantsOf(schema: JsonSchema): JsonSchema[] {
	const variants = schema.oneOf ?? schema.anyOf;
	return variants?.length ? variants : [schema];
}

function intersectTypes(
	left: JsonSchema["type"],
	right: JsonSchema["type"]
): JsonSchema["type"] {
	if (left === undefined) {
		return right;
	}
	if (right === undefined) {
		return left;
	}
	const leftTypes = new Set(Array.isArray(left) ? left : [left]);
	const rightTypes = new Set(Array.isArray(right) ? right : [right]);
	const accepts = (types: Set<string>, candidate: string): boolean =>
		types.has(candidate) || (candidate === "integer" && types.has("number"));
	const types = [
		"array",
		"boolean",
		"integer",
		"null",
		"number",
		"object",
		"string",
	].filter(
		(candidate) =>
			accepts(leftTypes, candidate) && accepts(rightTypes, candidate)
	);
	if (types.includes("number")) {
		types.splice(types.indexOf("integer"), 1);
	}
	return types.length === 1 ? types[0] : types.length > 1 ? types : undefined;
}

function intersectValues(
	left: unknown[] | undefined,
	right: unknown[] | undefined
): unknown[] | undefined {
	if (left === undefined) {
		return right;
	}
	if (right === undefined) {
		return left;
	}
	return left.filter((value) =>
		right.some((candidate) => isDeepStrictEqual(value, candidate))
	);
}

function sharedConjunctiveValue(
	keyword: "const" | "default",
	schemas: readonly JsonSchema[]
): unknown {
	const values = schemas.flatMap((schema): unknown[] => [
		...(schema[keyword] === undefined ? [] : [schema[keyword]]),
		...(schema.allOf ?? []).flatMap((clause) =>
			sharedConjunctiveValues(keyword, clause)
		),
	]);
	const first = values[0];
	return values.length > 0 &&
		values.every((value) => isDeepStrictEqual(value, first))
		? first
		: undefined;
}

function sharedConjunctiveValues(
	keyword: "const" | "default",
	schema: JsonSchema
): unknown[] {
	return [
		...(schema[keyword] === undefined ? [] : [schema[keyword]]),
		...(schema.allOf ?? []).flatMap((clause) =>
			sharedConjunctiveValues(keyword, clause)
		),
	];
}

/** Preserve every constraint when a property is declared more than once. */
function intersectSchemas(left: JsonSchema, right: JsonSchema): JsonSchema {
	return {
		type: intersectTypes(left.type, right.type),
		title: left.title ?? right.title,
		description: left.description ?? right.description,
		enum: intersectValues(left.enum, right.enum),
		const: sharedConjunctiveValue("const", [left, right]),
		default: sharedConjunctiveValue("default", [left, right]),
		oneOf:
			left.oneOf === undefined
				? right.oneOf
				: right.oneOf === undefined
					? left.oneOf
					: undefined,
		anyOf:
			left.anyOf === undefined
				? right.anyOf
				: right.anyOf === undefined
					? left.anyOf
					: undefined,
		allOf: [left, right],
	};
}

/** Merge only the object structure contributed by conjunctive schemas. */
function structuralAllOf(schema: JsonSchema): JsonSchema {
	if (!schema.allOf?.length) {
		return schema;
	}
	const properties = new Map(Object.entries(schema.properties ?? {}));
	const required = new Set(schema.required ?? []);
	let type = schema.type;
	let title = schema.title;
	let description = schema.description;
	let enumValues = schema.enum;
	for (const clause of schema.allOf) {
		const structuralClause = structuralAllOf(clause);
		type = intersectTypes(type, structuralClause.type);
		title ??= structuralClause.title;
		description ??= structuralClause.description;
		enumValues = intersectValues(enumValues, structuralClause.enum);
		for (const field of structuralClause.required ?? []) {
			required.add(field);
		}
		for (const [field, child] of Object.entries(
			structuralClause.properties ?? {}
		)) {
			const existing = properties.get(field);
			properties.set(
				field,
				existing === undefined ? child : intersectSchemas(existing, child)
			);
		}
	}
	return {
		...schema,
		type,
		title,
		description,
		enum: enumValues,
		const: sharedConjunctiveValue("const", [schema]),
		default: sharedConjunctiveValue("default", [schema]),
		properties:
			properties.size > 0 ? Object.fromEntries(properties) : schema.properties,
		required: required.size > 0 ? [...required] : schema.required,
	};
}

function withoutAlternatives(schema: JsonSchema): JsonSchema {
	return { ...schema, oneOf: undefined, anyOf: undefined };
}

/** Every schema nested through this schema's conjunctive members. */
function conjunctiveMembers(schema: JsonSchema): JsonSchema[] {
	return (schema.allOf ?? []).flatMap((member) => [
		member,
		...conjunctiveMembers(member),
	]);
}

/** Alternative groups declared on this schema or its conjunctive members. */
function alternativeGroups(schema: JsonSchema): JsonSchema[][] {
	return [schema, ...conjunctiveMembers(schema)].flatMap((candidate) => [
		...(candidate.oneOf?.length ? [candidate.oneOf] : []),
		...(candidate.anyOf?.length ? [candidate.anyOf] : []),
	]);
}

function hasObjectProperties(schema: JsonSchema): boolean {
	if (
		Object.keys(structuralAllOf(withoutAlternatives(schema)).properties ?? {})
			.length > 0
	) {
		return true;
	}
	return alternativeGroups(schema).some((group) =>
		group.some(hasObjectProperties)
	);
}

function isObjectValue(value: unknown): boolean {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Whether every represented value is object-shaped and can use child flags. */
function isObjectOnly(schema: JsonSchema): boolean {
	const structural = structuralAllOf(schema);
	const types =
		structural.type === undefined
			? undefined
			: Array.isArray(structural.type)
				? structural.type
				: [structural.type];
	if (types?.length && types.every((type) => type === "object")) {
		return true;
	}
	if (types !== undefined && !types.includes("object")) {
		return false;
	}
	if (structural.const !== undefined) {
		return isObjectValue(structural.const);
	}
	if (
		structural.enum?.length &&
		structural.enum.every((value) => isObjectValue(value))
	) {
		return true;
	}
	const groups = alternativeGroups(schema);
	if (groups.some((group) => group.every(isObjectOnly))) {
		return true;
	}
	return schema.allOf?.some(isObjectOnly) ?? false;
}

/** Scalar alternatives expressed as `oneOf: [{ const/enum, title }, ...]`. */
function variantChoices(
	schema: JsonSchema
): Array<{ value: string | number | boolean; label?: string }> | undefined {
	const variants = schema.oneOf ?? schema.anyOf;
	if (!variants?.length) {
		return undefined;
	}
	const choices: Array<{
		value: string | number | boolean;
		label?: string;
	}> = [];
	for (const variant of variants) {
		const values =
			variant.const !== undefined
				? [variant.const]
				: variant.enum?.every(
							(value) =>
								typeof value === "string" ||
								typeof value === "number" ||
								typeof value === "boolean"
					  )
					? variant.enum
					: undefined;
		if (
			!values?.length ||
			!values.every(
				(value) =>
					typeof value === "string" ||
					typeof value === "number" ||
					typeof value === "boolean"
			)
		) {
			return undefined;
		}
		for (const value of values) {
			choices.push({
				value: value as string | number | boolean,
				label:
					values.length === 1 && variant.title
						? sanitizeTerminalText(variant.title)
						: undefined,
			});
		}
	}
	return choices;
}

function scalarChoices(
	schema: JsonSchema
): Array<{ value: string | number | boolean; label?: string }> | undefined {
	const enumChoices = schema.enum?.every(
		(value) =>
			typeof value === "string" ||
			typeof value === "number" ||
			typeof value === "boolean"
	)
		? (schema.enum as Array<string | number | boolean>)
		: undefined;
	return enumChoices?.length
		? enumChoices.map((value) => ({ value }))
		: variantChoices(schema);
}

/** Human-readable scalar branches for unions that are not plain selectors. */
function scalarAlternativeDescriptions(
	schema: JsonSchema
): string[] | undefined {
	const variants = schema.oneOf ?? schema.anyOf;
	if (!variants?.length) {
		return undefined;
	}
	const descriptions: string[] = [];
	for (const variant of variants) {
		const values =
			variant.const !== undefined
				? [variant.const]
				: variant.enum?.every(
							(value) =>
								typeof value === "string" ||
								typeof value === "number" ||
								typeof value === "boolean"
					  )
					? variant.enum
					: undefined;
		if (
			values?.length &&
			values.every(
				(value) =>
					typeof value === "string" ||
					typeof value === "number" ||
					typeof value === "boolean"
			)
		) {
			for (const value of values) {
				const rendered = describeTerminalValue(value);
				const title = variant.title
					? sanitizeTerminalText(variant.title)
					: undefined;
				descriptions.push(title ? `${rendered} (${title})` : rendered);
			}
			continue;
		}
		if (variant.pattern && toFlagType(variant) === "string") {
			const pattern = sanitizeTerminalText(variant.pattern);
			const title = variant.title
				? sanitizeTerminalText(variant.title)
				: undefined;
			descriptions.push(title ? `${pattern} (${title})` : pattern);
			continue;
		}
		return undefined;
	}
	return descriptions.length > 0 ? descriptions : undefined;
}

function describeLeaf(
	path: string[],
	schema: JsonSchema,
	required: boolean,
	requiredWhen?: string[],
	typeOverride?: FlagType
): FlagDescriptor | undefined {
	if (!isSafePropertyPath(path)) {
		return undefined;
	}
	const type = typeOverride ?? toFlagType(schema);
	if (type === undefined) {
		return undefined;
	}
	const choiceDescriptors = type === "json" ? undefined : scalarChoices(schema);
	const choices = choiceDescriptors?.map(({ value }) => String(value));
	const choiceLabels = Object.fromEntries(
		(choiceDescriptors ?? [])
			.filter(({ value, label }) => label && label !== String(value))
			.map(({ value, label }) => [String(value), label as string])
	);
	const flagName = path.map(fieldToFlag).join("-");
	// `--mode` belongs to project configuration. Runtime API schemas may still
	// contain a top-level mode until the upstream schemas reserve the name.
	if (flagName === "mode") {
		return undefined;
	}
	return {
		name: flagName,
		path,
		type,
		required,
		requiredWhen,
		description: schema.description?.split("\n")[0] ?? schema.title,
		choices: choices?.length ? choices : undefined,
		choiceLabels:
			Object.keys(choiceLabels).length > 0 ? choiceLabels : undefined,
		schema,
	};
}

function mergeFlagTypes(left: FlagType, right: FlagType): FlagType {
	if (left === right) {
		return left;
	}
	const types = new Set([left, right]);
	if (
		[...types].every(
			(type) =>
				type === "string" || type === "array" || type === "string-or-array"
		)
	) {
		return "string-or-array";
	}
	return "json";
}

/**
 * A path repeated across alternatives must accept the union of those
 * alternatives. Keep only a common CLI type: branch-specific enum, const,
 * pattern and bounds checks belong to the API, which can evaluate the whole
 * object and select the matching branch.
 */
function mergeDescriptors(
	left: FlagDescriptor,
	right: FlagDescriptor
): FlagDescriptor {
	const type = mergeFlagTypes(left.type, right.type);
	const description = left.schema.description ?? right.schema.description;
	const schema: JsonSchema =
		type === "json" || type === "string-or-array"
			? { description }
			: { type: type === "number" ? "number" : type, description };
	return {
		...left,
		type,
		required: left.required && right.required,
		requiredWhen: pathsEqual(left.requiredWhen, right.requiredWhen)
			? left.requiredWhen
			: undefined,
		choices: undefined,
		choiceLabels: undefined,
		schema,
		requiredIf: isDeepStrictEqual(left.requiredIf, right.requiredIf)
			? left.requiredIf
			: undefined,
		requiredContainer:
			left.requiredContainer && right.requiredContainer ? true : undefined,
	};
}

export interface SchemaToFlagsOptions {
	/** Field paths the command takes another way (e.g. as a positional). */
	exclude?: readonly (readonly string[])[];
}

/** Flatten a request-body schema into flag descriptors. */
export function schemaToFlags(
	schema: JsonSchema,
	options: SchemaToFlagsOptions = {}
): FlagDescriptor[] {
	const excluded = new Set(
		(options.exclude ?? []).map((path) => path.join("."))
	);
	const found = new Map<string, FlagDescriptor>();
	const sharedPaths = new Set<string>();
	const record = (
		key: string,
		descriptor: FlagDescriptor,
		inAlternative: boolean
	): void => {
		const existing = found.get(key);
		if (!inAlternative) {
			sharedPaths.add(key);
			found.set(key, descriptor);
			return;
		}
		if (sharedPaths.has(key)) {
			return;
		}
		found.set(
			key,
			existing === undefined
				? descriptor
				: mergeDescriptors(existing, descriptor)
		);
	};
	const addConditionalRequirements = (
		level: JsonSchema,
		path: string[],
		inAlternative: boolean
	): void => {
		for (const clause of [level, ...conjunctiveMembers(level)]) {
			const condition = clause.if;
			const consequent = clause.then ? structuralAllOf(clause.then) : undefined;
			const required = consequent?.required;
			if (!condition || !required?.length) {
				continue;
			}
			const conditionKeys = Object.keys(condition as Record<string, unknown>);
			const conditionTypes =
				condition.type === undefined
					? undefined
					: Array.isArray(condition.type)
						? condition.type
						: [condition.type];
			if (
				conditionKeys.some(
					(key) =>
						![
							"$comment",
							"description",
							"properties",
							"required",
							"title",
							"type",
						].includes(key)
				) ||
				(conditionTypes !== undefined && !conditionTypes.includes("object"))
			) {
				continue;
			}
			const conditionRequired = new Set(condition.required ?? []);
			const conditionProperties = condition.properties ?? {};
			// A property constraint without `required` also matches an absent
			// property in JSON Schema. That shape cannot be represented as a
			// value-triggered form requirement, so leave it to the API.
			if (
				Object.keys(conditionProperties).some(
					(field) => !conditionRequired.has(field)
				)
			) {
				continue;
			}
			const predicates: RequiredIf["predicates"] = [];
			let supported = true;
			for (const field of conditionRequired) {
				if (!isSafePropertyPath([...path, field])) {
					supported = false;
					break;
				}
				const fieldSchema = ownSchemaProperty(conditionProperties, field);
				let values: unknown[] | undefined;
				if (fieldSchema) {
					const fieldKeys = Object.keys(fieldSchema as Record<string, unknown>);
					if (
						fieldKeys.some(
							(key) =>
								![
									"$comment",
									"const",
									"default",
									"description",
									"enum",
									"examples",
									"title",
									"type",
								].includes(key)
						)
					) {
						supported = false;
						break;
					}
					values = fieldSchema.enum;
					if (fieldSchema.const !== undefined) {
						values = (values ?? [fieldSchema.const]).filter((value) =>
							isDeepStrictEqual(value, fieldSchema.const)
						);
					}
					if (fieldSchema.type !== undefined) {
						if (values === undefined) {
							supported = false;
							break;
						}
						const types = Array.isArray(fieldSchema.type)
							? fieldSchema.type
							: [fieldSchema.type];
						values = values.filter((value) =>
							types.some((type) => jsonTypeMatches(type, value))
						);
					}
				}
				predicates.push({ path: [...path, field], values });
			}
			if (!supported || predicates.length === 0) {
				continue;
			}
			for (const field of required) {
				const key = [...path, field].join(".");
				if (excluded.has(key)) {
					continue;
				}
				const requirement: RequiredIf = { predicates };
				let descriptor = found.get(key);
				const conditionalOnlyAlternative =
					inAlternative &&
					ownSchemaProperty(level.properties, field) === undefined &&
					!sharedPaths.has(key);
				if (!descriptor || conditionalOnlyAlternative) {
					const fieldSchema = ownSchemaProperty(consequent?.properties, field);
					const conditionalDescriptor =
						fieldSchema === undefined
							? undefined
							: describeLeaf(
									[...path, field],
									structuralAllOf(fieldSchema),
									false
								);
					if (conditionalDescriptor) {
						record(key, conditionalDescriptor, inAlternative);
						descriptor = found.get(key);
					}
				}
				if (
					!inAlternative &&
					descriptor &&
					!descriptor.requiredIf?.some((candidate) =>
						isDeepStrictEqual(candidate, requirement)
					)
				) {
					descriptor.requiredIf = [
						...(descriptor.requiredIf ?? []),
						requirement,
					];
				}
			}
		}
	};

	const walk = (
		level: JsonSchema,
		path: string[],
		requiredWhen?: string[],
		inAlternative = false
	): void => {
		const shared = structuralAllOf(withoutAlternatives(level));
		if (shared.properties) {
			const required = new Set(shared.required ?? []);
			for (const [field, child] of Object.entries(shared.properties)) {
				const childPath = [...path, field];
				const key = childPath.join(".");
				if (!isSafePropertyPath(childPath) || excluded.has(key)) {
					continue;
				}
				const structuralChild = structuralAllOf(child);
				const hasNestedProperties = hasObjectProperties(child);
				const nests = hasNestedProperties && isObjectOnly(child);
				const locallyRequired = !inAlternative && required.has(field);
				const childRequired = locallyRequired && requiredWhen === undefined;
				const childRequiredWhen =
					locallyRequired && requiredWhen !== undefined
						? requiredWhen
						: undefined;
				if (nests) {
					walk(
						child,
						childPath,
						locallyRequired ? requiredWhen : childPath,
						inAlternative
					);
					const hasRequiredDescendant = [...found.values()].some(
						(descriptor) =>
							descriptor.required === childRequired &&
							pathsEqual(descriptor.requiredWhen, childRequiredWhen) &&
							descriptor.path.length > childPath.length &&
							childPath.every(
								(segment, index) => descriptor.path[index] === segment
							)
					);
					if (locallyRequired && !hasRequiredDescendant) {
						const descriptor = describeLeaf(
							childPath,
							child,
							childRequired,
							childRequiredWhen
						);
						if (descriptor) {
							record(
								key,
								{ ...descriptor, requiredContainer: true },
								inAlternative
							);
						}
					}
					continue;
				}
				// A field whose type has no flag equivalent is skipped rather
				// than guessed at.
				const descriptor = describeLeaf(
					childPath,
					structuralChild,
					childRequired,
					childRequiredWhen,
					hasNestedProperties ? "json" : undefined
				);
				if (descriptor) {
					record(key, descriptor, inAlternative);
				}
			}
		}
		for (const group of alternativeGroups(level)) {
			for (const variant of group) {
				walk(variant, path, requiredWhen, true);
			}
		}
		for (const clause of [level, ...conjunctiveMembers(level)]) {
			if (clause.if && clause.then) {
				walk(clause.then, path, requiredWhen, true);
			}
		}
		addConditionalRequirements(shared, path, inAlternative);
	};
	walk(schema, []);

	return [...found.values()].sort((a, b) =>
		a.required === b.required
			? a.name.localeCompare(b.name)
			: a.required
				? -1
				: 1
	);
}

function pathsEqual(a: string[] | undefined, b: string[] | undefined): boolean {
	return (
		a === b ||
		(a !== undefined &&
			b !== undefined &&
			a.length === b.length &&
			a.every((segment, index) => segment === b[index]))
	);
}

/**
 * Render descriptors as a yargs-style help block — cf has no help
 * formatter to reuse.
 */
export function renderFlagHelp(
	descriptors: readonly FlagDescriptor[],
	heading: string
): string {
	if (descriptors.length === 0) {
		return `${theme.brand(sanitizeTerminalText(heading))}\n  (no input fields)`;
	}
	const width = process.stdout.columns ?? 80;
	const names = descriptors.map((d) => `--${sanitizeTerminalText(d.name)}`);
	const column = Math.min(Math.max(...names.map((n) => n.length)) + 2, 42);

	const lines = descriptors.map((d, i) => {
		const annotations = [`[${d.type}]`];
		if (d.required) {
			annotations.push("[required]");
		} else if (d.requiredWhen) {
			annotations.push(
				`[required with --${sanitizeTerminalText(
					d.requiredWhen.map(fieldToFlag).join("-")
				)}-*]`
			);
		}
		if (d.requiredIf) {
			annotations.push("[conditionally required]");
		}
		if (d.choices) {
			annotations.push(
				`[choices: ${d.choices
					.map((choice) => {
						const displayChoice = sanitizeTerminalText(choice);
						const label =
							d.choiceLabels && Object.hasOwn(d.choiceLabels, choice)
								? d.choiceLabels[choice]
								: undefined;
						return label
							? `${sanitizeTerminalText(label)} (${displayChoice})`
							: displayChoice;
					})
					.join(", ")}]`
			);
		}
		if (d.schema.const !== undefined) {
			annotations.push(
				`[must be: ${sanitizeTerminalText(JSON.stringify(d.schema.const) ?? "undefined")}]`
			);
		}
		if (d.schema.default !== undefined) {
			// Advertised, never sent, so the API applies its own default.
			annotations.push(
				`[default: ${sanitizeTerminalText(JSON.stringify(d.schema.default) ?? "undefined")}]`
			);
		}
		const annotated = annotations.join(" ");
		// Annotations carry the semantics, so they always survive; the prose
		// gets what's left. Descriptions here can be paragraphs, and a
		// multi-line entry per field makes a 20-field schema unreadable.
		const room = Math.max(width - column - 4, 20) - annotated.length - 1;
		const description =
			d.description === undefined
				? undefined
				: sanitizeTerminalText(d.description);
		const prose =
			description === undefined || room < 12
				? ""
				: description.length > room
					? `${description.slice(0, room - 1)}…`
					: description;
		const name = names[i] ?? "";
		// Flattened paths can outrun the column (`--web-search-options-user-
		// location-approximate-city`); pad to it when they fit, and otherwise
		// keep a single space so the name and its type don't run together.
		const label = name.length < column ? name.padEnd(column) : `${name} `;
		return `  ${label}${[prose, annotated].filter(Boolean).join(" ")}`;
	});

	return [theme.brand(sanitizeTerminalText(heading)), ...lines].join("\n");
}

/** Flags cf itself owns; never read as request-body input. */
const CF_FLAGS =
	"_ $0 -- body dry-run dryRun help h local m mode persist-to persistTo profile quiet q version v zone z".split(
		" "
	);

/** Read a descriptor's value, accepting either spelling yargs produces. */
function readFlag(
	descriptor: FlagDescriptor,
	argv: Record<string, unknown>
): unknown {
	const value = Object.hasOwn(argv, descriptor.name)
		? argv[descriptor.name]
		: undefined;
	const camelName = camelCase(descriptor.name);
	return value === undefined && Object.hasOwn(argv, camelName)
		? argv[camelName]
		: value;
}

/** Required-and-absent descriptors — the set worth prompting for. */
export function missingRequired(
	descriptors: readonly FlagDescriptor[],
	argv: Record<string, unknown>,
	baseBody?: Record<string, unknown>
): FlagDescriptor[] {
	return descriptors.filter((descriptor) => {
		const presentInBody =
			baseBody !== undefined && readBodyAtPath(baseBody, descriptor.path).found;
		return (
			isRequired(descriptor, descriptors, argv, baseBody) &&
			readFlag(descriptor, argv) === undefined &&
			!presentInBody &&
			!hasProvidedAtPath(descriptor.path, descriptors, argv) &&
			!(
				descriptor.requiredContainer &&
				hasProvidedDescendant(descriptor, descriptors, argv)
			)
		);
	});
}

/** Required descriptors absent from an already nested request body. */
export function missingRequiredFromBody(
	descriptors: readonly FlagDescriptor[],
	body: Record<string, unknown>
): FlagDescriptor[] {
	const readBody = (path: readonly string[]) => readBodyAtPath(body, path);
	return descriptors.filter(
		(descriptor) =>
			isRequiredFromBody(descriptor, readBody) &&
			!readBody(descriptor.path).found
	);
}

/** Read an own-property path without conflating a present `null` with absence. */
function readBodyAtPath(
	body: Record<string, unknown>,
	path: readonly string[]
): { found: boolean; value?: unknown } {
	let value: unknown = body;
	for (const segment of path) {
		if (
			value === null ||
			typeof value !== "object" ||
			Array.isArray(value) ||
			!Object.hasOwn(value, segment)
		) {
			return { found: false };
		}
		value = (value as Record<string, unknown>)[segment];
	}
	return { found: true, value };
}

function isRequiredFromBody(
	descriptor: FlagDescriptor,
	readBody: (path: readonly string[]) => { found: boolean; value?: unknown }
): boolean {
	return (
		descriptor.required ||
		(descriptor.requiredWhen !== undefined &&
			readBody(descriptor.requiredWhen).found) ||
		(descriptor.requiredIf?.some(({ predicates }) =>
			predicates.every(({ path, values }) => {
				const provided = readBody(path);
				return (
					provided.found &&
					(values === undefined ||
						values.some((value) => isDeepStrictEqual(provided.value, value)))
				);
			})
		) ??
			false)
	);
}

function isRequired(
	descriptor: FlagDescriptor,
	descriptors: readonly FlagDescriptor[],
	argv: Record<string, unknown>,
	baseBody?: Record<string, unknown>
): boolean {
	return (
		descriptor.required ||
		(descriptor.requiredWhen !== undefined &&
			(hasProvidedAtPath(descriptor.requiredWhen, descriptors, argv) ||
				(baseBody !== undefined &&
					readBodyAtPath(baseBody, descriptor.requiredWhen).found))) ||
		(descriptor.requiredIf?.some(({ predicates }) =>
			predicates.every(({ path, values }) => {
				const fromArgv = readProvidedAtPath(path, descriptors, argv);
				const provided =
					fromArgv.found || baseBody === undefined
						? fromArgv
						: readBodyAtPath(baseBody, path);
				const predicateValue =
					!fromArgv.found ||
					fromArgv.descriptor === undefined ||
					!pathsEqual(fromArgv.descriptor.path, path)
						? provided.value
						: coerce(fromArgv.descriptor, provided.value, []);
				return (
					provided.found &&
					(values === undefined ||
						values.some((value) => isDeepStrictEqual(predicateValue, value)))
				);
			})
		) ??
			false)
	);
}

function readProvidedAtPath(
	path: readonly string[],
	descriptors: readonly FlagDescriptor[],
	argv: Record<string, unknown>
): { found: boolean; value?: unknown; descriptor?: FlagDescriptor } {
	for (const descriptor of descriptors) {
		const value = readFlag(descriptor, argv);
		if (value === undefined || descriptor.path.length > path.length) {
			continue;
		}
		if (!descriptor.path.every((segment, index) => path[index] === segment)) {
			continue;
		}
		let nested: unknown = value;
		if (typeof nested === "string" && descriptor.path.length < path.length) {
			try {
				nested = JSON.parse(nested) as unknown;
			} catch {
				continue;
			}
		}
		for (const segment of path.slice(descriptor.path.length)) {
			if (
				nested === null ||
				typeof nested !== "object" ||
				Array.isArray(nested) ||
				!Object.hasOwn(nested, segment)
			) {
				nested = undefined;
				break;
			}
			nested = (nested as Record<string, unknown>)[segment];
		}
		if (nested !== undefined) {
			return { found: true, value: nested, descriptor };
		}
	}
	return { found: false };
}

function hasProvidedAtPath(
	path: readonly string[],
	descriptors: readonly FlagDescriptor[],
	argv: Record<string, unknown>
): boolean {
	return descriptors.some((descriptor) => {
		const value = readFlag(descriptor, argv);
		if (value === undefined) {
			return false;
		}
		if (descriptor.path.length >= path.length) {
			return path.every((segment, index) => descriptor.path[index] === segment);
		}
		if (!descriptor.path.every((segment, index) => path[index] === segment)) {
			return false;
		}

		let nested: unknown = value;
		if (typeof nested === "string") {
			try {
				nested = JSON.parse(nested) as unknown;
			} catch {
				return false;
			}
		}
		for (const segment of path.slice(descriptor.path.length)) {
			if (
				nested === null ||
				typeof nested !== "object" ||
				Array.isArray(nested) ||
				!Object.hasOwn(nested, segment)
			) {
				return false;
			}
			nested = (nested as Record<string, unknown>)[segment];
		}
		return true;
	});
}

/** Whether a flattened child supplies a required object container. */
function hasProvidedDescendant(
	container: FlagDescriptor,
	descriptors: readonly FlagDescriptor[],
	argv: Record<string, unknown>
): boolean {
	return descriptors.some(
		(descriptor) =>
			descriptor !== container &&
			descriptor.path.length > container.path.length &&
			container.path.every(
				(segment, index) => descriptor.path[index] === segment
			) &&
			readFlag(descriptor, argv) !== undefined
	);
}

/** Exact argv keys yargs emits for dynamic descriptors. */
export function flagArgNames(descriptors: readonly FlagDescriptor[]): string[] {
	return descriptors.flatMap((descriptor) => [
		descriptor.name,
		camelCase(descriptor.name),
	]);
}

/**
 * Render an argv value as text, for an error message or for a string-typed
 * field. Yargs hands back whatever it inferred, so this avoids both
 * `[object Object]` and a throw.
 */
function describeValue(value: unknown): string {
	if (typeof value === "string") {
		return value;
	}
	try {
		return JSON.stringify(value) ?? "undefined";
	} catch {
		return "unprintable value";
	}
}

function describeTerminalValue(value: unknown): string {
	return sanitizeTerminalText(describeValue(value));
}

function coerce(
	descriptor: FlagDescriptor,
	value: unknown,
	errors: string[]
): unknown {
	const fail = (expected: string): undefined => {
		errors.push(
			`--${sanitizeTerminalText(descriptor.name)} expects ${expected} (got '${describeTerminalValue(value)}')`
		);
		return undefined;
	};
	switch (descriptor.type) {
		case "number": {
			const n =
				typeof value === "number" ? value : Number(describeValue(value));
			const types = Array.isArray(descriptor.schema.type)
				? descriptor.schema.type
				: [descriptor.schema.type];
			if (!Number.isFinite(n)) {
				return fail("a finite number");
			}
			if (
				types.includes("integer") &&
				!types.includes("number") &&
				!Number.isInteger(n)
			) {
				return fail("an integer");
			}
			return n;
		}
		case "boolean":
			if (typeof value === "boolean") {
				return value;
			}
			return value === "true"
				? true
				: value === "false"
					? false
					: fail("a boolean");
		case "array":
		case "object": {
			let parsed = value;
			if (typeof value === "string") {
				try {
					parsed = JSON.parse(value);
				} catch {
					return fail(`a JSON ${descriptor.type}`);
				}
			}
			const valid =
				descriptor.type === "array"
					? Array.isArray(parsed)
					: parsed !== null &&
						typeof parsed === "object" &&
						!Array.isArray(parsed);
			return valid ? parsed : fail(`a JSON ${descriptor.type}`);
		}
		case "json": {
			const schemaTypes = Array.isArray(descriptor.schema.type)
				? descriptor.schema.type
				: [descriptor.schema.type];
			if (schemaTypes.length === 1 && schemaTypes[0] === "null") {
				return value === null || value === "null" ? null : fail("null");
			}
			// Anything the schema doesn't constrain: parse what parses, and
			// take the rest as the string it looks like, same as
			// `string-or-array`. Nothing here can be rejected on type.
			if (typeof value !== "string") {
				return value;
			}
			try {
				return JSON.parse(value) as unknown;
			} catch {
				return resolveFileToken(value, descriptor.name, "json");
			}
		}
		case "string-or-array": {
			if (typeof value !== "string") {
				return Array.isArray(value) ? value : fail("a string or JSON array");
			}
			try {
				const parsed = JSON.parse(value) as unknown;
				if (Array.isArray(parsed)) {
					return parsed;
				}
			} catch {
				// A bare value is the string variant, not malformed JSON.
			}
			return resolveFileToken(value, descriptor.name, "text");
		}
		default: {
			const raw = Array.isArray(value) ? value[value.length - 1] : value;
			if (typeof raw === "boolean") {
				return fail("a string");
			}
			// Strings honour the universal `@path` file-ingestion token, same
			// as every generated string body flag.
			return typeof raw === "string"
				? resolveFileToken(raw, descriptor.name, "text")
				: describeValue(raw);
		}
	}
}

/** JSON Schema measures string length in Unicode code points, not UTF-16 units. */
function stringCodePointLength(value: string): number {
	return Array.from(value).length;
}

/** Constraints beyond type and enum. */
function checkConstraints(
	d: FlagDescriptor,
	value: unknown,
	errors: string[]
): void {
	const name = sanitizeTerminalText(d.name);
	const {
		const: fixed,
		pattern,
		minLength,
		maxLength,
		minimum,
		maximum,
		exclusiveMinimum,
		exclusiveMaximum,
	} = d.schema;
	if (fixed !== undefined && !isDeepStrictEqual(value, fixed)) {
		errors.push(
			`--${name} must be ${sanitizeTerminalText(JSON.stringify(fixed) ?? "undefined")}`
		);
		return;
	}
	const choices =
		d.schema.enum ?? variantChoices(d.schema)?.map((choice) => choice.value);
	if (
		choices !== undefined &&
		!choices.some((choice) => isDeepStrictEqual(value, choice))
	) {
		errors.push(
			`--${name} must be one of: ${choices.map(describeTerminalValue).join(", ")}`
		);
		return;
	}
	if (typeof value === "string") {
		const length = stringCodePointLength(value);
		if (pattern !== undefined && !new RegExp(pattern).test(value)) {
			errors.push(
				`--${name} does not match the required format (${sanitizeTerminalText(pattern)})`
			);
		}
		if (minLength !== undefined && length < minLength) {
			errors.push(`--${name} must be at least ${minLength} characters`);
		}
		if (maxLength !== undefined && length > maxLength) {
			errors.push(`--${name} must be at most ${maxLength} characters`);
		}
	}
	if (typeof value === "number") {
		if (
			minimum !== undefined &&
			(exclusiveMinimum === true ? value <= minimum : value < minimum)
		) {
			errors.push(
				exclusiveMinimum === true
					? `--${name} must be greater than ${minimum}`
					: `--${name} must be at least ${minimum}`
			);
		}
		if (
			maximum !== undefined &&
			(exclusiveMaximum === true ? value >= maximum : value > maximum)
		) {
			errors.push(
				exclusiveMaximum === true
					? `--${name} must be less than ${maximum}`
					: `--${name} must be at most ${maximum}`
			);
		}
		if (typeof exclusiveMinimum === "number" && value <= exclusiveMinimum) {
			errors.push(`--${name} must be greater than ${exclusiveMinimum}`);
		}
		if (typeof exclusiveMaximum === "number" && value >= exclusiveMaximum) {
			errors.push(`--${name} must be less than ${exclusiveMaximum}`);
		}
	}
}

/** Coerce and validate one dynamic flag, suitable for inline form feedback. */
export function validateFlagValue(
	descriptor: FlagDescriptor,
	raw: unknown
): string | undefined {
	const errors: string[] = [];
	const value = coerce(descriptor, raw, errors);
	if (value === undefined) {
		return errors[0];
	}
	checkConstraints(descriptor, value, errors);
	if (errors.length > 0) {
		return errors[0];
	}
	const nestedErrors = validateJsonSchema(descriptor.schema, value);
	return nestedErrors.length > 0
		? `--${sanitizeTerminalText(descriptor.name)} ${nestedErrors[0]?.replace(/^the request body /, "")}`
		: undefined;
}

function jsonTypeMatches(type: string, value: unknown): boolean {
	switch (type) {
		case "null":
			return value === null;
		case "array":
			return Array.isArray(value);
		case "object":
			return (
				value !== null && typeof value === "object" && !Array.isArray(value)
			);
		case "integer":
			return typeof value === "number" && Number.isInteger(value);
		default:
			return typeof value === type;
	}
}

function typeDescription(types: readonly string[]): string {
	return types
		.map((type) =>
			type === "integer"
				? "an integer"
				: `a${/^[aeiou]/.test(type) ? "n" : ""} ${type}`
		)
		.join(" or ");
}

function jsonPointer(path: readonly string[]): string {
	return path.length === 0
		? "the request body"
		: `\`/${path
				.map((segment) =>
					sanitizeTerminalText(segment).replace(/~/g, "~0").replace(/\//g, "~1")
				)
				.join("/")}\``;
}

function validateSchemaAtPath(
	schema: JsonSchema,
	value: unknown,
	path: string[]
): string[] {
	const errors: string[] = [];
	const location = jsonPointer(path);
	const types =
		schema.type === undefined
			? []
			: Array.isArray(schema.type)
				? schema.type
				: [schema.type];
	if (types.length > 0 && !types.some((type) => jsonTypeMatches(type, value))) {
		return [`${location} must be ${typeDescription(types)}`];
	}
	if (schema.const !== undefined && !isDeepStrictEqual(value, schema.const)) {
		return [
			`${location} must be ${sanitizeTerminalText(JSON.stringify(schema.const) ?? "undefined")}`,
		];
	}
	if (
		schema.enum &&
		!schema.enum.some((choice) => isDeepStrictEqual(value, choice))
	) {
		return [
			`${location} must be one of: ${schema.enum.map(describeTerminalValue).join(", ")}`,
		];
	}

	if (schema.oneOf?.length) {
		const matches = schema.oneOf.filter(
			(variant) => validateSchemaAtPath(variant, value, path).length === 0
		).length;
		if (matches !== 1) {
			const alternatives = scalarAlternativeDescriptions(schema);
			return [
				alternatives
					? `${location} must be one of: ${alternatives.join(", ")}`
					: `${location} must match exactly one allowed shape`,
			];
		}
	}
	if (
		schema.anyOf?.length &&
		!schema.anyOf.some(
			(variant) => validateSchemaAtPath(variant, value, path).length === 0
		)
	) {
		const alternatives = scalarAlternativeDescriptions(schema);
		return [
			alternatives
				? `${location} must be one of: ${alternatives.join(", ")}`
				: `${location} must match an allowed shape`,
		];
	}
	for (const clause of schema.allOf ?? []) {
		errors.push(...validateSchemaAtPath(clause, value, path));
	}
	if (
		schema.if &&
		validateSchemaAtPath(schema.if, value, path).length === 0 &&
		schema.then
	) {
		errors.push(...validateSchemaAtPath(schema.then, value, path));
	}

	if (typeof value === "string") {
		const length = stringCodePointLength(value);
		if (
			schema.pattern !== undefined &&
			!new RegExp(schema.pattern).test(value)
		) {
			errors.push(
				`${location} does not match the required format (${sanitizeTerminalText(schema.pattern)})`
			);
		}
		if (schema.minLength !== undefined && length < schema.minLength) {
			errors.push(
				`${location} must be at least ${schema.minLength} characters`
			);
		}
		if (schema.maxLength !== undefined && length > schema.maxLength) {
			errors.push(`${location} must be at most ${schema.maxLength} characters`);
		}
	}
	if (typeof value === "number") {
		if (
			schema.minimum !== undefined &&
			(schema.exclusiveMinimum === true
				? value <= schema.minimum
				: value < schema.minimum)
		) {
			errors.push(
				schema.exclusiveMinimum === true
					? `${location} must be greater than ${schema.minimum}`
					: `${location} must be at least ${schema.minimum}`
			);
		}
		if (
			schema.maximum !== undefined &&
			(schema.exclusiveMaximum === true
				? value >= schema.maximum
				: value > schema.maximum)
		) {
			errors.push(
				schema.exclusiveMaximum === true
					? `${location} must be less than ${schema.maximum}`
					: `${location} must be at most ${schema.maximum}`
			);
		}
		if (
			typeof schema.exclusiveMinimum === "number" &&
			value <= schema.exclusiveMinimum
		) {
			errors.push(
				`${location} must be greater than ${schema.exclusiveMinimum}`
			);
		}
		if (
			typeof schema.exclusiveMaximum === "number" &&
			value >= schema.exclusiveMaximum
		) {
			errors.push(`${location} must be less than ${schema.exclusiveMaximum}`);
		}
		if (
			schema.multipleOf !== undefined &&
			Math.abs(
				value / schema.multipleOf - Math.round(value / schema.multipleOf)
			) >
				Number.EPSILON * 10
		) {
			errors.push(`${location} must be a multiple of ${schema.multipleOf}`);
		}
	}
	if (Array.isArray(value)) {
		if (schema.minItems !== undefined && value.length < schema.minItems) {
			errors.push(`${location} must contain at least ${schema.minItems} items`);
		}
		if (schema.maxItems !== undefined && value.length > schema.maxItems) {
			errors.push(`${location} must contain at most ${schema.maxItems} items`);
		}
		if (
			schema.uniqueItems &&
			value.some((item, index) =>
				value
					.slice(0, index)
					.some((earlier) => isDeepStrictEqual(item, earlier))
			)
		) {
			errors.push(`${location} must contain unique items`);
		}
		if (schema.items && !Array.isArray(schema.items)) {
			for (const [index, item] of value.entries()) {
				errors.push(
					...validateSchemaAtPath(schema.items, item, [...path, String(index)])
				);
			}
		} else if (Array.isArray(schema.items)) {
			for (const [index, itemSchema] of schema.items.entries()) {
				if (index < value.length) {
					errors.push(
						...validateSchemaAtPath(itemSchema, value[index], [
							...path,
							String(index),
						])
					);
				}
			}
		}
	}
	if (value !== null && typeof value === "object" && !Array.isArray(value)) {
		const object = value as Record<string, unknown>;
		const properties = schema.properties ?? {};
		for (const required of schema.required ?? []) {
			if (!Object.hasOwn(object, required)) {
				errors.push(`${jsonPointer([...path, required])} is required`);
			}
		}
		for (const [key, child] of Object.entries(object)) {
			const propertySchema = Object.hasOwn(properties, key)
				? properties[key]
				: undefined;
			if (propertySchema) {
				errors.push(
					...validateSchemaAtPath(propertySchema, child, [...path, key])
				);
			} else if (schema.additionalProperties === false) {
				errors.push(`${jsonPointer([...path, key])} is not allowed`);
			} else if (
				schema.additionalProperties &&
				typeof schema.additionalProperties === "object"
			) {
				errors.push(
					...validateSchemaAtPath(schema.additionalProperties, child, [
						...path,
						key,
					])
				);
			}
		}
		const count = Object.keys(object).length;
		if (schema.minProperties !== undefined && count < schema.minProperties) {
			errors.push(
				`${location} must contain at least ${schema.minProperties} properties`
			);
		}
		if (schema.maxProperties !== undefined && count > schema.maxProperties) {
			errors.push(
				`${location} must contain at most ${schema.maxProperties} properties`
			);
		}
	}
	return errors;
}

/** Validate a fully assembled body against its runtime JSON Schema. */
export function validateJsonSchema(
	schema: JsonSchema,
	value: unknown
): string[] {
	return [...new Set(validateSchemaAtPath(schema, value, []))];
}

const PROJECTED_SCHEMA_KEYS = [
	"const",
	"enum",
	"exclusiveMaximum",
	"exclusiveMinimum",
	"maxItems",
	"maxLength",
	"maxProperties",
	"maximum",
	"minItems",
	"minLength",
	"minProperties",
	"minimum",
	"multipleOf",
	"pattern",
	"required",
	"title",
	"type",
	"uniqueItems",
] as const satisfies readonly (keyof JsonSchema)[];

interface ProjectedSchema {
	schema: JsonSchema;
	/** Whether the projection has exactly the original validation semantics. */
	exact: boolean;
}

/**
 * Keep the supported necessary conditions of a schema.
 *
 * Dropping an unknown conjunctive assertion is safe: the result accepts more
 * values, so a projected validation failure is still a real failure. Applicator
 * keywords need more care. A widened `oneOf` can match too many branches, and a
 * widened `if` can spuriously activate its `then`, so those forms are weakened
 * below rather than copied blindly.
 */
function supportedValidationSchema(schema: JsonSchema): ProjectedSchema {
	const raw = schema as Record<string, unknown>;
	const keys = Object.keys(raw);
	if (raw.nullable === true || raw["x-nullable"] === true) {
		// OpenAPI 3's nullable modifier widens `type`; dropping an unknown
		// keyword while retaining that type would instead narrow the schema.
		return { schema: {}, exact: false };
	}
	if (
		keys.some((key) => ["$dynamicRef", "$recursiveRef", "$ref"].includes(key))
	) {
		// `$ref` sibling behaviour depends on the schema dialect. Without a
		// resolver or a guaranteed dialect, even retaining siblings is unsafe.
		return { schema: {}, exact: false };
	}

	const projected: JsonSchema = {};
	let exact = keys.every(
		(key) => SUPPORTED_SCHEMA_KEYS.has(key) || key.startsWith("x-")
	);
	for (const key of PROJECTED_SCHEMA_KEYS) {
		const value = schema[key];
		if (value !== undefined) {
			Object.assign(projected, { [key]: value });
		}
	}

	if (schema.properties !== undefined) {
		const properties = Object.entries(schema.properties).map(([key, child]) => {
			const result = supportedValidationSchema(child);
			exact &&= result.exact;
			return [key, result.schema] as const;
		});
		projected.properties = Object.fromEntries(properties);
	}

	if (
		schema.additionalProperties !== undefined &&
		!Object.hasOwn(raw, "patternProperties")
	) {
		if (typeof schema.additionalProperties === "boolean") {
			projected.additionalProperties = schema.additionalProperties;
		} else {
			const result = supportedValidationSchema(schema.additionalProperties);
			projected.additionalProperties = result.schema;
			exact &&= result.exact;
		}
	}

	if (schema.items !== undefined && !Object.hasOwn(raw, "prefixItems")) {
		if (Array.isArray(schema.items)) {
			projected.items = schema.items.map((item) => {
				const result = supportedValidationSchema(item);
				exact &&= result.exact;
				return result.schema;
			});
		} else {
			const result = supportedValidationSchema(schema.items);
			projected.items = result.schema;
			exact &&= result.exact;
		}
	}

	const allOf = (schema.allOf ?? []).map((clause) => {
		const result = supportedValidationSchema(clause);
		exact &&= result.exact;
		return result.schema;
	});
	if (schema.anyOf?.length) {
		const alternatives = schema.anyOf.map((alternative) => {
			const result = supportedValidationSchema(alternative);
			exact &&= result.exact;
			return result.schema;
		});
		projected.anyOf = alternatives;
	}
	if (schema.oneOf?.length) {
		const alternatives = schema.oneOf.map(supportedValidationSchema);
		const exactAlternatives = alternatives.every((result) => result.exact);
		exact &&= exactAlternatives;
		if (exactAlternatives) {
			projected.oneOf = alternatives.map((result) => result.schema);
		} else {
			// Exact-one is not monotone when its branches are widened. At-least-one
			// remains a necessary condition of the original schema.
			allOf.push({
				anyOf: alternatives.map((result) => result.schema),
			});
		}
	}
	if (schema.if && schema.then) {
		const condition = supportedValidationSchema(schema.if);
		const consequent = supportedValidationSchema(schema.then);
		exact &&= condition.exact && consequent.exact;
		if (condition.exact) {
			// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
			allOf.push({ if: condition.schema, then: consequent.schema });
		}
	}
	if (allOf.length > 0) {
		projected.allOf = allOf;
	}

	return { schema: projected, exact };
}

/** Validate only constraints that remain sound when a schema is unsupported. */
export function validateSupportedJsonSchema(
	schema: JsonSchema,
	value: unknown
): string[] {
	return validateJsonSchema(supportedValidationSchema(schema).schema, value);
}

export interface AssembleOptions {
	/** Extra flags the command owns, beyond cf's globals. */
	reserved?: readonly string[];
	/** Parsed input to preserve verbatim, with supplied flags overlaid on it. */
	baseBody?: Record<string, unknown>;
}

function setNestedBodyValue(
	body: Record<string, unknown>,
	path: readonly string[],
	value: unknown
): void {
	let current = body;
	for (const segment of path.slice(0, -1)) {
		const child = current[segment];
		if (child === null || typeof child !== "object" || Array.isArray(child)) {
			current[segment] = {};
		}
		current = current[segment] as Record<string, unknown>;
	}
	const last = path.at(-1);
	if (last !== undefined) {
		current[last] = value;
	}
}

/** Argv keys not owned by cf, the command, or the supplied dynamic flags. */
export function unknownFlagNames(
	argv: Record<string, unknown>,
	knownFlags: readonly string[] = []
): string[] {
	const known = new Set([...CF_FLAGS, ...knownFlags]);
	const unknown = new Map<string, string>();
	for (const key of Object.keys(argv)) {
		if (!known.has(key) && !unknown.has(fieldToFlag(key))) {
			unknown.set(fieldToFlag(key), key);
		}
	}
	return [...unknown.values()].sort();
}

/**
 * Build a request body from argv, using the schema as the allowlist.
 *
 * The schema stands in for `yargs.strict()` on these commands: yargs
 * can't know the fields at registration time, so unknown flags are
 * rejected here instead and a typo stays an error.
 */
export function assembleBody(
	descriptors: readonly FlagDescriptor[],
	argv: Record<string, unknown>,
	options: AssembleOptions = {}
): { body: Record<string, unknown>; errors: string[] } {
	const errors: string[] = [];
	const hasBaseBody = options.baseBody !== undefined;
	const body: Record<string, unknown> =
		options.baseBody === undefined ? {} : structuredClone(options.baseBody);
	const safeDescriptors = descriptors.filter(({ path }) =>
		isSafePropertyPath(path)
	);
	const known = [...(options.reserved ?? []), ...flagArgNames(safeDescriptors)];

	for (const descriptor of safeDescriptors) {
		const raw = readFlag(descriptor, argv);
		if (raw === undefined) {
			if (
				!hasBaseBody &&
				isRequired(descriptor, safeDescriptors, argv) &&
				!hasProvidedAtPath(descriptor.path, safeDescriptors, argv) &&
				!(
					descriptor.requiredContainer &&
					hasProvidedDescendant(descriptor, safeDescriptors, argv)
				)
			) {
				errors.push(`--${sanitizeTerminalText(descriptor.name)} is required`);
			}
			continue;
		}
		const value = coerce(descriptor, raw, errors);
		if (value === undefined) {
			continue;
		}
		checkConstraints(descriptor, value, errors);
		if (hasBaseBody) {
			setNestedBodyValue(body, descriptor.path, value);
		} else {
			setNestedValue(body, descriptor.path, value);
		}
	}

	if (hasBaseBody) {
		for (const descriptor of missingRequiredFromBody(safeDescriptors, body)) {
			if (readFlag(descriptor, argv) === undefined) {
				errors.push(`--${sanitizeTerminalText(descriptor.name)} is required`);
			}
		}
	}

	for (const name of unknownFlagNames(argv, known)) {
		// Each command appends its own "run … --help" pointer.
		errors.push(`Unknown flag --${sanitizeTerminalText(name)}`);
	}

	return { body, errors };
}
