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
		"sensitivity-group-id": {
			kind: "parsed",
			brief: "Sensitivity group ID",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "sensitivity-level-id",
			brief: "Sensitivity level ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <sensitivity-level-id>",
	describe: "Retrieve a specific sensitivity level.",
	usage:
		"$0 zero-trust dlp sensitivity-levels get <sensitivity-level-id>\n\nGets a sensitivity level from a group.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
