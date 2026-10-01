import { writeFileSync } from "node:fs";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { clearDialogs, mockConfirm } from "./helpers/mock-dialogs";
import { useMockIsTTY } from "./helpers/mock-istty";
import { createFetchResult, msw } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";

// --- Mock data ---

const mockSettings = {
	id: "75610dab9e69410a82cf7e400a09ecec",
	enabled: true,
	name: "example.com",
	created: "2024-01-01T00:00:00Z",
	modified: "2024-01-02T00:00:00Z",
	skip_wizard: true,
	status: "ready",
	tag: "75610dab9e69410a82cf7e400a09ecec",
};

const mockDnsRecords = [
	{
		content: "route1.mx.cloudflare.net",
		name: "example.com",
		priority: 40,
		ttl: 1,
		type: "MX",
	},
	{
		content: "route2.mx.cloudflare.net",
		name: "example.com",
		priority: 13,
		ttl: 1,
		type: "MX",
	},
];

const mockRule = {
	id: "rule-id-1",
	actions: [{ type: "forward", value: ["dest@example.com"] }],
	enabled: true,
	matchers: [{ type: "literal", field: "to", value: "user@example.com" }],
	name: "My Rule",
	priority: 0,
	tag: "rule-tag-1",
};

const mockCatchAll = {
	id: "catch-all-id",
	actions: [{ type: "forward", value: ["catchall@example.com"] }],
	enabled: true,
	matchers: [{ type: "all" }],
	name: "catch-all",
	tag: "catch-all-tag",
};

const mockAddress = {
	id: "addr-id-1",
	created: "2024-01-01T00:00:00Z",
	email: "dest@example.com",
	modified: "2024-01-02T00:00:00Z",
	tag: "addr-tag-1",
	verified: "2024-01-01T12:00:00Z",
};

const mockSubdomain = {
	enabled: true,
	name: "sub.example.com",
	tag: "aabbccdd11223344aabbccdd11223344",
	created: "2024-01-01T00:00:00Z",
	dkim_selector: "cf-bounce",
	modified: "2024-01-02T00:00:00Z",
	return_path_domain: "cf-bounce.sub.example.com",
};

const mockSendingDnsRecords = [
	{
		content: "v=spf1 include:_spf.mx.cloudflare.net ~all",
		name: "sub.example.com",
		ttl: 1,
		type: "TXT",
	},
];

const mockSendResult = {
	delivered: ["recipient@example.com"],
	permanent_bounces: [],
	queued: [],
};

// --- Help text tests ---
//
// Skipped: cf's command tree differs from wrangler's. wrangler had a
// single `email` product with `routing`/`sending` subgroups, and the
// help blurbs ("Manage Email Routing", "Manage Email Sending DNS records",
// etc.) were authored prose. cf has separate `email-routing` and
// `email-sending` products with auto-generated descriptions sourced
// from the OpenAPI spec. Help-text strings are not portable.
describe.skip("email routing help", () => {
	it("should show help text for email routing", async () => {});
	it("should show help text for email routing rules", async () => {});
	it("should show help text for email routing addresses", async () => {});
	it("should show help text for email routing dns", async () => {});
	it("should show help text for email sending", async () => {});
	it("should show help text for email sending dns", async () => {});
});

// --- Email Routing Command tests ---

