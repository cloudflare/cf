/**
 * move command
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
		destination: {
			kind: "parsed",
			brief: "The mailbox folder to move messages to.",
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
		ids: {
			kind: "parsed",
			brief: "List of message IDs to move.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"postfix-ids": {
			kind: "parsed",
			brief: "Deprecated, use `ids` instead. End of life: November 1, 2026.",
			variadic: true,
			optional: true,
			parse: String,
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
	command: "move",
	describe: "Move messages",
	usage:
		"$0 email-security investigate move\n\nMoves one or more messages to a specified mailbox folder (Inbox, JunkEmail, DeletedItems, RecoverableItemsDeletions, or RecoverableItemsPurges). Requires active integration. Operates on an explicit list of messages; to move all messages matching a search, create a bulk action job instead.",
	...parameters,
	loader: () => import("./move.handler.js"),
});

export default command;
