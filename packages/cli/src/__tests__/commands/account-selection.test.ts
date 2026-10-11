import { format } from "node:util";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { getGlobalDispatcher, MockAgent, setGlobalDispatcher } from "undici";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import {
	createFetchResult,
	server,
	setupMsw,
	TEST_BASE_URL,
} from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";
import type * as interactive from "../../lib/interactive.js";
import type * as clack from "@clack/prompts";

// Drive the real picker, answering it with Enter.
vi.mock("@clack/prompts", async (importOriginal) => {
	const prompts = await importOriginal<typeof clack>();
	const { PassThrough } = await import("node:stream");
	return {
		...prompts,
		select: (options: Parameters<typeof clack.select>[0]) => {
			const input = new PassThrough();
			const selection = prompts.select({ ...options, input });
			input.write("\r");
			return selection;
		},
	};
});

vi.mock("../../lib/interactive.js", async (importOriginal) => ({
	...(await importOriginal<typeof interactive>()),
	isNonInteractiveOrCI: () => false,
}));

const accounts = [
	{ id: "023e105f4ecef8ad9ca31a8372d0c353", name: "Acme Corp" },
	{ id: "01a7362d577a6c3019a474fd6f485823", name: "Acme Staging" },
];

describe("account selection", () => {
	runInTempDir();
	setupMsw();

	const previousDispatcher = getGlobalDispatcher();
	let accountsApi: MockAgent;
	let terminal: string;

	beforeEach(() => {
		// workers-auth lists accounts through undici, which MSW doesn't intercept.
		accountsApi = new MockAgent();
		accountsApi.disableNetConnect();
		const api = accountsApi.get("https://api.test");
		const page = { page: 1, total_pages: 1 };
		api
			.intercept({ path: "/client/v4/accounts?page=1" })
			.reply(200, { success: true, result: accounts, result_info: page });
		api.intercept({ path: "/client/v4/memberships?page=1" }).reply(200, {
			success: true,
			result: accounts.map((account) => ({ account })),
			result_info: page,
		});
		setGlobalDispatcher(accountsApi);

		server.use(
			http.get(`${TEST_BASE_URL}/accounts/:accountId/pages/projects`, () =>
				HttpResponse.json(createFetchResult([]))
			)
		);

		// What a terminal shows: the streams and the console (which Vitest
		// takes over), interleaved in the order they were written.
		terminal = "";
		const write = (chunk: unknown) => {
			terminal += String(chunk);
			return true;
		};
		vi.spyOn(process.stdout, "write").mockImplementation(write);
		vi.spyOn(process.stderr, "write").mockImplementation(write);
		for (const method of ["log", "warn", "error"] as const) {
			vi.spyOn(console, method).mockImplementation((...args) => {
				write(`${format(...args)}\n`);
			});
		}
	});

	afterEach(async () => {
		vi.restoreAllMocks();
		setGlobalDispatcher(previousDispatcher);
		await accountsApi.close();
	});

	function run(...flags: string[]) {
		return runCf(["pages", "list", ...flags], {
			CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
			CLOUDFLARE_API_TOKEN: "test-token",
			CLOUDFLARE_ACCOUNT_ID: undefined,
		});
	}

	it("prints the config hint between the picker and the command's output", async () => {
		await expect(run()).resolves.toEqual({ exitCode: 0 });

		expect(screen(terminal)).toMatchInlineSnapshot(`
			"│
			◇  Select an account
			│  Acme Corp
			│
			●  To make this the project's default account, create cloudflare.config.ts:

			   import { defineConfig } from "cf/config";

			   export default defineConfig({
			     accountId: "023e105f4ecef8ad9ca31a8372d0c353",
			   });

			[]
			"
		`);
	});

	it("omits the config hint with --quiet", async () => {
		await expect(run("--quiet")).resolves.toEqual({ exitCode: 0 });

		expect(screen(terminal)).toMatchInlineSnapshot(`
			"│
			◇  Select an account
			│  Acme Corp
			[]
			"
		`);
	});
});

/**
 * The picker redraws itself in place once an account is chosen. Replay the
 * cursor moves it uses (up, down, erase below) so the snapshot shows what is
 * left on screen.
 */
function screen(output: string): string {
	const rows = [""];
	let row = 0;
	const write = (text: string) => {
		const [first = "", ...rest] = text.split("\n");
		rows[row] = (rows[row] ?? "") + first;
		for (const line of rest) {
			rows[++row] = line;
		}
	};
	const [head = "", ...sequences] = output.split("\u001b[");
	write(head);
	for (const sequence of sequences) {
		const [, count, command, text = ""] =
			/^\??(\d*)[\d;]*([A-Za-z])([\s\S]*)$/.exec(sequence) ?? [];
		if (command === "A") {
			row -= Number(count || 1);
		} else if (command === "B") {
			row += Number(count || 1);
		} else if (command === "J") {
			rows.length = row;
		}
		write(text);
	}
	return rows.join("\n");
}
