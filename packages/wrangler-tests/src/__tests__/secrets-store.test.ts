import {
	mockCreateDate,
	mockModifiedDate,
} from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it, vi } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { clearDialogs, mockConfirm } from "./helpers/mock-dialogs";
import { useMockIsTTY } from "./helpers/mock-istty";
import { createFetchResult, msw } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";

// Wrangler's `secrets-store` help screen lists wrangler's
// `secrets-store store|secret` subcommand surface and global flags. cf
// has its own help formatter that doesn't reproduce wrangler's text or
// flag listing.
describe.skip("secrets-store help", () => {});

describe("secrets-store stores commands", () => {
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

	// Store creation is no longer exposed by cf: the Forge overlay marks the
	// operation ignored. Keep the imported Wrangler scenarios documented.
	describe.skip("secrets-store stores create", () => {
		it("creates a store", async ({ expect }) => {
			const reqProm = mockStoreCreate();
			await runWrangler("secrets-store stores create --name test-store");

			await expect(reqProm).resolves.toMatchInlineSnapshot(`
				{
				  "name": "test-store",
				}
			`);

			expect(std.out).toMatchInlineSnapshot(`
				"{
				  "id": "8b9199cad1954bc39add51c948767679",
				  "account_id": "1b3ea6aa53af9903d51524c75900323a",
				  "name": "test-store",
				  "created": "Thu May 01 2025 00:00:00 GMT+0000 (Coordinated Universal Time)",
				  "modified": "Fri May 02 2025 00:00:00 GMT+0000 (Coordinated Universal Time)"
				}"
			`);
		});

		it("errors in creating a store when no name passed", async ({ expect }) => {
			// cf prompts for `--name` interactively. Force non-TTY so the
			// missing-flag path throws the error we can assert.
			setIsTTY(false);
			let err: undefined | Error;
			try {
				await runWrangler("secrets-store stores create");
			} catch (e) {
				err = e as Error;
			}
			expect(err?.message).toMatchInlineSnapshot(
				`"--name is required. Pass --name <value> or run interactively."`
			);
		});
	});

	describe("secrets-store stores list", () => {
		it("lists stores", async ({ expect }) => {
			mockStoreList();
			await runWrangler("secrets-store stores list");

			expect(std.out).toMatchInlineSnapshot(`
				"[
				  {
				    "id": "8686c49f762447988c02fd472f1fa82c",
				    "account_id": "1b3ea6aa53af9903d51524c75900323a",
				    "name": "test-store",
				    "created": "2025-05-01T00:00:00.000Z",
				    "modified": "2025-05-02T00:00:00.000Z"
				  },
				  {
				    "id": "8686c49f762447988c02fd472f1fa82d",
				    "account_id": "1b3ea6aa53af9903d51524c75900323a",
				    "name": "other-store",
				    "created": "2025-05-01T00:00:00.000Z",
				    "modified": "2025-05-02T00:00:00.000Z"
				  }
				]"
			`);
		});

		it("handles an empty response of stores", async ({ expect }) => {
			// Wrangler threw "List request returned no stores." for empty
			// list responses. cf treats an empty list as a successful
			// (empty) result and prints `[]` — there's no list-empty error
			// path to assert, so verify the output instead.
			mockStoreListEmpty();
			await runWrangler("secrets-store stores list");
			expect(std.out).toMatchInlineSnapshot(`"[]"`);
		});
	});
});

