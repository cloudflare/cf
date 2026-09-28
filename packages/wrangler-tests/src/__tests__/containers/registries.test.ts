import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { clearDialogs, mockConfirm } from "../helpers/mock-dialogs";
import { useMockIsTTY } from "../helpers/mock-istty";
import { createFetchResult, msw } from "../helpers/msw";
import { runWrangler } from "../helpers/run-wrangler";
import type { ExpectStatic } from "vitest";

const domain = "123456789012.dkr.ecr.us-west-2.amazonaws.com";

describe("containers registries", () => {
	const std = mockConsoleMethods();
	const { setIsTTY } = useMockIsTTY();
	mockAccountId();
	mockApiToken();
	beforeEach(() => setIsTTY(true));
	afterEach(clearDialogs);

	it.skip("should help");
	it.skip("should not show beta labels in top level help");

	// Wrangler's configure command creates and manages Secrets Store entries.
	// cf exposes the raw registry API shape and does not own that workflow.
	it.skip("should reject unsupported registry domains");
	it.skip("should validate command line arguments for Secrets Store");
	it.skip("should enforce mutual exclusivity for public credential arguments");
	it.skip(
		"should reject provider-specific credential flags used with the wrong registry"
	);
	it.skip("should no-op on cloudflare registry (default)");
	it.skip("should configure AWS ECR registry with interactive prompts");
	it.skip("should accept the secret from piped input");
	it.skip("should configure AWS ECR registry with interactive prompts");
	it.skip(
		"will create a secret store if no existing stores are returned from the api"
	);
	it.skip("will use an existing secret store if a store id is provided");
	it.skip(
		"should reuse an existing secret interactively without prompting for the credential"
	);
	it.skip("should accept the secret from piped input");
	it.skip(
		"should ignore a piped stdin value when reusing an existing secret with --skip-confirmation"
	);
	it.skip("should reuse existing secret without requiring a value (no stdin)");
	it.skip("should configure DockerHub registry with interactive prompts");
	it.skip("should accept the secret from piped input");
	it.skip("should reuse existing secret without requiring a value (no stdin)");
	it.skip("should configure GAR with a key file path");
	it.skip("should configure GAR with base64 key contents");
	it.skip("should reuse an existing secret without prompting for the key");
	it.skip("should accept the key from piped stdin when --gar-email matches");
	it.skip("should reject when --gar-email does not match the key");
	it.skip(
		"should reuse an existing secret without requiring the key (with warning)"
	);
	it.skip("should ignore a piped key when reusing an existing secret");
	it.skip("should require --gar-email");
	it.skip("should validate and encode the key inline when --gar-email matches");
	it.skip("should reject inline when --gar-email does not match the key");

	it("should list empty registries", async ({ expect }) => {
		mockRegistryList([]);
		await runWrangler("containers registries list");
		expect(extractData(JSON.parse(std.out))).toEqual([]);
	});

	it("should list configured registries", async ({ expect }) => {
		const registries = [{ domain }, { domain: "docker.io" }];
		mockRegistryList(registries);
		await runWrangler("containers registries list");
		expect(extractData(JSON.parse(std.out))).toEqual(registries);
	});

	it.skip("should output valid JSON when --json flag is used");

	it("should delete a registry with confirmation", async ({ expect }) => {
		mockConfirm({
			text: "This operation deletes the registry configuration. Containers will no longer be able to pull images from it. Continue?",
			result: true,
		});
		const requestCount = mockRegistryDelete(expect);
		await runWrangler(`containers registries delete ${domain}`);
		expect(requestCount()).toBe(1);
	});

	it("should cancel deletion when user says no", async ({ expect }) => {
		mockConfirm({
			text: "This operation deletes the registry configuration. Containers will no longer be able to pull images from it. Continue?",
			result: false,
		});
		const requestCount = mockRegistryDelete(expect);
		await runWrangler(`containers registries delete ${domain}`);
		expect(requestCount()).toBe(0);
	});

	// cf intentionally refuses destructive operations in non-interactive
	// contexts unless --force is explicit.
	it.skip(
		"should delete a registry in non-interactive mode without skip confirmation flag"
	);

	it("should delete a registry in interactive mode with --skip-confirmation flag", async ({
		expect,
	}) => {
		setIsTTY(true);
		const requestCount = mockRegistryDelete(expect);
		await runWrangler(`containers registries delete ${domain} --force`);
		expect(requestCount()).toBe(1);
	});

	// Associated Secrets Store cleanup is Wrangler orchestration.
	it.skip("should delete registry and associated secret when user confirms");
	it.skip(
		"should delete registry but not secret when user declines secret deletion"
	);
	it.skip("should delete registry and secret with --skip-confirmation flag");
	it.skip("should handle case when secret is already deleted");

	// Wrangler limits this convenience command to the managed registry and
	// supplies default domain/permission flags. The generated API is general.
	it.skip("should reject non-Cloudflare registry domains");
	it.skip("should default to Cloudflare registry when DOMAIN is omitted");
	it.todo("should require --push or --pull");

	it("should generate credentials with --push", async ({ expect }) => {
		mockCredentials(expect, 15, ["push"]);
		await generateCredentials("--permissions push --expiration-minutes 15");
	});
	it("should generate credentials with --pull", async ({ expect }) => {
		mockCredentials(expect, 15, ["pull"]);
		await generateCredentials("--permissions pull --expiration-minutes 15");
	});
	it("should generate credentials with both --push and --pull", async ({
		expect,
	}) => {
		mockCredentials(expect, 15, ["push", "pull"]);
		await generateCredentials(
			"--permissions push pull --expiration-minutes 15"
		);
	});
	it("should support custom expiration-minutes", async ({ expect }) => {
		mockCredentials(expect, 30, ["push"]);
		await generateCredentials("--permissions push --expiration-minutes 30");
	});
	it("should generate credentials with --library-push", async ({ expect }) => {
		mockCredentials(expect, 15, ["library_push"]);
		await generateCredentials(
			"--permissions library_push --expiration-minutes 15"
		);
	});
	it.skip("should output valid JSON when --json flag is used");
});

function extractData(output: unknown): unknown {
	return typeof output === "object" && output !== null && "data" in output
		? (output as { data: unknown }).data
		: output;
}

function mockRegistryList(registries: { domain: string }[]) {
	msw.use(
		http.get(
			"*/accounts/:accountId/containers/registries",
			() => HttpResponse.json(createFetchResult(registries)),
			{ once: true }
		)
	);
}

function mockRegistryDelete(expect: ExpectStatic) {
	let requests = 0;
	msw.use(
		http.delete(
			"*/accounts/:accountId/containers/registries/:domain",
			({ params }) => {
				requests++;
				expect(params.accountId).toBe("some-account-id");
				expect(params.domain).toBe(domain);
				return HttpResponse.json(createFetchResult({ domain }));
			},
			{ once: true }
		)
	);
	return () => requests;
}

function mockCredentials(
	expect: ExpectStatic,
	expirationMinutes: number,
	permissions: string[]
) {
	msw.use(
		http.post(
			"*/accounts/:accountId/containers/registries/:domain/credentials",
			async ({ params, request }) => {
				expect(params.domain).toBe("registry.cloudflare.com");
				expect(await request.json()).toEqual({
					expiration_minutes: expirationMinutes,
					permissions,
				});
				return HttpResponse.json(
					createFetchResult({ username: "test", password: "token" })
				);
			},
			{ once: true }
		)
	);
}

async function generateCredentials(flags: string) {
	await runWrangler(
		`containers registries credentials generate registry.cloudflare.com ${flags}`
	);
}
