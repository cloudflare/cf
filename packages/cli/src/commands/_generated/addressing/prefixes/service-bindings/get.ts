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
		"prefix-id": {
			kind: "parsed",
			brief: "Identifier of an IP Prefix.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "binding-id",
			brief: "Identifier of a Service Binding.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <binding-id>",
	describe: "Get Service Binding",
	usage:
		"$0 addressing prefixes service-bindings get <binding-id>\n\nFetch a single Service Binding",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
