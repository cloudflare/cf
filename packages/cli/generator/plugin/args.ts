/**
 * Derives the positionals and flags of a command from its operation.
 *
 * A port of cf's `arg-derivation.ts` and `intermediate-representation.ts`:
 * the single source of both the generated command and its metadata.
 */

import {
	GenerateError,
	get,
	kebab,
	last,
	stringOf,
	templateParams,
	truthy,
	type Value,
} from "./js.js";
import type { Method } from "./commands.js";
import type {
	MultipartField,
	MultipartInfo,
	OperationInfo,
} from "./operation.js";

/**
 * The kind of value an argument takes: an `enum` is a string from a fixed
 * list, an `array` repeated scalar values, and `objectArray` and `objectMap` take
 * JSON-valued flags holding an array of objects or a map.
 */
export type ArgType =
	| "string"
	| "number"
	| "boolean"
	| "enum"
	| "array"
	| "scalarUnion"
	| "objectArray"
	| "objectMap";

/** The type yargs is told, and that the metadata lists: enums and arrays are strings. */
export function scalar(type: ArgType): "number" | "boolean" | "string" {
	return type === "number" || type === "boolean" ? type : "string";
}

/** Where an argument's value goes. */
export type Origin =
	| { readonly in: "path"; readonly name: string }
	| { readonly in: "query"; readonly name: string }
	| { readonly in: "header"; readonly name: string }
	| { readonly in: "body"; readonly path: readonly string[] };

/** A positional or flag of a command. */
export interface Arg {
	/** The kebab-case name yargs registers. */
	name: string;
	description: string;
	type: ArgType;
	choices?: string[];
	default?: Value;
	required: boolean;
	positional: boolean;
	origin: Origin;
	conflicts?: string[];
	implies?: string[];
	secret: boolean;
	/**
	 * How `@file` values are read, for string body flags: `format` is
	 * undefined for an override without one.
	 */
	fromFile?: { readonly format: string | undefined };
	isZone: boolean;
	isWorkerName: boolean;
}

export function isPath(arg: Arg): boolean {
	return arg.origin.in === "path";
}

export function isBody(arg: Arg): boolean {
	return arg.origin.in === "body";
}

export function hasChoices(arg: Arg): boolean {
	return arg.choices !== undefined && arg.choices.length > 0;
}

/** The emitted `format` argument of `resolveFileToken` for `arg`. */
export function fileFormat(arg: Arg): string {
	const format = arg.fromFile?.format;
	return format === undefined ? "undefined" : JSON.stringify(format);
}

export function bodyPath(arg: Arg): readonly string[] | undefined {
	return arg.origin.in === "body" ? arg.origin.path : undefined;
}

/**
 * A body object that is optional but has required fields: they are only
 * required when some flag of the object is set.
 */
export interface OptionalParentGroup {
	parentName: string;
	/** The flags of the object without a default, which show it was set. */
	groupSetFlags: string[];
	requiredFlags: string[];
}

/** What a command takes, and the facts about its operation every part of the generator branches on. */
export interface Derived {
	args: Arg[];
	optionalParentGroups: OptionalParentGroup[];
	isMutating: boolean;
	hasBody: boolean;
	hasEmptyBody: boolean;
	hasBodyParams: boolean;
	hasFileUpload: boolean;
	multipart?: MultipartInfo;
	multipartFlagFields: MultipartField[];
}

export const positionals = (d: Derived): Arg[] =>
	d.args.filter((a) => a.positional);
export const options = (d: Derived): Arg[] =>
	d.args.filter((a) => !a.positional);
export const bodyOptions = (d: Derived): Arg[] =>
	d.args.filter((a) => isBody(a) && !a.positional);
export const queryArgs = (d: Derived): Arg[] =>
	d.args.filter((a) => a.origin.in === "query");
export const headerArgs = (d: Derived): Arg[] =>
	d.args.filter((a) => a.origin.in === "header");

