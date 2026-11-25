import { Readable } from "node:stream";
import * as clack from "@clack/prompts";
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
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

vi.mock("@clack/prompts", async (importOriginal) => ({
	...(await importOriginal<typeof clack>()),
	password: vi.fn(),
}));
vi.mock("ci-info", () => ({ default: { isCI: false } }));

describe.each([false, true])("Worker secret input (dry run: %s)", (dryRun) => {
	runInTempDir();
	setupMsw();
	const args = [
		"workers",
		"secrets",
		"update",
		"API_KEY",
		"--worker",
		"example",
		"--type",
		"secret_text",
	];
	const env = {
		CLOUDFLARE_API_TOKEN: dryRun ? undefined : "test-token",
		CLOUDFLARE_ACCOUNT_ID: dryRun ? undefined : "test-account",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		NO_COLOR: "1",
	};
	let log: ReturnType<typeof vi.spyOn>;
	let stderr: ReturnType<typeof vi.spyOn>;
	let input: Readable;
	const send = vi.fn(async (request: Request) => {
		const body: unknown = await request.json();
		return body;
	});

	beforeEach(() => {
		log = vi.spyOn(console, "log").mockImplementation(() => {});
		stderr = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
		send.mockClear();
		vi.mocked(clack.password).mockClear();
		server.use(
			http.put(
				`${TEST_BASE_URL}/accounts/test-account/workers/scripts/example/secrets`,
				async ({ request }) => {
					await send(request);
					return HttpResponse.json({
						success: true,
						result: { name: "API_KEY", type: "secret_text" },
					});
				}
			)
		);
	});

	afterEach(() => vi.restoreAllMocks());

	function stdin(chunks: string[]) {
		input = Readable.from(chunks);
		vi.spyOn(process, "stdin", "get").mockReturnValue(
			input as typeof process.stdin
		);
		return vi.spyOn(input, Symbol.asyncIterator);
	}

	function run(flags: string[] = []) {
		return runCf([...args, ...flags, ...(dryRun ? ["--dry-run"] : [])], env);
	}

	function output(): string {
		return log.mock.calls.map((call: unknown[]) => String(call[0])).join("\n");
	}

	function expectValue(value: string) {
		if (dryRun) {
			expect(send).not.toHaveBeenCalled();
			expect(JSON.parse(output())).toMatchObject({
				body: { name: "API_KEY", type: "secret_text", text: "<redacted>" },
			});
		} else {
			expect(send).toHaveBeenCalledOnce();
			expect(send).toHaveResolvedWith({
				name: "API_KEY",
				type: "secret_text",
				text: value,
			});
		}
		expect(output()).not.toContain(value);
		expect(
			stderr.mock.calls.map((call: unknown[]) => String(call[0])).join("")
		).not.toContain(value);
	}

	it("reads the complete piped value before previewing or sending", async () => {
		const read = stdin(["piped-", "secret\n"]);
		expect((await run()).exitCode).toBe(0);
		expect(read).toHaveBeenCalledOnce();
		expectValue("piped-secret");
	});

	it.runIf(!dryRun)(
		"does not consume stdin when authentication fails",
		async () => {
			const read = stdin(["unread-secret\n"]);
			await expect(
				runCf(args, {
					...env,
					CLOUDFLARE_API_TOKEN: undefined,
					CF_API_TOKEN: undefined,
				})
			).rejects.toThrow("No authentication token found.");
			expect(read).not.toHaveBeenCalled();
			expect(clack.password).not.toHaveBeenCalled();
			expect(send).not.toHaveBeenCalled();
		}
	);

	it("uses --text without consuming stdin", async () => {
		const read = stdin(["ignored-secret"]);
		expect((await run(["--text", "explicit-secret"])).exitCode).toBe(0);
		expect(read).not.toHaveBeenCalled();
		expectValue("explicit-secret");
	});

	it("uses --body without consuming stdin or prompting for flags", async () => {
		const read = stdin(["ignored-secret"]);
		expect(
			(
				await run([
					"--body",
					JSON.stringify({ type: "secret_text", text: "body-secret" }),
				])
			).exitCode
		).toBe(0);
		expect(read).not.toHaveBeenCalled();
		expectValue("body-secret");
	});

	it.each(["", "\n"])("rejects missing or empty stdin %j", async (value) => {
		stdin([value]);
		await expect(run()).rejects.toThrow(
			"--text is required. Pipe the value via stdin"
		);
		expect(send).not.toHaveBeenCalled();
		expect(log).not.toHaveBeenCalled();
	});

	it("uses the masked prompt on a terminal", async () => {
		const read = stdin([]);
		Object.defineProperty(input, "isTTY", { value: true });
		const tty = Object.getOwnPropertyDescriptor(process.stderr, "isTTY");
		Object.defineProperty(process.stderr, "isTTY", {
			value: true,
			configurable: true,
		});
		vi.mocked(clack.password).mockResolvedValue("prompted-secret");
		try {
			expect((await run()).exitCode).toBe(0);
			expect(read).not.toHaveBeenCalled();
			expect(clack.password).toHaveBeenCalledWith(
				expect.objectContaining({ output: process.stderr, mask: "•" })
			);
			expectValue("prompted-secret");
		} finally {
			if (tty) {
				Object.defineProperty(process.stderr, "isTTY", tty);
			} else {
				Reflect.deleteProperty(process.stderr, "isTTY");
			}
		}
	});
});
