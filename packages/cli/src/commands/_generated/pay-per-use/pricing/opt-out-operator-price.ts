/**
 * opt-out-operator-price command
 * @generated from apis/overlays/pay-per-use.ts
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "operator-id",
			brief: "Stable pay-per-use operator identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "opt-out-operator-price <operator-id>",
	describe: "Opt out of a pay-per-use operator price",
	usage:
		"$0 pay-per-use pricing opt-out-operator-price <operator-id>\n\nOpts a zone out by scheduling the current accepted pay-per-use operator price to expire at the start of the next UTC month. Use the withdraw action for a pending proposal.",
	...parameters,
	loader: () => import("./opt-out-operator-price.handler.js"),
});

export default command;
