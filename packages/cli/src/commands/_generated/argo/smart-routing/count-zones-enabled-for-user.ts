/**
 * count-zones-enabled-for-user command
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
	command: "count-zones-enabled-for-user",
	describe: "Get count of zones with Argo Smart Routing enabled for user",
	usage:
		"$0 argo smart-routing count-zones-enabled-for-user\n\nReturns the number of zones that have Argo Smart Routing enabled for the authenticated user.",
	...parameters,
	loader: () => import("./count-zones-enabled-for-user.handler.js"),
});

export default command;
