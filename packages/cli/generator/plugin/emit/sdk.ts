/**
 * Typed calls: whether a command can make one, how it is written, and the
 * `Operation` it sends.
 *
 * A port of cf's `emit/sdk-path.ts`. A typed call used to be a call of a
 * Fern SDK method; it is now `client.send(operation, request)`, with the
 * same request, and an `operation` that tells the runtime what the method
 * did with it. Commands that could not make a typed call still send a
 * passthrough request with `requestApi`.
 */
import {
	ACCOUNT_PATH_PARAMS,
	accountOrZoneLocal,
	isBody,
	pathParamReadKey,
	queryArgs,
	ZONE_PATH_PARAMS,
} from "../args.js";
import {
	isArrayIndex,
	isIdentifier,
	obj,
	quote,
	stringify,
	templateParams,
	type Value,
} from "../js.js";
import { argvKey, type Ctx } from "./index.js";
import type { OperationInfo } from "../operation.js";

function property(name: string): string {
	return isIdentifier(name) ? name : quote(name);
}

function pathValue(ctx: Ctx, name: string): string {
	const local = accountOrZoneLocal(ctx.op.path, name);
	if (local !== undefined) {
		return local;
	}
	if (ACCOUNT_PATH_PARAMS.includes(name)) {
		return "accountId";
	}
	if (ZONE_PATH_PARAMS.includes(name)) {
		return ctx.firstPositionalIsZone ? "zone_id" : "zoneId";
	}
	if (
		ctx.needsWorkerName &&
		(name === "script_name" || name === "scriptName")
	) {
		return "scriptName";
	}
	return argvKey(pathParamReadKey(ctx.derived.args, name));
}

/** The request's fields for the placeholders of the path. */
function pathFields(ctx: Ctx): string[] {
	return templateParams(ctx.op.path).map(
		(name) => `${property(name)}: ${pathValue(ctx, name)}`
	);
}

function baseTypedGuards(ctx: Ctx): boolean {
	const blocking = ctx.requiredOptionArgs.some((a) => !isBody(a));
	return (
		// A path parameter renamed with `x-fern-parameter-name` is sent with a
		// passthrough request.
		!ctx.op.pathParams.some((p) => p.sdkName !== undefined) &&
		!ctx.hasHeaders &&
		!ctx.isRawOutput &&
		!blocking
	);
}

export function canEmitTypedCall(ctx: Ctx): boolean {
	const w = ctx.op.wire;
	const queryNames = queryArgs(ctx.derived).map((a) =>
		a.origin.in === "query" ? a.origin.name : ""
	);
	// A body without flags can be left to `--body` when it needs nothing,
	// and every parameter the request needs has a flag.
	const bodyOptional =
		w.hasRequest &&
		!w.bodyRequired &&
		!ctx.op.headerParams.some((p) => p.required) &&
		ctx.op.queryParams.every((p) => !p.required || queryNames.includes(p.name));
	const hasNoWireBody = !ctx.derived.hasBody || bodyOptional;
	return baseTypedGuards(ctx) && !ctx.derived.hasBodyParams && hasNoWireBody;
}

export function canEmitTypedJsonBodyCall(ctx: Ctx): boolean {
	return (
		baseTypedGuards(ctx) &&
		!ctx.derived.hasFileUpload &&
		ctx.derived.multipart === undefined &&
		ctx.op.wire.hasRequest
	);
}

export function canEmitTypedBodyCall(ctx: Ctx): boolean {
	return canEmitTypedJsonBodyCall(ctx) && ctx.derived.hasBodyParams;
}

function call(args: string): string {
	return args === ""
		? "client.send(operation)"
		: `client.send(operation, ${args})`;
}

export function typedCall(ctx: Ctx): string {
	if (!ctx.op.wire.hasRequest) {
		return call("");
	}
	// A body that needs none of its fields is sent empty.
	const fields =
		ctx.op.wire.body === "json" && ctx.derived.hasBody ? ["body: {}"] : [];
	fields.push(...pathFields(ctx));
	const hasQuery = queryArgs(ctx.derived).length > 0;
	if (fields.length === 0 && hasQuery) {
		return call("queryParams");
	}
	if (hasQuery) {
		fields.push("...queryParams");
	}
	return call(`{ ${fields.join(", ")} }`);
}

/** A typed call with the assembled or parsed `bodyData`. */
export function bodyCall(ctx: Ctx): string {
	const fields = ["body: bodyData"];
	fields.push(...pathFields(ctx));
	if (queryArgs(ctx.derived).length > 0) {
		fields.push("...queryParams");
	}
	return call(`{ ${fields.join(", ")} }`);
}

