/**
 * get command
 * @generated from apis/overlays/email-routing.ts
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
	describe: "Get catch-all rule",
	usage:
		"$0 email-routing rules catch-all get\n\nGet information on the default catch-all routing rule.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
