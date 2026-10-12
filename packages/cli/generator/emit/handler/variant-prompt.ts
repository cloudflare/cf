/**
 * Pre-compute the discriminated-oneOf variant-prompt block.
 *
 * When the request body has a discriminator field, each variant's
 * required-but-unset string fields should be prompted for at handler
 * time. Other field types cannot be represented by
 * `promptForRequiredField`, which returns a string, so they get the same
 * explicit required-field error as non-variant body fields. This emitter
 * walks `opInfo.bodyDiscriminator` and emits one conditional per
 * variant/flag pair.
 *
 * Lives separately from the body-prompts emitter because:
 *   - The block needs to splice into the handler AFTER the body-param
 *     required-field prompts (the discriminator is itself a required
 *     body param, so it has to be set first).
 *   - The import-set decision for `promptForRequiredField` depends on
 *     whether a string prompt was emitted, so the orchestrator computes
 *     this once at the top and propagates the result.
 */
import { argvKey } from "../../codegen/identifiers.js";
import { escapeForSingleQuote } from "../../util.js";
import type { ArgIR } from "../../intermediate-representation.js";
import type { OperationInfo } from "@cloudflare/forge";

export interface VariantPromptBlock {
	lines: string[];
	needsTextPrompt: boolean;
}

export function computeVariantPromptBlock(
	opInfo: OperationInfo,
	bodyFields: readonly ArgIR[]
): VariantPromptBlock {
	const bodyDiscriminator = opInfo.bodyDiscriminator;
	if (!bodyDiscriminator) return { lines: [], needsTextPrompt: false };

	// Build apiField → kebab flag and kebab flag → description maps, plus
	// a kebab → arg lookup, from top-level body params. The discriminator
	// names API fields, while `arg.name` may carry an `x-fern-property-name`
	// rename.
	const apiToFlag = new Map<string, string>();
	const availableApiFields = new Set<string>();
	const flagToDescription = new Map<string, string>();
	const byKebab = new Map<string, ArgIR>();
	for (const a of bodyFields) {
		byKebab.set(a.name, a);
		if (a.origin.kind !== "body" || a.origin.apiFieldPath.length === 0)
			continue;
		const apiField = a.origin.apiFieldPath[0]!;
		availableApiFields.add(apiField);
		if (a.origin.apiFieldPath.length !== 1) continue;
		apiToFlag.set(apiField, a.name);
		if (a.description) flagToDescription.set(a.name, a.description);
	}

	const discFlag = apiToFlag.get(bodyDiscriminator.field);
	if (!discFlag) return { lines: [], needsTextPrompt: false };

	const discRead = argvKey(discFlag);
	const block: string[] = [];
	let needsTextPrompt = false;

	for (const [value, apiFields] of Object.entries(bodyDiscriminator.variants)) {
		const unavailable = apiFields.filter(
			(field) => !availableApiFields.has(field)
		);
		if (unavailable.length > 0) {
			block.push(
				`      if (${discRead} === '${escapeForSingleQuote(value)}') {`
			);
			block.push(
				`        throw new Error('The ${escapeForSingleQuote(value)} variant requires ${escapeForSingleQuote(unavailable.join(", "))}, which cannot be supplied as flags. Pass --body with a complete request body.');`
			);
			block.push(`      }`);
			continue;
		}
		const flags = apiFields
			.map((f) => apiToFlag.get(f))
			.filter((flag): flag is string => !!flag);
		if (flags.length === 0) continue;
		for (const flag of flags) {
			const flagRead = argvKey(flag);
			const arg = byKebab.get(flag);
			const desc = flagToDescription.get(flag) ?? `value for --${flag}`;
			const escDesc = escapeForSingleQuote(desc);
			block.push(
				`      if (${discRead} === '${escapeForSingleQuote(value)}' && ${flagRead} === undefined) {`
			);
			if (arg?.type !== "string" && arg?.type !== "enum") {
				block.push(
					`        throw new Error('--${flag} is required (or pass --body with this field set).');`
				);
				block.push(`      }`);
				continue;
			}

			needsTextPrompt = true;
			// Forge `BodyParamInfo.sensitive` opts into masked-prompt mode.
			const variantSecret = arg.secret === true;
			const variantPromptOpts = variantSecret
				? `{ kind: 'secret', question: 'Enter value for --${flag}' }`
				: `{ question: 'Enter value for --${flag}' }`;
			block.push(
				`        ${flagRead} = await promptForRequiredField('${flag}', '${escDesc}', ${variantPromptOpts});`
			);
			block.push(`      }`);
		}
	}

	return { lines: block, needsTextPrompt };
}
