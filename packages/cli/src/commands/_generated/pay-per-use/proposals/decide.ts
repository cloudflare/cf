import operation from "../../_operations/pay-per-use/proposals/decide.js";
/**
 * decide command
 * @generated from apis/overlays/pay-per-use.ts
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
	command: "decide",
	describe: "Decide a pay-per-use price proposal",
	usage:
		"$0 pay-per-use proposals decide\n\nAccepts or rejects the pending pay-per-use price proposal identified by price_id in the request body. Acceptance requires an enabled operator with a verified name, an enabled publisher zone, and matching billing classifications; rejection remains available for cleanup.",
	flags: {
		action: {
			kind: "parsed",
			brief: "The action field",
			optional: true,
			choices: ["accept", "reject"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
		},
		"price-id": {
			kind: "parsed",
			brief:
				"Pending pay-per-use price id returned in the operator proposal queue.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Pay-per-use operator proposal decision",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pay-per-use proposals decide",
				classification: {
					safeFlags: ["action", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["action"] === undefined) {
						argv["action"] = await promptForRequiredEnumField(
							"action",
							"The action field",
							["accept", "reject"] as const
						);
					}
					if (argv["price-id"] === undefined) {
						throw new Error(
							"--price-id is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pay-per-use proposals decide",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pay-per-use/proposals`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										action: argv["action"],
										price_id: argv["price-id"],
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
					action: argv["action"],
					price_id: argv["price-id"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