describe("email routing commands", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const { setIsTTY } = useMockIsTTY();
	const std = mockConsoleMethods();

	beforeEach(() => {
		// @ts-expect-error we're using a very simple setTimeout mock here
		vi.spyOn(global, "setTimeout").mockImplementation((fn, _period) => {
			setImmediate(fn);
		});
		setIsTTY(true);
	});

	afterEach(() => {
		clearDialogs();
	});

	// --- list ---
	//
	// `wrangler email routing list` queried
	// `/accounts/:accountId/email/routing/zones` to list every zone in
	// the account along with its email-routing status. cf has no
	// equivalent: `cf email-routing get` is zone-scoped (one zone at a
	// time) and there is no account-level "list zones with email
	// routing" command in the OpenAPI spec.
	describe.skip("list", () => {
		it("should list zones with email routing status", async () => {});
		it("should handle no zones", async () => {});
		it("should show disabled zones", async () => {});
	});

	// --- zone validation ---
	//
	// wrangler resolved a positional `<domain>` into a zone id via
	// `GET /zones?name=...` before calling the email-routing endpoints.
	// cf delegates that resolution to `getZoneId` (lib/context.ts) and
	// the error surface is different — it doesn't say "Could not find
	// zone for `notfound.com`", and the code path is shared across
	// every zone-scoped command rather than being part of email-routing
	// in particular.
	describe.skip("zone validation", () => {
		it("should error when domain is not found", async () => {});
	});

	// --- settings ---
	//
	// `wrangler email routing settings <domain>` → cf's
	// `email-routing settings get --zone <id>`. wrangler decorated the JSON
	// payload with a custom human-readable summary
	// ("Email Routing for example.com" / "Enabled:  true" / "Status:
	// ready"); cf prints the API response as JSON. Snapshots updated.
	describe("settings", () => {
		it("should get settings with --zone-id", async ({ expect }) => {
			mockGetSettings(mockSettings);

			await runWrangler(
				"email-routing settings get --zone 0123456789abcdef0123456789abcdef"
			);

			expect(JSON.parse(std.out)).toEqual(mockSettings);
		});

		// Wrangler-only: cf doesn't auto-resolve a bare domain positional
		// here — the zone is supplied via `--zone <name-or-id>` and
		// `getZoneId` does the lookup against `/zones?name=...`
		// uniformly, so there's nothing email-routing-specific to test.
		it.skip("should get settings with domain resolution", async () => {});
	});

	// --- enable ---
	describe("enable", () => {
		it("should enable email routing", async ({ expect }) => {
			mockEnableEmailRouting(mockSettings);

			await runWrangler(
				"email-routing enable --zone 0123456789abcdef0123456789abcdef"
			);

			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockSettings);
		});
	});

	// --- disable ---
	//
	// `email-routing disable` is annotated with a Forge confirmation
	// message explaining that the operation also removes DNS records.
	// That message is surfaced verbatim in the
	// confirm prompt, replacing wrangler's bespoke "Are you sure you
	// want to disable Email Routing for this zone?" wording. cf prints
	// the API JSON on success instead of wrangler's "Email Routing
	// disabled" string.
	describe("disable", () => {
		it("should disable email routing", async ({ expect }) => {
			mockDisableEmailRouting(mockSettings);

			mockConfirm({
				text: `This operation disables Email Routing and removes its DNS records. Continue?`,
				result: true,
			});

			await runWrangler(
				"email-routing disable --zone 0123456789abcdef0123456789abcdef"
			);

			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockSettings);
		});

		it("should skip confirmation with --force", async ({ expect }) => {
			mockDisableEmailRouting(mockSettings);
			// No mockConfirm — --force must bypass the prompt entirely.
			await runWrangler(
				"email-routing disable --zone 0123456789abcdef0123456789abcdef --force"
			);

			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockSettings);
		});

		it("should abort when user declines confirmation", async ({ expect }) => {
			// No mockDisableEmailRouting — declining should mean no
			// API call is fired (msw would error on an unhandled request,
			// which is the assertion). cf prints "Aborted." via
			// `process.stderr.write` rather than `console.error`, so
			// it's not visible to `mockConsoleMethods`; verifying the
			// no-API-call side-effect is sufficient.
			mockConfirm({
				text: `This operation disables Email Routing and removes its DNS records. Continue?`,
				result: false,
			});

			await runWrangler(
				"email-routing disable --zone 0123456789abcdef0123456789abcdef"
			);

			expect(std.out).toEqual("");
		});
	});

	// --- dns get ---
	//
	// wrangler's "No DNS records found." message and table-formatted
	// row output have no cf equivalent — cf prints the JSON array
	// returned by the API.
	describe("dns get", () => {
		it("should show dns records", async ({ expect }) => {
			mockGetDns(mockDnsRecords);

			await runWrangler(
				"email-routing dns get --zone 0123456789abcdef0123456789abcdef"
			);

			expect(JSON.parse(std.out)).toEqual(mockDnsRecords);
		});

		it("should handle no dns records", async ({ expect }) => {
			mockGetDns([]);

			await runWrangler(
				"email-routing dns get --zone 0123456789abcdef0123456789abcdef"
			);

			expect(JSON.parse(std.out)).toEqual([]);
		});
	});

	// --- dns unlock ---
	describe("dns unlock", () => {
		it("should unlock dns records", async ({ expect }) => {
			mockUnlockDns(mockSettings);

			await runWrangler(
				"email-routing dns unlock --zone 0123456789abcdef0123456789abcdef --name example.com"
			);

			expect(JSON.parse(std.out)).toEqual(mockSettings);
		});

		// Wrangler's command adds a confirmation prompt around the API
		// operation. cf exposes the underlying PATCH directly.
		it.skip("should skip confirmation with --force", async () => {});
		it.skip("should abort when user declines confirmation", async () => {});
	});

	// --- rules list ---
	//
	// The REST operation accepts either an account or zone scope. Forge
	// names that hybrid operation `list-account`; supplying `--zone`
	// selects the same zone-scoped endpoint exercised by Wrangler.
	describe("rules list", () => {
		it("should list routing rules", async ({ expect }) => {
			mockListRules([mockRule]);

			await runWrangler(
				"email-routing rules list-account --zone 0123456789abcdef0123456789abcdef"
			);

			expect(JSON.parse(std.out)).toEqual([mockRule]);
		});

		it("should handle no rules", async ({ expect }) => {
			mockListRules([]);

			await runWrangler(
				"email-routing rules list-account --zone 0123456789abcdef0123456789abcdef"
			);

			expect(JSON.parse(std.out)).toEqual([]);
		});

		// Catch-all separation in the list view is wrangler-only
		// presentation. cf returns the API payload verbatim.
		it.skip("should show catch-all rule separately", async () => {});
	});

	// --- rules get ---
	//
	// cf splits the catch-all into its own command tree
	// (`email-routing rules catch-all get` → GET
	// `/zones/:zoneId/email/routing/rules/catch_all`), so wrangler's
	// "if positional is 'catch-all', call the catch-all endpoint
	// instead" branch — and its error 2020 fallback — has no cf
	// equivalent. Tests for the regular and catch-all paths are kept;
	// the fallback test is skipped.
	describe("rules get", () => {
		it("should get a specific rule", async ({ expect }) => {
			mockGetRule(mockRule);

			await runWrangler(
				"email-routing rules get rule-id-1 --zone 0123456789abcdef0123456789abcdef"
			);

			expect(JSON.parse(std.out)).toEqual(mockRule);
		});

		it("should get the catch-all rule when rule-id is 'catch-all'", async ({
			expect,
		}) => {
			mockGetCatchAll(mockCatchAll);

			await runWrangler(
				"email-routing rules catch-all get --zone 0123456789abcdef0123456789abcdef"
			);

			expect(JSON.parse(std.out)).toEqual(mockCatchAll);
		});

		it.skip("should fallback to catch-all endpoint on error 2020", async () => {});
	});

	// --- rules create ---
	//
	// cf's `email-routing rules create` exposes only `--enabled`,
	// `--name`, `--priority`, `--body` — the matchers / actions
	// arrays must be passed via `--body`. wrangler's
	// `--match-type/--match-field/--match-value/--action-type/
	// --action-value` flags don't exist in cf, so its
	// "drop without --action-value" / "forward without --action-value"
	// validation messages don't exist either.
	describe("rules create", () => {
		it("should create a forwarding rule", async ({ expect }) => {
			const reqProm = mockCreateRule();

			const body = JSON.stringify({
				matchers: [{ type: "literal", field: "to", value: "user@example.com" }],
				actions: [{ type: "forward", value: ["dest@example.com"] }],
				name: "My Rule",
			});

			await runWrangler(
				`email-routing rules create --zone 0123456789abcdef0123456789abcdef --body ${JSON.stringify(body)}`
			);

			await expect(reqProm).resolves.toMatchObject({
				matchers: [{ type: "literal", field: "to", value: "user@example.com" }],
				actions: [{ type: "forward", value: ["dest@example.com"] }],
				name: "My Rule",
			});
		});

		it("should create a drop rule without --action-value", async ({
			expect,
		}) => {
			const reqProm = mockCreateRule();

			const body = JSON.stringify({
				matchers: [{ type: "literal", field: "to", value: "spam@example.com" }],
				actions: [{ type: "drop" }],
			});

			await runWrangler(
				`email-routing rules create --zone 0123456789abcdef0123456789abcdef --body ${JSON.stringify(body)}`
			);

			await expect(reqProm).resolves.toMatchObject({
				matchers: [{ type: "literal", field: "to", value: "spam@example.com" }],
				actions: [{ type: "drop" }],
			});
		});

		// wrangler-only validation: cf builds the payload from
		// `--body` JSON and lets the API reject it.
		it.skip("should error when forward is used without --action-value", async () => {});
	});

	// --- rules update ---
	//
	// Same flag-vs-body divergence as `rules create`. cf's
	// `email-routing rules update <ruleIdentifier> --zone <id>
	// --body '{...}'` replaces wrangler's structured-flag form. The
	// catch-all goes through `email-routing rules catch-all update`.
	describe("rules update", () => {
		it("should update a routing rule", async ({ expect }) => {
			const reqProm = mockUpdateRule();

			const body = JSON.stringify({
				matchers: [
					{ type: "literal", field: "to", value: "updated@example.com" },
				],
				actions: [{ type: "forward", value: ["newdest@example.com"] }],
			});

			await runWrangler(
				`email-routing rules update rule-id-1 --zone 0123456789abcdef0123456789abcdef --body ${JSON.stringify(body)}`
			);

			await expect(reqProm).resolves.toMatchObject({
				matchers: [
					{ type: "literal", field: "to", value: "updated@example.com" },
				],
				actions: [{ type: "forward", value: ["newdest@example.com"] }],
			});
		});

		it("should update the catch-all rule to drop", async ({ expect }) => {
			const reqProm = mockUpdateCatchAll();

			const body = JSON.stringify({
				actions: [{ type: "drop" }],
				matchers: [{ type: "all" }],
				enabled: true,
			});

			await runWrangler(
				`email-routing rules catch-all update --zone 0123456789abcdef0123456789abcdef --body ${JSON.stringify(body)}`
			);

			await expect(reqProm).resolves.toMatchObject({
				actions: [{ type: "drop" }],
				matchers: [{ type: "all" }],
				enabled: true,
			});
		});

		it("should update the catch-all rule to forward", async ({ expect }) => {
			const reqProm = mockUpdateCatchAll();

			const body = JSON.stringify({
				actions: [{ type: "forward", value: ["catchall@example.com"] }],
				matchers: [{ type: "all" }],
			});

			await runWrangler(
				`email-routing rules catch-all update --zone 0123456789abcdef0123456789abcdef --body ${JSON.stringify(body)}`
			);

			await expect(reqProm).resolves.toMatchObject({
				actions: [{ type: "forward", value: ["catchall@example.com"] }],
				matchers: [{ type: "all" }],
			});
		});

		// wrangler-only structured-flag validation paths.
		it.skip("should error when catch-all forward is used without --action-value", async () => {});
		it.skip("should error when regular rule update is missing --match-type", async () => {});
	});

	// --- rules delete ---
	//
	// cf surfaces the operation-specific Forge confirmation message.
	describe("rules delete", () => {
		it("should delete a routing rule", async ({ expect }) => {
			mockConfirm({
				text: "This operation permanently deletes an Email Routing rule. Continue?",
				result: true,
			});
			mockDeleteRule();

			await runWrangler(
				"email-routing rules delete rule-id-1 --zone 0123456789abcdef0123456789abcdef"
			);

			expect(JSON.parse(std.out)).toEqual(mockRule);
		});

		it("should skip confirmation with --force", async ({ expect }) => {
			mockDeleteRule();

			await runWrangler(
				"email-routing rules delete rule-id-1 --zone 0123456789abcdef0123456789abcdef --force"
			);

			expect(JSON.parse(std.out)).toEqual(mockRule);
		});

		it("should abort when user declines confirmation", async ({ expect }) => {
			mockConfirm({
				text: "This operation permanently deletes an Email Routing rule. Continue?",
				result: false,
			});

			const handler = vi.fn(() => {
				return HttpResponse.json(createFetchResult(mockRule, true));
			});
			msw.use(
				http.delete("*/zones/:zoneId/email/routing/rules/:ruleId", handler, {
					once: true,
				})
			);

			await runWrangler(
				"email-routing rules delete rule-id-1 --zone 0123456789abcdef0123456789abcdef"
			);

			expect(std.out).toBe("");
			expect(handler).not.toHaveBeenCalled();
		});
	});

	// --- addresses list ---

	describe("addresses list", () => {
		it("should list destination addresses", async ({ expect }) => {
			mockListAddresses([mockAddress]);

			await runWrangler("email-routing addresses list");

			expect(JSON.parse(std.out)).toEqual([mockAddress]);
		});

		it("should handle no addresses", async ({ expect }) => {
			mockListAddresses([]);

			await runWrangler("email-routing addresses list");

			expect(JSON.parse(std.out)).toEqual([]);
		});
	});

	// --- addresses get ---

	describe("addresses get", () => {
		it("should get a destination address", async ({ expect }) => {
			mockGetAddress(mockAddress);

			await runWrangler("email-routing addresses get addr-id-1");

			expect(JSON.parse(std.out)).toEqual(mockAddress);
		});
	});

	// --- addresses create ---
	//
	// wrangler took the email as a positional; cf uses `--email <addr>`
	// (forge classifies the body string field as a flag). The
	// "verification email has been sent" prose is wrangler-specific.
	describe("addresses create", () => {
		it("should create a destination address", async ({ expect }) => {
			mockCreateAddress();

			await runWrangler(
				"email-routing addresses create --email newdest@example.com"
			);

			expect(JSON.parse(std.out)).toMatchObject({
				email: "newdest@example.com",
			});
		});
	});

	// --- addresses delete ---
	//
	// cf surfaces the operation-specific Forge confirmation message.
	describe("addresses delete", () => {
		it("should delete a destination address", async ({ expect }) => {
			mockConfirm({
				text: "This operation permanently deletes a destination address. Continue?",
				result: true,
			});
			mockDeleteAddress();

			await runWrangler("email-routing addresses delete addr-id-1");

			expect(JSON.parse(std.out)).toEqual(mockAddress);
		});
	});
});

