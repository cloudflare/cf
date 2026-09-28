import { getSdkMapEntry } from "#sdk";
/**
 * Construct an {@link EmitContext} from a method + resolved OpenAPI op.
 *
 * Computes every derived flag the handler emitters branch on
 * (`needsAccountId`, `firstPositionalIsZone`, `isDelete`, …), the
 * progress / success labels, the SDK call-shape, the variant-prompt
 * block, and the closures (`formatOutputCall`, `wrapAwait`,
 * `emitRawTail`) that close over them.
 *
 * Returns the context plus the `commandStr` that yargs registers
 * (`'records create <name>'`-style) — the orchestrator needs both for
 * the final template assembly.
 */
import {
	applyOptionalParentDowngrade,
	deriveArgsFromOp,
} from "../arg-derivation.js";
import { buildLabels } from "../codegen/labels.js";
import { deriveOutputKind } from "../codegen/output-kind.js";
import {
	bodyArgs,
	headerArgs,
	optionArgs,
	positionalArgs,
	queryArgs,
} from "../intermediate-representation.js";
import {
	escapeForTemplateLiteral,
	hasAccountOrZoneScope,
	substitutePathTemplate,
} from "../util.js";
import { computeVariantPromptBlock } from "./handler/variant-prompt.js";
import { computePathBookkeeping } from "./sdk-path.js";
import type { EmitContext } from "./context.js";
import type { OperationInfo, Schema } from "@cloudflare/forge";

export interface BuildContextInput {
	method: Schema.method;
	resourceName: string;
	groupName: string | undefined;
	opInfo: OperationInfo;
}

export interface BuildContextResult {
	ctx: EmitContext;
	commandStr: string;
}

