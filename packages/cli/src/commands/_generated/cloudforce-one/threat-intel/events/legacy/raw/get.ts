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
		"event-id": { kind: "parsed", brief: "Event UUID.", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "raw-id", brief: "Raw Event UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <raw-id>",
	describe: "Get raw event data by raw ID (legacy)",
	usage:
		"$0 cloudforce-one threat-intel events legacy raw get <raw-id>\n\nLegacy. Returns raw data stored under a `raw_id`, which new events don't use. Use `threat-intel events raw get` (`GET /events/datasets/{dataset_id}/events/{event_id}/raw`) instead.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
