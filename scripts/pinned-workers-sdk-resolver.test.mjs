import assert from "node:assert/strict";
import test from "node:test";
import pnpmfile from "../.pnpmfile.mjs";

const resolver = pnpmfile.resolvers[0];
const commit = "514057325d5106562e34e23f3c0e2d972c677a27";

await test("resolves only the reviewed Workers SDK package and commit", () => {
	for (const name of [
		"@cloudflare/config",
		"@cloudflare/containers-shared",
		"miniflare",
	]) {
		for (const bareSpecifier of [
			`https://pkg.pr.new/${name}@${commit}`,
			`https://pkg.pr.new/cloudflare/workers-sdk/${name}@${commit.slice(0, 7)}`,
		]) {
			const wanted = { alias: name, bareSpecifier };
			assert.equal(resolver.canResolve(wanted), true);
			assert.equal(
				resolver.resolve(wanted).resolution.tarball,
				`https://pkg.pr.new/cloudflare/workers-sdk/${name}@${commit}`
			);
		}
	}
});

await test("leaves other exotic dependencies blocked by the existing policy", () => {
	for (const wanted of [
		{
			alias: "@cloudflare/config",
			bareSpecifier: "https://pkg.pr.new/@cloudflare/config@main",
		},
		{
			alias: "@cloudflare/config",
			bareSpecifier: `https://example.com/@cloudflare/config@${commit}`,
		},
		{
			alias: "@cloudflare/config",
			bareSpecifier: `https://pkg.pr.new/other/repo/@cloudflare/config@${commit.slice(0, 7)}`,
		},
		{
			alias: "unrelated",
			bareSpecifier: `https://pkg.pr.new/unrelated@${commit}`,
		},
		{
			alias: "@cloudflare/config",
			bareSpecifier: `https://pkg.pr.new/@cloudflare/config@${commit}?other=true`,
		},
	]) {
		assert.equal(resolver.canResolve(wanted), false);
		assert.throws(
			() => resolver.resolve(wanted),
			/Unapproved Workers SDK prerelease/
		);
	}
});
