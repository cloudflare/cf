/**
 * get command
 * @generated from apis/overlays/realtime.ts
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
			brief: "The app identifier tag.",
			parse: String,
		},
		name: { kind: "parsed", brief: "Name", optional: true, parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "meeting-id",
			brief:
				"ID of the meeting. Fetch the meeting ID using the create a meeting API.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <meeting-id>",
	describe: "Fetch a meeting for an App",
	usage:
		"$0 realtime kit meetings get <meeting-id>\n\nReturns a meeting details in an App for the given meeting ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
