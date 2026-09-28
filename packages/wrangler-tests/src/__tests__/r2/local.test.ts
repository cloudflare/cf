import { describe, expect, it, vi } from "vitest";
import { mockConsoleMethods } from "../helpers/mock-console";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

describe("r2", () => {
	runInTempDir();
	const std = mockConsoleMethods();

	function local(persistTo?: string): string {
		return persistTo === undefined
			? "--local"
			: `--local --persist-to ${persistTo}`;
	}

	async function upload(
		key: string,
		value: string,
		persistTo?: string
	): Promise<void> {
		await runWrangler(
			`r2 objects put ${key} --bucket-name bucket-object-test --body ${value} ${local(persistTo)}`
		);
		std.getAndClearOut();
	}

	async function get(key: string, persistTo?: string): Promise<string> {
		let output = "";
		const write = vi
			.spyOn(process.stdout, "write")
			.mockImplementation((chunk) => {
				output += String(chunk);
				return true;
			});
		try {
			await runWrangler(
				`r2 objects get ${key} --bucket-name bucket-object-test --text ${local(persistTo)}`
			);
			return output;
		} finally {
			write.mockRestore();
		}
	}

	describe("r2 object", () => {
		describe("local", () => {
			it("should put R2 object to a local bucket", async () => {
				await upload("wormhole-img.png", "passageway");
				expect(await get("wormhole-img.png")).toBe("passageway");
			});

			// cf exposes the OpenAPI object data plane, which does not have
			// Wrangler's manifest-driven multi-file upload command yet.
			it.todo("should bulk put R2 objects to a local bucket");

			it("should delete R2 object from local bucket", async () => {
				await upload("delete-me", "passageway");
				await runWrangler(
					`r2 objects bulk-delete --bucket-name bucket-object-test --body '["delete-me"]' --force ${local()}`
				);
				std.getAndClearOut();
				await expect(get("delete-me")).rejects.toThrow();
			});

			it("should follow persist-to for object bucket", async () => {
				await upload("file-one", "one");
				await upload("file-two", "two", "./persistdir");

				expect(await get("file-one")).toBe("one");
				expect(await get("file-two", "./persistdir")).toBe("two");
				await expect(get("file-one", "./persistdir")).rejects.toThrow();
			});
		});
	});
});
