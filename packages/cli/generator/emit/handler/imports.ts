/**
 * Build the per-command `ImportSet` from the operation's shape.
 *
 * Each emitter advertises the names it needs by writing into the
 * shared set — but the import block also needs cross-cutting decisions
 * (e.g. `resolveFileToken` is needed if ANY body param has `fromFile`,
 * OR multipart fields exist, OR `--body` is non-JSON). Centralising
 * those rollups here keeps the orchestrator focused on context
 * construction.
 */
import { bodyOptionArgs } from "../../intermediate-representation.js";
import { ImportSet } from "../imports.js";
import {
	canEmitTypedBodySdkCall,
	canEmitTypedJsonBodySdkCall,
	canEmitTypedSdkCall,
	typedBuilderDeclaration,
	usesTypedQuery,
} from "../sdk-path.js";
import { bodyBypassUsesRequestApi } from "./body-bypass.js";
import { sdkCallUsesRequestApi } from "./sdk-call.js";
import type { EmitContext } from "../context.js";

export function buildImportSet(ctx: EmitContext): ImportSet {
	const {
		opInfo,
		outputKind,
		libPath,
		derived,
		needsAccountId,
		needsZoneId,
		needsWorkerName,
		isDelete,
		variantPromptBlock,
		variantPromptNeedsText,
	} = ctx;
	const { hasBody, hasBodyParams, hasFileUpload, multipartFlagFields } =
		derived;
	const bodyFlags = bodyOptionArgs(derived.args);

	const imports = new ImportSet();

	if (typedBuilderDeclaration(ctx)) {
		imports.from(`${libPath}/cli-types.js`).add("withArgTypes");
	}
	imports.typeFrom("yargs").add("Argv").add("CommandModule");
	imports
		.typeFrom(`${libPath}/cli-types.js`)
		.add("CommonYargsOptions")
		.add("InferArgs");

	const hasTypedRequest =
		ctx.sdkMapEntry?.requestType !== undefined &&
		(canEmitTypedSdkCall(ctx) || canEmitTypedJsonBodySdkCall(ctx));
	if (hasTypedRequest) {
		const sdkTypes = imports.typeFrom("#sdk");
		// account_id is now a request field (dropped as a client-level SDK
		// variable), so any path param — account included — makes the request
		// non-pure-query. Mirrors `typedSdkTypeAliases`' pathFields check.
		const hasPathFields = ctx.allPathParamNames.length > 0;
		const usesTypedBody =
			ctx.derived.hasBody && canEmitTypedJsonBodySdkCall(ctx);
		const isPureQuery =
			canEmitTypedSdkCall(ctx) && !hasPathFields && ctx.hasParams;
		if (usesTypedBody || !isPureQuery) sdkTypes.add("SdkRequest");
		if (usesTypedQuery(ctx)) sdkTypes.add("SdkQuery");
	}

	// `createCommandClient` builds the SDK client so `--local` can swap
	// the fetch transport transparently.
	const auth = imports.from(`${libPath}/auth.js`).add("createCommandClient");
	if (needsAccountId) auth.add("getAccountId").add("resolveAccountIdSilent");
	if (needsZoneId) auth.add("getZoneId");
	if (needsWorkerName) auth.add("getWorkerName");
	if (bodyBypassUsesRequestApi(ctx) || sdkCallUsesRequestApi(ctx)) {
		auth.add("requestApi");
	}

	if (needsAccountId) {
		// `LOCAL_ACCOUNT_ID` is a placeholder the SDK accepts as a path
		// segment; the local-mode fetch wrapper strips `/accounts/{id}/`
		// from every URL before it lands.
		imports.from(`${libPath}/local.js`).add("LOCAL_ACCOUNT_ID");
	}

	imports.from(`${libPath}/output.js`).add("formatOutput");
	imports.from(`${libPath}/dry-run.js`).add("formatDryRun");
	imports.from(`${libPath}/progress.js`).add("withProgress");
	imports.from(`${libPath}/telemetry/index.js`).add("runWithTelemetry");
	imports.typeFrom(`${libPath}/telemetry/index.js`).add("ArgClassification");

	if (outputKind === "binary" || outputKind === "text") {
		imports
			.from(`${libPath}/raw-fetch.js`)
			.add("fetchRawBytes")
			.add("writeRawOutput");
	}

	// Input-validation imports. cf does NOT pre-validate / "harden"
	// resource ids — there is no client-side trust boundary (see
	// `emitPrelude`). The only consumers of this module are the
	// `@file` ingestion helpers.
	//
	// `resolveFileToken` is needed if any string-typed body param accepts
	// `@file` (i.e. `info.fromFile` is defined), OR multipart fields
	// exist (each one gets `@file` treatment unconditionally), OR
	// `--body` is non-JSON (`@file` resolves as binary).
	const bodyParamsNeedFileToken = bodyFlags.some(
		(a) => a.fromFile !== undefined
	);
	const hasNonJsonBody =
		hasBody && !opInfo.requestContentTypes.includes("application/json");
	const needsResolveFileToken =
		bodyParamsNeedFileToken || multipartFlagFields.length > 0 || hasNonJsonBody;

	if (needsResolveFileToken || hasFileUpload) {
		const inputValidation = imports.from(`${libPath}/input-validation.js`);
		if (needsResolveFileToken) inputValidation.add("resolveFileToken");
		// Non-JSON `--file` uploads (octet-stream raw bodies + multipart
		// payload fields) read the file via `readFileForFlag`, which wraps
		// `readFileSync` with a friendly "Cannot read invalid or empty
		// file" error and an empty-file guard.
		if (hasFileUpload) inputValidation.add("readFileForFlag");
	}

	if (hasBody || hasBodyParams) {
		const bp = imports.from(`${libPath}/body-parser.js`);
		if (hasBody) bp.add("parseBody");
		if (hasBodyParams) bp.add("compactBody");
		if (bodyFlags.some((arg) => arg.type === "object-array")) {
			bp.add("parseObjectArray");
		}
		if (hasBodyParams && !canEmitTypedBodySdkCall(ctx)) {
			bp.add("setNestedValue");
		}
	}

	// Prompt imports — three flavors: required-field text, required-field
	// enum, and confirmDelete. A variant block may contain only required-field
	// errors, so it separately reports whether it emitted a text prompt.
	{
		let needsTextPrompt = variantPromptNeedsText;
		let needsEnumPrompt = false;
		for (const a of bodyFlags) {
			if (!a.required) continue;
			if (a.choices && a.choices.length > 0) {
				needsEnumPrompt = true;
			} else if (a.type === "string") {
				needsTextPrompt = true;
			}
		}
		if (needsTextPrompt || needsEnumPrompt || isDelete) {
			const prompt = imports.from(`${libPath}/prompt.js`);
			if (needsTextPrompt) prompt.add("promptForRequiredField");
			if (needsEnumPrompt) prompt.add("promptForRequiredEnumField");
			if (isDelete) prompt.add("confirmDelete");
		}
	}

	return imports;
}
