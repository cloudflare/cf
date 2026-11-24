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
			placeholder: "app-id",
			brief: "A Cloudflare-generated unique identifier for a item.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <app-id>",
	describe: "Retrieve SFU app details",
	usage:
		"$0 realtime sfu apps get <app-id>\n\nFetches details for a single Realtime SFU app.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
