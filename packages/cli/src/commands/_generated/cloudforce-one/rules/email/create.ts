/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"condition-conditions": {
			kind: "parsed",
			brief:
				'The condition.conditions field. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"field": string, "operator": "==" | "!=" | ">" | ...more, "type": "scalar", "value": (string | number | boolean)} | {"conditions": [{...}], "field": string, "type": "array", "quantifier"?: "any" | "all"} | ...more)]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"condition-operator": {
			kind: "parsed",
			brief: "The condition.operator field",
			optional: true,
			choices: ["and", "or"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "condition-operator", "text"),
		},
		"condition-type": {
			kind: "parsed",
			brief: "The condition.type field",
			optional: true,
			choices: ["group"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "condition-type", "text"),
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		enabled: { kind: "boolean", brief: "The enabled field", default: true },
		meta: {
			kind: "parsed",
			brief:
				'The meta field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"key": string, "value": (string | number | boolean)}].',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		status: {
			kind: "parsed",
			brief:
				"Disposition for matching email. This emits status metadata with the selected value.",
			default: "silent",
			choices: ["silent", "blocking"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
		},
		strings: {
			kind: "parsed",
			brief:
				'The strings field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"identifier": string, "type": "string_match", "value": string, "match_type"?: "text" | "hex" | "regex", "modifiers"?: ["nocase" | "wide" | "ascii" | ...more]}]. ? marks optional keys.',
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
	command: "create",
	describe: "Create an email rule",
	usage:
		"$0 cloudforce-one rules email create\n\nCreate a structured email rule.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
