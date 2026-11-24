/**
 * get command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"include-confidence-level": {
			kind: "boolean",
			brief:
				"Include the traffic data confidence level in the response. Set to `false` to skip it and get a faster response.",
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
	operands: [
		{
			placeholder: "asn",
			brief: "Single Autonomous System Number (ASN) as integer.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <asn>",
	describe: "Get AS details by ASN",
	usage:
		"$0 radar entities asns get <asn>\n\nRetrieves the requested autonomous system information. (A confidence level below `5` indicates a low level of confidence in the traffic data - normally this happens because Cloudflare has a small amount of traffic from/to this AS). Population estimates come from APNIC (refer to https://labs.apnic.net/?p=526).",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
