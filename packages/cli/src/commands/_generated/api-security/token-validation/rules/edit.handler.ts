import operation from "../../../_operations/api-security/token-validation/rules/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
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
			command: "api-security token-validation rules edit",
			classification: {
				safeFlags: ["action", "enabled", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf api-security token-validation rules edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/token_validation/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
					pathParams: {
						"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						"rule-id": String(argv["rule-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									action: argv["action"],
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									enabled: argv["enabled"],
									expression: resolveFileToken(
										argv["expression"] as string | undefined,
										"expression",
										"text"
									),
									selector: {
										exclude: parseObjectArray(
											argv["selector-exclude"],
											"selector-exclude",
											true
										),
										include: parseObjectArray(
											argv["selector-include"],
											"selector-include",
											true
										),
									},
									title: resolveFileToken(
										argv["title"] as string | undefined,
										"title",
										"text"
									),
									position: {
										index: argv["position-index"],
										before: resolveFileToken(
											argv["position-before"] as string | undefined,
											"position-before",
											"text"
										),
										after: resolveFileToken(
											argv["position-after"] as string | undefined,
											"position-after",
											"text"
										),
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
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						rule_id: argv["rule-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				action: argv["action"],
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				enabled: argv["enabled"],
				expression: resolveFileToken(
					argv["expression"] as string | undefined,
					"expression",
					"text"
				),
				selector: {
					exclude: parseObjectArray(
						argv["selector-exclude"],
						"selector-exclude",
						true
					),
					include: parseObjectArray(
						argv["selector-include"],
						"selector-include",
						true
					),
				},
				title: resolveFileToken(
					argv["title"] as string | undefined,
					"title",
					"text"
				),
				position: {
					index: argv["position-index"],
					before: resolveFileToken(
						argv["position-before"] as string | undefined,
						"position-before",
						"text"
					),
					after: resolveFileToken(
						argv["position-after"] as string | undefined,
						"position-after",
						"text"
					),
				},
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					zone_id: zoneId,
					rule_id: argv["rule-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