/** Defaults applied by yargs and advertised to metadata consumers. */
export function optionDefaults(
	d: Derived,
	op: OperationInfo
): Map<string, Value> {
	const conflictFlags = new Set<string>();
	for (const a of d.args) {
		if (a.conflicts !== undefined && a.conflicts.length > 0) {
			conflictFlags.add(kebab(a.name));
			for (const name of a.conflicts) {
				conflictFlags.add(kebab(name));
			}
		}
	}
	const partialUpdate = op.method === "patch" || op.method === "put";
	const defaults = new Map<string, Value>();
	for (const a of options(d)) {
		const discriminator =
			op.bodyDiscriminator !== undefined &&
			a.origin.in === "body" &&
			a.origin.path.length === 1 &&
			a.origin.path[0] === op.bodyDiscriminator.field;
		if (
			a.default === undefined ||
			a.type === "array" ||
			a.type === "objectArray" ||
			a.type === "objectMap" ||
			a.type === "scalarUnion" ||
			conflictFlags.has(kebab(a.name)) ||
			(isBody(a) && partialUpdate && !discriminator)
		) {
			continue;
		}
		defaults.set(a.name, a.default);
	}
	return defaults;
}

/** Options that only the CLI uses, which never become body flags. */
export const CLI_ONLY_OPTIONS: readonly string[] = [
	"dry-run",
	"body",
	"file",
	"local",
	"remote",
	"preview",
	"persist-to",
	"yes",
	"output",
	"table",
];

export const ACCOUNT_PATH_PARAMS: readonly string[] = [
	"account_id",
	"account_identifier",
	"accountId",
];
export const ZONE_PATH_PARAMS: readonly string[] = [
	"zone_id",
	"zone_identifier",
	"zoneId",
];

const ZONE_ARG_NAMES: readonly string[] = [
	"zoneId",
	"zone_id",
	"zone-id",
	"zone",
];
const WORKER_NAME_ARGS: readonly string[] = [
	"worker",
	"script-name",
	"scriptName",
	"script_name",
];

export function isWorkerName(name: string): boolean {
	return WORKER_NAME_ARGS.includes(name);
}

const PAIR = "{account_or_zone}/{account_or_zone_id}";

/** Reports whether `path` pairs `{account_or_zone}/{account_or_zone_id}` as whole segments. */
export function hasAccountOrZoneScope(path: string): boolean {
	for (
		let i = path.indexOf(PAIR);
		i >= 0;
		i = path.indexOf(PAIR, i + PAIR.length)
	) {
		const end = i + PAIR.length;
		const before = i === 0 || path[i - 1] === "/";
		const after = end === path.length || path[end] === "/";
		if (before && after) {
			return true;
		}
	}
	return false;
}

/** The generated local that holds a paired account/zone path parameter. */
export function accountOrZoneLocal(
	path: string,
	param: string
): string | undefined {
	if (!hasAccountOrZoneScope(path)) {
		return undefined;
	}
	switch (param) {
		case "account_or_zone":
			return "accountOrZone";
		case "account_or_zone_id":
			return "accountOrZoneId";
		default:
			return undefined;
	}
}

/** The argv key that holds the value of the `{wire}` placeholder. */
export function pathParamReadKey(args: readonly Arg[], wire: string): string {
	const arg = args.find(
		(a) => a.origin.in === "path" && a.origin.name === wire && !a.isWorkerName
	);
	return kebab(arg ? arg.name : wire);
}

function flagName(name: string): string {
	return name.replace(/[_.]/g, "-");
}

function cliFlagName(name: string): string | undefined {
	const flag = flagName(name);
	return flag.toLowerCase() === "mode" ? undefined : flag;
}

function parameterFlagName(
	name: string,
	sdkName: string | undefined
): string | undefined {
	return sdkName === undefined
		? cliFlagName(name)
		: cliFlagName(kebab(sdkName));
}

function descriptionFromName(name: string): string {
	return name
		.split("_")
		.map((w, i) => {
			if (w === "id" || w === "identifier") {
				return "ID";
			}
			if (i === 0) {
				const first = w.codePointAt(0);
				if (first === undefined) {
					return "";
				}
				const ch = String.fromCodePoint(first);
				return ch.toUpperCase() + w.slice(ch.length);
			}
			return w;
		})
		.join(" ");
}

function bodyArgType(type: string, itemType: string | undefined): ArgType {
	switch (type) {
		case "scalarUnion":
			return "scalarUnion";
		case "number":
			return "number";
		case "boolean":
			return "boolean";
		case "array":
			return itemType === "object" ? "objectArray" : "array";
		case "object":
			return "objectMap";
		default:
			return "string";
	}
}

interface Classification {
	isZone: boolean;
	isWorkerName: boolean;
}

function classify(name: string, workers: boolean): Classification {
	return {
		isZone: ZONE_ARG_NAMES.includes(name),
		isWorkerName: workers && isWorkerName(name),
	};
}

