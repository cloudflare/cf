import { describe, expect, it, vi } from "vite-plus/test";
import { mockConsoleMethods } from "../helpers/mock-console";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

describe("kv", () => {
	runInTempDir();
	const std = mockConsoleMethods();

	function local(persistTo?: string): string {
		return persistTo === undefined
			? "--local"
			: `--local --persist-to ${persistTo}`;
	}

	async function put(
		key: string,
		value: string,
		namespace = "some-namespace-id",
		persistTo?: string
	): Promise<void> {
		await runWrangler(
			`kv keys put ${key} --namespace-id ${namespace} --body ${value} ${local(persistTo)}`
		);
		std.getAndClearOut();
	}

	async function get(
		key: string,
		namespace = "some-namespace-id",
		persistTo?: string
	): Promise<string> {
		let output = "";
		const write = vi
			.spyOn(process.stdout, "write")
			.mockImplementation((chunk) => {
				output += String(chunk);
				return true;
			});
		try {
			await runWrangler(
				`kv keys get ${key} --namespace-id ${namespace} --text ${local(persistTo)}`
			);
			return output;
		} finally {
			write.mockRestore();
		}
	}

	describe("local", () => {
		it("should put local kv storage", async () => {
			await put("val", "value");
			expect(await get("val")).toBe("value");
		});

		it("should list local kv storage", async () => {
			for (const key of ["a", "a/b", "a/c", "b"]) {
				await put(key, "value", "list-namespace-id");
			}

			await runWrangler(
				`kv keys list --namespace-id list-namespace-id ${local()}`
			);
			expect(JSON.parse(std.getAndClearOut())).toEqual([
				{ name: "a" },
				{ name: "a/b" },
				{ name: "a/c" },
				{ name: "b" },
			]);

			await runWrangler(
				`kv keys list --namespace-id list-namespace-id --prefix a/b ${local()}`
			);
			expect(JSON.parse(std.getAndClearOut())).toEqual([{ name: "a/b" }]);
		});

		it("should delete local kv storage", async () => {
			await put("val", "value", "delete-namespace-id");
			await runWrangler(
				`kv keys delete val --namespace-id delete-namespace-id --force ${local()}`
			);
			await expect(get("val", "delete-namespace-id")).rejects.toThrow();
		});

		it.todo("should put local bulk kv storage");
		it.todo("should put binary values from base64 in local bulk kv storage");
		it.todo("should delete local bulk kv storage");
		it.todo("should delete local bulk kv storage ({ name })");
		it("should get local bulk kv storage", async () => {
			await put("hello", "world", "bulk-get-namespace-id");
			await put("test", "value", "bulk-get-namespace-id");

			await runWrangler(
				`kv bulk get bulk-get-namespace-id --keys hello test ${local()}`
			);
			expect(JSON.parse(std.getAndClearOut())).toEqual({
				values: {
					hello: "world",
					test: "value",
				},
			});
		});

		it("should follow persist-to for local kv storage", async () => {
			await put("val", "default-value", "persist-namespace-id");
			await put("val", "persist-value", "persist-namespace-id", "./persistdir");

			expect(await get("val", "persist-namespace-id")).toBe("default-value");
			expect(await get("val", "persist-namespace-id", "./persistdir")).toBe(
				"persist-value"
			);
		});
	});
});
