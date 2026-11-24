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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "event-id", brief: "Event UUID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <event-id>",
	describe: "Get an event (legacy)",
	usage:
		"$0 cloudforce-one threat-intel events legacy get <event-id>\n\nLegacy. Use `threat-intel events get` (`GET /events/dataset/{dataset_id}/events/{event_id}`) instead.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
