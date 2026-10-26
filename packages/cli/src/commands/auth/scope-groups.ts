import { DefaultScopeKeys } from "@cloudflare/workers-auth/cf";
import { theme } from "../../lib/ui/index.js";
import type { ScopeCatalogue } from "./scope-catalogue.js";

// Headings for the catalogue's category slugs. A slug missing here is still
// shown, title-cased.
const CATEGORY_TITLES: Record<string, string> = {
	account_and_billing: "Account & Billing",
	ai_and_machine_learning: "AI & Machine Learning",
	analytics_and_logs: "Analytics & Logs",
	app_security: "App Security",
	cache_and_performance: "Cache & Performance",
	cloudflare_one_and_zero_trust: "Cloudflare One / Zero Trust",
	developer_platform: "Developer Platform",
	dns_and_zones: "DNS & Zones",
	email_and_messaging: "Email & Messaging",
	media: "Media",
	network_services: "Network Services",
	other: "Other",
	rules_and_configuration: "Rules & Configuration",
};

// The catalogue has no category for scopes it doesn't list, such as the
// colon-spelled `d1:write`, so they are shown together rather than guessed.
const UNCATEGORIZED = "Uncategorized";
const LAST_AREAS = ["Other", UNCATEGORIZED];

const DEFAULT_SCOPES = new Set<string>(DefaultScopeKeys);
const READ_ACTIONS = new Set(["read", "metadata_read"]);
const SCOPE_PATTERN = /^(.+)([.:])([^.:]+)$/;

function categoryTitle(slug: string): string {
	return (
		CATEGORY_TITLES[slug] ??
		slug
			.split("_")
			.map((word) =>
				word === "and" ? "&" : word.charAt(0).toUpperCase() + word.slice(1)
			)
			.join(" ")
	);
}

function compareAreas(a: string, b: string): number {
	return LAST_AREAS.indexOf(a) - LAST_AREAS.indexOf(b) || a.localeCompare(b);
}

interface ParsedScope {
	scope: string;
	resource: string;
	action: string;
}

/**
 * Whether any scope grants product access. Scopes without an action, such
 * as `openid` and `offline_access`, do not.
 */
export function hasProductScopes(scopes: readonly string[]): boolean {
	return scopes.some((scope) => SCOPE_PATTERN.test(scope));
}

/**
 * Group scopes by the catalogue's category for each. Scopes without an
 * action grant no product access and are left out.
 */
export function groupScopes(
	scopes: readonly string[],
	catalogue: ScopeCatalogue
): Map<string, ParsedScope[]> {
	const groups = new Map<string, ParsedScope[]>();
	for (const scope of scopes) {
		const match = SCOPE_PATTERN.exec(scope);
		if (!match?.[1] || !match[3]) {
			continue;
		}
		const entry = catalogue.get(scope);
		const area = entry?.category
			? categoryTitle(entry.category)
			: UNCATEGORIZED;
		const group = groups.get(area) ?? [];
		group.push({ scope, resource: match[1], action: match[3] });
		groups.set(area, group);
	}
	return groups;
}

type ScopeGroups = ReturnType<typeof groupScopes>;

// Custom scopes are counted apart, so "n/total" only ever means defaults.
function countLabel(area: string, granted: ScopeGroups, defaults: ScopeGroups) {
	const entries = granted.get(area) ?? [];
	const total = defaults.get(area)?.length ?? 0;
	const fromDefaults = entries.filter(({ scope }) =>
		DEFAULT_SCOPES.has(scope)
	).length;
	const custom = entries.length - fromDefaults;
	const counts = total > 0 ? [`${fromDefaults}/${total}`] : [];
	if (custom > 0) {
		counts.push(`${custom} custom`);
	}
	return counts.join(" + ");
}

/**
 * One line per product area that has granted scopes, with its counts; empty
 * when no scope grants product access.
 */
export function formatScopeSummary(
	scopes: readonly string[],
	catalogue: ScopeCatalogue
): string {
	const granted = groupScopes(scopes, catalogue);
	const defaults = groupScopes(DefaultScopeKeys, catalogue);
	const areas = [...granted.keys()].sort(compareAreas);
	if (areas.length === 0) {
		return "";
	}
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

// Cloudflare spells scopes with both `-` and `_` (`workers-kv-storage.read`,
// `workers_kv:write`), so a filter matches either spelling.
const normalize = (text: string) => text.toLowerCase().replaceAll("_", "-");

/** Whether a word in the area's heading starts with `product`. */
export function matchesArea(area: string, product: string): boolean {
	return words(area).includes(words(product).trimEnd());
}

/** Every area heading the catalogue's categories produce. */
export function areaTitles(catalogue: ScopeCatalogue): string[] {
	const titles = new Set([UNCATEGORIZED]);
	for (const { category } of catalogue.values()) {
		if (category) {
			titles.add(categoryTitle(category));
		}
	}
	return [...titles].sort(compareAreas);
}

/**
 * Render scopes as one block per product area, highlighting non-read access.
 * `product` keeps the areas it matches (see `matchesArea`), `filter` the
 * scopes whose id contains it.
 */
export function formatScopeGroups(
	scopes: readonly string[],
	catalogue: ScopeCatalogue,
	{ product = "", filter = "" } = {}
): string {
	const granted = groupScopes(scopes, catalogue);
	const defaults = groupScopes(DefaultScopeKeys, catalogue);
	const blocks: string[] = [];

	for (const area of [...granted.keys()].sort(compareAreas)) {
		if (!matchesArea(area, product)) {
			continue;
		}
		const shown = (granted.get(area) ?? []).filter(({ scope }) =>
			normalize(scope).includes(normalize(filter))
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
