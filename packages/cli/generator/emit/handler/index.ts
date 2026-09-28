/**
 * Compose the per-command handler body from its sub-emitters.
 */
import { emitAuth } from "./auth.js";
import { emitBodyBypass } from "./body-bypass.js";
import { emitBodyPrompts } from "./body-prompts.js";
import { emitDeleteConfirm } from "./delete-confirm.js";
import { emitDryRun } from "./dry-run.js";
import { emitFileUpload } from "./file-upload.js";
import { emitMultipart } from "./multipart.js";
import { emitPrelude } from "./prelude.js";
import { emitSdkCall } from "./sdk-call.js";
import type { EmitContext } from "../context.js";

export function emitHandler(ctx: EmitContext): string[] {
	const lines: string[] = [];
	// Validation
	lines.push(...emitPrelude(ctx));
	// Logic for --dry-run
	lines.push(...emitDryRun(ctx));

	lines.push(...emitAuth(ctx));
	if (ctx.isDelete) lines.push(...emitDeleteConfirm(ctx));
	lines.push(...emitMultipart(ctx));
	lines.push(...emitFileUpload(ctx));
	lines.push(...emitBodyBypass(ctx));
	lines.push(...emitBodyPrompts(ctx));
	// Terminal SDK call — body-assembly shape when the op has per-field
	// body flags, fallback sdk-call shape otherwise (mutually exclusive).
	lines.push(...emitSdkCall(ctx));
	return lines;
}
