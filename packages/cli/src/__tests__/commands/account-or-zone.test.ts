import { readFileSync } from "node:fs";
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
import { captureOutput } from "../helpers/capture-output.js";
import {
	createFetchResult,
	server,
	setupMsw,
	TEST_BASE_URL,
} from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

/**
 * End-to-end coverage for the paired
 * `/{account_or_zone}/{account_or_zone_id}/` path-template convention.
 *
 * The same generated command must default to account scope and switch to zone
 * scope only when the global --zone flag is explicitly present. Load balancer
 * listing is a small typed request that exercises both generated request
 * properties without requiring a request body.
 */
describe("combined account-or-zone scope", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CI: "true",
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};
	const ZONE_ID = "0123456789abcdef0123456789abcdef";

	let output: ReturnType<typeof captureOutput>;

	beforeEach(() => {
		output = captureOutput();
	});

	afterEach(() => vi.restoreAllMocks());

	function loadBalancerRequests(): string[] {
		const requests: string[] = [];
		server.use(
			http.get(`${TEST_BASE_URL}/:scope/:id/load_balancers`, ({ params }) => {
				requests.push(`${String(params.scope)}/${String(params.id)}`);
				return HttpResponse.json({ success: true, result: [] });
			})
		);
		return requests;
	}

	it("uses the account route by default", async () => {
		const requests = loadBalancerRequests();

		const { exitCode } = await runCf(
			["load-balancers", "account", "list"],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(requests).toEqual(["accounts/test-account"]);
	});

	it("uses the zone route when --zone is explicitly provided", async () => {
		const requests = loadBalancerRequests();

		const { exitCode } = await runCf(
			["load-balancers", "account", "list", "--zone", ZONE_ID],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(requests).toEqual([`zones/${ZONE_ID}`]);
	});

	it("keeps the account route when only CLOUDFLARE_ZONE_ID is set", async () => {
		const requests = loadBalancerRequests();

		const { exitCode } = await runCf(["load-balancers", "account", "list"], {
			...ENV,
			CLOUDFLARE_ZONE_ID: ZONE_ID,
		});

		expect(exitCode).toBe(0);
		expect(requests).toEqual(["accounts/test-account"]);
	});

	it.each([
		[[], "accounts/test-account"],
		[["--zone", ZONE_ID], `zones/${ZONE_ID}`],
	])(
		"resolves subscription scope from global context with %j",
		async (flags, scope) => {
			let requested = false;
			server.use(
				http.get(`${TEST_BASE_URL}/${scope}/subscriptions`, () => {
					requested = true;
					return HttpResponse.json({ success: true, result: [] });
				})
			);
			const result = await runCf(
				["accounts", "subscriptions", "get", ...flags],
				ENV
			);
			expect(result.exitCode).toBe(0);
			expect(requested).toBe(true);
		}
	);

	it("previews the same account and zone scope selection", async () => {
		await runCf(["load-balancers", "account", "list", "--dry-run"], ENV);
		const accountPreview = JSON.parse(output.stdout()) as {
			url: string;
			pathParams: Record<string, string>;
		};

		vi.restoreAllMocks();
		output = captureOutput();
		await runCf(
			["load-balancers", "account", "list", "--zone", ZONE_ID, "--dry-run"],
			ENV
		);
		const zonePreview = JSON.parse(output.stdout()) as {
			url: string;
			pathParams: Record<string, string>;
		};

		expect(accountPreview.url).toContain(
			"/accounts/test-account/load_balancers"
		);
		expect(accountPreview.pathParams).toMatchObject({
			"account-or-zone": "accounts",
			"account-or-zone-id": "test-account",
		});
		expect(zonePreview.url).toContain(`/zones/${ZONE_ID}/load_balancers`);
		expect(zonePreview.pathParams).toMatchObject({
			"account-or-zone": "zones",
			"account-or-zone-id": ZONE_ID,
		});
	});

	it("explains how the scope is picked in help", async () => {
		const help = async (command: string[]) => {
			output.clear();
			await runCf([...command, "--help"]);
			return output.stdout().replace(/\s+/g, " ");
		};
		const scope =
			"Runs against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.";

		expect(await help(["load-balancers", "account", "list"])).toContain(scope);
		expect(await help(["zones", "list"])).not.toContain(scope);
	});

	it.each([
		[["--zone", "--dry-run"]],
		[["--zone=", "--dry-run"]],
		[["--zone", "", "--dry-run"]],
	])(
		"rejects an empty zone in %j instead of switching scope",
		async (flags) => {
			await expect(
				runCf(["load-balancers", "account", "list", ...flags], ENV)
			).rejects.toThrow("--zone requires a non-empty value.");
			expect(output.stdout()).toBe("");
		}
	);

	// A zone name needs an account too: names are looked up in its zones.
	it.each([[[]], [["--zone", "example.com"]]])(
		"fails before any request when no account can be picked, with %j",
		async (flags) => {
			const accounts = [
				{ id: "023e105f4ecef8ad9ca31a8372d0c353", name: "Acme Corp" },
				{ id: "01a7362d577a6c3019a474fd6f485823", name: "Acme Staging" },
			];
			server.use(
				http.get(`${TEST_BASE_URL}/accounts`, () =>
					HttpResponse.json(createFetchResult(accounts))
				),
				http.get(`${TEST_BASE_URL}/memberships`, () =>
					HttpResponse.json(
						createFetchResult(accounts.map((account) => ({ account })))
					)
				)
			);
			const requests = loadBalancerRequests();

			await expect(
				runCf(["load-balancers", "account", "list", ...flags], {
					...ENV,
					CLOUDFLARE_ACCOUNT_ID: undefined,
				})
			).rejects.toThrow("CLOUDFLARE_ACCOUNT_ID");
			expect(requests).toEqual([]);
		}
	);

	it("fails before any request when the --zone name isn't found", async () => {
		server.use(
			http.get(`${TEST_BASE_URL}/zones`, () =>
				HttpResponse.json(createFetchResult([]))
			)
		);
		const requests = loadBalancerRequests();

		await expect(
			runCf(
				["load-balancers", "account", "list", "--zone", "missing.example.com"],
				ENV
			)
		).rejects.toThrow("Zone not found: missing.example.com");
		expect(requests).toEqual([]);
	});

	it("does not expose either template placeholder as a command argument", () => {
		const metadata = JSON.parse(
			readFileSync(
				new URL(
					"../../commands/_generated/_meta/commands.json",
					import.meta.url
				),
				"utf8"
			)
		) as {
			commands: Array<{
				command: string;
				arguments: Array<{ name: string }>;
				options: Array<{ name: string }>;
			}>;
		};
		const command = metadata.commands.find(
			(entry) => entry.command === "cf load-balancers account list"
		);

		expect(command).toBeDefined();
		const names = [
			...(command?.arguments ?? []),
			...(command?.options ?? []),
		].map((item) => item.name);
		expect(names).not.toContain("account-or-zone");
		expect(names).not.toContain("account-or-zone-id");
	});
});
