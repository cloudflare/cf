import { writeFile } from "node:fs/promises";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { mockOutputStreams } from "../../helpers/capture-output.js";
import { runCf } from "../../helpers/run-cf.js";

const sharedAuth = vi.hoisted(() => ({
	activeProfile: "default",
	credentials: undefined as
		| { oauth_token?: string; scopes: string[] }
		| undefined,
	login: vi.fn(),
}));

const telemetryEvents = vi.hoisted(
	() => [] as Array<{ name: string; properties: Record<string, unknown> }>
);

vi.mock("@cloudflare/workers-auth/cf", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	createCfAuth: () => ({
		setProfile: (profile: string) => {
			sharedAuth.activeProfile = profile;
		},
		getActiveProfile: () => sharedAuth.activeProfile,
		getCredentialStore: () => ({ path: () => "/test/auth.json" }),
		readAuthCredentials: () => sharedAuth.credentials,
		// Stored tokens never refresh, so they read as invalid or expired.
		getOAuthTokenFromLocalState: async () => undefined,
		login: sharedAuth.login,
	}),
}));

vi.mock("../../../lib/telemetry/dispatcher.js", () => ({
	getTelemetryDispatcher: () => ({
		enabled: true,
		sendCommandEvent: (name: string, properties: Record<string, unknown>) =>
			telemetryEvents.push({ name, properties }),
		sendAdhocEvent: vi.fn(),
	}),
}));

