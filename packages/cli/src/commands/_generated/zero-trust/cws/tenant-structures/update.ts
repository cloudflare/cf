/**
 * update command
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
		application: {
			kind: "parsed",
			brief: "Platform this structure models. Must match the existing value.",
			optional: true,
			choices: ["aws", "cloudflare"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "application", "text"),
		},
		"import-path": {
			kind: "parsed",
			brief:
				"Optional unique Rego mount path in the form tenant.<application>.<name>; application must match. Omit to clear.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Human-readable name; unique per account",
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
			placeholder: "structure-id",
			brief: "ID of the tenant structure to update",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <structure-id>",
	describe: "Update a tenant structure",
	usage:
		"$0 zero-trust cws tenant-structures update <structure-id>\n\nUpdates the tenant structure's name and import path; its application remains immutable.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
