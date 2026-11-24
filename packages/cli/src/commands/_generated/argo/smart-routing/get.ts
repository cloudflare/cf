/**
 * get command
 * @generated from apis/overlays/argo.ts
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
	describe: "Get Argo Smart Routing setting",
	usage:
		"$0 argo smart-routing get\n\nRetrieves the value of Argo Smart Routing enablement setting.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
