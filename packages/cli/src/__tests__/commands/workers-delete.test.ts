import * as clack from "@clack/prompts";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { isNonInteractiveOrCI } from "../../lib/interactive.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

vi.mock("@clack/prompts", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	confirm: vi.fn(),
}));

vi.mock("../../lib/interactive.js", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	isNonInteractiveOrCI: vi.fn(),
}));

const env = {
	CLOUDFLARE_API_TOKEN: "test-token",
	CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
	CLOUDFLARE_ACCOUNT_ID: "test-account",
	DO_NOT_TRACK: "1",
	NO_COLOR: "1",
};
const account = `${TEST_BASE_URL}/accounts/test-account`;
const workers = `${account}/workers/workers`;
const namespaces = `${account}/workers/durable_objects/namespaces`;
const applications = `${account}/containers/applications`;
const ownedApplication = {
	id: "owned-app",
	name: "container-for-example",
	durable_objects: { namespace_id: "production-namespace" },
};

function success(result: unknown, resultInfo?: Record<string, unknown>) {
	return HttpResponse.json({ success: true, result, result_info: resultInfo });
}

function denied() {
	return HttpResponse.json(
		{ success: false, errors: [{ code: 10000, message: "Permission denied" }] },
		{ status: 403 }
	);
}

function mockOwnedApplication() {
	server.use(
		http.get(`${workers}/example`, () =>
			success({ id: "worker-id", name: "example" })
		),
		http.get(namespaces, () =>
			success([{ id: "production-namespace", script: "example" }])
		),
		http.get(applications, () => success([ownedApplication]))
	);
}

