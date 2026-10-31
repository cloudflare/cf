import { writeFileSync } from "node:fs";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

/**
 * `ai to-markdown` declares its body as a `files` array of `format: binary`
 * items, so every conversion must reach the API as `files` file parts, with
 * each file's content and filename (#463).
 */
describe("ai to-markdown uploads files parts", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
		DO_NOT_TRACK: "1",
	};
	const URL = `${TEST_BASE_URL}/accounts/test-account/ai/tomarkdown`;
	const HTML = "<h1>Hello</h1>\n";
	const OTHER = "<h2>World</h2>\n";

	let errSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		errSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
		writeFileSync("sample.html", HTML);
		writeFileSync("other.html", OTHER);
	});

	afterEach(() => {
		errSpy.mockRestore();
	});

	it("uploads --file as a files part", async () => {
		let form: FormData | undefined;
		server.use(
			http.post(URL, async ({ request }) => {
				form = await request.formData();
				return HttpResponse.json({ success: true, result: [] });
			})
		);

		const { exitCode } = await runCf(
			["ai", "to-markdown", "--file", "sample.html", "--quiet"],
			ENV
		);

		expect(exitCode).toBe(0);
		if (!form) {
			throw new Error("No to-markdown request was sent");
		}
		const file = form.get("files");
		expect(file).toBeInstanceOf(File);
		expect(await (file as File).text()).toBe(HTML);
		expect((file as File).name).toBe("sample.html");
		expect(form.has("file")).toBe(false);
	});

	it("uploads --files @path as a files part", async () => {
		let form: FormData | undefined;
		server.use(
			http.post(URL, async ({ request }) => {
				form = await request.formData();
				return HttpResponse.json({ success: true, result: [] });
			})
		);

		const { exitCode } = await runCf(
			["ai", "to-markdown", "--files", "@sample.html", "--quiet"],
			ENV
		);

		expect(exitCode).toBe(0);
		if (!form) {
			throw new Error("No to-markdown request was sent");
		}
		const file = form.get("files");
		expect(file).toBeInstanceOf(File);
		expect(await (file as File).text()).toBe(HTML);
		expect((file as File).name).toBe("sample.html");
	});

	it("uploads each repeated --files value as its own files part", async () => {
		let form: FormData | undefined;
		server.use(
			http.post(URL, async ({ request }) => {
				form = await request.formData();
				return HttpResponse.json({ success: true, result: [] });
			})
		);

		const { exitCode } = await runCf(
			[
				"ai",
				"to-markdown",
				"--files",
				"@sample.html",
				"--files",
				"@other.html",
				"--quiet",
			],
			ENV
		);

		expect(exitCode).toBe(0);
		if (!form) {
			throw new Error("No to-markdown request was sent");
		}
		const files = form.getAll("files");
		expect(files).toHaveLength(2);
		for (const entry of files) {
			expect(entry).toBeInstanceOf(File);
		}
		expect(await (files[0] as File).text()).toBe(HTML);
		expect((files[0] as File).name).toBe("sample.html");
		expect(await (files[1] as File).text()).toBe(OTHER);
		expect((files[1] as File).name).toBe("other.html");
	});
});
