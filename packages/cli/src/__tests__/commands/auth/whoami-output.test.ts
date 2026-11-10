import {
	createCfProfileStore,
	writeAuthConfigFile,
} from "@cloudflare/workers-auth/cf";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { mockOutputStreams } from "../../helpers/capture-output.js";
import { server, setupMsw, TEST_BASE_URL } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";

const ciInfo = vi.hoisted(() => ({ isCI: false }));
const agentContext = vi.hoisted(() => ({
	isAgentic: false,
	harness: null,
	sessionId: null,
}));
vi.mock("ci-info", () => ({ default: ciInfo }));
vi.mock("../../../lib/agent-context.js", () => ({
	detectAgentContext: () => agentContext,
}));
vi.mock("../../../lib/update-check.js", () => ({
	getUpdateNotice: () => undefined,
	maybeStartBackgroundUpdateCheck: () => {},
}));

const scopes = ["openid", "dns.read", "queues.read"];
const catalogue = [
	{ id: "dns.read", name: "DNS Read", category: "dns_and_zones" },
	{ id: "queues.read", name: "Queues Read", category: "developer_platform" },
];

function writeLogin(
	profile?: string,
	grantedScopes: string[] | undefined = scopes
) {
	writeAuthConfigFile(
		{
			oauth_token: `${profile ?? "default"}-token`,
			expiration_time: "2999-01-01T00:00:00.000Z",
			...(grantedScopes && { scopes: grantedScopes }),
		},
		profile
	);
}

