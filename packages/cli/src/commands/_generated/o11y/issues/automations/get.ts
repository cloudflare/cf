/**
 * get command
 * @generated from apis/overlays/o11y.ts
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
		{ placeholder: "automation-id", brief: "AutomationId", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <automationId>",
	describe: "Get an issue automation",
	usage:
		"$0 o11y issues automations get <automationId>\n\nRetrieve an issue automation.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
