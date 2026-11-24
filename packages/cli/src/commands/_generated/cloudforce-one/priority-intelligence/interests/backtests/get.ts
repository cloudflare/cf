/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
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
	operands: [
		{ placeholder: "backtest-id", brief: "Backtest UUID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <backtest-id>",
	describe: "Get a persisted account-interest backtest",
	usage:
		"$0 cloudforce-one priority-intelligence interests backtests get <backtest-id>\n\nReturns a previously completed account-interest backtest by ID. The backtest must belong to this account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
