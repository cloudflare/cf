/**
 * create command
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
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		"pattern-regex": {
			kind: "parsed",
			brief: "The pattern.regex field",
			optional: true,
			parse: String,
		},
		"pattern-validation": {
			kind: "parsed",
			brief: "The pattern.validation field",
			optional: true,
			choices: ["luhn"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "pattern-validation", "text"),
		},
		"profile-id": {
			kind: "parsed",
			brief: "The profile_id field",
			optional: true,
			parse: String,
		},
		"validator-ids": {
			kind: "parsed",
			brief: "Validators the new entry should reference, by id, at most 10.",
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
			brief: "A new entry to create.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create custom entry",
	usage: "$0 zero-trust dlp entries create\n\nCreates a DLP custom entry.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
