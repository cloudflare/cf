/**
 * get command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Get CT Alerting Subscription",
	usage:
		"$0 ssl ct-alerting get\n\nRetrieve the Certificate Transparency alerting subscription settings for a zone. Returns whether CT monitoring is enabled and the list of email addresses that receive alerts, if any have been configured.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