// --- Email Sending Command tests ---

describe("email sending commands", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const { setIsTTY } = useMockIsTTY();
	const std = mockConsoleMethods();

	beforeEach(() => {
		// @ts-expect-error we're using a very simple setTimeout mock here
		vi.spyOn(global, "setTimeout").mockImplementation((fn, _period) => {
			setImmediate(fn);
		});
		setIsTTY(true);
	});

	afterEach(() => {
		clearDialogs();
	});

	// --- list ---
	//
	// wrangler queried
	// `/accounts/:accountId/email/sending/zones` for an account-wide
	// list of zones with email-sending. cf has no equivalent — closest
	// is `email-sending subdomains list` which is per-zone, not
	// per-account, and exposes a different shape.
	describe("list", () => {
		it.skip("should list all subdomains in the account", async () => {});
		it.skip("should handle no subdomains in the account", async () => {});

		it("should list subdomains for a domain", async ({ expect }) => {
			mockListSendingSubdomains([mockSubdomain]);

			await runWrangler(
				"email-sending subdomains list --zone 0123456789abcdef0123456789abcdef"
			);

			expect(JSON.parse(std.out)).toEqual([mockSubdomain]);
		});

		it("should handle no subdomains for a domain", async ({ expect }) => {
			mockListSendingSubdomains([]);

			await runWrangler(
				"email-sending subdomains list --zone 0123456789abcdef0123456789abcdef"
			);

			expect(JSON.parse(std.out)).toEqual([]);
		});
	});

	// --- settings ---
	//
	// wrangler `email sending settings <domain>` queried
	// `/zones/:zoneId/email/sending` (zone-level settings + nested
	// subdomains). cf has no zone-level settings command — only
	// `email-sending subdomains list/get` (per-subdomain) and
	// `email-sending limits get` (account-wide).
	describe.skip("settings", () => {
		it("should get sending settings", async () => {});
		it("should error when the domain has no sending subdomain", async () => {});
	});

	// --- enable / disable ---
	//
	// wrangler `email sending enable <domain>` POSTed to either
	// `/zones/:zoneId/email/sending/enable` (zone-level, no body) or
	// the same endpoint with `{ name: "<sub>" }` (subdomain). The
	// zone-vs-subdomain detection (including multi-label TLDs like
	// `.co.uk`) was wrangler-side. cf has no `email-sending enable` —
	// subdomains are managed via `email-sending subdomains create` and
	// the zone-level enable is not surfaced. Disabling maps directly to
	// the generated subdomain delete operation when the identifier is known.
	describe("enable", () => {
		it("should enable sending for a zone", async ({ expect }) => {
			const request = mockCreateSendingSubdomain();

			await runWrangler(
				"email-sending subdomains create --zone 0123456789abcdef0123456789abcdef --name example.com"
			);

			await expect(request).resolves.toMatchObject({ name: "example.com" });
		});

		it("should enable sending for a subdomain", async ({ expect }) => {
			const request = mockCreateSendingSubdomain();

			await runWrangler(
				"email-sending subdomains create --zone 0123456789abcdef0123456789abcdef --name sub.example.com"
			);

			await expect(request).resolves.toMatchObject({ name: "sub.example.com" });
		});

		it("should send the zone name for a zone-level domain with --zone-id", async ({
			expect,
		}) => {
			const request = mockCreateSendingSubdomain();

			await runWrangler(
				"email-sending subdomains create --zone 0123456789abcdef0123456789abcdef --name example.com"
			);

			await expect(request).resolves.toMatchObject({ name: "example.com" });
		});

		it("should send name for subdomain with --zone-id", async ({ expect }) => {
			const request = mockCreateSendingSubdomain();

			await runWrangler(
				"email-sending subdomains create --zone 0123456789abcdef0123456789abcdef --name sub.example.com"
			);

			await expect(request).resolves.toMatchObject({ name: "sub.example.com" });
		});

		it("should send the zone name for multi-label TLD with --zone-id", async ({
			expect,
		}) => {
			const request = mockCreateSendingSubdomain();

			await runWrangler(
				"email-sending subdomains create --zone 0123456789abcdef0123456789abcdef --name example.co.uk"
			);

			await expect(request).resolves.toMatchObject({ name: "example.co.uk" });
		});

		it("should send subdomain of multi-label TLD with --zone-id", async ({
			expect,
		}) => {
			const request = mockCreateSendingSubdomain();

			await runWrangler(
				"email-sending subdomains create --zone 0123456789abcdef0123456789abcdef --name notifications.example.co.uk"
			);

			await expect(request).resolves.toMatchObject({
				name: "notifications.example.co.uk",
			});
		});
	});

	describe("disable", () => {
		it("should disable sending for a domain", async ({ expect }) => {
			mockConfirm({
				text: "This operation disables sending and removes the subdomain's Email Sending DNS records. Continue?",
				result: true,
			});
			const request = mockDeleteSendingSubdomain();

			await runWrangler(
				"email-sending subdomains delete aabbccdd11223344aabbccdd11223344 --zone 0123456789abcdef0123456789abcdef"
			);

			await expect(request).resolves.toBe("aabbccdd11223344aabbccdd11223344");
		});

		it("should delete the matching subdomain with --zone-id", async ({
			expect,
		}) => {
			const request = mockDeleteSendingSubdomain();

			await runWrangler(
				"email-sending subdomains delete aabbccdd11223344aabbccdd11223344 --zone 0123456789abcdef0123456789abcdef --force"
			);

			await expect(request).resolves.toBe("aabbccdd11223344aabbccdd11223344");
		});

		// Wrangler resolves domain names through the sending-subdomain list;
		// cf's REST-shaped command requires the identifier explicitly.
		it.skip("should error when the domain has no sending subdomain", async () => {});
	});

	// --- dns get ---
	//
	// wrangler `email sending dns get <domain>` resolved the domain
	// against the zone-settings response to find a subdomain id, then
	// hit either `/zones/:zoneId/email/sending/dns` (zone-level) or
	// `/zones/:zoneId/email/sending/subdomains/:subdomainId/dns`
	// (subdomain). cf has only `email-sending subdomains dns get
	// <subdomainIdentifier>` — the zone-level DNS endpoint isn't
	// surfaced, and there's no automatic zone-vs-subdomain dispatch.
	describe("dns get", () => {
		it("should show sending dns records", async ({ expect }) => {
			mockGetSendingDns(mockSendingDnsRecords);

			await runWrangler(
				"email-sending subdomains dns get aabbccdd11223344aabbccdd11223344 --zone 0123456789abcdef0123456789abcdef"
			);

			expect(JSON.parse(std.out)).toEqual(mockSendingDnsRecords);
		});

		it("should handle no dns records", async ({ expect }) => {
			mockGetSendingDns([]);

			await runWrangler(
				"email-sending subdomains dns get aabbccdd11223344aabbccdd11223344 --zone 0123456789abcdef0123456789abcdef"
			);

			expect(JSON.parse(std.out)).toEqual([]);
		});

		// Wrangler resolves domain names to sending-subdomain identifiers;
		// cf intentionally requires the identifier exposed by the REST API.
		it.skip("should get dns records for a zone-apex domain with --zone-id", async () => {});
		it.skip("should get dns records for a subdomain with --zone-id", async () => {});
	});

	// --- send ---
	//
	// cf exposes the API's structured email builder through `--body`, so
	// the portable send cases target that REST operation directly. The bespoke wrangler
	// validation messages ("Header name cannot be empty",
	// "At least one of --text or --html must be provided", etc.) and
	// the "Delivered to:" / "Queued for:" / "Permanently bounced:"
	// formatting are wrangler-side.
	describe("send", () => {
		it("should send an email with text body", async ({ expect }) => {
			const body = {
				from: "sender@example.com",
				to: "recipient@example.com",
				subject: "Test Email",
				text: "Hello World",
			};
			const request = mockSendEmail();

			await runWrangler(`email-sending send --body '${JSON.stringify(body)}'`);

			await expect(request).resolves.toMatchObject(body);
			expect(JSON.parse(std.out)).toEqual(mockSendResult);
		});

		it("should send an email with html body", async ({ expect }) => {
			const body = {
				from: "sender@example.com",
				to: "recipient@example.com",
				subject: "Test",
				html: "<h1>Hello</h1>",
			};
			const request = mockSendEmail();

			await runWrangler(`email-sending send --body '${JSON.stringify(body)}'`);

			await expect(request).resolves.toMatchObject(body);
		});

		it("should send with from-name", async ({ expect }) => {
			const body = {
				from: { address: "sender@example.com", name: "John Doe" },
				to: "recipient@example.com",
				subject: "Test",
				text: "Hi",
			};
			const request = mockSendEmail();

			await runWrangler(`email-sending send --body '${JSON.stringify(body)}'`);

			await expect(request).resolves.toMatchObject(body);
		});

		it("should send with cc and bcc", async ({ expect }) => {
			const body = {
				from: "sender@example.com",
				to: "recipient@example.com",
				cc: ["cc@example.com"],
				bcc: ["bcc@example.com"],
				subject: "Test",
				text: "Hi",
			};
			const request = mockSendEmail();

			await runWrangler(`email-sending send --body '${JSON.stringify(body)}'`);

			await expect(request).resolves.toMatchObject(body);
		});

		it("should send with custom headers", async ({ expect }) => {
			const body = {
				from: "sender@example.com",
				to: "recipient@example.com",
				subject: "Test",
				text: "Hi",
				headers: { "X-Custom": "value" },
			};
			const request = mockSendEmail();

			await runWrangler(`email-sending send --body '${JSON.stringify(body)}'`);

			await expect(request).resolves.toMatchObject(body);
		});

		it.skip("should error on malformed header with empty name", async () => {});
		it.skip("should error on header without colon separator", async () => {});
		it.skip("should error when neither --text nor --html is provided", async () => {});

		it("should display queued and bounced recipients", async ({ expect }) => {
			const result = {
				delivered: [],
				queued: ["queued@example.com"],
				permanent_bounces: ["bounced@example.com"],
			};
			mockSendEmailWithResult(result);

			await runWrangler(
				`email-sending send --body '${JSON.stringify({
					from: "sender@example.com",
					to: "recipient@example.com",
					subject: "Test",
					text: "Hi",
				})}'`
			);

			expect(JSON.parse(std.out)).toEqual(result);
		});
	});

	// --- send-raw ---
	//
	// cf's `email-sending send-raw` exposes `--from`, `--mime-message`,
	// `--recipients` (array). wrangler's `--to` (single value) maps to
	// `--recipients` (array). wrangler's `--mime-file` does not exist
	// in cf — `@<path>` file ingestion happens automatically via
	// `--mime-message @<path>` instead.
	describe("send-raw", () => {
		it("should send a raw MIME email", async ({ expect }) => {
			const reqProm = mockSendRawEmail();
			const mimeMessage =
				"From: sender@example.com\nTo: recipient@example.com\nSubject: Hello\n\nHello, World!";

			await runWrangler(
				`email-sending send-raw --from sender@example.com --recipients recipient@example.com --mime-message '${mimeMessage}'`
			);

			await expect(reqProm).resolves.toMatchObject({
				from: "sender@example.com",
				recipients: ["recipient@example.com"],
				mime_message: mimeMessage,
			});
		});

		it("should send a raw MIME email from file", async ({ expect }) => {
			const mimeMessage =
				"From: sender@example.com\nTo: recipient@example.com\nSubject: Hello\n\nHello, World!";
			writeFileSync("test.eml", mimeMessage);
			const request = mockSendRawEmail();

			await runWrangler(
				"email-sending send-raw --from sender@example.com --recipients recipient@example.com --mime-message @test.eml"
			);

			await expect(request).resolves.toMatchObject({
				mime_message: mimeMessage,
			});
		});

		it("should error when --mime-file does not exist", async ({ expect }) => {
			await expect(
				runWrangler(
					"email-sending send-raw --from sender@example.com --recipients recipient@example.com --mime-message @missing.eml"
				)
			).rejects.toThrow(/--mime-message: cannot read file/);
		});

		// cf requires `--mime-message` (and prompts interactively if
		// missing on a TTY). The exact error string differs from
		// wrangler's "You must provide either --mime (inline MIME
		// message) or --mime-file (path to MIME file)".
		it("should error when neither --mime nor --mime-file is provided", async ({
			expect,
		}) => {
			setIsTTY(false);
			await expect(
				runWrangler(
					"email-sending send-raw --from sender@example.com --recipients recipient@example.com"
				)
			).rejects.toThrow(/--mime-message is required/);
		});
	});

	// --- send with attachment ---
	//
	// `--attachment <path>` is wrangler-only. cf has no attachment
	// flag on `email-sending send` — attachments would have to be
	// passed via `--body` with the API's expected schema.
	describe.skip("send with attachment", () => {
		it("should send an email with a file attachment", async () => {});
		it("should error when attachment file does not exist", async () => {});
	});
});

