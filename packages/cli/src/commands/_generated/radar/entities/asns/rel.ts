/**
 * rel command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		asn2: {
			kind: "parsed",
			brief:
				"Retrieves the AS relationship of ASN2 with respect to the given ASN.",
			optional: true,
			parse: Number,
		},
		format: {
			kind: "enum",
			brief: "Format in which results will be returned.",
			values: ["JSON", "CSV"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "asn",
			brief:
				"Retrieves all ASNs with provider-customer or peering relationships with the given ASN.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "rel <asn>",
	describe: "Get AS-level relationships by ASN",
	usage:
		"$0 radar entities asns rel <asn>\n\nRetrieves AS-level relationship for given networks.",
	...parameters,
	loader: () => import("./rel.handler.js"),
});

export default command;
