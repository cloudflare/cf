/**
 * preview command
 * @generated from apis/overlays/logpush.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		input: {
			kind: "parsed",
			brief:
				'A single log record to transform (JSON object). Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		sql: {
			kind: "parsed",
			brief:
				"The SQL transformer query. Maximum 32 KB. The query must contain a FROM clause referencing a valid logpush dataset.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "preview",
	describe: "Preview transformer",
	usage:
		"$0 logpush transformers preview\n\nExecutes a SQL transformer against a single input record and returns the transformed output. This is a stateless endpoint — nothing is persisted.",
	...parameters,
	loader: () => import("./preview.handler.js"),
});

export default command;
