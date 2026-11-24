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
	describe: "Get HTTP/2 Prioritization setting",
	usage:
		"$0 zones h2-prioritization get\n\nHTTP/2 Prioritization controls the order in which assets are delivered to browsers. Cloudflare's HTTP/2 Prioritization overrides the default browser prioritization order, improving the loading performance of web pages.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
