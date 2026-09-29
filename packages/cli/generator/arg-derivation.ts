/**
 * Derives the CLI command's args (positionals + option flags) from a
 * method definition and its resolved OpenAPI op.
 *
 * The single source of truth for both `generator.ts` (TS codegen) and
 * `metadata.ts` (sidecar JSON), so the `commands.json` consumed by MCP
 * / agent catalogues / completion tooling can never disagree with what
 * `cf <op> --help` actually accepts.
 */
import assert from "assert";
import {
	isMutatingMethod,
	isZoneArg,
	resolveOperation,
	toKebabCase,
} from "@cloudflare/forge";
import { isWorkerNameArg } from "./arg-classification.js";
import {
	bodyOptionArgs,
	bodyParamArgType,
} from "./intermediate-representation.js";
import {
	ACCOUNT_PATH_PARAMS,
	ZONE_PATH_PARAMS,
	accountOrZonePathParamLocal,
	extractTemplateParams,
} from "./util.js";
import type { ArgIR } from "./intermediate-representation.js";
import type { BodyParamInfo, MultipartInfo, Schema } from "@cloudflare/forge";

type OperationInfo = NonNullable<ReturnType<typeof resolveOperation>>;

// CLI-only options that must NOT be forwarded to the SDK's params object
// (i.e. never registered as auto-derived body flags).
export const CLI_ONLY_OPTIONS = new Set([
	"dry-run",
	"body",
	"file",
	"local",
	"remote",
	"preview",
	"persist-to",
	"yes",
	"output",
	"table",
]);

/**
 * Group-implies-required-leaf: when a body schema has an optional
 * parent containing required inner fields (e.g. workflows
 * `status edit`'s optional `from` with required `from.name`),
 * forge surfaces the inner leaves with `required: true` (which is
 * spec-truth: required-when-the-parent-is-present). For a flat-flag
 * CLI, that's wrong — it would prompt for `--from-name` even when
 * the user isn't setting any `--from-*` field. The right semantic
 * is "if any --<parent>-* flag is set, the required leaves under
 * that parent must also be set; otherwise omit the parent entirely".
 *
 * `deriveArgsFromOp` returns one OptionalParentGroup per offending
 * parent; `applyOptionalParentDowngrade` then flips the leaf args to
 * optional so the prompt loop skips them and yargs doesn't mark them
 * `demandOption: true`. The generator emits a `.check()` per group to
 * re-enforce the semantic at runtime.
 *
 * Multi-level nesting (e.g. `from.deep.name` under optional
 * `from.deep` under optional `from`) is NOT handled — it'd need
 * recursion through nested required sets that forge doesn't expose at
 * deeper levels, and no current cf endpoint needs it.
 *
 * See `cf/test_bugs/body-params-required-within-optional-parent.md`.
 */
export interface OptionalParentGroup {
	parentName: string;
	/**
	 * Kebab-case flag names of siblings under this parent whose spec
	 * declares no default. These are the only flags we can use to
	 * detect "user set any sibling under the optional parent": a
	 * spec-default-populated flag is always defined in argv whether
	 * the user passed it or not, so it can't reliably indicate user
	 * intent.
	 */
	groupSetFlags: string[];
	/** kebab-case flag names the spec marks required (before downgrade) */
	requiredFlags: string[];
}

export interface DerivedArgs {
	/**
	 * The unified argument IR — the single source the derivers build and
	 * every consumer reads. Positional vs option is `arg.positional`;
	 * query / header / body provenance is `arg.origin`.
	 */
	args: ArgIR[];
	/**
	 * Optional-parent groups discovered from `opInfo.requestBodyRequired`
	 * plus the body args. The downgrade is already applied to `args`;
	 * this list is the input for the generator's `.check()` emission.
	 * Empty when no such groups exist.
	 */
	optionalParentGroups: OptionalParentGroup[];

	// ── Derived booleans (pure functions of opInfo + body args) ──
	// Computed once here so every consumer branches on the same values.

