import stringWidth from "string-width";
import { theme } from "../../lib/ui/index.js";
import { log } from "../../lib/ui/log.js";
import { sanitizeTerminalText } from "../../lib/ui/sanitize.js";
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

const JSON_HINT = "Use --json to see all information in a JSON object.";

function authenticationMessage(
	result: WhoamiResult,
	method: WhoamiSnapshot["method"]
): string {
	if (!result.authenticated) {
		return "Not authenticated";
	}
	if (result.tokenValid === false) {
		return "Not authenticated (API token disabled or expired)";
	}
	const authenticationMethod = method === "oauth" ? "OAuth" : "API Token";
	if (result.tokenValid === null) {
		return `Unable to verify authentication via ${authenticationMethod}`;
	}
	const identity = result.email
		? `${theme.bold(theme.info(sanitizeTerminalText(result.email)))} ${theme.muted(`via ${authenticationMethod}`)}`
		: theme.muted(`via ${authenticationMethod} (email unavailable)`);
	return `${theme.bold("Authenticated")}\n${identity}`;
}

export async function printWhoamiSummary(
	{ result, method, tokenVariable, accountsAvailable }: WhoamiSnapshot,
	argv: ArgumentsCamelCase<CommonYargsOptions>
): Promise<void> {
	const lines = [authenticationMessage(result, method)];
	const profileName = sanitizeTerminalText(result.profile.name);
	if (result.profile.name !== "default") {
		lines.push(
			`Active profile: ${theme.bold(profileName)} ${theme.muted(`(${PROFILE_SOURCES[result.profile.source]}${result.profile.overridden ? `; overridden by ${sanitizeTerminalText(tokenVariable ?? "environment API token")}` : ""})`)}`
		);
	}

	if (!result.authenticated) {
		console.log(lines.join("\n"));
		log.warn(
			method === "oauth"
				? "Could not refresh your OAuth credentials. Check your connection or log in again."
				: "Log in to authenticate with Cloudflare.",
			result.profile.name === "default"
				? `cf auth login${method === "oauth" ? " --force" : ""}`
				: `cf auth create ${profileName}`
		);
		log.info(JSON_HINT);
		return;
	}

	lines.push("", theme.bold("Accounts"));
	if (!accountsAvailable) {
		lines.push("Unavailable; could not list accounts with these credentials");
	} else if (result.accounts.length === 0) {
		lines.push("No accessible accounts");
	} else {
		const accounts = [...result.accounts]
			.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
			.map(({ name, id }) => ({
				name: sanitizeTerminalText(name),
				id: sanitizeTerminalText(id),
			}));
		const nameWidth = Math.max(
			...accounts.map(({ name }) => stringWidth(name))
		);
		for (const { name, id } of accounts) {
			const padding = " ".repeat(nameWidth - stringWidth(name));
			lines.push(
				`${theme.bold(theme.info(name))}${padding}  ${theme.muted(id)}`
			);
		}
	}

	if (method === "api-token") {
		lines.push("", "Scopes: API token permissions are not available here");
	} else if (result.scopes === undefined) {
		lines.push("", "Scopes: Not recorded for this OAuth login");
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
	log.info(JSON_HINT);
}
