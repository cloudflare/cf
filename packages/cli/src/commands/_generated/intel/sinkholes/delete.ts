/**
 * delete command
 * @generated from apis/overlays/intel.ts
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
			placeholder: "sinkhole-id",
			brief: "The unique identifier for the sinkhole.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <sinkhole-id>",
	describe: "Delete a sinkhole",
	usage:
		"$0 intel sinkholes delete <sinkhole-id>\n\nDelete the specified sinkhole. The sinkhole must not have any active ingress rules defined. A 409 response code indicates that this condition is not met.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
