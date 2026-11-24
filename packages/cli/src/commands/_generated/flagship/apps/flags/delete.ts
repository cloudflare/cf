/**
 * delete command
 * @generated from apis/overlays/flagship.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "Flagship app ID returned when the app was created.",
			parse: String,
		},
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
		{
			placeholder: "flag-key",
			brief: "Case-sensitive key identifying the flag within the app.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <flag-key>",
	describe: "Delete flag",
	usage:
		"$0 flagship apps flags delete <flag-key>\n\nDeletes a flag permanently. After deletion propagates, direct evaluations return not found; typed binding accessors may return the caller-supplied default. Cannot be undone.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
