import operation from "../../_operations/queues/consumers/update.js";
/**
 * update command
 * @generated from apis/overlays/queues.ts
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <consumer-id>",
	describe: "Update Queue Consumer",
	usage:
		"$0 queues consumers update <consumer-id>\n\nReplaces a Queue consumer, or creates it if it does not exist.",
	flags: {
		"queue-id": {
			kind: "parsed",
			brief: "A Resource identifier.",
			parse: String,
		},
		"dead-letter-queue": {
			kind: "parsed",
			brief: "The dead_letter_queue field",
			optional: true,
			parse: String,
		},
		"script-name": {
			kind: "parsed",
			brief: "Name of a Worker",
			optional: true,
			parse: String,
		},
		"settings-batch-size": {
			kind: "parsed",
			brief: "The maximum number of messages to include in a batch.",
			optional: true,
			parse: Number,
		},
		"settings-max-concurrency": {
			kind: "parsed",
			brief:
				"Maximum number of concurrent consumers that may consume from this Queue. Set to `null` to automatically opt in to the platform's maximum (recommended).",
			optional: true,
			parse: Number,
		},
		"settings-max-retries": {
			kind: "parsed",
			brief: "The maximum number of retries",
			optional: true,
			parse: Number,
		},
		"settings-max-wait-time-ms": {
			kind: "parsed",
			brief:
				"The number of milliseconds to wait for a batch to fill up before attempting to deliver it",
			optional: true,
			parse: Number,
		},
		"settings-retry-delay": {
			kind: "parsed",
			brief:
				"The number of seconds to delay before making the message available for another attempt.",
			optional: true,
			parse: Number,
		},
		"settings-visibility-timeout-ms": {
			kind: "parsed",
			brief:
				"The number of milliseconds that a message is exclusively leased. After the timeout, the message becomes available for another attempt.",
			optional: true,
			parse: Number,
		},
		type: {
			kind: "parsed",
			brief: "The type field",
			optional: true,
			choices: ["worker", "http_pull"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Request body for creating or updating a consumer",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "consumer-id",
			brief: "A Resource identifier.",
			parse: String,
		},
	],
	rules(rules) {
		rules.conflicts("script-name", ["settings-visibility-timeout-ms"]);
		rules.conflicts("settings-max-concurrency", [
			"settings-visibility-timeout-ms",
		]);
		rules.implies("settings-max-concurrency", ["script-name"]);
		rules.conflicts("settings-max-wait-time-ms", [
			"settings-visibility-timeout-ms",
		]);
		rules.implies("settings-max-wait-time-ms", ["script-name"]);
		rules.conflicts("settings-visibility-timeout-ms", [
			"script-name",
			"settings-max-concurrency",
			"settings-max-wait-time-ms",
		]);
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "queues consumers update",
				classification: {
					safeFlags: ["type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["type"] === undefined) {
						argv["type"] = await promptForRequiredEnumField(
							"type",
							"The type field",
							["worker", "http_pull"] as const
						);
					}

					if (argv["type"] === "worker" && argv["script-name"] === undefined) {
						argv["script-name"] = await promptForRequiredField(
							"script-name",
							"Name of a Worker",
							{ question: "Enter value for --script-name" }
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf queues consumers update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/queues/${argv["queue-id"] == null ? "<queue-id>" : encodeURIComponent(String(argv["queue-id"]))}/consumers/${argv["consumer-id"] == null ? "<consumer-id>" : encodeURIComponent(String(argv["consumer-id"]))}`,
						pathParams: {
							"queue-id": String(argv["queue-id"] ?? ""),
							"consumer-id": String(argv["consumer-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										dead_letter_queue: resolveFileToken(
											argv["dead-letter-queue"] as string | undefined,
											"dead-letter-queue",
											"text"
										),
										script_name: resolveFileToken(
											argv["script-name"] as string | undefined,
											"script-name",
											"text"
										),
										settings: {
											batch_size: argv["settings-batch-size"],
											max_concurrency: argv["settings-max-concurrency"],
											max_retries: argv["settings-max-retries"],
											max_wait_time_ms: argv["settings-max-wait-time-ms"],
											retry_delay: argv["settings-retry-delay"],
											visibility_timeout_ms:
												argv["settings-visibility-timeout-ms"],
										},
										type: argv["type"],
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
							queue_id: argv["queue-id"],
							consumer_id: argv["consumer-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					dead_letter_queue: resolveFileToken(
						argv["dead-letter-queue"] as string | undefined,
						"dead-letter-queue",
						"text"
					),
					script_name: resolveFileToken(
						argv["script-name"] as string | undefined,
						"script-name",
						"text"
					),
					settings: {
						batch_size: argv["settings-batch-size"],
						max_concurrency: argv["settings-max-concurrency"],
						max_retries: argv["settings-max-retries"],
						max_wait_time_ms: argv["settings-max-wait-time-ms"],
						retry_delay: argv["settings-retry-delay"],
						visibility_timeout_ms: argv["settings-visibility-timeout-ms"],
					},
					type: argv["type"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						queue_id: argv["queue-id"],
						consumer_id: argv["consumer-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
