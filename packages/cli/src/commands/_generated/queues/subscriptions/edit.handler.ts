import operation from "../../_operations/queues/subscriptions/edit.js";
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
			command: "queues subscriptions edit",
			classification: {
				safeFlags: ["destination-type", "enabled", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf queues subscriptions edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/event_subscriptions/subscriptions/${argv["subscription-id"] == null ? "<subscription-id>" : encodeURIComponent(String(argv["subscription-id"]))}`,
					pathParams: {
						"subscription-id": String(argv["subscription-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									destination: {
										queue_id: resolveFileToken(
											argv["destination-queue-id"] as string | undefined,
											"destination-queue-id",
											"text"
										),
										type: argv["destination-type"],
									},
									enabled: argv["enabled"],
									events: argv["events"],
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
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
						subscription_id: argv["subscription-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				destination: {
					queue_id: resolveFileToken(
						argv["destination-queue-id"] as string | undefined,
						"destination-queue-id",
						"text"
					),
					type: argv["destination-type"],
				},
				enabled: argv["enabled"],
				events: argv["events"],
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					subscription_id: argv["subscription-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
