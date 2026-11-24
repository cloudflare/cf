import operation from "../../../../../_operations/radar/email/security/top/tlds/get.js";
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
			command: "radar email security top tlds get",
			classification: {
				safeFlags: ["tld-category", "format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				limit: argv["limit"],
				name: argv["name"],
				dateRange: argv["date-range"],
				dateStart: argv["date-start"],
				dateEnd: argv["date-end"],
				arc: argv["arc"],
				dkim: argv["dkim"],
				dmarc: argv["dmarc"],
				spf: argv["spf"],
				tlsVersion: argv["tls-version"],
				tldCategory: argv["tld-category"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar email security top tlds get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/email/security/top/tlds`,
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
