/**
 * get-signature command
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		refresh: {
			kind: "boolean",
			brief: "Refresh the signature status from Ironclad.",
			optional: true,
		},
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
	command: "get-signature",
	describe: "Get pay-per-crawl terms signature status",
	usage:
		"$0 pay-per-crawl terms get-signature\n\nGets the account's pay-per-crawl terms signature status.",
	...parameters,
	loader: () => import("./get-signature.handler.js"),
});

export default command;
