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
		"sinkhole-id": {
			kind: "parsed",
			brief: "The unique identifier for the sinkhole.",
			parse: String,
		},
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
			placeholder: "ingress-id",
			brief: "The unique identifier for the ingress rule.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <ingress-id>",
	describe: "Delete an ingress rule",
	usage:
		"$0 intel sinkholes ingresses delete <ingress-id>\n\nDelete the specified ingress rule. The sinkhole must belong to the same account as the zone.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
