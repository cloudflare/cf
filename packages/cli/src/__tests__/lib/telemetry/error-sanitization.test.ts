import { APIError as WorkersUtilsAPIError } from "@cloudflare/workers-utils";
import { describe, expect, it } from "vitest";
import { sanitizeError } from "../../../lib/telemetry/error-sanitization.js";
import { CloudflareApiError } from "#sdk/errors";

describe("sanitizeError", () => {
	it("captures API status and numeric codes without messages", () => {
		const error = new CloudflareApiError({
			message: "sensitive",
			statusCode: 404,
			body: { errors: [{ code: 1003, message: "sensitive" }] },
		});

		const result = sanitizeError(error);
		expect(result).toEqual({
			errorType: "APIError",
			httpStatus: 404,
			errorCodes: [1003],
		});
		expect(JSON.stringify(result)).not.toContain("sensitive");
	});

	it("uses a fixed classification for ordinary errors", () => {
		const result = sanitizeError(new TypeError("/private/path"));
		expect(result).toEqual({ errorType: "Error" });

		class ProjectControlledName extends Error {}
		const projectError = sanitizeError(
			new ProjectControlledName("sensitive project value")
		);
		expect(projectError).toEqual({ errorType: "Error" });
		expect(JSON.stringify(projectError)).not.toContain("ProjectControlledName");
	});

	it("does not trust project-controlled API error shapes", () => {
		const sdkShaped = Object.assign(new Error("sensitive"), {
			statusCode: 404,
			body: { errors: [{ code: 1003 }] },
			rawResponse: undefined,
		});
		const deployShaped = Object.assign(new Error("sensitive"), {
			status: 403,
			code: 10000,
			notes: [],
		});

		expect(sanitizeError(sdkShaped)).toEqual({ errorType: "Error" });
		expect(sanitizeError(deployShaped)).toEqual({ errorType: "Error" });
	});

	it.each(["body", "statusCode"] as const)(
		"handles a throwing SDK $property accessor",
		(property) => {
			const error = new CloudflareApiError({
				message: "original failure",
				statusCode: 500,
				body: { errors: [] },
			});
			Object.defineProperty(error, property, {
				get: () => {
					throw new Error("accessor failure");
				},
			});

			expect(sanitizeError(error)).toEqual({ errorType: "Error" });
		}
	);

	it.each(["status", "code"] as const)(
		"handles a throwing deploy API $property accessor",
		(property) => {
			const error = new WorkersUtilsAPIError({
				text: "original failure",
				notes: [],
				status: 500,
				telemetryMessage: false,
			});
			error.code = 1000;
			Object.defineProperty(error, property, {
				get: () => {
					throw new Error("accessor failure");
				},
			});

			expect(sanitizeError(error)).toEqual({ errorType: "Error" });
		}
	);

	it("captures deploy API errors without their notes", () => {
		const error = new WorkersUtilsAPIError({
			text: "sensitive",
			status: 403,
			notes: [{ text: "sensitive account data" }],
			telemetryMessage: false,
		});
		error.code = 10000;
		const result = sanitizeError(error);
		expect(result).toEqual({
			errorType: "APIError",
			httpStatus: 403,
			errorCodes: [10000],
		});
		expect(JSON.stringify(result)).not.toContain("account");
	});

	it("ignores malformed API error entries and non-finite codes", () => {
		const error = new CloudflareApiError({
			message: "sensitive",
			statusCode: 400,
			body: {
				errors: [null, "secret", { code: Number.NaN }, { code: 1003 }],
			},
		});

		expect(sanitizeError(error)).toEqual({
			errorType: "APIError",
			httpStatus: 400,
			errorCodes: [1003],
		});
	});

	it.each([
		{ statusCode: "secret" },
		{ statusCode: Number.NaN },
		{ statusCode: 99 },
		{ statusCode: 600 },
	])("omits invalid SDK HTTP status $statusCode", ({ statusCode }) => {
		const error = new CloudflareApiError({
			message: "sensitive",
			statusCode: statusCode as unknown as number,
			body: { errors: [] },
		});

		expect(sanitizeError(error)).toEqual({ errorType: "APIError" });
	});

	it("omits invalid deploy API status and code values", () => {
		const error = new WorkersUtilsAPIError({
			text: "sensitive",
			status: "secret-status" as unknown as number,
			notes: [],
			telemetryMessage: false,
		});
		error.code = Number.POSITIVE_INFINITY;

		expect(sanitizeError(error)).toEqual({ errorType: "APIError" });
	});
});
