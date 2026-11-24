/**
 * set-operator-price command
 * @generated from apis/overlays/pay-per-use.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		action: {
			kind: "parsed",
			brief: "The action field",
			optional: true,
			choices: ["propose", "withdraw", "accept_default", "resume"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
		},
		"price-usd-microcents": {
			kind: "parsed",
			brief:
				"Price in microcents. Must be a multiple of 100,000 ($0.001) between $0.001 and $9,999.999.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Pay-per-use publisher price action",
			optional: true,
			parse: String,
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
	command: "set-operator-price <operator-id>",
	describe: "Set a pay-per-use operator price",
	usage:
		"$0 pay-per-use pricing set-operator-price <operator-id>\n\nProposes a required price, withdraws a pending proposal, accepts an operator's default pay-per-use price, or resumes an accepted price before its scheduled expiry. Propose, accept_default, and resume require an enabled operator with a verified name, an enabled publisher zone, and matching billing classifications.",
	...parameters,
	loader: () => import("./set-operator-price.handler.js"),
});

export default command;
