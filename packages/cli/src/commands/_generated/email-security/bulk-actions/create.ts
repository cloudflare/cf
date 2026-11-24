import operation from "../../_operations/email-security/bulk-actions/create.js";
/**
 * create command
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
	command: "create",
	describe: "Create a bulk action job",
	usage:
		"$0 email-security bulk-actions create\n\nCreates a new bulk action job to move or release messages that match the provided search parameters. To move or release an explicit list of known messages instead of a search, use the move or release endpoints.",
	flags: {
		action: {
			kind: "parsed",
			brief:
				"The action the job performs on every message matching the search parameters.",
			optional: true,
			choices: ["MOVE", "RELEASE"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
		},
		comment: {
			kind: "parsed",
			brief: "Optional note describing the job.",
			optional: true,
			parse: String,
		},
		destination: {
			kind: "parsed",
			brief: "Required when action is 'MOVE'.",
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
		"search-params-action-log": {
			kind: "boolean",
			brief:
				"Deprecated, use `GET /investigate/{investigate_id}/action_log` instead. End of life: November 1, 2026.",
			default: false,
		},
		"search-params-alert-id": {
			kind: "parsed",
			brief: "Alert ID of the detection to filter by.",
			optional: true,
			parse: String,
		},
		"search-params-delivery-status": {
			kind: "parsed",
			brief: "Delivery status to filter by.",
			optional: true,
			choices: [
				"delivered",
				"moved",
				"quarantined",
				"rejected",
				"deferred",
				"bounced",
				"queued",
				"move_failed",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "search-params-delivery-status", "text"),
		},
		"search-params-detections-only": {
			kind: "boolean",
			brief: "Whether to include only detections in search results.",
			default: true,
		},
		"search-params-domain": {
			kind: "parsed",
			brief:
				"Match messages that mention this domain — sender domain, recipient domain, or a domain in a link.",
			optional: true,
			parse: String,
		},
		"search-params-end": {
			kind: "parsed",
			brief: "End of search date range.",
			optional: true,
			parse: String,
		},
		"search-params-exact-subject": {
			kind: "parsed",
			brief: "Match messages whose subject line equals this value exactly.",
			optional: true,
			parse: String,
		},
		"search-params-final-disposition": {
			kind: "parsed",
			brief: "Dispositions to filter by.",
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
				resolveFileToken(value, "search-params-final-disposition", "text"),
		},
		"search-params-message-action": {
			kind: "parsed",
			brief: "Message actions to filter by.",
			optional: true,
			choices: ["PREVIEW", "QUARANTINE_RELEASED", "MOVED"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "search-params-message-action", "text"),
		},
		"search-params-message-id": {
			kind: "parsed",
			brief: "Message-ID header value to filter by.",
			optional: true,
			parse: String,
		},
		"search-params-metric": {
			kind: "parsed",
			brief: "Metric name to filter the search by.",
			optional: true,
			parse: String,
		},
		"search-params-query": {
			kind: "parsed",
			brief: "Space-delimited search term. Case-insensitive.",
			optional: true,
			parse: String,
		},
		"search-params-recipient": {
			kind: "parsed",
			brief: "Match messages whose recipient is this email address or domain.",
			optional: true,
			parse: String,
		},
		"search-params-sender": {
			kind: "parsed",
			brief: "Match messages whose sender is this email address or domain.",
			optional: true,
			parse: String,
		},
		"search-params-smtp-helo-ip": {
			kind: "parsed",
			brief:
				"Matches messages whose SMTP HELO server IP address equals this value.",
			optional: true,
			parse: String,
		},
		"search-params-start": {
			kind: "parsed",
			brief: "Beginning of search date range.",
			optional: true,
			parse: String,
		},
		"search-params-subject": {
			kind: "parsed",
			brief:
				"Match messages whose subject contains these keywords, in any order.",
			optional: true,
			parse: String,
		},
		"search-params-submissions": {
			kind: "boolean",
			brief:
				"Whether to search reclassification submissions instead of original messages.",
			default: false,
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
												argv["search-params-exact-subject"] as
													| string
													| undefined,
												"search-params-exact-subject",
												"text"
											),
											final_disposition:
												argv["search-params-final-disposition"],
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
												argv["search-params-smtp-helo-ip"] as
													| string
													| undefined,
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
		),
});

export default command;
