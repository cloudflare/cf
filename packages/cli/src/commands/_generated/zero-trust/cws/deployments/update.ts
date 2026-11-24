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
		"basic-auth-credential-ids": {
			kind: "parsed",
			brief: "Replacement set of basic-auth credential IDs",
			variadic: true,
			optional: true,
			parse: String,
		},
		"default-mode": {
			kind: "parsed",
			brief: "Default traffic mode: ALLOW or BLOCK",
			optional: true,
			choices: ["ALLOW", "BLOCK"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "default-mode", "text"),
		},
		description: {
			kind: "parsed",
			brief: "Optional free-form description.",
			optional: true,
			parse: String,
		},
		"domain-acl-id": {
			kind: "parsed",
			brief: "ID of the domain ACL to attach (omit or null to clear)",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Name of the deployment",
			optional: true,
			parse: String,
		},
		"on-error-action": {
			kind: "parsed",
			brief: "Action for runtime Rego errors. Omit to reset to BLOCK.",
			optional: true,
			choices: ["BLOCK", "SKIP"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "on-error-action", "text"),
		},
		"policy-set-ids": {
			kind: "parsed",
			brief: "Replacement set of policy set IDs",
			variadic: true,
			optional: true,
			parse: String,
		},
		"rego-raise-error": {
			kind: "boolean",
			brief:
				"Whether OPA builtin failures are raised as runtime evaluation errors. Omit to reset to true.",
			optional: true,
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
			placeholder: "deployment-id",
			brief: "ID of the deployment to update",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <deployment-id>",
	describe: "Update a deployment",
	usage:
		"$0 zero-trust cws deployments update <deployment-id>\n\nReplaces the deployment's mutable configuration and resource attachments.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
