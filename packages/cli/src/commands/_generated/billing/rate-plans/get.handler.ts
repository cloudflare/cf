import operation from "../../_operations/billing/rate-plans/get.js";
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
			command: "billing rate-plans get",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf billing rate-plans get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/billing/rate_plans/${argv["public-key"] == null ? "<public-key>" : encodeURIComponent(String(argv["public-key"]))}`,
					pathParams: { "public-key": String(argv["public-key"] ?? "") },
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { public_key: argv["public-key"] })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
