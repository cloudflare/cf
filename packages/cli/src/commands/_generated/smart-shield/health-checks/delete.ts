/**
 * delete command
 * @generated from apis/overlays/smart-shield.ts
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
		{ placeholder: "healthcheck-id", brief: "Identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <healthcheck-id>",
	describe: "Delete Health Check",
	usage:
		"$0 smart-shield health-checks delete <healthcheck-id>\n\nDelete a health check.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
