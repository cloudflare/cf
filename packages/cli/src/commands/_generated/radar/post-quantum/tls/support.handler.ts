import operation from "../../../_operations/radar/post-quantum/tls/support.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./support.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "radar post-quantum tls support",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				host: argv["host"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar post-quantum tls support",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/post_quantum/tls/support`,
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
