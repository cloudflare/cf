import operation from "../../_operations/email-routing/rules/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "email-routing rules create",
			classification: {
				safeFlags: ["enabled", "source", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["actions"] === undefined) {
					throw new Error(
						"--actions is required (or pass --body with this field set)."
					);
				}
				if (argv["matchers"] === undefined) {
					throw new Error(
						"--matchers is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf email-routing rules create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/email/routing/rules`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									actions: parseObjectArray(argv["actions"], "actions"),
									enabled: argv["enabled"],
									matchers: parseObjectArray(argv["matchers"], "matchers"),
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									owner_worker_tag: resolveFileToken(
										argv["owner-worker-tag"] as string | undefined,
										"owner-worker-tag",
										"text"
									),
									priority: argv["priority"],
									source: argv["source"],
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				actions: parseObjectArray(argv["actions"], "actions"),
				enabled: argv["enabled"],
				matchers: parseObjectArray(argv["matchers"], "matchers"),
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				owner_worker_tag: resolveFileToken(
					argv["owner-worker-tag"] as string | undefined,
					"owner-worker-tag",
					"text"
				),
				priority: argv["priority"],
				source: argv["source"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
