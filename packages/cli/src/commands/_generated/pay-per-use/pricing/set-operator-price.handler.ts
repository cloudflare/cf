import operation from "../../_operations/pay-per-use/pricing/set-operator-price.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./set-operator-price.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "pay-per-use pricing set-operator-price",
			classification: {
				safeFlags: ["action", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["action"] === undefined) {
					argv["action"] = await promptForRequiredEnumField(
						"action",
						"The action field",
						["propose", "withdraw", "accept_default", "resume"] as const
					);
				}

				if (
					argv["action"] === "propose" &&
					argv["price-usd-microcents"] === undefined
				) {
					throw new Error(
						"--price-usd-microcents is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf pay-per-use pricing set-operator-price",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/pay-per-use/operators/${argv["operator-id"] == null ? "<operator-id>" : encodeURIComponent(String(argv["operator-id"]))}/price`,
					pathParams: {
						"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						"operator-id": String(argv["operator-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									action: argv["action"],
									price_usd_microcents: argv["price-usd-microcents"],
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
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						operator_id: argv["operator-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				action: argv["action"],
				price_usd_microcents: argv["price-usd-microcents"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					zone_id: zoneId,
					operator_id: argv["operator-id"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
