import { toKebabCase } from "@cloudflare/forge";

export type IRArgType =
	| "string"
	| "number"
	| "boolean"
	| /* arrays with fixed values (yargs "choices") */ "enum"
	| /* repeatable arrays of scalar values */ "array"
	| /* one JSON-valued flag containing an array of objects */ "object-array";

/**
 * Where an `ArgIR` came from — the arg and its provenance travel
 * together so consumers route it (path / query / header / body) without
 * a side lookup.
 *
 *   - `path`   — `wireName` is the URL template placeholder (subject →
 *     positional, container → required flag).
 *   - `query`  — `wireName` is the original OpenAPI spelling
 *     (`per_page`, `name.exact`) the query bag must use.
 *   - `header` — `wireName` is the original header name
 *     (`cf-r2-jurisdiction`).
 *   - `body`   — `apiFieldPath` is the nested JSON path the flat CLI
 *     flag reconstructs (`['from', 'name']` for `--from-name`).
 */
export type OriginIR =
	| { kind: "path"; wireName: string }
	| { kind: "query"; wireName: string }
	| { kind: "header"; wireName: string }
	| { kind: "body"; apiFieldPath: string[] };

export interface ArgIR {
	/** kebab-case CLI flag — also the argv read key (the name yargs registers). */
	name: string;

	description: string;

	type: IRArgType;
	/** enum allowed values; `undefined` for non-enum args. */
	choices?: string[];
	/** Default value, or `undefined` for none. Emitted verbatim by yargs. */
	default?: string | number | boolean;
	/** `paramOverride.required ?? spec.required ?? false`. */
	required: boolean;

	/** Positional (vs option flag) placement. */
	positional: boolean;

	origin: OriginIR;
	conflicts?: string[];
	implies?: string[];
	secret?: boolean;
	fromFile?: { format: "text" | "binary" | "base64" | "json" };

	/**
	 * Precomputed name-based classifications so consumers don't re-run the
	 * predicates. `isZone` mirrors forge's `isZoneArg`; `isWorkerName` is
	 * `true` only for the `--worker` path param under `cf workers`.
	 */
	isZone: boolean;
	isWorkerName: boolean;
}

/**
 * Narrow a raw OpenAPI body-param type (typed `string` by forge) to the
 * IR's scalar/array kinds. Object-typed params are flattened upstream,
 * except for direct arrays of objects: Forge keeps those intact and marks
 * them with `itemType: "object"` so the CLI can accept one lossless JSON
 * value. Unknown values fall back to `string`.
 */
export function bodyParamArgType(type: string, itemType?: string): IRArgType {
	if (type === "number") return "number";
	if (type === "boolean") return "boolean";
	if (type === "array" && itemType === "object") return "object-array";
	if (type === "array") return "array";
	return "string";
}

/** Positional args, in declaration order. */
export function positionalArgs(args: readonly ArgIR[]): ArgIR[] {
	return args.filter((a) => a.positional);
}

/** Option (non-positional) args, in declaration order. */
export function optionArgs(args: readonly ArgIR[]): ArgIR[] {
	return args.filter((a) => !a.positional);
}

/**
 * Body-param option args: body origin, not promoted to a positional.
 * In declaration order.
 */
export function bodyOptionArgs(args: readonly ArgIR[]): ArgIR[] {
	return args.filter((a) => a.origin.kind === "body" && !a.positional);
}

/** Query-param args, in declaration order. */
export function queryArgs(args: readonly ArgIR[]): ArgIR[] {
	return args.filter((a) => a.origin.kind === "query");
}

/** Header-param args, in declaration order. */
export function headerArgs(args: readonly ArgIR[]): ArgIR[] {
	return args.filter((a) => a.origin.kind === "header");
}

/** Whether the arg fills a URL template placeholder. */
export function isPathArg(arg: ArgIR): boolean {
	return arg.origin.kind === "path";
}

/**
 * The argv key that holds the value for the `{wireName}` path
 * placeholder. The emitted flag or positional may be renamed by
 * `x-fern-parameter-name`, so the key comes from the matching path arg.
 * Worker-name params keep the wire spelling, which yargs registers as an
 * alias of `--worker`; placeholders with no arg (zone, account, hidden)
 * fall back to the wire spelling too.
 */
export function pathParamReadKey(
	args: readonly ArgIR[],
	wireName: string
): string {
	const arg = args.find(
		(a) =>
			a.origin.kind === "path" &&
			a.origin.wireName === wireName &&
			!a.isWorkerName
	);
	return toKebabCase(arg?.name ?? wireName);
}

/**
 * The arg's scalar type for both the yargs `{ type }` literal and the
 * metadata sidecar — enum / array / object-array all collapse to `string`.
 * Yargs handles scalar array-ness separately, while object arrays arrive as
 * one JSON string and are parsed by the generated handler.
 */
export function argScalarType(d: ArgIR): "string" | "number" | "boolean" {
	if (d.type === "number") return "number";
	if (d.type === "boolean") return "boolean";
	return "string";
}

/**
 * Enum choices as a TypeScript union literal (`'a' | 'b'`) for cast
 * expressions, or the scalar type name otherwise.
 */
export function argToTsType(d: ArgIR): string {
	if (d.type === "enum" && d.choices && d.choices.length > 0)
		return d.choices.map((v) => `'${v}'`).join(" | ");
	return argScalarType(d);
}
