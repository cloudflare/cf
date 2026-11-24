/**
 * create command
 * @generated from apis/overlays/intel.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"account-id-body": {
			kind: "parsed",
			brief:
				"The numeric account ID to create the provider for. Distinct from the\npath `account_id` parameter, which carries the account identifier\nstring used for routing.\n",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief: "The name of the provider",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create indicator feed provider",
	usage:
		"$0 intel indicator-feeds providers create\n\nCreates a new indicator feed provider for an account. Only available to Intel accounts.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
