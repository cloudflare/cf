/**
 * get command
 * @generated from apis/overlays/custom-hostnames.ts
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
	describe: "Get Fallback Origin for Custom Hostnames",
	usage:
		"$0 custom-hostnames fallback-origin get\n\nRetrieves the current fallback origin configuration for custom hostnames on a zone. The fallback origin handles traffic when specific custom hostname origins are unavailable.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
