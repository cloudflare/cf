/**
 * get-signature-link command
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
	command: "get-signature-link",
	describe: "Get signed pay-per-crawl terms link",
	usage:
		"$0 pay-per-crawl terms get-signature-link\n\nGets a download link for the account's signed pay-per-crawl terms.",
	...parameters,
	loader: () => import("./get-signature-link.handler.js"),
});

export default command;
