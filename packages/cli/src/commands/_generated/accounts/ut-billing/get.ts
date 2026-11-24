/**
 * get command
 * @generated from apis/overlays/accounts.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Get Unique Transformations billing setting",
	usage:
		"$0 accounts ut-billing get\n\nRetrieves the Unique Transformations billing configuration for an account. When enabled, billing data is directed to the Transformations pipeline.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
