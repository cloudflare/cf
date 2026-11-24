/**
 * get command
 * @generated from apis/overlays/addressing.ts
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
			placeholder: "prefix-id",
			brief: "Identifier of an IP Prefix.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <prefix-id>",
	describe: "Get Advertisement Status",
	usage:
		"$0 addressing prefixes advertisement-status get <prefix-id>\n\nView the current advertisement state for a prefix. **Deprecated:** Prefer the BGP Prefixes endpoints, which additionally allow for advertising and withdrawing subnets of an IP prefix.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
