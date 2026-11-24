/**
 * moas command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		origin: {
			kind: "parsed",
			brief: "Lookup MOASes originated by the given ASN.",
			optional: true,
			parse: Number,
		},
		prefix: { kind: "parsed", brief: "Prefix", optional: true, parse: String },
		"invalid-only": {
			kind: "boolean",
			brief: "Lookup only RPKI invalid MOASes.",
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
	command: "moas",
	describe: "Get Multi-Origin AS (MOAS) prefixes",
	usage:
		"$0 radar bgp routes moas\n\nRetrieves all Multi-Origin AS (MOAS) prefixes in the global routing tables.",
	...parameters,
	loader: () => import("./moas.handler.js"),
});

export default command;
