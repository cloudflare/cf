import { writeFileSync } from "node:fs";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, it, test } from "vitest";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { mockConfirm } from "./helpers/mock-dialogs";
import { useMockIsTTY } from "./helpers/mock-istty";
import { msw } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";

// MTlsCertificateResponse mirrored locally — wrangler's `../api` module
// (programmatic upload/list/delete helpers) doesn't exist in cf. The
// tests in this file drive cf via `runWrangler` and the API responses
// are constructed inline.
interface MTlsCertificateResponse {
	id?: string;
	name?: string;
	certificates?: string;
	issuer?: string;
	uploaded_on?: string;
	expires_on?: string;
	ca?: boolean;
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

	function mockPostCaChainCertificate(
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
							ca: true,
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

	describe("cert", () => {
		// Wrangler-only: the entire `api/` module was a wrangler-internal
		// programmatic surface. cf goes through the SDK; there is no
		// equivalent importable helper module in the wrangler-tests package.
		describe.skip("api", () => {
			it.skip("should call mtls_certificates upload endpoint", async () => {});
			it.skip("should fail to read cert and key files when missing", async () => {});
			it.skip("should read cert and key from disk and call mtls_certificates upload endpoint", async () => {});
			it.skip("should fail to read ca cert when file is missing", async () => {});
			it.skip("should read ca cert from disk and call mtls_certificates upload endpoint", async () => {});
			it.skip("should call mtls_certificates list endpoint", async () => {});
			it.skip("calls get mtls_certificates endpoint", async () => {});
			it.skip("calls list mtls_certificates endpoint with name", async () => {});
			it.skip("errors when a certificate cannot be found", async () => {});
			it.skip("errors when multiple certificates are found", async () => {});
			it.skip("calls delete mts_certificates endpoint", async () => {});
		});

		describe("commands", () => {
			// Wrangler-only: the `cert` group label, the prose subcommands
			// (`cert upload`, `cert list`, `cert delete`), and the help
			// formatting are wrangler-specific. cf surfaces this product as
			// `mtls-certificates` and emits its own help layout.
			describe.skip("help", () => {
				it("should show the correct help text", () => {});
			});

			describe("upload", () => {
				test("uploads certificate and key from file", async ({ expect }) => {
					writeFileSync("cert.pem", "BEGIN CERTIFICATE...");
					writeFileSync("key.pem", "BEGIN PRIVATE KEY...");

					mockPostMTlsCertificate();

					await runWrangler(
						"mtls-certificates create --ca false --certificates @cert.pem --private-key @key.pem"
					);

					expect(std.err).toMatchInlineSnapshot(`""`);
					expect(std.out).toMatchInlineSnapshot(`
						"{
						  "id": "1234",
						  "certificates": "BEGIN CERTIFICATE...",
						  "issuer": "example.com...",
						  "uploaded_on": "2025-02-01T00:00:00.000Z",
						  "expires_on": "2026-02-01T00:00:00.000Z"
						}"
					`);
				});

				test("uploads certificate and key from file with name", async ({
					expect,
				}) => {
					writeFileSync("cert.pem", "BEGIN CERTIFICATE...");
					writeFileSync("key.pem", "BEGIN PRIVATE KEY...");

					mockPostMTlsCertificate();

					await runWrangler(
						"mtls-certificates create --ca false --certificates @cert.pem --private-key @key.pem --name my-cert"
					);

					expect(std.err).toMatchInlineSnapshot(`""`);
					expect(std.out).toMatchInlineSnapshot(`
						"{
						  "id": "1234",
						  "name": "my-cert",
						  "certificates": "BEGIN CERTIFICATE...",
						  "issuer": "example.com...",
						  "uploaded_on": "2025-02-01T00:00:00.000Z",
						  "expires_on": "2026-02-01T00:00:00.000Z"
						}"
					`);
				});

				test("uploads ca certificate chain from file", async ({ expect }) => {
					writeFileSync("caCert.pem", "BEGIN CERTIFICATE...");

					mockPostCaChainCertificate();

					await runWrangler(
						"mtls-certificates create --ca true --certificates @caCert.pem"
					);

					expect(std.err).toMatchInlineSnapshot(`""`);
					expect(std.out).toMatchInlineSnapshot(`
						"{
						  "id": "1234",
						  "certificates": "BEGIN CERTIFICATE...",
						  "issuer": "example.com...",
						  "uploaded_on": "2025-02-01T00:00:00.000Z",
						  "expires_on": "2026-02-01T00:00:00.000Z",
						  "ca": true
						}"
					`);
				});

				test("uploads ca certificate chain from file with name", async ({
					expect,
				}) => {
					writeFileSync("caCert.pem", "BEGIN CERTIFICATE...");

					mockPostCaChainCertificate();

					await runWrangler(
						"mtls-certificates create --ca true --certificates @caCert.pem --name my-caCert"
					);

					expect(std.err).toMatchInlineSnapshot(`""`);
					expect(std.out).toMatchInlineSnapshot(`
						"{
						  "id": "1234",
						  "name": "my-caCert",
						  "certificates": "BEGIN CERTIFICATE...",
						  "issuer": "example.com...",
						  "uploaded_on": "2025-02-01T00:00:00.000Z",
						  "expires_on": "2026-02-01T00:00:00.000Z",
						  "ca": true
						}"
					`);
				});
			});

			describe("list", () => {
				it("should list certificates", async ({ expect }) => {
					mockGetMTlsCertificates();

					await runWrangler("mtls-certificates list");

					expect(std.err).toMatchInlineSnapshot(`""`);
					expect(std.out).toMatchInlineSnapshot(`
						"[
						  {
						    "id": "1234",
						    "name": "cert one",
						    "certificates": "BEGIN CERTIFICATE...",
						    "issuer": "example.com...",
						    "uploaded_on": "2025-02-01T00:00:00.000Z",
						    "expires_on": "2026-02-01T00:00:00.000Z"
						  },
						  {
						    "id": "5678",
						    "name": "cert two",
						    "certificates": "BEGIN CERTIFICATE...",
						    "issuer": "example.com...",
						    "uploaded_on": "2025-02-01T00:00:00.000Z",
						    "expires_on": "2026-02-01T00:00:00.000Z"
						  }
						]"
					`);
				});
			});

			describe("delete", () => {
				// Wrangler-specific arg validation: cf's `mtls-certificates
				// delete` takes only a required positional <mtlsCertificateId>.
				// There is no `--id` / `--name` flag pair, so the
				// "must provide --id or --name" / "can't provide both" error
				// paths don't exist.
				it.skip("should require --id or --name", async () => {});
				it.skip("should require not providing --id and --name", async () => {});

				it("should delete certificate by id", async ({ expect }) => {
					// cf doesn't pre-fetch the cert before delete (wrangler did
					// to display the name in the confirm prompt). Just mock
					// the DELETE call. Per
					// test_bugs/delete-no-body-requires-body.md (Fixed/cf-only),
					// this DELETE no longer needs the `--body {}` workaround —
					// the generator's empty-body-schema detection lets the
					// no-body path through.
					mockDeleteMTlsCertificate();

					mockConfirm({
						text: `This permanently deletes the resource. Continue?`,
						result: true,
					});

					await runWrangler("mtls-certificates delete 1234");

					expect(std.err).toMatchInlineSnapshot(`""`);
					expect(std.out).toMatchInlineSnapshot(`""`);
				});

				// Wrangler-only: cf has no name→id resolution path on delete.
				// `mtls-certificates delete` takes a positional id; the user
				// must look up the id (e.g. via `mtls-certificates list`)
				// themselves.
				it.skip("should delete certificate by name", async () => {});
				it.skip("should not delete when certificate cannot be found by name", async () => {});
				it.skip("should not delete when many certificates are found by name", async () => {});

				it("should not delete when confirmation fails", async ({ expect }) => {
					const mock = mockDeleteMTlsCertificate();

					mockConfirm({
						text: `This permanently deletes the resource. Continue?`,
						result: false,
					});

					await runWrangler("mtls-certificates delete 1234");
					expect(std.err).toMatchInlineSnapshot(`""`);
					expect(std.out).toMatchInlineSnapshot(`""`);
					expect(mock.calls).toEqual(0);
				});
			});
		});
	});
});
