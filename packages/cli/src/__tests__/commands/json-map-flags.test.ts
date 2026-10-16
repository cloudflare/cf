import { writeFileSync } from "node:fs";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { captureOutput } from "../helpers/capture-output.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

describe("JSON map body flags", () => {
	runInTempDir();
	setupMsw();
	afterEach(() => vi.restoreAllMocks());
	const env = {
		CI: "true",
		CF_SEND_TELEMETRY: "false",
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_ACCOUNT_ID: "test-account",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
	};
	const command = ["workers", "secrets", "bulk", "--worker", "example"];
	const url = `${TEST_BASE_URL}/accounts/test-account/workers/scripts/example/secrets-bulk`;

	for (const example of [
		{ name: "passthrough requests", command, field: "secrets", url },
		{
			name: "typed requests",
			command: ["images", "edit", "image-id"],
			field: "metadata",
			url: `${TEST_BASE_URL}/accounts/test-account/images/v1/image-id`,
		},
	]) {
		describe(example.name, () => {
			it.each([
				[
					"inline",
					'{"TOKEN":{"type":"secret_text","text":"secret"},"OLD":null}',
				],
				["file", "@map with spaces.json"],
				["empty", "{}"],
			])("previews and sends the same %s map", async (_label, input) => {
				const output = captureOutput();
				writeFileSync("map with spaces.json", '{"OLD":null}');
				const args = [...example.command, `--${example.field}`, input];
				await runCf([...args, "--dry-run"], env);
				const preview = JSON.parse(output.stdout()) as {
					body: Record<string, unknown>;
				};
				const map = JSON.parse(
					input.startsWith("@") ? '{"OLD":null}' : input
				) as unknown;
				expect(preview.body).toEqual({ [example.field]: map });
				let sent: unknown;
				server.use(
					http.patch(example.url, async ({ request }) => {
						sent = await request.json();
						return HttpResponse.json({ success: true, result: null });
					})
				);
				await runCf(args, env);
				expect(sent).toEqual(preview.body);
			});
		});
	}

	it("omits an optional map when its flag is absent", async () => {
		const output = captureOutput();
		const args = ["images", "edit", "image-id", "--creator", "example"];
		await runCf([...args, "--dry-run"], env);
		const preview = JSON.parse(output.stdout()) as {
			body: Record<string, unknown>;
		};
		expect(preview.body).toEqual({ creator: "example" });
		let sent: unknown;
		server.use(
			http.patch(
				`${TEST_BASE_URL}/accounts/test-account/images/v1/image-id`,
				async ({ request }) => {
					sent = await request.json();
					return HttpResponse.json({ success: true, result: null });
				}
			)
		);
		await runCf(args, env);
		expect(sent).toEqual(preview.body);
	});

	it.each([false, true])(
		"requires explicit body input (dry-run=%s)",
		async (dryRun) => {
			captureOutput();
			const requested = vi.fn(() =>
				HttpResponse.json({ success: true, result: null })
			);
			server.use(http.patch(url, requested));
			await expect(
				runCf([...command, ...(dryRun ? ["--dry-run"] : [])], env)
			).rejects.toThrow(
				"--body is required unless at least one JSON map flag is provided"
			);
			expect(requested).not.toHaveBeenCalled();
		}
	);
});
