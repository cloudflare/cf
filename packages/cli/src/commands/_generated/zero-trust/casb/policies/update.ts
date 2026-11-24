import operation from "../../../_operations/zero-trust/casb/policies/update.js";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <policy-id>",
	describe: "Update a policy configuration",
	usage:
		"$0 zero-trust casb policies update <policy-id>\n\nUpdates an existing policy configuration and replaces its actions.",
	flags: {
		"actions-remediation-types": {
			kind: "parsed",
			brief:
				'Remediation actions to execute (at most one). Provide as a JSON array of objects or @path/to/file.json. Shape: [{"remediation_type_id": string}].',
			optional: true,
			parse: String,
		},
		"actions-webhook-configs": {
			kind: "parsed",
			brief:
				'Webhook actions to execute. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"webhook_config_id": string}].',
			optional: true,
			parse: String,
		},
		"applies-to-all-integrations": {
			kind: "boolean",
			brief:
				"When true, the policy applies to all integrations for the account. When false, integration_ids must be provided.",
			optional: true,
		},
		description: {
			kind: "parsed",
			brief: "Optional description of what this policy does.",
			optional: true,
			parse: String,
		},
		"display-name": {
			kind: "parsed",
			brief: "Display name for the policy configuration.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Boolean specifying if the policy is enabled or disabled.",
			optional: true,
		},
		"integration-ids": {
			kind: "parsed",
			brief:
				"The integrations this policy applies to. Required when applies_to_all_integrations is false.",
			variadic: true,
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
			brief: "Request body for updating an existing policy configuration.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "policy-id",
			brief: "Policy configuration ID",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb policies update",
				classification: {
					safeFlags: ["applies-to-all-integrations", "enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["applies-to-all-integrations"] === undefined) {
						throw new Error(
							"--applies-to-all-integrations is required (or pass --body with this field set)."
						);
					}
					if (argv["display-name"] === undefined) {
						argv["display-name"] = await promptForRequiredField(
							"display-name",
							"Display name for the policy configuration."
						);
					}
					if (argv["enabled"] === undefined) {
						throw new Error(
							"--enabled is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb policies update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/policies/${argv["policy-id"] == null ? "<policy-id>" : encodeURIComponent(String(argv["policy-id"]))}`,
						pathParams: { "policy-id": String(argv["policy-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										actions: {
											remediation_types: parseObjectArray(
												argv["actions-remediation-types"],
												"actions-remediation-types"
											),
											webhook_configs: parseObjectArray(
												argv["actions-webhook-configs"],
												"actions-webhook-configs"
											),
										},
										applies_to_all_integrations:
											argv["applies-to-all-integrations"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										display_name: resolveFileToken(
											argv["display-name"] as string | undefined,
											"display-name",
											"text"
										),
										enabled: argv["enabled"],
										integration_ids: argv["integration-ids"],
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
					actions: {
						remediation_types: parseObjectArray(
							argv["actions-remediation-types"],
							"actions-remediation-types"
						),
						webhook_configs: parseObjectArray(
							argv["actions-webhook-configs"],
							"actions-webhook-configs"
						),
					},
					applies_to_all_integrations: argv["applies-to-all-integrations"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					display_name: resolveFileToken(
						argv["display-name"] as string | undefined,
						"display-name",
						"text"
					),
					enabled: argv["enabled"],
					integration_ids: argv["integration-ids"],
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
