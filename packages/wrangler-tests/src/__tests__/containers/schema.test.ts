import { describe, it } from "vite-plus/test";

describe.skip("containers schema", () => {
	// These assert Wrangler's project configuration schema. cf does not parse it.
	it("documents ssh without exposing wrangler_ssh", () => {});
	it("does not require class_name, since a container may be referenced from `exports`", () => {});
	it("allows `container` on live durable object exports only", () => {});
	it("emits markdownDescription for rich editor hovers", () => {});
});
