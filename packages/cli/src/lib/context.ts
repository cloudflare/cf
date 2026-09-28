/**
 * Runtime context resolution.
 *
 * Account ID priority:
 *   1. CLOUDFLARE_ACCOUNT_ID environment variable
 *   2. account settings from cloudflare.config.ts's default export
 *   3. workers-auth account cache
 *   4. Interactive account picker / single-account auto-select
 *
 * Steps 1–3 are offline (`resolveAccountIdSilent`); only `getAccountId`
 * can enumerate accounts or ask.
 *
 * Zone priority:
 *   1. --zone / -z CLI flag
 *   2. CLOUDFLARE_ZONE_ID environment variable
 */
import {
	getLoadedProjectSettings,
	loadProjectSettings,
} from "./project-settings.js";
import { isId } from "./resolve.js";
import type { Cloudflare } from "./auth.js";

export type ContextSourceType = "flag" | "env" | "settings";

export interface ContextSource {
	value: string;
	source: ContextSourceType;
	path?: string;
	name?: string;
}

export type ContextKey = "accountId" | "zone" | "complianceRegion";

function resolveValue(
	envVar: string,
	flagValue?: string
): ContextSource | undefined {
	if (flagValue) {
		return { value: flagValue, source: "flag" };
	}

	const envValue = process.env[envVar];
	if (envValue) {
		return { value: envValue, source: "env" };
	}

	return undefined;
}

async function resolveAccountId(
	options: { isPreview?: boolean } = {}
): Promise<ContextSource | undefined> {
	const envValue = process.env.CLOUDFLARE_ACCOUNT_ID;
	if (envValue) {
		return { value: envValue, source: "env" };
	}

	const preloadedProjectSettings = getLoadedProjectSettings(undefined, options);
	const projectSettings =
		preloadedProjectSettings === undefined
			? await loadProjectSettings(undefined, options)
			: preloadedProjectSettings;
	if (projectSettings?.settings?.accountId) {
		return {
			value: projectSettings.settings.accountId,
			source: "settings",
			path: projectSettings.path,
		};
	}

	return undefined;
}

/**
 * Resolve account ID without triggering interactive prompts, network calls,
 * or stderr announcements. Reads env → cloudflare.config.ts settings → the
 * profile's cached account, and returns `undefined` rather than prompting
 * or going looking for accounts when none of those is set.
 */
export async function resolveAccountIdSilent(): Promise<string | undefined> {
	const result = await resolveAccountId();
	if (result) {
		return result.value;
	}
	// The profile's cached account is priority 3 and costs nothing to read:
	// no request, no prompt, no announcement. Lazily imported for the same
	// dependency-cycle reason as getAccountId.
	const { getActiveAccountId } = await import("./oauth/index.js");
	try {
		return getActiveAccountId();
	} catch {
		return undefined;
	}
}

/**
 * Get account ID with priority resolution (env → settings → interactive picker
 * / single-account auto-select).
 *
 * @throws Error if no account ID is found
 */
export async function getAccountId(options?: {
	isPreview?: boolean;
}): Promise<string> {
	const result = await resolveAccountId(options);

	if (result) {
		announceAccount(result.value, getSourceDescription(result, "accountId"));
	}

	// oauth/index also consumes compliance context. Import it lazily after this
	// module has initialised to avoid a static context ↔ OAuth dependency cycle.
	const { getOrSelectAccountId } = await import("./oauth/index.js");
	return getOrSelectAccountId(result?.value, options);
}

/**
 * Print a short "Using account X (source)" line to stderr so users can see
 * which account a command is targeting. Debug-level — only shown when
 * DEBUG is set (matches the project's existing pattern in errors.ts).
 */
function announceAccount(accountId: string, source: string): void {
	if (!process.env.DEBUG) {
		return;
	}
	const truncated =
		accountId.length > 12 ? accountId.slice(0, 12) + "…" : accountId;
	process.stderr.write(`Using account: ${truncated} (${source})\n`);
}

/** Get zone ID, resolving a name to an ID if needed. */
export async function getZoneId(
	argv?: { zone?: string; zoneId?: string },
	client?: Cloudflare,
	options?: { quiet?: boolean }
): Promise<string> {
	if (argv?.zoneId) {
		return resolveZoneValue(argv.zoneId, client);
	}

	const result = resolveValue("CLOUDFLARE_ZONE_ID", argv?.zone);

	if (result) {
		if (!options?.quiet && result.source !== "flag") {
			const sourceDesc = getSourceDescription(result);
			console.error(`Using zone: ${result.value} (from ${sourceDesc})`);
		}
		return resolveZoneValue(result.value, client);
	}

	throw new Error(
		`No zone specified.

Please provide one of the following:
  1. Zone as a positional argument: cf dns records list <zone>
  2. --zone flag (or -z): cf dns records list --zone example.com
  3. CLOUDFLARE_ZONE_ID environment variable`
	);
}

