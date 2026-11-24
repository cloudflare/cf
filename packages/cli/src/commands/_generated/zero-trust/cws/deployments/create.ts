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
		"basic-auth-credential-ids": {
			kind: "parsed",
			brief: "IDs of basic-auth credentials to attach",
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
			brief: "ID of the domain ACL to attach (omit or null for none)",
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
			brief: "Action for runtime Rego errors. Omit to use BLOCK.",
			default: "BLOCK",
			choices: ["BLOCK", "SKIP"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "on-error-action", "text"),
		},
		"policy-set-ids": {
			kind: "parsed",
			brief: "IDs of policy sets to attach",
			variadic: true,
			optional: true,
			parse: String,
		},
		"rego-raise-error": {
			kind: "boolean",
			brief:
				"Whether OPA builtin failures are raised as runtime evaluation errors. Omit to use the default true value.",
			default: true,
		},
		tags: {
			kind: "parsed",
			brief:
				'Tags to attach. Keys are limited to 256 UTF-8 bytes and values to 1024 UTF-8 bytes. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
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
	describe: "Create a new deployment",
	usage:
		"$0 zero-trust cws deployments create\n\nCreates a deployment with the specified policy sets, domain ACL, and basic-auth credentials.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
