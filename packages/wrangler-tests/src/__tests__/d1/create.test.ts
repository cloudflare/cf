import { http, HttpResponse } from "msw";
import { describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { useMockIsTTY } from "../helpers/mock-istty";
import { msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

describe("create", () => {
	mockAccountId();
	mockApiToken();
	mockConsoleMethods();
	runInTempDir();
	const std = mockConsoleMethods();
	const { setIsTTY } = useMockIsTTY();

	it("should throw if local flag is provided", async ({ expect }) => {
		// cf accepts the global `--local` flag, starts Miniflare itself,
		// and reports that this control-plane operation has no explorer
		// equivalent. The canonical title retains Wrangler's former
		// `--local-endpoint` wording.
		await expect(runWrangler("d1 create --name test --local")).rejects.toThrow(
			/no local equivalent.*re-run without --local/i
		);
	});
	it("should throw if remote flag is provided", async ({ expect }) => {
		await expect(runWrangler("d1 create --name test --remote")).rejects.toThrow(
			/Unknown argument/i
		);
	});

	it("should throw if location flag isn't in the list", async ({ expect }) => {
		setIsTTY(false);
		await expect(
			runWrangler("d1 create --name test --primary-location-hint sydney")
		).rejects.toThrowErrorMatchingInlineSnapshot(`
			[Error: Invalid values:
			  Argument: primary-location-hint, Given: "sydney", Choices: "wnam", "enam", "weur", "eeur", "apac", "oc"]
		`);
	});

	it("should try send a request to the API for a valid input", async ({
		expect,
	}) => {
		setIsTTY(false);
		msw.use(
			http.post("*/accounts/:accountId/d1/database", async () => {
				return HttpResponse.json({
					result: {
						uuid: "51e7c314-456e-4167-b6c3-869ad188fc23",
						name: "test",
						primary_location_hint: "OC",
						created_in_region: "OC",
					},
					success: true,
					errors: [],
					messages: [],
				});
			})
		);
		await runWrangler("d1 create --name test --primary-location-hint oc");
		expect(std.out).toMatchInlineSnapshot(`
			"{
			  "uuid": "51e7c314-456e-4167-b6c3-869ad188fc23",
			  "name": "test",
			  "primary_location_hint": "OC",
			  "created_in_region": "OC"
			}"
		`);
	});

	it("should fail if the jurisdiction provided is not supported", async ({
		expect,
	}) => {
		await expect(
			runWrangler("d1 create --name test --jurisdiction something")
		).rejects.toThrow(
			/Argument: jurisdiction, Given: "something", Choices: "eu", "fedramp", "us"/
		);
	});

	it("should try send jurisdiction to the API if it is a valid input", async ({
		expect,
	}) => {
		setIsTTY(false);
		msw.use(
			http.post("*/accounts/:accountId/d1/database", async () => {
				return HttpResponse.json({
					result: {
						uuid: "51e7c314-456e-4167-b6c3-869ad188fc23",
						name: "test",
						created_in_region: "WEUR",
						jurisdiction: "eu",
					},
					success: true,
					errors: [],
					messages: [],
				});
			})
		);
		await runWrangler("d1 create --name test --jurisdiction eu");
		expect(std.out).toMatchInlineSnapshot(`
			"{
			  "uuid": "51e7c314-456e-4167-b6c3-869ad188fc23",
			  "name": "test",
			  "created_in_region": "WEUR",
			  "jurisdiction": "eu"
			}"
		`);
	});

	it("should error when database limit is reached", async ({ expect }) => {
		setIsTTY(false);
		msw.use(
			http.post("*/accounts/:accountId/d1/database", async () => {
				return HttpResponse.json(
					{
						result: null,
						success: false,
						errors: [
							{
								code: 7406,
								message: "System limit reached: databases per account (10)",
							},
						],
						messages: [],
					},
					{ status: 400 }
				);
			})
		);

		await expect(runWrangler("d1 create --name test")).rejects.toThrow(
			/System limit reached: databases per account/
		);
	});
});
