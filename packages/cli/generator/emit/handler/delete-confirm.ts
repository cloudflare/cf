/**
 * Emit the delete-confirmation block.
 *
 * Triggers when the op is HTTP DELETE or carries forge's
 * `x-forge-require-confirmation` annotation (KV `/bulk/delete`, queue
 * `/purge`, etc.). Bypassed by `--force` or non-interactive contexts
 * (where `--force` is documented as the only opt-out).
 *
 * `--quiet` is intentionally NOT threaded into `confirmDelete`. It
 * suppresses non-essential output, but does not (and must not)
 * auto-confirm destructive operations. See `confirmDelete` in
 * `src/lib/prompt.ts`.
 */
import { escapeForTemplateLiteral } from "../../util.js";
import type { EmitContext } from "../context.js";

export function emitDeleteConfirm(ctx: EmitContext): string[] {
	const { requireConfirmationMessage } = ctx;

	// `x-forge-require-confirmation` supplies a descriptive sentence
	// surfaced verbatim in the prompt. Without it, `confirmDelete` falls
	// back to a generic warning — no per-op noun is rendered.
	const messageOpt =
		requireConfirmationMessage !== undefined
			? `message: \`${escapeForTemplateLiteral(requireConfirmationMessage)}\``
			: "";
	const opts = messageOpt
		? `{ force: Boolean(argv.force), ${messageOpt} }`
		: `{ force: Boolean(argv.force) }`;

	return [
		``,
		`      if (!(await confirmDelete(${opts}))) {`,
		`        process.stderr.write('Aborted.\\n');`,
		`        return;`,
		`      }`,
	];
}
