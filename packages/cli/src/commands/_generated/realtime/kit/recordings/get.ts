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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "recording-id",
			brief: "ID of the recording",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <recording-id>",
	describe: "Fetch details of a recording",
	usage:
		"$0 realtime kit recordings get <recording-id>\n\nReturns details of a recording for the given recording ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
