import operation from "../../../_operations/cloudforce-one/threat-intel/events/search.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./search.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseNestedArray,
	parseObjectArray,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "cloudforce-one threat-intel events search",
			classification: {
				safeFlags: ["force-refresh", "format", "cache", "order", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				forceRefresh: argv["force-refresh"],
				format: argv["format"],
				cache: argv["cache"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one threat-intel events search",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events`,
					pathParams: {},
					query: queryParams,
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									cursor: resolveFileToken(
										argv["cursor"] as string | undefined,
										"cursor",
										"text"
									),
									datasetId: argv["dataset-id"],
									order: argv["order"],
									orderBy: resolveFileToken(
										argv["order-by"] as string | undefined,
										"order-by",
										"text"
									),
									page: argv["page"],
									pageSize: argv["page-size"],
									search: parseObjectArray(argv["search"], "search"),
									searchBranches: parseNestedArray(
										argv["search-branches"],
										"search-branches"
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
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				cursor: resolveFileToken(
					argv["cursor"] as string | undefined,
					"cursor",
					"text"
				),
				datasetId: argv["dataset-id"],
				order: argv["order"],
				orderBy: resolveFileToken(
					argv["order-by"] as string | undefined,
					"order-by",
					"text"
				),
				page: argv["page"],
				pageSize: argv["page-size"],
				search: parseObjectArray(argv["search"], "search"),
				searchBranches: parseNestedArray(
					argv["search-branches"],
					"search-branches"
				),
			});
			const qs = new URLSearchParams(
				Object.entries(queryParams)
					.filter(([, v]) => v !== undefined)
					.map(([k, v]) => [k, String(v)])
			).toString();
			const result = await withProgress(`Loading`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
