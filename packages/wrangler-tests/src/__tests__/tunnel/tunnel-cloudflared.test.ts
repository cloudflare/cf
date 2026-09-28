import { describe, it } from "vitest";
import { runInTempDir } from "../helpers/run-in-tmp";

// Tests wrangler's `tunnel/cloudflared` binary-management module:
// `getCloudflaredBinPath` (cached download path under
// `~/.config/.wrangler/cloudflared/<version>/`), `getAssetFilename`
// (per-platform tarball / .exe naming), `isVersionOutdated` (CalVer
// comparator), and the `CLOUDFLARED_PATH` env override. cf doesn't
// download or manage the cloudflared binary — Cloudflare Tunnel CRUD
// is exposed as forge-generated `cf zero-trust tunnels cloudflared`
// API commands; running a tunnel locally via the cloudflared
// subprocess has no cf equivalent. Out of scope for the wrangler-tests
// corpus.

describe("cloudflared binary management", () => {
	runInTempDir();

	describe("getCloudflaredBinPath", () => {
		it.skip(
			"should return path in wrangler config directory cache including version"
		);
	});

	describe("getAssetFilename", () => {
		it.skip("returns .tgz for darwin");

		it.skip("returns .exe for windows");

		it.skip("returns bare binary name for linux");
	});

	describe("isVersionOutdated", () => {
		it.skip("returns true when installed is older by year");

		it.skip("returns true when installed is older by month");

		it.skip("returns true when installed is older by patch");

		it.skip("returns false when versions are equal");

		it.skip("returns false when installed is newer");

		it.skip("handles double-digit months correctly");
	});
});

describe("environment variable override", () => {
	runInTempDir();

	it.skip("should respect CLOUDFLARED_PATH when set to existing file");

	it.skip(
		"should throw error when CLOUDFLARED_PATH points to non-existent file"
	);
});