	/** HTTP verb is not GET/HEAD (POST/PUT/PATCH/DELETE). */
	isMutating: boolean;
	/**
	 * Mutating + opInfo declares hasRequestBody. Triggers `--body` /
	 * `--file` emission, the body-bypass handler block, and the
	 * "--body required" throw guard (when not hasEmptyBody).
	 */
	hasBody: boolean;
	/**
	 * hasRequestBody is true but the schema is empty — no introspectable
	 * fields, no multipart, no array body, content type missing or only
	 * application/json. Many DELETE / no-body POST endpoints have an
	 * empty `requestBody: {}` placeholder; we skip the "--body required"
	 * throw for those.
	 */
	hasEmptyBody: boolean;
	/** Mutating + at least one body field supplied by a flag or positional. */
	hasBodyParams: boolean;
	/** Op accepts at least one non-JSON content type (multipart, octet, etc.). */
	hasFileUpload: boolean;
	/**
	 * Resolved multipart schema. Populated iff the op accepts
	 * `multipart/form-data`; `undefined` for non-multipart ops.
	 * (`multipartInfo !== undefined` is the canonical "supports
	 * multipart" check.)
	 */
	multipartInfo: MultipartInfo | undefined;
	/**
	 * Multipart fields that deserve their own CLI flag — everything
	 * except the payload field (routed through --body / --file) and
	 * any `format: binary` fields (also routed through --file).
	 */
	multipartFlagFields: MultipartInfo["fields"];
}

/**
 * Sanitize an OpenAPI parameter name to a CLI flag name.
 *   `zone_id` → `zone-id`
 *   `name.exact` → `name-exact`
 *   `per_page` → `per-page`
 */
function toFlagName(name: string): string {
	return name.replace(/[_.]/g, "-");
}

/**
 * Keep API fields from shadowing cf's global configuration mode. Upstream
 * schemas will eventually avoid this reserved name; until then the raw body
 * remains available for body fields that would otherwise emit `--mode`.
 */
function toCliFlagName(name: string): string | undefined {
	const flagName = toFlagName(name);
	return flagName.toLowerCase() === "mode" ? undefined : flagName;
}

/**
 * CLI flag name for a path, query, or header parameter. An
 * `x-fern-parameter-name` (forge's `sdkName`) is kebab-cased because
 * spec authors write it in either camel or kebab case; the wire name
 * keeps the plain `toCliFlagName` sanitisation.
 */
function parameterFlagName(p: {
	name: string;
	sdkName?: string;
}): string | undefined {
	return toCliFlagName(
		p.sdkName === undefined ? p.name : toKebabCase(p.sdkName)
	);
}

/**
 * Derive a human-readable description from an OpenAPI parameter name
 * when the spec doesn't carry one.
 *   `acl_id` → `ACL ID`
 *   `database_id` → `Database ID`
 *   `script_name` → `Script name`
 */
function descriptionFromName(name: string): string {
	const words = name.split("_");
	return words
		.map((w, i) => {
			if (w === "id" || w === "identifier") return "ID";
			return i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w;
		})
		.join(" ");
}

/**
 * Derive the canonical positional / options / paramMap shape for a
 * single command from its method definition and (optional) resolved
 * OpenAPI op info.
 *
 * @param method - The Schema.method to derive args for.
 * @param resourceName - Top-level resource (e.g. "dns", "workers").
 *   Drives the worker-name scope check.
 * @param opInfo - Resolved OpenAPI operation if the method has one.
 *   When absent, returns just the schema-declared args.
 */
