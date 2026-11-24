/**
 * get command
 * @generated from apis/overlays/images.ts
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
	describe: "Get Images account configuration",
	usage:
		"$0 images config get\n\nGet account-level Cloudflare Images settings, such as flexible variants and Content Credentials preservation. Settings that are disabled may be omitted from the response.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
