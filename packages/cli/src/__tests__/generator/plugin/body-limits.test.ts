import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it, vi } from "vite-plus/test";
import { handler, imports } from "../../../../generator/plugin/emit/handler.js";
import { parseBody } from "../../../lib/body-parser.js";
import {
	context,
	method,
	operation,
	param,
	wire,
} from "../../helpers/cli-plugin.js";

describe.each([false, true])("array body limits (headers: %s)", (headers) => {
	runInTempDir();
	const setup = (
		httpMethod: string,
		maxItems?: number,
		contentType = "application/json",
		confirm = true
	) => {
		const ctx = context(
			method(
				"update",
				"things.update",
				confirm
					? { requireConfirmation: "This operation replaces the full list." }
					: {}
			),
			"things",
			operation(httpMethod, "/things", {
				hasRequestBody: true,
				requestContentTypes: ["application/json"],
				requestBodyIsArray: true,
				maxItems,
				headerParams: headers ? [param("If-Match")] : [],
				wire: wire({ hasRequest: true, body: "json", bodyRequired: true }),
				responses: [["200", { content: [contentType] }]],
			})
		);
		const send = vi.fn(async () => undefined);
		const requestApi = vi.fn(async () => undefined);
		const fetchRawBytes = vi.fn(async () => Buffer.from("result"));
		const formatDryRun = vi.fn();
		const confirmDelete = vi.fn(async () => true);
		const createCommandClient = vi.fn(async () => ({ send }));
		const source = stripTypeScriptTypes(
			`(async (argv) => {\n${handler(ctx).join("\n")}\n})`
		);
		const execute = new Script(source).runInNewContext({
			parseBody,
			createCommandClient,
			operation: {},
			requestApi,
			fetchRawBytes,
			writeRawOutput: () => {},
			confirmDelete,
			withProgress: async (_label: string, task: () => Promise<unknown>) =>
				task(),
			formatOutput: () => {},
			formatDryRun,
		}) as (argv: Record<string, unknown>) => Promise<void>;
		return {
			ctx,
			send,
			requestApi,
			fetchRawBytes,
			formatDryRun,
			confirmDelete,
			createCommandClient,
			run: (body?: string, dryRun = false) =>
				execute({ body, dryRun, "if-match": "revision" }),
		};
	};

	describe.each(["put", "post", "patch", "delete"])("%s", (httpMethod) => {
		it("rejects a missing body before confirmation or requests", async () => {
			const { run, confirmDelete, send, requestApi, fetchRawBytes } =
				setup(httpMethod);
			await expect(run()).rejects.toThrow(
				"--body is required for this command."
			);
			expect(confirmDelete).not.toHaveBeenCalled();
			expect(send).not.toHaveBeenCalled();
			expect(requestApi).not.toHaveBeenCalled();
			expect(fetchRawBytes).not.toHaveBeenCalled();
		});

		it("still confirms a supplied body and honours a decline", async () => {
			const { run, confirmDelete, send, requestApi, fetchRawBytes } =
				setup(httpMethod);
			confirmDelete.mockResolvedValue(false);
			await run("[]");
			expect(confirmDelete).toHaveBeenCalledExactlyOnceWith({
				force: false,
				message: "This operation replaces the full list.",
			});
			expect(send).not.toHaveBeenCalled();
			expect(requestApi).not.toHaveBeenCalled();
			expect(fetchRawBytes).not.toHaveBeenCalled();
		});

		it.each([
			["oversized", '["one","two","three"]', "at most 2 items"],
			["malformed", "{not json", "--body"],
			["empty", "", "--body"],
		])(
			"rejects an %s body before confirmation or requests",
			async (_label, body, message) => {
				const {
					run,
					confirmDelete,
					createCommandClient,
					send,
					requestApi,
					fetchRawBytes,
				} = setup(httpMethod, 2);
				await expect(run(body)).rejects.toThrow(message);
				expect(createCommandClient).not.toHaveBeenCalled();
				expect(confirmDelete).not.toHaveBeenCalled();
				expect(send).not.toHaveBeenCalled();
				expect(requestApi).not.toHaveBeenCalled();
				expect(fetchRawBytes).not.toHaveBeenCalled();
			}
		);

		it("previews an omitted body without confirmation during a dry run", async () => {
			const { run, confirmDelete, formatDryRun, send, requestApi } =
				setup(httpMethod);
			await run(undefined, true);
			expect(formatDryRun).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({ body: undefined })
			);
			expect(confirmDelete).not.toHaveBeenCalled();
			expect(send).not.toHaveBeenCalled();
			expect(requestApi).not.toHaveBeenCalled();
		});

		it.each([false, true])(
			"rejects oversized inline and file bodies before any request (dry run: %s)",
			async (dryRun) => {
				const input = JSON.stringify(["one", "two", "three"]);
				await seed({ "array body.json": input });
				const { run, send, requestApi, fetchRawBytes, formatDryRun } = setup(
					httpMethod,
					2
				);
				for (const body of [input, "@array body.json"]) {
					await expect(run(body, dryRun)).rejects.toThrow(
						"--body must contain at most 2 items (received 3)."
					);
				}
				expect(send).not.toHaveBeenCalled();
				expect(requestApi).not.toHaveBeenCalled();
				expect(fetchRawBytes).not.toHaveBeenCalled();
				expect(formatDryRun).not.toHaveBeenCalled();
			}
		);

		it.each([false, true])(
			"accepts arrays below and at the limit unchanged (dry run: %s)",
			async (dryRun) => {
				for (const body of [[], ["one"], ["one", "two"]]) {
					const { run, send, requestApi, formatDryRun } = setup(httpMethod, 2);
					await run(JSON.stringify(body), dryRun);
					if (dryRun) {
						expect(formatDryRun).toHaveBeenCalledExactlyOnceWith(
							expect.objectContaining({ body })
						);
						expect(send).not.toHaveBeenCalled();
						expect(requestApi).not.toHaveBeenCalled();
					} else if (headers) {
						expect(requestApi).toHaveBeenCalledExactlyOnceWith(
							expect.anything(),
							httpMethod.toUpperCase(),
							"/things",
							{ body, headers: { "If-Match": "revision" } }
						);
						expect(send).not.toHaveBeenCalled();
					} else {
						expect(send).toHaveBeenCalledExactlyOnceWith({}, { body });
						expect(requestApi).not.toHaveBeenCalled();
					}
				}
			}
		);
	});

	it.each([false, true])(
		"honours a zero limit (dry run: %s)",
		async (dryRun) => {
			const { run } = setup("post", 0);
			await expect(run("[]", dryRun)).resolves.toBeUndefined();
			await expect(run('["one"]', dryRun)).rejects.toThrow(
				"--body must contain at most 0 items (received 1)."
			);
		}
	);

	it("rejects a bad body before authentication without a confirmation prompt", async () => {
		const { run, createCommandClient, confirmDelete, send, requestApi } = setup(
			"put",
			2,
			"application/json",
			false
		);
		await expect(run('["one","two","three"]')).rejects.toThrow(
			"--body must contain at most 2 items (received 3)."
		);
		await expect(run("{not json")).rejects.toThrow("--body");
		expect(createCommandClient).not.toHaveBeenCalled();
		expect(confirmDelete).not.toHaveBeenCalled();
		expect(send).not.toHaveBeenCalled();
		expect(requestApi).not.toHaveBeenCalled();
	});

	it("sends an unlimited array as one request and imports its operation", async () => {
		const { run, ctx, send, requestApi } = setup("post");
		const body = ["one", "two", "three"];
		await run(JSON.stringify(body));
		const output = imports(ctx).render().join("\n");
		if (headers) {
			expect(requestApi).toHaveBeenCalledTimes(1);
			expect(send).not.toHaveBeenCalled();
		} else {
			expect(send).toHaveBeenCalledExactlyOnceWith({}, { body });
			expect(requestApi).not.toHaveBeenCalled();
			expect(output).toContain(
				"import operation from './_operations/things/update.js';"
			);
		}
	});

	it("rejects an oversized body even when the response is raw", async () => {
		const { run, fetchRawBytes } = setup("post", 2, "text/plain");
		await expect(run('["one","two","three"]')).rejects.toThrow(
			"--body must contain at most 2 items (received 3)."
		);
		expect(fetchRawBytes).not.toHaveBeenCalled();
	});
});
