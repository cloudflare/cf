import { writeFile } from "node:fs/promises";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
	applyCloudflareDotEnv,
	shouldApplyCloudflareDotEnv,
	withCloudflareDotEnv,
} from "../../lib/dotenv.js";

const SUPPORTED_VALUES = [
	["CLOUDFLARE_ACCESS_CLIENT_ID", "access-client-id"],
	["CLOUDFLARE_ACCESS_CLIENT_SECRET", "access-client-secret"],
	["CLOUDFLARE_ACCOUNT_ID", "account-id"],
	["CLOUDFLARE_API_TOKEN", "api-token"],
	["CLOUDFLARE_COMPLIANCE_REGION", "public"],
	["CLOUDFLARE_ZONE_ID", "zone-id"],
	["WRANGLER_API_ENVIRONMENT", "staging"],
] as const;
const FILE_VALUE = "CLOUDFLARE_API_TOKEN";
const PROCESS_VALUE = "CLOUDFLARE_ACCOUNT_ID";
const PROCESS_ONLY_VALUES = [
	"CLOUDFLARE_API_BASE_URL",
	"CLOUDFLARE_AUTH_USE_KEYRING",
	"CLOUDFLARE_CLIENT_ID",
	"CLOUDFLARE_CONTAINER_REGISTRY",
] as const;
const UNSUPPORTED_CLOUDFLARE_VALUE = "CLOUDFLARE_CF_LOCAL_ENV_TEST";
const UNRELATED_VALUE = "CF_UNRELATED_LOCAL_ENV_TEST";
const UNRELATED_WRANGLER_VALUE = "WRANGLER_LOG_SANITIZE";

describe("applyCloudflareDotEnv", () => {
	runInTempDir();

	beforeEach(() => {
		for (const [name] of SUPPORTED_VALUES) {
			vi.stubEnv(name, undefined);
		}
		for (const name of PROCESS_ONLY_VALUES) {
			vi.stubEnv(name, undefined);
		}
		vi.stubEnv(UNSUPPORTED_CLOUDFLARE_VALUE, undefined);
		vi.stubEnv(UNRELATED_VALUE, undefined);
		vi.stubEnv(UNRELATED_WRANGLER_VALUE, undefined);
	});

	it("applies the supported file-sourced values and restores them", async () => {
		await writeFile(
			".env",
			[
				...SUPPORTED_VALUES.map(([name, value]) => `${name}=${value}`),
				`${UNRELATED_VALUE}=unrelated`,
				`${UNRELATED_WRANGLER_VALUE}=false`,
			].join("\n")
		);

		const restore = await applyCloudflareDotEnv();

		for (const [name, value] of SUPPORTED_VALUES) {
			expect(process.env[name]).toBe(value);
		}
		expect(process.env[UNRELATED_VALUE]).toBeUndefined();
		expect(process.env[UNRELATED_WRANGLER_VALUE]).toBeUndefined();

		restore();
		restore();

		for (const [name] of SUPPORTED_VALUES) {
			expect(process.env[name]).toBeUndefined();
		}
		expect(process.env[UNRELATED_VALUE]).toBeUndefined();
		expect(process.env[UNRELATED_WRANGLER_VALUE]).toBeUndefined();
	});

	it("preserves values already present in the process environment", async () => {
		vi.stubEnv(PROCESS_VALUE, "from-process");
		await writeFile(".env", `${PROCESS_VALUE}=from-file`);

		const restore = await applyCloudflareDotEnv();

		expect(process.env[PROCESS_VALUE]).toBe("from-process");
		restore();
		expect(process.env[PROCESS_VALUE]).toBe("from-process");
	});

	it("does not apply unsupported Cloudflare values from files", async () => {
		await writeFile(
			".env",
			[
				...PROCESS_ONLY_VALUES.map((name) => `${name}=file-value`),
				`${UNSUPPORTED_CLOUDFLARE_VALUE}=file-value`,
			].join("\n")
		);

		const restore = await applyCloudflareDotEnv();

		for (const name of [...PROCESS_ONLY_VALUES, UNSUPPORTED_CLOUDFLARE_VALUE]) {
			expect(process.env[name]).toBeUndefined();
		}
		restore();
	});

	it("uses mode-specific dotenv precedence", async () => {
		await writeFile(".env", `${FILE_VALUE}=default`);
		await writeFile(`.env.staging`, `${FILE_VALUE}=staging`);

		const restore = await applyCloudflareDotEnv({ mode: "staging" });

		expect(process.env[FILE_VALUE]).toBe("staging");
		restore();
		expect(process.env[FILE_VALUE]).toBeUndefined();
	});

	it("restores values when a scoped callback fails", async () => {
		await writeFile(".env", `${FILE_VALUE}=from-file`);

		await expect(
			withCloudflareDotEnv({}, () => {
				expect(process.env[FILE_VALUE]).toBe("from-file");
				throw new Error("failed");
			})
		).rejects.toThrow("failed");

		expect(process.env[FILE_VALUE]).toBeUndefined();
	});

	it("does not apply file values in local mode", async () => {
		await writeFile(".env", `${FILE_VALUE}=from-file`);

		await withCloudflareDotEnv({ local: true }, () => {
			expect(process.env[FILE_VALUE]).toBeUndefined();
		});

		expect(process.env[FILE_VALUE]).toBeUndefined();
	});
});

describe("shouldApplyCloudflareDotEnv", () => {
	it.each([
		"auth create",
		"auth login",
		"auth whoami",
		"ai run",
		"containers build",
		"containers push",
		"containers ssh",
		"containers images list",
		"d1 migrations apply",
		"registrar registrations create",
		"schema",
		"zones list",
	])("loads dotenv values for %s", (command) => {
		expect(shouldApplyCloudflareDotEnv(command, false)).toBe(true);
	});

	it.each([
		"access curl",
		"access login",
		"access rdp",
		"access smb",
		"access ssh",
		"access ssh-config",
		"access ssh-gen",
		"access tcp",
		"access token",
		"ai claude",
		"ai codex",
		"ai opencode",
		"ai opencode run",
		"build",
		"dev",
		"init",
		"init workers",
		"migrate",
		"tunnels diag",
		"tunnels login",
		"tunnels quick-start",
		"tunnels ready",
		"tunnels tail",
		"workers check",
		"workers types",
	])("does not load dotenv values for %s", (command) => {
		expect(shouldApplyCloudflareDotEnv(command, false)).toBe(false);
	});

	it.each([
		"deploy",
		"previews deploy",
		"tunnels run",
		"workers triggers deploy",
		"workers versions create",
	])("lets %s manage dotenv timing", (command) => {
		expect(shouldApplyCloudflareDotEnv(command, false)).toBe(false);
	});

	it("does not load dotenv values in local mode", () => {
		expect(shouldApplyCloudflareDotEnv("zones list", true)).toBe(false);
	});
});
