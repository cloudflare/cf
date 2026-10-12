/**
 * Resolves each method of the forge into what the CLI is built from: its
 * parameters, the flags its body flattens into, its content types and its
 * responses.
 *
 * These are the facts cf's generator read from `@cloudflare/forge`'s
 * `openapi-resolver.ts`, which read the OpenAPI document itself. They are
 * read from forge's model, by the rules the resolver followed, so that
 * every flag stays what it was. The body's flags are flattened in
 * `body.ts`.
 *
 * It also resolves how a typed call sends the operation, its `wire`, which
 * the runtime's `Operation` describes.
 */

import { bodyProperties, discriminator, requiredNames } from "./body.js";
import { nameWords, obj, type Obj, type Value } from "./js.js";
import type {
	Body,
	Content,
	EnumType,
	Field,
	Location,
	Method,
	Model,
	ObjectType,
	Type,
	UnionType,
} from "@cloudflare/forge/plugin";

/** A parameter of an operation. */
export interface ParameterInfo {
	/** The wire name. */
	name: string;
	/** The kebab-case name of the field, when `x-fern-parameter-name` renames it. */
	sdkName?: string;
	required: boolean;
	/**
	 * What the old resolver's `extractType` said of the parameter's schema:
	 * `string`, `number`, `boolean`, `array`, `object` or `unknown`.
	 */
	type: string;
	description?: string;
	enumValues?: string[];
}

/** A body property that becomes a flag. */
export interface BodyParamInfo {
	name: string;
	required: boolean;
	type: string;
	itemType?: string;
	description?: string;
	enumValues?: string[];
	default?: Value;
	sensitive: boolean;
	apiFieldPath: string[];
	conflicts?: string[];
	implies?: string[];
}

/** A field of a `multipart/form-data` body. */
export interface MultipartField {
	name: string;
	type: "number" | "boolean" | "array" | "object" | "string";
	isBinary: boolean;
	description: string;
}

/** The fields of a `multipart/form-data` body, and the one that carries its content. */
export interface MultipartInfo {
	fields: MultipartField[];
	payloadField?: string;
}

/** A body that is a discriminated union. */
export interface BodyDiscriminator {
	field: string;
	/** The fields each variant requires beyond those all of them do, by the value of the discriminator. */
	variants: [string, string[]][];
}

/** A response of an operation. */
export interface ResponseInfo {
	/** The media types of its content. */
	content: string[];
}

/**
 * How a typed call sends an operation's request. A JSON body is the
 * request's `body`; a form body is the request's fields other than its
 * parameters.
 */
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
	/** The query parameters whose arrays are joined with commas. */
	joined: string[];
	/** Body fields with a single allowed value, which are always sent. */
	constants: Obj;
	/** The media type of the body. */
	contentType?: string;
	/** Whether the response has no body to return. */
	noResponse: boolean;
	/** How the response body is read, when not as JSON. */
	responseType?: string;
	/** The names of the errors for the statuses the operation declares. */
	errors: [string, string][];
}

/** An operation, resolved. */
export interface OperationInfo {
	path: string;
	/** The method in lowercase, such as `get`. */
	method: string;
	/** The path parameters, in the order of the path template. */
	pathParams: ParameterInfo[];
	queryParams: ParameterInfo[];
	headerParams: ParameterInfo[];
	bodyParams: BodyParamInfo[];
	hasRequestBody: boolean;
	requestContentTypes: string[];
	/** The model the JSON body is, if it is one. */
	requestBodyRef?: string;
	/**
	 * Whether the operation requires its JSON body, which is an object with
	 * fields: sent empty, it would say nothing.
	 */
	requestBodyMandatory: boolean;
	requestBodyRequired: string[];
	requestBodyDescription?: string;
	multipart?: MultipartInfo;
	bodyDiscriminator?: BodyDiscriminator;
	maxItems?: number;
	requestBodyIsArray: boolean;
	/** Each response by status: the success responses, then the others. */
	responses: [string, ResponseInfo][];
	/** How a typed call sends the operation. */
	wire: Wire;
}

/** The response of `op` with `status`. */
export function response(
	op: OperationInfo,
	status: string
): ResponseInfo | undefined {
	return op.responses.find(([s]) => s === status)?.[1];
}

export function isScalar(type: Type, scalar: string): boolean {
	return type.kind === "scalar" && type.scalar === scalar;
}

