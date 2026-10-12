/**
 * Cloudflare Access credentials for AI Gateway custom domains.
 *
 * A Cloudflare API token authenticates the account but carries no user
 * identity, so AI Gateway cannot attribute the request to a person. An
 * individual Access token does: the gateway resolves it and records
 * `cf.user_id`. This module acquires that token for an Access-protected
 * gateway hostname.
 *
 * Acquisition is delegated to `cloudflared`, which owns the login flow and
 * the on-disk token cache. The Access authorization server advertises only
 * authorization-code and refresh-token grants (no device code), so an
 * interactive login is the supported path for a first-time or expired
 * session.
 */
import { x } from "tinyexec";

/** Header slots an Access application may accept the token in. */
export type AccessTokenSlot = "cf-access-token" | "cookie";

export interface AccessCredential {
	token: string;
	slot: AccessTokenSlot;
}

/**
 * Discovery document Access serves for a protected resource. Absence of the
 * document means the hostname is not Access-protected.
 */
interface ProtectedResourceMetadata {
	protected?: boolean;
	team_domain?: string;
	authentication_methods?: Array<{ name?: string }>;
}

export interface AccessProtection {
	protected: boolean;
	teamDomain?: string;
	methods: string[];
}

/** Whether a hostname sits behind Access, and how it expects to be authenticated. */
export async function detectAccessProtection(
	origin: string,
	fetchImpl: typeof globalThis.fetch = globalThis.fetch
): Promise<AccessProtection> {
	const url = `${origin.replace(/\/$/, "")}/.well-known/cloudflare-access-protected-resource`;
	try {
		const response = await fetchImpl(url, {
			signal: AbortSignal.timeout(10_000),
		});
		if (!response.ok) {
			return { protected: false, methods: [] };
		}
		const metadata = (await response.json()) as ProtectedResourceMetadata;
		return {
			protected: metadata.protected === true,
			teamDomain: metadata.team_domain,
			methods: (metadata.authentication_methods ?? [])
				.map((method) => method.name)
				.filter((name): name is string => typeof name === "string"),
		};
	} catch {
		return { protected: false, methods: [] };
	}
}

function isJwt(value: string): boolean {
	return /^ey[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(
		value.trim()
	);
}

/**
 * Read a cached Access token for `origin`.
 *
 * `cloudflared access token` exits 0 and prints a human-readable message when
 * no token is cached, so the output shape decides success rather than the exit
 * code.
 */
export async function readCachedAccessToken(
	origin: string
): Promise<string | undefined> {
	try {
		const result = await x(
			"cloudflared",
			["access", "token", `--app=${origin}`],
			{
				nodeOptions: { stdio: ["ignore", "pipe", "pipe"] },
			}
		);
		const token = result.stdout.trim();
		return isJwt(token) ? token : undefined;
	} catch {
		return undefined;
	}
}

/**
 * Run the interactive Access login for `origin`, then return the token.
 *
 * stdio is inherited so the user sees the verification URL and can complete
 * the browser flow.
 */
export async function loginForAccessToken(
	origin: string
): Promise<string | undefined> {
	try {
		await x("cloudflared", ["access", "login", "--no-verbose", origin], {
			nodeOptions: { stdio: "inherit" },
		});
	} catch {
		return undefined;
	}
	return readCachedAccessToken(origin);
}

export interface AcquireAccessTokenOptions {
	/** Prompt for an interactive login when no cached token exists. */
	interactive?: boolean;
}

/**
 * Obtain an individual Access token for `origin`, logging in when permitted.
 */
export async function acquireAccessToken(
	origin: string,
	options: AcquireAccessTokenOptions = {}
): Promise<string> {
	const cached = await readCachedAccessToken(origin);
	if (cached) {
		return cached;
	}
	if (options.interactive === false) {
		throw new Error(
			`No Cloudflare Access session for ${origin}. Run: cloudflared access login ${origin}`
		);
	}
	const token = await loginForAccessToken(origin);
	if (!token) {
		throw new Error(
			`Unable to obtain a Cloudflare Access token for ${origin}. Run: cloudflared access login ${origin}`
		);
	}
	return token;
}

interface AccessClaims {
	email?: string;
	sub?: string;
	exp?: number;
	iat?: number;
}

/**
 * Decode an Access token's claims for display.
 *
 * The signature is not verified: Access verifies it at the edge, and cf only
 * needs the claims to report who the session belongs to and when it lapses.
 */
export function describeAccessToken(token: string): AccessClaims | undefined {
	const payload = token.split(".")[1];
	if (!payload) {
		return undefined;
	}
	try {
		const padded = payload.padEnd(
			payload.length + ((4 - (payload.length % 4)) % 4),
			"="
		);
		return JSON.parse(
			Buffer.from(padded, "base64url").toString("utf8")
		) as AccessClaims;
	} catch {
		return undefined;
	}
}
