/**
 * list command
 * @generated from apis/overlays/registrar.ts
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
				"Opaque token from a previous response's `result_info.cursor`.\nPass this value to fetch the next page of results. Omit (or\npass an empty string) for the first page.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of items to return per page.",
			optional: true,
			parse: Number,
		},
		direction: {
			kind: "enum",
			brief: "Sort direction for results. Defaults to ascending order.",
			values: ["asc", "desc"],
			optional: true,
		},
		"sort-by": {
			kind: "enum",
			brief:
				"Column to sort results by. Defaults to registration date (`registry_created_at`) when omitted.",
			values: ["registry_created_at", "registry_expires_at", "name"],
			optional: true,
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
	describe: "List Registrations",
	usage:
		"$0 registrar registrations list\n\nReturns a paginated list of domain registrations owned by the account. This endpoint uses cursor-based pagination. Results are ordered by registration date by default. To fetch the next page, pass the `cursor` value from the `result_info` object in the response as the `cursor` query parameter in your next request. An empty `cursor` string indicates there are no more pages.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
