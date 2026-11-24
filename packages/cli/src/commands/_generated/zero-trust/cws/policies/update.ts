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
		entrypoint: {
			kind: "parsed",
			brief:
				"Non-function rule declared in rego_source. Evaluation uses data.<package_path>.<entrypoint>.",
			optional: true,
			parse: String,
		},
		filter: {
			kind: "parsed",
			brief:
				"Filter expression that determines whether this policy applies. Maximum 4096 UTF-8 bytes.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Name of the policy",
			optional: true,
			parse: String,
		},
		"rego-source": {
			kind: "parsed",
			brief:
				'Inline Rego source with a package beginning with "policy." Maximum 16384 UTF-8 bytes.',
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
			placeholder: "policy-id",
			brief: "ID of the policy to update",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <policy-id>",
	describe: "Update a policy",
	usage:
		"$0 zero-trust cws policies update <policy-id>\n\nReplaces the policy's configuration. Omit tags or use {} to clear them.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
