/**
 * get command
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
	command: "get <ingress-id>",
	describe: "Get an ingress rule",
	usage:
		"$0 intel sinkholes ingresses get <ingress-id>\n\nGet the specified ingress rule associated with a sinkhole. The sinkhole must belong to the same account as the zone.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