// --- Mock API handlers: Email Routing ---

function mockGetSettings(settings: typeof mockSettings) {
	msw.use(
		http.get(
			"*/zones/:zoneId/email/routing",
			() => {
				return HttpResponse.json(createFetchResult(settings, true));
			},
			{ once: true }
		)
	);
}

function mockEnableEmailRouting(settings: typeof mockSettings) {
	msw.use(
		http.post(
			"*/zones/:zoneId/email/routing/dns",
			() => {
				return HttpResponse.json(createFetchResult(settings, true));
			},
			{ once: true }
		)
	);
}

function mockDisableEmailRouting(settings: typeof mockSettings) {
	msw.use(
		http.delete(
			"*/zones/:zoneId/email/routing/dns",
			() => {
				return HttpResponse.json(createFetchResult(settings, true));
			},
			{ once: true }
		)
	);
}

function mockGetDns(records: typeof mockDnsRecords) {
	msw.use(
		http.get(
			"*/zones/:zoneId/email/routing/dns",
			() => {
				return HttpResponse.json(createFetchResult(records, true));
			},
			{ once: true }
		)
	);
}

function mockUnlockDns(settings: typeof mockSettings) {
	msw.use(
		http.patch(
			"*/zones/:zoneId/email/routing/dns",
			() => {
				return HttpResponse.json(createFetchResult(settings, true));
			},
			{ once: true }
		)
	);
}

