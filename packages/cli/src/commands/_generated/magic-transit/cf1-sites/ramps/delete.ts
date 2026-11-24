/**
 * delete command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"cf1-site-id": { kind: "parsed", brief: "Identifier", parse: String },
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
	operands: [{ placeholder: "ramp-id", brief: "Identifier", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <ramp-id>",
	describe: "Delete CF1 Site Ramp",
	usage:
		"$0 magic-transit cf1-sites ramps delete <ramp-id>\n\nDeletes a specific ramp from a CF1 Site.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
