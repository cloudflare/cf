import operation from "../../_operations/queues/consumers/create.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "queues consumers create",
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						queue_id: argv["queue-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
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
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					queue_id: argv["queue-id"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
