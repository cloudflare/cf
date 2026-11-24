/**
 * get command
 * @generated from apis/overlays/zones.ts
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
	describe: "Get Cloudflare Speed Brain setting",
	usage:
		"$0 zones speed-brain get\n\nSpeed Brain lets compatible browsers speculate on content which can be prefetched or preloaded, making website navigation faster. Refer to the Cloudflare Speed Brain documentation for more information.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