export function deriveArgsFromOp(
	method: Schema.method,
	resourceName: string,
	opInfo: OperationInfo
): DerivedArgs {
	assert(!method.args, `Method provided explicit CLI args: ${opInfo.path}`);

	const isWorkersCommand = resourceName === "workers";

	const overrides = method.params ?? {};

	// Single accumulator. Each section appends `ArgIR`s in
	// path → query → header → body order; dedup checks in the later
	// sections compare against names already laid down by earlier ones.
	const args: ArgIR[] = [];
	derivePathParams({
		args,
		opInfo,
		overrides,
		method,
		isWorkersCommand,
	});
	deriveQueryParams({ args, opInfo, overrides, isWorkersCommand });
	deriveHeaderParams({ args, opInfo, isWorkersCommand });
	deriveBodyParams({ args, opInfo, overrides, isWorkersCommand });

	// We only *find* optional-parent groups here; runtime generation and
	// metadata apply the downgrade separately via `applyOptionalParentDowngrade`.
	const optionalParentGroups = findOptionalParentGroups(args, opInfo);

	// Prefer the actual HTTP verb from OpenAPI when available — handles
	// compound names like `language-vtt-get` which `isMutatingMethod`
	// would (incorrectly) classify by name. Fall back to name-based
	// heuristic only when opInfo has no verb (shouldn't happen for
	// autoDerive methods, but defensive).
	const isMutating = opInfo.method
		? opInfo.method.toUpperCase() !== "GET" &&
			opInfo.method.toUpperCase() !== "HEAD"
		: isMutatingMethod(method.name);

	const hasBody = isMutating && (opInfo.hasRequestBody ?? false);

	const requestContentTypes = opInfo.requestContentTypes ?? [];
	const onlyJsonOrEmpty =
		requestContentTypes.length === 0 ||
		requestContentTypes.every((ct) => ct === "application/json");

	// "Empty body schema": forge declares `hasRequestBody: true` for
	// every op whose OpenAPI spec lists a requestBody node — even when
	// that node has zero fields (DELETE / no-body POST endpoints often
	// include an empty `requestBody: {}` placeholder). Treat the body
	// as truly absent when (1) opInfo declares hasRequestBody, (2) zero
	// introspectable body fields surfaced, (3) no multipart schema,
	// (4) no array body, (5) content types are absent or only JSON.
	const hasEmptyBody =
		(opInfo.hasRequestBody ?? false) &&
		// A referenced schema can have no flattenable flags while still carrying
		// a required payload (for example, Magic Transit bulk route deletion).
		opInfo.requestBodyRef === null &&
		opInfo.bodyParams.length === 0 &&
		opInfo.multipart === undefined &&
		!(opInfo.requestBodyIsArray ?? false) &&
		onlyJsonOrEmpty;

	const hasBodyParams =
		args.some((arg) => arg.origin.kind === "body") && isMutating;

	const hasFileUpload = requestContentTypes.some(
		(ct) => ct !== "application/json"
	);

	const multipartInfo: MultipartInfo | undefined = requestContentTypes.includes(
		"multipart/form-data"
	)
		? opInfo.multipart
		: undefined;
	const multipartFlagFields = (multipartInfo?.fields ?? []).filter(
		(f) =>
			!f.isBinary &&
			f.name !== multipartInfo?.payloadField &&
			toCliFlagName(f.name) !== undefined
	);

	return {
		args,
		optionalParentGroups,
		isMutating,
		hasBody,
		hasEmptyBody,
		hasBodyParams,
		hasFileUpload,
		multipartInfo,
		multipartFlagFields,
	};
}

/**
 * Find optional-parent groups. Pure — does not mutate `args`; the
 * downgrade is applied separately (see `OptionalParentGroup` for the
 * semantic).
 */
function findOptionalParentGroups(
	args: readonly ArgIR[],
	opInfo: OperationInfo
): OptionalParentGroup[] {
	const requestBodyRequiredSet = new Set<string>(
		opInfo.requestBodyRequired ?? []
	);
	const groupedByParent = new Map<
		string,
		{
			flagKebab: string;
			required: boolean;
			hasCliDefault: boolean;
		}[]
	>();
	for (const arg of bodyOptionArgs(args)) {
		if (arg.origin.kind !== "body") continue;
		const apiFieldPath = arg.origin.apiFieldPath;
		if (apiFieldPath.length < 2) continue;
		const parentName = apiFieldPath[0]!;
		if (!groupedByParent.has(parentName)) {
			groupedByParent.set(parentName, []);
		}
		groupedByParent.get(parentName)!.push({
			flagKebab: arg.name,
			required: arg.required,
			hasCliDefault: arg.default !== undefined,
		});
	}

	const groups: OptionalParentGroup[] = [];
	for (const [parentName, entries] of groupedByParent) {
		// Skip required-at-root parents — their inner required leaves are
		// unconditionally required and the prompt loop handles them
		// correctly.
		if (requestBodyRequiredSet.has(parentName)) continue;
		const requiredEntries = entries.filter((e) => e.required);
		if (requiredEntries.length === 0) continue;
		groups.push({
			parentName,
			groupSetFlags: entries
				.filter((e) => !e.hasCliDefault)
				.map((e) => e.flagKebab),
			requiredFlags: requiredEntries.map((e) => e.flagKebab),
		});
	}

	return groups;
}

/**
 * Flip each downgraded leaf's `arg.required` to `false` in-place.
 * Called by runtime generation and metadata so yargs and `commands.json`
 * expose the same requiredness. The runtime `.check()` re-enforces
 * "required when any sibling under the optional parent is set".
 */
