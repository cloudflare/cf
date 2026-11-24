/**
 * unsubscribe command
 * @generated from apis/overlays/alerting.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		email: { kind: "parsed", brief: "Email", parse: String },
		token: { kind: "parsed", brief: "Token", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "policy-id",
			brief: "The unique identifier of a notification policy",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "unsubscribe <policy-id>",
	describe: "Unsubscribe email from a Notification policy",
	usage:
		"$0 alerting policies email unsubscribe <policy-id>\n\nUnsubscribes an email address from a notification policy.",
	...parameters,
	loader: () => import("./unsubscribe.handler.js"),
});

export default command;
