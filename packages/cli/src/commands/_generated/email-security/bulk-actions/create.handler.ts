import operation from "../../_operations/email-security/bulk-actions/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "email-security bulk-actions create",
			classification: {
				safeFlags: [
					"action",
					"destination",
					"expected-disposition",
					"search-params-action-log",
					"search-params-delivery-status",
					"search-params-detections-only",
					"search-params-final-disposition",
					"search-params-message-action",
					"search-params-submissions",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["action"] === undefined) {
					argv["action"] = await promptForRequiredEnumField(
						"action",
						"The action the job performs on every message matching the search parameters.",
						["MOVE", "RELEASE"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf email-security bulk-actions create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/investigate/bulk`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									action: argv["action"],
									comment: resolveFileToken(
										argv["comment"] as string | undefined,
										"comment",
										"text"
									),
									destination: argv["destination"],
									expected_disposition: argv["expected-disposition"],
									search_params: {
										action_log: argv["search-params-action-log"],
										alert_id: resolveFileToken(
											argv["search-params-alert-id"] as string | undefined,
											"search-params-alert-id",
											"text"
										),
										delivery_status: argv["search-params-delivery-status"],
										detections_only: argv["search-params-detections-only"],
										domain: resolveFileToken(
											argv["search-params-domain"] as string | undefined,
											"search-params-domain",
											"text"
										),
										end: resolveFileToken(
											argv["search-params-end"] as string | undefined,
											"search-params-end",
											"text"
										),
										exact_subject: resolveFileToken(
											argv["search-params-exact-subject"] as string | undefined,
											"search-params-exact-subject",
											"text"
										),
										final_disposition: argv["search-params-final-disposition"],
										message_action: argv["search-params-message-action"],
										message_id: resolveFileToken(
											argv["search-params-message-id"] as string | undefined,
											"search-params-message-id",
											"text"
										),
										metric: resolveFileToken(
											argv["search-params-metric"] as string | undefined,
											"search-params-metric",
											"text"
										),
										query: resolveFileToken(
											argv["search-params-query"] as string | undefined,
											"search-params-query",
											"text"
										),
										recipient: resolveFileToken(
											argv["search-params-recipient"] as string | undefined,
											"search-params-recipient",
											"text"
										),
										sender: resolveFileToken(
											argv["search-params-sender"] as string | undefined,
											"search-params-sender",
											"text"
										),
										smtp_helo_ip: resolveFileToken(
											argv["search-params-smtp-helo-ip"] as string | undefined,
											"search-params-smtp-helo-ip",
											"text"
										),
										start: resolveFileToken(
											argv["search-params-start"] as string | undefined,
											"search-params-start",
											"text"
										),
										subject: resolveFileToken(
											argv["search-params-subject"] as string | undefined,
											"search-params-subject",
											"text"
										),
										submissions: argv["search-params-submissions"],
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
				comment: resolveFileToken(
					argv["comment"] as string | undefined,
					"comment",
					"text"
				),
				destination: argv["destination"],
				expected_disposition: argv["expected-disposition"],
				search_params: {
					action_log: argv["search-params-action-log"],
					alert_id: resolveFileToken(
						argv["search-params-alert-id"] as string | undefined,
						"search-params-alert-id",
						"text"
					),
					delivery_status: argv["search-params-delivery-status"],
					detections_only: argv["search-params-detections-only"],
					domain: resolveFileToken(
						argv["search-params-domain"] as string | undefined,
						"search-params-domain",
						"text"
					),
					end: resolveFileToken(
						argv["search-params-end"] as string | undefined,
						"search-params-end",
						"text"
					),
					exact_subject: resolveFileToken(
						argv["search-params-exact-subject"] as string | undefined,
						"search-params-exact-subject",
						"text"
					),
					final_disposition: argv["search-params-final-disposition"],
					message_action: argv["search-params-message-action"],
					message_id: resolveFileToken(
						argv["search-params-message-id"] as string | undefined,
						"search-params-message-id",
						"text"
					),
					metric: resolveFileToken(
						argv["search-params-metric"] as string | undefined,
						"search-params-metric",
						"text"
					),
					query: resolveFileToken(
						argv["search-params-query"] as string | undefined,
						"search-params-query",
						"text"
					),
					recipient: resolveFileToken(
						argv["search-params-recipient"] as string | undefined,
						"search-params-recipient",
						"text"
					),
					sender: resolveFileToken(
						argv["search-params-sender"] as string | undefined,
						"search-params-sender",
						"text"
					),
					smtp_helo_ip: resolveFileToken(
						argv["search-params-smtp-helo-ip"] as string | undefined,
						"search-params-smtp-helo-ip",
						"text"
					),
					start: resolveFileToken(
						argv["search-params-start"] as string | undefined,
						"search-params-start",
						"text"
					),
					subject: resolveFileToken(
						argv["search-params-subject"] as string | undefined,
						"search-params-subject",
						"text"
					),
					submissions: argv["search-params-submissions"],
				},
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
