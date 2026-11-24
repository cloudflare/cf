/**
 * get command
 * @generated from apis/overlays/spectrum.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"app-id": {
			kind: "parsed",
			brief:
				"Comma-delimited list of Spectrum Application Id(s). If provided, the response will be limited to Spectrum Application Id(s) that match.",
			optional: true,
			parse: String,
		},
		"colo-name": {
			kind: "parsed",
			brief: "Co-location identifier.",
			optional: true,
			parse: String,
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
	command: "get",
	describe: "Get current aggregated analytics",
	usage:
		"$0 spectrum analytics aggregates currents get\n\nRetrieves analytics aggregated from the last minute of usage on Spectrum applications underneath a given zone.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
