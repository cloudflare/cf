/**
 * delete command
 * @generated from apis/overlays/zero-trust.ts
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
		{ placeholder: "location-id", brief: "Location ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <location-id>",
	describe: "Delete a Zero Trust Gateway location",
	usage:
		"$0 zero-trust gateway locations delete <location-id>\n\nDelete a configured Zero Trust Gateway location.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
