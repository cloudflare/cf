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
			placeholder: "list-id",
			brief: "Identify the API resource with a UUID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <list-id>",
	describe: "Get Zero Trust list details",
	usage:
		"$0 zero-trust gateway lists get <list-id>\n\nFetch a single Zero Trust list.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
