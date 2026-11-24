import operation from "../_operations/cache/invalidate-environment.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./invalidate-environment.js";
import { createCommandClient, getZoneId, requestApi } from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "cache invalidate-environment",
			classification: {
				safeFlags: ["dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf cache invalidate-environment",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/environments/${argv["environment-id"] == null ? "<environment-id>" : encodeURIComponent(String(argv["environment-id"]))}/invalidate_cache`,
					pathParams: {
						"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						"environment-id": String(argv["environment-id"] ?? ""),
					},
					bodyKind: "json",
					body: argv.body !== undefined ? parseBody(argv.body) : undefined,
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

			if (
				!(await confirmDelete({
					force: Boolean(argv.force),
					message: `This operation marks the selected content in the environment's cache as stale.`,
				}))
			) {
				return;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Processing`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						environment_id: argv["environment-id"],
					})
				);
				formatOutput(result, { successLabel: `Done` });
				return;
			}

			const result = await withProgress(`Processing`, async () =>
				requestApi<unknown>(
					client,
					"POST",
					`/zones/${argv.zoneId}/environments/${encodeURIComponent(String(argv["environment-id"]))}/invalidate_cache`
				)
			);
			formatOutput(result, { successLabel: `Done` });
		}
	);
}