type Overrides = { readonly [key: string]: Value };

/** A plain-object override of `x-forge-params`. */
class Override {
	constructor(readonly value: Value | undefined) {}

	static of(overrides: Overrides, key: string): Override {
		return new Override(get(overrides, key));
	}

	get(key: string): Value | undefined {
		return this.value === undefined ? undefined : get(this.value, key);
	}

	/** `override?.key ?? ...`: the member unless it is null or missing. */
	nullish(key: string): Value | undefined {
		const v = this.get(key);
		return v === null ? undefined : v;
	}

	string(key: string): string | undefined {
		const v = this.nullish(key);
		return v === undefined ? undefined : stringOf(v);
	}

	present(): boolean {
		return this.value !== undefined && this.value !== null;
	}
}

/** `deriveArgsFromOp`. */
export function derive(
	method: Method,
	resource: string,
	op: OperationInfo
): Derived {
	if (method.hasArgs) {
		throw new GenerateError(`Method provided explicit CLI args: ${op.path}`);
	}
	const workers = resource === "workers";
	const overrides: Overrides = method.params ?? {};
	const args: Arg[] = [];
	pathParams(args, op, overrides, method, workers);
	queryParams(args, op, overrides, workers);
	headerParams(args, op, workers);
	bodyParams(args, op, overrides, workers);

	const optionalParentGroups = optionalParents(args, op);
	const upper = op.method.toUpperCase();
	const isMutating = upper !== "GET" && upper !== "HEAD";
	const hasBody = isMutating && op.hasRequestBody;
	const onlyJson =
		op.requestContentTypes.length === 0 ||
		op.requestContentTypes.every((c) => c === "application/json");
	const hasEmptyBody =
		op.hasRequestBody &&
		op.requestBodyRef === undefined &&
		op.bodyParams.length === 0 &&
		op.multipart === undefined &&
		!op.requestBodyIsArray &&
		onlyJson;
	const hasBodyParams = args.some(isBody) && isMutating;
	const hasFileUpload = op.requestContentTypes.some(
		(c) => c !== "application/json"
	);
	const multipart = op.requestContentTypes.includes("multipart/form-data")
		? op.multipart
		: undefined;
	const multipartFlagFields = multipart
		? multipart.fields.filter(
				(f) =>
					!f.isBinary &&
					f.name !== multipart.payloadField &&
					cliFlagName(f.name) !== undefined
			)
		: [];
	return {
		args,
		optionalParentGroups,
		isMutating,
		hasBody,
		hasEmptyBody,
		hasBodyParams,
		hasFileUpload,
		multipart,
		multipartFlagFields,
	};
}

/**
 * `applyOptionalParentDowngrade`: makes the required fields of optional body
 * objects optional, as a `.check()` enforces them instead.
 */
export function downgradeOptionalParents(derived: Derived): void {
	const downgraded = derived.optionalParentGroups.flatMap(
		(g) => g.requiredFlags
	);
	for (const arg of derived.args) {
		if (isBody(arg) && !arg.positional && downgraded.includes(arg.name)) {
			arg.required = false;
		}
	}
}

function optionalParents(
	args: readonly Arg[],
	op: OperationInfo
): OptionalParentGroup[] {
	interface Entry {
		flag: string;
		required: boolean;
		hasDefault: boolean;
	}
	const byParent: [string, Entry[]][] = [];
	for (const arg of args) {
		if (!isBody(arg) || arg.positional) {
			continue;
		}
		const path = bodyPath(arg);
		if (path === undefined || path.length < 2) {
			continue;
		}
		const entry: Entry = {
			flag: arg.name,
			required: arg.required,
			hasDefault: arg.default !== undefined,
		};
		const parent = path[0] as string;
		const existing = byParent.find(([p]) => p === parent);
		if (existing) {
			existing[1].push(entry);
		} else {
			byParent.push([parent, [entry]]);
		}
	}
	const groups: OptionalParentGroup[] = [];
	for (const [parent, entries] of byParent) {
		if (op.requestBodyRequired.includes(parent)) {
			continue;
		}
		const required = entries.filter((e) => e.required).map((e) => e.flag);
		if (required.length === 0) {
			continue;
		}
		groups.push({
			parentName: parent,
			groupSetFlags: entries.filter((e) => !e.hasDefault).map((e) => e.flag),
			requiredFlags: required,
		});
	}
	return groups;
}

