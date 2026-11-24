/**
 * get command
 * @generated from apis/overlays/zones.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Get Image Transformations Allowed Origins setting",
	usage:
		"$0 zones transformations-allowed-origins get\n\nMedia Transformations Allowed Origins restricts transformations for images and video served through Cloudflare's network to requests originating from specified domains. Refer to the Image Transformations and Video Transformations documentation for more information.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
