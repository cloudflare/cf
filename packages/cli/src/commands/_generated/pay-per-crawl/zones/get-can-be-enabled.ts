/**
 * get-can-be-enabled command
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
	command: "get-can-be-enabled",
	describe: "Get pay-per-crawl zone eligibility",
	usage:
		"$0 pay-per-crawl zones get-can-be-enabled\n\nGets whether pay-per-crawl can be enabled for a zone.",
	...parameters,
	loader: () => import("./get-can-be-enabled.handler.js"),
});

export default command;
