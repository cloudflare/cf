import { http, HttpResponse } from "msw";
import { describe, it, test } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { createFetchResult, msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

describe("versions deploy", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();

	describe("legacy deploy", () => {
		test.skip(
			"should warn user when worker has deployment with multiple versions"
		);
	});

	describe("without wrangler.toml", () => {
		test("succeeds with --name arg", async ({ expect }) => {
			const request = mockDeployment();
			await deploy({ versions: [{ version_id: "v1", percentage: 100 }] });
			await expect(request).resolves.toMatchObject({
				versions: [{ version_id: "v1", percentage: 100 }],
			});
		});

		test("accepts deployment versions as a JSON object-array flag", async ({
			expect,
		}) => {
			const request = mockDeployment();
			const versions = [
				{ version_id: "v1", percentage: 40 },
				{ version_id: "v2", percentage: 60 },
			];
			await runWrangler(
				`workers deployments create --worker test-name --strategy percentage --versions '${JSON.stringify(versions)}'`
			);
			await expect(request).resolves.toEqual({
				strategy: "percentage",
				versions,
			});
		});

		test("rejects repeated object-array flag occurrences", async ({
			expect,
		}) => {
			await expect(
				runWrangler(
					"workers deployments create --worker test-name --strategy percentage --versions '[]' --versions '[]'"
				)
			).rejects.toThrow(
				"--versions must be provided once as a JSON array of objects."
			);
		});

		test("fails without --name arg", async ({ expect }) => {
			await expect(
				runWrangler("workers deployments create --strategy percentage")
			).rejects.toThrow(/Required Worker name missing/);
		});
	});

	describe("with wrangler.toml", () => {
		test("requires versions when --body is not used", async ({ expect }) => {
			await expect(
				runWrangler(
					"workers deployments create --worker test-name --strategy percentage"
				)
			).rejects.toThrow(
				"--versions is required (or pass --body with this field set)."
			);
		});

		// These exercise Wrangler's positional version-spec parser and its
		// percentage distribution. cf deliberately exposes the API request body
		// instead, so sending already-normalized JSON is not the same situation.
		test.skip("1 version @ (implicit) 100%");
		test.skip("1 version @ (implicit) 100% without --yes");
		test.skip("1 version @ (explicit) 100%");
		test.skip("2 versions @ (implicit) 50% each");

		test.skip("1 version @ (explicit) 100%");
		test.skip("2 versions @ (explicit) 30% + (implicit) 70%");
		test.skip("2 versions @ (explicit) 40% + (explicit) 60%");
		test.skip("2 versions @ (explicit) 40% + (explicit) 60% without --yes");
		test.skip("--version-id and --percentage without --yes");

		describe("max versions restrictions (temp)", () => {
			test.skip("2+ versions fails");
			test.skip("--max-versions allows > 2 versions");
		});

		test("with a message", async ({ expect }) => {
			const request = mockDeployment();
			await deploy({
				annotations: { "workers/message": "hello" },
				versions: [{ version_id: "v1", percentage: 100 }],
			});
			await expect(request).resolves.toMatchObject({
				annotations: { "workers/message": "hello" },
			});
		});

		// These source deployment settings from wrangler.toml; cf accepts an
		// explicit API body and deliberately does not read Worker config.
		test.skip("with logpush in wrangler.toml");
		test.skip("with observability disabled in wrangler.toml");
		test.skip(
			"with logpush, tail_consumers, and observability in wrangler.toml"
		);
		test.skip(
			"with logpush, streaming_tail_consumers, and observability in wrangler.toml"
		);
		test("fails for non-existent versionId", async ({ expect }) => {
			mockDeploymentFailure("Version not found");
			await expect(
				deploy({ versions: [{ version_id: "missing", percentage: 100 }] })
			).rejects.toThrow(/Version not found/);
		});

		test.skip("fails if --percentage > 100");
		test.skip("fails if --percentage < 0");
		test.skip("fails if version-spec percentage > 100");
		test.skip("fails if version-spec percentage < 0");
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

		describe("deploy by tag", () => {
			// Tag-to-version resolution is Wrangler's compound CLI convenience.
			test.skip("resolves a single tag to its Version ID and deploys it");
			test.skip(
				"splits traffic between multiple tags using shorthand percentages"
			);
			test.skip("can be combined with a Version ID");
			test.skip("errors when no deployable version matches the tag");
			test.skip("errors when a tag matches multiple versions");
		});

		describe("EWC error mapping", () => {
			// cf intentionally avoids Wrangler's per-error-code prose rewrites.
			test.skip(
				"surfaces a friendly error when EWC rejects multi-version exports as inconsistent (code 100405)"
			);
			test.skip("includes a link to the gradual-deployments docs");
			test.skip("does not remap unrelated EWC errors");
		});
	});
});

describe("units", () => {
	describe("parseVersionSpecs", () => {
		// Pure Wrangler argument-parser unit cases; cf takes the API request body.
		test.skip("no args");
		test.skip("1 positional arg");
		test.skip("2 positional args");
		test.skip("1 pair of named args");
		test.skip("2 pairs of named args");
		test.skip("unpaired named args");
	});

	describe("parseTagSpecs", () => {
		test.skip("no args");
		test.skip("tag without percentage");
		test.skip("tag with percentage shorthand");
		test.skip("multiple tags with percentages");
		test.skip("tag containing @ with a percentage splits on the last @");
		test.skip("tag containing @ without a percentage is kept whole");
		test.skip(
			"trailing @ keeps a percentage-like tag whole with no percentage"
		);
		test.skip("throws on empty tag");
		test.skip("throws on out-of-range percentage");
		test.skip("treats a non-numeric @ suffix as part of the tag");
	});

	describe("validateTrafficSubtotal", () => {
		test.skip("none unspecified");
		test.skip("subtotal above 100");
		test.skip("subtotal below 100");
		test.skip("counts unspecified");
		test.skip("errors if subtotal above max");
		test.skip("errors if subtotal below min");
		test.skip("different error message if min === max");
		test.skip("no error if subtotal above max but not above max + EPSILON");
		test.skip("no error if subtotal below min but not below min - EPSILON");
	});
});

async function deploy(body: Record<string, unknown>) {
	await runWrangler(
		`workers deployments create --worker test-name --strategy percentage --body '${JSON.stringify(body)}'`
	);
}

function mockDeployment() {
	let resolveRequest!: (body: Record<string, unknown>) => void;
	const request = new Promise<Record<string, unknown>>((resolve) => {
		resolveRequest = resolve;
	});
	msw.use(
		http.post(
			"*/accounts/:accountId/workers/scripts/:worker/deployments",
			async ({ request: incoming }) => {
				const body = (await incoming.json()) as Record<string, unknown>;
				resolveRequest(body);
				return HttpResponse.json(createFetchResult({ id: "deployment-id" }));
			},
			{ once: true }
		)
	);
	return request;
}

function mockDeploymentFailure(message: string) {
	msw.use(
		http.post(
			"*/accounts/:accountId/workers/scripts/:worker/deployments",
			() =>
				HttpResponse.json(
					createFetchResult(null, false, [{ code: 1000, message }]),
					{ status: 400 }
				),
			{ once: true }
		)
	);
}
