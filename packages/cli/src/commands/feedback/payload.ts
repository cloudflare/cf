// Builds the feedback submission. The wire contract is defined by the feedback
// Worker (FeedbackSubmission); every field except the envelope is optional, and
// the Worker is lenient, so the CLI only shapes input and never second-guesses it.

export const SCHEMA_VERSION = 1;

/** Tier (b): attached by the CLI, gated by the telemetry setting. */
export interface ClientContext {
	cli_version?: string;
	cli_mode?: "ci" | "interactive" | "non-interactive";
	cli_delegated?: boolean;
	package_manager?: string;
	os?: string;
	os_release?: string;
	arch?: string;
	node_major?: number;
	is_ci?: boolean;
	is_interactive?: boolean;
	telemetry_enabled?: boolean;
	agent_detected?: string;
	agent_model_detected?: string;
}

export interface Submission {
	schema_version: typeof SCHEMA_VERSION;
	submission_id: string;
	sent_at: string;
	message?: string;
	fields?: Record<string, string>;
	client?: ClientContext;
	agent?: Record<string, unknown>;
	[key: string]: unknown;
}

/** --field keys that have their own slot; everything else goes into `fields`. */
const ROUTED = [
	"type",
	"product",
	"command",
	"task",
	"attempted",
	"expected",
	"actual",
	"impact",
	"suggestion",
	"rating",
	"sentiment",
] as const;

/** Text that counts as something to say. Classification fields do not count on their own. */
const SUBSTANCE = [
	"message",
	"task",
	"attempted",
	"expected",
	"actual",
	"suggestion",
] as const;

/** Set by the CLI only; an agent report cannot override them. */
const CLI_OWNED = new Set([
	"schema_version",
	"submission_id",
	"sent_at",
	"client",
]);

const EMPTY_SUBMISSION =
	"Provide a note, a --field such as expected=…, or --input-json. Run `cf feedback --help` for the fields.";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

const hasText = (value: unknown) =>
	typeof value === "string" && value.trim().length > 0;

/** `--field Repro-Steps=a=b` → { repro_steps: "a=b" }. Blank values are dropped; the last value wins. */
export function parseFieldArgs(
	args: readonly string[]
): Record<string, string> {
	const fields: Record<string, string> = {};
	for (const arg of args) {
		const at = arg.indexOf("=");
		const key = at === -1 ? "" : arg.slice(0, at).trim();
		if (!key) {
			throw new Error(`--field must be key=value (got "${arg}").`);
		}
		const value = arg.slice(at + 1);
		const normalised = key.toLowerCase().replaceAll("-", "_");
		if (value.trim()) {
			fields[normalised] = value;
		} else {
			delete fields[normalised];
		}
	}
	return fields;
}

export interface SubmissionInput {
	note?: string;
	fieldArgs: readonly string[];
	inputJson?: unknown;
	client?: ClientContext;
	submissionId: string;
	sentAt: string;
}

/**
 * Merges the note, the agent report and --field values, in that order of
 * increasing precedence. Returns the paths that --field overrode so the CLI
 * can mention them.
 */
export function buildSubmission(input: SubmissionInput): {
	submission: Submission;
	overridden: string[];
} {
	if (input.inputJson !== undefined && !isRecord(input.inputJson)) {
		throw new Error("--input-json must be a JSON object.");
	}
	const report = Object.fromEntries(
		Object.entries(input.inputJson ?? {}).filter(([key]) => !CLI_OWNED.has(key))
	);
	const reportFields = isRecord(report.fields)
		? (report.fields as Record<string, string>)
		: {};
	const reportAgent = isRecord(report.agent) ? report.agent : undefined;

	const fieldArgs = parseFieldArgs(input.fieldArgs);
	if (input.note !== undefined && fieldArgs.message !== undefined) {
		throw new Error(
			"Pass the message as the note or as --field message, not both."
		);
	}

	const top: Record<string, unknown> = { ...report };
	delete top.fields;
	delete top.agent;
	const fields: Record<string, string> = { ...reportFields };
	let agent = reportAgent ? { ...reportAgent } : undefined;
	const overridden: string[] = [];

	if (input.note !== undefined) {
		top.message = input.note;
	}
	for (const [key, value] of Object.entries(fieldArgs)) {
		if (key === "message" || (ROUTED as readonly string[]).includes(key)) {
			if (top[key] !== undefined && top[key] !== value) {
				overridden.push(key);
			}
			top[key] = value;
		} else if (key === "model") {
			if (agent?.model !== undefined && agent.model !== value) {
				overridden.push("agent.model");
			}
			agent = { ...agent, model: value };
		} else {
			if (fields[key] !== undefined && fields[key] !== value) {
				overridden.push(`fields.${key}`);
			}
			fields[key] = value;
		}
	}

	const submission: Submission = {
		schema_version: SCHEMA_VERSION,
		submission_id: input.submissionId,
		sent_at: input.sentAt,
		...top,
		...(Object.keys(fields).length > 0 ? { fields } : {}),
		...(agent ? { agent } : {}),
		...(input.client ? { client: input.client } : {}),
	};
	if (!hasSubstance(submission)) {
		throw new Error(EMPTY_SUBMISSION);
	}
	return { submission, overridden };
}

/** Mirrors the Worker's check, so an empty submission fails before the network. */
function hasSubstance(submission: Submission): boolean {
	const errors = isRecord(submission.agent)
		? submission.agent.errors
		: undefined;
	return (
		SUBSTANCE.some((key) => hasText(submission[key])) ||
		submission.rating !== undefined ||
		Object.values(submission.fields ?? {}).some(hasText) ||
		(Array.isArray(errors) && errors.length > 0)
	);
}
