/**
 * update command
 * @generated from apis/overlays/bot-management.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update Zone Bot Management Config",
	usage:
		'$0 bot-management update\n\nUpdates the Bot Management configuration for a zone. This API is used to update: - **Bot Fight Mode** - **Super Bot Fight Mode** - **Bot Management for Enterprise** See [Bot Plans](https://developers.cloudflare.com/bots/plans/) for more information on the different plans \\ If you recently upgraded or downgraded your plan, refer to the following examples to clean up old configurations. Copy and paste the example body to remove old zone configurations based on your current plan. #### Clean up configuration for Bot Fight Mode plan ```json { "sbfm_likely_automated": "allow", "sbfm_definitely_automated": "allow", "sbfm_verified_bots": "allow", "sbfm_static_resource_protection": false, "optimize_wordpress": false, "suppress_session_score": false } ``` #### Clean up configuration for SBFM Pro plan ```json { "sbfm_likely_automated": "allow", "fight_mode": false } ``` #### Clean up configuration for SBFM Biz plan ```json { "fight_mode": false } ``` #### Clean up configuration for BM Enterprise Subscription plan It is strongly recommended that you ensure you have [custom rules](https://developers.cloudflare.com/waf/custom-rules/) in place to protect your zone before disabling the SBFM rules. Without these protections, your zone is vulnerable to attacks. ```json { "sbfm_likely_automated": "allow", "sbfm_definitely_automated": "allow", "sbfm_verified_bots": "allow", "sbfm_static_resource_protection": false, "optimize_wordpress": false, "fight_mode": false } ```',
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
