import { resolve } from "node:path";
import { getCfConfigPath } from "@cloudflare/workers-auth/cf";
import { describe, expect, it } from "vite-plus/test";
import { getCloudflareRegistryPath } from "../../lib/registry.js";

describe("getCloudflareRegistryPath", () => {
	it("uses cf's global registry by default", () => {
		expect(
			getCloudflareRegistryPath({
				WRANGLER_REGISTRY_PATH: "ignored",
			})
		).toBe(resolve(getCfConfigPath(), "registry"));
	});

	it("treats an empty CLOUDFLARE_REGISTRY_PATH as unset", () => {
		expect(
			getCloudflareRegistryPath({
				CLOUDFLARE_REGISTRY_PATH: "",
			})
		).toBe(resolve(getCfConfigPath(), "registry"));
	});

	it("resolves CLOUDFLARE_REGISTRY_PATH from cwd", () => {
		expect(
			getCloudflareRegistryPath({
				CLOUDFLARE_REGISTRY_PATH: "custom-registry",
				WRANGLER_REGISTRY_PATH: "ignored",
			})
		).toBe(resolve("custom-registry"));
	});
});