/** Resolves `method`. */
export function resolve(method: Method): OperationInfo {
	const pathParams: ParameterInfo[] = [];
	const queryParams: ParameterInfo[] = [];
	const p = params(method);
	if (p) {
		for (const field of p.fields) {
			const location = method.location(field);
			if (location?.in === "path") {
				pathParams.push(parameter(field, true));
			} else if (location?.in === "query") {
				queryParams.push(parameter(field, false));
			}
		}
	}
	const headerParams =
		method.headers?.fields.map((f) => parameter(f, false)) ?? [];

	const raw = method.body;
	const body = raw && !isSemanticallyEmpty(raw) ? raw : undefined;
	const json = body?.contents.find(
		(c) => c.mediaType === "application/json"
	)?.type;
	// The JSON schema, through every `$ref`.
	const jsonResolved = json && deref(json);
	const isArray =
		jsonResolved !== undefined && unwrapNull(jsonResolved).kind === "array";
	const unwrapped = jsonResolved && unwrapNull(jsonResolved);
	const info: Omit<OperationInfo, "wire"> = {
		path: method.path,
		method: method.httpMethod.toLowerCase(),
		pathParams,
		queryParams,
		headerParams,
		bodyParams: json ? bodyProperties(json) : [],
		hasRequestBody: body !== undefined,
		requestContentTypes: body ? body.contents.map((c) => c.mediaType) : [],
		requestBodyRef:
			json?.kind === "model"
				? `components['schemas']['${json.model.schemaName}']`
				: undefined,
		requestBodyMandatory:
			body !== undefined &&
			body.required &&
			jsonResolved !== undefined &&
			isObject(jsonResolved),
		requestBodyRequired:
			jsonResolved && !isArray ? requiredNames(jsonResolved) : [],
		requestBodyDescription: body && requestBodyDescription(body),
		multipart: body && multipart(body),
		bodyDiscriminator: jsonResolved && discriminator(jsonResolved),
		maxItems: unwrapped?.kind === "array" ? unwrapped.maxItems : undefined,
		requestBodyIsArray: isArray,
		responses: [...method.responses, ...method.errors].map((r) => [
			r.status,
			{ content: r.contents.map((c) => c.mediaType) },
		]),
	};
	return { ...info, wire: wire(method, info) };
}

function requestBodyDescription(body: Body): string | undefined {
	if (body.description !== "") {
		return body.description;
	}
	// The first of these media types with a schema: one with a shape or a
	// description.
	const content = [
		"application/json",
		"application/octet-stream",
		"multipart/form-data",
	]
		.map((t) => body.contents.find((c) => c.mediaType === t))
		.find(
			(c) =>
				c !== undefined &&
				(!isScalar(c.type, "unknown") || c.description !== "")
		);
	return content && content.description !== ""
		? content.description
		: undefined;
}

/**
 * The object of the path and query parameters of `method`, the first member
 * of its request when the request intersects them with the body, or
 * undefined if it has none. A request that is the body alone has no field
 * with a location.
 */
export function params(method: Method): ObjectType | undefined {
	const request = method.request;
	let object: ObjectType | undefined;
	if (request?.kind === "object") {
		object = request;
	} else if (request?.kind === "intersection") {
		object = request.members.find((m): m is ObjectType => m.kind === "object");
	}
	if (!object) {
		return undefined;
	}
	return object.fields.some((f) => method.location(f) !== undefined)
		? object
		: undefined;
}

/**
 * The kebab-case name a field is renamed to, by `x-fern-parameter-name` or
 * `x-fern-property-name`, or undefined if it keeps its wire name.
 */
export function renamed(field: Field): string | undefined {
	const words = nameWords(field.wireName);
	const same =
		words.length === field.name.words.length &&
		words.every((w, i) => w === field.name.words[i]);
	return same ? undefined : field.name.kebab();
}

function nonEmpty(s: string): string | undefined {
	return s === "" ? undefined : s;
}

function parameter(field: Field, path: boolean): ParameterInfo {
	const type = field.type;
	return {
		name: field.wireName,
		sdkName: renamed(field),
		required: field.required,
		type: path ? "string" : parameterType(type),
		description:
			nonEmpty(field.description.trim()) ?? referencedDescription(type, 0),
		enumValues: path ? undefined : parameterEnum(type),
	};
}

/**
 * The description of the schema a field's `allOf` refers to, which forge
 * leaves off the field. A property is often written `allOf: [$ref]` only to
 * carry `x-fern-property-name` or a default next to the reference. The old
 * resolver fell back to it, so flags keep their help text; the field's own
 * description is the right source, and this fallback can go once forge
 * reads it through the `allOf`. Like the resolver's merge of `allOf`, a
 * later member's description wins.
 */
