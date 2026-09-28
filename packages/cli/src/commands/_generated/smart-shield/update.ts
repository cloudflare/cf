import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/smart-shield.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 smart-shield update\n\nSet Smart Shield Settings.")
		.option("cache-reserve-value", {
			type: "string",
			description: "Specifies the enablement value of Cache Reserve.",
			choices: ["on", "off"],
		})
		.option("regional-tiered-cache-value", {
			type: "string",
			description: "Specifies the enablement value of Regional Tiered Cache.",
			choices: ["on", "off"],
		})
		.option("smart-routing-value", {
			type: "string",
			description: "Specifies the enablement value of Smart Routing.",
			choices: ["on", "off"],
		})
		.option("smart-tiered-cache-value", {
			type: "string",
			description: "Specifies the enablement value of Smart Tiered Cache.",
			choices: ["on", "off"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "The patch body for Smart Shield.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"smart-shield-patch-settings">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Patch Smart Shield Settings",
	builder,
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
				} satisfies ArgClassification<Args>,
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
											value: resolveFileToken(
												argv["cache-reserve-value"] as string | undefined,
												"cache-reserve-value",
												"text"
											),
										},
										regional_tiered_cache: {
											value: resolveFileToken(
												argv["regional-tiered-cache-value"] as
													| string
													| undefined,
												"regional-tiered-cache-value",
												"text"
											),
										},
										smart_routing: {
											value: resolveFileToken(
												argv["smart-routing-value"] as string | undefined,
												"smart-routing-value",
												"text"
											),
										},
										smart_tiered_cache: {
											value: resolveFileToken(
												argv["smart-tiered-cache-value"] as string | undefined,
												"smart-tiered-cache-value",
												"text"
											),
										},
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.smartShield.update({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					cache_reserve: {
						value: resolveFileToken(
							argv["cache-reserve-value"] as string | undefined,
							"cache-reserve-value",
							"text"
						),
					},
					regional_tiered_cache: {
						value: resolveFileToken(
							argv["regional-tiered-cache-value"] as string | undefined,
							"regional-tiered-cache-value",
							"text"
						),
					},
					smart_routing: {
						value: resolveFileToken(
							argv["smart-routing-value"] as string | undefined,
							"smart-routing-value",
							"text"
						),
					},
					smart_tiered_cache: {
						value: resolveFileToken(
							argv["smart-tiered-cache-value"] as string | undefined,
							"smart-tiered-cache-value",
							"text"
						),
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.smartShield.update({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
