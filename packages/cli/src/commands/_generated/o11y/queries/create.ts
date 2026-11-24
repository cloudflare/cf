/**
 * create command
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
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Query name",
			optional: true,
			parse: String,
		},
		"parameters-calculations": {
			kind: "parsed",
			brief:
				'Create Calculations to compute as part of the query. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"operator": "count" | "COUNT", "alias"?: string, "key"?: string, "keyType"?: "string" | "number" | "boolean"} | ...more)]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"parameters-datasets": {
			kind: "parsed",
			brief:
				"Set the Datasets to query. Leave it empty to query all the datasets.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"parameters-filter-combination": {
			kind: "parsed",
			brief: "Set a Flag to describe how to combine the filters on the query.",
			optional: true,
			choices: ["and", "or", "AND", "OR"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "parameters-filter-combination", "text"),
		},
		"parameters-filters": {
			kind: "parsed",
			brief:
				'Configure the Filters to apply to the query. Supports nested groups via kind: \'group\'. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"filterCombination": "and" | "or" | "AND" | ...more, "filters": [{...}], "kind": "group"} | ...more)].',
			optional: true,
			parse: String,
		},
		"parameters-group-bys": {
			kind: "parsed",
			brief:
				'Define how to group the results of the query. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"type": "string" | "number" | "boolean", "value": string}].',
			optional: true,
			parse: String,
		},
		"parameters-havings": {
			kind: "parsed",
			brief:
				'Configure the Having clauses that filter on calculations in the query result. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"key": string, "operation": "eq" | "neq" | "gt" | ...more, "value": number}].',
			optional: true,
			parse: String,
		},
		"parameters-limit": {
			kind: "parsed",
			brief:
				"Set a limit on the number of results / records returned by the query",
			optional: true,
			parse: Number,
		},
		"parameters-needle-is-regex": {
			kind: "boolean",
			brief: "The parameters.needle.isRegex field",
			optional: true,
		},
		"parameters-needle-match-case": {
			kind: "boolean",
			brief: "The parameters.needle.matchCase field",
			optional: true,
		},
		"parameters-order-by-order": {
			kind: "parsed",
			brief: "Set the order of the results",
			optional: true,
			choices: ["asc", "desc"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "parameters-order-by-order", "text"),
		},
		"parameters-order-by-value": {
			kind: "parsed",
			brief: "Configure which Calculation to order the results by.",
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
			brief: "Specify the new contents of the query.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"parameters-order-by-order",
				"parameters-order-by-value",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["parameters-order-by-value"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --parameters-order-by-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Save query",
	usage: "$0 o11y queries create\n\nPersist query for later use.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
