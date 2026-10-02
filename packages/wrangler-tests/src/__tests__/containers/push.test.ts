import { describe, it } from "vite-plus/test";

describe.skip("containers push", () => {
	// Image tagging and pushing are Docker-backed Wrangler operations.
	it("should help", () => {});
	it("should push image with valid platform", () => {});
	it("should reject pushing image if platform is not linux/amd64", () => {});
	it("should tag image with the correct uri if given an <image>:<tag> argument", () => {});
	it("should tag image with the correct uri if given an <namespace>/<image>:<tag> argument", () => {});
	it("should tag image with the correct uri if given an registry.cloudflare.com/<image>:<tag> argument", () => {});
	it("should tag image with the correct uri if given an registry.cloudflare.com/some-account-id/<image>:<tag> argument", () => {});
});