export function referencedDescription(
	type: Type,
	depth: number
): string | undefined {
	if (depth > 32) {
		return undefined;
	}
	const t = unwrapNull(type);
	if (t.kind === "model") {
		return (
			nonEmpty(t.model.description.trim()) ??
			referencedDescription(t.model.type, depth + 1)
		);
	}
	if (t.kind === "intersection") {
		for (const member of [...t.members].reverse()) {
			const description = referencedDescription(member, depth + 1);
			if (description !== undefined) {
				return description;
			}
		}
	}
	return undefined;
}

/** `type`, through every model it is. */
export function deref(type: Type): Type {
	for (let i = 0; i < 64; i++) {
		if (type.kind !== "model") {
			return type;
		}
		type = type.model.type;
	}
	return type;
}

/**
 * The one member of a union with null other than null, or else `type`:
 * what a nullable schema was before `nullable`.
 */
export function unwrapNull(type: Type): Type {
	if (type.kind === "union") {
		const members = nonNullMembers(type);
		if (members.length === 1) {
			return members[0] as Type;
		}
	}
	return type;
}

/** The members of a union other than null. */
export function nonNullMembers(union: UnionType): Type[] {
	return union.members.filter((m) => !isScalar(m, "null"));
}

/**
 * The type the old resolver's `extractType` gave a value of `type`, without
 * looking inside unions and intersections: undefined for `unknown`.
 */
function simpleType(type: Type): string | undefined {
	const t = unwrapNull(deref(type));
	switch (t.kind) {
		case "scalar":
			switch (t.scalar) {
				case "number":
					return "number";
				case "boolean":
					return "boolean";
				case "string":
				case "date":
				case "date-time":
				case "bytes":
				case "binary":
					return "string";
				default:
					return undefined;
			}
		case "enum":
			return enumType(t);
		case "array":
			return "array";
		case "object":
			return "object";
		default:
			return undefined;
	}
}

/** The type of an enum's values, when they all have one. */
export function enumType(e: EnumType): string | undefined {
	let type: string | undefined;
	for (const value of e.values) {
		const t = typeof value;
		if (type !== undefined && type !== t) {
			return undefined;
		}
		type = t;
	}
	return type;
}

/** `extractType(resolveParameterSchema(schema))`. */
function parameterType(type: Type): string {
	const schema = parameterSchema(type);
	return (schema && simpleType(schema)) ?? "unknown";
}

const UNKNOWN: Type = { kind: "scalar", scalar: "unknown" };

/**
 * `resolveParameterSchema`: the type a parameter's value has, through the
 * unions and intersections that agree on one type.
 */
function parameterSchema(type: Type): Type | undefined {
	const t = unwrapNull(deref(type));
	if (t.kind === "union") {
		const members = nonNullMembers(t)
			.map(parameterSchema)
			.filter((m): m is Type => m !== undefined);
		const types: string[] = [];
		for (const m of members) {
			const s = simpleType(m);
			if (s !== undefined && !types.includes(s)) {
				types.push(s);
			}
		}
		if (types.length === 1) {
			return members[0];
		}
		// An `anyOf` of strings and lists of strings is a string; a `oneOf`
		// of them has no one type.
		if (
			!t.exclusive &&
			types.length === 2 &&
			types.includes("string") &&
			types.includes("array")
		) {
			const arrayOfStrings = members.some((m) => {
				const r = unwrapNull(deref(m));
				if (r.kind !== "array") {
					return false;
				}
				const elem = parameterSchema(r.elem);
				return elem !== undefined && simpleType(elem) === "string";
			});
			if (arrayOfStrings) {
				return members.find((m) => simpleType(m) === "string");
			}
		}
		return undefined;
	}
	if (t.kind === "intersection") {
		const types: string[] = [];
		let last: Type | undefined;
		for (const member of t.members) {
			const m = parameterSchema(member);
			if (m === undefined) {
				continue;
			}
			const s = simpleType(m);
			if (s !== undefined) {
				if (!types.includes(s)) {
					types.push(s);
				}
				last = m;
			}
		}
		if (types.length > 1) {
			return undefined;
		}
		// The merged schema: the last member with a type gives it.
		return last ?? UNKNOWN;
	}
	return t;
}

