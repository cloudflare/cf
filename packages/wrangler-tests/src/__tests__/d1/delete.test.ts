import { http, HttpResponse } from "msw";
import { describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { mockConfirm } from "../helpers/mock-dialogs";
import { useMockIsTTY } from "../helpers/mock-istty";
import { createFetchResult, msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";
import type { ExpectStatic } from "vitest";

describe("delete", () => {
	mockAccountId();
	mockApiToken();
	const std = mockConsoleMethods();
	runInTempDir();
	const { setIsTTY } = useMockIsTTY();

	it("should not delete database when confirmation is rejected", async ({
		expect,
	}) => {
		setIsTTY(true);

		mockConfirm({
			text: "This permanently deletes the D1 database and all of its data. Continue?",
			result: false,
		});

		const requests = mockDatabaseDelete(expect, "db-uuid-123");

		// cf's `d1 delete` takes a positional <databaseId>; wrangler
		// resolves a name→id via the list endpoint, cf does not.
		await runWrangler("d1 delete db-uuid-123");

		expect(requests.count).toEqual(0);
		expect(std.out).toMatchInlineSnapshot(`""`);
		expect(std.err).toMatchInlineSnapshot(`""`);
	});

	it("should delete database when confirmation is accepted", async ({
		expect,
	}) => {
		setIsTTY(true);

		mockConfirm({
			text: "This permanently deletes the D1 database and all of its data. Continue?",
			result: true,
		});

		const requests = mockDatabaseDelete(expect, "db-uuid-123");

		await runWrangler("d1 delete db-uuid-123");

		expect(requests.count).toEqual(1);
		expect(std.out).toMatchInlineSnapshot(`"{}"`);
		expect(std.err).toMatchInlineSnapshot(`""`);
	});

	it("should skip confirmation when --skip-confirmation flag is used", async ({
		expect,
	}) => {
		setIsTTY(false);

		const requests = mockDatabaseDelete(expect, "db-uuid-123");

		await runWrangler("d1 delete db-uuid-123 --force");

		expect(requests.count).toEqual(1);
		expect(std.out).toMatchInlineSnapshot(`"{}"`);
		expect(std.err).toMatchInlineSnapshot(`""`);
	});

	it("should skip confirmation when --skip-confirmation flag is used", async ({
		expect,
	}) => {
		setIsTTY(false);

		const requests = mockDatabaseDelete(expect, "db-uuid-123");

		// cf calls the equivalent explicit confirmation bypass --force.
		await runWrangler("d1 delete db-uuid-123 --force");

		expect(requests.count).toEqual(1);
	});
});

function mockDatabaseDelete(expect: ExpectStatic, expectedUuid: string) {
	const requests = { count: 0 };
	msw.use(
		http.delete(
			"*/accounts/:accountId/d1/database/:databaseId",
			async ({ params }) => {
				requests.count++;
				expect(params.databaseId).toBe(expectedUuid);
				return HttpResponse.json(createFetchResult({}));
			}
		)
	);
	return requests;
}
