/**
 * cf's OAuth wiring.
 *
 * The shared package owns cf's identity, scopes, callback handling, credential
 * storage, refresh, and keyring support. This module only supplies cf's
 * logger and prompt primitives, then preserves the façade consumed by commands.
 */
import { isCancel } from "@clack/core";
import * as clack from "@clack/prompts";
import {
	createCfAuth,
	createCfProfileStore,
	setKeyringPreference as setSharedKeyringPreference,
	validateScopeKeys,
	type AuthContext,
} from "@cloudflare/workers-auth/cf";
import { USER_AGENT, VERSION } from "../../version.js";
import { hasQuietFlag } from "../args.js";
import { CliExit } from "../cli-exit.js";
import { getComplianceRegion, type ComplianceRegion } from "../context.js";
import { wrapPromptMessage } from "../dialog.js";
import { MissingCredentialsError } from "../errors.js";
import { isNonInteractiveOrCI } from "../interactive.js";
import { openSession } from "../session.js";
import { printAccountConfigHint } from "./account-hint.js";
import type { TemporaryAccountRequest } from "@cloudflare/workers-auth";

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
	const result = await clack.text({
		message: wrapPromptMessage(question),
		output: process.stderr,
	});
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
		output: process.stderr,
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

let temporaryAccountRequested = false;

/**
 * Record whether the user requested --temporary-account for this invocation.
 * An event code applies only when creating a new account, not reusing one.
 */
export function setTemporaryAccountRequested(
	requested: boolean,
	request?: TemporaryAccountRequest
): void {
	temporaryAccountRequested = requested;
	auth.setTemporaryAllowed(requested, request);
}

/** Whether the user requested --temporary-account for this invocation. */
export function isTemporaryAccountRequested(): boolean {
	return temporaryAccountRequested;
}

/**
 * Provision or reuse this invocation's temporary preview account. workers-auth
 * keeps it active for later calls and rejects it when credentials exist.
 * Every invocation must opt in, even when an account is already cached.
 */
export async function requireTemporaryAccount(options?: {
	isPreview?: boolean;
	complianceRegion?: ComplianceRegion;
}): Promise<{ accountId: string; apiToken: string }> {
	if (!isTemporaryAccountRequested()) {
		throw new Error("Temporary accounts require --temporary-account.");
	}

	try {
		const accountId = await auth.requireAuth({
			compliance_region:
				options?.complianceRegion ?? (await getComplianceRegion(options)),
		});
		const { apiToken } = auth.requireApiToken() as { apiToken: string };
		return { accountId, apiToken };
	} catch (error) {
		// workers-auth's shared temporary-account errors name Wrangler's
		// `--temporary` flag. Keep cf's public spelling in those messages.
		if (error instanceof Error) {
			error.message = error.message.replaceAll(
				/--temporary(?!-account)/g,
				"--temporary-account"
			);
		}
		throw error;
	}
}

/** Resolve a configured, cached, or newly selected account ID. */
export async function getOrSelectAccountId(
	accountId?: string,
	options?: { isPreview?: boolean; complianceRegion?: ComplianceRegion }
): Promise<string> {
	try {
		return await auth.getOrSelectAccountId({
			account_id: accountId,
			compliance_region:
				options?.complianceRegion ?? (await getComplianceRegion(options)),
		});
	} catch (error) {
		// Older workers-auth releases omit the structured failure reason. Use
		// credential state at this boundary rather than parsing their message.
		if (
			error instanceof Error &&
			!("reason" in error) &&
			"telemetryMessage" in error &&
			error.telemetryMessage === "cfetch auth login required" &&
			isNonInteractiveOrCI() &&
			auth.getAPIToken() === undefined
		) {
			throw new MissingCredentialsError(error.message, { cause: error });
		}
		throw error;
	}
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

/**
 * Clear any cached temporary account, then revoke the stored refresh token and
 * delete cf's token file. Prints workers-auth's shared logout messages.
 */
export function logout(profile?: string): Promise<void> {
	return auth.logout(profile);
}

/** Set the auth profile used by subsequent credential lookups. */
export function setProfile(profile: string): void {
	auth.setProfile(profile);
}

/** Apply cf's global credential-storage preference through the shared auth layer. */
export function setKeyringPreference(enabled: boolean): void {
	setSharedKeyringPreference(enabled, {
		logger,
		getCredentialStore: () => auth.getCredentialStore(),
	});
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
