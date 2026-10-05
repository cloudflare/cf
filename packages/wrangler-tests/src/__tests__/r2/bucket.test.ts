import { writeFileSync } from "node:fs";
import { http, HttpResponse } from "msw";
// eslint-disable-next-line no-restricted-imports
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { clearDialogs, mockConfirm } from "../helpers/mock-dialogs";
import { useMockIsTTY } from "../helpers/mock-istty";
import { createFetchResult, msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

// The wrangler bucket suite tested wrangler-specific affordances
// layered on top of the R2 API: friendly `r2 bucket info`/`r2 bucket
// notification create` etc. wrappers, JSON-file readers for
// `lifecycle/cors/lock set`, prefix prompting for lock add, sippy
// provider/credential aliases, custom-domain confirm prompts,
// data-catalog wizards, and the wrangler config-write-back flow on
// `r2 bucket create`.
//
// cf has generic forge-generated commands for these endpoints —
// `cf r2 buckets {create,get,delete,list}`, plus subgroups for
// `cors`, `lifecycle` (only get/update), `locks`, `sippy`,
// `event-notifications`, `domains custom`, and `domains managed`.
// There is NO `r2 bucket update storage-class` (forge surface is
// `cf r2 buckets edit` with `--cf-r2-storage-class` header), no
// `r2 bucket catalog` namespace at all, and no wrangler-side
// translation between an enum like `--retention-days` and the API's
// `condition.maxAgeSeconds` field. Anything that exercised wrangler
// translation/wizard logic is marked `it.skip` with a short
// rationale; the small number of tests that map cleanly to a single
// generic API call have been ported.

describe("r2", () => {
	const std = mockConsoleMethods();

	runInTempDir();

	describe("bucket", () => {
		mockAccountId();
		mockApiToken();

		// Wrangler help-text snapshots are wrangler-specific (they list
		// wrangler subcommand names and the wrangler global flag set).
		// cf's help is exercised elsewhere.
		it.skip("should show help when the bucket command is passed", async () => {});
		it.skip("should show the correct help when an invalid command is passed", async () => {});

		describe("list", () => {
			it("should list buckets & check request inputs", async () => {
				const mockBuckets = [
					{
						name: "bucket-1-local-once",
						creation_date: "01-01-2001",
					},
					{
						name: "bucket-2-local-once",
						creation_date: "01-01-2001",
					},
				];
				msw.use(
					http.get(
						"*/accounts/:accountId/r2/buckets",
						async ({ request, params }) => {
							const { accountId } = params;
							expect(accountId).toEqual("some-account-id");
							expect(await request.text()).toEqual("");
							return HttpResponse.json(
								createFetchResult({
									buckets: mockBuckets,
								})
							);
						},
						{ once: true }
					)
				);

				await runWrangler(`r2 buckets list`);
				expect(JSON.parse(std.out)).toEqual({ buckets: mockBuckets });
			});

			// `r2 bucket list` with an invalid wrangler.jsonc next to the
			// project. cf doesn't read worker config so there's nothing to
			// test here — see AGENTS.md "cf does NOT read project worker
			// config".
			it.skip("should list buckets even if the local wrangler config is invalid", async () => {});
		});

		describe("info", () => {
			const bucketName = "my-bucket";

			beforeEach(() => {
				const bucketInfo = {
					name: bucketName,
					creation_date: "01-01-2001",
					location: "WNAM",
					storage_class: "Standard",
				};

				msw.use(
					http.get(
						"*/accounts/:accountId/r2/buckets/:bucketName",
						async ({ params }) => {
							const { accountId, bucketName: bucketParam } = params;
							expect(accountId).toEqual("some-account-id");
							expect(bucketParam).toEqual(bucketName);
							return HttpResponse.json(
								createFetchResult({
									...bucketInfo,
								})
							);
						},
						{ once: true }
					)
				);
			});

			it("should get information for the given bucket", async () => {
				// wrangler's `r2 bucket info` mapped to cf's `r2 buckets get`.
				await runWrangler(`r2 buckets get ${bucketName}`);
				const json = JSON.parse(std.out);
				expect(json.name).toBe(bucketName);
				expect(json.location).toBe("WNAM");
				expect(json.storage_class).toBe("Standard");
			});

			// cf's `r2 buckets get` always emits JSON; wrangler's
			// `--json` flag has no cf equivalent.
			it.skip("should output valid JSON format when --json flag is used", async () => {});
		});

		describe("create", () => {
			it("should error if no bucket name is given", async () => {
				const { setIsTTY } = useMockIsTTY();
				setIsTTY(false);
				// cf's `r2 buckets create` takes `--name` (no positional)
				// and prompts interactively if missing. In a non-TTY context
				// the prompt fails with the standard required-field error.
				await expect(
					runWrangler("r2 buckets create")
				).rejects.toThrowErrorMatchingInlineSnapshot(
					`[Error: --name is required. Pass --name <value> or run interactively.]`
				);
			});

			// cf's `r2 buckets create` accepts the bucket name only via
			// `--name` (forge schema: `name` is a body field, not a
			// positional). Trailing space-separated tokens become unknown
			// positional args and yargs rejects them.
			it("should error if the bucket to create contains spaces", async () => {
				await expect(
					runWrangler("r2 buckets create --name abc def ghi")
				).rejects.toThrowErrorMatchingInlineSnapshot(
					`[Error: Unknown commands: def, ghi]`
				);
			});

			// All four "should create a bucket …" tests below exercised
			// wrangler's config-write-back flow (writing the new bucket
			// into wrangler.json/wrangler.toml under r2_buckets, and the
			// "Would you like Wrangler to add it on your behalf?" prompt).
			// cf doesn't read or write worker config — see AGENTS.md.
			describe.skip.each(["wrangler.json", "wrangler.toml"])(
				"%s",
				(_configPath) => {
					it("should create a bucket & check request inputs", async () => {});
					it("should create a bucket with the expected jurisdiction", async () => {});
					it("should create a bucket with the expected default storage class", async () => {});
					it("should create a bucket with the expected location hint", async () => {});
				}
			);

			// Ported subset: simple shape of the POST request body for the
			// generic forge-generated `r2 buckets create` (without the
			// wrangler config-write-back wrapper).
			it("should send the expected POST body for a basic create", async () => {
				msw.use(
					http.post(
						"*/accounts/:accountId/r2/buckets",
						async ({ request, params }) => {
							const { accountId } = params;
							expect(accountId).toEqual("some-account-id");
							expect(await request.json()).toEqual({
								name: "test-bucket",
								storageClass: "Standard",
							});
							return HttpResponse.json(createFetchResult({}));
						},
						{ once: true }
					)
				);
				await runWrangler("r2 buckets create --name test-bucket");
			});

			it("should send the expected jurisdiction header", async () => {
				msw.use(
					http.post(
						"*/accounts/:accountId/r2/buckets",
						async ({ request, params }) => {
							const { accountId } = params;
							expect(accountId).toEqual("some-account-id");
							expect(request.headers.get("cf-r2-jurisdiction")).toEqual("eu");
							expect(await request.json()).toEqual({
								name: "test-bucket",
								storageClass: "Standard",
							});
							return HttpResponse.json(createFetchResult({}));
						},
						{ once: true }
					)
				);
				await runWrangler(
					"r2 buckets create --name test-bucket --cf-r2-jurisdiction eu"
				);
			});

			it("should send the expected storage class", async () => {
				msw.use(
					http.post(
						"*/accounts/:accountId/r2/buckets",
						async ({ request }) => {
							expect(await request.json()).toEqual({
								name: "test-bucket",
								storageClass: "InfrequentAccess",
							});
							return HttpResponse.json(createFetchResult({}));
						},
						{ once: true }
					)
				);
				await runWrangler(
					"r2 buckets create --name test-bucket --storage-class InfrequentAccess"
				);
			});

			it("should send the expected location hint", async () => {
				msw.use(
					http.post(
						"*/accounts/:accountId/r2/buckets",
						async ({ request }) => {
							expect(await request.json()).toEqual({
								name: "test-bucket",
								storageClass: "Standard",
								locationHint: "weur",
							});
							return HttpResponse.json(createFetchResult({}));
						},
						{ once: true }
					)
				);
				await runWrangler(
					"r2 buckets create --name test-bucket --location-hint weur"
				);
			});

			// cf's `r2 buckets create --storage-class` enforces the enum
			// at the yargs layer (not via API) — `Foo` is rejected before
			// hitting the network. wrangler's path was: API call → 10040
			// "JSON not well formed" → wrangler box-formatted error.
			it.skip("should error if storage class is invalid", async () => {});
		});

		describe("update", () => {
			// wrangler's `r2 bucket update storage-class <name> -s <class>`
			// is a wrapper around a PATCH that sets the
			// `cf-r2-storage-class` header. cf's equivalent is
			// `cf r2 buckets edit --cf-r2-storage-class …` — but it
			// requires the header as a flag and there's no friendly
			// "Updating bucket … to … default storage class" prose. The
			// shape is too different to port the snapshots; skip.
			it.skip("should error if invalid command is passed", async () => {});
			describe.skip("storage-class", () => {
				it("should error if storage class is missing", async () => {});
				it("should error if storage class is invalid", async () => {});
				it("should update the default storage class", async () => {});
			});
		});

		describe("delete", () => {
			it("should error if no bucket name is given", async () => {
				await expect(
					runWrangler("r2 buckets delete")
				).rejects.toThrowErrorMatchingInlineSnapshot(
					`[Error: Not enough non-option arguments: got 0, need at least 1]`
				);
			});

			// wrangler's bucket name validation (3-63 chars, lowercase
			// alphanumeric + hyphens, no leading/trailing dash) is
			// client-side. cf has no such guard — the API rejects bad
			// names with whatever 4xx it returns. These are wrangler-only.
			it.skip("should error if the bucket name contains invalid characters", async () => {});
			it.skip("should error if the bucket name starts with a dash", async () => {});
			it.skip("should error if the bucket name ends with a dash", async () => {});
			it.skip("should error if the bucket name is over 63 characters", async () => {});

			it("should error if the bucket name to delete contains spaces", async () => {
				await expect(
					runWrangler("r2 buckets delete abc def ghi")
				).rejects.toThrowErrorMatchingInlineSnapshot(
					`[Error: Unknown commands: def, ghi]`
				);
			});

			it("should delete a bucket specified by name & check requests inputs", async () => {
				const { setIsTTY } = useMockIsTTY();
				setIsTTY(false);
				msw.use(
					http.delete(
						"*/accounts/:accountId/r2/buckets/:bucketName",
						async ({ request, params }) => {
							const { accountId, bucketName } = params;
							expect(accountId).toEqual("some-account-id");
							expect(bucketName).toEqual("some-bucket");
							expect(await request.text()).toEqual("");
							expect(request.headers.get("authorization")).toEqual(
								"Bearer some-api-token"
							);

							return HttpResponse.json(createFetchResult(null));
						},
						{ once: true }
					)
				);
				// `--force` skips the cf delete-confirm prompt.
				await runWrangler(`r2 buckets delete some-bucket --force`);
			});
		});

		describe("sippy", () => {
			// cf's `r2 buckets sippy update` exposes the raw API shape:
			// `--source-provider`, `--source-bucket`, `--source-region`,
			// `--source-access-key-id`, `--source-secret-access-key`,
			// `--destination-access-key-id`,
			// `--destination-secret-access-key`,
			// `--destination-provider`. wrangler exposed friendlier
			// `--provider {AWS,GCS}`, `--bucket`, `--region`,
			// `--client-email`, `--private-key`, `--service-account-key-file`,
			// `--r2-access-key-id`, `--r2-secret-access-key` and folded
			// the GCS branch into the same flags. Also the API field names
			// the test asserts differ (`accessKeyId` vs the cf body shape).
			// Skipping the wrangler-flagged variants entirely.
			it.skip("should show the correct help when an invalid command is passed", async () => {});

			describe("enable", () => {
				// Wrangler-specific provider/credential aliases — cf has
				// neither the provider enum nor the GCS shorthand.
				it.skip("should enable sippy on AWS for the given bucket", async () => {});
				it.skip("should enable sippy on GCS for the given bucket", async () => {});
				it.skip("should error if no bucket name is given", async () => {});

				describe("validation errors", () => {
					// Wrangler validates its provider-specific convenience flags.
					// cf exposes the raw API source/destination fields, so these
					// exact flag-validation paths have no cf equivalent.
					it.skip(
						"should error when --provider is missing in non-interactive mode"
					);
					it.skip("should error when AWS --region is missing");
					it.skip("should error when AWS --bucket is missing");
					it.skip("should error when AWS --access-key-id is missing");
					it.skip("should error when AWS --secret-access-key is missing");
					it.skip("should error when AWS --r2-access-key-id is missing");
					it.skip("should error when AWS --r2-secret-access-key is missing");
					it.skip("should error when GCS --bucket is missing");
					it.skip("should error when GCS --client-email is missing");
					it.skip("should error when GCS --private-key is missing");
					it.skip("should error when GCS --r2-access-key-id is missing");
					it.skip("should error when GCS --r2-secret-access-key is missing");
				});
			});

			describe("disable", () => {
				it.skip("should error if no bucket name is given", async () => {});

				it("should disable Sippy for the given bucket", async () => {
					const { setIsTTY } = useMockIsTTY();
					setIsTTY(false);

					msw.use(
						http.delete(
							"*/accounts/some-account-id/r2/buckets/testBucket/sippy",
							async () => {
								return HttpResponse.json(createFetchResult({}));
							},
							{ once: true }
						)
					);
					// cf: `r2 buckets sippy delete <bucketName>` (DELETE
					// op; wrangler called this `sippy disable`). `--force`
					// skips the delete-confirm prompt.
					await runWrangler("r2 buckets sippy delete testBucket --force");
				});
			});

			describe("get", () => {
				it.skip("should error if no bucket name is given", async () => {});
			});

			it("should get the status of Sippy for the given bucket", async () => {
				const { setIsTTY } = useMockIsTTY();
				setIsTTY(false);

				msw.use(
					http.get(
						"*/accounts/:accountId/r2/buckets/:bucketName/sippy",
						async ({ request, params }) => {
							const { accountId } = params;
							expect(accountId).toEqual("some-account-id");
							expect(await request.text()).toEqual("");
							return HttpResponse.json(
								createFetchResult(
									"https://storage.googleapis.com/storage/v1/b/testBucket"
								)
							);
						},
						{ once: true }
					)
				);
				await runWrangler("r2 buckets sippy get testBucket");
				expect(JSON.parse(std.out)).toEqual(
					"https://storage.googleapis.com/storage/v1/b/testBucket"
				);
			});
		});

		// `r2 bucket catalog` is an entire wrangler-only namespace —
		// data catalog enable/disable/get + compaction +
		// snapshot-expiration. cf's data catalog surface lives under a
		// separate `cf r2-data-catalog` product (different commands, no
		// `--token` rewrite, no wrangler-style "warehouse not found"
		// branching). Treat as wrangler-only.
		describe.skip("catalog", () => {
			it("should show the correct help when an invalid command is passed", async () => {});
			describe("enable", () => {
				it("should enable R2 catalog for the given bucket", async () => {});
				it("should error if no bucket name is given", async () => {});
			});
			describe("disable", () => {
				it("should error if no bucket name is given", async () => {});
				it("should disable R2 catalog for the given bucket", async () => {});
				it("should inform user if the catalog was never enabled for the bucket", async () => {});
			});
			describe("get", () => {
				it("should error if no bucket name is given", async () => {});
				it("should get the catalog status for the given bucket", async () => {});
				it("should inform user if the catalog was never enabled for the bucket", async () => {});
			});
			describe("compaction", () => {
				it("should show the correct help when an invalid command is passed", async () => {});
				describe("enable", () => {
					it("should enable compaction for the catalog", async () => {});
					it("should error if no bucket name is given", async () => {});
					it("should error if --token is not provided for catalog-level", async () => {});
					it("should enable table compaction without token", async () => {});
					it("should enable table compaction with custom target size", async () => {});
					it("should error if only namespace is provided", async () => {});
					it("should error if only table is provided", async () => {});
				});
				describe("disable", () => {
					it("should error if no bucket name is given", async () => {});
					it("should disable compaction with confirmation", async () => {});
					it("should cancel disable when confirmation is rejected", async () => {});
					it("should disable table compaction when confirmed", async () => {});
					it("should cancel table compaction disable when rejected", async () => {});
				});
			});
			describe("snapshot-expiration", () => {
				it("should show the correct help when an invalid command is passed", async () => {});
				describe("enable", () => {
					it("should enable snapshot expiration for the catalog", async () => {});
					it("should enable snapshot expiration with custom values", async () => {});
					it("should error if no bucket name is given", async () => {});
					it("should enable table snapshot expiration", async () => {});
					it("should enable table snapshot expiration with custom values", async () => {});
					it("should error if token is missing for catalog-level operation", async () => {});
				});
				describe("disable", () => {
					it("should error if no bucket name is given", async () => {});
					it("should disable snapshot expiration with confirmation", async () => {});
					it("should cancel disable when confirmation is rejected", async () => {});
					it("should disable table snapshot expiration when confirmed", async () => {});
					it("should cancel table snapshot expiration disable when rejected", async () => {});
					it("should disable with --force flag without confirmation", async () => {});
				});
			});
		});

		describe("notification", () => {
			describe("list", () => {
				it("follows happy path as expected", async () => {
					const bucketName = "my-bucket";
					const queueId = "471537e8-6e5a-4163-a4d4-9478087c32c3";
					const queueName = "my-queue";
					msw.use(
						http.get(
							"*/accounts/:accountId/event_notifications/r2/:bucketName/configuration",
							async ({ request, params }) => {
								const { accountId, bucketName: bucketParam } = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketName).toEqual(bucketParam);
								expect(request.headers.get("authorization")).toEqual(
									"Bearer some-api-token"
								);
								const getResponse = {
									bucketName,
									queues: [
										{
											queueId: queueId,
											queueName,
											rules: [
												{
													ruleId: "8cdcce8a-89b3-474f-a087-3eb4fcacfa37",
													createdAt: "2024-09-05T01:02:03.000Z",
													prefix: "",
													suffix: "",
													actions: [
														"PutObject",
														"CompleteMultipartUpload",
														"CopyObject",
													],
												},
											],
										},
									],
								};
								return HttpResponse.json(createFetchResult(getResponse));
							},
							{ once: true }
						)
					);
					// cf: `r2 buckets event-notifications list --bucket-name <bucketName>`
					// (list ops have no subject positional; bucket comes
					// in as a flag).
					await runWrangler(
						`r2 buckets event-notifications list --bucket-name ${bucketName}`
					);
					const json = JSON.parse(std.out);
					expect(json.bucketName).toBe(bucketName);
					expect(json.queues[0].queueId).toBe(queueId);
				});

				// wrangler's "old API version" backwards-compat path
				// re-shapes the response into the new shape AND issues
				// a separate `GET /queues/:id` to look up the queue name
				// from the legacy queue-id-only payload. cf forwards the
				// API response verbatim, so neither the re-shape nor the
				// follow-up queue-name lookup happens.
				it.skip("is backwards compatible with old API version", async () => {});

				it("shows correct output on error", async () => {
					// cf's `event-notifications list` requires `--bucket-name`
					// (it's a list op, no positional). Without it, yargs
					// emits the standard "Missing required argument" error.
					await expect(
						runWrangler(`r2 buckets event-notifications list`)
					).rejects.toThrowErrorMatchingInlineSnapshot(
						`[Error: Missing required argument: bucket-name]`
					);
				});
			});

			describe("create", () => {
				// cf's `r2 buckets event-notifications update` is a PUT
				// against `/event_notifications/r2/:bucket/configuration/queues/:queueId`
				// — i.e. it expects the QUEUE UUID, not a queue NAME.
				// wrangler's `r2 bucket notification create` did:
				//   1. GET /queues?name=<queue> to resolve name → uuid
				//   2. translate `--event-types object-create object-delete`
				//      into the underlying `actions` action-list
				//   3. PUT the configuration
				// Step 1 (name resolution) and step 2 (event-type → actions
				// expansion) are both wrangler client logic with no cf
				// equivalent. Skipping the four happy-path variants.
				it.skip("follows happy path as expected", async () => {});
				it.skip("follows happy path as expected with prefix", async () => {});
				it.skip("follows happy path as expected with suffix", async () => {});
				it.skip("follows happy path as expected with description", async () => {});

				it("errors if required options are not provided", async () => {
					// cf's `r2 buckets event-notifications update` requires
					// `--bucket-name`; with only the queue-id positional it
					// errors. (Different shape from wrangler's `Missing
					// required arguments: event-types, queue` but same
					// intent.)
					await expect(
						runWrangler(
							"r2 buckets event-notifications update notification-test-001"
						)
					).rejects.toThrowErrorMatchingInlineSnapshot(
						`[Error: Missing required argument: bucket-name]`
					);
				});
			});

			describe("delete", () => {
				// Same name-resolution issue as create above: cf's
				// `event-notifications delete` URL takes a queueId UUID,
				// but wrangler accepted `--queue <name>` and resolved it.
				it.skip("follows happy path as expected without specified rules", async () => {});
				it.skip("follows happy path as expected with specified rules", async () => {});

				it("errors if required options are not provided", async () => {
					// cf's event-notifications delete requires `--bucket-name`
					// (not just `--queue` name). Without it the command
					// errors — shape differs from wrangler's `Missing
					// required argument: queue` but same intent.
					await expect(
						runWrangler(
							"r2 buckets event-notifications delete notification-test-001"
						)
					).rejects.toThrowErrorMatchingInlineSnapshot(
						`[Error: Missing required argument: bucket-name]`
					);
				});
			});
		});

		describe("domain", () => {
			const { setIsTTY } = useMockIsTTY();
			mockAccountId();
			mockApiToken();

			describe("get", () => {
				it("should get custom domain for the bucket as expected", async () => {
					const bucketName = "my-bucket";
					const domainName = "test.com";
					const mockDomain = {
						domain: domainName,
						enabled: false,
						status: {
							ownership: "pending",
							ssl: "pending",
						},
						minTLS: "1.0",
						zoneId: "zone-id-456",
						zoneName: "test-zone",
					};
					msw.use(
						http.get(
							"*/accounts/:accountId/r2/buckets/:bucketName/domains/custom/:domainName",
							async ({ params }) => {
								const {
									accountId,
									bucketName: bucketParam,
									domainName: domainParam,
								} = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketParam).toEqual(bucketName);
								expect(domainParam).toEqual(domainName);
								return HttpResponse.json(createFetchResult(mockDomain));
							},
							{ once: true }
						)
					);
					// cf: positional is the LAST path param (`<domain>`);
					// bucketName is `--bucket-name` flag.
					await runWrangler(
						`r2 buckets domains custom get ${domainName} --bucket-name ${bucketName}`
					);
					const json = JSON.parse(std.out);
					expect(json.domain).toBe(domainName);
					expect(json.minTLS).toBe("1.0");
				});
			});

			describe("add", () => {
				it("should add custom domain to the bucket as expected", async () => {
					const bucketName = "my-bucket";
					const domainName = "example.com";
					const zoneId = "zone-id-789";
					let capturedBody: Record<string, unknown> | undefined;
					msw.use(
						http.post(
							"*/accounts/:accountId/r2/buckets/:bucketName/domains/custom",
							async ({ params, request }) => {
								const { accountId, bucketName: bucketParam } = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketParam).toEqual(bucketName);
								capturedBody = (await request.json()) as Record<
									string,
									unknown
								>;
								return HttpResponse.json(
									createFetchResult({
										domain: domainName,
										enabled: true,
										minTLS: "1.0",
										zoneId,
									})
								);
							},
							{ once: true }
						)
					);
					// `--zone-id` is a body field (the zone of the custom
					// domain), not the request-context zone — it must be
					// accepted as a per-field flag and assembled into the
					// POST body as `zoneId`.
					await runWrangler(
						`r2 buckets domains custom create ${bucketName} --domain ${domainName} --enabled --zone-id ${zoneId}`
					);
					expect(capturedBody).toMatchObject({
						domain: domainName,
						enabled: true,
						zoneId,
					});
					const json = JSON.parse(std.out);
					expect(json.zoneId).toBe(zoneId);
				});

				it("should error if domain and zone-id are not provided", async () => {
					const bucketName = "my-bucket";
					setIsTTY(false);
					// cf prompts for `--domain` interactively; in non-TTY
					// context it throws the standard required-field error.
					await expect(
						runWrangler(`r2 buckets domains custom create ${bucketName}`)
					).rejects.toThrowErrorMatchingInlineSnapshot(
						`[Error: --domain is required. Pass --domain <value> or run interactively.]`
					);
				});
			});

			describe("list", () => {
				it("should list custom domains for a bucket as expected", async () => {
					const bucketName = "my-bucket";
					const mockDomains = [
						{
							domain: "example.com",
							enabled: true,
							status: {
								ownership: "verified",
								ssl: "active",
							},
							minTLS: "1.2",
							zoneId: "zone-id-123",
							zoneName: "example-zone",
						},
						{
							domain: "test.com",
							enabled: false,
							status: {
								ownership: "pending",
								ssl: "pending",
							},
							minTLS: "1.0",
							zoneId: "zone-id-456",
							zoneName: "test-zone",
						},
					];
					msw.use(
						http.get(
							"*/accounts/:accountId/r2/buckets/:bucketName/domains/custom",
							async ({ params }) => {
								const { accountId, bucketName: bucketParam } = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketParam).toEqual(bucketName);
								return HttpResponse.json(
									createFetchResult({
										domains: mockDomains,
									})
								);
							},
							{ once: true }
						)
					);
					// cf list ops have no positional; bucket comes in as
					// a flag.
					await runWrangler(
						`r2 buckets domains custom list --bucket-name ${bucketName}`
					);
					const json = JSON.parse(std.out);
					expect(json.domains).toEqual(mockDomains);
				});
			});

			describe("remove", () => {
				it("should remove a custom domain as expected", async () => {
					const bucketName = "my-bucket";
					const domainName = "example.com";
					setIsTTY(false);
					msw.use(
						http.delete(
							"*/accounts/:accountId/r2/buckets/:bucketName/domains/custom/:domainName",
							async ({ params }) => {
								const {
									accountId,
									bucketName: bucketParam,
									domainName: domainParam,
								} = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketParam).toEqual(bucketName);
								expect(domainParam).toEqual(domainName);
								return HttpResponse.json(createFetchResult({}));
							},
							{ once: true }
						)
					);
					// cf: positional is `<domain>`; bucketName is
					// `--bucket-name` flag. `--force` skips the cf
					// delete-confirm prompt.
					await runWrangler(
						`r2 buckets domains custom delete ${domainName} --bucket-name ${bucketName} --force`
					);
				});
			});

			describe("update", () => {
				it("should update a custom domain as expected", async () => {
					const bucketName = "my-bucket";
					const domainName = "example.com";
					msw.use(
						http.put(
							"*/accounts/:accountId/r2/buckets/:bucketName/domains/custom/:domainName",
							async ({ request, params }) => {
								const {
									accountId,
									bucketName: bucketParam,
									domainName: domainParam,
								} = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketParam).toEqual(bucketName);
								expect(domainParam).toEqual(domainName);
								const requestBody = await request.json();
								// cf's update sends camel-case `minTLS` per
								// the OpenAPI body shape. `--enabled` is not
								// passed and is correctly omitted from the
								// wire body (see test_bugs/
								// generator-fabricates-default-false-on-optional-booleans.md).
								expect(requestBody).toEqual({
									minTLS: "1.3",
								});
								return HttpResponse.json(createFetchResult({}));
							},
							{ once: true }
						)
					);
					// cf: positional is `<domain>`; bucketName is
					// `--bucket-name`.
					await runWrangler(
						`r2 buckets domains custom update ${domainName} --bucket-name ${bucketName} --min-tls 1.3`
					);
				});
			});
		});

		describe("dev-url", () => {
			const { setIsTTY } = useMockIsTTY();
			mockAccountId();
			mockApiToken();

			describe("get", () => {
				it("should retrieve the r2.dev URL of a bucket when public access is enabled", async () => {
					const bucketName = "my-bucket";
					const domainInfo = {
						bucketId: "bucket-id-123",
						domain: "pub-bucket-id-123.r2.dev",
						enabled: true,
					};
					msw.use(
						http.get(
							"*/accounts/:accountId/r2/buckets/:bucketName/domains/managed",
							async ({ params }) => {
								const { accountId, bucketName: bucketParam } = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketParam).toEqual(bucketName);
								return HttpResponse.json(createFetchResult({ ...domainInfo }));
							},
							{ once: true }
						)
					);
					// cf exposes this endpoint under `domains managed list`
					// (there is no `get` subcommand). The endpoint returns a
					// singleton, so the JSON output is the single domain object.
					await runWrangler(
						`r2 buckets domains managed list --bucket-name ${bucketName}`
					);
					const json = JSON.parse(std.out);
					expect(json).toEqual(domainInfo);
				});

				it("should show that public access is disabled when it is disabled", async () => {
					const bucketName = "my-bucket";
					const domainInfo = {
						bucketId: "bucket-id-123",
						domain: "pub-bucket-id-123.r2.dev",
						enabled: false,
					};
					msw.use(
						http.get(
							"*/accounts/:accountId/r2/buckets/:bucketName/domains/managed",
							async ({ params }) => {
								const { accountId, bucketName: bucketParam } = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketParam).toEqual(bucketName);
								return HttpResponse.json(createFetchResult({ ...domainInfo }));
							},
							{ once: true }
						)
					);
					await runWrangler(
						`r2 buckets domains managed list --bucket-name ${bucketName}`
					);
					const json = JSON.parse(std.out);
					expect(json.enabled).toBe(false);
				});
			});

			describe("enable", () => {
				it("should enable public access", async () => {
					const bucketName = "my-bucket";
					const domainInfo = {
						bucketId: "bucket-id-123",
						domain: "pub-bucket-id-123.r2.dev",
						enabled: true,
					};

					setIsTTY(false);
					msw.use(
						http.put(
							"*/accounts/:accountId/r2/buckets/:bucketName/domains/managed",
							async ({ request, params }) => {
								const { accountId, bucketName: bucketParam } = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketParam).toEqual(bucketName);
								const requestBody = await request.json();
								expect(requestBody).toEqual({ enabled: true });
								return HttpResponse.json(createFetchResult({ ...domainInfo }));
							},
							{ once: true }
						)
					);
					// cf: `r2 buckets domains managed update <bucketName> --enabled` (PUT)
					await runWrangler(
						`r2 buckets domains managed update ${bucketName} --enabled`
					);
				});
			});

			describe("disable", () => {
				it("should disable public access", async () => {
					const bucketName = "my-bucket";
					const domainInfo = {
						bucketId: "bucket-id-123",
						domain: "pub-bucket-id-123.r2.dev",
						enabled: false,
					};

					setIsTTY(false);
					msw.use(
						http.put(
							"*/accounts/:accountId/r2/buckets/:bucketName/domains/managed",
							async ({ request, params }) => {
								const { accountId, bucketName: bucketParam } = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketParam).toEqual(bucketName);
								const requestBody = await request.json();
								expect(requestBody).toEqual({ enabled: false });
								return HttpResponse.json(createFetchResult({ ...domainInfo }));
							},
							{ once: true }
						)
					);
					// yargs supports `--no-<bool>` negation natively.
					await runWrangler(
						`r2 buckets domains managed update ${bucketName} --no-enabled`
					);
				});
			});
		});

		describe("lifecycle", () => {
			mockAccountId();
			mockApiToken();

			describe("list", () => {
				it("should list lifecycle rules when they exist", async () => {
					const bucketName = "my-bucket";
					const lifecycleRules = [
						{
							id: "rule-1",
							enabled: true,
							conditions: { prefix: "images/" },
							deleteObjectsTransition: {
								condition: {
									type: "Age",
									maxAge: 2592000,
								},
							},
						},
					];
					msw.use(
						http.get(
							"*/accounts/:accountId/r2/buckets/:bucketName/lifecycle",
							async ({ params }) => {
								const { accountId, bucketName: bucketParam } = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketParam).toEqual(bucketName);
								return HttpResponse.json(
									createFetchResult({
										rules: lifecycleRules,
									})
								);
							},
							{ once: true }
						)
					);
					// cf: `r2 buckets lifecycle get <bucketName>` (only get + update;
					// no add/remove/list — those were wrangler-side helpers).
					await runWrangler(`r2 buckets lifecycle get ${bucketName}`);
					const json = JSON.parse(std.out);
					expect(json.rules).toEqual(lifecycleRules);
				});
			});

			// `r2 bucket lifecycle add` (and `remove`) are wrangler-side
			// helpers: GET existing rules → mutate in-memory → PUT. cf
			// only exposes `get` and `update` — the entire rules array
			// must be sent via `--body`. Translation needed (and a JSON
			// file → --body @path conversion) is out of scope here.
			describe.skip("add", () => {
				it("it should add an age lifecycle rule using command-line arguments", async () => {});
				it("it should add a date lifecycle rule using command-line arguments and id alias", async () => {});
			});
			describe.skip("remove", () => {
				it("should remove a lifecycle rule as expected", async () => {});
				it("should remove a lifecycle rule as expected with id alias", async () => {});
				it("should handle removing non-existent rule ID as expected", async () => {});
			});

			describe("set", () => {
				it("should set lifecycle configuration from a JSON file", async () => {
					const bucketName = "my-bucket";
					const lifecycleRules = {
						rules: [
							{
								id: "rule-1",
								enabled: true,
								conditions: {},
								deleteObjectsTransition: {
									condition: {
										type: "Age",
										maxAge: 2592000,
									},
								},
							},
						],
					};

					msw.use(
						http.put(
							"*/accounts/:accountId/r2/buckets/:bucketName/lifecycle",
							async ({ request, params }) => {
								const { accountId, bucketName: bucketParam } = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketName).toEqual(bucketParam);
								const requestBody = await request.json();
								expect(requestBody).toEqual({
									...lifecycleRules,
								});
								return HttpResponse.json(createFetchResult({}));
							},
							{ once: true }
						)
					);

					// cf: `r2 buckets lifecycle update <bucketName> --body '<json>'`
					// (JSON string must be single-quoted so shell-quote
					// preserves the braces and quotes.)
					writeFileSync(
						"lifecycle-configuration.json",
						JSON.stringify(lifecycleRules)
					);
					await runWrangler(
						`r2 buckets lifecycle update ${bucketName} --body @lifecycle-configuration.json`
					);
				});
			});
		});

		describe("cors", () => {
			mockAccountId();
			mockApiToken();

			describe("list", () => {
				it("should list CORS rules when they exist", async () => {
					const bucketName = "my-bucket";
					const corsRules = [
						{
							allowed: {
								origins: ["https://www.example.com"],
								methods: ["GET", "PUT"],
								headers: ["Content-Type", "Authorization"],
							},
							exposeHeaders: ["ETag", "Content-Length"],
							maxAgeSeconds: 8640,
						},
					];

					msw.use(
						http.get(
							"*/accounts/:accountId/r2/buckets/:bucketName/cors",
							async ({ params }) => {
								const { accountId, bucketName: bucketParam } = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketParam).toEqual(bucketName);
								return HttpResponse.json(
									createFetchResult({
										rules: corsRules,
									})
								);
							},
							{ once: true }
						)
					);
					// cf: `r2 buckets cors get <bucketName>` (no list — cors
					// is per-bucket, not multi-rule-list semantics).
					await runWrangler(`r2 buckets cors get ${bucketName}`);
					const json = JSON.parse(std.out);
					expect(json.rules).toEqual(corsRules);
				});
			});

			describe("set", () => {
				// AWS S3 format detection (`CORSRules` capital, PascalCase
				// keys) is wrangler client logic. cf forwards the body
				// verbatim — bad shapes get whatever 4xx the API returns.
				it.skip("should reject AWS S3 format with CORSRules key", async () => {});
				it.skip("should reject AWS S3 style PascalCase keys in rules", async () => {});

				it("should set CORS configuration from a JSON file", async () => {
					const bucketName = "my-bucket";
					const corsRules = {
						rules: [
							{
								allowed: {
									origins: ["https://www.example.com"],
									methods: ["GET", "PUT"],
									headers: ["Content-Type", "Authorization"],
								},
								exposeHeaders: ["ETag", "Content-Length"],
								maxAgeSeconds: 8640,
							},
						],
					};

					msw.use(
						http.put(
							"*/accounts/:accountId/r2/buckets/:bucketName/cors",
							async ({ request, params }) => {
								const { accountId, bucketName: bucketParam } = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketName).toEqual(bucketParam);
								const requestBody = await request.json();
								expect(requestBody).toEqual({
									...corsRules,
								});
								return HttpResponse.json(createFetchResult({}));
							},
							{ once: true }
						)
					);

					// cf: `r2 buckets cors update <bucketName> --body '<json>'`
					writeFileSync("cors-configuration.json", JSON.stringify(corsRules));
					await runWrangler(
						`r2 buckets cors update ${bucketName} --body @cors-configuration.json`
					);
				});
			});

			describe("delete", () => {
				it("should delete CORS configuration as expected", async () => {
					const bucketName = "my-bucket";
					const { setIsTTY } = useMockIsTTY();
					setIsTTY(false);
					msw.use(
						http.delete(
							"*/accounts/:accountId/r2/buckets/:bucketName/cors",
							async ({ params }) => {
								const { accountId, bucketName: bucketParam } = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketName).toEqual(bucketParam);
								return HttpResponse.json(createFetchResult({}));
							},
							{ once: true }
						)
					);
					// cf: `r2 buckets cors delete <bucketName> --force`
					await runWrangler(`r2 buckets cors delete ${bucketName} --force`);
				});
			});
		});

		describe("lock", () => {
			mockAccountId();
			mockApiToken();

			describe("list", () => {
				it("should list lock rules when they exist", async () => {
					const bucketName = "my-bucket";
					const lockRules = [
						{
							id: "rule-age",
							enabled: true,
							prefix: "images/age",
							condition: {
								type: "Age",
								maxAgeSeconds: 86400,
							},
						},
						{
							id: "rule-date",
							enabled: true,
							prefix: "images/date",
							condition: {
								type: "Date",
								date: 1738277955891,
							},
						},
						{
							id: "rule-indefinite",
							enabled: true,
							prefix: "images/indefinite",
							condition: {
								type: "Indefinite",
							},
						},
					];
					msw.use(
						http.get(
							"*/accounts/:accountId/r2/buckets/:bucketName/lock",
							async ({ params }) => {
								const { accountId, bucketName: bucketParam } = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketParam).toEqual(bucketName);
								return HttpResponse.json(
									createFetchResult({
										rules: lockRules,
									})
								);
							},
							{ once: true }
						)
					);
					// cf: `r2 buckets locks get <bucketName>` (note plural
					// `locks` — the only commands are get + update)
					await runWrangler(`r2 buckets locks get ${bucketName}`);
					const json = JSON.parse(std.out);
					expect(json.rules).toEqual(lockRules);
				});
			});

			// `r2 bucket lock add/remove` are wrangler-side helpers: GET
			// existing rules → mutate in-memory → PUT, with friendly
			// `--retention-days/--retention-date/--retention-indefinite`
			// flags, prefix prompting, and confirmation dialogs around
			// "lock all objects without a prefix". cf only exposes
			// `locks get` and `locks update` (the latter takes the full
			// rules array via `--body`).
			describe.skip("add", () => {
				it("it should add a lock rule without prefix using command-line arguments", async () => {});
				it("it should fail to add lock rule using command-line arguments without condition", async () => {});
				it("it should add an age lock rule using command-line arguments and id alias", async () => {});
				it("it should fail an age lock rule using command-line arguments with invalid age string", async () => {});
				it("it should fail an age lock rule using command-line arguments with invalid negative age", async () => {});
				it("it should add a date lock rule using command-line arguments", async () => {});
				it("it should fail to add an invalid date lock rule using command-line arguments if retention is not", async () => {});
				it("it should add an indefinite lock rule using command-line arguments", async () => {});
				it("it should add an indefinite lock rule using command-line arguments and prompt if not initially specified", async () => {});
				it("it should fail to add a lock rule if retenion is indefinite but false", async () => {});
				it("it should fail a lock rule without any command-line arguments", async () => {});
			});

			describe.skip("remove", () => {
				it("should remove a lock rule as expected", async () => {});
				it("should remove a lock rule as expected with id alias", async () => {});
				it("should handle removing non-existent rule ID as expected", async () => {});
			});

			describe("set", () => {
				it("should set lock configuration from a JSON file", async () => {
					const { setIsTTY } = useMockIsTTY();
					setIsTTY(false);
					const bucketName = "my-bucket";
					const lockRules = {
						rules: [
							{
								id: "rule-no-prefix-age",
								enabled: true,
								condition: {
									type: "Age",
									maxAgeSeconds: 86400,
								},
							},
							{
								id: "rule-with-prefix-indefinite",
								enabled: true,
								prefix: "prefix",
								condition: {
									type: "Indefinite",
								},
							},
						],
					};

					msw.use(
						http.put(
							"*/accounts/:accountId/r2/buckets/:bucketName/lock",
							async ({ request, params }) => {
								const { accountId, bucketName: bucketParam } = params;
								expect(accountId).toEqual("some-account-id");
								expect(bucketName).toEqual(bucketParam);
								const requestBody = await request.json();
								expect(requestBody).toEqual({
									...lockRules,
								});
								return HttpResponse.json(createFetchResult({}));
							},
							{ once: true }
						)
					);

					// cf: `r2 buckets locks update <bucketName> --body '<json>'`
					writeFileSync("lock-configuration.json", JSON.stringify(lockRules));
					await runWrangler(
						`r2 buckets locks update ${bucketName} --body @lock-configuration.json`
					);
				});
			});
		});
	});

	afterEach(() => {
		clearDialogs();
	});
});

// Suppress unused-import warnings — these helpers are kept available
// for future `it.todo`-style tests that need them but aren't currently
// in use.
void mockConfirm;
