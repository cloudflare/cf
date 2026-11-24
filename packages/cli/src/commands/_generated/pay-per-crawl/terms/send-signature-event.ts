/**
 * send-signature-event command
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"event-type": {
			kind: "enum",
			brief: "The terms activity to record.",
			values: ["agreed", "displayed"],
		},
		vid: {
			kind: "parsed",
			brief: "Ironclad contract version ID.",
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
	command: "send-signature-event",
	describe: "Record pay-per-crawl terms activity",
	usage:
		"$0 pay-per-crawl terms send-signature-event\n\nRecords that an account displayed or agreed to the pay-per-crawl terms.",
	...parameters,
	loader: () => import("./send-signature-event.handler.js"),
});

export default command;
