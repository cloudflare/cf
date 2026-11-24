/**
 * list command
 * @generated from apis/overlays/cache.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of items per page.",
			optional: true,
			parse: Number,
		},
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
	command: "list",
	describe: "List origin cloud region mappings",
	usage:
		"$0 cache origin-cloud-regions list\n\nReturns all IP-to-cloud-region mappings configured for the zone with pagination support. Each mapping tells Cloudflare which cloud vendor and region hosts the origin at that IP, enabling the edge to route via the nearest Tiered Cache upper-tier co-located with that cloud provider. Returns an empty array when no mappings exist.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
