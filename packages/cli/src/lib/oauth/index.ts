/**
 * cf's OAuth wiring.
 *
 * The shared package owns cf's identity, scopes, callback handling, credential
 * storage, refresh, and future keyring support. This module only supplies cf's
 * logger and prompt primitives, then preserves the façade consumed by commands.
 */
import { isCancel } from "@clack/core";
import * as clack from "@clack/prompts";
import {
	createCfAuth,
	createCfProfileStore,
	validateScopeKeys,
	type AuthContext,
} from "@cloudflare/workers-auth/cf";
import { USER_AGENT, VERSION } from "../../version.js";
import { hasQuietFlag } from "../args.js";
import { CliExit } from "../cli-exit.js";
import { getComplianceRegion, type ComplianceRegion } from "../context.js";
import { isNonInteractiveOrCI } from "../interactive.js";
import { openSession } from "../session.js";
import { printAccountConfigHint } from "./account-hint.js";

const logger: AuthContext["logger"] = {
	debug: (...args) => {
		if (process.env.DEBUG) {
			console.error(...args);
		}
	},
	info: (...args) => console.error(...args),
	log: (...args) => console.error(...args),
	warn: (...args) => console.error(...args),
	error: (...args) => console.error(...args),
};

class NonInteractiveSelectionError extends Error {}

async function prompt(question: string): Promise<string> {
	if (isNonInteractiveOrCI()) {
		throw new NonInteractiveSelectionError();
	}
	openSession(VERSION);
	const result = await clack.text({ message: question });
	if (isCancel(result) || typeof result !== "string") {
		throw new CliExit(130, { cancelled: true });
	}
	return result;
}

async function select(
	text: string,
	options: { choices: { title: string; value: string }[] }
): Promise<string> {
	if (isNonInteractiveOrCI()) {
		throw new NonInteractiveSelectionError();
	}
	openSession(VERSION);
	const result = await clack.select({
		message: text,
		options: options.choices.map(({ title, value }) => ({
			label: title,
			value,
		})),
	});
	if (isCancel(result) || typeof result !== "string") {
		throw new CliExit(130, { cancelled: true });
	}

	// workers-auth only asks cf to select an account, so the result is
	// always an account ID.
	if (!hasQuietFlag()) {
		printAccountConfigHint(result);
	}

	return result;
}

const auth = createCfAuth({
	logger,
	userAgent: USER_AGENT,
	prompt,
	select,
	isNoDefaultValueProvidedError: (error) =>
		error instanceof NonInteractiveSelectionError,
});

/** Resolve a configured, cached, or newly selected account ID. */
export async function getOrSelectAccountId(
	accountId?: string,
	options?: { isPreview?: boolean; complianceRegion?: ComplianceRegion }
): Promise<string> {
	return auth.getOrSelectAccountId({
		account_id: accountId,
		compliance_region:
			options?.complianceRegion ?? (await getComplianceRegion(options)),
	});
}

/**
 * The account already settled on — config, env, or the profile's cache —
 * without a request or a prompt. `undefined` means nothing is stored yet,
 * not that the user is signed out.
 */
export function getActiveAccountId(): string | undefined {
	return auth.getActiveAccountId({});
}

/** Fetch every account the active credentials are authorised to use. */
export async function fetchAuthorizedAccounts(): Promise<
	Array<{ id: string; name: string }>
> {
	return auth.fetchAllAccounts(
		{ compliance_region: await getComplianceRegion() },
		{ throwOnEmpty: false }
	);
}

/**
 * Run the interactive OAuth login flow, persisting cf's tokens on success.
 *
 * @returns `true` on success, `false` when env credentials are present.
 */
export async function login(opts?: {
	browser?: boolean;
	device?: boolean;
	scopes?: string[];
	profile?: string;
}): Promise<boolean> {
	if (opts?.scopes && !validateScopeKeys(opts.scopes)) {
		throw new Error(
			"One or more of the requested scopes are not valid cf OAuth scopes."
		);
	}
	return auth.login(
		{ compliance_region: await getComplianceRegion() },
		{
			browser: opts?.browser ?? true,
			device: opts?.device ?? true,
			...(opts?.scopes && { scopes: opts.scopes }),
			...(opts?.profile && { profile: opts.profile }),
		}
	);
}

/** Revoke the stored refresh token and delete cf's token file. */
export function logout(profile?: string): Promise<void> {
	return auth.logout(profile);
}

/** Set the auth profile used by subsequent credential lookups. */
export function setProfile(profile: string): void {
	auth.setProfile(profile);
}

/** Return the auth profile selected for the current invocation. */
export function getActiveProfile(): string {
	return auth.getActiveProfile();
}

/** Build cf's shared profile store using the CLI's logger. */
export function getProfileStore() {
	return createCfProfileStore({ logger });
}

/** Resolve and select the explicit or directory-bound auth profile. */
export function resolveProfile(profile?: string, cwd = process.cwd()): string {
	const resolved = getProfileStore().resolve({ profile, cwd });
	setProfile(resolved);
	return resolved;
}

/**
 * Read cf's stored OAuth access token, refreshing it first if expired.
 * Returns `undefined` when there is no stored token or the refresh fails.
 */
export function getValidToken(): Promise<string | undefined> {
	return auth.getOAuthTokenFromLocalState();
}

/** Whether cf has a stored OAuth token on disk. */
export function isOAuthLoggedIn(): boolean {
	return auth.readAuthCredentials()?.oauth_token !== undefined;
}

/** Read cf's stored OAuth credentials — `undefined` when not logged in. */
export function readAuthCredentials() {
	return auth.readAuthCredentials();
}

/** Path to cf's on-disk token file. */
export function getConfigPath(): string {
	return auth.getCredentialStore().path();
}
