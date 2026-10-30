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
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

interface Sent {
	method: string;
	path: string;
	query: Record<string, string>;
	body: unknown;
}

describe("API fields renamed off cf-owned flags", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
		CI: "true",
	};
	const ZONE = "023e105f4ecef8ad9ca31a8372d0c353";

	let sent: Sent[];
	let spies: { mockRestore(): void }[];

	beforeEach(() => {
		sent = [];
		server.use(
			http.all(`${TEST_BASE_URL}/*`, async ({ request }) => {
				const url = new URL(request.url);
				const text = await request.text();
				sent.push({
					method: request.method,
					path: url.pathname.replace(new URL(TEST_BASE_URL).pathname, ""),
					query: Object.fromEntries(url.searchParams),
					body: text === "" ? undefined : JSON.parse(text),
				});
				return HttpResponse.json({ success: true, result: {} });
			})
		);
		spies = [
			vi.spyOn(console, "log").mockImplementation(() => {}),
			vi.spyOn(console, "error").mockImplementation(() => {}),
			vi.spyOn(process.stderr, "write").mockImplementation(() => true),
		];
	});

	afterEach(() => {
		for (const spy of spies) {
			spy.mockRestore();
		}
	});

	async function run(args: string[]): Promise<Sent> {
		await expect(runCf(args, ENV)).resolves.toEqual({ exitCode: 0 });
		expect(sent).toHaveLength(1);
		return sent[0] as Sent;
	}

	it("sends --detection-mode as Precursor's body mode, apart from the global --mode", async () => {
		const request = await run([
			"precursor",
			"update",
			"--zone",
			ZONE,
			"--cloudflare-version",
			"1.0",
			"--detection-mode",
			"arm",
			"--mode",
			"staging",
		]);
		expect(request).toMatchObject({
			method: "PUT",
			path: `/zones/${ZONE}/precursor`,
			body: { mode: "arm" },
		});
	});

	it("sends --organization-profile as the profile body field", async () => {
		const request = await run([
			"cloudforce-one",
			"priority-intelligence",
			"profile",
			"update",
			"--organization-profile",
			"Acme Corp: banking, EU",
		]);
		expect(request).toMatchObject({
			method: "PUT",
			body: { profile: "Acme Corp: banking, EU" },
		});
	});

	it("sends --force-delete as the on-ramp force query, separate from cf's --force", async () => {
		const forced = await run([
			"magic-cloud-networking",
			"on-ramps",
			"delete",
			"onramp-1",
			"--force-delete",
			"--force",
		]);
		expect(forced).toMatchObject({
			method: "DELETE",
			path: "/accounts/test-account/magic/cloud/onramps/onramp-1",
			query: { force: "true" },
		});
		sent = [];
		const confirmed = await run([
			"magic-cloud-networking",
			"on-ramps",
			"delete",
			"onramp-1",
			"-f",
		]);
		expect(confirmed.query).toEqual({});
	});

	it("sends the upstream flagName --filter-mode as the body mode", async () => {
		const request = await run([
			"magic-transit",
			"advanced-tcp-protection",
			"configs",
			"syn",
			"protection",
			"filters",
			"create",
			"--expression",
			"ip.dst in {192.0.2.0/24}",
			"--filter-mode",
			"monitoring",
		]);
		expect(request.body).toEqual({
			expression: "ip.dst in {192.0.2.0/24}",
			mode: "monitoring",
		});
	});

	it("sends --preview, no longer reserved, as the o11y body dry", async () => {
		const request = await run([
			"o11y",
			"telemetry",
			"query",
			"--query-id",
			"q1",
			"--timeframe-from",
			"1",
			"--timeframe-to",
			"2",
			"--preview",
		]);
		expect(request.body).toMatchObject({ queryId: "q1", dry: true });
	});
});

describe("cf schema", () => {
	afterEach(() => vi.restoreAllMocks());

	it("lists the flag that fills each query parameter", async () => {
		const output = captureOutput();
		await expect(
			runCf(["schema", "firewall", "access-rules", "list"])
		).resolves.toEqual({ exitCode: 0 });
		const schema = JSON.parse(output.stdout()) as {
			queryParams: { name: string; flag?: string }[];
		};
		expect(schema.queryParams).toContainEqual(
			expect.objectContaining({ name: "mode", flag: "access-rule-mode" })
		);
	});
});
