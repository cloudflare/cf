/**
 * get command
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
	operands: [
		{
			placeholder: "resource-type-id",
			brief: "The resource type identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <resource-type-id>",
	describe: "Get SCIM Resource Type",
	usage:
		"$0 scim resource-types get <resource-type-id>\n\nReturns a single SCIM resource type by ID (RFC 7643 Section 6). Valid IDs are `User` and `Group`.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
