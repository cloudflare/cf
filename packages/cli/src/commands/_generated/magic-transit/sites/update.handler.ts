import operation from "../../_operations/magic-transit/sites/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "magic-transit sites update",
			classification: {
				safeFlags: ["ha-mode", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf magic-transit sites update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/sites/${argv["site-id"] == null ? "<site-id>" : encodeURIComponent(String(argv["site-id"]))}`,
					pathParams: { "site-id": String(argv["site-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									connector_id: resolveFileToken(
										argv["connector-id"] as string | undefined,
										"connector-id",
										"text"
									),
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									ha_mode: argv["ha-mode"],
									location: {
										lat: resolveFileToken(
											argv["location-lat"] as string | undefined,
											"location-lat",
											"text"
										),
										lon: resolveFileToken(
											argv["location-lon"] as string | undefined,
											"location-lon",
											"text"
										),
									},
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									secondary_connector_id: resolveFileToken(
										argv["secondary-connector-id"] as string | undefined,
										"secondary-connector-id",
										"text"
									),
								}),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						site_id: argv["site-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				connector_id: resolveFileToken(
					argv["connector-id"] as string | undefined,
					"connector-id",
					"text"
				),
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				ha_mode: argv["ha-mode"],
				location: {
					lat: resolveFileToken(
						argv["location-lat"] as string | undefined,
						"location-lat",
						"text"
					),
					lon: resolveFileToken(
						argv["location-lon"] as string | undefined,
						"location-lon",
						"text"
					),
				},
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				secondary_connector_id: resolveFileToken(
					argv["secondary-connector-id"] as string | undefined,
					"secondary-connector-id",
					"text"
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					site_id: argv["site-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
