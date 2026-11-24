import operation from "../../../_operations/cloudforce-one/threat-signals/feeds/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
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
			command: "cloudforce-one threat-signals feeds update",
			classification: {
				safeFlags: ["category-id", "enabled", "tagging-enabled", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one threat-signals feeds update",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/feeds/${argv["feed-id"] == null ? "<feed-id>" : encodeURIComponent(String(argv["feed-id"]))}`,
					pathParams: { "feed-id": String(argv["feed-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									category_id: argv["category-id"],
									display_name: resolveFileToken(
										argv["display-name"] as string | undefined,
										"display-name",
										"text"
									),
									enabled: argv["enabled"],
									poll_interval_s: argv["poll-interval-s"],
									tagging_enabled: argv["tagging-enabled"],
									title: resolveFileToken(
										argv["title"] as string | undefined,
										"title",
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
						feed_id: argv["feed-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				category_id: argv["category-id"],
				display_name: resolveFileToken(
					argv["display-name"] as string | undefined,
					"display-name",
					"text"
				),
				enabled: argv["enabled"],
				poll_interval_s: argv["poll-interval-s"],
				tagging_enabled: argv["tagging-enabled"],
				title: resolveFileToken(
					argv["title"] as string | undefined,
					"title",
					"text"
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					feed_id: argv["feed-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
