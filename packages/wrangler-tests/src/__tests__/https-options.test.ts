import { describe, it } from "vitest";

// `validateHttpsOptions` is wrangler's dev-server HTTPS cert/key loader. cf
// does not run a dev server itself — `cf dev` delegates to a per-language
// dev-server implementation (Vite plugin / wrangler-bundler / python /
// rust). Cert validation lives in those impls, not in cf.
// The whole suite is intentionally skipped as there is no cf equivalent.

describe("validateHttpsOptions()", () => {
	it.skip("should return undefined if nothing is passed in");

	it.skip("should read the certs from the paths if provided");

	it.skip("should error if only one of the two paths is provided");

	it.skip("should error if the key file does not exist");

	it.skip("should error if the cert file does not exist");

	it.skip("should read the certs from the paths in env vars");

	it.skip(
		"should read the certs from the param paths rather than paths in env vars"
	);
});