function mockListRules(rules: (typeof mockRule)[]) {
	msw.use(
		http.get(
			"*/zones/:zoneId/email/routing/rules",
			() => {
				return HttpResponse.json(createFetchResult(rules, true));
			},
			{ once: true }
		)
	);
}

function mockGetRule(rule: typeof mockRule) {
	msw.use(
		http.get(
			"*/zones/:zoneId/email/routing/rules/:ruleId",
			() => {
				return HttpResponse.json(createFetchResult(rule, true));
			},
			{ once: true }
		)
	);
}

function mockCreateRule(): Promise<unknown> {
	return new Promise((resolve) => {
		msw.use(
			http.post(
				"*/zones/:zoneId/email/routing/rules",
				async ({ request }) => {
					const reqBody = (await request.json()) as Record<string, unknown>;
					resolve(reqBody);
					return HttpResponse.json(
						createFetchResult({ id: "new-rule-id", ...reqBody }, true)
					);
				},
				{ once: true }
			)
		);
	});
}

function mockUpdateRule(): Promise<unknown> {
	return new Promise((resolve) => {
		msw.use(
			http.put(
				"*/zones/:zoneId/email/routing/rules/:ruleId",
				async ({ request }) => {
					const reqBody = (await request.json()) as Record<string, unknown>;
					resolve(reqBody);
					return HttpResponse.json(
						createFetchResult({ id: "rule-id-1", ...reqBody }, true)
					);
				},
				{ once: true }
			)
		);
	});
}

