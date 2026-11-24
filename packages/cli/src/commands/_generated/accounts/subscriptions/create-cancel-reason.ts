/**
 * create-cancel-reason command
 * @generated from apis/overlays/accounts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		other: {
			kind: "parsed",
			brief: "Additional cancellation details.",
			optional: true,
			parse: String,
		},
		"reason-code": {
			kind: "parsed",
			brief: "The cancellation reason codes.",
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
	operands: [
		{
			placeholder: "subscription-identifier",
			brief: "Subscription identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create-cancel-reason <subscription-identifier>",
	describe: "Create Cancel Reason",
	usage:
		"$0 accounts subscriptions create-cancel-reason <subscription-identifier>\n\nRecords a cancellation reason for an account subscription.",
	...parameters,
	loader: () => import("./create-cancel-reason.handler.js"),
});

export default command;
