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
			brief: "Maximum number of publishers to return",
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
	describe: "List enabled Pay Per Use publishers",
	usage:
		"$0 pay-per-use enabled-publishers list\n\nReturns the publishers whose offers the requesting Pay Per Use operator has accepted, one item per publisher with the domains it covers. Licensing is per publisher, and the domains are informational and do not restrict usage. Report usage with the item's publisher_id. Each item shows one accepted offer; an active offer takes precedence over an expired one. License expiration is the earlier non-null boundary from the offer and the publisher lifecycle. A future expiration remains active and is exposed to the operator. After expiration, the license remains listed as expired for one calendar month before it is omitted. Zone agreements are listed by the enabled domains endpoint instead. Items are ordered alphabetically by publisher_name, ignoring case and accents, then by publisher_id; a publisher renamed while you paginate can be skipped or listed twice. The requesting account must be an active Pay Per Use operator.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
