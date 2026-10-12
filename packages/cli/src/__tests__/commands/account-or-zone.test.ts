import { readFileSync } from "node:fs";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { captureOutput } from "../helpers/capture-output.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

/**
 * End-to-end coverage for the paired
 * `/{account_or_zone}/{account_or_zone_id}/` path-template convention.
 *
 * The same generated command must default to account scope and switch to zone
 * scope only when the global --zone flag is explicitly present. Load balancer
 * listing is a small typed-SDK request that exercises both generated request
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

	it("uses the account route by default", async () => {
		let requested = false;
		server.use(
			http.get(`${TEST_BASE_URL}/accounts/test-account/load_balancers`, () => {
				requested = true;
				return HttpResponse.json({ success: true, result: [] });
			})
		);

		const { exitCode } = await runCf(
			["load-balancers", "account", "list"],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(requested).toBe(true);
	});

	it("uses the zone route when --zone is explicitly provided", async () => {
		let requested = false;
		server.use(
			http.get(`${TEST_BASE_URL}/zones/${ZONE_ID}/load_balancers`, () => {
				requested = true;
				return HttpResponse.json({ success: true, result: [] });
			})
		);

		const { exitCode } = await runCf(
			["load-balancers", "account", "list", "--zone", ZONE_ID],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(requested).toBe(true);
	});

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
