/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"user-population-id": { kind: "parsed", brief: "UUID.", parse: String },
		filter: {
			kind: "parsed",
			brief: "A SCIM filter expression.",
			optional: true,
			parse: String,
		},
		"start-index": {
			kind: "parsed",
			brief: "The 1-based index of the first result to return.",
			optional: true,
			parse: Number,
		},
		count: {
			kind: "parsed",
			brief: "The maximum number of results to return.",
			optional: true,
			parse: Number,
		},
		attributes: {
			kind: "parsed",
			brief: "Comma-separated SCIM attributes to return.",
			optional: true,
			parse: String,
		},
		"excluded-attributes": {
			kind: "parsed",
			brief: "Comma-separated SCIM attributes to exclude from the response.",
			optional: true,
			parse: String,
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
	describe: "List users in a user population",
	usage:
		"$0 zero-trust access user-populations users list\n\nLists SCIM users in a user population.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
