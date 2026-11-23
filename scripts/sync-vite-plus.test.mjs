import assert from "node:assert/strict";
import { test } from "node:test";
import { syncVitePlus } from "./sync-vite-plus.mjs";

const workspace = `catalog:
  vite: "npm:@voidzero-dev/vite-plus-core@1.6.0"
  vite-plus: 1.7.0
catalogs:
  other:
    vite: 8.3.8
overrides:
  vite@*: "catalog:"
  "vitest@*": 5.0.0 # Keep this aligned
`;

const dependencies = {
	vite: "npm:@voidzero-dev/vite-plus-core@8.3.8000",
	vitest: "5.1.0",
};

await test("syncs both workspace pins from the selected release without reformatting", async () => {
	const original = workspace.replaceAll("\n", "\r\n");
	const fetchRelease = async (url) => {
		assert.equal(url, "https://registry.npmjs.org/vite-plus/1.7.0");
		return Response.json({ dependencies });
	};
	const updated = await syncVitePlus(original, fetchRelease);
	assert.equal(
		updated,
		original
			.replace("vite-plus-core@1.6.0", "vite-plus-core@8.3.8000")
			.replace("5.0.0", "5.1.0")
	);
	assert.equal(await syncVitePlus(updated, fetchRelease), updated);
});

await test("rejects unsupported dependency metadata", async () => {
	await assert.rejects(
		syncVitePlus(workspace, async () =>
			Response.json({ dependencies: { ...dependencies, vitest: "^5.1.0" } })
		),
		/Expected exact Vite and Vitest dependencies/
	);
});

await test("rejects registry errors", async () => {
	await assert.rejects(
		syncVitePlus(workspace, async () => new Response(null, { status: 404 })),
		/Could not read vite-plus@1\.7\.0 metadata: HTTP 404/
	);
});

await test("refuses to look up an unpinned release", async () => {
	await assert.rejects(
		syncVitePlus(workspace.replace("1.7.0", "latest"), async () => {
			assert.fail("unexpected registry lookup");
		}),
		/Expected an exact vite-plus version/
	);
});
