import operation from "../../_operations/email-security/investigate/move.js";
/**
 * move command
 * @generated from apis/overlays/email-security.ts
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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "move",
	describe: "Move messages",
	usage:
		"$0 email-security investigate move\n\nMoves one or more messages to a specified mailbox folder (Inbox, JunkEmail, DeletedItems, RecoverableItemsDeletions, or RecoverableItemsPurges). Requires active integration. Operates on an explicit list of messages; to move all messages matching a search, create a bulk action job instead.",
	flags: {
		destination: {
			kind: "parsed",
			brief: "The mailbox folder to move messages to.",
			optional: true,
			choices: [
				"Inbox",
				"JunkEmail",
				"DeletedItems",
				"RecoverableItemsDeletions",
				"RecoverableItemsPurges",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "destination", "text"),
		},
		"expected-disposition": {
			kind: "parsed",
			brief: "Nonfunctional field. End of life: December 1, 2026.",
			optional: true,
			choices: [
				"MALICIOUS",
				"MALICIOUS-BEC",
				"SUSPICIOUS",
				"SPOOF",
				"SPAM",
				"BULK",
				"ENCRYPTED",
				"EXTERNAL",
				"UNKNOWN",
				"NONE",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "expected-disposition", "text"),
		},
		ids: {
			kind: "parsed",
			brief: "List of message IDs to move.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"postfix-ids": {
			kind: "parsed",
			brief: "Deprecated, use `ids` instead. End of life: November 1, 2026.",
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security investigate move",
				classification: {
					safeFlags: ["destination", "expected-disposition", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["destination"] === undefined) {
						argv["destination"] = await promptForRequiredEnumField(
							"destination",
							"The mailbox folder to move messages to.",
							[
								"Inbox",
								"JunkEmail",
								"DeletedItems",
								"RecoverableItemsDeletions",
								"RecoverableItemsPurges",
							] as const
						);
					}
					if (argv["ids"] === undefined) {
						throw new Error(
							"--ids is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security investigate move",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/investigate/move`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										destination: argv["destination"],
										expected_disposition: argv["expected-disposition"],
										ids: argv["ids"],
										postfix_ids: argv["postfix-ids"],
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
					destination: argv["destination"],
					expected_disposition: argv["expected-disposition"],
					ids: argv["ids"],
					postfix_ids: argv["postfix-ids"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
