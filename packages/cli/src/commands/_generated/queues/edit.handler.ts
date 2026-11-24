import operation from "../_operations/queues/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "queues edit",
			classification: {
				safeFlags: ["jurisdiction", "settings-delivery-paused", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf queues edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/queues/${argv["queue-id"] == null ? "<queue-id>" : encodeURIComponent(String(argv["queue-id"]))}`,
					pathParams: { "queue-id": String(argv["queue-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									jurisdiction: argv["jurisdiction"],
									queue_name: resolveFileToken(
										argv["queue-name"] as string | undefined,
										"queue-name",
										"text"
									),
									settings: {
										delivery_delay: argv["settings-delivery-delay"],
										delivery_paused: argv["settings-delivery-paused"],
										message_retention_period:
											argv["settings-message-retention-period"],
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
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						queue_id: argv["queue-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				jurisdiction: argv["jurisdiction"],
				queue_name: resolveFileToken(
					argv["queue-name"] as string | undefined,
					"queue-name",
					"text"
				),
				settings: {
					delivery_delay: argv["settings-delivery-delay"],
					delivery_paused: argv["settings-delivery-paused"],
					message_retention_period: argv["settings-message-retention-period"],
				},
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					queue_id: argv["queue-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