function mockDeleteRule() {
	msw.use(
		http.delete(
			"*/zones/:zoneId/email/routing/rules/:ruleId",
			() => {
				return HttpResponse.json(createFetchResult(mockRule, true));
			},
			{ once: true }
		)
	);
}

function mockGetCatchAll(catchAll: typeof mockCatchAll) {
	msw.use(
		http.get(
			"*/zones/:zoneId/email/routing/rules/catch_all",
			() => {
				return HttpResponse.json(createFetchResult(catchAll, true));
			},
			{ once: true }
		)
	);
}

function mockUpdateCatchAll(): Promise<unknown> {
	return new Promise((resolve) => {
		msw.use(
			http.put(
				"*/zones/:zoneId/email/routing/rules/catch_all",
				async ({ request }) => {
					const reqBody = (await request.json()) as Record<string, unknown>;
					resolve(reqBody);
					return HttpResponse.json(
						createFetchResult({ id: "catch-all-id", ...reqBody }, true)
					);
				},
				{ once: true }
			)
		);
	});
}

function mockListAddresses(addresses: (typeof mockAddress)[]) {
	msw.use(
		http.get(
			"*/accounts/:accountId/email/routing/addresses",
			() => {
				return HttpResponse.json(createFetchResult(addresses, true));
			},
			{ once: true }
		)
	);
}

