/**
 * get command
 * @generated from apis/overlays/url-normalization.ts
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
	describe: "Get URL Normalization settings",
	usage:
		"$0 url-normalization get\n\nFetches the current URL Normalization settings.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