describe("secrets-store secrets commands", () => {
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

	describe("secrets-store secrets create", () => {
		// cf's `secrets-store secrets create` only accepts `--body` —
		// per-field flags (--name / --value / --scopes / --comment) are
		// not generated. Forge bug: the create method overlay should
		// expose a body schema so the generator emits the same per-field
		// flag treatment as `duplicate` and `edit`. Tracked in
		// `test_bugs/secrets-store-secrets-create-body-only.md`.
		it.todo("creates a secret");

		it("errors in creating a secret when no store-id passed", async ({
			expect,
		}) => {
			let err: undefined | Error;
			try {
				await runWrangler("secrets-store secrets create --body '[]'");
			} catch (e) {
				err = e as Error;
			}
			expect(err?.message).toMatchInlineSnapshot(
				`"Not enough non-option arguments: got 0, need at least 1"`
			);
		});

		// cf's `secrets-store secrets create` exposes only `--body` (see
		// it.todo above). The "missing --name" error path doesn't apply.
		// TODO: Re-enable once the forge bug for per-field flags on create is fixed.
		it.todo("errors in creating a secret when no name passed", async () => {});

		// cf's `secrets-store secrets create` exposes only `--body`. There's
		// no interactive secret-value prompt path to exercise — the user
		// supplies the entire request body via `--body` (or piped JSON).
		// TODO: Re-enable once the forge bug for per-field flags on create is fixed.
		it.todo("errors in creating a secret when no value passed", async () => {});

		// Same as above — `--scopes` isn't a per-field flag on cf's
		// create. Body validation is the API server's job.
		// TODO: Re-enable once the forge bug for per-field flags on create is fixed.
		it.todo("errors in creating a secret when no scopes passed", async () => {});
	});

	describe("secrets-store secrets list", () => {
		it("lists secrets", async ({ expect }) => {
			mockSecretList();
			await runWrangler(
				"secrets-store secrets list --store-id 850e0805c1084551bb46d150b5dfe414"
			);

			expect(std.out).toMatchInlineSnapshot(`
				"[
				  {
				    "id": "8b108ac1cf244f91a17964f585ffa707",
				    "store_id": "850e0805c1084551bb46d150b5dfe414",
				    "name": "SECRET_KEY",
				    "comment": "Key for Algolia search indexing",
				    "scopes": [
				      "workers"
				    ],
				    "created": "2025-05-01T00:00:00.000Z",
				    "modified": "2025-05-02T00:00:00.000Z",
				    "status": "active"
				  },
				  {
				    "id": "2821af4e600a446f87af4e9944b693c3",
				    "store_id": "850e0805c1084551bb46d150b5dfe414",
				    "name": "API_KEY",
				    "comment": "Key for DigitalOcean droplets",
				    "scopes": [
				      "workers"
				    ],
				    "created": "2025-05-01T00:00:00.000Z",
				    "modified": "2025-05-02T00:00:00.000Z",
				    "status": "active"
				  },
				  {
				    "id": "df3f6eb1159a4f10ac5fe836e2b8169c",
				    "store_id": "850e0805c1084551bb46d150b5dfe414",
				    "name": "DB_KEY",
				    "comment": "Key for PostgreSQL database",
				    "scopes": [
				      "workers"
				    ],
				    "created": "2025-05-01T00:00:00.000Z",
				    "modified": "2025-05-02T00:00:00.000Z",
				    "status": "active"
				  }
				]"
			`);
		});

		it("handles empty response of secrets", async ({ expect }) => {
			// Wrangler threw "List request returned no secrets." for empty
			// list responses. cf prints `[]` — verify the output instead.
			mockSecretListEmpty();
			await runWrangler(
				"secrets-store secrets list --store-id 850e0805c1084551bb46d150b5dfe414"
			);
			expect(std.out).toMatchInlineSnapshot(`"[]"`);
		});

		it("errors in listing secrets when no store-id passed", async ({
			expect,
		}) => {
			// cf's secrets list takes --store-id as a flag (not a
			// positional), so the missing-required-arg error wording
			// differs from wrangler.
			let err: undefined | Error;
			try {
				await runWrangler("secrets-store secrets list");
			} catch (e) {
				err = e as Error;
			}
			expect(err?.message).toMatchInlineSnapshot(`
				"Missing required argument: store-id"
			`);
		});
	});

	describe("secrets-store secrets get", () => {
		it("gets a secret", async ({ expect }) => {
			mockSecretGet();
			await runWrangler(
				"secrets-store secrets get df3f6eb1159a4f10ac5fe836e2b8169c --store-id 850e0805c1084551bb46d150b5dfe414"
			);

			expect(std.out).toMatchInlineSnapshot(`
				"{
				  "id": "df3f6eb1159a4f10ac5fe836e2b8169c",
				  "store_id": "850e0805c1084551bb46d150b5dfe414",
				  "name": "DB_KEY",
				  "comment": "Key for PostgreSQL database",
				  "scopes": [
				    "workers"
				  ],
				  "created": "2025-05-01T00:00:00.000Z",
				  "modified": "2025-05-02T00:00:00.000Z",
				  "status": "active"
				}"
			`);
		});

		it("errors in getting a secret when no store-id passed", async ({
			expect,
		}) => {
			let err: undefined | Error;
			try {
				await runWrangler(
					"secrets-store secrets get df3f6eb1159a4f10ac5fe836e2b8169c"
				);
			} catch (e) {
				err = e as Error;
			}
			expect(err?.message).toMatchInlineSnapshot(`
				"Missing required argument: store-id"
			`);
		});

		it("errors in getting a secret when no secret-id passed", async ({
			expect,
		}) => {
			// cf takes secretId as a positional, so the error wording is
			// "Not enough non-option arguments" rather than wrangler's
			// "Missing required argument: secret-id".
			let err: undefined | Error;
			try {
				await runWrangler(
					"secrets-store secrets get --store-id 850e0805c1084551bb46d150b5dfe414"
				);
			} catch (e) {
				err = e as Error;
			}
			expect(err?.message).toMatchInlineSnapshot(
				`"Not enough non-option arguments: got 0, need at least 1"`
			);
		});
	});

	describe("secrets-store secrets delete", () => {
		it("deletes a secret", async ({ expect }) => {
			const reqProm = mockSecretDelete();
			mockConfirm({
				text: "This permanently deletes the resource. Continue?",
				result: true,
			});
			await runWrangler(
				"secrets-store secrets delete df3f6eb1159a4f10ac5fe836e2b8169c --store-id 850e0805c1084551bb46d150b5dfe414"
			);

			// Verify the DELETE request was actually issued.
			await expect(reqProm).resolves.toBeUndefined();

			// cf returns null for empty delete responses; formatOutput
			// stays silent on stdout (writes ✓ to stderr only on TTYs,
			// suppressed here since std.err proxies a non-TTY stream).
			expect(std.out).toMatchInlineSnapshot(`""`);
		});

		it("errors in deleting a secret when no store-id passed", async ({
			expect,
		}) => {
			let err: undefined | Error;
			try {
				await runWrangler(
					"secrets-store secrets delete df3f6eb1159a4f10ac5fe836e2b8169c"
				);
			} catch (e) {
				err = e as Error;
			}
			expect(err?.message).toMatchInlineSnapshot(`
				"Missing required argument: store-id"
			`);
		});

		it("errors in deleting a secret when no secret-id passed", async ({
			expect,
		}) => {
			// cf takes secretId as a positional → "Not enough non-option
			// arguments" rather than wrangler's "Missing required
			// argument: secret-id".
			let err: undefined | Error;
			try {
				await runWrangler(
					"secrets-store secrets delete --store-id 850e0805c1084551bb46d150b5dfe414"
				);
			} catch (e) {
				err = e as Error;
			}
			expect(err?.message).toMatchInlineSnapshot(
				`"Not enough non-option arguments: got 0, need at least 1"`
			);
		});
	});

	// wrangler called this `update`; cf calls it `edit`.
	describe("secrets-store secrets edit", () => {
		it("updates a secret", async ({ expect }) => {
			// cf takes the value via `--value` directly — no
			// "do you want to update the value?" confirmation prompt and
			// no separate value-prompt step.
			const reqProm = mockSecretUpdate();
			await runWrangler(
				"secrets-store secrets edit " +
					"df3f6eb1159a4f10ac5fe836e2b8169c " +
					"--store-id 850e0805c1084551bb46d150b5dfe414 " +
					"--value shhhhhhh! " +
					"--scopes workers " +
					`--comment 'wrangler secret update'`
			);

			await expect(reqProm).resolves.toMatchInlineSnapshot(`
				{
				  "comment": "wrangler secret update",
				  "scopes": [
				    "workers",
				  ],
				  "value": "shhhhhhh!",
				}
			`);

			expect(std.out).toMatchInlineSnapshot(`
				"{
				  "id": "36dabbe4d01c49de82847b9a22673cbd",
				  "store_id": "850e0805c1084551bb46d150b5dfe414",
				  "name": "DB_KEY",
				  "comment": "wrangler secret update",
				  "scopes": [
				    "workers"
				  ],
				  "created": "2025-05-01T00:00:00.000Z",
				  "modified": "2025-05-02T00:00:00.000Z",
				  "status": "pending"
				}"
			`);
		});

		it("errors in updating a secret when no store-id passed", async ({
			expect,
		}) => {
			let err: undefined | Error;
			try {
				await runWrangler(
					"secrets-store secrets edit df3f6eb1159a4f10ac5fe836e2b8169c " +
						"--value shhhhhhh! " +
						"--scopes workers " +
						`--comment 'wrangler secret'`
				);
			} catch (e) {
				err = e as Error;
			}
			expect(err?.message).toMatchInlineSnapshot(`
				"Missing required argument: store-id"
			`);
		});

		it("errors in updating a secret when no secret-id passed", async ({
			expect,
		}) => {
			let err: undefined | Error;
			try {
				await runWrangler(
					"secrets-store secrets edit " +
						"--store-id 850e0805c1084551bb46d150b5dfe414 " +
						"--value shhhhhhh! " +
						"--scopes workers " +
						`--comment 'wrangler secret'`
				);
			} catch (e) {
				err = e as Error;
			}
			expect(err?.message).toMatchInlineSnapshot(
				`"Not enough non-option arguments: got 0, need at least 1"`
			);
		});

		// cf's `edit` doesn't require any of --value/--scopes/--comment.
		// Sending an empty PATCH body is permitted at the CLI layer; the
		// API decides what to do with it. Wrangler's "must pass one of
		// --value/--scopes/--comment" pre-flight check has no cf
		// equivalent, so the test has nothing to assert.
		it.skip("errors in updating a secret when no params to update are passed", async () => {});
	});

	describe("secrets-store secrets duplicate", () => {
		it("duplicates a secret", async ({ expect }) => {
			const reqProm = mockSecretDuplicate();
			await runWrangler(
				"secrets-store secrets duplicate " +
					"df3f6eb1159a4f10ac5fe836e2b8169c " +
					"--store-id 850e0805c1084551bb46d150b5dfe414 " +
					"--name DUPLICATE_KEY " +
					"--scopes workers " +
					`--comment 'wrangler secret update'`
			);

			await expect(reqProm).resolves.toMatchInlineSnapshot(`
				{
				  "comment": "wrangler secret update",
				  "name": "DUPLICATE_KEY",
				  "scopes": [
				    "workers",
				  ],
				}
			`);

			expect(std.out).toMatchInlineSnapshot(`
				"{
				  "id": "36dabbe4d01c49de82847b9a22673cbd",
				  "store_id": "850e0805c1084551bb46d150b5dfe414",
				  "name": "DB_KEY",
				  "comment": "wrangler secret update",
				  "scopes": [
				    "workers"
				  ],
				  "created": "2025-05-01T00:00:00.000Z",
				  "modified": "2025-05-02T00:00:00.000Z",
				  "status": "pending"
				}"
			`);
		});

		it("errors in duplicating a secret when no store-id passed", async ({
			expect,
		}) => {
			let err: undefined | Error;
			try {
				await runWrangler(
					"secrets-store secrets duplicate " +
						"df3f6eb1159a4f10ac5fe836e2b8169c " +
						"--name DUPLICATE_KEY " +
						"--scopes workers " +
						`--comment 'wrangler secret update'`
				);
			} catch (e) {
				err = e as Error;
			}
			expect(err?.message).toMatchInlineSnapshot(`
				"Missing required argument: store-id"
			`);
		});

		it("errors in duplicating a secret when no secret-id passed", async ({
			expect,
		}) => {
			let err: undefined | Error;
			try {
				await runWrangler(
					"secrets-store secrets duplicate " +
						"--store-id 850e0805c1084551bb46d150b5dfe414 " +
						"--name DUPLICATE_KEY " +
						"--scopes workers " +
						`--comment 'wrangler secret update'`
				);
			} catch (e) {
				err = e as Error;
			}
			expect(err?.message).toMatchInlineSnapshot(
				`"Not enough non-option arguments: got 0, need at least 1"`
			);
		});

		it("errors in duplicating a secret when no name passed", async ({
			expect,
		}) => {
			// cf prompts for --name interactively when missing. Force
			// non-TTY so the missing-flag error path is taken.
			setIsTTY(false);
			let err: undefined | Error;
			try {
				await runWrangler(
					"secrets-store secrets duplicate " +
						"df3f6eb1159a4f10ac5fe836e2b8169c " +
						"--store-id 850e0805c1084551bb46d150b5dfe414 " +
						"--scopes workers " +
						`--comment 'wrangler secret update'`
				);
			} catch (e) {
				err = e as Error;
			}
			expect(err?.message).toMatchInlineSnapshot(
				`"--name is required. Pass --name <value> or run interactively."`
			);
		});

		it("errors in duplicating a secret when no scopes passed", async ({
			expect,
		}) => {
			let err: undefined | Error;
			try {
				await runWrangler(
					"secrets-store secrets duplicate " +
						"df3f6eb1159a4f10ac5fe836e2b8169c " +
						"--store-id 850e0805c1084551bb46d150b5dfe414 " +
						"--name DUPLICATE_KEY " +
						`--comment 'wrangler secret update'`
				);
			} catch (e) {
				err = e as Error;
			}
			expect(err?.message).toMatchInlineSnapshot(
				`"--scopes is required (or pass --body with this field set)."`
			);
		});
	});
});

