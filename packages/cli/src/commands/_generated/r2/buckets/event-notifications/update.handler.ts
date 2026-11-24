import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseObjectArray,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "r2 buckets event-notifications update",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const headers: Record<string, string> = {};
			if (argv["cf-r2-jurisdiction"] !== undefined)
				headers["cf-r2-jurisdiction"] = String(argv["cf-r2-jurisdiction"]);
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["rules"] === undefined) {
					throw new Error(
						"--rules is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf r2 buckets event-notifications update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/event_notifications/r2/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/configuration/queues/${argv["queue-id"] == null ? "<queue-id>" : encodeURIComponent(String(argv["queue-id"]))}`,
					pathParams: {
						"bucket-name": String(argv["bucket-name"] ?? ""),
						"queue-id": String(argv["queue-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									rules: parseObjectArray(argv["rules"], "rules"),
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
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/event_notifications/r2/${encodeURIComponent(String(argv["bucket-name"]))}/configuration/queues/${encodeURIComponent(String(argv["queue-id"]))}`,
						{
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["rules"] !== undefined)
				setNestedValue(
					bodyData,
					["rules"],
					parseObjectArray(argv["rules"], "rules")
				);
			const result = await withProgress(`Updating`, async () =>
				requestApi<unknown>(
					client,
					"PUT",
					`/accounts/${accountId}/event_notifications/r2/${encodeURIComponent(String(argv["bucket-name"]))}/configuration/queues/${encodeURIComponent(String(argv["queue-id"]))}`,
					{
						body: bodyData,
						headers: Object.keys(headers).length > 0 ? headers : undefined,
					}
				)
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
