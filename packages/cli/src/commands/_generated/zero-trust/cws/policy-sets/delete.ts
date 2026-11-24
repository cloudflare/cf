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
			placeholder: "policy-set-id",
			brief: "ID of the policy set to delete",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <policy-set-id>",
	describe: "Delete a policy set",
	usage:
		"$0 zero-trust cws policy-sets delete <policy-set-id>\n\nDeletes the policy set if it is not attached to a deployment, then removes its policy and workload membership rows. When deployments still reference it, the error identifies each deployment by ID and name so those relationships can be removed first. Referenced policies and workloads remain.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
