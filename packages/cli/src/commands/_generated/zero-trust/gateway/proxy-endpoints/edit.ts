/**
 * edit command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		ips: {
			kind: "parsed",
			brief: "Specify the list of CIDRs to restrict ingress connections.",
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Specify the name of the proxy endpoint.",
			optional: true,
			parse: String,
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
			placeholder: "proxy-endpoint-id",
			brief: "Proxy endpoint ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <proxy-endpoint-id>",
	describe: "Update a proxy endpoint",
	usage:
		"$0 zero-trust gateway proxy-endpoints edit <proxy-endpoint-id>\n\nUpdate a configured Zero Trust Gateway proxy endpoint.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
