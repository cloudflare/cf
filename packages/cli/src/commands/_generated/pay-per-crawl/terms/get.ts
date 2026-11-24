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
	describe: "Get pay-per-crawl terms",
	usage:
		"$0 pay-per-crawl terms get\n\nGets the pay-per-crawl terms and conditions contract.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
