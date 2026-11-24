/**
 * create command
 * @generated from apis/overlays/accounts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"idempotency-key": {
			kind: "parsed",
			brief:
				"Optional key that identifies an Account-creation request. Free Account creation can require exactly one valid key, so API clients should send a key with every Account-creation request. Reuse the same key when retrying the same request.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Account name, limited to 65 UTF-8 bytes.",
			optional: true,
			parse: String,
		},
		standalone: {
			kind: "boolean",
			brief:
				"Set to `true` and omit `unit` to create a standalone Free Account. If provided, this field must be `true`.",
			optional: true,
		},
		type: {
			kind: "parsed",
			brief:
				"the type of account being created. For self-serve customers, use standard. for enterprise customers, use enterprise.",
			default: "standard",
			choices: ["standard", "enterprise"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"unit-id": {
			kind: "parsed",
			brief: "Tenant unit ID",
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
			brief: "Parameters for account creation",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create an Account",
	usage:
		"$0 accounts create\n\nCreate an Account. To create the Account within an Organization, provide `unit.id` and omit `standalone`. To create a standalone Free Account, provide `standalone: true` and omit `unit`. Providing both fields is invalid. If you omit both fields, Cloudflare can determine the destination only when the User is an administrator of exactly one Organization. Cloudflare creates the Account in that Organization; otherwise, the request returns an error. Account names are limited to 65 UTF-8 bytes.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
