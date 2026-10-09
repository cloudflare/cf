import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/bot-management.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			'$0 bot-management update\n\nUpdates the Bot Management configuration for a zone. This API is used to update: - **Bot Fight Mode** - **Super Bot Fight Mode** - **Bot Management for Enterprise** See [Bot Plans](https://developers.cloudflare.com/bots/plans/) for more information on the different plans \\ If you recently upgraded or downgraded your plan, refer to the following examples to clean up old configurations. Copy and paste the example body to remove old zone configurations based on your current plan. #### Clean up configuration for Bot Fight Mode plan ```json { "sbfm_likely_automated": "allow", "sbfm_definitely_automated": "allow", "sbfm_verified_bots": "allow", "sbfm_static_resource_protection": false, "optimize_wordpress": false, "suppress_session_score": false } ``` #### Clean up configuration for SBFM Pro plan ```json { "sbfm_likely_automated": "allow", "fight_mode": false } ``` #### Clean up configuration for SBFM Biz plan ```json { "fight_mode": false } ``` #### Clean up configuration for BM Enterprise Subscription plan It is strongly recommended that you ensure you have [custom rules](https://developers.cloudflare.com/waf/custom-rules/) in place to protect your zone before disabling the SBFM rules. Without these protections, your zone is vulnerable to attacks. ```json { "sbfm_likely_automated": "allow", "sbfm_definitely_automated": "allow", "sbfm_verified_bots": "allow", "sbfm_static_resource_protection": false, "optimize_wordpress": false, "fight_mode": false } ```'
		)
		.option("ai-bots-migration-opt-out", {
			type: "boolean",
			description:
				"Temporary migration flag tracking zones opted out of AI bots managed-rule updates.",
		})
		.option("ai-bots-protection", {
			type: "string",
			description: "Enable rule to block AI Scrapers and Crawlers.",
			choices: ["block", "disabled", "only_on_ad_pages"],
		})
		.coerce("ai-bots-protection", (value: string | undefined) =>
			resolveFileToken(value, "ai-bots-protection", "text")
		)
		.option("ai-search", {
			type: "string",
			description: "Configure robots.txt policy for AI search bots.",
			choices: ["disabled", "block", "only_on_ad_pages"],
		})
		.coerce("ai-search", (value: string | undefined) =>
			resolveFileToken(value, "ai-search", "text")
		)
		.option("ai-training", {
			type: "string",
			description: "Configure robots.txt policy for AI model training bots.",
			choices: ["disabled", "disallow", "block", "only_on_ad_pages"],
		})
		.coerce("ai-training", (value: string | undefined) =>
			resolveFileToken(value, "ai-training", "text")
		)
		.option("ai-user", {
			type: "string",
			description:
				"Configure robots.txt policy for AI assistant and agent bots.",
			choices: ["disabled", "block", "only_on_ad_pages"],
		})
		.coerce("ai-user", (value: string | undefined) =>
			resolveFileToken(value, "ai-user", "text")
		)
		.option("bot-preference-sync-enabled", {
			type: "boolean",
			description:
				"Enable Bot Preference Sync for this zone. When enabled, Cloudflare can serve robots.txt content derived from the zone's AI Search, AI User, and AI Training preferences.",
		})
		.option("cf-robots-variant", {
			type: "string",
			description:
				"Specifies the Robots Access Control License variant to use.",
			choices: ["off", "policy_only"],
		})
		.coerce("cf-robots-variant", (value: string | undefined) =>
			resolveFileToken(value, "cf-robots-variant", "text")
		)
		.option("content-bots-protection", {
			type: "string",
			description:
				"Enable rule to block content bots. When enabled, blocks automated traffic with low bot scores, excluding safe verified bot categories. Exceptions should be managed via skip rules.",
			choices: ["block", "disabled"],
		})
		.coerce("content-bots-protection", (value: string | undefined) =>
			resolveFileToken(value, "content-bots-protection", "text")
		)
		.option("crawler-protection", {
			type: "string",
			description:
				"Enable rule to punish AI Scrapers and Crawlers via a link maze.",
			choices: ["enabled", "disabled"],
		})
		.coerce("crawler-protection", (value: string | undefined) =>
			resolveFileToken(value, "crawler-protection", "text")
		)
		.option("enable-js", {
			type: "boolean",
			description:
				"Use lightweight, invisible JavaScript detections to improve Bot Management. [Learn more about JavaScript Detections](https://developers.cloudflare.com/bots/reference/javascript-detections/).",
		})
		.option("is-robots-txt-managed", {
			type: "boolean",
			description:
				"Enable cloudflare managed robots.txt. If an existing robots.txt is detected, then managed robots.txt will be prepended to the existing robots.txt.",
		})
		.option("jsd-api-results-enabled", {
			type: "boolean",
			description:
				"Whether to use JavaScript Detection results submitted through the API for this zone.",
		})
		.option("fight-mode", {
			type: "boolean",
			description: "Whether to enable Bot Fight Mode.",
		})
		.option("stale-zone-configuration-optimize-wordpress", {
			type: "boolean",
			description:
				"Indicates that the zone's wordpress optimization for SBFM is turned on.",
		})
		.option("stale-zone-configuration-sbfm-definitely-automated", {
			type: "string",
			description:
				"Indicates that the zone's definitely automated requests are being blocked or challenged.",
		})
		.option("stale-zone-configuration-sbfm-likely-automated", {
			type: "string",
			description:
				"Indicates that the zone's likely automated requests are being blocked or challenged.",
		})
		.option("stale-zone-configuration-sbfm-static-resource-protection", {
			type: "string",
			description:
				"Indicates that the zone's static resource protection is turned on.",
		})
		.option("stale-zone-configuration-sbfm-verified-bots", {
			type: "string",
			description:
				"Indicates that the zone's verified bot requests are being blocked.",
		})
		.option("stale-zone-configuration-suppress-session-score", {
			type: "boolean",
			description:
				"Indicates that the zone's session score tracking is disabled.",
		})
		.option("stale-zone-configuration-fight-mode", {
			type: "boolean",
			description: "Indicates that the zone's Bot Fight Mode is turned on.",
		})
		.option("optimize-wordpress", {
			type: "boolean",
			description:
				"Whether to optimize Super Bot Fight Mode protections for Wordpress.",
		})
		.option("sbfm-definitely-automated", {
			type: "string",
			description:
				"Super Bot Fight Mode (SBFM) action to take on definitely automated requests.",
			choices: ["allow", "block", "managed_challenge"],
		})
		.coerce("sbfm-definitely-automated", (value: string | undefined) =>
			resolveFileToken(value, "sbfm-definitely-automated", "text")
		)
		.option("sbfm-static-resource-protection", {
			type: "boolean",
			description:
				"Super Bot Fight Mode (SBFM) to enable static resource protection.\nEnable if static resources on your application need bot protection.\nNote: Static resource protection can also result in legitimate traffic being blocked.\n",
		})
		.option("sbfm-verified-bots", {
			type: "string",
			description:
				"Super Bot Fight Mode (SBFM) action to take on verified bots requests.",
			choices: ["allow", "block"],
		})
		.coerce("sbfm-verified-bots", (value: string | undefined) =>
			resolveFileToken(value, "sbfm-verified-bots", "text")
		)
		.option("sbfm-likely-automated", {
			type: "string",
			description:
				"Super Bot Fight Mode (SBFM) action to take on likely automated requests.",
			choices: ["allow", "block", "managed_challenge"],
		})
		.coerce("sbfm-likely-automated", (value: string | undefined) =>
			resolveFileToken(value, "sbfm-likely-automated", "text")
		)
		.option("auto-update-model", {
			type: "boolean",
			description:
				"Automatically update to the newest bot detection models created by Cloudflare as they are released. [Learn more.](https://developers.cloudflare.com/bots/reference/machine-learning-models#model-versions-and-release-notes)",
		})
		.option("bm-cookie-enabled", {
			type: "boolean",
			description:
				"Indicates that the bot management cookie can be placed on end user devices accessing the site. Defaults to true",
		})
		.option("suppress-session-score", {
			type: "boolean",
			description:
				"Whether to disable tracking the highest bot score for a session in the Bot Management cookie.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"bot-management-for-a-zone-update-config">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update Zone Bot Management Config",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "bot-management update",
				classification: {
					safeFlags: [
						"ai-bots-migration-opt-out",
						"ai-bots-protection",
						"ai-search",
						"ai-training",
						"ai-user",
						"bot-preference-sync-enabled",
						"cf-robots-variant",
						"content-bots-protection",
						"crawler-protection",
						"enable-js",
						"is-robots-txt-managed",
						"jsd-api-results-enabled",
						"fight-mode",
						"stale-zone-configuration-optimize-wordpress",
						"stale-zone-configuration-suppress-session-score",
						"stale-zone-configuration-fight-mode",
						"optimize-wordpress",
						"sbfm-definitely-automated",
						"sbfm-static-resource-protection",
						"sbfm-verified-bots",
						"sbfm-likely-automated",
						"auto-update-model",
						"bm-cookie-enabled",
						"suppress-session-score",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf bot-management update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/bot_management`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										ai_bots_migration_opt_out:
											argv["ai-bots-migration-opt-out"],
										ai_bots_protection: argv["ai-bots-protection"],
										ai_search: argv["ai-search"],
										ai_training: argv["ai-training"],
										ai_user: argv["ai-user"],
										bot_preference_sync_enabled:
											argv["bot-preference-sync-enabled"],
										cf_robots_variant: argv["cf-robots-variant"],
										content_bots_protection: argv["content-bots-protection"],
										crawler_protection: argv["crawler-protection"],
										enable_js: argv["enable-js"],
										is_robots_txt_managed: argv["is-robots-txt-managed"],
										jsd_api_results_enabled: argv["jsd-api-results-enabled"],
										fight_mode: argv["fight-mode"],
										stale_zone_configuration: {
											optimize_wordpress:
												argv["stale-zone-configuration-optimize-wordpress"],
											sbfm_definitely_automated: resolveFileToken(
												argv[
													"stale-zone-configuration-sbfm-definitely-automated"
												] as string | undefined,
												"stale-zone-configuration-sbfm-definitely-automated",
												"text"
											),
											sbfm_likely_automated: resolveFileToken(
												argv[
													"stale-zone-configuration-sbfm-likely-automated"
												] as string | undefined,
												"stale-zone-configuration-sbfm-likely-automated",
												"text"
											),
											sbfm_static_resource_protection: resolveFileToken(
												argv[
													"stale-zone-configuration-sbfm-static-resource-protection"
												] as string | undefined,
												"stale-zone-configuration-sbfm-static-resource-protection",
												"text"
											),
											sbfm_verified_bots: resolveFileToken(
												argv["stale-zone-configuration-sbfm-verified-bots"] as
													| string
													| undefined,
												"stale-zone-configuration-sbfm-verified-bots",
												"text"
											),
											suppress_session_score:
												argv["stale-zone-configuration-suppress-session-score"],
											fight_mode: argv["stale-zone-configuration-fight-mode"],
										},
										optimize_wordpress: argv["optimize-wordpress"],
										sbfm_definitely_automated:
											argv["sbfm-definitely-automated"],
										sbfm_static_resource_protection:
											argv["sbfm-static-resource-protection"],
										sbfm_verified_bots: argv["sbfm-verified-bots"],
										sbfm_likely_automated: argv["sbfm-likely-automated"],
										auto_update_model: argv["auto-update-model"],
										bm_cookie_enabled: argv["bm-cookie-enabled"],
										suppress_session_score: argv["suppress-session-score"],
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.botManagement.update({
							body: bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					ai_bots_migration_opt_out: argv["ai-bots-migration-opt-out"],
					ai_bots_protection: argv["ai-bots-protection"],
					ai_search: argv["ai-search"],
					ai_training: argv["ai-training"],
					ai_user: argv["ai-user"],
					bot_preference_sync_enabled: argv["bot-preference-sync-enabled"],
					cf_robots_variant: argv["cf-robots-variant"],
					content_bots_protection: argv["content-bots-protection"],
					crawler_protection: argv["crawler-protection"],
					enable_js: argv["enable-js"],
					is_robots_txt_managed: argv["is-robots-txt-managed"],
					jsd_api_results_enabled: argv["jsd-api-results-enabled"],
					fight_mode: argv["fight-mode"],
					stale_zone_configuration: {
						optimize_wordpress:
							argv["stale-zone-configuration-optimize-wordpress"],
						sbfm_definitely_automated: resolveFileToken(
							argv["stale-zone-configuration-sbfm-definitely-automated"] as
								| string
								| undefined,
							"stale-zone-configuration-sbfm-definitely-automated",
							"text"
						),
						sbfm_likely_automated: resolveFileToken(
							argv["stale-zone-configuration-sbfm-likely-automated"] as
								| string
								| undefined,
							"stale-zone-configuration-sbfm-likely-automated",
							"text"
						),
						sbfm_static_resource_protection: resolveFileToken(
							argv[
								"stale-zone-configuration-sbfm-static-resource-protection"
							] as string | undefined,
							"stale-zone-configuration-sbfm-static-resource-protection",
							"text"
						),
						sbfm_verified_bots: resolveFileToken(
							argv["stale-zone-configuration-sbfm-verified-bots"] as
								| string
								| undefined,
							"stale-zone-configuration-sbfm-verified-bots",
							"text"
						),
						suppress_session_score:
							argv["stale-zone-configuration-suppress-session-score"],
						fight_mode: argv["stale-zone-configuration-fight-mode"],
					},
					optimize_wordpress: argv["optimize-wordpress"],
					sbfm_definitely_automated: argv["sbfm-definitely-automated"],
					sbfm_static_resource_protection:
						argv["sbfm-static-resource-protection"],
					sbfm_verified_bots: argv["sbfm-verified-bots"],
					sbfm_likely_automated: argv["sbfm-likely-automated"],
					auto_update_model: argv["auto-update-model"],
					bm_cookie_enabled: argv["bm-cookie-enabled"],
					suppress_session_score: argv["suppress-session-score"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.botManagement.update({
						body: bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
