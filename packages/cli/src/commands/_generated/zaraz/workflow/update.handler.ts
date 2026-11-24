import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import { createCommandClient, getZoneId, requestApi } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zaraz workflow update",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.body === undefined && argv.file === undefined) {
				throw new Error(
					"--body or --file is required for this command. Pass --body '<value>' or --file path/to/file."
				);
			}
			if (argv.dryRun) {
				formatDryRun({
					command: "cf zaraz workflow update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/zaraz/workflow`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "octet-stream",
					body: argv.file !== undefined ? { file: argv.file } : argv.body,
				});
				return;
			}
			const parsedBody =
				argv.file !== undefined
					? undefined
					: resolveFileToken(argv.body, "body", "binary");
			const client = await createCommandClient(argv);
			const zoneId = await getZoneId({ zone: argv.zone }, client, {
				quiet: argv.quiet,
			});
			argv.zoneId = zoneId;

			if (argv.file !== undefined) {
				const fileContent = readFileForFlag(argv.file);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/zones/${argv.zoneId}/settings/zaraz/workflow`,
						{ body: fileContent, headers: { "Content-Type": "text/plain" } }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/zones/${argv.zoneId}/settings/zaraz/workflow`,
						{ body: bodyData, headers: { "Content-Type": "text/plain" } }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
		}
	);
}
