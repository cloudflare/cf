/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
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
			placeholder: "proxy-endpoint-id",
			brief: "Proxy endpoint ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <proxy-endpoint-id>",
	describe: "Get a proxy endpoint",
	usage:
		"$0 zero-trust gateway proxy-endpoints get <proxy-endpoint-id>\n\nGet a single Zero Trust Gateway proxy endpoint.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