export function applyOptionalParentDowngrade(derived: DerivedArgs): void {
	const { optionalParentGroups } = derived;
	if (optionalParentGroups.length === 0) return;

	const downgraded = new Set<string>();
	for (const g of optionalParentGroups) {
		for (const flag of g.requiredFlags) downgraded.add(flag);
	}
	for (const a of derived.args) {
		if (a.origin.kind === "body" && !a.positional && downgraded.has(a.name)) {
			a.required = false;
		}
	}
}

// ─────────────────────────────────────────────────────────────────────
// Per-section derivers. Each pushes `ArgIR`s into the shared `args`
// accumulator. The order matters: path → query → header → body, because
// dedup checks in the later sections compare against names already laid
// down by the earlier ones.
// ─────────────────────────────────────────────────────────────────────

/**
 * Precompute the two classifications every consumer asks for. Both read
 * only the arg name: `isZone` via forge's `isZoneArg`, `isWorkerName`
 * via `isWorkerNameArg` scoped to `cf workers`. The minimal `{ name }`
 * stand-in is enough — neither predicate inspects anything else.
 */
function classify(
	name: string,
	isWorkersCommand: boolean
): { isZone: boolean; isWorkerName: boolean } {
	const nameOnly = { name, type: "string" } as Schema.arg;
	return {
		isZone: isZoneArg(nameOnly),
		isWorkerName: isWorkersCommand && isWorkerNameArg(nameOnly),
	};
}

/**
 * Build an `ArgIR`, filling in the `classify` pair so the per-section
 * derivers don't repeat it at every push site. Path, query, and header
 * args classify by their wire name so an `x-fern-parameter-name` rename
 * never changes zone or worker handling.
 */
function mkArg(
	init: Omit<ArgIR, "isZone" | "isWorkerName">,
	isWorkersCommand: boolean,
	classifyName: string = init.name
): ArgIR {
	return {
		...init,
		...classify(classifyName, isWorkersCommand),
	};
}

/**
 * Path parameters. The last non-account/zone path param is the
 * "command subject" and becomes the positional (for non-list /
 * non-bulk ops); earlier path params demote to required flags;
 * worker-name path params become `--worker` options under
 * `cf workers *`; zone path params are dropped entirely (resolved via
 * the global `--zone` flag). Those roles come from the wire name; the
 * emitted name honours `x-fern-parameter-name`, and `origin.wireName`
 * keeps the placeholder so URL substitution reads the renamed argv key.
 */
function derivePathParams(args: {
	args: ArgIR[];
	opInfo: OperationInfo;
	overrides: Record<string, Schema.paramOverride>;
	method: Schema.method;
	isWorkersCommand: boolean;
}): void {
	const { args: out, opInfo, overrides, method, isWorkersCommand } = args;
	const detectedPathParams = extractTemplateParams(opInfo.path).filter(
		// Account and combined account/zone scope come from global context.
		(name) =>
			!ACCOUNT_PATH_PARAMS.has(name) &&
			accountOrZonePathParamLocal(opInfo.path, name) === undefined
	);

	// The goal of positionals in a CLI is to represent the "resource"
	// that a particular command is operating on. bulk operations and
	// listing aren't operating on a particular resource, so should not
	// have generated positionals.
	const noPositionals =
		method.name === "list" || method.name.startsWith("bulk");
	const commandSubject = noPositionals
		? undefined
		: detectedPathParams[detectedPathParams.length - 1];

	for (const p of detectedPathParams) {
		const override = overrides[p];
		if (override?.hidden) continue;
		const parameter = opInfo.pathParams.find((a) => a.name === p);
		const wireFlag = toFlagName(p);
		const { isZone, isWorkerName } = classify(wireFlag, isWorkersCommand);
		if (isZone) {
			// Zone ids resolve via the global --zone flag; never emit a
			// zone positional or `--zone-id` option.
			continue;
		}
		// Worker-name path params become `--worker` options; the
		// command subject becomes the positional; other containers demote
		// to required flags so positional arity stays at ≤1.
		const positional = !isWorkerName && p === commandSubject;
		const emittedName = isWorkerName
			? "worker"
			: parameterFlagName(parameter ?? { name: p });
		if (emittedName === undefined) continue;
		out.push(
			mkArg(
				{
					name: emittedName,
					type: "string",
					required: true,
					positional,
					origin: { kind: "path", wireName: p },
					description:
						override?.description ??
						parameter?.description ??
						descriptionFromName(p),
				},
				isWorkersCommand,
				wireFlag
			)
		);
	}
}

