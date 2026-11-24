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
		"approval-groups": {
			kind: "parsed",
			brief:
				'Administrators who can approve a temporary authentication request. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"approvals_needed": number, "email_addresses"?: [string], "email_list_uuid"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"approval-required": {
			kind: "boolean",
			brief:
				"Requires the user to request access from an administrator at the start of each session.",
			optional: true,
		},
		"connection-rules-rdp-allowed-clipboard-local-to-remote-formats": {
			kind: "parsed",
			brief:
				"Clipboard formats allowed when copying from local machine to remote RDP session.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"connection-rules-rdp-allowed-clipboard-remote-to-local-formats": {
			kind: "parsed",
			brief:
				"Clipboard formats allowed when copying from remote RDP session to local machine.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"isolation-required": {
			kind: "boolean",
			brief:
				"Require this application to be served in an isolated browser for users matching this policy. 'Client Web Isolation' must be on for the account in order to use this feature.",
			optional: true,
		},
		"mfa-config-allowed-authenticators": {
			kind: "parsed",
			brief: "Lists the MFA methods that users can authenticate with.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"mfa-config-mfa-disabled": {
			kind: "boolean",
			brief:
				"Indicates whether to disable MFA for this resource. This option is available at the application and policy level.",
			optional: true,
		},
		"mfa-config-session-duration": {
			kind: "parsed",
			brief:
				"Defines the duration of an MFA session. Must be in minutes (m) or hours (h). Minimum: 0m. Maximum: 720h (30 days). Examples:`5m` or `24h`.",
			optional: true,
			parse: String,
		},
		"purpose-justification-prompt": {
			kind: "parsed",
			brief:
				"A custom message that will appear on the purpose justification screen.",
			optional: true,
			parse: String,
		},
		"purpose-justification-required": {
			kind: "boolean",
			brief:
				"Require users to enter a justification when they log in to the application.",
			optional: true,
		},
		"session-duration": {
			kind: "parsed",
			brief:
				"The amount of time that tokens issued for the application will be valid. Must be in the format `300ms` or `2h45m`. Valid time units are: ns, us (or µs), ms, s, m, h.",
			optional: true,
			parse: String,
		},
		decision: {
			kind: "parsed",
			brief:
				"The action Access will take if a user matches this policy. Infrastructure application policies can only use the Allow action.",
			optional: true,
			choices: ["allow", "deny", "non_identity", "bypass"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "decision", "text"),
		},
		exclude: {
			kind: "parsed",
			brief:
				'Rules evaluated with a NOT logical operator. To match the policy, a user cannot meet any of the Exclude rules. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"group": {...}} | {"any_valid_service_token": {...}} | {"auth_context": {...}} | ...more)].',
			optional: true,
			parse: String,
		},
		include: {
			kind: "parsed",
			brief:
				'Rules evaluated with an OR logical operator. A user needs to meet only one of the Include rules. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"group": {...}} | {"any_valid_service_token": {...}} | {"auth_context": {...}} | ...more)].',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name of the Access policy.",
			optional: true,
			parse: String,
		},
		"policy-resolution-account-id": {
			kind: "parsed",
			brief:
				"The account ID used to resolve policy resources and identity for cross-account WARP authentication. The account must be trusted by the account that owns this policy.",
			optional: true,
			parse: String,
		},
		require: {
			kind: "parsed",
			brief:
				'Rules evaluated with an AND logical operator. To match the policy, a user must meet all of the Require rules. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"group": {...}} | {"any_valid_service_token": {...}} | {"auth_context": {...}} | ...more)].',
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
			brief: "The UUID of the policy",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <policy-id>",
	describe: "Update an Access reusable policy",
	usage:
		"$0 zero-trust access policies update <policy-id>\n\nUpdates a Access reusable policy.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
