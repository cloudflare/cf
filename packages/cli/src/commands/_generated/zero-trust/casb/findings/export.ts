/**
 * export command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		ignored: {
			kind: "boolean",
			brief:
				"Filter for only the ignored findings. Set to false to only see active items.",
			optional: true,
		},
		"integration-id": {
			kind: "parsed",
			brief: "Filter by multiple integration IDs.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"max-affliction-date": {
			kind: "parsed",
			brief:
				"Filter to view findings that occurred on or before the affliction date. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		"min-affliction-date": {
			kind: "parsed",
			brief:
				"Filter to view findings that occurred on or after the affliction date. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		orders: {
			kind: "parsed",
			brief:
				'Which fields to use when ordering the findings. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"direction": "asc" | "desc", "name": "instance_count" | "finding.name" | "integration.name" | ...more}].',
			optional: true,
			parse: String,
		},
		product: {
			kind: "parsed",
			brief: "Filter by finding's category product.",
			optional: true,
			choices: ["SaaS", "Cloud"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "product", "text"),
		},
		search: {
			kind: "parsed",
			brief: "A search term.",
			optional: true,
			parse: String,
		},
		severities: {
			kind: "parsed",
			brief: "Filter by severity levels.",
			variadic: true,
			optional: true,
			parse: String,
		},
		vendors: {
			kind: "parsed",
			brief: "Filter by vendor types.",
			variadic: true,
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
			brief: "Filter specification for findings export jobs.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "export",
	describe: "Create new findings export request",
	usage:
		"$0 zero-trust casb findings export\n\nCreates a CSV export for findings and accepts optional filters in the payload.",
	...parameters,
	loader: () => import("./export.handler.js"),
});

export default command;
