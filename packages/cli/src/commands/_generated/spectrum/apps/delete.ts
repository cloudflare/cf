/**
 * delete command
 * @generated from apis/overlays/spectrum.ts
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
		{ placeholder: "app-id", brief: "App identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <app-id>",
	describe: "Delete Spectrum application",
	usage:
		"$0 spectrum apps delete <app-id>\n\nDeletes a previously existing application.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
