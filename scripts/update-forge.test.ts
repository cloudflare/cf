/* oxlint-disable turbo/no-undeclared-env-vars -- standalone automation tests */
import assert from "node:assert/strict";
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";

// Keep a cf write token present at module initialization to catch accidental
// authentication defaults in requests for public Forge resources.
const originalToken = process.env.GH_TOKEN;
process.env.GH_TOKEN = "cf-write-token";
const {
	getForgeEnvironment,
	getLatestForgeRelease,
	githubResponse,
	output,
	prepareForgeOpenApi,
	run,
} = await import("./update-forge.ts");
if (originalToken === undefined) {
	delete process.env.GH_TOKEN;
} else {
	process.env.GH_TOKEN = originalToken;
}

const version = "b".repeat(40);
const forgeCredentials = {
	GH_TOKEN: "cf-write-token",
	GITHUB_TOKEN: "workflow-write-token",
	FORGE_GITHUB_TOKEN: "legacy-forge-token",
	gh_token: "lowercase-token",
	Github_Token: "mixed-case-token",
	GIT_CONFIG_COUNT: "1",
	GIT_CONFIG_KEY_0: "http.https://github.com/.extraheader",
	GIT_CONFIG_VALUE_0: "AUTHORIZATION: basic private-token",
	git_config_parameters: "private git configuration",
};

await test("Forge release reads are anonymous while cf requests can authenticate", async (context) => {
	const requests: { path: string; authorization: string | null }[] = [];
	context.mock.method(
		globalThis,
		"fetch",
		async (url: string, init: RequestInit) => {
			requests.push({
				path: new URL(url).pathname,
				authorization: new Headers(init.headers).get("Authorization"),
			});
			return Response.json({
				tag_name: `openapi@${version}`,
				assets: [{ name: "openapi.forge.json", id: 123 }],
			});
		}
	);

	assert.deepEqual(await getLatestForgeRelease(), {
		tag: `openapi@${version}`,
		version,
		assetId: 123,
	});
	await githubResponse("/repos/cloudflare/cf/pulls", {}, "cf-write-token");
	assert.deepEqual(requests, [
		{ path: "/repos/cloudflare/forge/releases/latest", authorization: null },
		{
			path: "/repos/cloudflare/cf/pulls",
			authorization: "Bearer cf-write-token",
		},
	]);
});

await test("GitHub POST does not retry transport failures", async (context) => {
	let attempts = 0;
	const failure = new TypeError("fetch failed", { cause: new Error("EPIPE") });
	context.mock.method(
		globalThis,
		"fetch",
		async (_url: string, init: RequestInit) => {
			attempts++;
			assert.equal(init.method, "POST");
			throw failure;
		}
	);

	await assert.rejects(
		githubResponse(
			"/repos/cloudflare/cf/pulls",
			{ method: "POST", body: "{}" },
			"cf-write-token"
		),
		(error: unknown) => error === failure
	);
	assert.equal(attempts, 1);
});

await test("subprocesses leave the event loop responsive and preserve exit status", async () => {
	let timerFired = false;
	setTimeout(() => {
		timerFired = true;
	}, 10);
	await run(process.execPath, ["-e", "setTimeout(() => {}, 100)"]);
	assert.equal(timerFired, true);
	assert.equal(
		await output(process.execPath, ["-e", "process.stdout.write('  value \\n')"]),
		"value"
	);
	await assert.rejects(
		run(process.execPath, ["-e", "process.exit(7)"]),
		/exited with status 7/
	);
});

await test("Forge subprocesses receive no GitHub tokens or injected Git credentials", () => {
	const environment = {
		...forgeCredentials,
		PATH: "toolchain",
		RUNNER_TEMP: "temp",
	};
	const originalEnvironment = { ...environment };
	assert.deepEqual(getForgeEnvironment(environment), {
		PATH: "toolchain",
		RUNNER_TEMP: "temp",
	});
	assert.deepEqual(environment, originalEnvironment);
});

await test("OpenAPI assets download anonymously and compatibility fixes preserve the source", async (context) => {
	const forgeDir = mkdtempSync(join(tmpdir(), "cf-forge-auth-test-"));
	context.after(() => rmSync(forgeDir, { recursive: true, force: true }));
	const compatibilityPath = join(
		forgeDir,
		"packages/forge/shared/fern-openapi-compat.ts"
	);
	mkdirSync(dirname(compatibilityPath), { recursive: true });
	writeFileSync(join(forgeDir, "package.json"), '{"type":"module"}');
	writeFileSync(
		compatibilityPath,
		`
export function applyFernCompatibilityFixes(source) {
  source.paths["/compatibility-fix"] = {};
  return { fixes: 1 };
}
`
	);

	const source = { openapi: "3.0.0", paths: {} };
	let downloaded = false;
	context.mock.method(
		globalThis,
		"fetch",
		async (url: string, init: RequestInit) => {
			assert.equal(
				new URL(url).pathname,
				"/repos/cloudflare/forge/releases/assets/123"
			);
			const headers = new Headers(init.headers);
			assert.equal(headers.get("Authorization"), null);
			assert.equal(headers.get("Accept"), "application/octet-stream");
			downloaded = true;
			return Response.json(source);
		}
	);

	await prepareForgeOpenApi(forgeDir, 123);
	assert.equal(downloaded, true);
	assert.deepEqual(
		JSON.parse(readFileSync(join(forgeDir, "openapi.json"), "utf8")),
		source
	);
	assert.deepEqual(
		JSON.parse(
			readFileSync(
				join(forgeDir, "packages/cloudflare-fern-config/fern/openapi.json"),
				"utf8"
			)
		),
		{ openapi: "3.0.0", paths: { "/compatibility-fix": {} } }
	);
});