/** The values of the parameter's enum, as strings. */
function parameterEnum(type: Type): string[] | undefined {
	const t = unwrapNull(deref(type));
	let resolved: Type | undefined;
	if (t.kind === "intersection") {
		resolved = t.members
			.map((m) => unwrapNull(deref(m)))
			.filter((m) => m.kind === "enum")
			.reverse()[0];
	} else {
		const schema = parameterSchema(type);
		resolved = schema && unwrapNull(deref(schema));
	}
	return resolved?.kind === "enum"
		? resolved.values.map((v) => String(v))
		: undefined;
}

/**
 * Reports whether a body has no content worth sending: only JSON media
 * types, each without a schema, or with one that gives no shape. An object
 * without properties is any object, and is worth sending.
 */
function isSemanticallyEmpty(body: Body): boolean {
	return body.contents.every(
		(c) =>
			c.mediaType.toLowerCase().includes("json") && isScalar(c.type, "unknown")
	);
}

function multipart(body: Body): MultipartInfo | undefined {
	const form = body.contents.find((c) => c.mediaType === "multipart/form-data");
	if (!form) {
		return undefined;
	}
	const object = deref(form.type);
	if (object.kind !== "object") {
		return undefined;
	}
	const octetType = body.contents.find(
		(c) => c.mediaType === "application/octet-stream"
	)?.type;
	const octet: Model | undefined =
		octetType?.kind === "model" ? octetType.model : undefined;
	const fields: MultipartField[] = [];
	let payloadField: string | undefined;
	for (const field of object.fields) {
		const name = field.wireName;
		const resolved = unwrapNull(deref(field.type));
		const isBinary = isScalar(resolved, "binary");
		let type: MultipartField["type"];
		switch (resolved.kind) {
			case "scalar":
				type =
					resolved.scalar === "number"
						? "number"
						: resolved.scalar === "boolean"
							? "boolean"
							: "string";
				break;
			case "enum": {
				const t = enumType(resolved);
				type =
					t === "number" ? "number" : t === "boolean" ? "boolean" : "string";
				break;
			}
			case "array":
				type = "array";
				break;
			case "object":
				type = "object";
				break;
			default:
				type = "string";
		}
		const description =
			field.description === ""
				? `The ${name.replaceAll("_", " ")}`
				: field.description;
		fields.push({ name, type, isBinary, description });
		if (payloadField === undefined) {
			const fieldType = field.type;
			const sameModel =
				octet !== undefined &&
				fieldType.kind === "model" &&
				fieldType.model === octet;
			if (sameModel || isBinary || name === "file") {
				payloadField = name;
			}
		}
	}
	return { fields, payloadField };
}

// ---------------------------------------------------------------------------
// How a typed call sends the operation. These rules are the ones of the Fern
// SDK the commands called before, which what they send still follows.

const ERRORS: readonly (readonly [string, string])[] = [
	["400", "BadRequestError"],
	["401", "UnauthorizedError"],
	["403", "ForbiddenError"],
	["404", "NotFoundError"],
	["405", "MethodNotAllowedError"],
	["408", "RequestTimeoutError"],
	["409", "ConflictError"],
	["410", "GoneError"],
	["412", "PreconditionFailedError"],
	["413", "ContentTooLargeError"],
	["415", "UnsupportedMediaTypeError"],
	["422", "UnprocessableEntityError"],
	["423", "LockedError"],
	["429", "TooManyRequestsError"],
	["499", "ClientClosedRequestError"],
	["500", "InternalServerError"],
	["501", "NotImplementedError"],
	["502", "BadGatewayError"],
	["503", "ServiceUnavailableError"],
	["504", "GatewayTimeoutError"],
	["507", "InsufficientStorageError"],
];

/**
 * Reports whether a body of type `type`, through its models, is an object:
 * one with properties, or an intersection.
 */
function isObject(type: Type): boolean {
	const t = unwrapNull(type);
	return (
		t.kind === "intersection" || (t.kind === "object" && t.fields.length > 0)
	);
}