export function buildEmitContext(input: BuildContextInput): BuildContextResult {
	const { method, resourceName, groupName, opInfo } = input;

	const outputKind = deriveOutputKind(opInfo);
	const sdkMapEntry = getSdkMapEntry(method.operationId);
	const isWorkersCommand = resourceName === "workers";
	const resolvedPath = opInfo.path;
	const hasCombinedScope = hasAccountOrZoneScope(resolvedPath);

	// Account-id resolution. We warn (but don't fail) on a few spec
	// inconsistencies the CLI papers over.
	const pathNeedsAccount =
		resolvedPath.includes("{account_id}") ||
		resolvedPath.includes("{account_identifier}") ||
		resolvedPath.includes("{accountId}");
	const sdkNeedsAccount =
		opInfo.pathParams.some((p) => p.name === "account_id") ?? false;
	if (pathNeedsAccount && !sdkNeedsAccount) {
		console.warn(
			`[cf-generator] Missing Account ID pathParams: ${opInfo.path} ${method.operationId} ${JSON.stringify(opInfo.pathParams)}`
		);
	}
	if (
		resolvedPath.includes("{account_identifier}") ||
		resolvedPath.includes("{accountId}")
	) {
		console.warn(
			`[cf-generator] {account_identifier} | {accountId} in path instead of {account_id}: ${opInfo.path}`
		);
	}
	const needsAccountId =
		pathNeedsAccount || sdkNeedsAccount || hasCombinedScope;

	// Single source of truth for both the TS codegen and the
	// commands.json sidecar (see `arg-derivation.ts`). The downgrade
	// runs BEFORE any consumer reads `derived.args` so the builder +
	// handler observe the CLI-runtime view.
	const derived = deriveArgsFromOp(method, resourceName, opInfo);
	applyOptionalParentDowngrade(derived);
	const { isMutating } = derived;
	const positional = positionalArgs(derived.args);
	const options = optionArgs(derived.args);

	// Position-independent import root: the `#lib/*` subpath import
	// (package.json `imports`) maps to `src/lib/*`, so leaf files at any
	// nesting depth reach `lib` without counting `../` segments.
	const libPath = "#lib";

	// Zone-id resolution: either a zone positional or a {zone_id} path
	// param. The CLI's `--zone` flag fills in when neither is set.
	const pathNeedsZone =
		resolvedPath.includes("{zone_id}") ||
		resolvedPath.includes("{zone_identifier}") ||
		resolvedPath.includes("{zoneId}");
	const firstPositionalIsZone =
		positional.length > 0 &&
		positional[0] !== undefined &&
		positional[0].isZone;
	const needsZoneId =
		firstPositionalIsZone || pathNeedsZone || hasCombinedScope;

	// Worker-name resolution — parallel to the zone logic above.
	const pathNeedsWorkerName =
		isWorkersCommand &&
		(resolvedPath.includes("{script_name}") ||
			resolvedPath.includes("{scriptName}"));
	const firstPositionalIsWorkerName =
		positional.length > 0 &&
		positional[0] !== undefined &&
		positional[0].isWorkerName;
	const needsWorkerName = firstPositionalIsWorkerName || pathNeedsWorkerName;

	const actualHttpMethod = opInfo.method.toUpperCase();
	const requestBodyIsArrayPre = opInfo.requestBodyIsArray ?? false;

	// Discriminated-oneOf variant-prompt block — pre-computed so the
	// import-set decision can use its prompt requirement, and the handler
	// emitter can splice it in after the required-field prompts, once the
	// discriminator is already set.
	const { lines: variantPromptBlock, needsTextPrompt: variantPromptNeedsText } =
		computeVariantPromptBlock(opInfo, bodyArgs(derived.args));

	// Destructive-op classification. `x-forge-require-confirmation`
	// (a "This operation …." sentence) extends DELETE-style prompting
	// to POST/PUT ops with destructive semantics (KV /bulk/delete,
	// queue /purge, etc.).
	const requireConfirmationMessage =
		typeof method.requireConfirmation === "string"
			? method.requireConfirmation
			: undefined;
	const isDelete =
		actualHttpMethod === "DELETE" || requireConfirmationMessage !== undefined;
	const hasExistingForceFlag =
		options.some((o) => o.name === "force") ||
		positional.some((p) => p.name === "force");

	// Zone and worker-name positionals render as [optional] in the yargs
	// command string; others render as <required>.
	const positionalStr = positional
		.map((a) => (a.isZone || a.isWorkerName ? `[${a.name}]` : `<${a.name}>`))
		.join(" ");
	const commandStr = positionalStr
		? `${method.name} ${positionalStr}`
		: method.name;

	// Progress + success labels. `x-forge-require-confirmation` ops use
	// POST/PUT but are destructive — force DELETE semantics so users
	// see "Deleting keys" instead of "Creating keys".
	const labelHttpMethod =
		requireConfirmationMessage !== undefined
			? "DELETE"
			: (actualHttpMethod ?? (isMutating ? "POST" : "GET"));
	const labels = buildLabels(labelHttpMethod, method.name);

	// Closures over labels + outputKind for the handler emitters.
	const formatOutputCall = (indent: string): string =>
		`${indent}formatOutput(result, { successLabel: \`${escapeForTemplateLiteral(labels.success)}\` });`;
	const wrapAwait = (expr: string): string =>
		`await withProgress(\`${escapeForTemplateLiteral(labels.progress)}\`, async () => (${expr}))`;
	const rawHttpVerbLiteral = `'${opInfo.method.toUpperCase()}'`;
	const emitRawTail = (
		indent: string,
		urlExpr: string,
		bodyOptionParts: string[]
	): string[] => {
		const escLabel = escapeForTemplateLiteral(labels.progress);
		const optionParts = [
			`method: ${rawHttpVerbLiteral}`,
			"local: argv.local === true",
			"persistTo: argv.persistTo as string | undefined",
			...bodyOptionParts,
		];
		const lines: string[] = [];
		lines.push(
			`${indent}const __cfRawBytes = await withProgress(\`${escLabel}\`, async () => fetchRawBytes(${urlExpr}, { ${optionParts.join(", ")} }));`
		);
		if (outputKind === "text") {
			lines.push(`${indent}writeRawOutput(__cfRawBytes.toString('utf-8'));`);
		} else {
			// raw-bytes: --text flips to UTF-8 decoded at runtime.
			lines.push(
				`${indent}writeRawOutput(argv.text === true ? __cfRawBytes.toString('utf-8') : __cfRawBytes);`
			);
		}
		lines.push(`${indent}return;`);
		return lines;
	};

	const isRawOutput = outputKind === "binary" || outputKind === "text";

	// Fern method accessors come from sdk-map.json.
	const { allPathParamNames, requiredOptionArgs } = computePathBookkeeping({
		opInfo,
		derived,
	});

	// Query args are exactly the params bag (path / header / body /
	// required-positional args are routed elsewhere), so their presence
	// is the params-bag predicate — matching the set `emitPrelude` iterates.
	const hasParams = queryArgs(derived.args).length > 0;
	const hasHeaders = headerArgs(derived.args).length > 0;

	// Runtime request path shared by every terminal emitter (multipart,
	// file-upload, body-bypass, body-assembly, sdk-call). The dry-run
	// preview path is computed separately in `emitDryRun` because it
	// uses a placeholder account id and doesn't honour zone promotion.
	//
	// Path params are percent-encoded with `encodeURIComponent` so the
	// raw-URL codepaths (which embed this string verbatim into a
	// `client.<verb>(path)` / `fetchRawBytes(path)` call) match the
	// typed SDK's behaviour — the typed methods encode every path param
	// internally, but these hand-built URL strings would otherwise reach
	// the API un-encoded (a key like `foo/bar` would split into extra
	// path segments). The typed-SDK happy path never consumes this
	// string, so there's no double-encoding risk. Account / zone /
	// script-name ids are UUID-like (no URL-significant characters) and
	// are left as bare interpolations for readability + parity with the
	// dry-run preview.
	const resolvedRequestPath = substitutePathTemplate(opInfo.path, {
		needsWorkerName,
		args: derived.args,
		positional,
		firstPositionalIsZone,
		accountIdExpr: `\${accountId}`,
		scriptNameExpr: `\${scriptName}`,
		// Zone path params read the resolved slot auth.ts writes
		// (`argv.zoneId`), never the raw kebab key `argv["zone-id"]`.
		zoneExpr: `\${argv.zoneId}`,
		paramExpr: (argName) =>
			`\${encodeURIComponent(String(argv[${JSON.stringify(argName)}]))}`,
	});

	const ctx: EmitContext = {
		method,
		opInfo,
		outputKind,
		resourceName,
		groupName,
		sdkMapEntry,
		libPath,
		derived,
		allPathParamNames,
		needsAccountId,
		needsZoneId,
		hasAccountOrZoneScope: hasCombinedScope,
		needsWorkerName,
		firstPositionalIsZone,
		firstPositionalIsWorkerName,
		isDelete,
		requireConfirmationMessage,
		hasExistingForceFlag,
		variantPromptBlock,
		variantPromptNeedsText,
		requiredOptionArgs,
		requestBodyIsArrayPre,
		resolvedRequestPath,
		hasParams,
		hasHeaders,
		isRawOutput,
		progressLabel: labels.progress,
		successLabel: labels.success,
		formatOutputCall,
		wrapAwait,
		emitRawTail,
	};

	return { ctx, commandStr };
}