/** Create a mock handler for Secrets Store API POST /stores */
function mockStoreCreate(): Promise<{ name: string }> {
	return new Promise((resolve) => {
		msw.use(
			http.post(
				"*/accounts/some-account-id/secrets_store/stores",
				async ({ request }) => {
					const reqBody = (await request.json()) as { name: string };

					resolve(reqBody);

					return HttpResponse.json(
						createFetchResult(
							{
								id: "8b9199cad1954bc39add51c948767679",
								account_id: "1b3ea6aa53af9903d51524c75900323a",
								name: reqBody.name,
								created: mockCreateDate.toString(),
								modified: mockModifiedDate.toString(),
							},
							true
						)
					);
				},
				{ once: true }
			)
		);
	});
}

/** Create a mock handler for Secrets Store API GET /stores */
function mockStoreList() {
	msw.use(
		http.get(
			"*/accounts/some-account-id/secrets_store/stores",
			async () => {
				return HttpResponse.json(
					createFetchResult(
						[
							{
								id: "8686c49f762447988c02fd472f1fa82c",
								account_id: "1b3ea6aa53af9903d51524c75900323a",
								name: "test-store",
								created: mockCreateDate.toISOString(),
								modified: mockModifiedDate.toISOString(),
							},
							{
								id: "8686c49f762447988c02fd472f1fa82d",
								account_id: "1b3ea6aa53af9903d51524c75900323a",
								name: "other-store",
								created: mockCreateDate.toISOString(),
								modified: mockModifiedDate.toISOString(),
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

/** Create a mock handler for Secrets Store API GET /stores (response empty) */
function mockStoreListEmpty() {
	msw.use(
		http.get(
			"*/accounts/some-account-id/secrets_store/stores",
			async () => {
				return HttpResponse.json(createFetchResult([], true));
			},
			{ once: true }
		)
	);
}

/** Create a mock handler for Secrets Store API GET /secrets */
function mockSecretList() {
	msw.use(
		http.get(
			"*/accounts/some-account-id/secrets_store/stores/850e0805c1084551bb46d150b5dfe414/secrets",
			async () => {
				return HttpResponse.json(
					createFetchResult(
						[
							{
								id: "8b108ac1cf244f91a17964f585ffa707",
								store_id: "850e0805c1084551bb46d150b5dfe414",
								name: "SECRET_KEY",
								comment: "Key for Algolia search indexing",
								scopes: ["workers"],
								created: mockCreateDate.toISOString(),
								modified: mockModifiedDate.toISOString(),
								status: "active",
							},
							{
								id: "2821af4e600a446f87af4e9944b693c3",
								store_id: "850e0805c1084551bb46d150b5dfe414",
								name: "API_KEY",
								comment: "Key for DigitalOcean droplets",
								scopes: ["workers"],
								created: mockCreateDate.toISOString(),
								modified: mockModifiedDate.toISOString(),
								status: "active",
							},
							{
								id: "df3f6eb1159a4f10ac5fe836e2b8169c",
								store_id: "850e0805c1084551bb46d150b5dfe414",
								name: "DB_KEY",
								comment: "Key for PostgreSQL database",
								scopes: ["workers"],
								created: mockCreateDate.toISOString(),
								modified: mockModifiedDate.toISOString(),
								status: "active",
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

/** Create a mock handler for Secrets Store API GET /secrets (response is empty) */
function mockSecretListEmpty() {
	msw.use(
		http.get(
			"*/accounts/some-account-id/secrets_store/stores/850e0805c1084551bb46d150b5dfe414/secrets",
			async () => {
				return HttpResponse.json(createFetchResult([], true));
			},
			{ once: true }
		)
	);
}

/** Create a mock handler for Secrets Store API GET /secrets/:id */
function mockSecretGet() {
	msw.use(
		http.get(
			"*/accounts/some-account-id/secrets_store/stores/850e0805c1084551bb46d150b5dfe414/secrets/df3f6eb1159a4f10ac5fe836e2b8169c",
			async () => {
				return HttpResponse.json(
					createFetchResult(
						{
							id: "df3f6eb1159a4f10ac5fe836e2b8169c",
							store_id: "850e0805c1084551bb46d150b5dfe414",
							name: "DB_KEY",
							comment: "Key for PostgreSQL database",
							scopes: ["workers"],
							created: mockCreateDate.toISOString(),
							modified: mockModifiedDate.toISOString(),
							status: "active",
						},
						true
					)
				);
			},
			{ once: true }
		)
	);
}

/** Create a mock handler for Secrets Store API DELETE /secrets/:id */
function mockSecretDelete(): Promise<void> {
	return new Promise((resolve) => {
		msw.use(
			http.delete(
				"*/accounts/some-account-id/secrets_store/stores/850e0805c1084551bb46d150b5dfe414/secrets/df3f6eb1159a4f10ac5fe836e2b8169c",
				async () => {
					resolve();
					return HttpResponse.json(createFetchResult(null, true));
				},
				{ once: true }
			)
		);
	});
}

/** Create a mock handler for Secrets Store API PATCH /secrets/:id */
function mockSecretUpdate(): Promise<Record<string, unknown>> {
	return new Promise((resolve) => {
		msw.use(
			http.patch(
				"*/accounts/some-account-id/secrets_store/stores/850e0805c1084551bb46d150b5dfe414/secrets/df3f6eb1159a4f10ac5fe836e2b8169c",
				async ({ request }) => {
					const reqBody = (await request.json()) as Record<string, unknown>;
					resolve(reqBody);

					return HttpResponse.json(
						createFetchResult(
							{
								id: "36dabbe4d01c49de82847b9a22673cbd",
								store_id: "850e0805c1084551bb46d150b5dfe414",
								name: "DB_KEY",
								comment: reqBody.comment,
								scopes: reqBody.scopes,
								created: mockCreateDate.toISOString(),
								modified: mockModifiedDate.toISOString(),
								status: "pending",
							},
							true
						)
					);
				},
				{ once: true }
			)
		);
	});
}

/** Create a mock handler for Secrets Store API POST /secrets/:id/duplicate */
function mockSecretDuplicate(): Promise<Record<string, unknown>> {
	return new Promise((resolve) => {
		msw.use(
			http.post(
				"*/accounts/some-account-id/secrets_store/stores/850e0805c1084551bb46d150b5dfe414/secrets/df3f6eb1159a4f10ac5fe836e2b8169c/duplicate",
				async ({ request }) => {
					const reqBody = (await request.json()) as Record<string, unknown>;
					resolve(reqBody);

					return HttpResponse.json(
						createFetchResult(
							{
								id: "36dabbe4d01c49de82847b9a22673cbd",
								store_id: "850e0805c1084551bb46d150b5dfe414",
								name: "DB_KEY",
								comment: reqBody.comment,
								scopes: reqBody.scopes,
								created: mockCreateDate.toISOString(),
								modified: mockModifiedDate.toISOString(),
								status: "pending",
							},
							true
						)
					);
				},
				{ once: true }
			)
		);
	});
}
