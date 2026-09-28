/** Emit Fern's object-shaped typed request from cf's existing argument IR. */
import { toKebabCase } from "@cloudflare/forge";
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

function target(ctx: EmitContext): string {
	const entry = ctx.sdkMapEntry;
	if (entry === undefined) {
		throw new Error(`Missing Fern SDK map entry: ${ctx.method.operationId}`);
	}
	return `client.${[...entry.accessor, entry.method].join(".")}`;
}

/**
 * True when this op has a Fern request type we can emit a typed call
 * against (object-shaped request with path/query fully supplied).
 */
function hasTypedRequest(ctx: EmitContext): boolean {
	return (
		ctx.sdkMapEntry?.requestType !== undefined &&
		(canEmitTypedSdkCall(ctx) || canEmitTypedJsonBodySdkCall(ctx))
	);
}

export function usesTypedQuery(ctx: EmitContext): boolean {
	return ctx.hasParams && hasTypedRequest(ctx);
}

function queryNeedsTypeRefinement(ctx: EmitContext, arg: ArgIR): boolean {
	if (arg.origin.kind !== "query") return false;
	const { wireName } = arg.origin;
	const parameter = ctx.opInfo.queryParams.find(
		(candidate) => candidate.name === wireName
	);
	return (
		!!parameter?.enumValues?.length ||
		(parameter?.type === "array" &&
			(parameter.itemType !== "string" ||
				!!parameter.itemEnumValues?.length)) ||
		parameter?.composed === true ||
		parameter?.type === "object" ||
		parameter?.type === "unknown" ||
		(parameter?.required === true && arg.isZone)
	);
}

function typedArgOverrides(ctx: EmitContext): string[] {
	const overrides: string[] = [];
	if (usesTypedQuery(ctx)) {
		for (const arg of queryArgs(ctx.derived.args)) {
			if (arg.origin.kind !== "query" || !queryNeedsTypeRefinement(ctx, arg)) {
				continue;
			}
			overrides.push(
				`${JSON.stringify(toKebabCase(arg.name))}: Query[${JSON.stringify(arg.origin.wireName)}];`
			);
		}
	}

	const entry = ctx.sdkMapEntry;
	if (entry !== undefined && hasTypedRequest(ctx)) {
		const forgeNames = extractTemplateParams(ctx.opInfo.path);
		const fernNames = extractTemplateParams(entry.path);
		if (forgeNames.length === fernNames.length) {
			for (const [index, forgeName] of forgeNames.entries()) {
				const fernName = fernNames[index];
				if (fernName === undefined || ACCOUNT_PATH_PARAMS.has(fernName))
					continue;
				const parameter = ctx.opInfo.pathParams.find(
					(candidate) => candidate.name === forgeName
				);
				const needsRefinement =
					parameter?.enumValues !== undefined ||
					entry.numericRequestProperties?.includes(fernName) === true;
				if (!needsRefinement) continue;
				const value = pathValue(ctx, forgeName);
				const match = value.match(/^argv\[(.+)\]$/);
				if (!match?.[1]) continue;
				overrides.push(`${match[1]}: Request[${JSON.stringify(fernName)}];`);
			}
		}
	}
	return overrides;
}

export function typedBuilderDeclaration(ctx: EmitContext): string | undefined {
	const overrides = typedArgOverrides(ctx);
	if (overrides.length === 0) return undefined;
	return [
		"const typedBuilder = withArgTypes<",
		"  {",
		...overrides.map((override) => `    ${override}`),
		"  },",
		"  typeof builder",
		">(builder);",
	].join("\n");
}

export function typedSdkTypeAliases(ctx: EmitContext): string[] {
	if (!hasTypedRequest(ctx)) return [];
	const hasPathFields = (pathFields(ctx)?.length ?? 0) > 0;
	const usesTypedBody = ctx.derived.hasBody && canEmitTypedJsonBodySdkCall(ctx);
	const isPureQuery =
		canEmitTypedSdkCall(ctx) && !hasPathFields && ctx.hasParams;
	const aliases: string[] = [];
	if (usesTypedBody || !isPureQuery) {
		aliases.push(
			`type Request = SdkRequest<${JSON.stringify(ctx.method.operationId)}>;`
		);
	}
	if (usesTypedBody) aliases.push(`type Body = ${typedBodyType(ctx)};`);
	if (usesTypedQuery(ctx)) {
		aliases.push(
			`type Query = SdkQuery<${JSON.stringify(ctx.method.operationId)}>;`
		);
	}
	return aliases;
}

