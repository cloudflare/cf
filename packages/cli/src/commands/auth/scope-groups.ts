import { DefaultScopeKeys } from "@cloudflare/workers-auth/cf";
import { theme } from "../../lib/ui/index.js";

// Cloudflare's own grouping, from the consent screen `cf auth login` shows.
// Entries match a scope's resource (with `_` read as `-`) and anything under
// it; one ending in `.` or `:` matches that spelling only, and one with an
// action matches that scope only. The first match wins, so the specific
// entries come before the general ones they share a prefix with.
const PRODUCT_AREAS: [area: string, prefixes: string[]][] = [
	[
		"Cloudflare One / Zero Trust",
		[
			"access",
			"argotunnel",
			"casb",
			"dex",
			"dls",
			"resource-library",
			"sso-connector",
			"teams",
			"zone-access",
		],
	],
	[
		"Analytics & Logs",
		[
			"account-analytics",
			"account-logs",
			"analytics",
			"auditlogs",
			"dns-analytics",
			"intel",
			"logpush",
			"logs",
			"radar",
			"zone-observability",
		],
	],
	[
		"Rules & Configuration",
		[
			"account-custom-error-rules",
			"account-custom-pages",
			"account-rule-lists",
			"account-rulesets",
			"config-settings",
			"custom-errors",
			"custom-pages",
			"dynamic-redirect",
			"managed-headers",
			"mass-url-redirects",
			"origin",
			"payments-gateway",
			"response-compression",
			"select-configuration",
			"snippets",
			"transform-rules",
			"zone-transform-rules",
		],
	],
	[
		"Cache & Performance",
		[
			"account-disable-esc",
			"account-ssl-and-certificates",
			"cache",
			"ssl",
			"zone-disable-esc",
		],
	],
	[
		"App Security",
		[
			"account-firewall-access-rules",
			"account-security-center-insights",
			"account-waf",
			"api-gateway",
			"bot-management",
			"cfone",
			"challenge-widgets",
			"cloudforce-one",
			"ddos",
			"domain-page",
			"field-extractor",
			"firewall-services",
			"fraud",
			"http-applications",
			"http-ddos-managed-ruleset",
			"iot",
			"l4-ddos-managed-ruleset",
			"page-rules",
			"page-shield",
			"page.shield",
			"precursor",
			"reports",
			"request-tracer",
			"sanitize",
			"secrets-store:",
			"tag",
			"trust-and-safety",
			"url-scanner",
			"zaraz",
			"zone-security-center-insights",
			"zone-waf",
		],
	],
	[
		"Network Services",
		[
			"account-waiting-rooms",
			"address-maps",
			"chinanetwork-steering",
			"connectivity-directory",
			"fbm",
			"healthcheck",
			"ip-prefix",
			"lb",
			"load",
			"magic",
			"pcaps-api",
			"waiting-rooms",
			"web3-hostnames",
		],
	],
	[
		"AI & Machine Learning",
		[
			"agw.",
			"ai.",
			"ai-search.",
			"aiaudit.",
			"aig.",
			"firewall-for-ai",
			"rag.",
			"websearch",
			"workers-ai",
		],
	],
	["Media", ["calls", "images.", "moq", "stream"]],
	[
		"Email & Messaging",
		[
			"cloud-email-security",
			"email-routing-account-rule",
			"email-routing-address",
			"email-routing-rule",
			"email-routing-suppression",
			"email-security-dmarcreports",
			"email-sending.",
		],
	],
	["DNS & Zones", ["account-dns-settings", "dns", "registrar", "zone"]],
	[
		"Developer Platform",
		[
			"agent-memory",
			"agw",
			"ai",
			"aiaudit",
			"aig",
			"browser",
			"cf-agents",
			"cloud-connector",
			"cloudchamber",
			"connectivity",
			"constellation",
			"containers",
			"d1",
			"email-routing",
			"email-sending",
			"firstpartytags",
			"flagship",
			"hyperdrive",
			"images",
			"k2",
			"mcp-portals",
			"messaging",
			"notebook-examples",
			"page",
			"pages",
			"pipelines",
			"pubsub",
			"query-cache",
			"queues",
			"r2-catalog",
			"rag",
			"realtime",
			"secrets-store",
			"vectorize",
			"workers",
		],
	],
	[
		"Account & Billing",
		[
			"account",
			"apps",
			"integration",
			"memberships",
			"notification",
			"notifications",
			"user",
		],
	],
	["Other", ["artifacts", "resource-sharing"]],
];

