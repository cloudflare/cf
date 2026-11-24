/**
 * delete command
 * @generated from apis/overlays/iam.ts
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
		{
			placeholder: "oauth-client-id",
			brief: "The unique identifier for an OAuth client.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <oauth-client-id>",
	describe: "Delete OAuth Client",
	usage:
		"$0 iam oauth-clients delete <oauth-client-id>\n\nDelete an OAuth client.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
