/**
 * get command
 * @generated from apis/overlays/realtime.ts
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
			placeholder: "key-id",
			brief: "A Cloudflare-generated unique identifier for a item.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <key-id>",
	describe: "Retrieve TURN key details",
	usage:
		"$0 realtime turn keys get <key-id>\n\nFetches details for a single TURN key.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
