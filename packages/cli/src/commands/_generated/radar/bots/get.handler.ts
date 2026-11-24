import operation from "../../_operations/radar/bots/get.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./get.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "radar bots get",
			classification: {
				safeFlags: ["format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar bots get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/bots/${argv["bot-slug"] == null ? "<bot-slug>" : encodeURIComponent(String(argv["bot-slug"]))}`,
					pathParams: { "bot-slug": String(argv["bot-slug"] ?? "") },
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { bot_slug: argv["bot-slug"], ...queryParams })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
