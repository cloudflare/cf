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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/email-security.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-security investigate bulk create\n\nCreates a new bulk action job to move or release messages that match the provided search parameters. To move or release an explicit list of known messages instead of a search, use the move or release endpoints."
		)
		.option("action", {
			type: "string",
			description: "The action field",
			choices: ["MOVE", "RELEASE"],
		})
		.option("comment", { type: "string", description: "The comment field" })
		.option("search-params-action-log", {
			type: "boolean",
			description:
				"Deprecated, use `GET /investigate/{investigate_id}/action_log` instead. End of life: November 1, 2026.",
			default: false,
		})
		.option("search-params-alert-id", {
			type: "string",
			description: "The search_params.alert_id field",
		})
		.option("search-params-detections-only", {
			type: "boolean",
			description: "The search_params.detections_only field",
			default: true,
		})
		.option("search-params-domain", {
			type: "string",
			description: "The search_params.domain field",
		})
		.option("search-params-end", {
			type: "string",
			description: "End of search date range.",
		})
		.option("search-params-exact-subject", {
			type: "string",
			description: "The search_params.exact_subject field",
		})
		.option("search-params-message-action", {
			type: "string",
			description: "The search_params.message_action field",
			choices: ["PREVIEW", "QUARANTINE_RELEASED", "MOVED"],
		})
		.option("search-params-message-id", {
			type: "string",
			description: "The search_params.message_id field",
		})
		.option("search-params-metric", {
			type: "string",
			description: "The search_params.metric field",
		})
		.option("search-params-query", {
			type: "string",
			description: "The search_params.query field",
		})
		.option("search-params-recipient", {
			type: "string",
			description: "The search_params.recipient field",
		})
		.option("search-params-sender", {
			type: "string",
			description: "The search_params.sender field",
		})
		.option("search-params-smtp-helo-ip", {
			type: "string",
			description:
				"Matches messages whose SMTP HELO server IP address equals this value.",
		})
		.option("search-params-start", {
			type: "string",
			description: "Beginning of search date range.",
		})
		.option("search-params-subject", {
			type: "string",
			description: "The search_params.subject field",
		})
		.option("search-params-submissions", {
			type: "boolean",
			description: "The search_params.submissions field",
			default: false,
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

type Request = SdkRequest<"email_security_create_bulk_job">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a bulk action job",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security investigate bulk create",
				classification: {
					safeFlags: [
						"action",
						"search-params-action-log",
						"search-params-detections-only",
						"search-params-message-action",
						"search-params-submissions",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security investigate bulk create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/investigate/bulk`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										action: resolveFileToken(
											argv["action"] as string | undefined,
											"action",
											"text"
										),
										comment: resolveFileToken(
											argv["comment"] as string | undefined,
											"comment",
											"text"
										),
										search_params: {
											action_log: argv["search-params-action-log"],
											alert_id: resolveFileToken(
												argv["search-params-alert-id"] as string | undefined,
												"search-params-alert-id",
												"text"
											),
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
											message_action: resolveFileToken(
												argv["search-params-message-action"] as
													| string
													| undefined,
												"search-params-message-action",
												"text"
											),
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.emailSecurity.investigate.bulk.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["action"] === undefined) {
					argv["action"] = await promptForRequiredEnumField(
						"action",
						"The action field",
						["MOVE", "RELEASE"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					action: resolveFileToken(
						argv["action"] as string | undefined,
						"action",
						"text"
					),
					comment: resolveFileToken(
						argv["comment"] as string | undefined,
						"comment",
						"text"
					),
					search_params: {
						action_log: argv["search-params-action-log"],
						alert_id: resolveFileToken(
							argv["search-params-alert-id"] as string | undefined,
							"search-params-alert-id",
							"text"
						),
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
						message_action: resolveFileToken(
							argv["search-params-message-action"] as string | undefined,
							"search-params-message-action",
							"text"
						),
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
					client.emailSecurity.investigate.bulk.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
