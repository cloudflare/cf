import {
	mkdtempSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	narrowSdkClientErrorImports,
	narrowSdkErrorImports,
} from "../../../generator/sdk-error-imports.js";

const errorNames = new Set(["BadRequestError"]);

describe("narrowSdkClientErrorImports", () => {
	it.each(["./api/index.js", "../../../../../index.js"])(
		"separates errors and request types from %s",
		(apiPath) => {
			const source = `import * as CloudflareApi from "${apiPath}";
export function request(body: CloudflareApi.Request): CloudflareApi.Response {
    throw new CloudflareApi.BadRequestError(body);
}`;
			const narrowed = narrowSdkClientErrorImports(source, errorNames);
			expect(narrowed).toContain(
				`import type * as CloudflareApi from "${apiPath}";`
			);
			expect(narrowed).toContain(
				`import * as CloudflareApiErrors from "${apiPath.replace("index.js", "errors/index.js")}";`
			);
			expect(narrowed).toContain(
				"new CloudflareApiErrors.BadRequestError(body)"
			);
			expect(narrowed).toContain("body: CloudflareApi.Request");
			expect(narrowSdkClientErrorImports(narrowed, errorNames)).toBe(narrowed);
		}
	);

	it("drops runtime imports when only types and JSDoc use the namespace", () => {
		const source = `import * as CloudflareApi from "./api/index.js";
/** @throws CloudflareApi.BadRequestError */
export type Request = CloudflareApi.Request;`;
		const narrowed = narrowSdkClientErrorImports(source, errorNames);
		expect(narrowed).toContain("import type * as CloudflareApi");
		expect(narrowed).not.toContain("CloudflareApiErrors");
	});

	it("ignores request and error references in emitted method documentation", () => {
		const source = `import * as CloudflareApi from "./api/index.js";
export class Client {
    /**
     * @throws {@link CloudflareApi.BadRequestError}
     * @example CloudflareApi.Request
     */
    request(body: CloudflareApi.Request) { throw new CloudflareApi.BadRequestError(body); }
}`;
		const narrowed = narrowSdkClientErrorImports(source, errorNames);
		expect(narrowed).toContain("new CloudflareApiErrors.BadRequestError(body)");
		expect(narrowed).toContain("@throws {@link CloudflareApi.BadRequestError}");
	});

	it.each([
		"return CloudflareApi.Value;",
		"throw new CloudflareApi.UnknownError();",
		"return error instanceof CloudflareApi.BadRequestError;",
		"return CloudflareApi[key];",
		"return CloudflareApi;",
		'return "new CloudflareApi.BadRequestError()";',
	])("preserves unfamiliar runtime use: %s", (body) => {
		const source = `import * as CloudflareApi from "./api/index.js";
export function request(error: unknown, key: string) { ${body} }`;
		expect(narrowSdkClientErrorImports(source, errorNames)).toBe(source);
	});

	it("normalizes generated files idempotently without changing the public barrel", () => {
		const sdkDir = mkdtempSync(join(tmpdir(), "cf-sdk-errors-"));
		try {
			const errorsDir = join(sdkDir, "api/errors");
			mkdirSync(errorsDir, { recursive: true });
			writeFileSync(
				join(errorsDir, "BadRequestError.ts"),
				"export class BadRequestError extends Error {}\n"
			);
			const clientPath = join(sdkDir, "Client.ts");
			writeFileSync(
				clientPath,
				`import * as CloudflareApi from "./api/index.js";\nexport function request() { throw new CloudflareApi.BadRequestError(); }\n`
			);
			const barrelPath = join(sdkDir, "api/index.ts");
			const barrel = 'export * from "./errors/index.js";\n';
			writeFileSync(barrelPath, barrel);

			expect(narrowSdkErrorImports(sdkDir)).toBe(1);
			expect(readFileSync(clientPath, "utf8")).toContain(
				"new CloudflareApiErrors.BadRequestError()"
			);
			expect(readFileSync(barrelPath, "utf8")).toBe(barrel);
			expect(narrowSdkErrorImports(sdkDir)).toBe(0);
		} finally {
			rmSync(sdkDir, { recursive: true, force: true });
		}
	});
});
