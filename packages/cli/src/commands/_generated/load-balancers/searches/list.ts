/**
 * list command
 * @generated from apis/overlays/load-balancers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		query: {
			kind: "parsed",
			brief: "Search query term.",
			optional: true,
			parse: String,
		},
		references: {
			kind: "enum",
			brief:
				'The type of references to include. "*" to include both referral and referrer references. "" to not include any reference information.',
			values: ["", "*", "referral", "referrer"],
			optional: true,
		},
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
		"per-page": {
			kind: "parsed",
			brief: "Per page",
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
	describe: "Search Resources",
	usage:
		"$0 load-balancers searches list\n\nSearch for Load Balancing resources.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
