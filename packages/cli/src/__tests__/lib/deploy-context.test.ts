import { http, HttpResponse } from "msw/http";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createDeployContext } from "../../lib/deploy-context.js";
import { USER_AGENT } from "../../version.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";

const resource = "/accounts/test-account/workers/durable_objects/namespaces";

describe("deploy context pagination", () => {
	setupMsw();

	beforeEach(() => {
		vi.stubEnv("CLOUDFLARE_API_BASE_URL", TEST_BASE_URL);
	});

	it("finds namespaces beyond the first 1000 without mutating query parameters", async () => {
		const namespaces = Array.from({ length: 1001 }, (_, index) => ({
			id: `namespace-${index}`,
			class: index === 1000 ? "Sandbox" : "Other",
			preview: { id: "preview-id" },
		}));
		const pages: number[] = [];
		server.use(
			http.get(`${TEST_BASE_URL}${resource}`, ({ request }) => {
				const query = new URL(request.url).searchParams;
				const page = Number(query.get("page") ?? "1");
				pages.push(page);
				expect(query.get("per_page")).toBe("1000");
				expect(request.headers.get("Authorization")).toBe("Bearer test-token");
				expect(request.headers.get("User-Agent")).toBe(USER_AGENT);
				expect(request.headers.get("X-Test-Header")).toBe("preserved");
				const result = namespaces.slice((page - 1) * 1000, page * 1000);
				return HttpResponse.json({
					success: true,
					result,
					result_info: {
						page,
						per_page: 1000,
						count: result.length,
						total_count: namespaces.length,
					},
				});
			})
		);
		const query = new URLSearchParams({ per_page: "1000" });
		const result = await createDeployContext("test-token").fetchPagedListResult<
			(typeof namespaces)[number]
		>({}, resource, { headers: { "X-Test-Header": "preserved" } }, query);

		expect(result).toEqual(namespaces);
		expect(result.find((namespace) => namespace.class === "Sandbox")?.id).toBe(
			"namespace-1000"
		);
		expect(pages).toEqual([1, 2]);
		expect(query.toString()).toBe("per_page=1000");
	});

	it.each([undefined, { page: 1, per_page: 1, count: 1, total_count: 1 }])(
		"stops after one page with result_info %j",
		async (resultInfo) => {
			let requests = 0;
			server.use(
				http.get(`${TEST_BASE_URL}${resource}`, () => {
					requests++;
					return HttpResponse.json({
						success: true,
						result: [{ id: "namespace-1" }],
						result_info: resultInfo,
					});
				})
			);

			await expect(
				createDeployContext("test-token").fetchPagedListResult({}, resource)
			).resolves.toEqual([{ id: "namespace-1" }]);
			expect(requests).toBe(1);
		}
	);

	it("propagates errors from later pages with status and retry metadata", async () => {
		const pages: number[] = [];
		server.use(
			http.get(`${TEST_BASE_URL}${resource}`, ({ request }) => {
				const page = Number(
					new URL(request.url).searchParams.get("page") ?? "1"
				);
				pages.push(page);
				if (page === 2) {
					return HttpResponse.json(
						{
							success: false,
							errors: [{ code: 10000, message: "Rate limited" }],
						},
						{ status: 429, headers: { "Retry-After": "12" } }
					);
				}
				return HttpResponse.json({
					success: true,
					result: [{ id: "namespace-1" }],
					result_info: { page, per_page: 1, count: 1, total_count: 3 },
				});
			})
		);

		await expect(
			createDeployContext("test-token").fetchPagedListResult({}, resource)
		).rejects.toMatchObject({ status: 429, code: 10000, retryAfterMs: 12000 });
		expect(pages).toEqual([1, 2]);
	});

	it("continues to use cursors for fetchListResult", async () => {
		const cursor = "next+/page=token&value%";
		const cursors: (string | null)[] = [];
		server.use(
			http.get(`${TEST_BASE_URL}${resource}`, ({ request }) => {
				const query = new URL(request.url).searchParams;
				const received = query.get("cursor");
				cursors.push(received);
				expect(query.has("page")).toBe(false);
				return HttpResponse.json({
					success: true,
					result: [{ id: received === null ? "namespace-1" : "namespace-2" }],
					result_info: { cursor: received === null ? cursor : null },
				});
			})
		);

		await expect(
			createDeployContext("test-token").fetchListResult({}, resource)
		).resolves.toEqual([{ id: "namespace-1" }, { id: "namespace-2" }]);
		expect(cursors).toEqual([null, cursor]);
	});
});
