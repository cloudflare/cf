import operation from "../../../../_operations/zero-trust/dlp/email/rules/update.js";
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
	command: "update <rule-id>",
	describe: "Update email scanner rule",
	usage:
		"$0 zero-trust dlp email rules update <rule-id>\n\nUpdates a DLP email scanning rule.",
	flags: {
		"action-action": {
			kind: "parsed",
			brief: "The action.action field",
			optional: true,
			choices: ["Block"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "action-action", "text"),
		},
		"action-message": {
			kind: "parsed",
			brief: "The action.message field",
			optional: true,
			parse: String,
		},
		conditions: {
			kind: "parsed",
			brief:
				'Triggered if all conditions match. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"operator": "InList" | "NotInList" | "MatchRegex" | ...more, "selector": "Recipients" | "Sender" | "DLPProfiles", "value": ([string] | string)}].',
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		name: {
			kind: "parsed",
			brief: "The name field",
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
			brief: "Rule description.",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "rule-id", brief: "Rule ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp email rules update",
				classification: {
					safeFlags: ["action-action", "enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["action-action"] === undefined) {
						argv["action-action"] = await promptForRequiredEnumField(
							"action-action",
							"The action.action field",
							["Block"] as const
						);
					}
					if (argv["conditions"] === undefined) {
						throw new Error(
							"--conditions is required (or pass --body with this field set)."
						);
					}
					if (argv["enabled"] === undefined) {
						throw new Error(
							"--enabled is required (or pass --body with this field set)."
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"The name field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp email rules update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/email/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
						pathParams: { "rule-id": String(argv["rule-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										action: {
											action: argv["action-action"],
											message: resolveFileToken(
												argv["action-message"] as string | undefined,
												"action-message",
												"text"
											),
										},
										conditions: parseObjectArray(
											argv["conditions"],
											"conditions"
										),
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										enabled: argv["enabled"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
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
							rule_id: argv["rule-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					action: {
						action: argv["action-action"],
						message: resolveFileToken(
							argv["action-message"] as string | undefined,
							"action-message",
							"text"
						),
					},
					conditions: parseObjectArray(argv["conditions"], "conditions"),
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enabled: argv["enabled"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						rule_id: argv["rule-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
