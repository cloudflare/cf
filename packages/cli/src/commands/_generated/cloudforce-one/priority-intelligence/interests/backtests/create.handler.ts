import operation from "../../../../_operations/cloudforce-one/priority-intelligence/interests/backtests/create.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command:
				"cloudforce-one priority-intelligence interests backtests create",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command:
						"cf cloudforce-one priority-intelligence interests backtests create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/priority-intelligence/interests/backtests`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									as_of: resolveFileToken(
										argv["as-of"] as string | undefined,
										"as-of",
										"text"
									),
									backtest_days: argv["backtest-days"],
									candidate_limit: argv["candidate-limit"],
									dataset_ids: argv["dataset-ids"],
									emerging_min_current_count:
										argv["emerging-min-current-count"],
									established_min_absolute_delta:
										argv["established-min-absolute-delta"],
									established_min_prior_count:
										argv["established-min-prior-count"],
									established_min_relative_delta:
										argv["established-min-relative-delta"],
									window_days: argv["window-days"],
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				as_of: resolveFileToken(
					argv["as-of"] as string | undefined,
					"as-of",
					"text"
				),
				backtest_days: argv["backtest-days"],
				candidate_limit: argv["candidate-limit"],
				dataset_ids: argv["dataset-ids"],
				emerging_min_current_count: argv["emerging-min-current-count"],
				established_min_absolute_delta: argv["established-min-absolute-delta"],
				established_min_prior_count: argv["established-min-prior-count"],
				established_min_relative_delta: argv["established-min-relative-delta"],
				window_days: argv["window-days"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
