import operation from "../_operations/bot-management/update.js";
/**
 * update command
 * @generated from apis/overlays/bot-management.ts
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
	describe: "Update Zone Bot Management Config",
	usage:
		'$0 bot-management update\n\nUpdates the Bot Management configuration for a zone. This API is used to update: - **Bot Fight Mode** - **Super Bot Fight Mode** - **Bot Management for Enterprise** See [Bot Plans](https://developers.cloudflare.com/bots/plans/) for more information on the different plans \\ If you recently upgraded or downgraded your plan, refer to the following examples to clean up old configurations. Copy and paste the example body to remove old zone configurations based on your current plan. #### Clean up configuration for Bot Fight Mode plan ```json { "sbfm_likely_automated": "allow", "sbfm_definitely_automated": "allow", "sbfm_verified_bots": "allow", "sbfm_static_resource_protection": false, "optimize_wordpress": false, "suppress_session_score": false } ``` #### Clean up configuration for SBFM Pro plan ```json { "sbfm_likely_automated": "allow", "fight_mode": false } ``` #### Clean up configuration for SBFM Biz plan ```json { "fight_mode": false } ``` #### Clean up configuration for BM Enterprise Subscription plan It is strongly recommended that you ensure you have [custom rules](https://developers.cloudflare.com/waf/custom-rules/) in place to protect your zone before disabling the SBFM rules. Without these protections, your zone is vulnerable to attacks. ```json { "sbfm_likely_automated": "allow", "sbfm_definitely_automated": "allow", "sbfm_verified_bots": "allow", "sbfm_static_resource_protection": false, "optimize_wordpress": false, "fight_mode": false } ```',
	flags: {
		"ai-agents-anthropic-agent": {
			kind: "parsed",
			brief: "Action to apply to one supported personal AI agent.",
			optional: true,
			choices: ["disabled", "block", "only_on_ad_pages"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ai-agents-anthropic-agent", "text"),
		},
		"ai-agents-google-agent": {
			kind: "parsed",
			brief: "Action to apply to one supported personal AI agent.",
			optional: true,
			choices: ["disabled", "block", "only_on_ad_pages"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ai-agents-google-agent", "text"),
		},
		"ai-agents-instinct": {
			kind: "parsed",
			brief: "Action to apply to one supported personal AI agent.",
			optional: true,
			choices: ["disabled", "block", "only_on_ad_pages"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ai-agents-instinct", "text"),
		},
		"ai-agents-muse": {
			kind: "parsed",
			brief: "Action to apply to one supported personal AI agent.",
			optional: true,
			choices: ["disabled", "block", "only_on_ad_pages"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ai-agents-muse", "text"),
		},
		"ai-agents-openai-agent": {
			kind: "parsed",
			brief: "Action to apply to one supported personal AI agent.",
			optional: true,
			choices: ["disabled", "block", "only_on_ad_pages"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ai-agents-openai-agent", "text"),
		},
		"ai-bots-migration-opt-out": {
			kind: "boolean",
			brief:
				"Temporary migration flag tracking zones opted out of AI bots managed-rule updates.",
			optional: true,
		},
		"ai-bots-protection": {
			kind: "parsed",
			brief: "Enable rule to block AI Scrapers and Crawlers.",
			optional: true,
			choices: ["block", "disabled", "only_on_ad_pages"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ai-bots-protection", "text"),
		},
		"ai-search": {
			kind: "parsed",
			brief: "Configure robots.txt policy for AI search bots.",
			optional: true,
			choices: ["disabled", "block", "only_on_ad_pages"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "ai-search", "text"),
		},
		"ai-training": {
			kind: "parsed",
			brief: "Configure robots.txt policy for AI model training bots.",
			optional: true,
			choices: ["disabled", "disallow", "block", "only_on_ad_pages"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "ai-training", "text"),
		},
		"ai-user": {
			kind: "parsed",
			brief: "Configure robots.txt policy for AI assistant and agent bots.",
			optional: true,
			choices: ["disabled", "block", "only_on_ad_pages"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "ai-user", "text"),
		},
		"bot-preference-sync-enabled": {
			kind: "boolean",
			brief:
				"Enable Bot Preference Sync for this zone. When enabled, Cloudflare can serve robots.txt content derived from the zone's AI Search, AI User, and AI Training preferences.",
			optional: true,
		},
		"cf-robots-variant": {
			kind: "parsed",
			brief: "Specifies the Robots Access Control License variant to use.",
			optional: true,
			choices: ["off", "policy_only"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "cf-robots-variant", "text"),
		},
		"content-bots-protection": {
			kind: "parsed",
			brief:
				"Enable rule to block content bots. When enabled, blocks automated traffic with low bot scores, excluding safe verified bot categories. Exceptions should be managed via skip rules.",
			optional: true,
			choices: ["block", "disabled"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "content-bots-protection", "text"),
		},
		"crawler-protection": {
			kind: "parsed",
			brief: "Enable rule to punish AI Scrapers and Crawlers via a link maze.",
			optional: true,
			choices: ["enabled", "disabled"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "crawler-protection", "text"),
		},
		"enable-js": {
			kind: "boolean",
			brief:
				"Use lightweight, invisible JavaScript detections to improve Bot Management. [Learn more about JavaScript Detections](https://developers.cloudflare.com/bots/reference/javascript-detections/).",
			optional: true,
		},
		"is-robots-txt-managed": {
			kind: "boolean",
			brief:
				"Enable cloudflare managed robots.txt. If an existing robots.txt is detected, then managed robots.txt will be prepended to the existing robots.txt.",
			optional: true,
		},
		"jsd-api-results-enabled": {
			kind: "boolean",
			brief:
				"Whether to use JavaScript Detection results submitted through the API for this zone.",
			optional: true,
		},
		"fight-mode": {
			kind: "boolean",
			brief: "Whether to enable Bot Fight Mode.",
			optional: true,
		},
		"stale-zone-configuration-optimize-wordpress": {
			kind: "boolean",
			brief:
				"Indicates that the zone's wordpress optimization for SBFM is turned on.",
			optional: true,
		},
		"stale-zone-configuration-sbfm-definitely-automated": {
			kind: "parsed",
			brief:
				"Indicates that the zone's definitely automated requests are being blocked or challenged.",
			optional: true,
			parse: String,
		},
		"stale-zone-configuration-sbfm-likely-automated": {
			kind: "parsed",
			brief:
				"Indicates that the zone's likely automated requests are being blocked or challenged.",
			optional: true,
			parse: String,
		},
		"stale-zone-configuration-sbfm-static-resource-protection": {
			kind: "parsed",
			brief:
				"Indicates that the zone's static resource protection is turned on.",
			optional: true,
			parse: String,
		},
		"stale-zone-configuration-sbfm-verified-bots": {
			kind: "parsed",
			brief:
				"Indicates that the zone's verified bot requests are being blocked.",
			optional: true,
			parse: String,
		},
		"stale-zone-configuration-suppress-session-score": {
			kind: "boolean",
			brief: "Indicates that the zone's session score tracking is disabled.",
			optional: true,
		},
		"stale-zone-configuration-fight-mode": {
			kind: "boolean",
			brief: "Indicates that the zone's Bot Fight Mode is turned on.",
			optional: true,
		},
		"optimize-wordpress": {
			kind: "boolean",
			brief:
				"Whether to optimize Super Bot Fight Mode protections for Wordpress.",
			optional: true,
		},
		"sbfm-definitely-automated": {
			kind: "parsed",
			brief:
				"Super Bot Fight Mode (SBFM) action to take on definitely automated requests.",
			optional: true,
			choices: ["allow", "block", "managed_challenge"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "sbfm-definitely-automated", "text"),
		},
		"sbfm-static-resource-protection": {
			kind: "boolean",
			brief:
				"Super Bot Fight Mode (SBFM) to enable static resource protection.\nEnable if static resources on your application need bot protection.\nNote: Static resource protection can also result in legitimate traffic being blocked.",
			optional: true,
		},
		"sbfm-verified-bots": {
			kind: "parsed",
			brief:
				"Super Bot Fight Mode (SBFM) action to take on verified bots requests.",
			optional: true,
			choices: ["allow", "block"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "sbfm-verified-bots", "text"),
		},
		"sbfm-likely-automated": {
			kind: "parsed",
			brief:
				"Super Bot Fight Mode (SBFM) action to take on likely automated requests.",
			optional: true,
			choices: ["allow", "block", "managed_challenge"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "sbfm-likely-automated", "text"),
		},
		"auto-update-model": {
			kind: "boolean",
			brief:
				"Automatically update to the newest bot detection models created by Cloudflare as they are released. [Learn more.](https://developers.cloudflare.com/bots/reference/machine-learning-models#model-versions-and-release-notes)",
			optional: true,
		},
		"bm-cookie-enabled": {
			kind: "boolean",
			brief:
				"Indicates that the bot management cookie can be placed on end user devices accessing the site. Defaults to true",
			optional: true,
		},
		"suppress-session-score": {
			kind: "boolean",
			brief:
				"Whether to disable tracking the highest bot score for a session in the Bot Management cookie.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "bot-management update",
				classification: {
					safeFlags: [
						"ai-agents-anthropic-agent",
						"ai-agents-google-agent",
						"ai-agents-instinct",
						"ai-agents-muse",
						"ai-agents-openai-agent",
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
				} satisfies ArgClassification<typeof argv>,
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
										ai_agents: {
											anthropic_agent: argv["ai-agents-anthropic-agent"],
											google_agent: argv["ai-agents-google-agent"],
											instinct: argv["ai-agents-instinct"],
											muse: argv["ai-agents-muse"],
											openai_agent: argv["ai-agents-openai-agent"],
										},
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
					ai_agents: {
						anthropic_agent: argv["ai-agents-anthropic-agent"],
						google_agent: argv["ai-agents-google-agent"],
						instinct: argv["ai-agents-instinct"],
						muse: argv["ai-agents-muse"],
						openai_agent: argv["ai-agents-openai-agent"],
					},
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
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
