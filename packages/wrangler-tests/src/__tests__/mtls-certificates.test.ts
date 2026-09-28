import { writeFileSync } from "node:fs";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { mockConfirm } from "./helpers/mock-dialogs";
import { useMockIsTTY } from "./helpers/mock-istty";
import { msw } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";

interface MTlsCertificateResponse {
	id: string;
	name?: string;
	certificates?: string;
	issuer?: string;
	uploaded_on?: string;
	expires_on?: string;
}

describe("wrangler", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const { setIsTTY } = useMockIsTTY();
	const std = mockConsoleMethods();

	beforeEach(() => {
		setIsTTY(true);
	});

	function mockPostMTlsCertificate(
		resp: Partial<MTlsCertificateResponse> = {}
	) {
		const config = { calls: 0 };
		msw.use(
			http.post(
				"*/accounts/:accountId/mtls_certificates",
				async ({ request }) => {
					config.calls++;

					const body = (await request.json()) as Record<string, unknown>;
					return HttpResponse.json({
						success: true,
						errors: [],
						messages: [],
						result: {
							id: "1234",
							name: body.name,
							certificates: body.certificates,
							issuer: "example.com...",
							uploaded_on: now.toISOString(),
							expires_on: oneYearLater.toISOString(),
							...resp,
						},
					});
				},
				{ once: true }
			)
		);
		return config;
	}

	function mockGetMTlsCertificates(
		certs: Partial<MTlsCertificateResponse>[] | undefined
	) {
		const config = { calls: 0 };
		msw.use(
			http.get(
				"*/accounts/:accountId/mtls_certificates",
				async () => {
					config.calls++;

					return HttpResponse.json({
						success: true,
						errors: [],
						messages: [],
						result:
							typeof certs === "undefined"
								? [
										{
											id: "1234",
											name: "cert one",
											certificates: "BEGIN CERTIFICATE...",
											issuer: "example.com...",
											uploaded_on: now.toISOString(),
											expires_on: oneYearLater.toISOString(),
										},
										{
											id: "5678",
											name: "cert two",
											certificates: "BEGIN CERTIFICATE...",
											issuer: "example.com...",
											uploaded_on: now.toISOString(),
											expires_on: oneYearLater.toISOString(),
										},
									]
								: certs,
					});
				},
				{ once: true }
			)
		);
		return config;
	}

	// eslint-disable-next-line no-unused-vars -- mock helper retained as scaffolding for skipped/todo or not-yet-ported tests
	function mockGetMTlsCertificate(resp: Partial<MTlsCertificateResponse> = {}) {
		const config = { calls: 0 };
		msw.use(
			http.get(
				"*/accounts/:accountId/mtls_certificates/:certId",
				async () => {
					config.calls++;

					return HttpResponse.json({
						success: true,
						errors: [],
						messages: [],
						result: {
							id: "1234",
							certificates: "BEGIN CERTIFICATE...",
							issuer: "example.com...",
							uploaded_on: now.toISOString(),
							expires_on: oneYearLater.toISOString(),
							...resp,
						},
					});
				},
				{ once: true }
			)
		);
		return config;
	}

	function mockDeleteMTlsCertificate() {
		const config = { calls: 0 };
		msw.use(
			http.delete(
				"*/accounts/:accountId/mtls_certificates/:certId",
				async () => {
					config.calls++;

					return HttpResponse.json({
						success: true,
						errors: [],
						messages: [],
						result: null,
					});
				},
				{ once: true }
			)
		);
		return config;
	}

	const now = new Date(2025, 1, 1);
	const oneYearLater = new Date(now);
	oneYearLater.setFullYear(now.getFullYear() + 1);

	describe("mtls-certificates", () => {
		// The original wrangler test exercises wrangler's `../api` helpers
		// (uploadMTlsCertificate, listMTlsCertificates, etc.). cf has no
		// equivalent in-process API surface — callers consume the
		// forge-generated SDK directly — so the entire `api` describe is
		// wrangler-only.
		describe.skip("api", () => {
			it("should call mtls_certificates upload endpoint", () => {});
			it("should fail to read cert and key files when missing", () => {});
			it("should read cert and key from disk and call mtls_certificates upload endpoint", () => {});
			it("should call mtls_certificates list endpoint", () => {});
			it("calls get mtls_certificates endpoint", () => {});
			it("calls list mtls_certificates endpoint with name", () => {});
			it("errors when a certificate cannot be found", () => {});
			it("errors when multiple certificates are found", () => {});
			it("calls delete mts_certificates endpoint", () => {});
		});

		describe("commands", () => {
			describe("help", () => {
				// cf's `mtls-certificates --help` text differs from
				// wrangler's `mtls-certificate --help` (different command
				// shape, different flags, different prose); the snapshot
				// is purely wrangler-specific.
				it.skip("should show the correct help text", () => {});
			});

			describe("upload", () => {
				it("uploads certificate and key from file", async ({ expect }) => {
					writeFileSync("cert.pem", "BEGIN CERTIFICATE...");
					writeFileSync("key.pem", "BEGIN PRIVATE KEY...");

					const mock = mockPostMTlsCertificate();

					await runWrangler(
						"mtls-certificates create --ca true --certificates @cert.pem --private-key @key.pem"
					);

					expect(mock.calls).toEqual(1);
					expect(std.err).toMatchInlineSnapshot(`""`);
					expect(JSON.parse(std.out)).toEqual({
						id: "1234",
						name: undefined,
						certificates: "BEGIN CERTIFICATE...",
						issuer: "example.com...",
						uploaded_on: now.toISOString(),
						expires_on: oneYearLater.toISOString(),
					});
				});

				it("uploads certificate and key from file with name", async ({
					expect,
				}) => {
					writeFileSync("cert.pem", "BEGIN CERTIFICATE...");
					writeFileSync("key.pem", "BEGIN PRIVATE KEY...");

					const mock = mockPostMTlsCertificate();

					await runWrangler(
						"mtls-certificates create --ca true --certificates @cert.pem --private-key @key.pem --name my-cert"
					);

					expect(mock.calls).toEqual(1);
					expect(std.err).toMatchInlineSnapshot(`""`);
					expect(JSON.parse(std.out)).toEqual({
						id: "1234",
						name: "my-cert",
						certificates: "BEGIN CERTIFICATE...",
						issuer: "example.com...",
						uploaded_on: now.toISOString(),
						expires_on: oneYearLater.toISOString(),
					});
				});
			});

			describe("list", () => {
				it("should list certificates", async ({ expect }) => {
					mockGetMTlsCertificates();

					await runWrangler("mtls-certificates list");

					expect(std.err).toMatchInlineSnapshot(`""`);
					expect(JSON.parse(std.out)).toEqual([
						{
							id: "1234",
							name: "cert one",
							certificates: "BEGIN CERTIFICATE...",
							issuer: "example.com...",
							uploaded_on: now.toISOString(),
							expires_on: oneYearLater.toISOString(),
						},
						{
							id: "5678",
							name: "cert two",
							certificates: "BEGIN CERTIFICATE...",
							issuer: "example.com...",
							uploaded_on: now.toISOString(),
							expires_on: oneYearLater.toISOString(),
						},
					]);
				});
			});

			describe("delete", () => {
				// wrangler accepts `--id`/`--name` and validates that exactly
				// one is provided. cf takes a positional `<mtlsCertificateId>`,
				// so the "must provide --id or --name" / "can't provide both"
				// validation paths have no cf analogue (a missing positional
				// becomes a yargs "Not enough non-option arguments" error).
				it.skip("should require --id or --name", () => {});
				it.skip("should require not providing --id and --name", () => {});

				it("should delete certificate by id", async ({ expect }) => {
					const deleteMock = mockDeleteMTlsCertificate();

					mockConfirm({
						text: `This permanently deletes the resource. Continue?`,
						result: true,
					});

					await runWrangler("mtls-certificates delete 1234");

					expect(deleteMock.calls).toEqual(1);
					expect(std.err).toMatchInlineSnapshot(`""`);
					expect(std.out).toMatchInlineSnapshot(`""`);
				});

				// wrangler resolves a name → id by listing all certificates
				// and matching `name`. cf's `delete` takes only the
				// positional id; there is no list-then-delete codepath, so
				// "delete by name", "name not found" and "multiple by name"
				// are all wrangler-only.
				it.skip("should delete certificate by name", () => {});
				it.skip("should not delete when certificate cannot be found by name", () => {});
				it.skip("should not delete when many certificates are found by name", () => {});

				it("should not delete when confirmation fails", async ({ expect }) => {
					const deleteMock = mockDeleteMTlsCertificate();

					mockConfirm({
						text: `This permanently deletes the resource. Continue?`,
						result: false,
					});

					await runWrangler("mtls-certificates delete 1234");

					expect(deleteMock.calls).toEqual(0);
					expect(std.err).toMatchInlineSnapshot(`""`);
					expect(std.out).toMatchInlineSnapshot(`""`);
				});
			});
		});
	});
});
