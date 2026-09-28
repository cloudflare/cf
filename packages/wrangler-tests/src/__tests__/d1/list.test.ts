import { http, HttpResponse } from "msw";
import { beforeEach, describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { useMockIsTTY } from "../helpers/mock-istty";
import { msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

describe("list", () => {
	mockAccountId();
	mockApiToken();
	mockConsoleMethods();
	runInTempDir();
	const std = mockConsoleMethods();
	const { setIsTTY } = useMockIsTTY();

	beforeEach(() => {
		setIsTTY(false);
		msw.use(
			http.get("*/accounts/:accountId/d1/database", async () => {
				return HttpResponse.json(
					{
						result: [
							{
								uuid: "1",
								name: "a",
								binding: "A",
							},
							{
								uuid: "2",
								name: "b",
								binding: "B",
							},
						],
						success: true,
						errors: [],
						messages: [],
					},
					{ status: 200 }
				);
			})
		);
	});
	it("should print valid json, without wrangler banner", async ({ expect }) => {
		await runWrangler("d1 list");
		expect(JSON.parse(std.out)).toMatchInlineSnapshot(`
			[
			  {
			    "binding": "A",
			    "name": "a",
			    "uuid": "1",
			  },
			  {
			    "binding": "B",
			    "name": "b",
			    "uuid": "2",
			  },
			]
		`);
	});

	// cf always emits JSON; there is no pretty-printed table mode.
	// The wrangler-style "pretty print by default + banner" path is
	// not applicable.
	it.skip("should pretty print by default, including the wrangler banner", async () => {});
});
