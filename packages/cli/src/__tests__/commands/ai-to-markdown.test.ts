import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
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
import type { CommandsMetadata } from "../../lib/command-meta.js";

describe("cf ai to-markdown file uploads", () => {
	runInTempDir();
	setupMsw();
	const env = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
		DO_NOT_TRACK: "1",
	};
	const html = "<h1>Hello</h1>\r\n";
	const binary = Buffer.from([0, 255, 128, 13, 10]);
	const path = join("upload dir", "sample λ.html");
	const result = [
		{ name: "sample λ.html", data: "# Hello" },
		{ name: "sample.pdf", data: "PDF content" },
	];
	let forms: FormData[];
	let output: ReturnType<typeof captureOutput>;

	beforeEach(() => {
		output = captureOutput();
		forms = [];
		mkdirSync("upload dir");
		writeFileSync(path, html);
		writeFileSync("sample.pdf", binary);
		server.use(
			http.post(
				`${TEST_BASE_URL}/accounts/test-account/ai/tomarkdown`,
				async ({ request }) => {
					forms.push(await request.formData());
					return HttpResponse.json({ success: true, result });
				}
			)
		);
	});

	afterEach(() => vi.restoreAllMocks());

	it.each([
		["space-separated values", ["--files", `@${path}`, "@sample.pdf"]],
		["repeated flags", ["--files", `@${path}`, "--files", "@sample.pdf"]],
		["the primary file flag", ["--file", path, "--files", "@sample.pdf"]],
	] as const)("uploads multiple files with %s", async (_name, flags) => {
		const { exitCode } = await runCf(["ai", "to-markdown", ...flags], env);
		expect(exitCode).toBe(0);
		expect(forms).toHaveLength(1);
		const form = forms[0] as FormData;
		expect([...form.keys()]).toEqual(["files", "files"]);
		const files = form.getAll("files") as File[];
		expect(files.every((file) => file instanceof File)).toBe(true);
		expect(files.map((file) => file.name)).toEqual([
			"sample λ.html",
			"sample.pdf",
		]);
		expect(await files[0]?.text()).toBe(html);
		expect(Buffer.from(await (files[1] as File).arrayBuffer())).toEqual(binary);
		expect(JSON.parse(output.stdout())).toEqual(result);
	});

	it("rejects --files without a value", async () => {
		await expect(runCf(["ai", "to-markdown", "--files"], env)).rejects.toThrow(
			"Not enough arguments following: files"
		);
		expect(forms).toHaveLength(0);
	});

	it.each([
		["--file", path],
		["--files", `@${path}`],
	])("uploads one file with %j", async (...flags) => {
		await runCf(["ai", "to-markdown", ...flags], env);
		const form = forms[0] as FormData;
		expect([...form.keys()]).toEqual(["files"]);
		const file = form.get("files") as File;
		expect(file).toBeInstanceOf(File);
		expect(file.name).toBe("sample λ.html");
		expect(await file.text()).toBe(html);
	});

	it("accepts literal and empty file contents consistently with binary field flags", async () => {
		await runCf(["ai", "to-markdown", "--files", html, ""], env);
		const files = forms[0]?.getAll("files") as File[];
		expect(files).toHaveLength(2);
		for (const [index, content] of [html, ""].entries()) {
			const file = files[index] as File;
			expect(file).toBeInstanceOf(File);
			expect(file.name).toBe("files");
			expect(await file.text()).toBe(content);
		}
	});

	it.each([
		["@", "must be followed by a file path"],
		["@missing.pdf", "--files: cannot read file"],
		["@upload dir", "--files: cannot read file"],
	])(
		"rejects invalid token %s without sending a request",
		async (token, error) => {
			await expect(
				runCf(["ai", "to-markdown", "--files", `@${path}`, token], env)
			).rejects.toThrow(error);
			expect(forms).toHaveLength(0);
		}
	);

	it("previews all file tokens without uploading", async () => {
		await runCf(
			[
				"ai",
				"to-markdown",
				"--files",
				"@first.html",
				"@second.pdf",
				"--dry-run",
			],
			env
		);
		expect(JSON.parse(output.stdout())).toMatchObject({
			bodyKind: "multipart",
			body: { files: ["@first.html", "@second.pdf"] },
		});
		expect(forms).toHaveLength(0);
	});

	it("advertises the file array in command metadata", () => {
		const metadata = JSON.parse(
			readFileSync(
				new URL(
					"../../commands/_generated/_meta/commands.json",
					import.meta.url
				),
				"utf8"
			)
		) as CommandsMetadata;
		const command = metadata.commands.find(
			(entry) => entry.command === "cf ai to-markdown"
		);
		expect(command?.options).toContainEqual(
			expect.objectContaining({ name: "files", type: "string", array: true })
		);
	});
});
