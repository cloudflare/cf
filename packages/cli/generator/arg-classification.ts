/**
 * cf-specific argument classification predicates.
 *
 * Mirrors forge's `isZoneArg` for other well-known "container" arg names
 * whose resolution story is UX-driven rather than spec-driven. Lives in cf
 * rather than forge because forge is spec-focused and doesn't know about
 * global CLI flags or runtime value resolution.
 */
import type { Schema } from "@cloudflare/forge";

/**
 * Names of the Worker name path param across the spellings the
 * generator sees. Worker names are containers (the script owns
 * secrets, schedules, deployments, etc.) — not the subject of the
 * command. Treating them as a container lets commands surface the
 * subject as the positional and route the worker name to `--worker`.
 *
 * Most callers normalize OpenAPI param names to kebab (via `toFlagName` /
 * `name.replace(/_/g, "-")`) before constructing the `Schema.arg`, but a
 * camelCase `{scriptName}` path template var survives `toFlagName`
 * untouched (it has no `_`/`.`), so the raw `scriptName` (and the
 * snake `script_name`) must be recognised too — otherwise it slips the
 * classifier and gets emitted as a positional/required flag even though
 * `build-context` already flagged `needsWorkerName` from the same var.
 *
 * `"worker"` is the canonical CLI flag name; the OpenAPI-derived
 * variants are recognised so the classifier catches them before
 * `derivePathParams` renames to `"worker"`.
 */
const WORKER_NAME_ARGS = new Set([
	"worker",
	"script-name",
	"scriptName",
	"script_name",
]);

/**
 * Returns true if the argument represents a Worker name.
 * Worker name args get special resolution logic in generated commands
 * (resolved via getWorkerName, optional positional rendering, etc.).
 */
export function isWorkerNameArg(arg: Schema.arg): boolean {
	return WORKER_NAME_ARGS.has(arg.name);
}

/**
 * Worker-name treatment is scoped to `cf workers *` only. Returns a
 * predicate closure for the current resource — pass through and reuse
 * everywhere the question "is this arg the worker name?" comes up.
 */
export function makeShouldTreatAsWorkerName(
	resourceName: string
): (arg: Schema.arg) => boolean {
	const isWorkersCommand = resourceName === "workers";
	return (arg: Schema.arg): boolean => isWorkersCommand && isWorkerNameArg(arg);
}
