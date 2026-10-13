import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import {
	getVendoredForgeVersion,
	resolveForgePackage,
	verifyForgeTarball,
} from "./sync-forge.ts";

const preview = "0.1.0-main.42.gabc1234";
const tarball = `https://npm.pkg.github.com/download/@cloudflare/forge/${preview}/abc`;

function packument(overrides: Record<string, unknown> = {}) {
	return {
		name: "@cloudflare/forge",
		"dist-tags": { main: preview, "branch-sk-release": "0.1.0-sk.1.gdef5678" },
		versions: {
			[preview]: {
				dist: { tarball, integrity: "sha512-abc", shasum: "def" },
			},
			"0.1.0-sk.1.gdef5678": {
				dist: { tarball: `${tarball}-sk`, shasum: "123" },
			},
		},
		...overrides,
	};
}

await test("resolves the latest main build from GitHub Packages with the read token", async (context) => {
	const requests: { url: string; authorization: string | null }[] = [];
	context.mock.method(
		globalThis,
		"fetch",
		async (url: string, init: RequestInit) => {
			requests.push({
				url,
				authorization: new Headers(init.headers).get("Authorization"),
			});
			return Response.json(packument());
		}
	);

	assert.deepEqual(await resolveForgePackage("read-token"), {
		version: preview,
		tarball,
		integrity: "sha512-abc",
		shasum: "def",
	});
	assert.deepEqual(requests, [
		{
			url: "https://npm.pkg.github.com/@cloudflare%2fforge",
			authorization: "Bearer read-token",
		},
	]);
});

await test("a missing main tag, unsafe versions, and auth failures are reported", async (context) => {
	let response = Response.json(
		packument({ "dist-tags": { "branch-sk-release": "0.1.0-sk.1.gdef5678" } })
	);
	context.mock.method(globalThis, "fetch", async () => response.clone());

	await assert.rejects(
		resolveForgePackage("read-token"),
		/has no main dist-tag \(dist-tags: branch-sk-release\)/
	);

	response = Response.json(
		packument({
			"dist-tags": { main: "../evil" },
			versions: { "../evil": { dist: { tarball, shasum: "x" } } },
		})
	);
	await assert.rejects(
		resolveForgePackage("read-token"),
		/unexpected version: \.\.\/evil/
	);

	response = Response.json(
		packument({ versions: { [preview]: { dist: { tarball } } } })
	);
	await assert.rejects(resolveForgePackage("read-token"), /no integrity hash/);

	for (const elsewhere of [
		"https://attacker.example/forge.tgz",
		"http://npm.pkg.github.com/forge.tgz",
		"https://npm.pkg.github.com.attacker.example/forge.tgz",
		"not a url",
	]) {
		response = Response.json(
			packument({
				versions: {
					[preview]: { dist: { tarball: elsewhere, shasum: "def" } },
				},
			})
		);
		await assert.rejects(
			resolveForgePackage("read-token"),
			/has a tarball outside https:\/\/npm\.pkg\.github\.com/
		);
	}

	response = new Response("denied", { status: 403, statusText: "Forbidden" });
	await assert.rejects(resolveForgePackage("read-token"), /read:packages/);
});

await test("tarballs must match the registry's integrity hash", () => {
	const bytes = Buffer.from("forge tarball");
	const sha512 = createHash("sha512").update(bytes).digest("base64");
	const sha1 = createHash("sha1").update(bytes).digest("hex");
	const pkg = { version: preview, tarball, shasum: undefined };

	verifyForgeTarball({ ...pkg, integrity: `sha512-${sha512}` }, bytes);
	verifyForgeTarball({ ...pkg, integrity: undefined, shasum: sha1 }, bytes);
	assert.throws(
		() =>
			verifyForgeTarball(
				{ ...pkg, integrity: `sha512-${sha512}` },
				Buffer.from("tampered")
			),
		/failed its integrity check/
	);
	assert.throws(
		() =>
			verifyForgeTarball(
				{ ...pkg, integrity: undefined, shasum: sha1 },
				Buffer.from("tampered")
			),
		/failed its shasum check/
	);
	assert.throws(
		() => verifyForgeTarball({ ...pkg, integrity: "sha1-abc" }, bytes),
		/Unsupported integrity hash/
	);
});

await test("reads the vendored version from packages/cli", () => {
	assert.match(getVendoredForgeVersion(), /^\d+\.\d+\.\d+/);
});
