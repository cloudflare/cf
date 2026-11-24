/**
 * list command
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List Prefix Delegations",
	usage:
		"$0 addressing prefixes delegations list\n\nList all delegations for a given account IP prefix.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
