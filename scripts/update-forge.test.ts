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
import { setImmediate } from "node:timers/promises";
import type { TestContext } from "node:test";

// Keep a cf write token present at module initialization to catch accidental
// authentication defaults in requests for public Forge resources.
const originalToken = process.env.GH_TOKEN;
process.env.GH_TOKEN = "cf-write-token";
const {
	createOrUpdatePullRequest,
	formatError,
	getForgeEnvironment,
	getLatestForgeRelease,
	githubResponse,
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

function transportError(code = "UND_ERR_SOCKET"): TypeError {
	return new TypeError("fetch failed", {
		cause: Object.assign(new Error("other side closed"), { code }),
	});
}

function mockRetries(context: TestContext): void {
	context.mock.timers.enable({ apis: ["setTimeout"] });
	context.mock.method(console, "warn", () => {});
	context.mock.method(console, "log", () => {});
}

async function advanceRetry(
	context: TestContext,
	milliseconds: number
): Promise<void> {
	// Let the rejected fetch schedule its backoff before advancing mock time.
	await setImmediate();
	context.mock.timers.tick(milliseconds);
	await setImmediate();
}

await test("GET and PATCH retry transient transport failures with fresh timeout signals", async (context) => {
	mockRetries(context);
	for (const method of ["GET", "PATCH"]) {
		const signals: AbortSignal[] = [];
		let attempts = 0;
		context.mock.method(
			globalThis,
			"fetch",
			async (_url: string, init: RequestInit) => {
				assert.ok(init.signal instanceof AbortSignal);
				signals.push(init.signal);
				if (++attempts < 3) {
					throw transportError();
				}
				return Response.json({ ok: true });
			}
		);
		const result = githubResponse("/repos/cloudflare/cf/pulls/1", { method });
		await advanceRetry(context, 999);
		assert.equal(attempts, 1);
		await advanceRetry(context, 1);
		assert.equal(attempts, 2);
		await advanceRetry(context, 2000);
		assert.deepEqual(await (await result).json(), { ok: true });
		assert.equal(attempts, 3);
		assert.equal(new Set(signals).size, 3);
	}
});

await test("exhausted retries retain request context and the original socket cause", async (context) => {
	mockRetries(context);
	const cause = transportError("ECONNRESET");
	let attempts = 0;
	context.mock.method(globalThis, "fetch", async () => {
		attempts++;
		throw cause;
	});
	const failure = assert.rejects(
		githubResponse("/repos/cloudflare/cf/pulls/1", { method: "PATCH" }),
		(error: unknown) => {
			assert.ok(error instanceof Error);
			assert.equal(error.cause, cause);
			assert.match(
				formatError(error),
				/GitHub API PATCH \/repos\/cloudflare\/cf\/pulls\/1 failed/
			);
			assert.match(
				formatError(error),
				/Caused by: Error: other side closed \(ECONNRESET\)/
			);
			return true;
		}
	);
	await advanceRetry(context, 1000);
	await advanceRetry(context, 2000);
	await failure;
	assert.equal(attempts, 3);
});

await test("authentication and validation responses are reported without retrying", async (context) => {
	for (const status of [401, 403, 422]) {
		let attempts = 0;
		context.mock.method(globalThis, "fetch", async () => {
			attempts++;
			return Response.json({ message: "rejected" }, { status });
		});
		await assert.rejects(
			githubResponse("/repos/cloudflare/cf/pulls", { method: "POST" }),
			new RegExp(`GitHub API POST .* failed \\(${status} .*rejected`)
		);
		assert.equal(attempts, 1);
	}
});

await test("certificate errors and caller cancellation are not retried", async (context) => {
	let attempts = 0;
	context.mock.method(globalThis, "fetch", async () => {
		attempts++;
		throw transportError("CERT_HAS_EXPIRED");
	});
	await assert.rejects(
		githubResponse("/repos/cloudflare/cf/pulls"),
		/GitHub API GET/
	);
	assert.equal(attempts, 1);

	const controller = new AbortController();
	controller.abort();
	context.mock.method(
		globalThis,
		"fetch",
		async (_url: string, init: RequestInit) => {
			attempts++;
			assert.equal(init.signal?.aborted, true);
			throw transportError();
		}
	);
	await assert.rejects(
		githubResponse("/repos/cloudflare/cf/pulls", { signal: controller.signal }),
		/GitHub API GET/
	);
	assert.equal(attempts, 2);
});

await test("POST requests are never retried by the generic request helper", async (context) => {
	let attempts = 0;
	context.mock.method(globalThis, "fetch", async () => {
		attempts++;
		throw transportError();
	});
	await assert.rejects(
		githubResponse("/repos/cloudflare/cf/pulls", { method: "POST" }),
		/GitHub API POST/
	);
	assert.equal(attempts, 1);
});

await test("release reads retry failures while consuming the response body", async (context) => {
	mockRetries(context);
	let attempts = 0;
	context.mock.method(globalThis, "fetch", async () => {
		if (++attempts === 1) {
			return new Response(
				new ReadableStream({
					start(controller) {
						controller.error(transportError());
					},
				})
			);
		}
		return Response.json({
			tag_name: `openapi@${version}`,
			assets: [{ name: "openapi.forge.json", id: 123 }],
		});
	});
	const result = getLatestForgeRelease();
	await advanceRetry(context, 1000);
	assert.equal((await result).version, version);
	assert.equal(attempts, 2);
});

await test("invalid JSON is reported without retrying", async (context) => {
	let attempts = 0;
	context.mock.method(globalThis, "fetch", async () => {
		attempts++;
		return new Response("invalid JSON");
	});
	await assert.rejects(getLatestForgeRelease(), (error: unknown) => {
		assert.ok(error instanceof Error);
		assert.ok(error.cause instanceof SyntaxError);
		return true;
	});
	assert.equal(attempts, 1);
});

await test("a lost PR creation response is reconciled and the existing PR is updated", async (context) => {
	mockRetries(context);
	for (const lostBody of [false, true]) {
		const requests: string[] = [];
		context.mock.method(
			globalThis,
			"fetch",
			async (url: string, init: RequestInit) => {
				const target = new URL(url);
				requests.push(`${init.method ?? "GET"} ${target.pathname}`);
				assert.equal(
					new Headers(init.headers).get("Authorization"),
					"Bearer cf-write-token"
				);
				if (init.method === "POST") {
					if (lostBody) {
						return new Response(
							new ReadableStream({
								start(controller) {
									controller.error(transportError());
								},
							})
						);
					}
					throw transportError();
				}
				if (init.method === "PATCH") {
					assert.equal(target.pathname, "/repos/cloudflare/cf/pulls/220");
					assert.ok(typeof init.body === "string");
					assert.deepEqual(JSON.parse(init.body), {
						title: "update title",
						body: "update body",
					});
					return Response.json({});
				}
				assert.equal(
					target.searchParams.get("head"),
					"cloudflare:automation/update-forge"
				);
				assert.equal(target.searchParams.get("base"), "main");
				assert.equal(target.searchParams.get("state"), "open");
				return Response.json([{ number: 220, head: { sha: "a".repeat(40) } }]);
			}
		);
		const result = createOrUpdatePullRequest(
			"cloudflare/cf",
			undefined,
			"update title",
			"update body"
		);
		await advanceRetry(context, 1000);
		await result;
		assert.deepEqual(requests, [
			"POST /repos/cloudflare/cf/pulls",
			"GET /repos/cloudflare/cf/pulls",
			"PATCH /repos/cloudflare/cf/pulls/220",
		]);
	}
});

await test("PR creation retries only after checking that no open PR exists", async (context) => {
	mockRetries(context);
	const requests: string[] = [];
	let posts = 0;
	context.mock.method(
		globalThis,
		"fetch",
		async (_url: string, init: RequestInit) => {
			requests.push(init.method ?? "GET");
			if (init.method === "POST") {
				if (++posts === 1) {
					throw transportError();
				}
				return Response.json({
					html_url: "https://github.com/cloudflare/cf/pull/221",
				});
			}
			return Response.json([]);
		}
	);
	const result = createOrUpdatePullRequest(
		"cloudflare/cf",
		undefined,
		"title",
		"body"
	);
	await advanceRetry(context, 1000);
	await result;
	assert.deepEqual(requests, ["POST", "GET", "POST"]);
});

await test("PR creation is bounded and reconciles its final failed attempt", async (context) => {
	mockRetries(context);
	const requests: string[] = [];
	context.mock.method(
		globalThis,
		"fetch",
		async (_url: string, init: RequestInit) => {
			requests.push(init.method ?? "GET");
			if (init.method === "POST") {
				throw transportError();
			}
			return Response.json([]);
		}
	);
	const result = assert.rejects(
		createOrUpdatePullRequest("cloudflare/cf", undefined, "title", "body"),
		/GitHub API POST/
	);
	await advanceRetry(context, 1000);
	await advanceRetry(context, 2000);
	await result;
	assert.deepEqual(requests, ["POST", "GET", "POST", "GET", "POST", "GET"]);
});

await test("failed reconciliation stops without issuing another POST", async (context) => {
	mockRetries(context);
	const requests: string[] = [];
	context.mock.method(
		globalThis,
		"fetch",
		async (_url: string, init: RequestInit) => {
			requests.push(init.method ?? "GET");
			if (init.method === "POST") {
				throw transportError();
			}
			return Response.json({ message: "Forbidden" }, { status: 403 });
		}
	);
	const result = assert.rejects(
		createOrUpdatePullRequest("cloudflare/cf", undefined, "title", "body"),
		/GitHub API GET .*403/
	);
	await advanceRetry(context, 1000);
	await result;
	assert.deepEqual(requests, ["POST", "GET"]);
});

await test("formatError includes nested transport codes without dumping credentials", () => {
	const cause = Object.assign(new Error("connection failed"), {
		code: "ECONNRESET",
		env: forgeCredentials,
		headers: { Authorization: "Bearer private-token" },
		body: "private-request-body",
	});
	const aggregate = new AggregateError([cause], "multiple connections failed");
	const formatted = formatError(
		new TypeError("fetch failed", { cause: aggregate })
	);
	assert.match(formatted, /TypeError: fetch failed/);
	assert.match(formatted, /AggregateError: multiple connections failed/);
	assert.match(formatted, /Error: connection failed \(ECONNRESET\)/);
	assert.doesNotMatch(formatted, /private|cf-write-token/);
});

await test("subprocesses let the event loop run and preserve arguments, cwd, and env", async (context) => {
	const directory = mkdtempSync(join(tmpdir(), "cf-updater process & spaces-"));
	context.after(() => rmSync(directory, { recursive: true, force: true }));
	let yielded = false;
	const immediate = setImmediate().then(() => {
		yielded = true;
	});
	await run(
		process.execPath,
		[
			"-e",
			`
    const assert = require('node:assert/strict');
    const { realpathSync } = require('node:fs');
    assert.equal(realpathSync(process.cwd()), realpathSync(process.env.CF_TEST_CWD));
    assert.equal(process.argv[1], 'argument with spaces & % !');
    setTimeout(() => {}, 50);
  `,
			"argument with spaces & % !",
		],
		{
			cwd: directory,
			env: { ...process.env, CF_TEST_CWD: directory },
		}
	);
	assert.equal(yielded, true);
	await immediate;
});

await test("subprocess failures still reject the updater operation", async () => {
	await assert.rejects(run(process.execPath, ["-e", "process.exit(7)"]));
	await assert.rejects(run("cf-nonexistent-updater-executable", []));
});

await test("Forge child processes cannot regain credentials from the parent environment", async (context) => {
	const credentials = {
		GH_TOKEN: "cf-write-token",
		GITHUB_TOKEN: "workflow-write-token",
		FORGE_GITHUB_TOKEN: "legacy-forge-token",
		GIT_CONFIG_COUNT: "1",
		GIT_CONFIG_KEY_0: "http.https://github.com/.extraheader",
		GIT_CONFIG_VALUE_0: "AUTHORIZATION: basic private-token",
	};
	const originals = Object.fromEntries(
		Object.keys(credentials).map((key) => [key, process.env[key]])
	);
	context.after(() => {
		for (const [key, value] of Object.entries(originals)) {
			if (value === undefined) {
				delete process.env[key];
			} else {
				process.env[key] = value;
			}
		}
	});
	Object.assign(process.env, credentials);
	await run(
		process.execPath,
		[
			"-e",
			`
    const assert = require('node:assert/strict');
    for (const key of Object.keys(process.env)) {
      assert.ok(!/^(?:GH_TOKEN|GITHUB_TOKEN|FORGE_GITHUB_TOKEN|GIT_CONFIG_(?:COUNT|KEY_\\d+|VALUE_\\d+))$/i.test(key));
    }
  `,
		],
		{ env: getForgeEnvironment() }
	);
});
