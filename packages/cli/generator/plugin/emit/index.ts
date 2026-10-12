/**
 * Emits a command's module: its yargs builder and its handler.
 *
 * A port of cf's `generator.ts` and `emit/`, with the same templates, so the
 * commands read as they always have. Only the request differs: where a
 * command called a method of the Fern SDK, it now sends its request through
 * the runtime library.
 */
import {
	ACCOUNT_PATH_PARAMS,
	accountOrZoneLocal,
	type Arg,
	CLI_ONLY_OPTIONS,
	type Derived,
	derive,
	downgradeOptionalParents,
	hasAccountOrZoneScope,
	headerArgs,
	isBody,
	isPath,
	options,
	pathParamReadKey,
	positionals,
	queryArgs,
	ZONE_PATH_PARAMS,
} from "../args.js";
import {
	GenerateError,
	kebab,
	quote,
	replaceParams,
	templateParams,
} from "../js.js";
import { type OperationInfo, response } from "../operation.js";
import { variantPromptBlock } from "./handler.js";
import type { Method } from "../commands.js";

/** How a command's response is read. */
export type OutputKind = "json" | "binary" | "text" | "websocket";

/** Everything the emitters of one command read. */
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

export function formatOutputCall(ctx: Ctx, indent: string): string {
	return `${indent}formatOutput(result, { successLabel: \`${escapeTemplate(ctx.successLabel)}\` });`;
}

export function wrapAwait(ctx: Ctx, expr: string): string {
	return `await withProgress(\`${escapeTemplate(ctx.progressLabel)}\`, async () => (${expr}))`;
}

export function emitRawTail(
	ctx: Ctx,
	indent: string,
	url: string,
	bodyParts: readonly string[]
): string[] {
	const parts = [
		`method: '${ctx.op.method.toUpperCase()}'`,
		"local: argv.local === true",
		"persistTo: argv.persistTo as string | undefined",
		...bodyParts,
	];
	const lines = [
		`${indent}const __cfRawBytes = await withProgress(\`${escapeTemplate(ctx.progressLabel)}\`, async () => fetchRawBytes(${url}, { ${parts.join(", ")} }));`,
	];
	if (ctx.outputKind === "text") {
		lines.push(`${indent}writeRawOutput(__cfRawBytes.toString('utf-8'));`);
	} else {
		lines.push(
			`${indent}writeRawOutput(argv.text === true ? __cfRawBytes.toString('utf-8') : __cfRawBytes);`
		);
	}
	lines.push(`${indent}return;`);
	return lines;
}

/** `escapeForSingleQuote`. */
export function escapeSingle(s: string): string {
	let out = "";
	for (let i = 0; i < s.length; i++) {
		const c = s[i] as string;
		switch (c) {
			case "\\":
				out += "\\\\";
				break;
			case "'":
				out += "\\'";
				break;
			case "`":
				out += "\\`";
				break;
			case "$":
				if (s[i + 1] === "{") {
					out += "\\${";
					i++;
				} else {
					out += c;
				}
				break;
			case "\r":
			case "\n":
			case "\u2028":
			case "\u2029":
				out += " ";
				break;
			default:
				out += c;
		}
	}
	return out;
}

