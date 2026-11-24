/**
 * get command
 * @generated from apis/overlays/pay-per-crawl.ts
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
	describe: "Gets the stripe config for a publisher",
	usage:
		"$0 pay-per-crawl publisher stripe get\n\nGets the stripe config for a publisher.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
