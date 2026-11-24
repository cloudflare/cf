/**
 * list command
 * @generated from apis/overlays/monetization.ts
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
	command: "list",
	describe: "List payment rules",
	usage:
		"$0 monetization rules list\n\nReturns the currently deployed Payment Required rules for a zone. A zone with no Payment Required ruleset returns 404.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
