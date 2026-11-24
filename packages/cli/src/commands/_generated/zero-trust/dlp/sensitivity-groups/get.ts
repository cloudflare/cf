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
		{
			placeholder: "sensitivity-group-id",
			brief: "Sensitivity group ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <sensitivity-group-id>",
	describe: "Retrieve a specific sensitivity group.",
	usage:
		"$0 zero-trust dlp sensitivity-groups get <sensitivity-group-id>\n\nGets a sensitivity group and its levels.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