function arg(
	name: string,
	description: string,
	type: ArgType,
	required: boolean,
	positional: boolean,
	origin: Origin,
	cls: Classification
): Arg {
	return {
		name,
		description,
		type,
		choices: undefined,
		default: undefined,
		required,
		positional,
		origin,
		conflicts: undefined,
		implies: undefined,
		secret: false,
		fromFile: undefined,
		isZone: cls.isZone,
		isWorkerName: cls.isWorkerName,
	};
}

function pathParams(
	out: Arg[],
	op: OperationInfo,
	overrides: Overrides,
	method: Method,
	workers: boolean
): void {
	const detected = templateParams(op.path).filter(
		(name) =>
			!ACCOUNT_PATH_PARAMS.includes(name) &&
			accountOrZoneLocal(op.path, name) === undefined
	);
	const noPositionals =
		method.name === "list" || method.name.startsWith("bulk");
	const subject = noPositionals ? undefined : last(detected);
	for (const p of detected) {
		const o = Override.of(overrides, p);
		if (truthy(o.get("hidden"))) {
			continue;
		}
		const parameter = op.pathParams.find((a) => a.name === p);
		const cls = classify(flagName(p), workers);
		if (cls.isZone) {
			continue;
		}
		const defaultValue = o.nullish("default");
		const subjectPositional = p === subject;
		// Defaults fill URL segments without consuming a positional slot.
		const positional =
			!cls.isWorkerName &&
			defaultValue === undefined &&
			truthy(o.nullish("positional") ?? subjectPositional);
		const emitted = cls.isWorkerName
			? "worker"
			: parameter
				? parameterFlagName(parameter.name, parameter.sdkName)
				: cliFlagName(p);
		if (emitted === undefined) {
			continue;
		}
		const description =
			o.string("description") ??
			parameter?.description ??
			descriptionFromName(p);
		const a = arg(
			emitted,
			description,
			"string",
			defaultValue === undefined && truthy(o.nullish("required") ?? true),
			positional,
			{ in: "path", name: p },
			cls
		);
		a.default = defaultValue;
		out.push(a);
	}
}

function queryParams(
	out: Arg[],
	op: OperationInfo,
	overrides: Overrides,
	workers: boolean
): void {
	for (const p of op.queryParams) {
		const o = Override.of(overrides, p.name);
		if (truthy(o.get("hidden"))) {
			continue;
		}
		if (/[<>[\]{}~]/.test(p.name)) {
			continue;
		}
		const r = o.nullish("required");
		const required = r === undefined ? p.required : truthy(r);
		const dflt = o.nullish("default");
		const name = parameterFlagName(p.name, p.sdkName);
		if (name === undefined) {
			continue;
		}
		const description =
			o.string("description") ?? p.description ?? descriptionFromName(p.name);
		const isEnum = p.enumValues !== undefined && p.enumValues.length > 0;
		const type: ArgType = isEnum
			? "enum"
			: p.type === "number"
				? "number"
				: p.type === "boolean"
					? "boolean"
					: "string";
		const a = arg(
			name,
			description,
			type,
			required,
			false,
			{ in: "query", name: p.name },
			classify(flagName(p.name), workers)
		);
		if (isEnum) {
			a.choices = p.enumValues;
		}
		if (!(required || isEnum)) {
			a.default = dflt;
		}
		out.push(a);
	}
}

function headerParams(out: Arg[], op: OperationInfo, workers: boolean): void {
	for (const hp of op.headerParams) {
		const name = parameterFlagName(hp.name, hp.sdkName)?.toLowerCase();
		if (name === undefined) {
			continue;
		}
		if (out.some((a) => a.name === name)) {
			continue;
		}
		const description = hp.description ?? `The ${hp.name} header`;
		const cls = classify(flagName(hp.name).toLowerCase(), workers);
		out.push(
			arg(
				name,
				description,
				"string",
				hp.required,
				false,
				{ in: "header", name: hp.name },
				cls
			)
		);
	}
}

