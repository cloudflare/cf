/**
 * list command
 * @generated from apis/overlays/security-insights.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		partner: {
			kind: "parsed",
			brief: "The partner integration identifier.",
			parse: String,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque cursor from the previous response's `result_info.cursor`. Omit for the first page.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of premium partner asset results per page. Values other than 1 must be a multiple of 5.",
			optional: true,
			parse: Number,
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
	command: "list",
	describe: "Lists Partner-Discovered Shadow Hosts for a Zone",
	usage:
		"$0 security-insights partners shadow-hosts list\n\nLists partner-discovered hosts beneath the zone that are not in the account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
