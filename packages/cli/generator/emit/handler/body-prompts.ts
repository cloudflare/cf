/**
 * Emit the required-body-field prompts.
 *
 * Yargs-level `demandOption: true` is suppressed for body-param flags
 * when `--body` is also supported (so `--body @file` works even though
 * `--keys` is "required"). Re-enforce at handler time AFTER the
 * `--body` short-circuit, so callers can escape over-strict
 * required-field declarations by passing `--body @file.json`.
 *
 * When `--body` is not passed: in TTY, prompt; in CI, throw.
 *
 * Also splices in the discriminated-oneOf variant-prompt block
 * (pre-computed at the top of `generateCommandFile`).
 */
import { argvKey } from "../../codegen/identifiers.js";
import { bodyOptionArgs } from "../../intermediate-representation.js";
import { escapeForSingleQuote } from "../../util.js";
import type { EmitContext } from "../context.js";

export function emitBodyPrompts(ctx: EmitContext): string[] {
	const { derived, variantPromptBlock } = ctx;
	const lines: string[] = [];

	if (derived.hasBodyParams) {
		for (const arg of bodyOptionArgs(derived.args)) {
			if (!arg.required) continue;
			const escDesc = escapeForSingleQuote(arg.description);
			const read = argvKey(arg.name);
			lines.push(`      if (${read} === undefined) {`);
			if (arg.choices && arg.choices.length > 0) {
				const choicesArr = `[${arg.choices.map((c) => `'${escapeForSingleQuote(c)}'`).join(", ")}] as const`;
				lines.push(
					`        ${read} = await promptForRequiredEnumField('${arg.name}', '${escDesc}', ${choicesArr});`
				);
			} else if (arg.type === "string") {
				// Forge `BodyParamInfo.sensitive` opts into masked-prompt
				// mode (clack.password).
				const promptOpts = arg.secret === true ? `, { kind: 'secret' }` : "";
				lines.push(
					`        ${read} = await promptForRequiredField('${arg.name}', '${escDesc}'${promptOpts});`
				);
			} else {
				// Boolean / number / array / object — no clean prompt; throw.
				lines.push(
					`        throw new Error('--${arg.name} is required (or pass --body with this field set).');`
				);
			}
			lines.push(`      }`);
		}
	}

	// Variant-required prompt block (AFTER required-field prompts so the
	// discriminator is already set).
	if (variantPromptBlock.length > 0) {
		lines.push("");
		for (const line of variantPromptBlock) lines.push(line);
	}

	return lines;
}
