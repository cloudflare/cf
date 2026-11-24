/**
 * get command
 * @generated from apis/overlays/cache.ts
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
	describe: "Get Regional Tiered Cache setting",
	usage:
		"$0 cache settings regional-tiered-cache get\n\nInstructs Cloudflare to check a regional hub data center on the way to your upper tier. This can help improve performance for smart and custom tiered cache topologies.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
