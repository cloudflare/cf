/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <proxy-endpoint-id>",
	describe: "Delete a proxy endpoint",
	usage:
		"$0 zero-trust gateway proxy-endpoints delete <proxy-endpoint-id>\n\nDelete a configured Zero Trust Gateway proxy endpoint.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