/** `escapeForTemplateLiteral`. */
export function escapeTemplate(s: string): string {
	return s.replace(/[`$\\]/g, (c) => `\\${c}`);
}

/** `argvKey`: `argv["kebab-name"]`. */
export function argvKey(name: string): string {
	return `argv[${quote(kebab(name))}]`;
}

/** `argLocalIdent`. */
export function argLocalIdent(name: string): string {
	return kebab(name).replaceAll("-", "_");
}

const BINARY = [
	"application/octet-stream",
	"application/vnd.google.protobuf",
	"application/zip",
	"application/pdf",
	"application/vnd.tcpdump.pcap",
	"multipart/form-data",
];
const TEXT = ["text/plain", "text/csv", "text/html", "text/vtt"];

/** `deriveOutputKind`. */
export function outputKind(op: OperationInfo): OutputKind {
	let success = ["200", "201", "202", "204"]
		.map((s) => response(op, s))
		.find((r) => r !== undefined);
	if (success === undefined && response(op, "101") !== undefined) {
		return "websocket";
	}
	const range = response(op, "2XX");
	if (range !== undefined) {
		success = range;
	}
	if (success === undefined) {
		const found = op.responses.map(([s]) => s);
		throw new GenerateError(
			`No "success" responses found for:\n  ${op.method}:${op.path}\n Found: ${found.join(",")}`
		);
	}
	if (
		success.content.some((c) => BINARY.includes(c) || c.startsWith("image/"))
	) {
		return "binary";
	}
	if (success.content.some((c) => TEXT.includes(c))) {
		return "text";
	}
	return "json";
}

/** The context needed to substitute a path template's placeholders. */
export interface PathTemplate {
	needsWorkerName: boolean;
	args: readonly Arg[];
	positional: readonly Arg[];
	firstPositionalIsZone: boolean;
	accountId: string;
	scriptName: string;
	zone: string | undefined;
	param: (name: string) => string;
}

/** `substitutePathTemplate`. */
export function substitutePath(path: string, ctx: PathTemplate): string {
	return replaceParams(path, (name) => {
		const local = accountOrZoneLocal(path, name);
		if (local !== undefined) {
			return `\${${local}}`;
		}
		if (ACCOUNT_PATH_PARAMS.includes(name)) {
			return ctx.accountId;
		}
		if (
			ctx.needsWorkerName &&
			(name === "script_name" || name === "scriptName")
		) {
			return ctx.scriptName;
		}
		if (ZONE_PATH_PARAMS.includes(name)) {
			if (ctx.firstPositionalIsZone) {
				const key = kebab(name);
				const found = ctx.positional.find((a) => kebab(a.name) === key);
				const first = ctx.positional[0];
				if (
					found !== undefined &&
					first !== undefined &&
					found === first &&
					found.isZone
				) {
					return `\${${argLocalIdent(name)}}`;
				}
			}
			if (ctx.zone !== undefined) {
				return ctx.zone;
			}
		}
		return ctx.param(pathParamReadKey(ctx.args, name));
	});
}

const READ_SHAPED = [
	"query",
	"raw",
	"read",
	"search",
	"bulk-get",
	"export",
	"preview",
];

/** `buildLabels`. */
function labels(httpMethod: string, method: string): [string, string] {
	if (READ_SHAPED.includes(method)) {
		return ["Loading", "Loaded"];
	}
	switch (httpMethod.toUpperCase()) {
		case "POST":
			return ["Creating", "Created"];
		case "PUT":
		case "PATCH":
			return ["Updating", "Updated"];
		case "DELETE":
			return ["Deleting", "Deleted"];
		case "GET":
		case "HEAD":
			return ["Loading", "Loaded"];
		default:
			return ["Processing", "Done"];
	}
}

/** `buildEmitContext`: the context, and the command string yargs registers. */
export function context(
	method: Method,
	resource: string,
	group: string | undefined,
	op: OperationInfo,
	root: string
): [Ctx, string] {
	const kind = outputKind(op);
	const workers = resource === "workers";
	const path = op.path;
	const combined = hasAccountOrZoneScope(path);
	const pathNeedsAccount =
		path.includes("{account_id}") ||
		path.includes("{account_identifier}") ||
		path.includes("{accountId}");
	const sdkNeedsAccount = op.pathParams.some((p) => p.name === "account_id");
	const needsAccountId = pathNeedsAccount || sdkNeedsAccount || combined;
	const derived = derive(method, resource, op);
	downgradeOptionalParents(derived);

	const pathNeedsZone =
		path.includes("{zone_id}") ||
		path.includes("{zone_identifier}") ||
		path.includes("{zoneId}");
	const positional = positionals(derived);
	const firstPositionalIsZone = positional[0]?.isZone === true;
	const needsZoneId = firstPositionalIsZone || pathNeedsZone || combined;
	const pathNeedsWorker =
		workers &&
		(path.includes("{script_name}") || path.includes("{scriptName}"));
	const firstPositionalIsWorkerName = positional[0]?.isWorkerName === true;
	const needsWorkerName = firstPositionalIsWorkerName || pathNeedsWorker;

	const bodyFields = derived.args.filter(isBody);
	const [block, needsText] = variantPromptBlock(op, bodyFields);

	const requireConfirmation = method.requireConfirmation;
	const isDelete =
		op.method.toUpperCase() === "DELETE" || requireConfirmation !== undefined;

	const positionalStr = positional
		.map((a) => {
			const name = a.type === "array" ? `${a.name}...` : a.name;
			return a.isZone || a.isWorkerName ? `[${name}]` : `<${name}>`;
		})
		.join(" ");
	const command =
		positionalStr === "" ? method.name : `${method.name} ${positionalStr}`;

	const labelMethod =
		requireConfirmation !== undefined ? "DELETE" : op.method.toUpperCase();
	const [progress, success] = labels(labelMethod, method.name);

	const allPathParamNames: string[] = [];
	for (const name of [
		...op.pathParams.map((p) => p.name),
		...templateParams(path),
	]) {
		if (!allPathParamNames.includes(name)) {
			allPathParamNames.push(name);
		}
	}
	const requiredOptionArgs = options(derived).filter(
		(o) =>
			o.required &&
			!CLI_ONLY_OPTIONS.includes(o.name) &&
			o.origin.in !== "query" &&
			!isPath(o) &&
			!o.isWorkerName
	);
	const hasParams = queryArgs(derived).length > 0;
	const hasHeaders = headerArgs(derived).length > 0;
	const param = (name: string) =>
		`\${encodeURIComponent(String(argv[${quote(name)}]))}`;
	const resolvedRequestPath = substitutePath(path, {
		needsWorkerName,
		args: derived.args,
		positional,
		firstPositionalIsZone,
		accountId: "${accountId}",
		scriptName: "${scriptName}",
		zone: "${argv.zoneId}",
		param,
	});
	const ctx: Ctx = {
		method,
		op,
		outputKind: kind,
		resource,
		group,
		derived,
		allPathParamNames,
		needsAccountId,
		needsZoneId,
		hasAccountOrZoneScope: combined,
		needsWorkerName,
		firstPositionalIsZone,
		firstPositionalIsWorkerName,
		isDelete,
		requireConfirmation,
		variantPromptBlock: block,
		variantPromptNeedsText: needsText,
		requiredOptionArgs,
		resolvedRequestPath,
		hasParams,
		hasHeaders,
		isRawOutput: kind === "binary" || kind === "text",
		progressLabel: progress,
		successLabel: success,
		root,
	};
	return [ctx, command];
}
