import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { clearDialogs, mockConfirm } from "./helpers/mock-dialogs";
import { useMockIsTTY } from "./helpers/mock-istty";
import { createFetchResult, msw } from "./helpers/msw";
import { runWrangler } from "./helpers/run-wrangler";

describe("flagship", () => {
	mockAccountId();
	mockApiToken();
	const std = mockConsoleMethods();
	const { setIsTTY } = useMockIsTTY();
	beforeEach(() => setIsTTY(true));
	afterEach(clearDialogs);

	it("creates an app", async ({ expect }) => {
		let body: unknown;
		msw.use(
			http.post("*/accounts/:accountId/flagship/apps", async ({ request }) => {
				body = await request.json();
				return HttpResponse.json(
					createFetchResult({ id: "app-1", name: "checkout" })
				);
			})
		);
		await runWrangler("flagship apps create --name checkout");
		expect(body).toEqual({ name: "checkout" });
		expect(std.out).toContain("checkout");
	});

	it("sends a JSON content-type so the API parses the body", async ({
		expect,
	}) => {
		let contentType: string | null = null;
		msw.use(
			http.post("*/accounts/:accountId/flagship/apps", ({ request }) => {
				contentType = request.headers.get("content-type");
				return HttpResponse.json(
					createFetchResult({ id: "app-1", name: "checkout" })
				);
			})
		);
		await runWrangler("flagship apps create --name checkout");
		expect(contentType).toContain("application/json");
	});

	it.skip("adds a created app to wrangler.jsonc when given a binding");
	it.skip("does not update config when creating an app with --json");

	it("lists apps", async ({ expect }) => {
		msw.use(
			http.get("*/accounts/:accountId/flagship/apps", () =>
				HttpResponse.json(
					createFetchResult([{ id: "app-1", name: "checkout" }])
				)
			)
		);
		await runWrangler("flagship apps list");
		expect(std.out).toContain("app-1");
		expect(std.out).toContain("checkout");
	});

	// The apps list operation does not currently expose cursor pagination.
	it.todo("follows app list cursors");

	it("updates an app", async ({ expect }) => {
		let body: unknown;
		msw.use(
			http.put(
				"*/accounts/:accountId/flagship/apps/app-1",
				async ({ request }) => {
					body = await request.json();
					return HttpResponse.json(
						createFetchResult({ id: "app-1", name: "renamed" })
					);
				}
			)
		);
		await runWrangler("flagship apps update app-1 --name renamed");
		expect(body).toEqual({ name: "renamed" });
	});

	it("deletes an app with confirmation", async ({ expect }) => {
		let requests = 0;
		mockConfirm({
			text: "This permanently deletes the resource. Continue?",
			result: true,
		});
		msw.use(
			http.delete("*/accounts/:accountId/flagship/apps/app-1", () => {
				requests++;
				return HttpResponse.json(createFetchResult({ id: "app-1" }));
			})
		);
		await runWrangler("flagship apps delete app-1");
		expect(requests).toBe(1);
	});

	it.skip("deletes an app with --json (skips prompt, outputs result)");
	it.todo("deletes multiple apps");

	it("creates a boolean flag with a targeting rule", async ({ expect }) => {
		const flag = {
			key: "new-ui",
			type: "boolean",
			enabled: true,
			default_variation: "off",
			variations: { on: true, off: false },
			rules: [
				{
					priority: 1,
					serve_variation: "on",
					conditions: [{ attribute: "plan", operator: "equals", value: "pro" }],
				},
			],
		};
		let body: unknown;
		msw.use(
			http.post(
				"*/accounts/:accountId/flagship/apps/app-1/flags",
				async ({ request }) => {
					body = await request.json();
					return HttpResponse.json(createFetchResult(flag));
				}
			)
		);
		await runWrangler(
			`flagship apps flags create app-1 --body '${JSON.stringify(flag)}'`
		);
		expect(body).toEqual(flag);
	});

	// Rule/condition/variation parsing is Wrangler's handwritten CLI layer.
	it.skip("accepts a rule provided as JSON");
	it.skip("preserves condition values that contain the operator name");
	it.skip("parses JSON-style arrays for in operators");
	it.skip("rejects empty and malformed condition expressions");
	it.skip("rejects malformed rule JSON");
	it.skip("defaults new flags to boolean on/off variations");

	// The generated list currently emits the items but drops result_info.cursor.
	it.todo("lists flags and surfaces the next cursor");

	it("renders a flag with variations and rules", async ({ expect }) => {
		msw.use(
			http.get("*/accounts/:accountId/flagship/apps/app-1/flags/new-ui", () =>
				HttpResponse.json(
					createFetchResult({
						key: "new-ui",
						enabled: true,
						variations: { on: true, off: false },
						rules: [],
					})
				)
			)
		);
		await runWrangler("flagship apps flags get new-ui --app-id app-1");
		expect(std.out).toContain("new-ui");
		expect(std.out).toContain("variations");
	});

	it("encodes flag keys in API paths", async ({ expect }) => {
		let url = "";
		msw.use(
			http.get(
				"*/accounts/:accountId/flagship/apps/app-1/flags/:flagKey",
				({ request }) => {
					url = request.url;
					return HttpResponse.json(createFetchResult({ key: "foo/bar" }));
				}
			)
		);
		await runWrangler('flagship apps flags get "foo/bar" --app-id app-1');
		expect(url).toContain("/flags/foo%2Fbar");
	});

	it.skip("evaluates a flag with context");
	it("evaluates a flag from a standard API envelope", async ({ expect }) => {
		msw.use(
			http.get("*/accounts/:accountId/flagship/apps/app-1/evaluate", () =>
				HttpResponse.json(
					createFetchResult({
						flagKey: "new-ui",
						value: true,
						reason: "DEFAULT",
					})
				)
			)
		);
		await runWrangler("flagship apps evaluate get app-1 --flag-key new-ui");
		expect(std.out).toContain("new-ui");
		expect(std.out).toContain("DEFAULT");
	});
	it.skip("does not let context override the flag key");
	it.skip("supports inspect, history, and eval aliases");
	it.todo("toggles a flag via read-modify-write");

	it("deletes a flag with confirmation", async ({ expect }) => {
		let requests = 0;
		mockConfirm({
			text: "This permanently deletes the resource. Continue?",
			result: true,
		});
		msw.use(
			http.delete(
				"*/accounts/:accountId/flagship/apps/app-1/flags/new-ui",
				() => {
					requests++;
					return HttpResponse.json(createFetchResult({ key: "new-ui" }));
				}
			)
		);
		await runWrangler("flagship apps flags delete new-ui --app-id app-1");
		expect(requests).toBe(1);
	});

	it.skip("deletes a flag with --json (skips prompt, outputs result)");
	it.todo("deletes multiple flags given an app id and multiple keys");
	it("requires an app id and at least one flag key", async ({ expect }) => {
		setIsTTY(false);
		await expect(
			runWrangler("flagship apps flags delete new-ui --force")
		).rejects.toThrow(/required argument: app-id/i);
		await expect(
			runWrangler("flagship apps flags delete --app-id app-1 --force")
		).rejects.toThrow(/Not enough non-option arguments/);
	});
	it.skip("requires --force to delete with --json");
	it.todo("continues deleting after a failure and reports it");
	it.skip("reports bulk failures as JSON when using --json");

	it("shows the flag changelog", async ({ expect }) => {
		msw.use(
			http.get(
				"*/accounts/:accountId/flagship/apps/app-1/flags/new-ui/changelog",
				() =>
					HttpResponse.json(
						createFetchResult([{ flag_key: "new-ui", event: "create" }])
					)
			)
		);
		await runWrangler(
			"flagship apps flags changelog list --app-id app-1 --flag-key new-ui"
		);
		expect(std.out).toContain("create");
	});

	it.todo("enables a flag without re-specifying its definition");
	it.todo("disables multiple flags");
	it.todo("reports failures when a bulk toggle partially fails");
	it.todo("sets the default variation");

	it("clears the description when passed an empty string", async ({
		expect,
	}) => {
		const flag = {
			key: "new-ui",
			enabled: true,
			default_variation: "off",
			description: "",
			variations: { on: true, off: false },
			rules: [],
		};
		let body: unknown;
		msw.use(
			http.put(
				"*/accounts/:accountId/flagship/apps/app-1/flags/new-ui",
				async ({ request }) => {
					body = await request.json();
					return HttpResponse.json(createFetchResult(flag));
				}
			)
		);
		await runWrangler(
			`flagship apps flags update new-ui --app-id app-1 --body '${JSON.stringify(flag)}'`
		);
		expect(body).toEqual(flag);
	});

	// Weighted split, rollout, and rule mutation commands are Wrangler's
	// read-modify-write convenience layer over the full flag update API.
	it.todo("configures a weighted split");
	it.todo("configures a single rollout");
	it.skip("rejects a non-finite rollout percentage");
	it.todo(
		"removes the rollout without changing the default when percentage is 0"
	);
	it.skip(
		"asks for confirmation before a rollout replaces targeting rules with conditions"
	);
	it.skip("skips the rollout confirmation with --force");
	it.skip("requires --force to replace targeting rules with --json");
	it.skip(
		"asks for confirmation before a split replaces targeting rules with conditions"
	);
	it.skip("supports the ls alias");
	it.skip("detects the operator by position, not list order");
	it.skip("parses OR groups into a nested condition");
	it.skip("gives AND higher precedence than OR");
	it.skip("auto-assigns rule priorities by declaration order");
	it.skip("rejects duplicate rule priorities");
	it.skip("rejects a default variation that is not defined");
	it.skip("rejects a rule that serves an unknown variation");
	it.skip("treats lowercase and/or inside a value literally");
	it.skip("keeps numeric-looking values that do not round-trip as strings");
	it.skip("treats quoted values literally, including reserved words");
	it.skip("does not split on AND/OR inside a bracketed list");
	it.skip("rejects an unterminated quote in a condition");
	it.skip("rejects a malformed bracketed list");
	it.skip("rejects an empty list item");
	it.skip("rejects a condition with no value");
	it.skip("rejects a rollout with multiple @ separators");
	it.skip("rejects a rollout with an empty percentage");
	it.skip("rejects duplicate variation names");
	it.skip("rejects a non-finite number variation");
	it.skip("rejects variations with inconsistent inferred types");
	it.skip("rejects --set-variation introducing an inconsistent type");
	it.skip("rejects unknown fields in --rule-json");
	it.skip("rejects a --rule-json condition mixing logical and base fields");
	it.skip("rejects duplicate split weights");
	it.skip("rejects a non-finite split weight");
	it.todo("appends a rule with --add-rule, keeping existing rules");
	it.skip("rejects replacing and appending rules in the same command");
	it.todo("lists rules for a flag");
	it.todo("updates one rule rollout by priority");
	it.todo("deletes one rule by priority");
	it.todo("renumbers rules after deleting a middle priority");
	it.todo("reorders rules by existing priority");
	it.skip("rejects invalid reorder entries");
	it.skip("rejects duplicate and extra reorder priorities");

	it("allows --limit without treating default --all=false as a conflict", async ({
		expect,
	}) => {
		let limit: string | null = null;
		msw.use(
			http.get(
				"*/accounts/:accountId/flagship/apps/app-1/flags/new-ui/changelog",
				({ request }) => {
					limit = new URL(request.url).searchParams.get("limit");
					return HttpResponse.json(createFetchResult([]));
				}
			)
		);
		await runWrangler(
			"flagship apps flags changelog list --app-id app-1 --flag-key new-ui --limit 3"
		);
		expect(limit).toBe("3");
	});
	it.skip("rejects --all with explicit pagination options");
	it.todo("rejects invalid pagination limits");
	it.todo("follows the cursor with --all when listing flags");
	it.todo("follows the cursor with --all when reading the changelog");

	it("requires an app id for flags list", async ({ expect }) => {
		setIsTTY(false);
		await expect(runWrangler("flagship apps flags list")).rejects.toThrow(
			/required argument: app-id/i
		);
	});
	it("requires an app id for apps get", async ({ expect }) => {
		await expect(runWrangler("flagship apps get")).rejects.toThrow(
			/Not enough non-option arguments/
		);
	});
});
