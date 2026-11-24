/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
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
		{ placeholder: "project-type", brief: "RFI project type", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <project-type>",
	describe: "Get current user profile",
	usage:
		"$0 cloudforce-one requests user get <project-type>\n\nGet the current user's profile in a specific RFI project.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
