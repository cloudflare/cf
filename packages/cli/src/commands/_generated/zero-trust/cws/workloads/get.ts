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
			placeholder: "workload-id",
			brief: "ID of the workload to retrieve",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <workload-id>",
	describe: "Get a workload by ID",
	usage:
		"$0 zero-trust cws workloads get <workload-id>\n\nReturns the workload with the specified ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
