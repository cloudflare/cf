import { beforeEach, describe, it, vi } from "vitest";
import {
	msw,
	mswSuccessOauthHandlers,
	mswSuccessUserHandlers,
} from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";

// `./helpers/mock-oauth-flow` transitively imports a non-existent
// `../../open-in-browser` module from wrangler — substitute a no-op stub
// since the suite is skipped (test bodies never execute, but suite-level
// setup like `mockOAuthFlow()` is still called by Vitest).
// eslint-disable-next-line no-unused-vars -- mock helper retained as scaffolding for skipped/todo or not-yet-ported tests
const mockOAuthFlow = () => ({
	mockOAuthServerCallback: (_kind?: string) => {},
});

// The canonical cases below are retained even where cf's equivalent auth
// behavior lives behind a different command or helper. Wrangler-only staging,
// callback customization, and token-export surfaces remain skipped; missing
// behavior shared by cf's auth design is marked todo.
describe("User", () => {
	runInTempDir();

	beforeEach(() => {
		msw.use(...mswSuccessOauthHandlers, ...mswSuccessUserHandlers);
	});

	describe("login", () => {
		it.todo("should login a user when `wrangler login` is run");

		it.skip(
			"should login a user when `wrangler login` is run with an ip address for custom callback-host"
		);

		it.skip(
			"should login a user when `wrangler login` is run with a domain name for custom callback-host"
		);

		it.skip(
			"should login a user when `wrangler login` is run with custom callbackPort param"
		);

		it.skip("login works in a different environment");

		it.todo('should error if the compliance region is not "public"');
	});

	it.todo(
		"should handle errors for failed token refresh in a non-interactive environment"
	);

	it.todo("should confirm no error message when refresh is successful");

	it.todo("should revert to non-interactive mode if in CI");

	it.todo("should revert to non-interactive mode if isTTY throws an error");

	it.skip("should have auth per environment");

	it.skip("should not warn on invalid wrangler.toml when logging in");

	describe("auth token", () => {
		it.skip("should output the OAuth token when logged in with a valid token");

		it.skip("should refresh and output the token when the token is expired");

		it.skip("should error when not logged in");

		it.skip("should output the API token from environment variable");

		it.skip("should error when using global auth key/email without --json");

		it.skip(
			"should output JSON with key and email when using global auth key/email with --json"
		);

		it.skip("should output JSON with oauth type when logged in with --json");

		it.skip(
			"should output JSON with api_token type when using CLOUDFLARE_API_TOKEN with --json"
		);

		it.skip("should error when token refresh fails and user is not logged in");
	});

	describe("getOAuthTokenFromLocalState", () => {
		it.todo("should return undefined when not logged in");

		it.todo("should return the OAuth token when logged in with a valid token");

		it.todo("should refresh and return the token when expired");

		it.todo("should return undefined when token refresh fails");
	});

	describe("account caching", () => {
		beforeEach(() => {
			vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		});

		it.todo(
			"should only prompt for account selection once when getAccountId is called multiple times"
		);

		it.todo("should use account_id from config without prompting");

		it.todo(
			"should cache account when only one account is available (no prompt needed)"
		);
	});
});