/** How a typed call sends `method`, which `info` resolves. */
function wire(method: Method, info: Omit<OperationInfo, "wire">): Wire {
	// The path and query parameters, in the order they are declared.
	const params: [Field, Location][] = [];
	for (const f of operationParamsOf(method)) {
		const location = method.location(f);
		if (location) {
			params.push([f, location]);
		}
	}
	const noParams = params.length === 0 && info.headerParams.length === 0;
	let body = method.body;
	// The CLI sends no body for GET or HEAD (see `derive`), and a typed call
	// leaves a plain-text body out.
	if (info.method === "get" || info.method === "head") {
		body = undefined;
	}
	if (
		body &&
		body.contents.length > 0 &&
		body.contents.every((c) => c.mediaType.startsWith("text/plain"))
	) {
		body = undefined;
	}
	const contents: readonly Content[] = body?.contents ?? [];
	const has = (t: string) => contents.some((c) => c.mediaType === t);
	const formEncoded =
		contents[0]?.mediaType === "application/x-www-form-urlencoded";
	const octetOnly =
		contents.length > 0 &&
		contents.every((c) => c.mediaType === "application/octet-stream");
	const isMultipart = has("multipart/form-data") && !has("application/json");
	// The body's schema: the JSON one, or else that of the first media type.
	const schema = (
		contents.find((c) => c.mediaType === "application/json") ?? contents[0]
	)?.type;
	const resolvedSchema = schema && deref(schema);
	let hasRequest: boolean;
	if (octetOnly) {
		hasRequest = false;
	} else if (noParams) {
		hasRequest =
			body !== undefined &&
			(isMultipart ||
				(resolvedSchema !== undefined && isObject(resolvedSchema)));
	} else {
		hasRequest = true;
	}
	const resolvedJson =
		isMultipart || octetOnly
			? undefined
			: resolvedSchema !== undefined && isObject(resolvedSchema)
				? resolvedSchema
				: undefined;
	const constants = obj();
	let bodyRequired: boolean;
	if (resolvedJson && !formEncoded) {
		const required: string[] = [];
		objectBody(resolvedJson, required, constants);
		// A body the operation requires must be passed even when none of its
		// fields is, as for a map of changes: an empty one says nothing.
		bodyRequired = info.requestBodyMandatory || required.length > 0;
	} else if (isMultipart) {
		const form = contents.find((c) => c.mediaType === "multipart/form-data");
		const t = form && deref(form.type);
		bodyRequired = t?.kind === "object" && t.fields.some((f) => f.required);
	} else {
		bodyRequired = body !== undefined && !octetOnly;
	}
	const joined = params
		.filter(([, l]) => l.in === "query" && !l.exploded)
		.map(([f]) => f.wireName);
	// The response is read by the first media type of the first success
	// response that has content.
	const first = method.responses.find((r) => r.contents.length > 0)
		?.contents[0];
	let noResponse: boolean;
	let responseType: string | undefined;
	if (first === undefined) {
		noResponse = true;
	} else if (first.mediaType.includes("json")) {
		noResponse = false;
	} else {
		const ct = first.mediaType;
		const resolved = deref(first.type);
		const binary =
			(resolved.kind === "scalar" && resolved.scalar === "binary") ||
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
	for (const [status] of info.responses) {
		const error = ERRORS.find(([s]) => s === status);
		if (error) {
			errors.push([error[0], error[1]]);
		}
	}
	return {
		hasRequest,
		body: body === undefined ? undefined : isMultipart ? "form" : "json",
		bodyRequired,
		joined,
		constants,
		contentType: contents[0]?.mediaType,
		noResponse,
		responseType,
		errors,
	};
}

/** The fields of the object of `method`'s path and query parameters. */
function operationParamsOf(method: Method): readonly Field[] {
	return params(method)?.fields ?? [];
}

/**
 * Adds the required properties of an object body of type `schema` to
 * `required`, and its properties with a single allowed value to
 * `constants`. A read-only property is left out of both.
 */
function objectBody(schema: Type, required: string[], constants: Obj): void {
	const fields: Field[] = [];
	const collect = (t: Type, depth: number) => {
		if (depth > 8) {
			return;
		}
		const u = unwrapNull(deref(t));
		if (u.kind === "object") {
			for (const field of u.fields) {
				if (
					field.required &&
					!fields.some((f) => f.wireName === field.wireName)
				) {
					fields.push(field);
				}
			}
		} else if (u.kind === "intersection") {
			for (const member of u.members) {
				collect(member, depth + 1);
			}
		}
	};
	collect(schema, 0);
	for (const field of fields) {
		if (field.readOnly) {
			continue;
		}
		const value = literal(field.type);
		if (value !== undefined) {
			constants[field.wireName] = value;
			continue;
		}
		required.push(field.wireName);
	}
}

/** The one value a type allows, when it allows one string or boolean: an enum of one value. */
function literal(type: Type): string | boolean | undefined {
	const t = unwrapNull(deref(type));
	if (t.kind === "enum" && t.values.length === 1) {
		const value = t.values[0];
		if (typeof value === "string" || typeof value === "boolean") {
			return value;
		}
	}
	return undefined;
}