// "Other" is listed last, so unmatched scopes join it rather than vanish.
const AREA_NAMES = PRODUCT_AREAS.map(([area]) => area).sort((a, b) =>
	a === "Other" ? 1 : b === "Other" ? -1 : a.localeCompare(b)
);
const DEFAULT_SCOPES = new Set<string>(DefaultScopeKeys);
const READ_ACTIONS = new Set(["read", "metadata_read"]);

interface ParsedScope {
	scope: string;
	resource: string;
	action: string;
}

/**
 * Group scopes by product area. Scopes without an action, such as `openid`
 * and `offline_access`, grant no product access and are left out.
 */
export function groupScopes(
	scopes: readonly string[]
): Map<string, ParsedScope[]> {
	const groups = new Map<string, ParsedScope[]>();
	for (const scope of scopes) {
		const match = /^(.+)([.:])([^.:]+)$/.exec(scope);
		if (!match?.[1] || !match[2] || !match[3]) {
			continue;
		}
		const resource = match[1].replaceAll("_", "-");
		const key = resource + match[2] + match[3];
		const area =
			PRODUCT_AREAS.find(([, prefixes]) =>
				prefixes.some(
					(p) =>
						key.startsWith(p) &&
						(/[.:]$/.test(p) || /^([-.:]|$)/.test(key.slice(p.length)))
				)
			)?.[0] ?? "Other";
		const group = groups.get(area) ?? [];
		group.push({ scope, resource, action: match[3] });
		groups.set(area, group);
	}
	return groups;
}

type ScopeGroups = ReturnType<typeof groupScopes>;

function countLabel(area: string, granted: ScopeGroups, defaults: ScopeGroups) {
	const count = granted.get(area)?.length ?? 0;
	return `${count}/${defaults.get(area)?.length ?? count}`;
}

/** One line per product area that has granted scopes, with its counts. */
export function formatScopeSummary(scopes: readonly string[]): string {
	const granted = groupScopes(scopes);
	const defaults = groupScopes(DefaultScopeKeys);
	const areas = AREA_NAMES.filter((area) => granted.has(area));
	const width = Math.max(...areas.map((area) => area.length));
	return areas
		.map(
			(area) =>
				`${theme.bold(theme.info(area.padEnd(width)))}  ${theme.muted(countLabel(area, granted, defaults))}`
		)
		.join("\n");
}

// Leading-space, lower-case words, so a search matches only from a word start:
// "ai" finds "AI & Machine Learning" but not "Email & Messaging".
const words = (text: string) =>
	` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ")}`;

/**
 * Render scopes as one block per product area, highlighting non-read access.
 * `product` keeps the areas with a word starting with it, `filter` the scopes
 * whose name contains it.
 */
export function formatScopeGroups(
	scopes: readonly string[],
	{ product = "", filter = "" } = {}
): string {
	const granted = groupScopes(scopes);
	const defaults = groupScopes(DefaultScopeKeys);
	const blocks: string[] = [];

	for (const area of AREA_NAMES) {
		if (!words(area).includes(words(product).trimEnd())) {
			continue;
		}
		const entries = granted.get(area) ?? [];
		const shown = entries.filter(({ scope }) =>
			scope.toLowerCase().includes(filter.toLowerCase())
		);
		if (shown.length === 0) {
			continue;
		}
		const lines = [
			`${theme.bold(theme.info(area))} ${theme.muted(`(${countLabel(area, granted, defaults)})`)}`,
		];

		const resources = new Map<string, Set<string>>();
		// Reads first, so the highlighted access follows them on each line.
		const ordered = [...shown].sort(
			(a, b) =>
				Number(!READ_ACTIONS.has(a.action)) -
					Number(!READ_ACTIONS.has(b.action)) ||
				a.action.localeCompare(b.action)
		);
		for (const { scope, resource, action } of ordered) {
			const label =
				(READ_ACTIONS.has(action)
					? theme.muted(action)
					: theme.warning(action)) +
				(DEFAULT_SCOPES.has(scope) ? "" : theme.muted(" (custom)"));
			resources.set(
				resource,
				(resources.get(resource) ?? new Set()).add(label)
			);
		}
		const width = Math.max(...[...resources.keys()].map((r) => r.length));
		for (const [resource, actions] of [...resources].sort(([a], [b]) =>
			a.localeCompare(b)
		)) {
			lines.push(`  ${resource.padEnd(width)}  ${[...actions].join(", ")}`);
		}
		blocks.push(lines.join("\n"));
	}

	return blocks.join("\n\n");
}