describe("whoami output", () => {
	runInTempDir();
	setupMsw();
	const std = mockOutputStreams();
	let catalogueRequests = 0;
	let originalStdinTTY: PropertyDescriptor | undefined;
	let originalStdoutTTY: PropertyDescriptor | undefined;
	const profiles = createCfProfileStore({
		logger: { debug() {}, info() {}, log() {}, warn() {}, error() {} },
	});

	function setTTY(
		stream: NodeJS.ReadStream | NodeJS.WriteStream,
		value: boolean
	) {
		Object.defineProperty(stream, "isTTY", { value, configurable: true });
	}

	beforeEach(() => {
		originalStdinTTY = Object.getOwnPropertyDescriptor(process.stdin, "isTTY");
		originalStdoutTTY = Object.getOwnPropertyDescriptor(
			process.stdout,
			"isTTY"
		);
		setTTY(process.stdin, true);
		setTTY(process.stdout, true);
		ciInfo.isCI = false;
		agentContext.isAgentic = false;
		catalogueRequests = 0;
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CF_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_AUTH_PROFILE", undefined);
		vi.stubEnv("CLOUDFLARE_API_BASE_URL", TEST_BASE_URL);
		vi.stubEnv("CF_SEND_TELEMETRY", "false");
		writeLogin();
		server.use(
			http.get(`${TEST_BASE_URL}/user`, () =>
				HttpResponse.json({
					success: true,
					result: { email: "user@example.com" },
				})
			),
			http.get(`${TEST_BASE_URL}/accounts`, () =>
				HttpResponse.json({
					success: true,
					result: [
						{ id: "account-1", name: "Account One", settings: {} },
						{ id: "account-2", name: "Account Two", settings: {} },
					],
				})
			),
			http.get(`${TEST_BASE_URL}/memberships`, () =>
				HttpResponse.json({
					success: true,
					result: [
						{ account: { id: "account-1", name: "Account One" } },
						{ account: { id: "account-2", name: "Account Two" } },
					],
				})
			),
			http.get(`${TEST_BASE_URL}/user/tokens/verify`, () =>
				HttpResponse.json({ success: true, result: { status: "active" } })
			),
			http.get(`${TEST_BASE_URL}/oauth/scopes`, () => {
				catalogueRequests++;
				return HttpResponse.json({ success: true, result: catalogue });
			})
		);
	});

	afterEach(() => {
		for (const [stream, descriptor] of [
			[process.stdin, originalStdinTTY],
			[process.stdout, originalStdoutTTY],
		] as const) {
			if (descriptor) {
				Object.defineProperty(stream, "isTTY", descriptor);
			} else {
				Reflect.deleteProperty(stream, "isTTY");
			}
		}
	});

	it("shows a human summary with the activated profile once", async () => {
		writeLogin("work");
		profiles.bindings.activate("work", process.cwd());
		std.setStderrTTY(true);

		await runCf(["auth", "whoami"]);

		expect(std.out).toMatchInlineSnapshot(`
			"Status    Authenticated
			Method    OAuth
			Email     user@example.com
			Profile   work (activated for this directory)

			Accounts (2)
			  Account One  account-1
			  Account Two  account-2

			OAuth scopes (3 granted)
			Developer Platform  1/1
			DNS & Zones         1/1"
		`);
		expect(std.err).not.toContain("Active profile:");
		expect(std.err).toContain("cf auth scopes <product>");
		expect(std.err).toContain("cf auth scopes --all");
		expect(catalogueRequests).toBe(1);
	});

	it.each([
		{
			stdin: true,
			stdout: true,
			ci: false,
			agent: false,
			flags: [],
			json: false,
		},
		{
			stdin: true,
			stdout: false,
			ci: false,
			agent: false,
			flags: [],
			json: true,
		},
		{
			stdin: false,
			stdout: true,
			ci: false,
			agent: false,
			flags: [],
			json: true,
		},
		{
			stdin: true,
			stdout: true,
			ci: true,
			agent: false,
			flags: [],
			json: true,
		},
		{
			stdin: true,
			stdout: true,
			ci: false,
			agent: true,
			flags: [],
			json: true,
		},
		{
			stdin: true,
			stdout: true,
			ci: false,
			agent: false,
			flags: ["--json"],
			json: true,
		},
		{
			stdin: false,
			stdout: false,
			ci: true,
			agent: true,
			flags: ["--no-json"],
			json: false,
		},
		{
			stdin: false,
			stdout: false,
			ci: true,
			agent: true,
			flags: ["--json=false"],
			json: false,
		},
	])(
		"selects output for $stdin/$stdout TTY, CI $ci, agent $agent, flags $flags",
		async ({ stdin, stdout, ci, agent, flags, json }) => {
			setTTY(process.stdin, stdin);
			setTTY(process.stdout, stdout);
			std.setStderrTTY(true);
			ciInfo.isCI = ci;
			agentContext.isAgentic = agent;

			await runCf(["auth", "whoami", ...flags]);

			if (json) {
				expect(JSON.parse(std.out)).toMatchObject({
					authenticated: true,
					email: "user@example.com",
					scopes,
				});
				expect(catalogueRequests).toBe(0);
			} else {
				expect(std.out).toContain("Status    Authenticated");
				expect(std.out).not.toContain("dns.read");
			}
		}
	);

	it.each([
		{
			flags: ["--profile", "work"],
			envProfile: "personal",
			name: "work",
			source: "--profile",
		},
		{
			flags: [],
			envProfile: "personal",
			name: "personal",
			source: "CLOUDFLARE_AUTH_PROFILE",
		},
		{ flags: [], envProfile: undefined, name: "work", source: "directory" },
		{
			flags: ["--profile", "default"],
			envProfile: "personal",
			name: "default",
			source: "--profile",
		},
	])(
		"reports the selected profile $name from $source",
		async ({ flags, envProfile, name, source }) => {
			writeLogin("work");
			writeLogin("personal");
			profiles.bindings.activate("work", process.cwd());
			server.use(
				http.get(`${TEST_BASE_URL}/user`, ({ request }) => {
					expect(request.headers.get("Authorization")).toBe(
						`Bearer ${name}-token`
					);
					return HttpResponse.json({
						success: true,
						result: { email: "user@example.com" },
					});
				})
			);

			await runCf(["auth", "whoami", "--json", ...flags], {
				CLOUDFLARE_AUTH_PROFILE: envProfile,
			});

			expect(JSON.parse(std.out).profile).toEqual({
				name,
				source,
				overridden: false,
			});
		}
	);

	it("reports the default profile without directory activation", async () => {
		await runCf(["auth", "whoami", "--json"]);

		expect(JSON.parse(std.out).profile).toEqual({
			name: "default",
			source: "default",
			overridden: false,
		});
	});

	it("explains when an API token overrides an activated profile", async () => {
		writeLogin("work");
		profiles.bindings.activate("work", process.cwd());

		await runCf(["auth", "whoami"], {
			CLOUDFLARE_API_TOKEN: "environment-token",
		});

		expect(std.out).toContain("Method    API token (CLOUDFLARE_API_TOKEN)");
		expect(std.out).toContain(
			"Profile   work (activated for this directory; overridden by CLOUDFLARE_API_TOKEN)"
		);
		expect(std.out).toContain("API token permissions are not available here");
		expect(std.out).not.toContain("OAuth scopes");
		expect(catalogueRequests).toBe(0);
	});

	it("recognizes the supported CF_API_TOKEN alias", async () => {
		await runCf(["whoami"], { CF_API_TOKEN: "environment-token" });

		expect(std.out).toContain("Method    API token (CF_API_TOKEN)");
		expect(std.out).toContain("overridden by CF_API_TOKEN");
		expect(std.out).not.toContain("OAuth scopes");
		expect(catalogueRequests).toBe(0);
	});

	it("distinguishes unavailable account and email details from no access", async () => {
		for (const path of ["user", "accounts", "memberships"]) {
			server.use(
				http.get(`${TEST_BASE_URL}/${path}`, () =>
					HttpResponse.json({ success: false }, { status: 403 })
				)
			);
		}

		await runCf(["auth", "whoami"], { CLOUDFLARE_API_TOKEN: "limited-token" });

		expect(std.out).toContain("Status    Authenticated");
		expect(std.out).toContain("Email     Unavailable for these credentials");
		expect(std.out).toContain("Unavailable; could not list accounts");
		expect(std.out).not.toContain("No accessible accounts");
		expect(std.out).not.toContain("Accounts (0)");
	});

	it("shows a successful empty account list", async () => {
		for (const path of ["accounts", "memberships"]) {
			server.use(
				http.get(`${TEST_BASE_URL}/${path}`, () =>
					HttpResponse.json({ success: true, result: [] })
				)
			);
		}

		await runCf(["auth", "whoami"]);

		expect(std.out).toContain("Accounts (0)\n  No accessible accounts");
	});

	it.each(["disabled", "expired"])(
		"does not label a %s token authenticated",
		async (status) => {
			server.use(
				http.get(`${TEST_BASE_URL}/user/tokens/verify`, () =>
					HttpResponse.json({ success: true, result: { status } })
				)
			);

			await runCf(["auth", "whoami"], {
				CLOUDFLARE_API_TOKEN: "rejected-token",
			});

			expect(std.out).toContain(
				"Status    Credentials rejected (token disabled or expired)"
			);
		}
	);

	it("shows unknown validity when every API check fails", async () => {
		for (const path of [
			"user",
			"accounts",
			"memberships",
			"user/tokens/verify",
		]) {
			server.use(
				http.get(`${TEST_BASE_URL}/${path}`, () =>
					HttpResponse.json({ success: false }, { status: 503 })
				)
			);
		}

		await runCf(["auth", "whoami"], {
			CLOUDFLARE_API_TOKEN: "unverified-token",
		});

		expect(std.out).toContain(
			"Status    Credentials present; unable to verify"
		);
	});

	it("keeps the result when quiet and suppresses optional hints", async () => {
		await runCf(["auth", "whoami", "--quiet"]);

		expect(std.out).toContain("Profile   default (default profile)");
		expect(std.out).toContain("OAuth scopes (3 granted)");
		expect(std.err).not.toContain("View granted permissions");
		expect(std.err).not.toContain("cf auth scopes");
	});

	it("keeps scope catalogue failures compact", async () => {
		const manyScopes = Array.from(
			{ length: 450 },
			(_, index) => `permission-${index}.read`
		);
		writeLogin(undefined, manyScopes);
		server.use(
			http.get(`${TEST_BASE_URL}/oauth/scopes`, () =>
				HttpResponse.json({ success: false }, { status: 503 })
			)
		);

		await runCf(["auth", "whoami"]);

		expect(std.out).toContain("OAuth scopes (450 granted)");
		expect(std.out).toContain("Product grouping unavailable");
		expect(std.out).not.toContain("permission-");
		expect(std.out.split("\n").length).toBeLessThan(20);
	});

	it("preserves every scope in JSON without fetching the catalogue", async () => {
		const manyScopes = Array.from(
			{ length: 450 },
			(_, index) => `permission-${index}.read`
		);
		writeLogin(undefined, manyScopes);

		await runCf(["auth", "whoami", "--json"]);

		expect(JSON.parse(std.out).scopes).toEqual(manyScopes);
		expect(catalogueRequests).toBe(0);
	});

	it("keeps agent JSON parseable on a terminal with forced color", async () => {
		agentContext.isAgentic = true;
		vi.stubEnv("NO_COLOR", undefined);
		vi.stubEnv("FORCE_COLOR", "3");

		await runCf(["auth", "whoami"]);

		const rawOutput = String(vi.mocked(console.log).mock.lastCall?.[0]);
		expect(JSON.parse(rawOutput)).toMatchObject({
			authenticated: true,
			scopes,
		});
		expect(rawOutput).not.toContain("\u001b");
	});

	it.each(["--temporary-account", "--event-code=TEST"])(
		"rejects %s on the alias",
		async (flag) => {
			const flags = flag.startsWith("--event-code")
				? ["--temporary-account", flag]
				: [flag];
			await expect(runCf(["whoami", ...flags])).rejects.toThrow(
				"--temporary-account and --event-code are not supported by cf auth whoami."
			);
			expect(catalogueRequests).toBe(0);
		}
	);

	it("reuses the cached catalogue", async () => {
		await runCf(["auth", "whoami"]);
		await runCf(["auth", "whoami"]);

		expect(catalogueRequests).toBe(1);
	});

	it("explains missing OAuth scopes without fetching the catalogue", async () => {
		writeAuthConfigFile({
			oauth_token: "default-token",
			expiration_time: "2999-01-01T00:00:00.000Z",
		});

		await runCf(["auth", "whoami"]);

		expect(std.out).toContain("Scopes    Not recorded for this OAuth login");
		expect(catalogueRequests).toBe(0);
	});

	it("explains a login without product scopes", async () => {
		writeLogin(undefined, ["openid", "offline_access"]);

		await runCf(["auth", "whoami"]);

		expect(std.out).toContain("No product scopes granted");
		expect(catalogueRequests).toBe(0);
	});

	it("shows unauthenticated status and a profile-specific login hint", async () => {
		const { exitCode } = await runCf([
			"auth",
			"whoami",
			"--profile",
			"missing",
			"--quiet",
		]);

		expect(exitCode).toBe(0);
		expect(std.out).toContain("Status    Not authenticated");
		expect(std.out).toContain("Profile   missing (selected by --profile)");
		expect(std.err).toContain("cf auth create missing");
		expect(catalogueRequests).toBe(0);
	});

	it("explains an OAuth refresh failure", async () => {
		writeAuthConfigFile({
			oauth_token: "expired",
			refresh_token: "refresh",
			expiration_time: "2000-01-01T00:00:00.000Z",
		});
		server.use(
			http.post("https://dash.cloudflare.com/oauth2/token", () =>
				HttpResponse.json({ error: "invalid_grant" }, { status: 400 })
			)
		);

		await runCf(["auth", "whoami"]);

		expect(std.out).toContain("Status    Not authenticated");
		expect(std.out).toContain("Method    OAuth");
		expect(std.err).toContain("Could not refresh your OAuth credentials");
		expect(std.err).toContain("cf auth login --force");
	});

	it.each([{ flags: [] }, { flags: ["--json"] }, { flags: ["--no-json"] }])(
		"shares output and flags with cf whoami $flags",
		async ({ flags }) => {
			await runCf(["auth", "whoami", ...flags]);
			const canonical = std.getAndClearOut();
			std.getAndClearErr();

			await runCf(["whoami", ...flags]);

			expect(std.out).toBe(canonical);
		}
	);

	it("supports alias help and dry-run without API lookups", async () => {
		await runCf(["whoami", "--help"]);
		expect(std.getAndClearOut()).toContain("--json");

		await runCf(["whoami", "--dry-run", "--json"]);
		expect(JSON.parse(std.out)).toMatchObject({
			command: "cf whoami",
			executed: false,
		});
		expect(catalogueRequests).toBe(0);
	});
});
