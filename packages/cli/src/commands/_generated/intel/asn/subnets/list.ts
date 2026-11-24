/**
 * list command
 * @generated from apis/overlays/intel.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		asn: { kind: "parsed", brief: "Asn", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "Get ASN Subnets",
	usage: "$0 intel asn subnets list\n\nGet ASN Subnets.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
