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
	operands: [
		{
			placeholder: "origin-ip",
			brief: "Origin IP address to look up. IPv4 and IPv6 are supported.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <origin-ip>",
	describe: "Get an origin cloud region mapping",
	usage:
		"$0 cache origin-cloud-regions get <origin-ip>\n\nReturns the cloud region mapping for a single origin IP address. The IP path parameter is normalized before lookup (RFC 5952 for IPv6). Returns 404 if the zone has no mappings or if the specified IP has no mapping.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