describe("cf auth device login", () => {
	runInTempDir();
	const std = mockOutputStreams();

	beforeEach(() => {
		sharedAuth.activeProfile = "default";
		sharedAuth.credentials = undefined;
		sharedAuth.login.mockReset().mockResolvedValue(true);
		telemetryEvents.length = 0;
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
	});

	it("uses the device authorization flow by default", async () => {
		await runCf(["auth", "login", "--no-browser"]);

		expect(sharedAuth.login).toHaveBeenCalledOnce();
		expect(sharedAuth.login).toHaveBeenCalledWith(
			{ compliance_region: "public" },
			{
				browser: false,
				device: true,
				profile: "default",
			}
		);
	});

	it("delegates cf login to cf auth login with a notice", async () => {
		await runCf(["login", "--no-browser"]);

		expect(sharedAuth.login).toHaveBeenCalledOnce();
		expect(sharedAuth.login).toHaveBeenCalledWith(
			{ compliance_region: "public" },
			{
				browser: false,
				device: true,
				profile: "default",
			}
		);
		expect(std.err).toContain(
			"cf login is an alias for cf auth login. Authentication commands are under cf auth."
		);
		expect(telemetryEvents[0]).toMatchObject({
			name: "cf command started",
			properties: {
				command: "login",
				sanitizedArgs: {
					browser: false,
				},
			},
		});
	});

	it("suppresses the cf login alias notice with --quiet", async () => {
		await runCf(["login", "--quiet", "--no-browser"]);

		expect(sharedAuth.login).toHaveBeenCalledOnce();
		expect(std.err).not.toContain("cf login is an alias");
	});

	it("loads file-sourced Cloudflare variables for login", async () => {
		await writeFile(".env", "CLOUDFLARE_API_TOKEN=file-token");

		await runCf(["auth", "login", "--no-browser"]);

		expect(sharedAuth.login).not.toHaveBeenCalled();
		expect(std.out).toBe("");
		expect(std.err).toMatchInlineSnapshot(
			`"▲  CLOUDFLARE_API_TOKEN is set and takes precedence. Unset it to log in via OAuth."`
		);
		expect(process.env.CLOUDFLARE_API_TOKEN).toBeUndefined();
	});

	it("can opt back into the localhost callback flow", async () => {
		await runCf([
			"auth",
			"login",
			"--no-browser",
			"--no-device",
			"--scopes",
			"dns.read",
		]);

		expect(sharedAuth.login).toHaveBeenCalledOnce();
		expect(sharedAuth.login).toHaveBeenCalledWith(
			{ compliance_region: "public" },
			{
				browser: false,
				device: false,
				profile: "default",
				scopes: ["dns.read"],
			}
		);
		expect(telemetryEvents[0]).toMatchObject({
			name: "cf command started",
			properties: {
				command: "auth login",
				sanitizedArgs: {
					browser: false,
					device: false,
					scopes: "<REDACTED>",
				},
			},
		});
	});

	it("uses the device authorization flow for named profiles by default", async () => {
		await runCf(["auth", "create", "work", "--no-browser"]);

		expect(sharedAuth.login).toHaveBeenCalledOnce();
		expect(sharedAuth.login).toHaveBeenCalledWith(
			{ compliance_region: "public" },
			{
				browser: false,
				device: true,
				profile: "work",
			}
		);
	});

	it("confirms a new named profile and shows how to activate it", async () => {
		std.setStderrTTY(true);

		await runCf(["auth", "create", "work", "--no-browser"]);

		expect(std.out).toBe("");
		expect(std.err).toContain('✓ Profile "work" created.');
		expect(std.err).toContain(
			"●  To use this profile in a directory, run:\n\n   cf auth activate work"
		);
	});

	it("can use the localhost callback flow for named profiles", async () => {
		await runCf([
			"auth",
			"create",
			"work",
			"--no-browser",
			"--no-device",
			"--scopes",
			"dns.read",
		]);

		expect(sharedAuth.login).toHaveBeenCalledOnce();
		expect(sharedAuth.login).toHaveBeenCalledWith(
			{ compliance_region: "public" },
			{
				browser: false,
				device: false,
				profile: "work",
				scopes: ["dns.read"],
			}
		);
		expect(telemetryEvents[0]).toMatchObject({
			name: "cf command started",
			properties: {
				command: "auth create",
				sanitizedArgs: {
					browser: false,
					device: false,
					scopes: "<REDACTED>",
				},
			},
		});
	});

	it("accepts production-registered explicit scopes", async () => {
		await runCf(["auth", "login", "--no-browser", "--scopes", "dns.read"]);

		expect(sharedAuth.login).toHaveBeenCalledWith(
			{ compliance_region: "public" },
			{
				browser: false,
				device: true,
				profile: "default",
				scopes: ["dns.read"],
			}
		);
	});

	it("lists up to five selected scopes after login", async () => {
		sharedAuth.credentials = {
			scopes: ["one", "two", "three", "four", "five"],
		};

		await runCf(["auth", "login", "--no-browser"]);

		expect(std.out).toBe("");
		expect(std.err).toContain("Scopes: one, two, three, four, five");
		expect(std.err).not.toContain("cf auth whoami");
	});

	it("summarizes more than five selected scopes after login", async () => {
		sharedAuth.credentials = {
			scopes: ["one", "two", "three", "four", "five", "six"],
		};

		await runCf(["auth", "login", "--no-browser"]);

		expect(std.out).toBe("");
		expect(std.err).toMatchInlineSnapshot(`
			"●  Starting OAuth login flow...
			●  Config file: /test/auth.json
			│  Scopes: 6 selected. Run cf auth whoami to see the full list."
		`);
	});

	it("starts a fresh login when the stored tokens are invalid", async () => {
		sharedAuth.credentials = { oauth_token: "expired", scopes: ["one"] };

		await runCf(["auth", "login", "--no-browser"]);

		expect(sharedAuth.login).toHaveBeenCalledOnce();
		expect(std.out).toBe("");
		expect(std.err).toMatchInlineSnapshot(`
			"▲  Existing tokens are invalid or expired. Starting fresh login...
			●  Starting OAuth login flow...
			●  Config file: /test/auth.json
			│  Scopes: one"
		`);
	});

	it("re-authenticates with --force when already logged in", async () => {
		sharedAuth.credentials = { oauth_token: "token", scopes: ["one"] };

		await runCf(["auth", "login", "--force", "--no-browser"]);

		expect(sharedAuth.login).toHaveBeenCalledOnce();
		expect(std.out).toBe("");
		expect(std.err).toMatchInlineSnapshot(`
			"●  Re-authenticating...
			●  Starting OAuth login flow...
			●  Config file: /test/auth.json
			│  Scopes: one"
		`);
	});
});
