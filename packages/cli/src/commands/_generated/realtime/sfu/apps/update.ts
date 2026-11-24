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
			brief:
				"A short description of a Realtime SFU app, not shown to end users.",
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
			placeholder: "app-id",
			brief: "A Cloudflare-generated unique identifier for a item.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <app-id>",
	describe: "Update SFU app details",
	usage:
		"$0 realtime sfu apps update <app-id>\n\nUpdates details for a single Realtime SFU app.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
