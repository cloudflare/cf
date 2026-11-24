/**
 * link command
 * @generated from apis/overlays/alerting.ts
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
	operands: [
		{
			placeholder: "token-id",
			brief: "The token integration key",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "link <token-id>",
	describe: "Connect PagerDuty",
	usage:
		"$0 alerting destinations pagerduty link <token-id>\n\nLinks PagerDuty with the account using the integration token.",
	...parameters,
	loader: () => import("./link.handler.js"),
});

export default command;
