/**
 * update command
 * @generated from apis/overlays/stream.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"live-input-identifier": {
			kind: "parsed",
			brief: "A unique identifier for a live input.",
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief:
				"When enabled, live video streamed to the associated live input will be sent to the output URL. When disabled, live video will not be sent to the output URL, even when streaming to the associated live input. Use this to control precisely when you start and stop simulcasting to specific destinations like YouTube and Twitch.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "output-identifier",
			brief: "A unique identifier for the output.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <output-identifier>",
	describe: "Update an output",
	usage:
		"$0 stream live-inputs outputs update <output-identifier>\n\nUpdates the state of an output.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