describe("cf workers delete Container cleanup", () => {
	runInTempDir();
	setupMsw();
	let stderr: string;
	let stdout: string;

	beforeEach(() => {
		stderr = "";
		stdout = "";
		vi.mocked(isNonInteractiveOrCI).mockReturnValue(true);
		vi.mocked(clack.confirm).mockReset();
		vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
			stderr += String(chunk);
			return true;
		});
		vi.spyOn(console, "log").mockImplementation((chunk) => {
			stdout += String(chunk);
		});
	});

	afterEach(() => vi.restoreAllMocks());

	it("warns about remaining apps under --force --quiet without deleting them", async () => {
		mockOwnedApplication();
		const deleteWorker = vi.fn(() => success(null));
		const deleteApp = vi.fn(() => success(null));
		server.use(
			http.delete(`${workers}/worker-id`, deleteWorker),
			http.delete(`${applications}/:id`, deleteApp)
		);

		expect(
			await runCf(["workers", "delete", "example", "--force", "--quiet"], env)
		).toEqual({ exitCode: 0 });
		expect(deleteWorker).toHaveBeenCalledOnce();
		expect(deleteApp).not.toHaveBeenCalled();
		expect(clack.confirm).not.toHaveBeenCalled();
		expect(stderr).toContain("container-for-example (owned-app)");
		expect(stderr).toContain("may continue running and billing");
		expect(stderr).toContain("cf containers applications delete owned-app");
		expect(stdout).toBe("");
	});

	it("checks both paginated inventories and deletes only apps owned by the canonical Worker", async () => {
		const requests: string[] = [];
		server.use(
			http.get(`${workers}/worker-id`, () => {
				requests.push("get Worker");
				return success({ id: "worker-id", name: "example" });
			}),
			http.get(namespaces, ({ request }) => {
				const page = new URL(request.url).searchParams.get("page");
				requests.push(`namespaces ${page}`);
				return page === "1"
					? success(
							[
								{
									id: "preview-namespace",
									script: "example",
									preview: "preview",
								},
								{
									id: "dispatch-namespace",
									script: "example",
									dispatch_namespace: "platform",
								},
								{ id: "another-namespace", script: "example-staging" },
							],
							{ total_pages: 2 }
						)
					: success([{ id: "production-namespace", script: "example" }], {
							total_pages: 2,
						});
			}),
			http.get(applications, ({ request }) => {
				const token = new URL(request.url).searchParams.get("page_token");
				requests.push(`applications ${token ?? "first"}`);
				return token === "next"
					? success([ownedApplication])
					: success(
							[
								{ id: "standalone-app", name: "example-standalone" },
								...["preview", "dispatch", "another"].map((prefix) => ({
									id: `${prefix}-app`,
									name: `example-${prefix}`,
									durable_objects: { namespace_id: `${prefix}-namespace` },
								})),
							],
							{ next_page_token: "next" }
						);
			}),
			http.delete(`${workers}/worker-id`, ({ request }) => {
				requests.push(
					`delete Worker force=${new URL(request.url).searchParams.get("force")}`
				);
				return success(null);
			}),
			http.delete<{ id: string }>(`${applications}/:id`, ({ params }) => {
				requests.push(`delete app ${params.id}`);
				return success(null);
			})
		);

		expect(
			await runCf(
				[
					"workers",
					"delete",
					"worker-id",
					"--force",
					"--delete-containers",
					"--delete-with-references",
				],
				env
			)
		).toEqual({ exitCode: 0 });
		expect(requests).toEqual([
			"get Worker",
			"namespaces 1",
			"namespaces 2",
			"applications first",
			"applications next",
			"delete Worker force=true",
			"delete app owned-app",
		]);
		expect(stderr).toContain("Instances may take a while to shut down");
	});

	it.each([true, false])(
		"honors the user's separate cleanup decision (%s)",
		async (cleanup) => {
			vi.mocked(isNonInteractiveOrCI).mockReturnValue(false);
			vi.mocked(clack.confirm)
				.mockResolvedValueOnce(true)
				.mockResolvedValueOnce(cleanup);
			mockOwnedApplication();
			const deleteWorker = vi.fn(() => success(null));
			const deleteApp = vi.fn(() => success(null));
			server.use(
				http.delete(`${workers}/worker-id`, deleteWorker),
				http.delete(`${applications}/owned-app`, deleteApp)
			);

			await runCf(["workers", "delete", "example"], env);
			expect(clack.confirm).toHaveBeenCalledTimes(2);
			expect(clack.confirm).toHaveBeenNthCalledWith(
				2,
				expect.objectContaining({
					message: expect.stringContaining("container-for-example (owned-app)"),
					initialValue: false,
				})
			);
			expect(deleteWorker).toHaveBeenCalledOnce();
			expect(deleteApp).toHaveBeenCalledTimes(cleanup ? 1 : 0);
		}
	);

	it("refuses non-interactive cleanup without --force", async () => {
		const getWorker = vi.fn(() =>
			success({ id: "worker-id", name: "example" })
		);
		server.use(http.get(`${workers}/example`, getWorker));

		expect(
			await runCf(
				["workers", "delete", "example", "--delete-containers", "--quiet"],
				env
			)
		).toEqual({ exitCode: 1 });
		expect(getWorker).not.toHaveBeenCalled();
		expect(stderr).toContain("pass --force to confirm");
	});

	it.each([true, false])(
		"handles discovery failure with cleanup requested: %s",
		async (cleanup) => {
			const deleteWorker = vi.fn(() => success(null));
			server.use(
				http.get(`${workers}/example`, () =>
					success({ id: "worker-id", name: "example" })
				),
				http.get(namespaces, denied),
				http.delete(`${workers}/:id`, deleteWorker)
			);
			const args = ["workers", "delete", "example", "--force"];

			if (cleanup) {
				await expect(
					runCf([...args, "--delete-containers"], env)
				).rejects.toThrow(
					"The Worker was not deleted. Could not check for Container applications"
				);
				expect(deleteWorker).not.toHaveBeenCalled();
			} else {
				expect(await runCf(args, env)).toEqual({ exitCode: 0 });
				expect(deleteWorker).toHaveBeenCalledOnce();
				expect(stderr).toContain("Could not check for Container applications");
				expect(stderr).toContain("may continue running and billing");
			}
		}
	);

	it("does not delete apps if the Worker deletion fails", async () => {
		mockOwnedApplication();
		const deleteApp = vi.fn(() => success(null));
		server.use(
			http.delete(`${workers}/worker-id`, denied),
			http.delete(`${applications}/owned-app`, deleteApp)
		);

		await expect(
			runCf(
				["workers", "delete", "example", "--force", "--delete-containers"],
				env
			)
		).rejects.toThrow("Permission denied");
		expect(deleteApp).not.toHaveBeenCalled();
	});

	it("reports failed app deletions and still tries the others", async () => {
		mockOwnedApplication();
		const deleteOtherApp = vi.fn(() => success(null));
		server.use(
			http.get(applications, () =>
				success([ownedApplication, { ...ownedApplication, id: "other-app" }])
			),
			http.delete(`${workers}/worker-id`, () => success(null)),
			http.delete(`${applications}/owned-app`, denied),
			http.delete(`${applications}/other-app`, deleteOtherApp)
		);

		await expect(
			runCf(
				["workers", "delete", "example", "--force", "--delete-containers"],
				env
			)
		).rejects.toThrow(
			"The Worker was deleted, but 1 of 2 Container application deletions failed"
		);
		expect(deleteOtherApp).toHaveBeenCalledOnce();
		expect(stderr).toContain(
			"Could not delete Container application container-for-example (owned-app)"
		);
		expect(stderr).toContain("cf containers applications delete owned-app");
	});

	it("reports opt-in cleanup in the offline preview", async () => {
		await runCf(
			["workers", "delete", "example/one", "--delete-containers", "--dry-run"],
			{
				...env,
				CLOUDFLARE_API_TOKEN: undefined,
			}
		);
		expect(JSON.parse(stdout)).toEqual({
			command: "cf workers delete",
			method: "DELETE",
			url: "https://api.cloudflare.com/client/v4/accounts/test-account/workers/workers/example%2Fone",
			pathParams: { worker: "example/one" },
			query: {},
			bodyKind: "none",
			deleteContainers: true,
		});
	});
});
