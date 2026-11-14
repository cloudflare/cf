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
import * as prompt from "../../lib/prompt.js";
import { captureOutput } from "../helpers/capture-output.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

interface Sent {
	method: string;
	path: string;
	query: Record<string, string>;
	body: unknown;
}

describe("API fields with distinct CLI flag names", () => {
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

	const excludedRecipient = [
		"resource-sharing",
		"excluded-recipients",
		"create",
		"example-share",
	];
	const excludedAccount = "11111111111111111111111111111111";
	const excludedBody = { account_id: excludedAccount };

	it("sends the excluded account in the body and the owning account in the URL", async () => {
		const request = await run([
			...excludedRecipient,
			"--excluded-account-id",
			excludedAccount,
		]);
		expect(request).toEqual({
			method: "POST",
			path: "/accounts/test-account/shares/example-share/excluded-recipients",
			query: {},
			body: excludedBody,
		});
	});

	it.each([false, true])(
		"keeps raw body input independent of the owning account (dry run: %s)",
		async (dryRun) => {
			const output = captureOutput();
			await expect(
				runCf(
					[
						...excludedRecipient,
						"--body",
						JSON.stringify(excludedBody),
						...(dryRun ? ["--dry-run"] : []),
					],
					ENV
				)
			).resolves.toEqual({ exitCode: 0 });
			if (dryRun) {
				expect(JSON.parse(output.stdout())).toMatchObject({
					url: "https://api.cloudflare.com/client/v4/accounts/test-account/shares/example-share/excluded-recipients",
					bodyKind: "json",
					body: excludedBody,
				});
				expect(sent).toHaveLength(0);
			} else {
				expect(sent).toMatchObject([
					{
						body: excludedBody,
						path: "/accounts/test-account/shares/example-share/excluded-recipients",
					},
				]);
			}
		}
	);

	it("previews the excluded account flag without authentication or a request", async () => {
		const output = captureOutput();
		await expect(
			runCf(
				[
					...excludedRecipient,
					"--excluded-account-id",
					excludedAccount,
					"--dry-run",
				],
				{ ...ENV, CLOUDFLARE_API_TOKEN: undefined }
			)
		).resolves.toEqual({ exitCode: 0 });
		expect(JSON.parse(output.stdout())).toMatchObject({
			method: "POST",
			url: "https://api.cloudflare.com/client/v4/accounts/test-account/shares/example-share/excluded-recipients",
			bodyKind: "json",
			body: excludedBody,
		});
		expect(sent).toHaveLength(0);
	});

	it("requires the excluded account when neither a field flag nor --body is supplied", async () => {
		await expect(runCf(excludedRecipient, ENV)).rejects.toThrow(
			"--excluded-account-id is required"
		);
		expect(sent).toHaveLength(0);
	});

	it("uses the required-field prompt's excluded account in the body", async () => {
		const requiredField = vi
			.spyOn(prompt, "promptForRequiredField")
			.mockResolvedValue(excludedAccount);
		spies.push(requiredField);
		const request = await run(excludedRecipient);
		expect(requiredField).toHaveBeenCalledExactlyOnceWith(
			"excluded-account-id",
			"The account to exclude from the organization-targeted share."
		);
		expect(request).toMatchObject({
			path: "/accounts/test-account/shares/example-share/excluded-recipients",
			body: excludedBody,
		});
	});

	it.each([false, true])(
		"rejects empty raw JSON before authentication or a preview (dry run: %s)",
		async (dryRun) => {
			const output = captureOutput();
			await expect(
				runCf(
					[
						...excludedRecipient,
						"--body",
						"",
						...(dryRun ? ["--dry-run"] : []),
					],
					{ ...ENV, CLOUDFLARE_API_TOKEN: undefined }
				)
			).rejects.toThrow("Invalid JSON in --body");
			expect(sent).toHaveLength(0);
			expect(output.stdout()).toBe("");
		}
	);

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

	it("sends --filter-mode as the body mode", async () => {
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

	it("lists the required excluded-account body flag independently of path scope", async () => {
		const output = captureOutput();
		await expect(
			runCf(["schema", "resource-sharing", "excluded-recipients", "create"])
		).resolves.toEqual({ exitCode: 0 });
		const schema = JSON.parse(output.stdout()) as {
			pathParams: { name: string; flag?: string }[];
			requestBodyFields: { name: string; required: boolean }[];
		};
		expect(
			schema.pathParams.find((param) => param.name === "account_id")
		).toEqual({
			name: "account_id",
			type: "string",
			required: true,
		});
		expect(schema.requestBodyFields).toContainEqual(
			expect.objectContaining({
				name: "excluded-account-id",
				required: true,
			})
		);
	});

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
