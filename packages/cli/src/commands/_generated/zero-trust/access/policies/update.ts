import operation from "../../../_operations/zero-trust/access/policies/update.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <policy-id>",
	describe: "Update an Access reusable policy",
	usage:
		"$0 zero-trust access policies update <policy-id>\n\nUpdates a Access reusable policy.",
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access policies update",
				classification: {
					safeFlags: [
						"approval-required",
						"isolation-required",
						"mfa-config-mfa-disabled",
						"purpose-justification-required",
						"decision",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["decision"] === undefined) {
						argv["decision"] = await promptForRequiredEnumField(
							"decision",
							"The action Access will take if a user matches this policy. Infrastructure application policies can only use the Allow action.",
							["allow", "deny", "non_identity", "bypass"] as const
						);
					}
					if (argv["include"] === undefined) {
						throw new Error(
							"--include is required (or pass --body with this field set)."
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"The name of the Access policy."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access policies update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/policies/${argv["policy-id"] == null ? "<policy-id>" : encodeURIComponent(String(argv["policy-id"]))}`,
						pathParams: { "policy-id": String(argv["policy-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										approval_groups: parseObjectArray(
											argv["approval-groups"],
											"approval-groups"
										),
										approval_required: argv["approval-required"],
										connection_rules: {
											rdp: {
												allowed_clipboard_local_to_remote_formats:
													argv[
														"connection-rules-rdp-allowed-clipboard-local-to-remote-formats"
													],
												allowed_clipboard_remote_to_local_formats:
													argv[
														"connection-rules-rdp-allowed-clipboard-remote-to-local-formats"
													],
											},
										},
										isolation_required: argv["isolation-required"],
										mfa_config: {
											allowed_authenticators:
												argv["mfa-config-allowed-authenticators"],
											mfa_disabled: argv["mfa-config-mfa-disabled"],
											session_duration: resolveFileToken(
												argv["mfa-config-session-duration"] as
													| string
													| undefined,
												"mfa-config-session-duration",
												"text"
											),
										},
										purpose_justification_prompt: resolveFileToken(
											argv["purpose-justification-prompt"] as
												| string
												| undefined,
											"purpose-justification-prompt",
											"text"
										),
										purpose_justification_required:
											argv["purpose-justification-required"],
										session_duration: resolveFileToken(
											argv["session-duration"] as string | undefined,
											"session-duration",
											"text"
										),
										decision: argv["decision"],
										exclude: parseObjectArray(argv["exclude"], "exclude"),
										include: parseObjectArray(argv["include"], "include"),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										policy_resolution_account_id: resolveFileToken(
											argv["policy-resolution-account-id"] as
												| string
												| undefined,
											"policy-resolution-account-id",
											"text"
										),
										require: parseObjectArray(argv["require"], "require"),
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							policy_id: argv["policy-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					approval_groups: parseObjectArray(
						argv["approval-groups"],
						"approval-groups"
					),
					approval_required: argv["approval-required"],
					connection_rules: {
						rdp: {
							allowed_clipboard_local_to_remote_formats:
								argv[
									"connection-rules-rdp-allowed-clipboard-local-to-remote-formats"
								],
							allowed_clipboard_remote_to_local_formats:
								argv[
									"connection-rules-rdp-allowed-clipboard-remote-to-local-formats"
								],
						},
					},
					isolation_required: argv["isolation-required"],
					mfa_config: {
						allowed_authenticators: argv["mfa-config-allowed-authenticators"],
						mfa_disabled: argv["mfa-config-mfa-disabled"],
						session_duration: resolveFileToken(
							argv["mfa-config-session-duration"] as string | undefined,
							"mfa-config-session-duration",
							"text"
						),
					},
					purpose_justification_prompt: resolveFileToken(
						argv["purpose-justification-prompt"] as string | undefined,
						"purpose-justification-prompt",
						"text"
					),
					purpose_justification_required:
						argv["purpose-justification-required"],
					session_duration: resolveFileToken(
						argv["session-duration"] as string | undefined,
						"session-duration",
						"text"
					),
					decision: argv["decision"],
					exclude: parseObjectArray(argv["exclude"], "exclude"),
					include: parseObjectArray(argv["include"], "include"),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					policy_resolution_account_id: resolveFileToken(
						argv["policy-resolution-account-id"] as string | undefined,
						"policy-resolution-account-id",
						"text"
					),
					require: parseObjectArray(argv["require"], "require"),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						policy_id: argv["policy-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
