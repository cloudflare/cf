/**
 * get command
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "List PagerDuty services",
	usage:
		"$0 alerting destinations pagerduty get\n\nGet a list of all configured PagerDuty services.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