/**
 * Query parameters. Each arg keeps the original OpenAPI param name in
 * `origin.wireName` (e.g. `per_page`, `name.exact`) so the generator
 * emits `params[<wire>]` with the spelling the API expects, while the
 * flag itself reads off the camelized kebab name (`--name-exact` →
 * `argv.nameExact`) — the two differ for dotted params and for params
 * renamed by `x-fern-parameter-name`.
 */
function deriveQueryParams(args: {
	args: ArgIR[];
	opInfo: OperationInfo;
	overrides: Record<string, Schema.paramOverride>;
	isWorkersCommand: boolean;
}): void {
	const { args: out, opInfo, overrides, isWorkersCommand } = args;

	for (const p of opInfo.queryParams) {
		const override = overrides[p.name];
		if (override?.hidden) continue;
		// TODO: this _probably_ represents flags that we need to rename
		// on the backend.
		if (/[<>\[\]{}~]/.test(p.name)) {
			console.warn(`[cf-generator] ${p.name} is an invalid flag name`);
			continue;
		}

		const argType = p.type;
		const isRequired = override?.required ?? p.required;
		// Query params NEVER carry a client-side default — not the spec's
		// `p.default`, and never a synthesized boolean `false`. The query
		// bag drops only `undefined`, so any attached default is serialized
		// on every request even when the user never set the flag
		// (`?per_page=100`, `?proxied=false`). That both pollutes the URL
		// and removes the user's ability to "leave it alone" and let the
		// API apply its own (possibly different) default server-side. Only
		// an explicit overlay `default` — a deliberate authoring choice —
		// is honoured.
		const defaultVal = override?.default ?? undefined;

		if (p.enumValues && p.enumValues.length === 0) {
			console.warn(
				`[cf-generator] ${p.name} on ${opInfo.path} has a zero-length enumValues`
			);
		}

		const argName = parameterFlagName(p);
		if (argName === undefined) continue;
		const description =
			override?.description ?? p.description ?? descriptionFromName(p.name);
		const isEnum = !!(p.enumValues && p.enumValues.length > 0);

		out.push(
			mkArg(
				{
					name: argName,
					// Enum query params carry their choices; non-enum keep their
					// scalar kind (query params never use the `array` kind).
					type: isEnum
						? "enum"
						: argType === "number"
							? "number"
							: argType === "boolean"
								? "boolean"
								: "string",
					...(isEnum ? { choices: p.enumValues } : {}),
					// Enums and required params carry no default; otherwise an
					// explicit overlay default (the only `defaultVal` source)
					// applies.
					...(isRequired || isEnum ? {} : { default: defaultVal }),
					required: isRequired,
					positional: false,
					origin: { kind: "query", wireName: p.name },
					description,
				},
				isWorkersCommand,
				toFlagName(p.name)
			)
		);
	}
}

/**
 * Header parameters. Each arg keeps the original header name in
 * `origin.wireName` (e.g. `cf-r2-jurisdiction`) for the SDK call's
 * `headers` object; the flag honours `x-fern-parameter-name`. Dedupes against names already laid down by
 * path / query.
 */
function deriveHeaderParams(args: {
	args: ArgIR[];
	opInfo: OperationInfo;
	isWorkersCommand: boolean;
}): void {
	const { args: out, opInfo, isWorkersCommand } = args;
	// We only have a few of these in the API...
	// TODO: is this a pattern we actually _want_? Should we get rid of
	// it at some point?
	if (opInfo.headerParams.length === 0) return;

	for (const hp of opInfo.headerParams) {
		const argName = parameterFlagName(hp)?.toLowerCase();
		if (argName === undefined) continue;
		// Dedupe against names already laid down by path / query.
		if (out.some((a) => a.name === argName)) continue;
		out.push(
			mkArg(
				{
					name: argName,
					type: "string",
					required: hp.required,
					positional: false,
					origin: { kind: "header", wireName: hp.name },
					description: hp.description ?? `The ${hp.name} header`,
				},
				isWorkersCommand,
				toFlagName(hp.name).toLowerCase()
			)
		);
	}
}

