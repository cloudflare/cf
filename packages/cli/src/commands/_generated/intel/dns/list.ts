/**
 * list command
 * @generated from apis/overlays/intel.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"start-end-params": {
			kind: "parsed",
			brief: "Start end params",
			optional: true,
			parse: String,
		},
		ipv4: { kind: "parsed", brief: "Ipv4", optional: true, parse: String },
		page: {
			kind: "parsed",
			brief: "Requested page within paginated list of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of results requested.",
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
	describe: "Get Passive DNS by IP",
	usage:
		"$0 intel dns list\n\nGets a list of all the domains that have resolved to a specific IP address.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
