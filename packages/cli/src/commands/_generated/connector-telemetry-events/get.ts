/**
 * get command
 * @generated from apis/overlays/connector-telemetry-events.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"connector-id": { kind: "parsed", brief: "Connector ID", parse: String },
		"event-t": { kind: "parsed", brief: "Event t", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "event-n", brief: "Event n", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <event-n>",
	describe: "Get Event",
	usage:
		"$0 connector-telemetry-events get <event-n>\n\nGets Magic WAN Connector Telemetry Event",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
