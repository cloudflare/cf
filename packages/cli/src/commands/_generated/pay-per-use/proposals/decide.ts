/**
 * decide command
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
			choices: ["accept", "reject"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
		},
		"price-id": {
			kind: "parsed",
			brief:
				"Pending pay-per-use price id returned in the operator proposal queue.",
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
			brief: "Pay-per-use operator proposal decision",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "decide",
	describe: "Decide a pay-per-use price proposal",
	usage:
		"$0 pay-per-use proposals decide\n\nAccepts or rejects the pending pay-per-use price proposal identified by price_id in the request body. Acceptance requires an enabled operator with a verified name, an enabled publisher zone, and matching billing classifications; rejection remains available for cleanup.",
	...parameters,
	loader: () => import("./decide.handler.js"),
});

export default command;
