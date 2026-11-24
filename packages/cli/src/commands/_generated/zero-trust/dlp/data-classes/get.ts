/**
 * get command
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
	},
	operands: [
		{ placeholder: "data-class-id", brief: "Data class ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <data-class-id>",
	describe: "Retrieve a specific data class",
	usage:
		"$0 zero-trust dlp data-classes get <data-class-id>\n\nGets the configuration for a data class.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
