import operation from "../_operations/sql/datasets.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./datasets.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "sql datasets",
			classification: {
				safeFlags: [
					"include-columns",
					"include-custom-attributes",
					"include-attributes",
					"include-wae",
					"include-lex",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				account_tag: argv["account-tag"],
				include_columns: argv["include-columns"],
				include_custom_attributes: argv["include-custom-attributes"],
				include_attributes: argv["include-attributes"],
				include_wae: argv["include-wae"],
				include_lex: argv["include-lex"],
				dataset_name: argv["dataset-name"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf sql datasets",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/analytics/sql/introspection`,
					pathParams: {},
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, queryParams)
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
