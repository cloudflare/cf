import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getGlobalConfigPath } from "@cloudflare/workers-utils";
import { http, HttpResponse } from "msw/http";
import { createFetchResult, msw } from "./msw";

const temporaryPreviewAccountUrl = "*/provisioning/previews";

const termsOfService = "https://www.cloudflare.com/terms/";
const privacyPolicy = "https://www.cloudflare.com/privacypolicy/";

/** The terms notice workers-auth prints instead of prompting in CI. */
export const TEMPORARY_TERMS_NOTICE = `Continuing means you accept Cloudflare's Terms of Service (${termsOfService}) and Privacy Policy (${privacyPolicy}).`;

/** The terms prompt workers-auth asks interactively. */
export const TEMPORARY_TERMS_PROMPT = `You must accept Cloudflare's Terms of Service (${termsOfService}) and Privacy Policy (${privacyPolicy}) in order to continue. By typing "yes", you agree to these terms. Type "yes" to continue.`;

/**
 * cf's temporary-account cache. Computed lazily so `runInTempDir()`'s HOME and
 * XDG_CONFIG_HOME stubs are honoured.
 */
export function temporaryAccountCachePath(environment = "production"): string {
	return join(
		getGlobalConfigPath({
			appName: "cloudflare",
			leadingDot: false,
			useLegacyHomeDir: false,
		}),
		environment === "production"
			? "cloudflare-temporary-account.json"
			: `cloudflare-temporary-account.${environment}.json`
	);
}

/**
 * Write raw contents to cf's temporary-account cache.
 */
export function writeTemporaryAccountCache(contents: unknown): void {
	const path = temporaryAccountCachePath();
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, JSON.stringify(contents));
}

/** Mocks the proof-of-work challenge with a difficulty that solves instantly. */
export function mockTemporaryPreviewChallenge(): void {
	msw.use(
		http.post(`${temporaryPreviewAccountUrl}/challenge`, () =>
			HttpResponse.json(
				createFetchResult({
					challengeToken: "challenge-token",
					seed: Buffer.alloc(32, 1).toString("base64url"),
					k: 2,
					g: 2,
					s: 16,
					expiresAt: 9999999999,
				})
			)
		)
	);
}

/**
 * Mocks the temporary preview-account challenge and creation endpoints. The
 * created account is `preview-account-id` with token `preview-account-token`,
 * and event codes are acknowledged.
 * Records creation request bodies and headers as requests arrive.
 */
export function mockTemporaryPreviewAccount(): Array<{
	body: { eventCode?: string };
	contentType: string | null;
	url: string;
}> {
	const creationRequests: Array<{
		body: { eventCode?: string };
		contentType: string | null;
		url: string;
	}> = [];
	mockTemporaryPreviewChallenge();
	msw.use(
		http.post(temporaryPreviewAccountUrl, async ({ request }) => {
			const body = (await request.json()) as { eventCode?: string };
			creationRequests.push({
				body,
				contentType: request.headers.get("Content-Type"),
				url: request.url,
			});
			return HttpResponse.json(
				createFetchResult({
					account: {
						id: "preview-account-id",
						name: "Preview Account Alpha",
						type: "standard",
						apiToken: "preview-account-token",
						tokenId: "preview-token-id",
						expiresAt: "2999-01-01T00:00:00.000Z",
					},
					claim: {
						token: "claim-token",
						url: "https://dash.cloudflare.com/claim-preview?claimToken=claim-token",
						expiresAt: "2999-01-02T00:00:00.000Z",
					},
					...(body.eventCode ? { eventCodeAccepted: true } : {}),
				})
			);
		})
	);
	return creationRequests;
}
