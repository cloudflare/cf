import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { clearDialogs, mockConfirm } from "./helpers/mock-dialogs";
import { useMockIsTTY } from "./helpers/mock-istty";
import { createFetchResult, msw } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";

interface Widget {
	sitekey: string;
	secret: string;
	name: string;
	domains: string[];
	mode: string;
	bot_fight_mode: boolean;
	clearance_level: string;
	ephemeral_id: boolean;
	offlabel: boolean;
	region: string;
	created_on: string;
	modified_on: string;
}

const widgetFixture: Widget = {
	sitekey: "0x4AAAAAAAFakeSitekey1",
	secret: "0x4AAAAAAAFakeSecret1",
	name: "Example",
	domains: ["example.com"],
	mode: "managed",
	bot_fight_mode: false,
	clearance_level: "no_clearance",
	ephemeral_id: false,
	offlabel: false,
	region: "world",
	created_on: "2026-06-29T12:00:00.000Z",
	modified_on: "2026-06-29T12:00:00.000Z",
};

describe("turnstile help", () => {
	const std = mockConsoleMethods();
	runInTempDir();

	it("shows top-level help with widget sub-namespace", async ({ expect }) => {
		await runWrangler("turnstile");
		expect(std.out).toContain("cf turnstile widgets");
	});

	it("shows widget sub-namespace help with all CRUD commands", async ({
		expect,
	}) => {
		await runWrangler("turnstile widgets");
		for (const command of ["create", "delete", "get", "list", "update"]) {
			expect(std.out).toContain(`cf turnstile widgets ${command}`);
		}
	});
});

describe("turnstile widget commands", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const std = mockConsoleMethods();
	const { setIsTTY } = useMockIsTTY();

	beforeEach(() => {
		setIsTTY(false);
	});

	afterEach(() => {
		clearDialogs();
	});

	it("creates a widget with a raw body while API mode is reserved", async ({
		expect,
	}) => {
		const request = mockWidgetCreate();
		const body = {
			name: "Example",
			domains: ["example.com", "www.example.com"],
			mode: "managed",
		};
		await runWrangler(
			`turnstile widgets create --body '${JSON.stringify(body)}'`
		);
		await expect(request).resolves.toMatchObject(body);
		expect(JSON.parse(std.out)).toMatchObject({
			sitekey: widgetFixture.sitekey,
			secret: widgetFixture.secret,
		});
	});

	it("creates a widget with optional fields", async ({ expect }) => {
		const request = mockWidgetCreate();
		const body = {
			name: "Example",
			domains: ["example.com"],
			mode: "invisible",
			bot_fight_mode: true,
			clearance_level: "interactive",
			region: "world",
		};
		await runWrangler(
			`turnstile widgets create --body '${JSON.stringify(body)}'`
		);
		await expect(request).resolves.toMatchObject(body);
	});

	it.skip("prints widget JSON only when --json is set");

	it("errors when --domain is missing", async ({ expect }) => {
		await expect(
			runWrangler("turnstile widgets create --name Example")
		).rejects.toThrow("--domains is required");
	});

	it("does not send the global mode as the widget mode", async ({ expect }) => {
		const request = mockWidgetCreate();

		await runWrangler(
			"turnstile widgets create --name Example --domains example.com --mode staging"
		);

		await expect(request).resolves.not.toHaveProperty("mode");
	});

	it.todo("splits comma-separated values in --domain");

	// cf intentionally emits raw JSON for generated API commands rather than
	// Wrangler's product-specific tables, counts, and friendly empty messages.
	it.skip("lists widgets as a table with count");
	it.skip("pluralizes count when multiple widgets are present");
	it.skip("lists widgets as JSON when --json is set");
	it.skip("reports an empty list with a friendly message");
	it.skip("paginates through multiple pages of widgets");
	it.skip("gets a single widget in the default human-readable view");
	it.skip("gets a single widget as JSON when --json is set");

	it.todo("errors when update is called with no fields");
	it.todo("updates a widget by merging changes with the current state");

	it("deletes a widget after confirmation", async ({ expect }) => {
		setIsTTY(true);
		mockConfirm({
			text: "This permanently deletes the resource. Continue?",
			result: true,
		});
		const requests = mockWidgetDelete(widgetFixture.sitekey);
		await runWrangler(`turnstile widgets delete ${widgetFixture.sitekey}`);
		expect(requests.count).toBe(1);
	});

	it("cancels delete if confirmation is declined", async ({ expect }) => {
		setIsTTY(true);
		mockConfirm({
			text: "This permanently deletes the resource. Continue?",
			result: false,
		});
		const requests = mockWidgetDelete(widgetFixture.sitekey);
		await runWrangler(`turnstile widgets delete ${widgetFixture.sitekey}`);
		expect(requests.count).toBe(0);
	});

	it("skips confirmation with --skip-confirmation", async ({ expect }) => {
		const requests = mockWidgetDelete(widgetFixture.sitekey);
		await runWrangler(
			`turnstile widgets delete ${widgetFixture.sitekey} --force`
		);
		expect(requests.count).toBe(1);
	});

	it("skips confirmation with -y alias", async ({ expect }) => {
		const requests = mockWidgetDelete(widgetFixture.sitekey);
		await runWrangler(`turnstile widgets delete ${widgetFixture.sitekey} -f`);
		expect(requests.count).toBe(1);
	});

	it.skip("outputs JSON when --json is set with --skip-confirmation");
	it.skip("errors when --json is set without --skip-confirmation");
});

function mockWidgetCreate(): Promise<Record<string, unknown>> {
	return new Promise((resolve) => {
		msw.use(
			http.post(
				"*/accounts/:accountId/challenges/widgets",
				async ({ request }) => {
					const body = (await request.json()) as Record<string, unknown>;
					resolve(body);
					return HttpResponse.json(
						createFetchResult({ ...widgetFixture, ...body }, true)
					);
				},
				{ once: true }
			)
		);
	});
}

function mockWidgetDelete(sitekey: string) {
	const requests = { count: 0 };
	msw.use(
		http.delete(
			`*/accounts/:accountId/challenges/widgets/${sitekey}`,
			() => {
				requests.count++;
				return HttpResponse.json(createFetchResult({ sitekey }, true));
			},
			{ once: true }
		)
	);
	return requests;
}
