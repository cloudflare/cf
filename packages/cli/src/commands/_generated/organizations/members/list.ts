/**
 * list command
 * @generated from apis/overlays/organizations.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"organization-id": {
			kind: "parsed",
			brief: "Organization ID",
			parse: String,
		},
		status: {
			kind: "parsed",
			brief:
				"Filter the list of memberships by membership status. Defaults to `active`, `pending`, and `rejected`; pass `canceled` explicitly to include canceled memberships.",
			variadic: true,
			optional: true,
			choices: ["active", "pending", "rejected", "canceled"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"user-email": {
			kind: "parsed",
			brief: "Filter the list of memberships for a specific email.",
			optional: true,
			parse: String,
		},
		"user-email-contains": {
			kind: "parsed",
			brief:
				"Filter the list of memberships for a specific email that contains a substring.",
			optional: true,
			parse: String,
		},
		"user-email-starts-with": {
			kind: "parsed",
			brief:
				"Filter the list of memberships for a specific email that starts with a substring.",
			optional: true,
			parse: String,
		},
		"user-email-ends-with": {
			kind: "parsed",
			brief:
				"Filter the list of memberships for a specific email that ends with a substring.",
			optional: true,
			parse: String,
		},
		"page-token": {
			kind: "parsed",
			brief:
				"An opaque token returned from the last list response that when\nprovided will retrieve the next page.\n\nParameters used to filter the retrieved list must remain in subsequent\nrequests with a page token.",
			optional: true,
			parse: String,
		},
		"page-size": {
			kind: "parsed",
			brief: "The amount of items to return. Defaults to 10.",
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
	describe: "List organization members",
	usage:
		"$0 organizations members list\n\nList memberships for an Organization.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
