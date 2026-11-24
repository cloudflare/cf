/**
 * update command
 * @generated from apis/overlays/logpush.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		code: {
			kind: "parsed",
			brief:
				"The SQL transformer query. Maximum 32 KB. The query must contain a FROM clause referencing a valid logpush dataset.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "Optional customer-provided description.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Customer-provided name for identification.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "transformer-id",
			brief: "The transformer ID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <transformer-id>",
	describe: "Update transformer",
	usage:
		"$0 logpush transformers update <transformer-id>\n\nUpdates an existing custom log transformer. When `code` is provided, the SQL query is validated and a new version is created. When `code` is omitted, only the name and description are updated. Omitting `description` clears the existing description.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
