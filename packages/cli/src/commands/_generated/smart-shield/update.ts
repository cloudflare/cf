import operation from "../_operations/smart-shield/update.js";
/**
 * update command
 * @generated from apis/overlays/smart-shield.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update",
	describe: "Patch Smart Shield Settings",
	usage: "$0 smart-shield update\n\nSet Smart Shield Settings.",
	flags: {
		"cache-reserve-value": {
			kind: "parsed",
			brief: "Specifies the enablement value of Cache Reserve.",
			optional: true,
			choices: ["on", "off"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "cache-reserve-value", "text"),
		},
		"regional-tiered-cache-value": {
			kind: "parsed",
			brief: "Specifies the enablement value of Regional Tiered Cache.",
			optional: true,
			choices: ["on", "off"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "regional-tiered-cache-value", "text"),
		},
		"smart-routing-value": {
			kind: "parsed",
			brief: "Specifies the enablement value of Smart Routing.",
			optional: true,
			choices: ["on", "off"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "smart-routing-value", "text"),
		},
		"smart-tiered-cache-value": {
			kind: "parsed",
			brief: "Specifies the enablement value of Smart Tiered Cache.",
			optional: true,
			choices: ["on", "off"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "smart-tiered-cache-value", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "The patch body for Smart Shield.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "smart-shield update",
				classification: {
					safeFlags: [
						"cache-reserve-value",
						"regional-tiered-cache-value",
						"smart-routing-value",
						"smart-tiered-cache-value",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf smart-shield update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/smart_shield`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										cache_reserve: {
											value: argv["cache-reserve-value"],
										},
										regional_tiered_cache: {
											value: argv["regional-tiered-cache-value"],
										},
										smart_routing: {
											value: argv["smart-routing-value"],
										},
										smart_tiered_cache: {
											value: argv["smart-tiered-cache-value"],
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
					cache_reserve: {
						value: argv["cache-reserve-value"],
					},
					regional_tiered_cache: {
						value: argv["regional-tiered-cache-value"],
					},
					smart_routing: {
						value: argv["smart-routing-value"],
					},
					smart_tiered_cache: {
						value: argv["smart-tiered-cache-value"],
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
