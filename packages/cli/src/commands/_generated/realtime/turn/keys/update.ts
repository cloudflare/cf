/**
 * update command
 * @generated from apis/overlays/realtime.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief: "A short description of a TURN key, not shown to end users.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
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
	command: "update <key-id>",
	describe: "Update TURN key details",
	usage:
		"$0 realtime turn keys update <key-id>\n\nUpdates details for a single TURN key.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
