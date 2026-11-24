import operation from "../_operations/bot-management/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
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
									ai_bots_migration_opt_out: argv["ai-bots-migration-opt-out"],
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
						argv["stale-zone-configuration-sbfm-static-resource-protection"] as
							| string
							| undefined,
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
	);
}
