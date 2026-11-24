/**
 * list command
 * @generated from apis/overlays/scim.ts
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
	command: "list",
	describe: "List SCIM Resource Types",
	usage:
		"$0 scim resource-types list\n\nReturns the list of SCIM resource types supported by the Cloudflare SCIM service (RFC 7643 Section 6, RFC 7644 Section 4). Clients use this to discover available resource categories (e.g. Users, Groups) and their associated schemas. Query parameters are not supported on this endpoint.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
