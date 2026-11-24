/**
 * update command
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
		cidr: {
			kind: "parsed",
			brief:
				"The CIDR block for the ingress rule in IPv4 or IPv6 notation (e.g., 192.0.2.0/24). Provide a Cloudflare BYOIP CIDR that your account owns.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
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
	command: "update <ingress-id>",
	describe: "Update an ingress rule",
	usage:
		"$0 intel sinkholes ingresses update <ingress-id>\n\nReplaces the specified ingress rule. The sinkhole must belong to the same account as the zone.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
