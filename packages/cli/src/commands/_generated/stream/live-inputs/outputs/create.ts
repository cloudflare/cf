/**
 * create command
 * @generated from apis/overlays/stream.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		enabled: {
			kind: "boolean",
			brief:
				"When enabled, live video streamed to the associated live input will be sent to the output URL. When disabled, live video will not be sent to the output URL, even when streaming to the associated live input. Use this to control precisely when you start and stop simulcasting to specific destinations like YouTube and Twitch.",
			default: true,
		},
		"stream-key": {
			kind: "parsed",
			brief: "The streamKey used to authenticate against an output's target.",
			optional: true,
			parse: String,
		},
		url: {
			kind: "parsed",
			brief: "The URL an output uses to restream.",
			optional: true,
			parse: String,
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
			placeholder: "live-input-identifier",
			brief: "A unique identifier for a live input.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <live-input-identifier>",
	describe: "Create a new output, connected to a live input",
	usage:
		"$0 stream live-inputs outputs create <live-input-identifier>\n\nCreates a new output that can be used to simulcast or restream live video to other RTMP or SRT destinations. Outputs are always linked to a specific live input — one live input can have many outputs.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
