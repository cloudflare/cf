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
		domain: { kind: "parsed", brief: "The shadow-zone domain.", parse: String },
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
	describe: "Lists Hosts in a Partner-Discovered Shadow Zone",
	usage:
		"$0 security-insights partners shadow-zone-hosts list\n\nLists hosts discovered beneath a shadow-zone domain. This endpoint is available only to premium accounts and supports JSON and CSV output.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
