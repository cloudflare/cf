/**
 * Builders for the tests of the forge plugin in `generator/plugin`, which
 * generates cf's commands. Deriving arguments and emitting a command read
 * only the resolved operation, so tests call them directly; reading a
 * document takes forge, which `generateFiles` runs.
 */

import {
	context as emitContext,
	type Ctx,
} from "../../../generator/plugin/emit/index.js";
import { generateFiles } from "./forge-cli.js";
import type { Arg, ArgType, Origin } from "../../../generator/plugin/args.js";
import type { Method } from "../../../generator/plugin/commands.js";
import type {
	BodyParamInfo,
	OperationInfo,
	ParameterInfo,
	ResponseInfo,
	Wire,
} from "../../../generator/plugin/operation.js";

export { generateFiles };

/** A method named `name` for the operation `operationId`. */
export function method(
	name: string,
	operationId: string,
	rest: Partial<Method> = {}
): Method {
	return {
		kind: "method",
		name,
		operationId,
		deprecated: false,
		description: "Example operation",
		hasArgs: false,
		...rest,
	};
}

/** A required string parameter named `name`, renamed to `sdkName`. */
export function param(
	name: string,
	sdkName?: string,
	rest: Partial<ParameterInfo> = {}
): ParameterInfo {
	return { name, sdkName, required: true, type: "string", ...rest };
}

/** An optional body property named `name`, of type `type`, at `path`. */
export function bodyParam(
	name: string,
	type: string,
	path: string[],
	rest: Partial<BodyParamInfo> = {}
): BodyParamInfo {
	return {
		name,
		type,
		apiFieldPath: path,
		required: false,
		sensitive: false,
		...rest,
	};
}

/** A `200` response with a JSON body. */
export function jsonOk(): [string, ResponseInfo][] {
	return [["200", { content: ["application/json"] }]];
}

/** An operation `method path` with a JSON response and nothing else. */
export function operation(
	httpMethod: string,
	path: string,
	rest: Partial<OperationInfo> = {}
): OperationInfo {
	return {
		path,
		method: httpMethod,
		pathParams: [],
		queryParams: [],
		headerParams: [],
		bodyParams: [],
		hasRequestBody: false,
		requestBodyMandatory: false,
		requestContentTypes: [],
		requestBodyRequired: [],
		requestBodyIsArray: false,
		responses: jsonOk(),
		wire: wire(),
		...rest,
	};
}

/** An optional, non-positional argument `name` of type `type` from `origin`. */
export function arg(
	name: string,
	type: ArgType,
	origin: Origin,
	rest: Partial<Arg> = {}
): Arg {
	return {
		name,
		description: `${name} description`,
		type,
		required: false,
		positional: false,
		origin,
		secret: false,
		isZone: false,
		isWorkerName: false,
		...rest,
	};
}

/** The names of `args`. */
export function names(args: readonly Arg[]): string[] {
	return args.map((a) => a.name);
}

/** The argument of `args` named `name`. */
export function find(args: readonly Arg[], name: string): Arg {
	const found = args.find((a) => a.name === name);
	if (!found) {
		throw new Error(`no argument ${name} in ${names(args).join(", ")}`);
	}
	return found;
}

/** The emit context of a command of `resource` with no group. */
export function context(m: Method, resource: string, op: OperationInfo): Ctx {
	return emitContext(m, resource, undefined, op, "./")[0];
}

/** How a typed call sends an operation, with nothing but `rest`. */
export function wire(rest: Partial<Wire> = {}): Wire {
	return {
		hasRequest: false,
		bodyRequired: false,
		joined: [],
		constants: {},
		noResponse: false,
		errors: [],
		...rest,
	};
}