function mockGetAddress(address: typeof mockAddress) {
	msw.use(
		http.get(
			"*/accounts/:accountId/email/routing/addresses/:addressId",
			() => {
				return HttpResponse.json(createFetchResult(address, true));
			},
			{ once: true }
		)
	);
}

function mockCreateAddress() {
	msw.use(
		http.post(
			"*/accounts/:accountId/email/routing/addresses",
			async ({ request }) => {
				const reqBody = (await request.json()) as { email: string };
				return HttpResponse.json(
					createFetchResult(
						{
							id: "new-addr-id",
							email: reqBody.email,
							created: "2024-01-01T00:00:00Z",
							modified: "2024-01-01T00:00:00Z",
							tag: "new-tag",
							verified: "",
						},
						true
					)
				);
			},
			{ once: true }
		)
	);
}

function mockDeleteAddress() {
	msw.use(
		http.delete(
			"*/accounts/:accountId/email/routing/addresses/:addressId",
			() => {
				return HttpResponse.json(createFetchResult(mockAddress, true));
			},
			{ once: true }
		)
	);
}

// --- Mock API handlers: Email Sending ---

function mockListSendingSubdomains(subdomains: (typeof mockSubdomain)[]) {
	msw.use(
		http.get(
			"*/zones/:zoneId/email/sending/subdomains",
			() => {
				return HttpResponse.json(createFetchResult(subdomains, true));
			},
			{ once: true }
		)
	);
}

