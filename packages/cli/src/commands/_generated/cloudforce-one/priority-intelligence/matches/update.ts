/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		matches: {
			kind: "parsed",
			brief:
				'Up to 100 matches to set the triage state on. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"dataset_id": string, "event_id": string}].',
			optional: true,
			parse: String,
		},
		"triage-state": {
			kind: "parsed",
			brief: "The triage_state field",
			optional: true,
			choices: ["new", "relevant", "not_relevant"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "triage-state", "text"),
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
	operands: [
		{ placeholder: "priority-id", brief: "Priority ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <priority-id>",
	describe: "Triage a priority intelligence requirement's matched events",
	usage:
		"$0 cloudforce-one priority-intelligence matches update <priority-id>\n\nSets `triage_state` (`new`, `relevant`, or `not_relevant`) on up to 100 matches. Matches that do not exist, or are in datasets the account can no longer read, are returned in `not_found`. Setting `new` clears `triaged_at` and `triaged_by`. Requires the Threat Events entitlement.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
