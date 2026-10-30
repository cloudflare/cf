import { getDefaultHeaders } from "../../lib/request-headers.js";
import type { Submission } from "./payload.js";

/** The demo feedback Worker. CF_FEEDBACK_URL overrides it, for example to point at `cf dev`. */
export const DEFAULT_FEEDBACK_URL =
	"https://cf-cli-feedback-staging.tk.workers.dev/v1/feedback";

/** The Worker refuses larger bodies with 413. */
export const MAX_BODY_BYTES = 262_144;

const ATTEMPTS = 3;
const ATTEMPT_TIMEOUT_MS = 10_000;
const BASE_DELAY_MS = 250;
const MAX_DELAY_MS = 2_000;

export interface Ignored {
	path: string;
	reason: string;
}

export interface FeedbackReceipt {
	status: "accepted";
	submission_id: string;
	notices?: string[];
	ignored?: Ignored[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isReceipt(value: unknown): value is FeedbackReceipt {
	return (
		isRecord(value) &&
		value.status === "accepted" &&
		typeof value.submission_id === "string" &&
		(value.notices === undefined || Array.isArray(value.notices)) &&
		(value.ignored === undefined || Array.isArray(value.ignored))
	);
}

/** CF_FEEDBACK_URL must be https, or http on a loopback host for local testing. */
export function feedbackUrl(
	environment: NodeJS.ProcessEnv = process.env
): string {
	const configured = environment.CF_FEEDBACK_URL?.trim();
	if (!configured) {
		return DEFAULT_FEEDBACK_URL;
	}
	let url: URL;
	try {
		url = new URL(configured);
	} catch {
		throw new Error("CF_FEEDBACK_URL must be a valid URL.");
	}
	const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
	if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) {
		throw new Error(
			"CF_FEEDBACK_URL must use https (http is allowed for localhost)."
		);
	}
	return url.href;
}

/** Schema paths from a 422 body, never values: the Worker only returns paths. */
function rejectionDetail(body: unknown): string {
	if (!isRecord(body) || typeof body.error !== "string") {
		return "";
	}
	const items = [
		...(Array.isArray(body.issues) ? body.issues : []),
		...(Array.isArray(body.ignored) ? body.ignored : []),
	];
	const paths = items
		.map((item) =>
			isRecord(item) && typeof item.path === "string" ? item.path : ""
		)
		.filter(Boolean);
	return ` (${body.error}${paths.length > 0 ? `: ${paths.join(", ")}` : ""})`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function retryDelay(attempt: number, retryAfter: string | null): number {
	const seconds = Number(retryAfter);
	const requested =
		Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0;
	return Math.min(
		Math.max(requested, BASE_DELAY_MS * 2 ** attempt),
		MAX_DELAY_MS
	);
}

/**
 * Sends the submission, retrying 429, 503 and network failures with the same
 * submission ID so the server can remove duplicates.
 */
export async function sendFeedback(
	url: string,
	submission: Submission
): Promise<FeedbackReceipt> {
	const body = JSON.stringify(submission);
	let lastFailure = "";
	let delay = 0;
	for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
		if (delay > 0) {
			await sleep(delay);
		}
		const signal = AbortSignal.timeout(ATTEMPT_TIMEOUT_MS);
		let response: Response;
		try {
			response = await fetch(url, {
				method: "POST",
				headers: {
					...getDefaultHeaders(),
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body,
				signal,
			});
		} catch {
			lastFailure = signal.aborted
				? "The feedback service timed out."
				: "Unable to reach the feedback service.";
			delay = retryDelay(attempt, null);
			continue;
		}

		if (response.status === 429 || response.status === 503) {
			lastFailure = `The feedback service is busy (HTTP ${response.status}).`;
			delay = retryDelay(attempt, response.headers.get("retry-after"));
			continue;
		}

		let data: unknown;
		try {
			data = await response.json();
		} catch {
			data = undefined;
		}
		if (!response.ok) {
			throw new Error(
				`The feedback service rejected the submission${rejectionDetail(data)}.`
			);
		}
		if (!isReceipt(data)) {
			throw new Error("The feedback service returned an unexpected response.");
		}
		return data;
	}
	throw new Error(
		`${lastFailure} It may have been received; try again later with the same note.`
	);
}
