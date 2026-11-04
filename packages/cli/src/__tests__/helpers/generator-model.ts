// Resolved-operation fixtures shared by the native generator tests.
export type Value =
	| null
	| boolean
	| number
	| string
	| readonly Value[]
	| { readonly [key: string]: Value };
export type Obj = { [key: string]: Value };
type Json = Value;
type BodyUnion = Value;

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

export interface BodyParamInfo {
	name: string;
	required: boolean;
	/**
	 * The nearest optional object containing this field. A required field is
	 * required only when this object is present; defaults must not create it.
	 */
	optionalParentPath: readonly string[] | null;
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

export interface MultipartField {
	name: string;
	type: "number" | "boolean" | "array" | "object" | "string";
	isBinary: boolean;
	description: string;
}

export interface MultipartInfo {
	fields: MultipartField[];
	payloadField?: string;
}

export interface BodyDiscriminator {
	field: string;
	/** The fields each variant requires beyond those all of them do, by the value of the discriminator. */
	variants: [string, string[]][];
}

export interface ResponseInfo {
	/** The media types of its content. */
	content: string[];
}

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
	/** Whether the operation requires its JSON object or non-JSON body. */
	requestBodyMandatory: boolean;
	requestBodyRequired: string[];
	requestBodyDescription?: string;
	multipart?: MultipartInfo;
	bodyDiscriminator?: BodyDiscriminator;
	bodyUnions?: BodyUnion[];
	maxItems?: number;
	requestBodyIsArray: boolean;
	/** Each response by status: the success responses, then the others. */
	responses: [string, ResponseInfo][];
	/** How a typed call sends the operation. */
	wire: Wire;
}

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
	/** The nearest optional body object containing this field. */
	optionalParentPath?: readonly string[];
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

export interface OptionalParentGroup {
	parentName: string;
	/** The flags of the object without a default, which show it was set. */
	groupSetFlags: string[];
	requiredFlags: string[];
}

export interface Derived {
	args: Arg[];
	optionalParentGroups: OptionalParentGroup[];
	isMutating: boolean;
	hasBody: boolean;
	hasEmptyBody: boolean;
	hasBodyParams: boolean;
	hasFileUpload: boolean;
	multipart?: MultipartInfo;
	/** Form fields besides the payload that take a value. */
	multipartFlagFields: MultipartFieldFlag[];
	/** Binary form fields taking literal content or `@file`, including payload arrays. */
	multipartFileFields: MultipartFieldFlag[];
}

export interface MultipartFieldFlag {
	field: MultipartField;
	flag: string;
}

export interface Method {
	readonly kind: "method";
	name: string;
	operationId: string;
	deprecated: boolean;
	/** The `x-forge-params` overrides, by parameter name, when not empty. */
	params?: { readonly [key: string]: Json };
	requireConfirmation?: string;
	/** The operation's summary with its whitespace collapsed. */
	summary?: string;
	/** The operation's description, or else its summary, with its whitespace collapsed. */
	description: string;
	/** Whether the operation declares `x-forge-args`, which the CLI does not support. */
	hasArgs: boolean;
}

export interface Ctx {
	method: Method;
	op: OperationInfo;
	outputKind: OutputKind;
	resource: string;
	group: string | undefined;
	derived: Derived;
	allPathParamNames: string[];
	needsAccountId: boolean;
	needsZoneId: boolean;
	hasAccountOrZoneScope: boolean;
	needsWorkerName: boolean;
	firstPositionalIsZone: boolean;
	firstPositionalIsWorkerName: boolean;
	isDelete: boolean;
	requireConfirmation: string | undefined;
	variantPromptBlock: string[];
	variantPromptNeedsText: boolean;
	requiredOptionArgs: Arg[];
	resolvedRequestPath: string;
	hasParams: boolean;
	hasHeaders: boolean;
	isRawOutput: boolean;
	progressLabel: string;
	successLabel: string;
	/** The generated root, relative to the command's module: `./` or `../…`. */
	root: string;
}

export type ArgType =
	| "string"
	| "number"
	| "boolean"
	| "enum"
	| "array"
	| "scalarUnion"
	| "objectArray"
	| "nestedArray"
	| "objectMap";
export type Origin =
	| { readonly in: "path" | "query" | "header"; readonly name: string }
	| { readonly in: "body"; readonly path: readonly string[] };
export type OutputKind = "json" | "binary" | "text" | "websocket";
