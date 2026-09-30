/**
 * Emit the yargs builder body — positionals, options, --dry-run,
 * --force, --body, --text, --file, multipart flags, conflicts /
 * implies, and the optional-parent `.check()`.
 *
 * Pure formatter over a pre-derived `DerivedArgs`. Every line it
 * writes is paired with a runtime read in the handler emitter (e.g.
 * a `--body` option here is consumed by the body-bypass block over
 * there); sharing `derived` across the trio is what guarantees they
 * don't drift.
 */
import { BODY_OPTIONS, toKebabCase } from "@cloudflare/forge";
import { someArgHasKebab } from "../codegen/name-predicates.js";
import { argScalarType } from "../intermediate-representation.js";
import { sensitiveBodyPaths } from "../sensitive-body.js";
import { escapeForSingleQuote } from "../util.js";
import type { DerivedArgs } from "../arg-derivation.js";
import type { OutputKind } from "../codegen/output-kind.js";
import type { ArgIR } from "../intermediate-representation.js";
import type { OperationInfo, Schema } from "@cloudflare/forge";

export function generateBuilderLines(
	method: Schema.method,
	resourceName: string,
	opInfo: OperationInfo,
	outputKind: OutputKind,
	derived: DerivedArgs
): string[] {
	const { args, optionalParentGroups, hasBody, multipartFlagFields } = derived;
	const positional = args.filter((a) => a.positional);
	const options = args.filter((a) => !a.positional);

	// Flags caught up in a oneOf `.conflicts()` relationship must NOT
	// carry a yargs `default`. yargs applies defaults *before* it runs
	// the conflicts check, so a defaulted flag is always seen as
	// "present" — and would spuriously collide with its mutually-
	// exclusive siblings (e.g. `cf ai run … --text foo` tripping over
	// `guidance`'s 7.5 default → "Arguments text and guidance are
	// mutually exclusive"). The API applies these spec defaults
	// server-side anyway, so omitting them from the request body is the
	// correct behaviour. Mirrors the same defaults-defeat-detection
	// caveat the optional-parent `.check()` emission calls out below.
	// Forge's conflicts/implies already carry emitted flag names.
	const conflictFlagKebabs = new Set<string>();
	for (const a of args) {
		if (a.conflicts && a.conflicts.length > 0) {
			conflictFlagKebabs.add(toKebabCase(a.name));
			for (const f of a.conflicts) conflictFlagKebabs.add(toKebabCase(f));
		}
	}

	const builderLines: string[] = [];

	for (const arg of positional) {
		// Register positionals under kebab — the handler reads them back
		// via the same kebab key (`argv["foo-bar"]`).
		builderLines.push(`      .positional('${toKebabCase(arg.name)}', {`);
		builderLines.push(`        type: '${argScalarType(arg)}',`);
		if (arg.type === "array") {
			builderLines.push(`        array: true,`);
		}
		const baseDesc = escapeForSingleQuote(arg.description);
		const desc = arg.isZone ? `${baseDesc} (or use --zone flag)` : baseDesc;
		builderLines.push(`        description: '${desc}',`);
		// Zone and worker-name args are never demandOption.
		if (arg.required && !arg.isZone && !arg.isWorkerName) {
			builderLines.push(`        demandOption: true,`);
		}
		builderLines.push(`      })`);
	}

	for (const arg of options) {
		// Use kebab-case for yargs CLI option names.
		const optName = toKebabCase(arg.name);
		const isScalarArrayBodyParam = arg.type === "array";
		const isArrayBodyParam =
			isScalarArrayBodyParam || arg.type === "object-array";

		// Body-param flags whose --body short-circuit is also accepted stay
		// soft-required: the handler will accept either `--body @file`
		// (containing the required field) or the individual flag. The
		// body-assembly path enforces presence at handler time; yargs
		// `demandOption: true` would preempt that and reject `--body @file`.
		const skipDemandOption = arg.origin.kind === "body" && hasBody;
		// On PATCH/PUT, attaching a yargs default to a body field makes
		// the handler's `if (argv.x !== undefined)` guard always true, so
		// the spec's create-time default gets forced into a partial update
		// and clobbers the resource's current value. Suppress body-param
		// defaults for partial updates; the API applies them server-side.
		const isPartialUpdate =
			opInfo.method === "patch" || opInfo.method === "put";
		const isDiscriminatorField =
			opInfo.bodyDiscriminator &&
			arg.origin.kind === "body" &&
			arg.origin.apiFieldPath.length === 1 &&
			arg.origin.apiFieldPath[0] === opInfo.bodyDiscriminator.field;
		const suppressDefault =
			isArrayBodyParam ||
			conflictFlagKebabs.has(optName) ||
			(arg.origin.kind === "body" && isPartialUpdate && !isDiscriminatorField);
		builderLines.push(
			`.option('${optName}', ${JSON.stringify({
				type: isArrayBodyParam ? "string" : argScalarType(arg),
				// Scalar arrays use repeated flag occurrences. Object arrays stay
				// one string so the handler can parse a complete JSON array.
				array: isScalarArrayBodyParam ? true : undefined,
				// --worker keeps --script-name as an alias.
				alias: arg.isWorkerName ? "script-name" : undefined,
				description: arg.description,
				choices: arg.choices ?? undefined,
				// Emit the spec default whenever one exists — even for
				// `required` fields (a required field with a server default
				// stays convenient: the user can omit it and the default
				// fills in, rather than being forced to prompt).
				default: suppressDefault ? undefined : (arg.default ?? undefined),
				demandOption:
					arg.required && !arg.isZone && !arg.isWorkerName && !skipDemandOption
						? true
						: undefined,
			})})`
		);
	}

	// --dry-run: every command, even pure GETs.
	builderLines.push(
		`.option("dry-run", ${JSON.stringify({
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})})`
	);
	if (sensitiveBodyPaths(opInfo).length > 0) {
		builderLines.push(
			`.option("show-secrets", ${JSON.stringify({
				type: "boolean",
				description: "Show sensitive values in dry-run output",
				default: false,
			})})`
		);
	}

	// --force on destructive ops (HTTP DELETE or `x-forge-require-confirmation`).
	{
		const isDelete = opInfo.method === "delete" || method.requireConfirmation;
		// Some API endpoints declare their own --force flag — a schema
		// messiness; warn and keep the user's existing flag.
		const hasExistingForceFlag =
			options.some((o) => o.name === "force") ||
			positional.some((p) => p.name === "force");
		if (hasExistingForceFlag) {
			console.warn(
				`[cf-generator] --force flag already declared by API: ${opInfo.path}`
			);
		}
		if (isDelete && !hasExistingForceFlag) {
			builderLines.push(
				`.option("force", ${JSON.stringify({
					type: "boolean",
					alias: "f",
					description: "Skip confirmation (useful in scripts and CI)",
					default: false,
				})})`
			);
		}
	}

	// --body (preferred op-specific description from the OpenAPI doc;
	// falls back to the generic BODY_OPTIONS text).
	if (hasBody) {
		const bodyOpDesc = opInfo.requestBodyDescription;
		for (const opt of BODY_OPTIONS) {
			const desc =
				opt.name === "body" && bodyOpDesc ? bodyOpDesc : opt.description;
			builderLines.push(`      .option('${opt.name}', {`);
			builderLines.push(`        type: '${opt.type}',`);
			builderLines.push(
				`        description: '${escapeForSingleQuote(desc)}',`
			);
			builderLines.push(`      })`);
		}
	}

	if (outputKind === "binary") {
		builderLines.push(
			`.option("text", ${JSON.stringify({
				type: "boolean",
				description:
					"Decode the response body as UTF-8 text instead of writing raw bytes",
				default: false,
			})})`
		);
	}

	// `--file <path>` is effectively `--body @<path>` for non-JSON content.
	if (opInfo.requestContentTypes.some((ct) => ct !== "application/json")) {
		builderLines.push(
			`.option("file", ${JSON.stringify({
				type: "string",
				description: "Path to a file to upload as the request body",
			})})`
		);
	}

	// Multipart-schema flags (--metadata, --creator, --id, etc.).
	for (const f of multipartFlagFields) {
		const kebab = toKebabCase(f.name);
		const alreadyDeclared =
			someArgHasKebab(options, kebab) || someArgHasKebab(positional, kebab);
		if (alreadyDeclared) continue;
		const yargsType =
			f.type === "number"
				? "number"
				: f.type === "boolean"
					? "boolean"
					: "string";
		builderLines.push(`      .option('${kebab}', {`);
		builderLines.push(`        type: '${yargsType}',`);
		builderLines.push(
			`        description: '${escapeForSingleQuote(f.description)}',`
		);
		builderLines.push(`      })`);
	}

	// Conflicts / implies from oneOf body-param variants. Names emitted
	// here MUST match the yargs `.option('<name>', …)` calls above —
	// always kebab-case.
	for (const arg of args) {
		if (arg.origin.kind !== "body" || arg.positional) continue;
		const selfFlag = toKebabCase(arg.name);
		if (arg.conflicts && arg.conflicts.length > 0) {
			const conflictKebab = arg.conflicts.map((c) => toKebabCase(c));
			builderLines.push(
				`      .conflicts('${selfFlag}', [${conflictKebab.map((c) => `'${c}'`).join(", ")}])`
			);
		}
		if (arg.implies && arg.implies.length > 0) {
			const implyKebab = arg.implies.map((c) => toKebabCase(c));
			builderLines.push(
				`      .implies('${selfFlag}', [${implyKebab.map((c) => `'${c}'`).join(", ")}])`
			);
		}
	}

	// Lookup from emitted (kebab) option name → its conflict set. Used to
	// make the group-implies `.check()` discriminator-aware for `oneOf`
	// parents (see below).
	const conflictsByFlag = new Map<string, string[]>();
	for (const a of args) {
		if (a.origin.kind !== "body" || a.positional) continue;
		if (a.conflicts && a.conflicts.length > 0) {
			conflictsByFlag.set(
				toKebabCase(a.name),
				a.conflicts.map((c) => toKebabCase(c))
			);
		}
	}

	// Group-implies-required-leaf .check(): when any --<parent>-* flag
	// is set, the required leaves under that parent must also be set.
	// See `cf/test_bugs/body-params-required-within-optional-parent.md`.
	//
	// Discriminator-aware refinement for `oneOf` parents: a parent that
	// is a discriminated/`oneOf` object surfaces a single flattened set
	// of leaves spanning every variant, and forge marks each variant's
	// required leaves with `required: true`. Statically demanding *all*
	// of them (the original behaviour) is wrong — it forces the first
	// variant's required leaves even when the user is supplying a
	// different variant's fields (e.g. pipelines `sinks create`
	// `--config-namespace …` for an `r2_data_catalog` sink tripped the
	// check demanding the R2-credentials leaves). The `oneOf`-derived
	// `conflicts` metadata partitions the variant-unique leaves, so a
	// required leaf that conflicts with a flag the user actually set
	// belongs to a *different* variant and must not be demanded. This is
	// generic (keyed only on `oneOf`/conflict metadata) and a pure
	// relaxation — it never rejects a previously-accepted invocation.
	// See `cf/test_bugs/pipelines-sink-config-oneof-wrong-variant.md`.
	for (const group of optionalParentGroups) {
		// Skip groups whose detectable-set flags list is empty (every
		// sibling carries a spec default, so we can't distinguish
		// "user set it" from "default applied").
		if (group.groupSetFlags.length === 0) continue;
		const groupSetFlagsArr = `[${group.groupSetFlags.map((f) => `'${f}'`).join(", ")}]`;
		const requiredFlagsArr = `[${group.requiredFlags.map((f) => `'${f}'`).join(", ")}]`;
		// Per-required-leaf conflict map, restricted to required leaves
		// that actually carry conflicts (i.e. live in a variant-unique
		// partition of a `oneOf`). When empty, the parent isn't a
		// discriminated `oneOf` (or its required leaves are all shared
		// across variants) and we emit the original unconditional check.
		const requiredConflictPairs = group.requiredFlags
			.map((f): [string, string[]] => [f, conflictsByFlag.get(f) ?? []])
			.filter(([, c]) => c.length > 0);
		builderLines.push(`      .check((argv) => {`);
		builderLines.push(
			`        const groupSet = ${groupSetFlagsArr}.some((k) => argv[k] !== undefined);`
		);
		builderLines.push(`        if (groupSet) {`);
		if (requiredConflictPairs.length > 0) {
			const conflictMapLiteral = `{ ${requiredConflictPairs
				.map(([f, c]) => `'${f}': [${c.map((x) => `'${x}'`).join(", ")}]`)
				.join(", ")} }`;
			builderLines.push(
				`          const requiredConflicts: Record<string, string[]> = ${conflictMapLiteral};`
			);
			// A required leaf in conflict with a flag the user set belongs
			// to a different `oneOf` variant, so it must not be demanded.
			builderLines.push(
				`          const missing = ${requiredFlagsArr}.filter((k) => argv[k] === undefined && !(requiredConflicts[k] ?? []).some((x) => argv[x] !== undefined));`
			);
		} else {
			builderLines.push(
				`          const missing = ${requiredFlagsArr}.filter((k) => argv[k] === undefined);`
			);
		}
		builderLines.push(`          if (missing.length > 0) {`);
		builderLines.push(
			`            throw new Error(\`\${missing.map((m) => '--' + m).join(', ')} \${missing.length === 1 ? 'is' : 'are'} required when any --${group.parentName}-* flag is set\`);`
		);
		builderLines.push(`          }`);
		builderLines.push(`        }`);
		builderLines.push(`        return true;`);
		builderLines.push(`      })`);
	}

	return builderLines;
}
