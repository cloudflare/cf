/**
 * get command
 * @generated from apis/overlays/web-assets.ts
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
			placeholder: "discovery-id",
			brief: "Discovery ID of a discovered operation",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <discovery-id>",
	describe: "Get a discovered web or API operation",
	usage:
		"$0 web-assets discovery operations get <discovery-id>\n\nReturns a discovered web or API operation by discovery ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
