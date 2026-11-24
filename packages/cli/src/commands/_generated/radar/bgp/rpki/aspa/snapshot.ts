/**
 * snapshot command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"customer-asn": {
			kind: "parsed",
			brief: "Filter by customer ASN (the ASN publishing the ASPA object).",
			optional: true,
			parse: Number,
		},
		"provider-asn": {
			kind: "parsed",
			brief:
				"Filter by provider ASN (an authorized upstream provider in ASPA objects).",
			optional: true,
			parse: Number,
		},
		date: {
			kind: "parsed",
			brief: "Filters results by the specified datetime (ISO 8601).",
			optional: true,
			parse: String,
		},
		"include-asn-info": {
			kind: "boolean",
			brief: "Include ASN metadata (name, country) in response.",
			optional: true,
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "snapshot",
	describe: "Get ASPA objects snapshot",
	usage:
		"$0 radar bgp rpki aspa snapshot\n\nRetrieves current or historical ASPA (Autonomous System Provider Authorization) objects. ASPA objects define which ASNs are authorized upstream providers for a customer ASN.",
	...parameters,
	loader: () => import("./snapshot.handler.js"),
});

export default command;
