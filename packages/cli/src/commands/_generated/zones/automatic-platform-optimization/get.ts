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
	describe: "Get Automatic Platform Optimization setting",
	usage:
		"$0 zones automatic-platform-optimization get\n\nAutomatic Platform Optimization (APO) for WordPress is a performance feature that serves your WordPress site from Cloudflare's edge network, reducing load times for visitors. Refer to the APO documentation for more information.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
