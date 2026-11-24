/**
 * edit command
 * @generated from apis/overlays/zones.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		value: {
			kind: "parsed",
			brief:
				'Comma-separated list of allowed origin domains for image and video transformations.\nUse "*" to allow all origins (default).\n',
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit",
	describe: "Change Image Transformations Allowed Origins setting",
	usage:
		"$0 zones transformations-allowed-origins edit\n\nMedia Transformations Allowed Origins restricts transformations for images and video served through Cloudflare's network to requests originating from specified domains. Refer to the Image Transformations and Video Transformations documentation for more information.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
