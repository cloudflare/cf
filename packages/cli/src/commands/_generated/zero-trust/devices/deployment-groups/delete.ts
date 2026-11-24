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
	operands: [{ placeholder: "group-id", brief: "Group ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <group-id>",
	describe: "Delete deployment group",
	usage:
		"$0 zero-trust devices deployment-groups delete <group-id>\n\nDeletes a deployment group. Associated policies no longer apply and devices stop receiving version targets. This endpoint is in Beta.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
