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
	describe: "Get Image Transformations setting",
	usage:
		"$0 zones image-resizing get\n\nGets the Image Transformations setting for a zone. Accepted values are `off`, `on`, `open`, and `latest`.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
