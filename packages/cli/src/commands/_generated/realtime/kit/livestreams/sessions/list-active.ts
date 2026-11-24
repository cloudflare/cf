/**
 * list-active command
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
		{ placeholder: "livestream-id", brief: "Livestream ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list-active <livestream-id>",
	describe: "Fetch active livestream session details",
	usage:
		"$0 realtime kit livestreams sessions list-active <livestream-id>\n\nReturns details of all active livestreams for the given livestream ID. Retreive the livestream ID using the `Start livestreaming a meeting` API.",
	...parameters,
	loader: () => import("./list-active.handler.js"),
});

export default command;
