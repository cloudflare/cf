import { theme } from "../../lib/ui/index.js";
import { log } from "../../lib/ui/log.js";
import { loadScopeCatalogue } from "./scope-catalogue.js";
import { formatScopeSummary, hasProductScopes } from "./scope-groups.js";
import type { CommonYargsOptions } from "../../lib/cli-types.js";
import type { ArgumentsCamelCase } from "yargs";

export interface WhoamiProfile {
	name: string;
	source: "--profile" | "CLOUDFLARE_AUTH_PROFILE" | "directory" | "default";
	overridden: boolean;
}

interface WhoamiIdentity {
	profile: WhoamiProfile;
}

export type WhoamiResult = WhoamiIdentity &
	(
		| { authenticated: false; error: string }
		| {
				authenticated: true;
				authSource: string;
				tokenValid: boolean | null;
				email?: string;
				accounts: Array<{ id: string; name: string }>;
				scopes?: string[];
				expiresAt?: string;
		  }
	);

export interface WhoamiSnapshot {
	result: WhoamiResult;
	method: "api-token" | "oauth" | "none";
	tokenVariable?: string;
	accountsAvailable: boolean;
}

const PROFILE_SOURCES = {
	"--profile": "selected by --profile",
	CLOUDFLARE_AUTH_PROFILE: "selected by CLOUDFLARE_AUTH_PROFILE",
	directory: "activated for this directory",
	default: "default profile",
} satisfies Record<WhoamiProfile["source"], string>;

function statusLabel(result: WhoamiResult): string {
	if (!result.authenticated) {
		return "Not authenticated";
	}
	if (result.tokenValid === false) {
		return "Credentials rejected (token disabled or expired)";
	}
	if (result.tokenValid === null) {
		return "Credentials present; unable to verify";
	}
	return "Authenticated";
}

export async function printWhoamiSummary(
	{ result, method, tokenVariable, accountsAvailable }: WhoamiSnapshot,
	argv: ArgumentsCamelCase<CommonYargsOptions>
): Promise<void> {
	const profile = `${result.profile.name} (${PROFILE_SOURCES[result.profile.source]}${result.profile.overridden ? `; overridden by ${tokenVariable}` : ""})`;
	const row = (label: string, value: string) =>
		`${theme.bold(label.padEnd(9))} ${value}`;
	const lines = [
		row("Status", statusLabel(result)),
		row(
			"Method",
			method === "api-token"
				? `API token (${tokenVariable})`
				: method === "oauth"
					? "OAuth"
					: "None"
		),
		...(result.authenticated
			? [row("Email", result.email ?? "Unavailable for these credentials")]
			: []),
		row("Profile", profile),
	];

	if (!result.authenticated) {
		console.log(lines.join("\n"));
		log.warn(
			method === "oauth"
				? "Could not refresh your OAuth credentials. Check your connection or log in again."
				: "Log in to authenticate with Cloudflare.",
			result.profile.name === "default"
				? `cf auth login${method === "oauth" ? " --force" : ""}`
				: `cf auth create ${result.profile.name}`
		);
		return;
	}

	lines.push(
		"",
		theme.bold(
			accountsAvailable ? `Accounts (${result.accounts.length})` : "Accounts"
		)
	);
	if (!accountsAvailable) {
		lines.push("  Unavailable; could not list accounts with these credentials");
	} else if (result.accounts.length === 0) {
		lines.push("  No accessible accounts");
	} else {
		const accounts = [...result.accounts].sort(
			(a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id)
		);
		for (const account of accounts) {
			lines.push(`  ${account.name}  ${theme.muted(account.id)}`);
		}
	}

	if (method === "api-token") {
		lines.push(
			"",
			row("Scopes", "API token permissions are not available here")
		);
	} else if (result.scopes === undefined) {
		lines.push("", row("Scopes", "Not recorded for this OAuth login"));
	} else {
		lines.push(
			"",
			theme.bold(`OAuth scopes (${result.scopes.length} granted)`)
		);
		if (!hasProductScopes(result.scopes)) {
			lines.push("  No product scopes granted");
		} else {
			try {
				const catalogue = await loadScopeCatalogue(async () => {
					const { createCommandClient } = await import("../../lib/auth.js");
					return createCommandClient(argv);
				});
				lines.push(formatScopeSummary(result.scopes, catalogue));
			} catch {
				lines.push(
					"  Product grouping unavailable; could not load the scope catalogue"
				);
			}
		}
	}
	console.log(lines.join("\n"));
	if (method === "oauth" && result.scopes && hasProductScopes(result.scopes)) {
		log.info(
			"View granted permissions by product or list every scope:",
			"cf auth scopes <product>",
			"cf auth scopes --all"
		);
	}
}
