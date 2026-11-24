import operation from "../../_operations/billing/usage/query.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./query.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "billing usage query",
			classification: {
				safeFlags: ["granularity", "metric", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf billing usage query",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/billable/usage`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									FilterBy: {
										BillableMetricIds: argv["filter-by-billable-metric-ids"],
										ProductFamilyIds: argv["filter-by-product-family-ids"],
										Tags: parseObjectArray(
											argv["filter-by-tags"],
											"filter-by-tags"
										),
									},
									Granularity: argv["granularity"],
									GroupBy: parseObjectArray(argv["group-by"], "group-by"),
									Metric: argv["metric"],
									TimePeriod: {
										From: resolveFileToken(
											argv["time-period-from"] as string | undefined,
											"time-period-from",
											"text"
										),
										To: resolveFileToken(
											argv["time-period-to"] as string | undefined,
											"time-period-to",
											"text"
										),
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
				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Loaded` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				FilterBy: {
					BillableMetricIds: argv["filter-by-billable-metric-ids"],
					ProductFamilyIds: argv["filter-by-product-family-ids"],
					Tags: parseObjectArray(argv["filter-by-tags"], "filter-by-tags"),
				},
				Granularity: argv["granularity"],
				GroupBy: parseObjectArray(argv["group-by"], "group-by"),
				Metric: argv["metric"],
				TimePeriod: {
					From: resolveFileToken(
						argv["time-period-from"] as string | undefined,
						"time-period-from",
						"text"
					),
					To: resolveFileToken(
						argv["time-period-to"] as string | undefined,
						"time-period-to",
						"text"
					),
				},
			});
			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
