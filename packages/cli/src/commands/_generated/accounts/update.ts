import operation from "../_operations/accounts/update.js";
/**
 * update command
 * @generated from apis/overlays/accounts.ts
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
	command: "update",
	describe: "Update Account",
	usage:
		"$0 accounts update\n\nUpdate an existing account. Account names are limited to 65 UTF-8 bytes.",
	flags: {
		id: { kind: "parsed", brief: "Identifier", optional: true, parse: String },
		name: {
			kind: "parsed",
			brief:
				"Account name. When creating or updating an account, the name is limited to 65 UTF-8 bytes.",
			optional: true,
			parse: String,
		},
		"settings-abuse-contact-email": {
			kind: "parsed",
			brief: "Sets an abuse contact email to notify for abuse reports.",
			optional: true,
			parse: String,
		},
		"settings-enforce-twofactor": {
			kind: "boolean",
			brief:
				"Indicates whether membership in this account requires that\nTwo-Factor Authentication is enabled",
			optional: true,
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts update",
				classification: {
					safeFlags: ["settings-enforce-twofactor", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["id"] === undefined) {
						argv["id"] = await promptForRequiredField("id", "Identifier");
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Account name. When creating or updating an account, the name is limited to 65 UTF-8 bytes."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										id: resolveFileToken(
											argv["id"] as string | undefined,
											"id",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										settings: {
											abuse_contact_email: resolveFileToken(
												argv["settings-abuse-contact-email"] as
													| string
													| undefined,
												"settings-abuse-contact-email",
												"text"
											),
											enforce_twofactor: argv["settings-enforce-twofactor"],
										},
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					id: resolveFileToken(argv["id"] as string | undefined, "id", "text"),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					settings: {
						abuse_contact_email: resolveFileToken(
							argv["settings-abuse-contact-email"] as string | undefined,
							"settings-abuse-contact-email",
							"text"
						),
						enforce_twofactor: argv["settings-enforce-twofactor"],
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
