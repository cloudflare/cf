import operation from "../../../_operations/zero-trust/access/policies/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust access policies update <policy-id>\n\nUpdates a Access reusable policy."
		)
		.positional("policy-id", {
			type: "string",
			description: "The UUID of the policy",
			demandOption: true,
		})
		.option("approval-groups", {
			type: "string",
			description:
				"Administrators who can approve a temporary authentication request. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("approval-required", {
			type: "boolean",
			description:
				"Requires the user to request access from an administrator at the start of each session.",
		})
		.option("connection-rules-rdp-allowed-clipboard-local-to-remote-formats", {
			type: "string",
			array: true,
			description:
				"Clipboard formats allowed when copying from local machine to remote RDP session.",
		})
		.option("connection-rules-rdp-allowed-clipboard-remote-to-local-formats", {
			type: "string",
			array: true,
			description:
				"Clipboard formats allowed when copying from remote RDP session to local machine.",
		})
		.option("isolation-required", {
			type: "boolean",
			description:
				"Require this application to be served in an isolated browser for users matching this policy. 'Client Web Isolation' must be on for the account in order to use this feature.",
		})
		.option("mfa-config-allowed-authenticators", {
			type: "string",
			array: true,
			description: "Lists the MFA methods that users can authenticate with.",
		})
		.option("mfa-config-mfa-disabled", {
			type: "boolean",
			description:
				"Indicates whether to disable MFA for this resource. This option is available at the application and policy level.",
		})
		.option("mfa-config-session-duration", {
			type: "string",
			description:
				"Defines the duration of an MFA session. Must be in minutes (m) or hours (h). Minimum: 0m. Maximum: 720h (30 days). Examples:`5m` or `24h`.",
		})
		.option("purpose-justification-prompt", {
			type: "string",
			description:
				"A custom message that will appear on the purpose justification screen.",
		})
		.option("purpose-justification-required", {
			type: "boolean",
			description:
				"Require users to enter a justification when they log in to the application.",
		})
		.option("session-duration", {
			type: "string",
			description:
				"The amount of time that tokens issued for the application will be valid. Must be in the format `300ms` or `2h45m`. Valid time units are: ns, us (or µs), ms, s, m, h.",
		})
		.option("decision", {
			type: "string",
			description:
				"The action Access will take if a user matches this policy. Infrastructure application policies can only use the Allow action.",
			choices: ["allow", "deny", "non_identity", "bypass"],
		})
		.coerce("decision", (value) => resolveFileToken(value, "decision", "text"))
		.option("exclude", {
			type: "string",
			description:
				"Rules evaluated with a NOT logical operator. To match the policy, a user cannot meet any of the Exclude rules. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("include", {
			type: "string",
			description:
				"Rules evaluated with an OR logical operator. A user needs to meet only one of the Include rules. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("name", {
			type: "string",
			description: "The name of the Access policy.",
		})
		.option("require", {
			type: "string",
			description:
				"Rules evaluated with an AND logical operator. To match the policy, a user must meet all of the Require rules. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <policy-id>",
	describe: "Update an Access reusable policy",
	builder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
										require: parseObjectArray(argv["require"], "require"),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
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
};

export default command;
