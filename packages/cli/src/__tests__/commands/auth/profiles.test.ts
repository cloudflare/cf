import { randomUUID } from "node:crypto";
import {
	createCfProfileStore,
	writeAuthConfigFile,
} from "@cloudflare/workers-auth/cf";
import {
	mockConsoleMethods,
	runInTempDir,
} from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { getGlobalDispatcher, MockAgent, setGlobalDispatcher } from "undici";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { server, setupMsw, TEST_BASE_URL } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";

function createProfile(name: string, token = `${name}-token`): void {
	writeAuthConfigFile(
		{ oauth_token: token, expiration_time: "2999-01-01T00:00:00.000Z" },
		name
	);
}

describe("cf auth profiles", () => {
	runInTempDir();
	setupMsw();
	const std = mockConsoleMethods();
	const mockAgent = new MockAgent();
	const previousDispatcher = getGlobalDispatcher();
	const store = createCfProfileStore({
		logger: {
			debug: () => {},
			info: () => {},
			log: () => {},
			warn: () => {},
			error: () => {},
		},
	});

	beforeAll(() => {
		mockAgent.disableNetConnect();
		mockAgent
			.get("https://dash.cloudflare.com")
			.intercept({ path: "/oauth2/revoke", method: "POST" })
			.reply(200, "")
			.persist();
		setGlobalDispatcher(mockAgent);
	});

	afterAll(async () => {
		setGlobalDispatcher(previousDispatcher);
		await mockAgent.close();
	});

	it("activates, lists, and deactivates a named profile", async () => {
		const cwd = process.cwd();

		createProfile("work");

		await runCf(["auth", "activate", "work"]);
		expect(store.bindings.getProfileForDirectory(cwd)).toBe("work");
		expect(std.getAndClearOut()).toMatchInlineSnapshot(
			`"ℹ Profile "work" activated for "<cwd>"."`
		);

		await runCf(["auth", "list"]);
		expect(std.getAndClearOut()).toMatchInlineSnapshot(`
			"[
			  {
			    "name": "work",
			    "boundDirectories": [
			      "<cwd>"
			    ]
			  }
			]"
		`);

		await runCf(["auth", "deactivate"]);
		expect(store.bindings.getProfileForDirectory(cwd)).toBeUndefined();
		expect(std.getAndClearOut()).toMatchInlineSnapshot(`
			"ℹ Profile "work" deactivated from "<cwd>".
			→ Run cf auth login to set up the default profile, or cf auth create <name> to create a named profile."
		`);
	});

	it("uses an explicitly selected profile for API commands", async () => {
		const token = randomUUID();

		server.use(
			http.get(`${TEST_BASE_URL}/zones`, ({ request }) => {
				if (request.headers.get("authorization") !== `Bearer ${token}`) {
					throw new Error("Invalid token");
				}

				return HttpResponse.json({ success: true, result: [] });
			})
		);

		createProfile("work", token);

		await runCf(["zones", "list", "--profile", "work"], {
			CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		});

		expect(std.err).toBe("");
	});

	it("uses the nearest directory-bound profile for API commands", async () => {
		const token = randomUUID();

		createProfile("work", token);
		store.bindings.activate("work", process.cwd());

		server.use(
			http.get(`${TEST_BASE_URL}/zones`, ({ request }) => {
				if (request.headers.get("authorization") !== `Bearer ${token}`) {
					throw new Error("Invalid token");
				}

				return HttpResponse.json({ success: true, result: [] });
			})
		);

		await runCf(["zones", "list"], {
			CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		});

		expect(std.err).toBe("");
	});

	it("deletes credentials and every binding for a profile", async () => {
		createProfile("work");
		store.bindings.activate("work", process.cwd());

		await runCf(["auth", "delete", "work"]);

		expect(store.configs.exists("work")).toBe(false);
		expect(store.bindings.getBindingsForProfile("work")).toEqual([]);
		expect(std.out).toMatchInlineSnapshot(`
			"ℹ Removed directory bindings:
			  <cwd>
			ℹ Profile "work" deleted.
			→ No active profile for this directory. Run cf auth login to set up the default profile, or cf auth create <name> to create a named profile."
		`);
	});

	it("does not duplicate the active profile in whoami output", async () => {
		await runCf(["auth", "whoami", "--profile", "work"]);

		expect(std.out).toMatchInlineSnapshot(`
			"{
			  "authenticated": false,
			  "error": "Not logged in"
			}"
		`);
	});

	it("rejects reserved profile names before starting OAuth", async () => {
		await expect(runCf(["auth", "create", "default"])).rejects.toThrow(
			/"default" is a reserved profile name/
		);
	});

	it("does not allow profile mutations while env credentials are set", async () => {
		createProfile("work");

		await expect(
			runCf(["auth", "activate", "work"], {
				CLOUDFLARE_API_TOKEN: "env-token",
			})
		).rejects.toThrow(/Cannot manage auth profiles/);
		expect(
			store.bindings.getProfileForDirectory(process.cwd())
		).toBeUndefined();
	});

	it("keeps login and logout reserved for the default profile", async () => {
		await expect(runCf(["auth", "login", "--profile", "work"])).rejects.toThrow(
			/cf auth create <name>/
		);
		await expect(
			runCf(["auth", "logout", "--profile", "work"])
		).rejects.toThrow(/cf auth delete <name>/);
	});

	it("warns that login and logout target default in a bound directory", async () => {
		// Keep login on its already-authenticated path so the test does not start an OAuth callback server or open a browser.
		createProfile("default");

		createProfile("work");
		store.bindings.activate("work", process.cwd());

		await runCf(["auth", "login"]);
		expect(std.getAndClearOut()).toMatchInlineSnapshot(`
			"⚠ This directory has profile "work" active. \`cf auth login\` updates the default profile, not "work".
			To re-authenticate "work", run \`cf auth create work\`.
			ℹ You are already logged in.
			Config file: <cwd>/home/.config/cloudflare/config/default.json
			Token expires: 1/1/2999, 12:00:00 AM
			→ Run cf auth login --force to re-authenticate, or cf auth logout to log out."
		`);

		await runCf(["auth", "logout"]);
		expect(std.getAndClearOut()).toMatchInlineSnapshot(`
			"⚠ This directory has profile "work" active. \`cf auth logout\` removes the default profile's token, not "work".
			To delete "work", run \`cf auth delete work\`.
			ℹ Logging out...
			Removed: OAuth tokens from <cwd>/home/.config/cloudflare/config/default.json"
		`);
	});
});