/** Resolve a zone value (name or ID) to an ID. */
async function resolveZoneValue(
	value: string,
	client?: Cloudflare
): Promise<string> {
	if (isId(value)) {
		return value;
	}

	if (!client) {
		return value;
	}

	const { resolveZoneId } = await import("./resolve.js");
	const accountId = await getAccountId();
	return resolveZoneId(client, accountId, value);
}

/**
 * Get the Worker name. Called by generated commands under `cf workers *`.
 *
 * Yargs populates `scriptName` from either the positional arg or `--worker`
 * (aliased as `--script-name` / `--name`), so this is just a guard against
 * missing input.
 */
export function getWorkerName(argv?: { scriptName?: string }): string {
	if (argv?.scriptName) {
		return argv.scriptName;
	}
	throw new Error(
		"Required Worker name missing. Please specify the Worker name with `--worker <name>`."
	);
}

const VALID_COMPLIANCE_REGIONS = ["public", "fedramp_high"] as const;

export type ComplianceRegion = (typeof VALID_COMPLIANCE_REGIONS)[number];

let complianceRegionConflictsReported = false;

/**
 * Resolve the compliance region in the representation consumed by
 * workers-auth/workers-utils. cloudflare.config.ts uses `fedramp-high`, which
 * is converted once at this boundary.
 */
async function resolveComplianceRegion(
	options: { isPreview?: boolean } = {}
): Promise<ComplianceRegion | undefined> {
	const preloadedProjectSettings = getLoadedProjectSettings(undefined, options);
	const projectSettings =
		preloadedProjectSettings === undefined
			? await loadProjectSettings(undefined, options)
			: preloadedProjectSettings;
	const configuredValue = projectSettings?.settings?.complianceRegion;
	const configureRegion = normalizeComplianceRegion(
		configuredValue,
		"cloudflare.config.ts"
	);
	const envValue = process.env.CLOUDFLARE_COMPLIANCE_REGION;
	const envRegion = normalizeComplianceRegion(
		envValue,
		"CLOUDFLARE_COMPLIANCE_REGION"
	);

	if (!envRegion) {
		return configureRegion;
	}

	if (
		configureRegion &&
		configureRegion !== envRegion &&
		!complianceRegionConflictsReported
	) {
		complianceRegionConflictsReported = true;
		console.warn(
			`The compliance region was resolved to "${envValue}" from the \`CLOUDFLARE_COMPLIANCE_REGION\` environment variable, which takes precedence over the configured value "${configuredValue}" in \`cloudflare.config.ts\`.`
		);
	}

	return envRegion;
}

/** Get the compliance region, defaulting to public. */
export async function getComplianceRegion(options?: {
	isPreview?: boolean;
}): Promise<ComplianceRegion> {
	return (await resolveComplianceRegion(options)) ?? "public";
}

function normalizeComplianceRegion(
	value: string | undefined,
	source: string
): ComplianceRegion | undefined {
	switch (value) {
		case "fedramp-high":
			// cloudflare.config.ts uses `fedramp-high`, while workers-auth and
			// workers-utils consume the legacy `fedramp_high` representation.
			return "fedramp_high";
		case "fedramp_high":
		case "public":
		case undefined:
			return value;
		default:
			throw new Error(
				`Invalid compliance region "${value}" from ${source}. Valid values are: ${VALID_COMPLIANCE_REGIONS.join(", ")}`
			);
	}
}

function getSourceDescription(
	source: ContextSource,
	key: ContextKey = "zone"
): string {
	switch (source.source) {
		case "flag":
			return key === "zone" ? "--zone flag" : "(flag)";
		case "env": {
			const envVarNames: Record<typeof key, string> = {
				accountId: "CLOUDFLARE_ACCOUNT_ID",
				zone: "CLOUDFLARE_ZONE_ID",
				complianceRegion: "CLOUDFLARE_COMPLIANCE_REGION",
			};
			return envVarNames[key];
		}
		case "settings":
			return "cloudflare.config.ts";
	}
}
