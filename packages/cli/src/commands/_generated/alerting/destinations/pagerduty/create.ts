/**
 * create command
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
	command: "create",
	describe: "Create PagerDuty integration token",
	usage:
		"$0 alerting destinations pagerduty create\n\nCreates a new token for integrating with PagerDuty.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
