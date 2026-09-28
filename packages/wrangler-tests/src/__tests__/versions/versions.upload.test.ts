import { seed } from "@cloudflare/workers-utils/test-helpers";
import { describe, it, test } from "vitest";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

describe("versions upload", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();

	// Temporary preview-account creation belongs to Wrangler's upload UX.
	test.skip(
		"should create a temporary account in non-interactive mode after printing terms notice"
	);

	// cf's hand-written `workers versions create` builds and reads Build Output,
	// then delegates the upload. These cases assert Wrangler-specific source,
	// config, rendering, preview, and intermediate-file behaviour instead.
	test.skip("should print bindings & startup time on versions upload");
	test.skip("should render config vars literally and --var as hidden");
	test.skip("should accept script as a positional arg");
	test.skip("should print preview url if version has preview");
	test.skip("should allow specifying --preview-alias");
	it.skip("should not print preview url when preview_urls is false");
	test.skip("correctly detects python workers");

	describe("service and environment tags", () => {
		test.skip("has environments, no existing tags, top-level env");
		test.skip("has environments, no existing tags, named env");
		test.skip("has environments, missing tags, top-level env");
		test.skip("has environments, missing tags, named env");
		test.skip("has environments, missing environment tag, named env");
		test.skip("has environments, stale service tag, top-level env");
		test.skip("has environments, stale service tag, named env");
		test.skip("has environments, stale environment tag, top-level env");
		test.skip("has environments, stale environment tag, named env");
		test.skip("has environments, has expected tags, top-level env");
		test.skip("has environments, has expected tags, named env");
		test.skip("no environments");
		test.skip("no top-level name");
		test.skip("environments with redirected config");
		test.skip("displays warning when error updating tags");
	});

	describe("multi-env warning", () => {
		it.skip(
			"should warn if the wrangler config contains environments but none was specified in the command"
		);
		it.skip(
			"should not warn if the wrangler config contains environments and one was specified in the command"
		);
		it.skip(
			"should not warn if the wrangler config doesn't contain environments and none was specified in the command"
		);
		it.skip(
			"should not warn if the wrangler config contains environments and CLOUDFLARE_ENV is set"
		);
		it.skip(
			'should not warn if --env="" is passed to explicitly target the top-level environment'
		);
	});

	test.skip(
		"should include plain_text and json in keep_bindings when keep_vars is true"
	);
	test.skip(
		"should not include plain_text and json in keep_bindings when keep_vars is false"
	);
	test.skip(
		"should not include plain_text and json in keep_bindings when keep_vars is not provided"
	);
	test.skip("should preserve containers config in metadata");
	test.skip("should error with --node-compat");
	test.skip("should error when using Workers Sites");
	test.skip("should error when using --site flag");
	test.skip("should error when --script points to a directory");
	test.skip(
		"should error when --script points to a directory even when positional path is also provided"
	);
	test.skip(
		"should error when --script points to a directory even when positional path is a file"
	);

	test("should error when Build Output has no name", async ({ expect }) => {
		await seedBuildOutput({ name: undefined });

		await expect(
			runWrangler("workers versions create --prebuilt")
		).rejects.toThrow(/invalid Worker config[\s\S]*"path": \[\s*"name"\s*\]/);
	});

	test.skip("should error when no compatibility_date is provided");
	test.skip("should warn when --no-bundle and --minify are used together");
	test.skip(
		"should warn when worker was last deployed from dashboard with destructive config diff"
	);
	test.skip("should warn when worker was last deployed from API");
	test.skip("should abort when user declines dashboard override confirmation");
	test.skip("should error when worker not found (must deploy first)");
	test.skip(
		"should continue without prompting in non-interactive mode when last deployed from dashboard"
	);
	test.skip(
		"should continue without prompting in non-interactive mode when last deployed from API"
	);
	test.skip("should error when worker not found in non-interactive mode");
	test.skip(
		"should abort in non-interactive strict mode when last deployed from API"
	);
	test.skip(
		"should abort in non-interactive strict mode when dashboard config has destructive diff"
	);
	test.skip(
		"should abort in non-interactive strict mode when remote secrets would be overridden"
	);
	test("should not require auth for dry-run", async ({ expect }) => {
		await seedBuildOutput({ name: "test-name" });

		await expect(
			runWrangler("workers versions create --prebuilt --dry-run", {
				CLOUDFLARE_API_TOKEN: undefined,
			})
		).resolves.toBeUndefined();
	});
	test.skip("should print bindings in dry-run");
	test.skip("should include versioned config fields in metadata");
	test.skip(
		"should include worker export cache config without top-level cache"
	);
	test.skip("should include all binding types in upload metadata");
	test.skip("should write bundled output to --outdir");
	test.skip("should write form data to --outfile");
	test.skip("should warn when using --latest");
	test.skip("should error when wasm_modules used with ES modules");
	test.skip("should error when text_blobs used with ES modules");
	test.skip("should error when data_blobs used with ES modules");
	test.skip("should upload assets and include stats in upload metrics");
	test.skip("should upload assets via --assets CLI flag");
	test.skip("should upload assets when directory is passed as positional path");
	test.skip("should not upload assets in dry-run");
	test.skip("should include migrations in upload metadata");
	test.skip("should skip migrations in dry-run");
	test.skip("sends the `exports` payload (and omits `migrations`)");
	// Friendly EWC remapping is intentionally absent from cf's product-agnostic errors.
	test.skip(
		"surfaces a friendly error when EWC rejects a binding to a not-yet-provisioned `exports` class (code 100406)"
	);
	test.skip("does not remap unrelated EWC errors on `versions upload`");
	test.skip("should override worker name with WRANGLER_CI_OVERRIDE_NAME");
	// Retrying transient API writes is useful for cf but is not yet covered by
	// the hand-written Build Output workflow's test surface.
	test.todo("should retry on transient upload failure");
	test.skip("should include package_dependencies in upload metadata");
	test.skip(
		"should omit package_dependencies when dependencies_instrumentation.enabled is false"
	);
	test.skip(
		"should exclude packages matching exclude_packages patterns from upload metadata"
	);
});

