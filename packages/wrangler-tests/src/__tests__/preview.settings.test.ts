import { mkdirSync, writeFileSync } from "node:fs";
import { beforeEach, describe, test } from "vitest";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { msw } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";

// cf has no `preview` surface — preview script settings (preview_defaults)
// are a Workers-platform feature wrangler exposes via `wrangler preview
// settings [update]`. cf does not implement these commands; the `preview`
// namespace is out of scope (cf is API-driven, while preview-mode
// uploads are handled by the dev-server / build pipeline, not by cf itself).
// Skipping the whole suite — there is no cf equivalent to port to.
describe("wrangler preview", () => {
	runInTempDir();
	mockApiToken();
	mockAccountId();
	describe("preview settings", () => {
		beforeEach(() => {
			mkdirSync("src", { recursive: true });
			writeFileSync(
				"src/index.ts",
				"export default { fetch() { return new Response('ok'); } };"
			);
			writeFileSync(
				"wrangler.json",
				JSON.stringify({
					name: "test-worker",
					main: "src/index.ts",
					compatibility_date: "2025-01-01",
					previews: {
						vars: { ENVIRONMENT: "preview" },
						kv_namespaces: [{ binding: "MY_KV", id: "preview-kv-id" }],
					},
				})
			);
			msw.resetHandlers();
		});

		test.skip("should list current preview settings as JSON");

		test.skip("should list current Previews settings in pretty format");

		test.skip("should show empty bindings in pretty format");

		test.skip("should respect env-specific worker name when listing settings");
	});

	describe("preview settings update", () => {
		beforeEach(() => {
			mkdirSync("src", { recursive: true });
			writeFileSync(
				"src/index.ts",
				"export default { fetch() { return new Response('ok'); } };"
			);
			writeFileSync(
				"wrangler.json",
				JSON.stringify({
					name: "test-worker",
					main: "src/index.ts",
					compatibility_date: "2025-01-01",
					previews: {
						vars: { ENVIRONMENT: "preview" },
						kv_namespaces: [{ binding: "MY_KV", id: "preview-kv-id" }],
					},
				})
			);
			msw.resetHandlers();
		});

		test.skip("should update preview settings from wrangler config");

		test.skip("should render a useful diff before updating preview settings");

		test.skip(
			"should preserve nested observability fields when only partially overridden"
		);

		test.skip(
			"should render canonical Previews settings returned by the update response"
		);

		test.skip("should prefer previews limits over top-level limits");

		test.skip(
			"should skip updating when Previews settings are already up to date"
		);

		test.skip(
			"should skip updating when neither remote nor local settings define env"
		);

		test.skip(
			"should not clear existing bindings when previews has only non-binding settings"
		);

		test.skip("should replace binding entries wholesale when type changes");

		test.skip(
			"should resolve env-specific previews settings using config inheritability rules"
		);

		test.skip(
			"should fail before making API calls when env-specific previews.queues is malformed"
		);
	});
});
