/**
 * list command
 * @generated from apis/overlays/registrar-sandbox.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief:
				"Filter extensions by exact name match.\nFor example, `name=com` returns only the `com` extension.",
			optional: true,
			parse: String,
		},
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
			brief: "Column to sort results by. Defaults to `name` when omitted.",
			values: ["name", "created_at", "updated_at"],
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
	describe: "List extensions",
	usage:
		"$0 registrar-sandbox extensions list\n\nReturns metadata and JSON Schema documents describing the expected input structure for registration and transfer operations on each supported extension (TLD). This endpoint uses cursor-based pagination. Results are ordered by extension name by default. To fetch the next page, pass the `cursor` value from the `result_info` object in the response as the `cursor` query parameter in your next request. An empty `cursor` string indicates there are no more pages. Supports HTTP conditional GET via `ETag`. Include the `ETag` value from a previous response in an `If-None-Match` header to receive a `304 Not Modified` when the data has not changed.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