async function seedBuildOutput({ name }: { name: string | undefined }) {
	const config =
		name === undefined
			? {
					compatibilityDate: "2025-01-01",
					manifest: {
						type: "complete",
						mainModule: "index.js",
						modules: { "index.js": { type: "esm" } },
					},
				}
			: {
					name,
					compatibilityDate: "2025-01-01",
					manifest: {
						type: "complete",
						mainModule: "index.js",
						modules: { "index.js": { type: "esm" } },
					},
				};

	await seed({
		".cloudflare/output/v0/config.json": JSON.stringify({
			buildContext: { isPreview: false },
		}),
		".cloudflare/output/v0/workers/default/worker.config.json":
			JSON.stringify(config),
		".cloudflare/output/v0/workers/default/bundle/index.js":
			"export default { fetch() { return new Response('ok'); } }",
	});
}

describe("getPreviewAlias", () => {
	// Pure Wrangler git/alias derivation helpers; cf accepts no preview alias.
	it.skip("returns undefined if not in a git directory");
	it.skip("returns undefined if git branch name cannot be retrieved");
	it.skip("sanitizes branch names correctly");
	it.skip(
		"truncates and hashes long branch names that don't fit within DNS label constraints"
	);
	it.skip("handles multiple, leading, and trailing dashes");
	it.skip("lowercases branch names");
	it.skip("Generates from workers ci branch");
	it.skip("Truncates and hashes long workers ci branch names");
	it.skip("Strips leading dashes from branch name");
	it.skip("Removes concurrent dashes from branch name");
	it.skip("Does not produce an alias with leading numbers");
	it.skip("returns undefined when script name is too long to allow any alias");
	it.skip("handles long branch names with truncation");
});
