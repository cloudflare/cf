import { CloudflareApiError } from "#sdk";
import { APIError as WorkersUtilsAPIError } from "@cloudflare/workers-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleError } from "../../lib/errors.js";

/**
 * Unit tests for `lib/errors.ts` — the central `handleError` funnel that
 * `main()` runs every rejected command through.
 *
 * Contracts under test:
 *  - **Rethrow fidelity.** `handleError` returns the input error
 *    unchanged so `main()` can rethrow it and callers / tests can still
 *    inspect the original shape (status, code, message).
 *  - **APIError rendering.** The boxed report surfaces each
 *    `{code, message}` entry plus a status/request tail line, with the
 *    host stripped to a path-only request line.
 *  - **Status hints.** 401 → `cf auth login`; 403 → token-permissions
 *    hint. (Per AGENTS.md these are status-level only — no per-code
 *    knowledge lives here.)
 *  - **Token redaction.** Under `DEBUG`, stack traces are emitted but
 *    long token-shaped strings are redacted.
 *
 * Colors are off in tests (chalk level 0), so the rendered box is plain
 * text and we assert on substrings.
 */
describe("handleError", () => {
	let errSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		errSpy.mockRestore();
	});

	/** All text written to stderr, concatenated. */
	function stderr(): string {
		return errSpy.mock.calls.map((c: unknown[]) => c.join(" ")).join("\n");
	}

	it("returns the same error instance it was given (rethrow contract)", () => {
		const err = new Error("boom");
		expect(handleError(err)).toBe(err);
	});

	describe("APIError", () => {
		it("renders code, message, status text, and a path-only request line", () => {
			const err = new CloudflareApiError({
				message: "Bad Request",
				statusCode: 400,
				body: {
					success: false,
					errors: [{ code: 7003, message: "Invalid foo" }],
				},
				rawResponse: {
					status: 400,
					statusText: "Bad Request",
					url: "https://api.cloudflare.com/client/v4/accounts/abc/foo",
					headers: new Headers(),
					redirected: false,
					type: "basic",
				},
			});
			expect(handleError(err)).toBe(err);
			const out = stderr();
			expect(out).toContain("APIError");
			expect(out).toContain("7003");
			expect(out).toContain("Invalid foo");
			expect(out).toContain("400 Bad Request");
			expect(out).toContain("/accounts/abc/foo");
			expect(out).not.toContain("api.cloudflare.com");
		});

		it("renders without a request line when none is attached", () => {
			const err = new CloudflareApiError({
				message: "Server Error",
				statusCode: 500,
				body: {
					success: false,
					errors: [{ code: 1000, message: "kaboom" }],
				},
			});
			handleError(err);
			const out = stderr();
			expect(out).toContain("500 Internal Server Error");
			expect(out).toContain("kaboom");
		});

		it("hints to log in on 401", () => {
			handleError(
				new CloudflareApiError({
					message: "Unauthorized",
					statusCode: 401,
					body: { errors: [] },
				})
			);
			expect(stderr()).toContain("cf auth login");
		});

		it("hints to check permissions on 403", () => {
			handleError(
				new CloudflareApiError({
					message: "Forbidden",
					statusCode: 403,
					body: { errors: [] },
				})
			);
			expect(stderr()).toContain("Check your API token permissions");
		});

		it("does not emit an auth hint for a 404", () => {
			handleError(
				new CloudflareApiError({
					message: "Not Found",
					statusCode: 404,
					body: { errors: [] },
				})
			);
			const out = stderr();
			expect(out).not.toContain("cf auth login");
			expect(out).not.toContain("Check your API token permissions");
		});
	});

	// The deploy path throws @cloudflare/workers-utils' APIError, a
	// different class from the forge SDK's. Its actionable detail lives in
	// `.notes`, not `.error.errors` — `handleError` must surface those or
	// the failure reads as an opaque "request failed".
	describe("workers-utils APIError (deploy path)", () => {
		it("surfaces the notes rather than the generic envelope message", () => {
			const err = new WorkersUtilsAPIError({
				text: "A request to the Cloudflare API (/accounts/abc/workers/assets/upload?base64=true) failed.",
				notes: [
					{
						text: "Invalid Content-Type header. The request body must be in multipart/form-data.",
					},
				],
				status: 400,
				telemetryMessage: false,
			});
			err.code = -1;
			expect(handleError(err)).toBe(err);
			const out = stderr();
			expect(out).toContain("APIError");
			expect(out).toContain("[-1]");
			expect(out).toContain(
				"Invalid Content-Type header. The request body must be in multipart/form-data."
			);
			expect(out).toContain("400 Bad Request");
		});

		it("falls back to the message when there are no notes", () => {
			const err = new WorkersUtilsAPIError({
				text: "A request to the Cloudflare API (/accounts/abc/foo) failed.",
				notes: [],
				status: 500,
				telemetryMessage: false,
			});
			handleError(err);
			const out = stderr();
			expect(out).toContain("A request to the Cloudflare API");
			expect(out).toContain("500 Internal Server Error");
		});

		it("hints to log in on 401", () => {
			handleError(
				new WorkersUtilsAPIError({
					text: "nope",
					notes: [],
					status: 401,
					telemetryMessage: false,
				})
			);
			expect(stderr()).toContain("cf auth login");
		});
	});

	describe("plain Error", () => {
		it("renders the message and returns the error", () => {
			const err = new Error("something went wrong");
			expect(handleError(err)).toBe(err);
			expect(stderr()).toContain("something went wrong");
		});

		it("redacts token-shaped strings from the stack under DEBUG", () => {
			vi.stubEnv("DEBUG", "1");
			const err = new Error("auth failed");
			// 40+ char token-shaped substring embedded in the stack.
			const token = "a".repeat(48);
			err.stack = `Error: auth failed\n    at leak (${token})`;
			handleError(err);
			const out = stderr();
			expect(out).toContain("[REDACTED]");
			expect(out).not.toContain(token);
			vi.unstubAllEnvs();
		});
	});

	describe("unknown error shapes", () => {
		it("renders a generic box and returns the value", () => {
			const weird = { not: "an error" };
			expect(handleError(weird)).toBe(weird);
			expect(stderr()).toContain("An unexpected error occurred");
		});
	});
});
