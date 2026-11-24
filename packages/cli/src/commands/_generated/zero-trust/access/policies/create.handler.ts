import operation from "../../../_operations/zero-trust/access/policies/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust access policies create",
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
					command: "cf zero-trust access policies create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/policies`,
					pathParams: {},
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
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
				purpose_justification_required: argv["purpose-justification-required"],
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
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
