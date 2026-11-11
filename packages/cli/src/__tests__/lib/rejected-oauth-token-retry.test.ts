import { writeAuthConfigFile } from "@cloudflare/workers-auth/cf";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

/**
 * Refreshing cf's stored OAuth token revokes the previous access token, so a
 * request sent with the token this process loaded fails with a 401 when
 * another cf process refreshed in between. The command should reread the
 * stored credentials and retry once with the token that is now current.
 */
describe("a request whose OAuth token another process refreshed", () => {
	runInTempDir();
	setupMsw();

	const env = {
		CLOUDFLARE_ACCOUNT_ID: "acct",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_API_TOKEN: undefined,
		CI: "true",
	};
	const namespacesUrl = `${TEST_BASE_URL}/accounts/acct/storage/kv/namespaces`;

	beforeEach(() => {
		writeAuthConfigFile({
			oauth_token: "loaded-token",
			refresh_token: "loaded-refresh-token",
			expiration_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
			scopes: [],
		} as never);
		vi.spyOn(process.stdout, "write").mockImplementation(() => true);
	});

	it("retries once with the token now stored, instead of failing with 401", async () => {
		const authorizations: (string | null)[] = [];
		server.use(
			http.get(namespacesUrl, ({ request }) => {
				const authorization = request.headers.get("authorization");
				authorizations.push(authorization);
				if (authorization !== "Bearer refreshed-token") {
					// Another cf process refreshed the login while this request was
					// on its way, revoking the access token it was sent with.
					writeAuthConfigFile({
						oauth_token: "refreshed-token",
						refresh_token: "refreshed-refresh-token",
						expiration_time: new Date(
							Date.now() + 60 * 60 * 1000
						).toISOString(),
						scopes: [],
					} as never);
					return HttpResponse.json(
						{
							success: false,
							errors: [{ code: 10000, message: "Authentication error" }],
							result: null,
						},
						{ status: 401 }
					);
				}
				return HttpResponse.json({ success: true, result: [] });
			})
		);

		await expect(runCf(["kv", "namespaces", "list"], env)).resolves.toEqual({
			exitCode: 0,
		});
		expect(authorizations).toEqual([
			"Bearer loaded-token",
			"Bearer refreshed-token",
		]);
	});
});