function bodyParams(
	out: Arg[],
	op: OperationInfo,
	overrides: Overrides,
	workers: boolean
): void {
	if (op.bodyParams.length === 0) {
		return;
	}
	const template = templateParams(op.path);
	const pathHasAccount = ACCOUNT_PATH_PARAMS.some((p) => template.includes(p));
	const pathHasZone = ZONE_PATH_PARAMS.some((p) => template.includes(p));
	for (const bp of op.bodyParams) {
		const name = cliFlagName(bp.name);
		if (name === undefined) {
			continue;
		}
		if (out.some((a) => a.name === name)) {
			continue;
		}
		const path = bp.apiFieldPath;
		const single = path.length === 1;
		const isAccountField =
			single && (path[0] === "account_id" || path[0] === "accountId");
		const isZoneField =
			single && (path[0] === "zone_id" || path[0] === "zoneId");
		if ((isAccountField || name === "account-id") && pathHasAccount) {
			continue;
		}
		if ((isZoneField || name === "zone-id") && pathHasZone) {
			continue;
		}
		if (CLI_ONLY_OPTIONS.includes(name) || name === "body" || name === "file") {
			continue;
		}
		const joined = path.join(".");
		// Field overrides target the exact wire path; parent objects do not
		// supply types, validation, file handling, or defaults to their children.
		const o = Override.of(overrides, joined);
		const rawChoices = o.get("choices");
		const overrideChoices = Array.isArray(rawChoices)
			? (rawChoices as readonly Value[]).map(stringOf)
			: undefined;
		const enumValues =
			overrideChoices !== undefined && overrideChoices.length > 0
				? overrideChoices
				: bp.enumValues !== undefined && bp.enumValues.length > 0
					? bp.enumValues
					: undefined;
		const cls = classify(name, workers);
		if (
			o.get("positional") === true &&
			single &&
			bp.type !== "boolean" &&
			bp.type !== "object" &&
			bp.itemType !== "object"
		) {
			const description =
				o.string("description") ?? bp.description ?? `The ${path[0]} field`;
			const r = o.nullish("required");
			const required = r === undefined ? bp.required : truthy(r);
			const array = o.get("array") === true;
			let type = bodyArgType(array ? "array" : bp.type, bp.itemType);
			if (type !== "array" && enumValues !== undefined) {
				type = "enum";
			}
			const a = arg(
				name,
				description,
				type,
				required,
				true,
				{ in: "body", path },
				cls
			);
			a.choices = enumValues;
			out.push(a);
			continue;
		}
		const effectiveType = o.get("array") === true ? "array" : bp.type;
		const r = o.nullish("required");
		const required = r === undefined ? bp.required : truthy(r);
		const fromFileOverride = o.nullish("fromFile");
		let fromFile: Arg["fromFile"];
		if (effectiveType !== "string" || fromFileOverride === false) {
			fromFile = undefined;
		} else if (truthy(fromFileOverride)) {
			const format = get(fromFileOverride, "format");
			fromFile = {
				format: format === undefined ? undefined : stringOf(format),
			};
		} else {
			fromFile = { format: "text" };
		}
		const hasDefaultOverride = o.present() && o.get("default") !== undefined;
		let effectiveDefault: Value | undefined;
		if (hasDefaultOverride) {
			const d = o.get("default");
			effectiveDefault = d === null ? undefined : d;
		} else {
			effectiveDefault = bp.default;
		}
		const nestedUnderOptional =
			path.length > 1 && !op.requestBodyRequired.includes(path[0] as string);
		const dflt = nestedUnderOptional ? undefined : effectiveDefault;
		const bodyType = bodyArgType(effectiveType, bp.itemType);
		const type: ArgType =
			bodyType === "objectArray" || bodyType === "objectMap"
				? bodyType
				: enumValues !== undefined
					? "enum"
					: bodyType;
		const base =
			o.string("description") ?? bp.description ?? `The ${joined} field`;
		let description = base;
		if (type === "objectArray") {
			const separator = /[.!?]$/.test(base) ? " " : ". ";
			description = `${base}${separator}Provide as a JSON array of objects or @path/to/file.json.`;
		}
		if (type === "objectMap") {
			const separator = /[.!?]\s*$/.test(base) ? " " : ". ";
			description = `${base.trimEnd()}${separator}Provide as a JSON object or @path/to/file.json.`;
		}
		if (type === "scalarUnion") {
			const separator = /[.!?]\s*$/.test(base) ? " " : ". ";
			description = `${base.trimEnd()}${separator}Accepts a JSON scalar or plain string, or @path/to/file.`;
		}
		const a = arg(
			name,
			description,
			type,
			required,
			false,
			{ in: "body", path },
			cls
		);
		if (type === "enum") {
			a.choices = enumValues;
		}
		a.default = dflt;
		a.fromFile = fromFile;
		a.conflicts = bp.conflicts;
		a.implies = bp.implies;
		a.secret = bp.sensitive;
		out.push(a);
	}
}
