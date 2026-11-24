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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "asn", brief: "Asn", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <asn>",
	describe: "Get ASN Overview.",
	usage:
		"$0 intel asn get <asn>\n\nGets an overview of the Autonomous System Number (ASN) and a list of subnets for it.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
