/**
 * get command
 * @generated from apis/overlays/o11y.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "View zone tracing settings",
	usage:
		"$0 o11y tracing settings get\n\nRetrieve the zone-level Cloudflare Traces settings.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
