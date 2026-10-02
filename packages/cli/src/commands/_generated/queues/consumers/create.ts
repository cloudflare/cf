import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/queues.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 queues consumers create <queue-id>\n\nCreates a consumer for a Queue."
		)
		.positional("queue-id", {
			type: "string",
			description: "A Resource identifier.",
			demandOption: true,
		})
		.option("dead-letter-queue", {
			type: "string",
			description: "The dead_letter_queue field",
		})
		.option("script-name", { type: "string", description: "Name of a Worker" })
		.option("settings-batch-size", {
			type: "number",
			description: "The maximum number of messages to include in a batch.",
		})
		.option("settings-max-concurrency", {
			type: "number",
			description:
				"Maximum number of concurrent consumers that may consume from this Queue. Set to `null` to automatically opt in to the platform's maximum (recommended).",
		})
		.option("settings-max-retries", {
			type: "number",
			description: "The maximum number of retries",
		})
		.option("settings-max-wait-time-ms", {
			type: "number",
			description:
				"The number of milliseconds to wait for a batch to fill up before attempting to deliver it",
		})
		.option("settings-retry-delay", {
			type: "number",
			description:
				"The number of seconds to delay before making the message available for another attempt.",
		})
		.option("settings-visibility-timeout-ms", {
			type: "number",
			description:
				"The number of milliseconds that a message is exclusively leased. After the timeout, the message becomes available for another attempt.",
		})
		.option("type", {
			type: "string",
			description: "The type field",
			choices: ["worker", "http_pull"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Request body for creating or updating a consumer",
		})
		.conflicts("script-name", ["settings-visibility-timeout-ms"])
		.conflicts("settings-max-concurrency", ["settings-visibility-timeout-ms"])
		.conflicts("settings-max-wait-time-ms", ["settings-visibility-timeout-ms"])
		.conflicts("settings-visibility-timeout-ms", [
			"script-name",
			"settings-max-concurrency",
			"settings-max-wait-time-ms",
		]);
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"queues-create-consumer">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <queue-id>",
	describe: "Create a Queue Consumer",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "queues consumers create",
				classification: {
					safeFlags: ["type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf queues consumers create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/queues/${argv["queue-id"] == null ? "<queue-id>" : encodeURIComponent(String(argv["queue-id"]))}/consumers`,
						pathParams: { "queue-id": String(argv["queue-id"] ?? "") },
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
										type: resolveFileToken(
											argv["type"] as string | undefined,
											"type",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.queues.consumers.create({
							body: bodyData,
							account_id: accountId,
							queue_id: argv["queue-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					type: resolveFileToken(
						argv["type"] as string | undefined,
						"type",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.queues.consumers.create({
						body: bodyData,
						account_id: accountId,
						queue_id: argv["queue-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
