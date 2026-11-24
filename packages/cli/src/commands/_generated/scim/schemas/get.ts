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
			placeholder: "schema-id",
			brief: "The schema URI identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <schema-id>",
	describe: "Get SCIM Schema",
	usage:
		"$0 scim schemas get <schema-id>\n\nReturns a single SCIM schema definition by schema URI ID (RFC 7643 Section 7). Valid IDs are `urn:ietf:params:scim:schemas:core:2.0:User` and `urn:ietf:params:scim:schemas:core:2.0:Group`.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
