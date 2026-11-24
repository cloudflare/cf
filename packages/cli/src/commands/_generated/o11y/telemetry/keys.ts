/**
 * keys command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

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
				'Apply filters to narrow key discovery. Supports nested groups via kind: \'group\'. Maximum nesting depth is 4. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"filterCombination": "and" | "or" | "AND" | ...more, "filters": [{...}], "kind": "group"} | ...more)].',
			optional: true,
			parse: String,
		},
		from: {
			kind: "parsed",
			brief: "The from field",
			optional: true,
			parse: Number,
		},
		"key-needle-is-regex": {
			kind: "boolean",
			brief:
				"When true, treats the value as a regular expression (RE2 syntax).",
			optional: true,
		},
		"key-needle-match-case": {
			kind: "boolean",
			brief:
				"When true, performs a case-sensitive search. Defaults to case-insensitive.",
			optional: true,
		},
		limit: {
			kind: "parsed",
			brief:
				"Advanced usage: set limit=1000+ to retrieve comprehensive key options without needing additional filtering.",
			optional: true,
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
		to: {
			kind: "parsed",
			brief: "The to field",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Find keys in your telemetry events matching a specific filter or needle.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "keys",
	describe: "List keys",
	usage:
		"$0 o11y telemetry keys\n\nList all the keys in your telemetry events.",
	...parameters,
	loader: () => import("./keys.handler.js"),
});

export default command;
