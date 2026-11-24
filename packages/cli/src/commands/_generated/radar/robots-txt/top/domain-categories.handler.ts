import operation from "../../../_operations/radar/robots-txt/top/domain-categories.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./domain-categories.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "radar robots-txt top domain-categories",
			classification: {
				safeFlags: ["user-agent-category", "format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				limit: argv["limit"],
				name: argv["name"],
				userAgentCategory: argv["user-agent-category"],
				date: argv["date"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar robots-txt top domain-categories",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/robots_txt/top/domain_categories`,
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
