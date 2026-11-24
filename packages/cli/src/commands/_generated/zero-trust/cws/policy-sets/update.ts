/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "Optional free-form description.",
			optional: true,
			parse: String,
		},
		"exclude-workload-ids": {
			kind: "parsed",
			brief:
				"Replacement set of excluded workload IDs. Exclusions take precedence.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"include-workload-ids": {
			kind: "parsed",
			brief:
				"Replacement set of included workload IDs. Empty or omitted includes all requests before exclusions.",
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Name of the policy set",
			optional: true,
			parse: String,
		},
		policies: {
			kind: "parsed",
			brief:
				'Replacement set of policies with per-membership enforcement mode. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"policy_id": string, "enforce"?: boolean}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		tags: {
			kind: "parsed",
			brief:
				'Replacement tag set. Omit or use {} to clear. Keys are limited to 256 UTF-8 bytes and values to 1024 UTF-8 bytes. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
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
			placeholder: "policy-set-id",
			brief: "ID of the policy set to update",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <policy-set-id>",
	describe: "Update a policy set",
	usage:
		"$0 zero-trust cws policy-sets update <policy-set-id>\n\nReplaces the policy set's configuration. Omit tags or use {} to clear them.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
