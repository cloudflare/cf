/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dataset-id": { kind: "parsed", brief: "Dataset ID.", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "event-id", brief: "Event ID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <event-id>",
	describe: "Get raw data for an event",
	usage:
		"$0 cloudforce-one threat-intel events raw get <event-id>\n\nReturns the raw source data stored with an event.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