/**
 * Body parameters. Walks `opInfo.bodyParams` and emits one CLI flag
 * (or, when overlay-promoted, one positional) per field. The flag name is
 * forge's `bp.name`, which already applies each segment's
 * `x-fern-property-name`. Honours:
 *   - `paramOverride.hidden` skip
 *   - `paramOverride.positional` promote-to-positional (top-level
 *     scalar fields only)
 *   - `paramOverride.array` treat as array on the wire
 *   - `paramOverride.choices` enum-values override
 *   - `paramOverride.required` upgrade optional → required
 *   - `paramOverride.default` clear-on-null vs override-with-value
 *
 * Appends one body `ArgIR` per field to `args`, in spec order. The
 * `bodyOptionArgs` helper selects only the fields emitted as options;
 * positional body fields remain in `args`.
 */
function deriveBodyParams(args: {
	args: ArgIR[];
	opInfo: OperationInfo;
	overrides: Record<string, Schema.paramOverride>;
	isWorkersCommand: boolean;
}): void {
	const { args: out, opInfo, overrides, isWorkersCommand } = args;
	if (opInfo.bodyParams.length === 0) {
		return;
	}

	// Names this operation actually templates into its URL. A body field
	// named `account_id` / `zone_id` is only the redundant
	// global-flag-resolved container when the path genuinely carries the
	// matching placeholder. When it doesn't (e.g. r2 add-custom-domain's
	// body-only `zoneId`), the field is a legitimate body flag and must
	// be surfaced.
	const pathParamNames = new Set(extractTemplateParams(opInfo.path));
	const pathHasAccountId = [...ACCOUNT_PATH_PARAMS].some((p) =>
		pathParamNames.has(p)
	);
	const pathHasZoneId = [...ZONE_PATH_PARAMS].some((p) =>
		pathParamNames.has(p)
	);
	const requiredRootBodyFields = new Set(opInfo.requestBodyRequired ?? []);

	for (const bp of opInfo.bodyParams) {
		const override = overrides[bp.apiFieldPath.join(".")];

		const argName = toCliFlagName(bp.name);
		if (argName === undefined) continue;
		if (out.some((a) => a.name === argName)) {
			console.warn(
				`[cf-generator] Parameter specified in both body and path params/query params: ${argName} ${opInfo.path}`
			);
			continue;
		}

		// Skip account_id / zone_id variants ONLY when the op's URL
		// templates the matching container — those are resolved from
		// global context (--account-id / --zone) rather than the body. A
		// body field that merely shares the name (e.g. r2
		// add-custom-domain's body-only `zoneId`) is a real flag and must
		// flow through.
		const isAccountIdField =
			bp.apiFieldPath.length === 1 &&
			(bp.apiFieldPath[0] === "account_id" ||
				bp.apiFieldPath[0] === "accountId");
		const isZoneIdField =
			bp.apiFieldPath.length === 1 &&
			(bp.apiFieldPath[0] === "zone_id" || bp.apiFieldPath[0] === "zoneId");
		if (isAccountIdField && pathHasAccountId) continue;
		if (isZoneIdField && pathHasZoneId) continue;
		if (argName === "account-id" && pathHasAccountId) continue;
		if (argName === "zone-id" && pathHasZoneId) continue;
		if (
			CLI_ONLY_OPTIONS.has(argName) ||
			argName === "body" ||
			argName === "file"
		)
			continue;

		const bpOverride =
			overrides[bp.apiFieldPath.join(".")] ??
			overrides[bp.apiFieldPath[0] ?? ""];
		const overrideChoices = bpOverride?.choices?.map(String);
		const effectiveEnumValues =
			overrideChoices && overrideChoices.length > 0
				? overrideChoices
				: bp.enumValues && bp.enumValues.length > 0
					? bp.enumValues
					: undefined;

		// `paramOverride.positional: true` promotes a top-level scalar or
		// scalar-array body field to a positional. Booleans and object
		// arrays never promote. Nested fields never promote (the CLI
		// surface is flat).
		if (
			bpOverride?.positional === true &&
			bp.apiFieldPath.length === 1 &&
			bp.type !== "boolean" &&
			bp.itemType !== "object"
		) {
			const description =
				bpOverride.description ??
				bp.description ??
				`The ${bp.apiFieldPath[0]} field`;
			const isRequired = bpOverride.required ?? bp.required ?? false;
			const positionalType = bodyParamArgType(
				bpOverride?.array === true ? "array" : bp.type,
				bp.itemType
			);
			out.push(
				mkArg(
					{
						name: argName,
						type:
							positionalType === "array"
								? "array"
								: effectiveEnumValues
									? "enum"
									: positionalType,
						...(effectiveEnumValues ? { choices: effectiveEnumValues } : {}),
						required: isRequired,
						positional: true,
						origin: { kind: "body", apiFieldPath: bp.apiFieldPath },
						description,
					},
					isWorkersCommand
				)
			);
			continue;
		}

		const effectiveType: BodyParamInfo["type"] =
			bpOverride?.array === true ? "array" : bp.type;
		const effectiveRequired = bpOverride?.required ?? bp.required ?? false;
		// Resolve the effective `@file` ingestion mode for this flag.
		// `paramOverride.fromFile` lookup uses the same dotted-path or
		// top-level fallback the generator's two consumer sites used to
		// duplicate.
		const fromFileOverride =
			bpOverride?.fromFile ??
			(bp.apiFieldPath.length === 1
				? overrides[bp.apiFieldPath[0] ?? ""]?.fromFile
				: undefined);
		const fromFile: ArgIR["fromFile"] =
			effectiveType !== "string" || fromFileOverride === false
				? undefined
				: fromFileOverride
					? { format: fromFileOverride.format }
					: { format: "text" };

		// `paramOverride.default` semantics (distinguish explicit `null`
		// from "key absent" via `'default' in bpOverride`, NOT
		// nullish-coalescing):
		//   - key absent: no override; spec default applies (if any).
		//   - null: explicit clear; suppress the spec default.
		//   - other: override the default value.
		const overrideHasDefault =
			bpOverride !== undefined && "default" in bpOverride;
		const effectiveDefault =
			overrideHasDefault && bpOverride!.default !== null
				? (bpOverride!.default as string | number | boolean)
				: overrideHasDefault
					? undefined // explicit `null` clear
					: bp.default;
		// A yargs default makes a flag look user-supplied. For a nested body
		// field that would make body assembly create its optional top-level
		// parent even when the user supplied no flag in that group. Besides
		// sending an unwanted object, this can produce an invalid body when
		// the parent is a discriminated union (for example `format` with a
		// defaulted `compression` but no required `type`). Leave the default
		// to the API unless the parent itself is required at the body root.
		const isNestedUnderOptionalParent =
			bp.apiFieldPath.length > 1 &&
			!requiredRootBodyFields.has(bp.apiFieldPath[0]!);
		const cliDefault = isNestedUnderOptionalParent
			? undefined
			: effectiveDefault;
		const bodyType = bodyParamArgType(effectiveType, bp.itemType);
		// Forge's `itemType: "object"` is structural: the complete array must
		// remain one lossless JSON value. Do not let an accidental overlay choice
		// list turn it back into a scalar enum flag.
		const argType =
			bodyType === "object-array"
				? bodyType
				: effectiveEnumValues
					? "enum"
					: bodyType;
		const choices = argType === "enum" ? effectiveEnumValues : undefined;
		const baseDescription =
			bp.description ?? `The ${bp.apiFieldPath.join(".")} field`;
		const description =
			argType === "object-array"
				? `${baseDescription}${/[.!?]$/.test(baseDescription) ? " " : ". "}Provide as a JSON array of objects or @path/to/file.json.`
				: baseDescription;

		out.push(
			mkArg(
				{
					name: argName,
					// Array body shapes keep their kind here. Scalar arrays become
					// repeatable flags; direct object arrays become one JSON-valued
					// flag. Both collapse to yargs `string` at emit time. Enum choices
					// apply only to scalar values.
					type: argType,
					...(choices ? { choices } : {}),
					...(cliDefault !== undefined ? { default: cliDefault } : {}),
					required: effectiveRequired,
					positional: false,
					origin: { kind: "body", apiFieldPath: bp.apiFieldPath },
					description,
					fromFile,
					...(bp.conflicts ? { conflicts: bp.conflicts } : {}),
					...(bp.implies ? { implies: bp.implies } : {}),
					...(bp.sensitive === true ? { secret: true } : {}),
				},
				isWorkersCommand
			)
		);
	}
}
