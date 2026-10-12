/**
 * Typed calls: whether a command can make one, and how it is written.
 *
 * A typed call is `client.send(operation, request)`, where `operation` is
 * the command's `Operation` from `_operations/` and `request` is one object
 * of the path, query and body fields. Commands that cannot make one send a
 * passthrough request with `requestApi`.
 */
import { CLI_ONLY_OPTIONS } from "../arg-derivation.js";
import { argvKey } from "../codegen/identifiers.js";
import {
	isPathArg,
	optionArgs,
	pathParamReadKey,
	queryArgs,
} from "../intermediate-representation.js";
import {
	ACCOUNT_PATH_PARAMS,
	accountOrZonePathParamLocal,
	extractTemplateParams,
	ZONE_PATH_PARAMS,
} from "../util.js";
import type { DerivedArgs } from "../arg-derivation.js";
import type { ArgIR } from "../intermediate-representation.js";
import type { EmitContext } from "./context.js";
import type { OperationInfo } from "@cloudflare/forge";

export interface PathBookkeeping {
	allPathParamNames: string[];
	requiredOptionArgs: ArgIR[];
}

function property(name: string): string {
	return /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name);
}

function pathValue(ctx: EmitContext, name: string): string {
	const accountOrZoneLocal = accountOrZonePathParamLocal(ctx.opInfo.path, name);
	if (accountOrZoneLocal !== undefined) {
		return accountOrZoneLocal;
	}
	if (ACCOUNT_PATH_PARAMS.has(name)) return "accountId";
	if (ZONE_PATH_PARAMS.has(name)) {
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
function pathFields(ctx: EmitContext): string[] {
	return extractTemplateParams(ctx.opInfo.path).map(
		(name) => `${property(name)}: ${pathValue(ctx, name)}`
	);
}

function baseTypedGuards(ctx: EmitContext): boolean {
	// requiredOptionArgs includes required body fields that body assembly already
	// handles. Only non-body required options (rare oneOf promotions that are not
	// body-origin) should block typed emission.
	const blockingRequiredOptions = ctx.requiredOptionArgs.some(
		(arg) => arg.origin.kind !== "body"
	);
	return (
		// A path parameter renamed with `x-fern-parameter-name` is sent with a
		// passthrough request.
		!ctx.opInfo.pathParams.some((p) => p.sdkName !== undefined) &&
		!ctx.hasHeaders &&
		!ctx.isRawOutput &&
		!blockingRequiredOptions
	);
}

/**
 * A typed call when every field the request needs comes from path/query
 * context. Real JSON bodies use {@link canEmitTypedBodyCall}.
 */
export function canEmitTypedCall(ctx: EmitContext): boolean {
	const { wire } = ctx;
	const queryNames = queryArgs(ctx.derived.args).flatMap((arg) =>
		arg.origin.kind === "query" ? [arg.origin.wireName] : []
	);
	// A body without flags can be left to `--body` when it needs nothing,
	// and every parameter the request needs has a flag.
	const bodyOptional =
		wire.hasRequest &&
		!wire.bodyRequired &&
		!ctx.opInfo.headerParams.some((p) => p.required) &&
		ctx.opInfo.queryParams.every(
			(p) => !p.required || queryNames.includes(p.name)
		);
	const hasNoWireBody = !ctx.derived.hasBody || bodyOptional;
	return baseTypedGuards(ctx) && !ctx.derived.hasBodyParams && hasNoWireBody;
}

/**
 * A typed call with a JSON body: parsed from `--body`, or assembled from
 * per-field flags into `bodyData`. Not for multipart, raw or header-bearing
 * shapes.
 */
export function canEmitTypedJsonBodyCall(ctx: EmitContext): boolean {
	return (
		baseTypedGuards(ctx) &&
		!ctx.derived.hasFileUpload &&
		ctx.derived.multipartInfo === undefined &&
		ctx.wire.hasRequest
	);
}

export function canEmitTypedBodyCall(ctx: EmitContext): boolean {
	return canEmitTypedJsonBodyCall(ctx) && ctx.derived.hasBodyParams;
}

function call(args: string): string {
	return args === ""
		? "client.send(operation)"
		: `client.send(operation, ${args})`;
}

export function typedCall(ctx: EmitContext): string {
	if (!ctx.wire.hasRequest) return call("");
	// A body that needs none of its fields is sent empty.
	const fields =
		ctx.wire.body === "json" && ctx.derived.hasBody ? ["body: {}"] : [];
	fields.push(...pathFields(ctx));
	const hasQuery = queryArgs(ctx.derived.args).length > 0;
	if (fields.length === 0 && hasQuery) {
		return call("queryParams");
	}
	if (hasQuery) fields.push("...queryParams");
	return call(`{ ${fields.join(", ")} }`);
}

/** A typed call with the assembled or parsed `bodyData`. */
export function typedBodyCall(ctx: EmitContext): string {
	const fields = ["body: bodyData", ...pathFields(ctx)];
	if (queryArgs(ctx.derived.args).length > 0) {
		fields.push("...queryParams");
	}
	return call(`{ ${fields.join(", ")} }`);
}

/** Reports whether the command makes a typed call, and so imports its `operation`. */
export function makesTypedCall(ctx: EmitContext): boolean {
	if (ctx.isRawOutput) return false;
	const { derived, opInfo } = ctx;
	const bypass =
		derived.hasBody &&
		opInfo.requestContentTypes.includes("application/json") &&
		(opInfo.maxItems === undefined || opInfo.maxItems <= 0) &&
		canEmitTypedJsonBodyCall(ctx);
	const assembled = derived.hasBodyParams && canEmitTypedBodyCall(ctx);
	const plain =
		!derived.hasBodyParams && !ctx.hasHeaders && canEmitTypedCall(ctx);
	return bypass || assembled || plain;
}

/**
 * The module of a command's operation, relative to the command's module:
 * its path in the generated tree under `_operations/`, as
 * `../../_operations/dns/records/create.js` for `dns/records/create.ts`.
 */
export function operationModule(emitPath: string): string {
	const path = emitPath.replace(/\.ts$/, "");
	const depth = path.split("/").length - 1;
	const root = depth === 0 ? "./" : "../".repeat(depth);
	return `${root}${operationPath(path)}.js`;
}

/** The path of an operation's module in the generated tree, without its extension. */
export function operationPath(commandPath: string): string {
	return `_operations/${commandPath}`;
}

/** Compute path names and required non-query options used by handler emitters. */
export function computePathBookkeeping(input: {
	opInfo: OperationInfo;
	derived: DerivedArgs;
}): PathBookkeeping {
	const { opInfo, derived } = input;
	const allPathParamNames = [
		...new Set([
			...opInfo.pathParams.map((parameter) => parameter.name),
			...extractTemplateParams(opInfo.path),
		]),
	];
	const requiredOptionArgs = optionArgs(derived.args).filter(
		(option) =>
			option.required &&
			!CLI_ONLY_OPTIONS.has(option.name) &&
			option.origin.kind !== "query" &&
			!isPathArg(option) &&
			!option.isWorkerName
	);
	return { allPathParamNames, requiredOptionArgs };
}
