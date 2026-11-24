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
			placeholder: "workload-id",
			brief: "ID of the workload to delete",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <workload-id>",
	describe: "Delete a workload",
	usage:
		"$0 zero-trust cws workloads delete <workload-id>\n\nDeletes the workload if it is not targeted by a policy set. When policy sets still reference it, the error identifies each policy set by ID and name so those relationships can be removed first.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
