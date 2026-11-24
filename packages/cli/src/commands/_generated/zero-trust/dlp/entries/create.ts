import operation from "../../../_operations/zero-trust/dlp/entries/create.js";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create custom entry",
	usage: "$0 zero-trust dlp entries create\n\nCreates a DLP custom entry.",
	flags: {
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
		"pattern-regex": {
			kind: "parsed",
			brief: "The pattern.regex field",
			optional: true,
			parse: String,
		},
		"pattern-validation": {
			kind: "parsed",
			brief: "The pattern.validation field",
			optional: true,
			choices: ["luhn"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "pattern-validation", "text"),
		},
		"profile-id": {
			kind: "parsed",
			brief: "The profile_id field",
			optional: true,
			parse: String,
		},
		"validator-ids": {
			kind: "parsed",
			brief: "Validators the new entry should reference, by id, at most 10.",
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
			brief: "A new entry to create.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp entries create",
				classification: {
					safeFlags: ["enabled", "pattern-validation", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
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
					if (argv["pattern-regex"] === undefined) {
						argv["pattern-regex"] = await promptForRequiredField(
							"pattern-regex",
							"The pattern.regex field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp entries create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/entries`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
										pattern: {
											regex: resolveFileToken(
												argv["pattern-regex"] as string | undefined,
												"pattern-regex",
												"text"
											),
											validation: argv["pattern-validation"],
										},
										profile_id: resolveFileToken(
											argv["profile-id"] as string | undefined,
											"profile-id",
											"text"
										),
										validator_ids: argv["validator-ids"],
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
					pattern: {
						regex: resolveFileToken(
							argv["pattern-regex"] as string | undefined,
							"pattern-regex",
							"text"
						),
						validation: argv["pattern-validation"],
					},
					profile_id: resolveFileToken(
						argv["profile-id"] as string | undefined,
						"profile-id",
						"text"
					),
					validator_ids: argv["validator-ids"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
