import { submitFeedback } from "../../lib/api-operations.js";
import { VERSION } from "../../version.js";
import type { Client } from "#api";
import type { Submission } from "./payload.js";
import { ApiError } from "#api";

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
		(value.notices === undefined ||
			(Array.isArray(value.notices) &&
				value.notices.every((notice) => typeof notice === "string"))) &&
		(value.ignored === undefined ||
			(Array.isArray(value.ignored) &&
				value.ignored.every(
					(item) =>
						isRecord(item) &&
						typeof item.path === "string" &&
						typeof item.reason === "string"
				)))
	);
}

/** The Worker refuses CLI versions it has blocked, for example after a bad release. */
function versionRefusal(body: unknown): string | undefined {
	if (!isRecord(body) || body.error !== "cli_version_unsupported") {
		return undefined;
	}
	const minimum =
		typeof body.minimum_version === "string" ? body.minimum_version : undefined;
	return `This version of cf (${VERSION}) can no longer send feedback. Upgrade cf${
		minimum ? ` to ${minimum} or later` : ""
	} and try again.`;
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

export async function sendFeedback(
	client: Client,
	submission: Submission
): Promise<FeedbackReceipt> {
	const receipt = await client
		.send(
			submitFeedback,
			{ body: submission },
			{
				headers: { Accept: "application/json" },
				timeoutInSeconds: 10,
				maxRetries: 2,
			}
		)
		.catch((error: unknown) => {
			if (error instanceof ApiError) {
				const refusal =
					error.statusCode === 403 ? versionRefusal(error.body) : undefined;
				if (refusal) {
					throw new Error(refusal, { cause: error });
				}
				const detail =
					error.statusCode === 422 ? rejectionDetail(error.body) : "";
				if (detail) {
					throw new Error(
						`The feedback service rejected the submission${detail}.`,
						{ cause: error }
					);
				}
				if (error.rawResponse?.status === 0) {
					throw new Error(
						"Unable to confirm that feedback was received. Try again later with the same note.",
						{ cause: error }
					);
				}
			}
			throw error;
		});
	if (!isReceipt(receipt)) {
		throw new Error("The feedback service returned an unexpected response.");
	}
	return receipt;
}
