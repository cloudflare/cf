/**
 * get command
 * @generated from apis/overlays/reporting.ts
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
			placeholder: "policy-id",
			brief: "Unique identifier for the policy (UUID format)",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <policy-id>",
	describe: "Get a reporting policy",
	usage:
		"$0 reporting policies get <policy-id>\n\nGets a reporting policy by identifier.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
