/**
 * How a typed call sends an operation: the facts `Client.send` reads from the
 * operation's `Operation` literal in `_operations/`, and which the emitters
 * use to decide whether a command can make a typed call at all.
 *
 * These follow the rules of the Fern SDK the commands called before, so a
 * typed call sends the same request it always has. Most of them need the
 * spec's request body and parameters, which `OperationInfo` summarises, so
 * they are read from the OpenAPI document Forge was initialised with.
 */
import { resolveDocRef } from "@cloudflare/forge";
import { extractTemplateParams } from "../util.js";
import type { OperationInfo } from "@cloudflare/forge";

export interface Wire {
	/**
	 * Whether a typed call passes a request: not for a raw body alone, nor
	 * with no parameters and no object or form body.
	 */
	hasRequest: boolean;
	/** The body's kind, if a typed call sends one. */
	body?: "json" | "form";
	/**
	 * Whether the body must be passed: the operation requires it, it is not a
	 * JSON object or a form, or it has fields that must be set, other than
	 * ones with a single allowed value, which are filled in.
	 */
	bodyRequired: boolean;
	/**
	 * Whether the operation requires its JSON body, which is an object with
	 * fields: sent empty, it would say nothing.
	 */
	requestBodyMandatory: boolean;
	/** The query parameters whose arrays are joined with commas. */
	joined: string[];
	/** Body fields with a single allowed value, which are always sent. */
	constants: Record<string, string | boolean>;
	/** The media type of the body. */
	contentType?: string;
	/** Whether the response has no body to return. */
	noResponse: boolean;
	/** How the response body is read, when not as JSON. */
	responseType?: "binary-response" | "text";
	/** The names of the errors for the statuses the operation declares. */
	errors: [string, string][];
}

type SchemaObject = Record<string, unknown>;

interface RawParameter {
	name?: string;
	in?: string;
	explode?: boolean;
}

interface RawRequestBody {
	required?: boolean;
	content?: Record<string, { schema?: SchemaObject } | undefined>;
}

interface RawOperation {
	parameters?: unknown[];
	requestBody?: unknown;
}

const ERRORS: Readonly<Record<string, string>> = {
	"400": "BadRequestError",
	"401": "UnauthorizedError",
	"403": "ForbiddenError",
	"404": "NotFoundError",
	"405": "MethodNotAllowedError",
	"408": "RequestTimeoutError",
	"409": "ConflictError",
	"410": "GoneError",
	"412": "PreconditionFailedError",
	"413": "ContentTooLargeError",
	"415": "UnsupportedMediaTypeError",
	"422": "UnprocessableEntityError",
	"423": "LockedError",
	"429": "TooManyRequestsError",
	"499": "ClientClosedRequestError",
	"500": "InternalServerError",
	"501": "NotImplementedError",
	"502": "BadGatewayError",
	"503": "ServiceUnavailableError",
	"504": "GatewayTimeoutError",
	"507": "InsufficientStorageError",
};

