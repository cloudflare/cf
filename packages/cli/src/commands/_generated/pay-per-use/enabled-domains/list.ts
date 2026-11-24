/**
 * list command
 * @generated from apis/overlays/pay-per-use.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		cursor: {
			kind: "parsed",
			brief:
				"Opaque, account-bound cursor returned by the previous page. Cursors expire after one hour; restart pagination without a cursor after receiving a 400 response for an expired cursor.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of domains to return",
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
	describe: "List enabled Pay Per Use domains",
	usage:
		"$0 pay-per-use enabled-domains list\n\nReturns publisher domains associated with the requesting Pay Per Use operator through an accepted price agreement. License expiration is the earlier non-null boundary from the price agreement and publisher zone lifecycles. A future expiration remains active and is exposed to the operator. After expiration, the license remains listed as expired for one calendar month before it is omitted; an active agreement for the same domain takes precedence. Report usage for these domains with url. Publisher offers are listed by the enabled publishers endpoint instead. The requesting account must be an active Pay Per Use operator.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
