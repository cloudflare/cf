import type { SdkMapEntry } from "#sdk";
/**
 * Shared context passed to every handler-block emitter.
 *
 * Computed once at the top of `generateCommandFile` and read (never
 * written) by each sub-emitter — bundling 20+ derived locals into one
 * object keeps the emitter call sites short.
 *
 * Each emitter mutates only the `ImportSet` it's given; everything else
 * is read-only. The orchestrator (`generateCommandFile`) is the single
 * place that decides handler-block ordering.
 */
import type { DerivedArgs } from "../arg-derivation.js";
import type { OutputKind } from "../codegen/output-kind.js";
import type { ArgIR } from "../intermediate-representation.js";
import type { OperationInfo, Schema } from "@cloudflare/forge";

export interface EmitContext {
	method: Schema.method;
	opInfo: OperationInfo;
	outputKind: OutputKind;
	resourceName: string;
	groupName: string | undefined;
	sdkMapEntry: SdkMapEntry | undefined;
	libPath: string;
	derived: DerivedArgs;

	// Path-param bookkeeping.
	allPathParamNames: readonly string[];

	// Account / zone / worker-name resolution flags.
	needsAccountId: boolean;
	needsZoneId: boolean;
	hasAccountOrZoneScope: boolean;
	needsWorkerName: boolean;
	firstPositionalIsZone: boolean;
	firstPositionalIsWorkerName: boolean;

	// Confirm-prompt classification.
	isDelete: boolean;
	requireConfirmationMessage: string | undefined;
	hasExistingForceFlag: boolean;

	// Discriminator + variant prompts (pre-computed; the emitter splices
	// them into the handler at the right place).
	variantPromptBlock: readonly string[];
	variantPromptNeedsText: boolean;

	// Required options used by request-body and typed-call emitters.
	requiredOptionArgs: readonly ArgIR[];

	requestBodyIsArrayPre: boolean;

	// Runtime request-path template (no surrounding backticks): the
	// op's `opInfo.path` with `{param}` placeholders substituted for the
	// live-call expressions (`${accountId}`, `${scriptName}`,
	// `${argv.<name>}`). Computed once — every terminal emitter that
	// synthesises the URL wraps it in a template literal. The dry-run
	// preview uses its own variant (placeholder account id, no zone
	// promotion), so it does NOT reuse this.
	resolvedRequestPath: string;

	// Body / params / headers flags.
	hasParams: boolean;
	hasHeaders: boolean;
	isRawOutput: boolean;

	// Labels.
	progressLabel: string;
	successLabel: string;

	// Inline emit helpers — closed over `progressLabel` and `outputKind`,
	// so they're computed once at context-construction time rather than
	// reconstructed in every emitter.
	formatOutputCall: (indent: string) => string;
	wrapAwait: (expr: string) => string;
	emitRawTail: (
		indent: string,
		urlExpr: string,
		bodyOptionParts: string[]
	) => string[];
}
