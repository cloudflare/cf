/**
 * edit command
 * @generated from apis/overlays/addressing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		advertised: {
			kind: "boolean",
			brief:
				"Advertisement status of the prefix. If `true`, the BGP route for the prefix is advertised to the Internet. If \n`false`, the BGP route is withdrawn.\n",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "prefix-id",
			brief: "Identifier of an IP Prefix.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <prefix-id>",
	describe: "Update Prefix Dynamic Advertisement Status",
	usage:
		"$0 addressing prefixes advertisement-status edit <prefix-id>\n\nAdvertise or withdraw the BGP route for a prefix. **Deprecated:** Prefer the BGP Prefixes endpoints, which additionally allow for advertising and withdrawing subnets of an IP prefix.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
