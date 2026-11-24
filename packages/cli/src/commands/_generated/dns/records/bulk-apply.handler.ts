import operation from "../../_operations/dns/records/bulk-apply.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./bulk-apply.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "dns records bulk-apply",
			classification: {
				safeFlags: ["include-shadow-metadata", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				include_shadow_metadata: argv["include-shadow-metadata"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf dns records bulk-apply",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/dns_records/batch`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					query: queryParams,
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									deletes: parseObjectArray(argv["deletes"], "deletes"),
									patches: parseObjectArray(argv["patches"], "patches"),
									posts: parseObjectArray(argv["posts"], "posts"),
									puts: parseObjectArray(argv["puts"], "puts"),
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
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				deletes: parseObjectArray(argv["deletes"], "deletes"),
				patches: parseObjectArray(argv["patches"], "patches"),
				posts: parseObjectArray(argv["posts"], "posts"),
				puts: parseObjectArray(argv["puts"], "puts"),
			});
			const qs = new URLSearchParams(
				Object.entries(queryParams)
					.filter(([, v]) => v !== undefined)
					.map(([k, v]) => [k, String(v)])
			).toString();
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					zone_id: zoneId,
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
