/**
 * get command
 * @generated from apis/overlays/web-assets.ts
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
	describe: "Export discovered API operations as OpenAPI schemas",
	usage:
		"$0 web-assets discovery get\n\nReturns the latest API operations discovered from zone traffic, rendered as OpenAPI schemas.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
