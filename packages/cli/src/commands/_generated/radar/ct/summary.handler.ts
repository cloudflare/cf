import operation from "../../_operations/radar/ct/summary.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./summary.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "radar ct summary",
			classification: {
				safeFlags: ["normalization", "format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				name: argv["name"],
				dateRange: argv["date-range"],
				dateStart: argv["date-start"],
				dateEnd: argv["date-end"],
				limitPerGroup: argv["limit-per-group"],
				ca: argv["ca"],
				caOwner: argv["ca-owner"],
				duration: argv["duration"],
				entryType: argv["entry-type"],
				expirationStatus: argv["expiration-status"],
				hasIps: argv["has-ips"],
				hasWildcards: argv["has-wildcards"],
				log: argv["log"],
				logApi: argv["log-api"],
				logOperator: argv["log-operator"],
				publicKeyAlgorithm: argv["public-key-algorithm"],
				signatureAlgorithm: argv["signature-algorithm"],
				tld: argv["tld"],
				validationLevel: argv["validation-level"],
				uniqueEntries: argv["unique-entries"],
				normalization: argv["normalization"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar ct summary",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/ct/summary/${argv["dimension"] == null ? "<dimension>" : encodeURIComponent(String(argv["dimension"]))}`,
					pathParams: { dimension: String(argv["dimension"] ?? "") },
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { dimension: argv["dimension"], ...queryParams })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
