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
		{ placeholder: "uuid", brief: "Traffic anomaly UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <uuid>",
	describe: "Get traffic anomaly by UUID",
	usage:
		"$0 radar traffic-anomalies get <uuid>\n\nRetrieves a single Internet traffic anomaly by UUID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
