import { APIError as WorkersUtilsAPIError } from "@cloudflare/workers-utils";
import type { SanitizedError } from "./types.js";
import { CloudflareApiError } from "#sdk/errors";

function extractErrorCodes(body: unknown): number[] {
	if (body === null || typeof body !== "object") {
		return [];
	}
	const errors = (body as { errors?: unknown }).errors;
	if (!Array.isArray(errors)) {
		return [];
	}
	return errors.flatMap((error) => {
		if (error === null || typeof error !== "object") {
			return [];
		}
		const code = (error as Record<string, unknown>).code;
		return typeof code === "number" && Number.isFinite(code) ? [code] : [];
	});
}

function isHttpStatus(value: unknown): value is number {
	return (
		typeof value === "number" &&
		Number.isInteger(value) &&
		value >= 100 &&
		value <= 599
	);
}

export function sanitizeError(error: unknown): SanitizedError {
	try {
		return sanitizeErrorUnsafe(error);
	} catch {
		return { errorType: "Error" };
	}
}

function sanitizeErrorUnsafe(error: unknown): SanitizedError {
	if (error instanceof CloudflareApiError) {
		const errorCodes = extractErrorCodes(error.body);
		return {
			errorType: "APIError",
			...(isHttpStatus(error.statusCode)
				? { httpStatus: error.statusCode }
				: {}),
			...(errorCodes.length === 0 ? {} : { errorCodes }),
		};
	}

	if (error instanceof WorkersUtilsAPIError) {
		return {
			errorType: "APIError",
			...(isHttpStatus(error.status) ? { httpStatus: error.status } : {}),
			...(typeof error.code === "number" && Number.isFinite(error.code)
				? { errorCodes: [error.code] }
				: {}),
		};
	}

	if (error instanceof Error) {
		return { errorType: "Error" };
	}
	return { errorType: typeof error };
}
