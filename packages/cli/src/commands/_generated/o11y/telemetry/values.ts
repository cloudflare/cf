/**
 * values command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		datasets: {
			kind: "parsed",
			brief: "Leave this empty to use the default datasets",
			variadic: true,
			optional: true,
			parse: String,
		},
		filters: {
			kind: "parsed",
			brief:
				'Apply filters before listing values. Supports nested groups via kind: \'group\'. Maximum nesting depth is 4. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"filterCombination": "and" | "or" | "AND" | ...more, "filters": [{...}], "kind": "group"} | ...more)].',
			optional: true,
			parse: String,
		},
		key: {
			kind: "parsed",
			brief: "The key field",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "The limit field",
			default: "50",
			parse: Number,
		},
		"needle-is-regex": {
			kind: "boolean",
			brief:
				"When true, treats the value as a regular expression (RE2 syntax).",
			optional: true,
		},
		"needle-match-case": {
			kind: "boolean",
			brief:
				"When true, performs a case-sensitive search. Defaults to case-insensitive.",
			optional: true,
		},
		"timeframe-from": {
			kind: "parsed",
			brief: "The timeframe.from field",
			optional: true,
			parse: Number,
		},
		"timeframe-to": {
			kind: "parsed",
			brief: "The timeframe.to field",
			optional: true,
			parse: Number,
		},
		type: {
			kind: "parsed",
			brief: "The type field",
			optional: true,
			choices: ["string", "boolean", "number"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Retrieve values from your telemetry events.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "values",
	describe: "List values",
	usage: "$0 o11y telemetry values\n\nList unique values found in your events.",
	...parameters,
	loader: () => import("./values.handler.js"),
});

export default command;
