/**
 * evaluate command
 * @generated from apis/overlays/flagship.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		context: {
			kind: "parsed",
			brief:
				'Evaluation attributes keyed by name. Values may be any JSON value; the context supports up to 100 entries, nesting depth of 10, 10,000 values, and 32 KB. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": (string | number | boolean | ...more)}.',
			optional: true,
			parse: String,
		},
		"flag-key": {
			kind: "parsed",
			brief: "Key of the flag to evaluate within the app.",
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
			placeholder: "app-id",
			brief: "Flagship app ID returned when the app was created.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "evaluate <app-id>",
	describe: "Evaluate flag with JSON context",
	usage:
		"$0 flagship apps flags evaluate <app-id>\n\nEvaluates a flag against the provided context, passed as a JSON request body (OFREP-shaped) rather than query parameters. Returns the same response shape as the GET variant.",
	...parameters,
	loader: () => import("./evaluate.handler.js"),
});

export default command;
