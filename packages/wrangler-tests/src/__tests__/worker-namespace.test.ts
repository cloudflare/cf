import { http, HttpResponse } from "msw";
// eslint-disable-next-line no-restricted-imports
import { beforeEach, describe, expect, it } from "vitest";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import {
	createFetchResult,
	msw,
	mswSuccessNamespacesHandlers,
} from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";

describe("dispatch-namespaces", () => {
	const std = mockConsoleMethods();
	beforeEach(() => msw.use(...mswSuccessNamespacesHandlers));

	runInTempDir();
	mockAccountId();
	mockApiToken();

	it("should display a list of available subcommands, for dispatch-namespace with no subcommand", async () => {
		await runWrangler("workers-for-platforms dispatch-namespaces --help");
		expect(std.out).toContain("workers-for-platforms dispatch-namespaces");
		expect(std.out).toContain("create");
		expect(std.out).toContain("delete");
		expect(std.out).toContain("get");
		expect(std.out).toContain("list");
		expect(std.out).toContain("edit");
	});

	describe("create namespace", () => {
		const namespaceName = "my-namespace";

		it("should display help for create", async () => {
			await runWrangler(
				"workers-for-platforms dispatch-namespaces create --help"
			);
			expect(std.out).toContain(
				"workers-for-platforms dispatch-namespaces create"
			);
			expect(std.out).toContain("--name");
		});

		it("should attempt to create the given namespace", async () => {
			let counter = 0;
			msw.use(
				http.post(
					"*/accounts/:accountId/workers/dispatch/namespaces",
					async ({ request }) => {
						counter++;
						expect(counter).toBe(1);
						const body = (await request.json()) as { name?: string };
						expect(body.name).toBe(namespaceName);
						return HttpResponse.json(
							createFetchResult({
								namespace_id: "some-namespace-id",
								namespace_name: "namespace-name",
								created_on: "2022-06-29T14:30:08.16152Z",
								created_by: "1fc1df98cc4420fe00367c3ab68c1639",
								modified_on: "2022-06-29T14:30:08.16152Z",
								modified_by: "1fc1df98cc4420fe00367c3ab68c1639",
							})
						);
					},
					{ once: true }
				)
			);

			await runWrangler(
				`workers-for-platforms dispatch-namespaces create --name ${namespaceName}`
			);

			expect(std.out).toMatchInlineSnapshot(`
				"{
				  "namespace_id": "some-namespace-id",
				  "namespace_name": "namespace-name",
				  "created_on": "2022-06-29T14:30:08.16152Z",
				  "created_by": "1fc1df98cc4420fe00367c3ab68c1639",
				  "modified_on": "2022-06-29T14:30:08.16152Z",
				  "modified_by": "1fc1df98cc4420fe00367c3ab68c1639"
				}"
			`);
		});
	});

	describe("delete namespace", () => {
		const namespaceName = "my-namespace";

		it("should display help for delete", async () => {
			await runWrangler(
				"workers-for-platforms dispatch-namespaces delete --help"
			);
			expect(std.out).toContain(
				"workers-for-platforms dispatch-namespaces delete"
			);
			expect(std.out).toContain("name");
		});

		it("should try to delete the given namespace", async () => {
			let counter = 0;
			msw.use(
				http.delete(
					"*/accounts/:accountId/workers/dispatch/namespaces/:namespaceNameParam",
					({ params }) => {
						counter++;
						const { namespaceNameParam } = params;
						expect(counter).toBe(1);
						expect(namespaceNameParam).toBe(namespaceName);
						return HttpResponse.json(createFetchResult(null));
					},
					{ once: true }
				)
			);

			await runWrangler(
				`workers-for-platforms dispatch-namespaces delete ${namespaceName} --force`
			);

			expect(std.out).toMatchInlineSnapshot(`""`);
		});
	});

	describe("get namespace", () => {
		const namespaceName = "my-namespace";

		it("should display help for get", async () => {
			await runWrangler("workers-for-platforms dispatch-namespaces get --help");
			expect(std.out).toContain(
				"workers-for-platforms dispatch-namespaces get"
			);
			expect(std.out).toContain("name");
		});

		it("should attempt to get info for the given namespace", async () => {
			let counter = 0;
			msw.use(
				http.get(
					"*/accounts/:accountId/workers/dispatch/namespaces/:namespaceNameParam",
					({ params }) => {
						counter++;
						const { namespaceNameParam } = params;
						expect(counter).toBe(1);
						expect(namespaceNameParam).toBe(namespaceName);
						return HttpResponse.json(
							createFetchResult({
								namespace_id: "some-namespace-id",
								namespace_name: "namespace-name",
								created_on: "2022-06-29T14:30:08.16152Z",
								created_by: "1fc1df98cc4420fe00367c3ab68c1639",
								modified_on: "2022-06-29T14:30:08.16152Z",
								modified_by: "1fc1df98cc4420fe00367c3ab68c1639",
							})
						);
					},
					{ once: true }
				)
			);

			await runWrangler(
				`workers-for-platforms dispatch-namespaces get ${namespaceName}`
			);

			expect(std.out).toMatchInlineSnapshot(`
				"{
				  "namespace_id": "some-namespace-id",
				  "namespace_name": "namespace-name",
				  "created_on": "2022-06-29T14:30:08.16152Z",
				  "created_by": "1fc1df98cc4420fe00367c3ab68c1639",
				  "modified_on": "2022-06-29T14:30:08.16152Z",
				  "modified_by": "1fc1df98cc4420fe00367c3ab68c1639"
				}"
			`);
		});
	});

	describe("list namespaces", () => {
		it("should list all namespaces", async () => {
			await runWrangler("workers-for-platforms dispatch-namespaces list");
			expect(std.out).toMatchInlineSnapshot(`
				"[
				  {
				    "namespace_id": "some-namespace-id",
				    "namespace_name": "namespace-name",
				    "created_on": "2022-06-29T14:30:08.16152Z",
				    "created_by": "1fc1df98cc4420fe00367c3ab68c1639",
				    "modified_on": "2022-06-29T14:30:08.16152Z",
				    "modified_by": "1fc1df98cc4420fe00367c3ab68c1639"
				  }
				]"
			`);
		});
	});

	describe("rename namespace", () => {
		const namespaceName = "my-namespace";

		it("should display help for rename", async () => {
			await runWrangler(
				"workers-for-platforms dispatch-namespaces edit --help"
			);
			expect(std.out).toContain(
				"workers-for-platforms dispatch-namespaces edit"
			);
			expect(std.out).toContain("--name");
		});

		it("should attempt to rename the given namespace", async () => {
			const newName = "new-namespace";
			let counter = 0;
			msw.use(
				http.patch(
					"*/accounts/:accountId/workers/dispatch/namespaces/:namespaceNameParam",
					async ({ request, params }) => {
						counter++;
						const { namespaceNameParam } = params;
						expect(counter).toBe(1);
						expect(namespaceNameParam).toBe(namespaceName);
						const body = (await request.json()) as { name?: string };
						expect(body.name).toBe(newName);
						return HttpResponse.json(
							createFetchResult({
								namespace_id: "some-namespace-id",
								namespace_name: newName,
								created_on: "2022-06-29T14:30:08.16152Z",
								created_by: "1fc1df98cc4420fe00367c3ab68c1639",
								modified_on: "2022-06-29T14:30:08.16152Z",
								modified_by: "1fc1df98cc4420fe00367c3ab68c1639",
							})
						);
					},
					{ once: true }
				)
			);

			await runWrangler(
				`workers-for-platforms dispatch-namespaces edit ${namespaceName} --name ${newName}`
			);

			expect(std.out).toMatchInlineSnapshot(`
				"{
				  "namespace_id": "some-namespace-id",
				  "namespace_name": "new-namespace",
				  "created_on": "2022-06-29T14:30:08.16152Z",
				  "created_by": "1fc1df98cc4420fe00367c3ab68c1639",
				  "modified_on": "2022-06-29T14:30:08.16152Z",
				  "modified_by": "1fc1df98cc4420fe00367c3ab68c1639"
				}"
			`);
		});
	});
});
