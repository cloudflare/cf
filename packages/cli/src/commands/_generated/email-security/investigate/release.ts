/**
 * release command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		ids: {
			kind: "parsed",
			brief: "Investigate IDs of the messages to release.",
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
			brief: "The messages to release, identified by their investigate IDs.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "release",
	describe: "Release messages from quarantine",
	usage:
		"$0 email-security investigate release\n\nDelivers one or more quarantined messages to their intended recipients, for cases where a message was incorrectly quarantined. Operates on an explicit list of messages; to release all messages matching a search, create a bulk action job instead. The response includes delivery status for each recipient.",
	...parameters,
	loader: () => import("./release.handler.js"),
});

export default command;
