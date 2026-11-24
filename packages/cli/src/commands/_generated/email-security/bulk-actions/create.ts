/**
 * create command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		action: {
			kind: "parsed",
			brief:
				"The action the job performs on every message matching the search parameters.",
			optional: true,
			choices: ["MOVE", "RELEASE"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
		},
		comment: {
			kind: "parsed",
			brief: "Optional note describing the job.",
			optional: true,
			parse: String,
		},
		destination: {
			kind: "parsed",
			brief: "Required when action is 'MOVE'.",
			optional: true,
			choices: [
				"Inbox",
				"JunkEmail",
				"DeletedItems",
				"RecoverableItemsDeletions",
				"RecoverableItemsPurges",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "destination", "text"),
		},
		"expected-disposition": {
			kind: "parsed",
			brief: "Nonfunctional field. End of life: December 1, 2026.",
			optional: true,
			choices: [
				"MALICIOUS",
				"MALICIOUS-BEC",
				"SUSPICIOUS",
				"SPOOF",
				"SPAM",
				"BULK",
				"ENCRYPTED",
				"EXTERNAL",
				"UNKNOWN",
				"NONE",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "expected-disposition", "text"),
		},
		"search-params-action-log": {
			kind: "boolean",
			brief:
				"Deprecated, use `GET /investigate/{investigate_id}/action_log` instead. End of life: November 1, 2026.",
			default: false,
		},
		"search-params-alert-id": {
			kind: "parsed",
			brief: "Alert ID of the detection to filter by.",
			optional: true,
			parse: String,
		},
		"search-params-delivery-status": {
			kind: "parsed",
			brief: "Delivery status to filter by.",
			optional: true,
			choices: [
				"delivered",
				"moved",
				"quarantined",
				"rejected",
				"deferred",
				"bounced",
				"queued",
				"move_failed",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "search-params-delivery-status", "text"),
		},
		"search-params-detections-only": {
			kind: "boolean",
			brief: "Whether to include only detections in search results.",
			default: true,
		},
		"search-params-domain": {
			kind: "parsed",
			brief:
				"Match messages that mention this domain — sender domain, recipient domain, or a domain in a link.",
			optional: true,
			parse: String,
		},
		"search-params-end": {
			kind: "parsed",
			brief: "End of search date range.",
			optional: true,
			parse: String,
		},
		"search-params-exact-subject": {
			kind: "parsed",
			brief: "Match messages whose subject line equals this value exactly.",
			optional: true,
			parse: String,
		},
		"search-params-final-disposition": {
			kind: "parsed",
			brief: "Dispositions to filter by.",
			optional: true,
			choices: [
				"MALICIOUS",
				"MALICIOUS-BEC",
				"SUSPICIOUS",
				"SPOOF",
				"SPAM",
				"BULK",
				"ENCRYPTED",
				"EXTERNAL",
				"UNKNOWN",
				"NONE",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "search-params-final-disposition", "text"),
		},
		"search-params-message-action": {
			kind: "parsed",
			brief: "Message actions to filter by.",
			optional: true,
			choices: ["PREVIEW", "QUARANTINE_RELEASED", "MOVED"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "search-params-message-action", "text"),
		},
		"search-params-message-id": {
			kind: "parsed",
			brief: "Message-ID header value to filter by.",
			optional: true,
			parse: String,
		},
		"search-params-metric": {
			kind: "parsed",
			brief: "Metric name to filter the search by.",
			optional: true,
			parse: String,
		},
		"search-params-query": {
			kind: "parsed",
			brief: "Space-delimited search term. Case-insensitive.",
			optional: true,
			parse: String,
		},
		"search-params-recipient": {
			kind: "parsed",
			brief: "Match messages whose recipient is this email address or domain.",
			optional: true,
			parse: String,
		},
		"search-params-sender": {
			kind: "parsed",
			brief: "Match messages whose sender is this email address or domain.",
			optional: true,
			parse: String,
		},
		"search-params-smtp-helo-ip": {
			kind: "parsed",
			brief:
				"Matches messages whose SMTP HELO server IP address equals this value.",
			optional: true,
			parse: String,
		},
		"search-params-start": {
			kind: "parsed",
			brief: "Beginning of search date range.",
			optional: true,
			parse: String,
		},
		"search-params-subject": {
			kind: "parsed",
			brief:
				"Match messages whose subject contains these keywords, in any order.",
			optional: true,
			parse: String,
		},
		"search-params-submissions": {
			kind: "boolean",
			brief:
				"Whether to search reclassification submissions instead of original messages.",
			default: false,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a bulk action job",
	usage:
		"$0 email-security bulk-actions create\n\nCreates a new bulk action job to move or release messages that match the provided search parameters. To move or release an explicit list of known messages instead of a search, use the move or release endpoints.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
