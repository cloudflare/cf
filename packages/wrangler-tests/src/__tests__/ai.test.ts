import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { clearDialogs } from "./helpers/mock-dialogs";
import { useMockIsTTY } from "./helpers/mock-istty";
import { createFetchResult, msw } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";

describe("ai help", () => {
	runInTempDir();

	// cf has its own help output (different commands, formatting, prose) —
	// these tests are tied to wrangler's specific help text.
	it.skip("should show help when no argument is passed", async () => {});

	it.skip("should show help when an invalid argument is passed", async () => {});
});

describe("ai commands", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const { setIsTTY } = useMockIsTTY();

	const std = mockConsoleMethods();

	beforeEach(() => {
		setIsTTY(true);
	});

	afterEach(() => {
		clearDialogs();
	});

	it("should handle finetune list", async ({ expect }) => {
		mockAIListFinetuneRequest();
		await runWrangler("ai finetunes list");
		expect(std.out).toMatchInlineSnapshot(`
			"[
			  {
			    "id": "4d73459a-0000-4688-0000-b19fbb0e0fa5",
			    "name": "instruct-demo1",
			    "description": ""
			  },
			  {
			    "id": "55fc22b4-0000-4420-0000-25263a283b6a",
			    "name": "instruct-demo2",
			    "description": ""
			  },
			  {
			    "id": "8901ff50-0000-408f-0000-8e9ea1d4eb39",
			    "name": "instruct-demo3",
			    "description": ""
			  },
			  {
			    "id": "a18b81d0-0000-4891-0000-6fb8c8268142",
			    "name": "instruct-demo4",
			    "description": ""
			  },
			  {
			    "id": "c4651c92-0000-49a4-0000-e26e57d108ca",
			    "name": "instruct-demo5",
			    "description": ""
			  },
			  {
			    "id": "f70cece8-0000-40e6-0000-81b97273d745",
			    "name": "instruct-demo6",
			    "description": ""
			  }
			]"
		`);
	});

	it("should handle model list", async ({ expect }) => {
		mockAISearchRequest();
		await runWrangler("ai models list");
		expect(std.out).toMatchInlineSnapshot(`
			"[
			  {
			    "id": "429b9e8b-d99e-44de-91ad-706cf8183658",
			    "source": 1,
			    "task": null,
			    "tags": [],
			    "name": "@cloudflare/embeddings_bge_large_en",
			    "description": null
			  },
			  {
			    "id": "7f9a76e1-d120-48dd-a565-101d328bbb02",
			    "source": 1,
			    "task": {
			      "id": "00cd182b-bf30-4fc4-8481-84a3ab349657",
			      "name": "Image Classification",
			      "description": null
			    },
			    "tags": [],
			    "name": "@cloudflare/resnet50",
			    "description": null
			  }
			]"
		`);
	});

	// cf prints JSON, not a truncated table — there is no description
	// truncation step for cf to test.
	it.skip("should truncate model description", async () => {});

	// cf does not auto-paginate `list` commands. Tracked in
	// `test_bugs/list-no-pagination.md`.
	it.todo("should paginate results");
});

/** Create a mock handler for AI API */
function mockAIListFinetuneRequest() {
	msw.use(
		http.get(
			"*/accounts/:accountId/ai/finetunes",
			() => {
				return HttpResponse.json(
					createFetchResult(
						[
							{
								id: "4d73459a-0000-4688-0000-b19fbb0e0fa5",
								name: "instruct-demo1",
								description: "",
							},
							{
								id: "55fc22b4-0000-4420-0000-25263a283b6a",
								name: "instruct-demo2",
								description: "",
							},
							{
								id: "8901ff50-0000-408f-0000-8e9ea1d4eb39",
								name: "instruct-demo3",
								description: "",
							},
							{
								id: "a18b81d0-0000-4891-0000-6fb8c8268142",
								name: "instruct-demo4",
								description: "",
							},
							{
								id: "c4651c92-0000-49a4-0000-e26e57d108ca",
								name: "instruct-demo5",
								description: "",
							},
							{
								id: "f70cece8-0000-40e6-0000-81b97273d745",
								name: "instruct-demo6",
								description: "",
							},
						],
						true
					)
				);
			},
			{ once: true }
		)
	);
}

function mockAISearchRequest() {
	msw.use(
		http.get(
			"*/accounts/:accountId/ai/models/search",
			() => {
				return HttpResponse.json(
					createFetchResult(
						[
							{
								id: "429b9e8b-d99e-44de-91ad-706cf8183658",
								source: 1,
								task: null,
								tags: [],
								name: "@cloudflare/embeddings_bge_large_en",
								description: null,
							},
							{
								id: "7f9a76e1-d120-48dd-a565-101d328bbb02",
								source: 1,
								task: {
									id: "00cd182b-bf30-4fc4-8481-84a3ab349657",
									name: "Image Classification",
									description: null,
								},
								tags: [],
								name: "@cloudflare/resnet50",
								description: null,
							},
						],
						true
					)
				);
			},
			{ once: true }
		)
	);
}
