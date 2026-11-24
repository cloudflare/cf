import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import { createCommandClient, getZoneId, requestApi } from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseObjectArray,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "precursor update",
			classification: {
				safeFlags: ["detection-mode", "show-interstitial", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const headers: Record<string, string> = {};
			if (argv["cloudflare-version"] !== undefined)
				headers["Cloudflare-Version"] = String(argv["cloudflare-version"]);
			if (argv.dryRun) {
				formatDryRun({
					command: "cf precursor update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/precursor`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									mode: argv["detection-mode"],
									rules: parseObjectArray(argv["rules"], "rules"),
									show_interstitial: argv["show-interstitial"],
								}),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const zoneId = await getZoneId({ zone: argv.zone }, client, {
				quiet: argv.quiet,
			});
			argv.zoneId = zoneId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/zones/${argv.zoneId}/precursor`,
						{
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["detection-mode"] !== undefined)
				setNestedValue(bodyData, ["mode"], argv["detection-mode"]);
			if (argv["rules"] !== undefined)
				setNestedValue(
					bodyData,
					["rules"],
					parseObjectArray(argv["rules"], "rules")
				);
			if (argv["show-interstitial"] !== undefined)
				setNestedValue(
					bodyData,
					["show_interstitial"],
					argv["show-interstitial"]
				);
			const result = await withProgress(`Updating`, async () =>
				requestApi<unknown>(client, "PUT", `/zones/${argv.zoneId}/precursor`, {
					body: bodyData,
					headers: Object.keys(headers).length > 0 ? headers : undefined,
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
