/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{ placeholder: "automation-id", brief: "AutomationId", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <automationId>",
	describe: "Delete an issue automation",
	usage:
		"$0 o11y issues automations delete <automationId>\n\nDelete an issue automation while preserving its historical runs.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
