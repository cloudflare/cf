import operation from "../../_operations/zones/subscriptions/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
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
			command: "zones subscriptions update",
			classification: {
				safeFlags: [
					"frequency",
					"rate-plan-externally-managed",
					"rate-plan-is-contract",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf zones subscriptions update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/subscription`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									app: {
										install_id: resolveFileToken(
											argv["app-install-id"] as string | undefined,
											"app-install-id",
											"text"
										),
									},
									component_values: parseObjectArray(
										argv["component-values"],
										"component-values"
									),
									frequency: argv["frequency"],
									rate_plan: {
										currency: resolveFileToken(
											argv["rate-plan-currency"] as string | undefined,
											"rate-plan-currency",
											"text"
										),
										externally_managed: argv["rate-plan-externally-managed"],
										id: resolveFileToken(
											argv["rate-plan-id"] as string | undefined,
											"rate-plan-id",
											"text"
										),
										is_contract: argv["rate-plan-is-contract"],
										public_name: resolveFileToken(
											argv["rate-plan-public-name"] as string | undefined,
											"rate-plan-public-name",
											"text"
										),
										scope: resolveFileToken(
											argv["rate-plan-scope"] as string | undefined,
											"rate-plan-scope",
											"text"
										),
										sets: argv["rate-plan-sets"],
									},
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
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				app: {
					install_id: resolveFileToken(
						argv["app-install-id"] as string | undefined,
						"app-install-id",
						"text"
					),
				},
				component_values: parseObjectArray(
					argv["component-values"],
					"component-values"
				),
				frequency: argv["frequency"],
				rate_plan: {
					currency: resolveFileToken(
						argv["rate-plan-currency"] as string | undefined,
						"rate-plan-currency",
						"text"
					),
					externally_managed: argv["rate-plan-externally-managed"],
					id: resolveFileToken(
						argv["rate-plan-id"] as string | undefined,
						"rate-plan-id",
						"text"
					),
					is_contract: argv["rate-plan-is-contract"],
					public_name: resolveFileToken(
						argv["rate-plan-public-name"] as string | undefined,
						"rate-plan-public-name",
						"text"
					),
					scope: resolveFileToken(
						argv["rate-plan-scope"] as string | undefined,
						"rate-plan-scope",
						"text"
					),
					sets: argv["rate-plan-sets"],
				},
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