function mockCreateSendingSubdomain(): Promise<unknown> {
	return new Promise((resolve) => {
		msw.use(
			http.post(
				"*/zones/:zoneId/email/sending/subdomains",
				async ({ request }) => {
					const body = await request.json();
					resolve(body);
					return HttpResponse.json(
						createFetchResult({ ...mockSubdomain, ...(body as object) }, true)
					);
				},
				{ once: true }
			)
		);
	});
}

function mockGetSendingDns(records: typeof mockSendingDnsRecords) {
	msw.use(
		http.get(
			"*/zones/:zoneId/email/sending/subdomains/:subdomainId/dns",
			() => {
				return HttpResponse.json(createFetchResult(records, true));
			},
			{ once: true }
		)
	);
}

function mockDeleteSendingSubdomain(): Promise<string> {
	return new Promise((resolve) => {
		msw.use(
			http.delete(
				"*/zones/:zoneId/email/sending/subdomains/:subdomainId",
				({ params }) => {
					resolve(String(params.subdomainId));
					return HttpResponse.json(createFetchResult(mockSubdomain, true));
				},
				{ once: true }
			)
		);
	});
}

function mockSendEmail(): Promise<unknown> {
	return new Promise((resolve) => {
		msw.use(
			http.post(
				"*/accounts/:accountId/email/sending/send",
				async ({ request }) => {
					resolve(await request.json());
					return HttpResponse.json(createFetchResult(mockSendResult, true));
				},
				{ once: true }
			)
		);
	});
}

function mockSendEmailWithResult(result: {
	delivered: string[];
	permanent_bounces: string[];
	queued: string[];
}) {
	msw.use(
		http.post(
			"*/accounts/:accountId/email/sending/send",
			() => HttpResponse.json(createFetchResult(result, true)),
			{ once: true }
		)
	);
}

function mockSendRawEmail(): Promise<unknown> {
	return new Promise((resolve) => {
		msw.use(
			http.post(
				"*/accounts/:accountId/email/sending/send_raw",
				async ({ request }) => {
					const reqBody = await request.json();
					resolve(reqBody);
					return HttpResponse.json(createFetchResult(mockSendResult, true));
				},
				{ once: true }
			)
		);
	});
}