function isRecord(value: unknown): value is SchemaObject {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * `value`, through every `$ref`, and every `oneOf`/`anyOf` of a single
 * schema, which is that schema.
 */
function deref(value: unknown): SchemaObject | undefined {
	let current: unknown = value;
	for (let i = 0; i < 64; i++) {
		const resolved: unknown = resolveDocRef(current);
		if (!isRecord(resolved)) {
			return undefined;
		}
		const members = resolved["oneOf"] ?? resolved["anyOf"];
		if (!Array.isArray(members) || members.length !== 1) {
			return resolved;
		}
		current = members[0];
	}
	return undefined;
}

function isNullSchema(schema: unknown): boolean {
	const s = deref(schema);
	if (s === undefined) {
		return false;
	}
	const values = s["enum"];
	return (
		s["type"] === "null" ||
		(Array.isArray(values) && values.length === 1 && values[0] === null)
	);
}

/**
 * The one member of a `oneOf`/`anyOf` other than null, or else `schema`:
 * what a nullable schema is without its null. The member is left as it is,
 * reference and all.
 */
function unwrapNull(schema: SchemaObject): SchemaObject {
	const members = schema["oneOf"] ?? schema["anyOf"];
	if (Array.isArray(members)) {
		const nonNull = members.filter((m) => !isNullSchema(m));
		if (nonNull.length === 1 && isRecord(nonNull[0])) {
			return nonNull[0];
		}
	}
	return schema;
}

function properties(schema: SchemaObject): [string, unknown][] {
	const props = schema["properties"];
	return isRecord(props) ? Object.entries(props) : [];
}

/**
 * Reports whether a body of type `schema` is an object: one with properties,
 * or an intersection.
 */
function isObject(schema: SchemaObject): boolean {
	const s = unwrapNull(schema);
	if (s["$ref"] !== undefined) {
		return false;
	}
	if (Array.isArray(s["allOf"])) {
		return true;
	}
	if (Array.isArray(s["oneOf"]) || Array.isArray(s["anyOf"])) {
		return false;
	}
	return properties(s).length > 0;
}

/** The one value a schema allows, when it allows one string or boolean. */
function literal(schema: unknown): string | boolean | undefined {
	const resolved = deref(schema);
	if (resolved === undefined) {
		return undefined;
	}
	const s = unwrapNull(resolved);
	const values = Array.isArray(s["enum"])
		? (s["enum"] as unknown[]).filter((v) => v !== null)
		: "const" in s
			? [s["const"]]
			: undefined;
	if (values?.length === 1) {
		const value = values[0];
		if (typeof value === "string" || typeof value === "boolean") {
			return value;
		}
	}
	return undefined;
}

/**
 * The required properties of an object body `schema`, and those with a
 * single allowed value, which are always sent. A read-only property is left
 * out of both.
 */
function objectBody(schema: SchemaObject): {
	required: string[];
	constants: Record<string, string | boolean>;
} {
	const fields: [string, unknown][] = [];
	const collect = (value: unknown, depth: number) => {
		if (depth > 8) {
			return;
		}
		const resolved = deref(value);
		if (resolved === undefined) {
			return;
		}
		const s = unwrapNull(resolved);
		const allOf = s["allOf"];
		if (Array.isArray(allOf)) {
			for (const member of allOf) {
				collect(member, depth + 1);
			}
			return;
		}
		const required = Array.isArray(s["required"]) ? s["required"] : [];
		for (const [name, property] of properties(s)) {
			if (required.includes(name) && !fields.some(([n]) => n === name)) {
				fields.push([name, property]);
			}
		}
	};
	collect(schema, 0);
	const required: string[] = [];
	const constants: Record<string, string | boolean> = {};
	for (const [name, property] of fields) {
		if (isRecord(property) && property["readOnly"] === true) {
			continue;
		}
		if (deref(property)?.["readOnly"] === true) {
			continue;
		}
		const value = literal(property);
		if (value !== undefined) {
			constants[name] = value;
			continue;
		}
		required.push(name);
	}
	return { required, constants };
}

/** The operation `opInfo` resolves, as the document Forge loaded spells it. */
function rawOperation(opInfo: OperationInfo): {
	operation: RawOperation | undefined;
	parameters: RawParameter[];
} {
	const paths = deref({ $ref: "#/paths" });
	const pathItem = deref(paths?.[opInfo.path]);
	const operation = deref(pathItem?.[opInfo.method]) as
		| RawOperation
		| undefined;
	const merged = new Map<string, RawParameter>();
	for (const parameter of [
		...((pathItem?.["parameters"] as unknown[] | undefined) ?? []),
		...(operation?.parameters ?? []),
	]) {
		const resolved = deref(parameter) as RawParameter | undefined;
		if (resolved?.name !== undefined && resolved.in !== undefined) {
			merged.set(`${resolved.in}:${resolved.name}`, resolved);
		}
	}
	return { operation, parameters: [...merged.values()] };
}

/** How a typed call sends the operation `opInfo` resolves. */
export function operationWire(opInfo: OperationInfo): Wire {
	const { operation, parameters } = rawOperation(opInfo);
	const noParams =
		opInfo.pathParams.length === 0 &&
		opInfo.queryParams.length === 0 &&
		opInfo.headerParams.length === 0;

	// Operations a test builds by hand have no document to read; their
	// content types are all they say of their bodies.
	const requestBody: RawRequestBody | undefined =
		operation === undefined
			? opInfo.hasRequestBody
				? {
						content: Object.fromEntries(
							opInfo.requestContentTypes.map((ct) => [ct, {}])
						),
					}
				: undefined
			: (deref(operation.requestBody) as RawRequestBody | undefined);

	const jsonSchema = deref(requestBody?.content?.["application/json"]?.schema);
	const requestBodyMandatory =
		opInfo.hasRequestBody &&
		requestBody?.required === true &&
		jsonSchema !== undefined &&
		isObject(jsonSchema);

	let body = requestBody;
	// The CLI sends no body for GET or HEAD, and a typed call leaves a
	// plain-text body out.
	const method = opInfo.method.toLowerCase();
	if (method === "get" || method === "head") {
		body = undefined;
	}
	const allContents = Object.entries(body?.content ?? {});
	if (
		allContents.length > 0 &&
		allContents.every(([ct]) => ct.startsWith("text/plain"))
	) {
		body = undefined;
	}
	const contents = body === undefined ? [] : allContents;
	const has = (type: string) => contents.some(([ct]) => ct === type);
	const formEncoded = contents[0]?.[0] === "application/x-www-form-urlencoded";
	const octetOnly =
		contents.length > 0 &&
		contents.every(([ct]) => ct === "application/octet-stream");
	const isMultipart = has("multipart/form-data") && !has("application/json");
	// The body's schema: the JSON one, or else that of the first media type.
	const schema = deref(
		(contents.find(([ct]) => ct === "application/json") ?? contents[0])?.[1]
			?.schema
	);

	let hasRequest: boolean;
	if (octetOnly) {
		hasRequest = false;
	} else if (noParams) {
		hasRequest =
			body !== undefined &&
			(isMultipart || (schema !== undefined && isObject(schema)));
	} else {
		hasRequest = true;
	}

	const resolvedJson =
		isMultipart || octetOnly
			? undefined
			: schema !== undefined && isObject(schema)
				? schema
				: undefined;
	let constants: Record<string, string | boolean> = {};
	let bodyRequired: boolean;
	if (resolvedJson && !formEncoded) {
		const object = objectBody(resolvedJson);
		constants = object.constants;
		// A body the operation requires must be passed even when none of its
		// fields is, as for a map of changes: an empty one says nothing.
		bodyRequired = requestBodyMandatory || object.required.length > 0;
	} else if (isMultipart) {
		const form = deref(
			contents.find(([ct]) => ct === "multipart/form-data")?.[1]?.schema
		);
		const required = form?.["required"];
		bodyRequired =
			form !== undefined &&
			properties(form).some(
				([name]) => Array.isArray(required) && required.includes(name)
			);
	} else {
		bodyRequired = body !== undefined && !octetOnly;
	}

	const joined = parameters
		.filter((p) => p.in === "query" && p.explode === false)
		.map((p) => p.name as string);

	// The response is read by the first media type of the first success
	// response that has content.
	const responses = Object.entries(opInfo.responses);
	const first = responses
		.filter(([status]) => /^2/.test(status))
		.map(([, response]) => Object.entries(response.content))
		.find((content) => content.length > 0)?.[0];
	let noResponse: boolean;
	let responseType: Wire["responseType"];
	if (first === undefined) {
		noResponse = true;
	} else if (first[0].includes("json")) {
		noResponse = false;
	} else {
		const [ct, content] = first;
		const resolved = deref(content.schema);
		const binary =
			(resolved?.["type"] === "string" && resolved["format"] === "binary") ||
			ct === "application/octet-stream" ||
			ct === "application/pdf" ||
			ct === "application/zip" ||
			ct.startsWith("image/");
		if (binary) {
			noResponse = false;
			responseType = "binary-response";
		} else if (ct.startsWith("text/")) {
			noResponse = false;
			responseType = "text";
		} else {
			noResponse = true;
		}
	}

	const errors: [string, string][] = [];
	for (const [status] of responses) {
		const name = ERRORS[status];
		if (name !== undefined) {
			errors.push([status, name]);
		}
	}

	return {
		hasRequest,
		body: body === undefined ? undefined : isMultipart ? "form" : "json",
		bodyRequired,
		requestBodyMandatory,
		joined,
		constants,
		contentType: contents[0]?.[0],
		noResponse,
		responseType,
		errors,
	};
}

/** Source code a literal prints as it is. */
class Code {
	constructor(readonly source: string) {}
}

/** `s` escaped for the inside of a template literal. */
function escapeTemplate(s: string): string {
	return s.replace(/[`$\\]/g, (c) => `\\${c}`);
}

/**
 * The function that returns a request's path for `template`, as code: each
 * `{name}` takes the request's field `name`, which the runtime's `path` tag
 * encodes as a path segment.
 */
function pathFunction(template: string): Code {
	if (!usesPathTag(template)) {
		return new Code(`() => ${JSON.stringify(template)}`);
	}
	let body = "";
	let last = 0;
	for (const match of template.matchAll(/\{([^}]+)\}/g)) {
		const name = match[1] as string;
		const field = /^[A-Za-z_$][\w$]*$/.test(name)
			? `request.${name}`
			: `request[${JSON.stringify(name)}]`;
		body += `${escapeTemplate(template.slice(last, match.index))}\${${field}}`;
		last = match.index + match[0].length;
	}
	body += escapeTemplate(template.slice(last));
	return new Code(`(request: Record<string, unknown>) => path\`${body}\``);
}

/**
 * Reports whether the operation module for a path `template` builds it with
 * the runtime's `path` tag, and so imports it: when it has parameters.
 */
export function usesPathTag(template: string): boolean {
	return extractTemplateParams(template).length > 0;
}

/**
 * The `Operation` that describes the operation `opInfo` resolves for
 * `Client.send`, as a TypeScript literal.
 */
export function operationLiteral(opInfo: OperationInfo, wire: Wire): string {
	const map: Record<string, unknown> = {
		method: opInfo.method.toUpperCase(),
		path: pathFunction(opInfo.path),
	};
	const pathParams = [...new Set(extractTemplateParams(opInfo.path))];
	// A form body is made of the request's other fields, so it has to know
	// which ones the path takes.
	if (wire.body === "form" && pathParams.length > 0) {
		map["pathParams"] = pathParams;
	}
	const query = opInfo.queryParams.map((p) => p.name);
	const headers = opInfo.headerParams.map((p) => p.name);
	if (query.length > 0) {
		map["query"] = query;
	}
	if (wire.joined.length > 0) {
		map["joined"] = wire.joined;
	}
	if (headers.length > 0) {
		map["headers"] = headers;
	}
	if (wire.body !== undefined) {
		map["body"] = wire.body;
		if (
			wire.body === "json" &&
			wire.contentType !== undefined &&
			wire.contentType !== "application/json"
		) {
			map["contentType"] = wire.contentType;
		}
	}
	if (Object.keys(wire.constants).length > 0) {
		map["constants"] = wire.constants;
	}
	if (wire.noResponse) {
		map["response"] = false;
	} else if (wire.responseType !== undefined) {
		map["response"] = wire.responseType;
	}
	if (wire.errors.length > 0) {
		map["errors"] = Object.fromEntries(wire.errors);
	}
	return literalSource(map, 0);
}

/**
 * Prints `value` as a TypeScript literal: an object a property per line,
 * with bare keys where they can be, and arrays on one line.
 */
function literalSource(value: unknown, depth: number): string {
	if (value instanceof Code) {
		return value.source;
	}
	if (Array.isArray(value)) {
		return `[${value.map((item) => literalSource(item, depth)).join(", ")}]`;
	}
	if (isRecord(value)) {
		const indent = "  ".repeat(depth + 1);
		const lines = Object.entries(value).map(([key, item]) => {
			const name = /^(?:[A-Za-z_$][\w$]*|0|[1-9]\d*)$/.test(key)
				? key
				: JSON.stringify(key);
			return `${indent}${name}: ${literalSource(item, depth + 1)},`;
		});
		return `{\n${lines.join("\n")}\n${"  ".repeat(depth)}}`;
	}
	return JSON.stringify(value);
}