function pathValue(ctx: EmitContext, name: string): string {
	const accountOrZoneLocal = accountOrZonePathParamLocal(ctx.opInfo.path, name);
	if (accountOrZoneLocal !== undefined) {
		return accountOrZoneLocal;
	}
	if (ACCOUNT_PATH_PARAMS.has(name)) return "accountId";
	if (name === "zone_id" || name === "zone_identifier" || name === "zoneId") {
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

function pathFields(ctx: EmitContext): string[] | undefined {
	const entry = ctx.sdkMapEntry;
	if (entry === undefined) return undefined;
	const forgeNames = extractTemplateParams(ctx.opInfo.path);
	const fernNames = extractTemplateParams(entry.path);
	if (forgeNames.length !== fernNames.length) return undefined;

	return fernNames.flatMap((fernName, index) => {
		const forgeName = forgeNames[index];
		if (forgeName === undefined) return [];
		const value = pathValue(ctx, forgeName);
		const parameter = ctx.opInfo.pathParams.find(
			(candidate) => candidate.name === forgeName
		);
		// Only numeric path params need coercion; strings, booleans, enums
		// and untyped params all pass through as-is.
		const rendered = parameter?.type === "number" ? `Number(${value})` : value;
		return [`${property(fernName)}: ${rendered}`];
	});
}

function baseTypedGuards(ctx: EmitContext): boolean {
	// requiredOptionArgs includes required body fields that body assembly already
	// handles. Only non-body required options (rare oneOf promotions that are not
	// body-origin) should block typed emission.
	const blockingRequiredOptions = ctx.requiredOptionArgs.some(
		(arg) => arg.origin.kind !== "body"
	);
	return (
		ctx.sdkMapEntry !== undefined &&
		pathFields(ctx) !== undefined &&
		!ctx.hasHeaders &&
		!ctx.isRawOutput &&
		!blockingRequiredOptions
	);
}

/**
 * Typed Fern call when all required SDK request fields come from path/query
 * context. Real JSON bodies use {@link canEmitTypedBodySdkCall}.
 */
export function canEmitTypedSdkCall(ctx: EmitContext): boolean {
	const entry = ctx.sdkMapEntry;
	const fernPathNames = entry ? extractTemplateParams(entry.path) : [];
	const queryNames = queryArgs(ctx.derived.args).flatMap((arg) =>
		arg.origin.kind === "query" ? [arg.origin.wireName] : []
	);
	const suppliedProperties = new Set([...fernPathNames, ...queryNames]);
	const requiredProperties = entry?.requiredRequestProperties;
	const noPayloadRequired =
		entry?.requestBodyProperty === undefined &&
		requiredProperties !== undefined &&
		requiredProperties.every((name) => suppliedProperties.has(name));
	const hasNoWireBody = !ctx.derived.hasBody || noPayloadRequired;
	return baseTypedGuards(ctx) && !ctx.derived.hasBodyParams && hasNoWireBody;
}

/**
 * Typed Fern call after per-field body assembly into `bodyData`.
 * Only for JSON body-param shapes (no multipart / raw / headers).
 */
export function canEmitTypedJsonBodySdkCall(ctx: EmitContext): boolean {
	return (
		baseTypedGuards(ctx) &&
		!ctx.derived.hasFileUpload &&
		ctx.derived.multipartInfo === undefined &&
		// Scalar Fern request parameters have no request type in sdk-map.json and
		// cannot accept cf's object-shaped JSON body.
		ctx.sdkMapEntry?.requestType !== undefined
	);
}

export function canEmitTypedBodySdkCall(ctx: EmitContext): boolean {
	return canEmitTypedJsonBodySdkCall(ctx) && ctx.derived.hasBodyParams;
}

export function typedBodyType(ctx: EmitContext): string {
	const requestBodyProperty = ctx.sdkMapEntry?.requestBodyProperty;
	return requestBodyProperty === undefined
		? "Request"
		: `Request[${JSON.stringify(requestBodyProperty)}]`;
}

export function typedSdkCall(ctx: EmitContext): string {
	const method = target(ctx);
	if (ctx.sdkMapEntry?.requestType === undefined) return `${method}()`;
	const input = "Request";
	const fields = pathFields(ctx) ?? [];
	const hasQuery = queryArgs(ctx.derived.args).length > 0;
	if (fields.length === 0 && hasQuery) {
		return `${method}(queryParams)`;
	}
	if (hasQuery) fields.push("...queryParams");
	return `${method}({ ${fields.join(", ")} } satisfies ${input})`;
}

/** Like {@link typedSdkCall}, but merges assembled JSON `bodyData`. */
function bodySdkCall(ctx: EmitContext): string {
	const method = target(ctx);
	const input = "Request";
	const fields: string[] = [];

	// sdk-map.json is derived from Fern's generated client and records the
	// actual wrapper property when Fern destructures a request payload.
	const requestBodyProperty = ctx.sdkMapEntry?.requestBodyProperty;
	if (requestBodyProperty !== undefined) {
		const body = "bodyData";
		fields.push(property(requestBodyProperty) + ": " + body);
	} else {
		fields.push("...bodyData");
	}
	fields.push(...(pathFields(ctx) ?? []));

	if (queryArgs(ctx.derived.args).length > 0) {
		fields.push("...queryParams");
	}
	return `${method}({ ${fields.join(", ")} } satisfies ${input})`;
}

/** Emit a typed Fern call from a parsed body value. */
export function typedParsedBodySdkCall(ctx: EmitContext): string {
	return bodySdkCall(ctx);
}

/** Emit a typed Fern call from the dynamically assembled body object. */
export function typedBodySdkCall(ctx: EmitContext): string {
	return bodySdkCall(ctx);
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