/** Reports whether the command makes a typed call, and so declares an `operation`. */
export function makesTypedCall(ctx: Ctx): boolean {
	if (ctx.isRawOutput) {
		return false;
	}
	const d = ctx.derived;
	const bypass =
		d.hasBody &&
		ctx.op.requestContentTypes.includes("application/json") &&
		(ctx.op.maxItems === undefined || ctx.op.maxItems <= 0) &&
		canEmitTypedJsonBodyCall(ctx);
	const assembled = d.hasBodyParams && canEmitTypedBodyCall(ctx);
	const plain = !d.hasBodyParams && !ctx.hasHeaders && canEmitTypedCall(ctx);
	return bypass || assembled || plain;
}

/**
 * The path of the module of the operation `operationId` in the output,
 * without its extension: its path in the group tree under `_operations/`, as
 * `_operations/d1/database/query` for `d1.database.query`.
 */
export function operationPath(operationId: string): string {
	return `_operations/${operationId.split(".").join("/")}`;
}

/**
 * The module of a command's operation, relative to the command's module,
 * which imports its operation from there.
 */
export function operationModule(ctx: Ctx): string {
	return `${ctx.root}${operationPath(ctx.method.operationId)}.js`;
}

/** Source code that `literal` prints as it is. */
const CODE = Symbol("code");
type Code = { readonly [CODE]: string };

function code(source: string): Value {
	return { [CODE]: source } as unknown as Value;
}

function isCode(value: unknown): value is Code {
	return typeof value === "object" && value !== null && CODE in value;
}

/** `s` escaped for the inside of a template literal. */
function escapeTemplate(s: string): string {
	return s.replace(/[`$\\]/g, (c) => `\\${c}`);
}

/**
 * Reports whether the module of an operation whose path is `template`
 * builds it with the runtime's `path` tag, and so imports it: when the path
 * has parameters.
 */
export function usesPathTag(template: string): boolean {
	return templateParams(template).length > 0;
}

/**
 * The function that returns a request's path for `template`, as code: each
 * `{name}` takes the request's field `name`, which the runtime's `path` tag
 * encodes as a path segment.
 */
function pathFunction(template: string): Value {
	if (!usesPathTag(template)) {
		return code(`() => ${quote(template)}`);
	}
	const body = escapeTemplate(template)
		// A placeholder's name has none of the characters escaped above.
		.replace(/\{([^}]+)\}/g, (_, name: string) =>
			isIdentifier(name) ? `\${request.${name}}` : `\${request[${quote(name)}]}`
		);
	return code(`(request: Record<string, unknown>) => path\`${body}\``);
}

/** The `Operation` that describes `op` for `Client.send`, as a literal. */
export function operationLiteral(op: OperationInfo): string {
	const w = op.wire;
	const query = op.queryParams.map((p) => p.name);
	const headers = op.headerParams.map((p) => p.name);
	const map = obj();
	map["method"] = op.method.toUpperCase();
	map["path"] = pathFunction(op.path);
	// A form body is made of the request's other fields, so it has to know
	// which ones the path takes.
	const pathParams = [...new Set(templateParams(op.path))];
	if (w.body === "form" && pathParams.length > 0) {
		map["pathParams"] = pathParams;
	}
	if (query.length > 0) {
		map["query"] = query;
	}
	if (w.joined.length > 0) {
		map["joined"] = w.joined;
	}
	if (headers.length > 0) {
		map["headers"] = headers;
	}
	if (w.body !== undefined) {
		map["body"] = w.body;
		if (
			w.body === "json" &&
			w.contentType !== undefined &&
			w.contentType !== "application/json"
		) {
			map["contentType"] = w.contentType;
		}
	}
	if (Object.keys(w.constants).length > 0) {
		map["constants"] = w.constants;
	}
	if (w.noResponse) {
		map["response"] = false;
	} else if (w.responseType !== undefined) {
		map["response"] = w.responseType;
	}
	if (w.errors.length > 0) {
		map["errors"] = obj(w.errors);
	}
	return literal(map, 0);
}

/**
 * Prints `value` as a TypeScript literal: an object a property per line,
 * with bare keys where they can be, and arrays on one line.
 */
function literal(value: Value, depth: number): string {
	if (isCode(value)) {
		return value[CODE];
	}
	if (Array.isArray(value)) {
		return `[${(value as readonly Value[]).map((i) => literal(i, depth)).join(", ")}]`;
	}
	if (typeof value === "object" && value !== null) {
		const indent = "  ".repeat(depth + 1);
		let out = "{\n";
		for (const [k, v] of Object.entries(value)) {
			const key = isIdentifier(k) || isArrayIndex(k) ? k : quote(k);
			out += `${indent}${key}: ${literal(v, depth + 1)},\n`;
		}
		out += "  ".repeat(depth);
		out += "}";
		return out;
	}
	return stringify(value);
}
