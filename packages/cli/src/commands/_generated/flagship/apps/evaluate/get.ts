/**
 * get command
 * @generated from apis/overlays/flagship.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"flag-key": {
			kind: "parsed",
			brief: "The flag key to evaluate.",
			parse: String,
		},
		"targeting-key": {
			kind: "parsed",
			brief:
				"Context targeting key (per OpenFeature spec); used for percentage rollout bucketing.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "app-id",
			brief: "Flagship app ID returned when the app was created.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <app-id>",
	describe: "Evaluate flag from query context",
	usage:
		"$0 flagship apps evaluate get <app-id>\n\nEvaluates a flag against the provided context. Pass context attributes as query parameters; values are coerced to numbers or booleans where unambiguous. For low-latency in-Worker evaluation, prefer the Flagship binding over this endpoint.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
