/**
 * pfx2as command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		prefix: { kind: "parsed", brief: "Prefix", optional: true, parse: String },
		origin: {
			kind: "parsed",
			brief: "Lookup prefixes originated by the given ASN.",
			optional: true,
			parse: Number,
		},
		"rpki-status": {
			kind: "enum",
			brief:
				"Return only results with matching rpki status: valid, invalid or unknown.",
			values: ["VALID", "INVALID", "UNKNOWN"],
			optional: true,
		},
		"longest-prefix-match": {
			kind: "boolean",
			brief:
				"Return only results with the longest prefix match for the given prefix. For example, specify a /32 prefix to lookup the origin ASN for an IPv4 address.",
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
	command: "pfx2as",
	describe: "Get prefix-to-ASN mapping",
	usage:
		"$0 radar bgp routes pfx2as\n\nRetrieves the prefix-to-ASN mapping from global routing tables.",
	...parameters,
	loader: () => import("./pfx2as.handler.js"),
});

export default command;
