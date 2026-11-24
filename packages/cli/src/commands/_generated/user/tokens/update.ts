/**
 * update command
 * @generated from apis/overlays/user.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"condition-request-ip-in": {
			kind: "parsed",
			brief: "List of IPv4/IPv6 CIDR addresses.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"condition-request-ip-not-in": {
			kind: "parsed",
			brief: "List of IPv4/IPv6 CIDR addresses.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"expires-on": {
			kind: "parsed",
			brief:
				"The expiration time on or after which the JWT MUST NOT be accepted for processing.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Token name.",
			optional: true,
			parse: String,
		},
		"not-before": {
			kind: "parsed",
			brief:
				"The time before which the token MUST NOT be accepted for processing.",
			optional: true,
			parse: String,
		},
		policies: {
			kind: "parsed",
			brief:
				'List of access policies assigned to the token. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"effect": "allow" | "deny", "permission_groups": [{...}], "resources": {...}}].',
			optional: true,
			parse: String,
		},
		status: {
			kind: "parsed",
			brief: "Status of the token.",
			optional: true,
			choices: ["active", "disabled", "expired"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
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
		{ placeholder: "token-id", brief: "Token identifier tag.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <token-id>",
	describe: "Update Token",
	usage: "$0 user tokens update <token-id>\n\nUpdate an existing token.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
