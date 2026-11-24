/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <key-id>",
	describe: "Delete TURN key",
	usage:
		"$0 realtime turn keys delete <key-id>\n\nDeletes a Realtime TURN key.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
