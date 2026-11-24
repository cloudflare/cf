/**
 * get command
 * @generated from apis/overlays/load-balancers.ts
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
	operands: [{ placeholder: "pool-id", brief: "Pool ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <pool-id>",
	describe: "Pool Details",
	usage:
		"$0 load-balancers pools get <pool-id>\n\nFetch a single configured pool.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
