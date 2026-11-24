/**
 * update command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"after-inactivity-seconds": {
			kind: "parsed",
			brief: "The afterInactivitySeconds field",
			optional: true,
			parse: Number,
		},
		"after-occurrences": {
			kind: "parsed",
			brief: "The afterOccurrences field",
			optional: true,
			parse: Number,
		},
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		"policy-id": {
			kind: "parsed",
			brief: "The policyId field",
			optional: true,
			parse: String,
		},
		service: {
			kind: "parsed",
			brief: "The service field",
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
		{ placeholder: "automation-id", brief: "AutomationId", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <automationId>",
	describe: "Update an issue automation",
	usage:
		"$0 o11y issues automations update <automationId>\n\nReplace an issue automation configuration.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
