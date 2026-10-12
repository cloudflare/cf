import { http, HttpResponse } from "msw";
import { describe, test } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../../helpers/mock-account-id";
import { mockConsoleMethods } from "../../helpers/mock-console";
import { createFetchResult, msw } from "../../helpers/msw";
import { runInTempDir } from "../../helpers/run-in-tmp";
import { runWrangler } from "../../helpers/run-wrangler";

describe("versions secret list", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const std = mockConsoleMethods();

	test("Can list secrets in single version deployment", async ({ expect }) => {
		mockVersions([version("version-id-1")]);
		await runWrangler(
			"workers versions get version-id-1 --worker-id script-name"
		);
		expect(secretNames(std.out)).toEqual(["SECRET_1", "SECRET_2"]);
	});

	test("Can list secrets in multi-version deployment", async ({ expect }) => {
		mockVersions([version("version-id-1"), version("version-id-2")]);
		await runWrangler(
			"workers versions get version-id-1 --worker-id script-name"
		);
		expect(secretNames(std.out)).toEqual(["SECRET_1", "SECRET_2"]);
		std.getAndClearOut();
		await runWrangler(
			"workers versions get version-id-2 --worker-id script-name"
		);
		expect(secretNames(std.out)).toEqual(["SECRET_1", "SECRET_2"]);
	});

	test.skip("Can list secrets in single version deployment reading from wrangler.toml", async () => {});

	test("Can list secrets for latest version", async ({ expect }) => {
		msw.use(
			http.get(
				"*/accounts/:accountId/workers/workers/:workerId/versions",
				() =>
					HttpResponse.json(
						createFetchResult({
							latest: version("version-id-3"),
							items: [version("version-id-3")],
						})
					),
				{ once: true }
			)
		);
		await runWrangler("workers versions list --worker-id script-name");
		const output = JSON.parse(std.out) as {
			latest: ReturnType<typeof version>;
		};
		expect(output.latest.resources.bindings).toHaveLength(2);
	});

	test("no wrangler configuration warnings shown", async ({ expect }) => {
		mockVersions([version("version-id-1")]);
		await runWrangler(
			"workers versions get version-id-1 --worker-id script-name"
		);
		expect(std.warn).toBe("");
	});
});

function mockVersions(versions: Array<ReturnType<typeof version>>) {
	msw.use(
		...versions.map((item) =>
			http.get(
				`*/accounts/:accountId/workers/workers/:workerId/versions/${item.id}`,
				() => HttpResponse.json(createFetchResult(item)),
				{ once: true }
			)
		)
	);
}

function version(id: string) {
	return {
		id,
		number: 1,
		metadata: {},
		resources: {
			bindings: [
				{ type: "secret_text", name: "SECRET_1" },
				{ type: "secret_text", name: "SECRET_2" },
			],
		},
	};
}

function secretNames(output: string) {
	const parsed = JSON.parse(output) as ReturnType<typeof version>;
	return parsed.resources.bindings.map((binding) => binding.name);
}
