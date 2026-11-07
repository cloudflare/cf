import { VERSION } from "../../version.js";
import { fixturePath, jsonFixturePath } from "./cases.js";

export interface RecordedRequest {
	method: string;
	url: string;
	headers: Record<string, string>;
	body: unknown;
}

export function normalize(value: string, cwd?: string): string {
	let result = value
		.replaceAll(fixturePath, "<payload.txt>")
		.replaceAll(jsonFixturePath, "<body.json>")
		.replaceAll(VERSION, "<version>");
	if (cwd) {
		result = result.replaceAll(cwd, "<workspace>");
		result = result.replace(/<workspace>\\[^\s"']+/g, (path) =>
			path.replaceAll("\\", "/")
		);
	}
	return result;
}

function normalizeBody(value: unknown): unknown {
	if (typeof value === "string") {
		return normalize(value, process.cwd());
	}
	if (Array.isArray(value)) {
		return value.map(normalizeBody);
	}
	if (value !== null && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value).map(([key, part]) => [key, normalizeBody(part)])
		);
	}
	return value;
}

// SDK runtime headers vary by Node version and add noise to every request.
const ignoredHeaders = new Set([
	"x-fern-language",
	"x-fern-runtime",
	"x-fern-runtime-version",
]);

export async function recordRequest(
	request: Request
): Promise<RecordedRequest> {
	const contentType = request.headers.get("content-type") ?? "";
	const headers = Object.fromEntries(
		[...request.headers]
			.filter(([key]) => !ignoredHeaders.has(key))
			.map(([key, value]) => [
				key,
				key === "content-length" && contentType.includes("multipart/form-data")
					? "<multipart-length>"
					: normalize(
							key === "content-type"
								? value.replace(/boundary=.*/, "boundary=<boundary>")
								: value
						),
			])
	);
	let body: unknown = null;
	if (contentType.includes("multipart/form-data")) {
		const form = await request.clone().formData();
		body = await Promise.all(
			[...form].map(async ([name, part]) => [
				name,
				typeof part === "string"
					? part
					: {
							filename: part.name,
							contentType: part.type,
							base64: Buffer.from(await part.arrayBuffer()).toString("base64"),
						},
			])
		);
	} else {
		const bytes = Buffer.from(await request.clone().arrayBuffer());
		if (bytes.length) {
			if (contentType.includes("json")) {
				try {
					body = JSON.parse(bytes.toString("utf8")) as unknown;
				} catch {
					body = { invalidJson: bytes.toString("utf8") };
				}
			} else {
				body = { base64: bytes.toString("base64") };
			}
		}
	}
	return {
		method: request.method,
		url: request.url,
		headers,
		body: normalizeBody(body),
	};
}
