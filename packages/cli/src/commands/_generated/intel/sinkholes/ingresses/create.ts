/**
 * create command
 * @generated from apis/overlays/intel.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
			placeholder: "sinkhole-id",
			brief: "The unique identifier for the sinkhole.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <sinkhole-id>",
	describe: "Create an ingress rule",
	usage:
		"$0 intel sinkholes ingresses create <sinkhole-id>\n\nCreate a new ingress rule for the specified sinkhole. The CIDR block must be a Cloudflare BYOIP associated with your account. The zone_id must be a zone with the ability to create Spectrum Apps. The sinkhole must belong to the same account as the zone.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
