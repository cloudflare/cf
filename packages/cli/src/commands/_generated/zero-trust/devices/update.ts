/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		tags: {
			kind: "parsed",
			brief:
				'Replaces all tags assigned to the physical device. An empty object removes all tags. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
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
	operands: [{ placeholder: "device-id", brief: "Device ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <device-id>",
	describe: "Update device",
	usage:
		"$0 zero-trust devices update <device-id>\n\nUpdates properties of a WARP device.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
