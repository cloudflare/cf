/**
 * query-can-be-enabled command
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		zones: {
			kind: "parsed",
			brief: "The zones field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Zone IDs to check for pay-per-crawl eligibility",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "query-can-be-enabled",
	describe: "Gets the can_be_enabled zone setting",
	usage:
		"$0 pay-per-crawl zones query-can-be-enabled\n\nProvided a list of pay-per-crawl configured zones this method will return whether they can enable PPC or not.",
	...parameters,
	loader: () => import("./query-can-be-enabled.handler.js"),
});

export default command;
