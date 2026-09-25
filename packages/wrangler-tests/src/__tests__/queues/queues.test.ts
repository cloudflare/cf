import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { clearDialogs, mockConfirm } from "../helpers/mock-dialogs";
import { useMockIsTTY } from "../helpers/mock-istty";
import { msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";
import type { PostTypedConsumerBody, QueueResponse } from "./mock-utils";
import type { ExpectStatic } from "vite-plus/test";

describe("wrangler", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const std = mockConsoleMethods();

	const { setIsTTY } = useMockIsTTY();
	beforeEach(() => {
		setIsTTY(true);
	});
	afterEach(() => {
		clearDialogs();
	});

	describe("queues", () => {
		const expectedQueueId = "queueId";
		const expectedConsumerId = "consumerId";
		const expectedQueueName = "testQueue";

		// cf has its own help layout; the wrangler banner-style snapshots
		// don't translate.
		it.skip("should show the correct help text", async () => {});

		describe("list", () => {
			function mockListRequest(expect: ExpectStatic, queues: QueueResponse[]) {
				const requests = { count: 0 };
				msw.use(
					http.get(
						"*/accounts/:accountId/queues",
						async ({ request }) => {
							requests.count += 1;
							expect(await request.text()).toEqual("");
							return HttpResponse.json({
								success: true,
								errors: [],
								messages: [],
								result: queues,
							});
						},
						{ once: true }
					)
				);
				return requests;
			}

			it.skip("should show the correct help text", async () => {});

			it("should list queues on page 1 with no --page", async ({ expect }) => {
				const expectedQueues: QueueResponse[] = [
					{
						queue_id: "5e1b9969eb974d8c99c48d19df104c7a",
						queue_name: "queue-1",
						created_on: "01-01-2001",
						modified_on: "01-01-2001",
						producers: [],
						producers_total_count: 0,
						consumers: [],
						consumers_total_count: 0,
						settings: {
							delivery_delay: 0,
						},
					},
					{
						queue_id: "def19fa3787741579c9088eb850474af",
						queue_name: "queue-2",
						created_on: "01-01-2001",
						modified_on: "01-01-2001",
						producers: [],
						producers_total_count: 0,
						consumers: [],
						consumers_total_count: 0,
						settings: {
							delivery_delay: 0,
						},
					},
				];
				const requests = mockListRequest(expect, expectedQueues);
				await runWrangler("queues list");

				expect(std.err).toMatchInlineSnapshot(`""`);
				expect(JSON.parse(std.out)).toEqual(expectedQueues);
				expect(requests.count).toEqual(1);
			});

			// cf's `queues list` doesn't accept a --page flag and doesn't
			// auto-paginate. See `test_bugs/list-no-pagination.md`.
			it.todo("should list queues using --page=2");
		});

		describe("create", () => {
			function mockCreateRequest(
				expect: ExpectStatic,
				queueName: string,
				queueSettings?: {
					delivery_delay?: number;
					message_retention_period?: number;
				}
			) {
				const requests = { count: 0 };

				msw.use(
					http.post(
						"*/accounts/:accountId/queues",
						async ({ request }) => {
							requests.count += 1;

							const body = (await request.json()) as {
								queue_name: string;
								settings?: {
									delivery_delay?: number;
									message_retention_period?: number;
								};
							};
							expect(body.queue_name).toEqual(queueName);
							expect(body.settings).toEqual(queueSettings);
							return HttpResponse.json({
								success: true,
								errors: [],
								messages: [],
								result: {
									queue_name: queueName,
									created_on: "01-01-2001",
									modified_on: "01-01-2001",
								},
							});
						},
						{ once: true }
					)
				);
				return requests;
			}

			it.skip("should show the correct help text", async () => {});

			// cf doesn't read or write Wrangler config files (see
			// AGENTS.md "cf does NOT read project worker config"), so the
			// describe.each(["wrangler.json", "wrangler.toml"]) cohort
			// covering the config-update-on-create flow has no cf
			// equivalent. The basic create call is exercised by the
			// dedicated tests below.
			it("should create a queue", async ({ expect }) => {
				const requests = mockCreateRequest(expect, "testQueue");
				await runWrangler("queues create --queue-name testQueue");
				expect(requests.count).toEqual(1);
			});

			// cf's `queues create` doesn't expose --settings-*
			// flags; the wrangler create-time settings flags only
			// have a cf equivalent through --body. The
			// --queue-name flag is also passed as a workaround for
			// the required-field-runs-before-body forge bug
			// documented in `test_bugs/queues-create-missing-settings-flags.md`.
			it.todo("should send queue settings with delivery delay");

			// yargs returns one of the values for repeated single-value
			// flags (the last one wins) rather than rejecting them — cf
			// inherits that behaviour. The wrangler-specific
			// "expects a single value, but received multiple" guard
			// doesn't exist on cf.
			it.skip("should show an error when two delivery delays are set", async () => {});

			// Wrangler had bespoke client-side range validation
			// (`Must be between 0 and 86400`). cf passes the value to
			// the API and lets the server respond with an error.
			it.skip("should show an error when invalid delivery delay is set", async () => {});

			it.todo("should send queue settings with message retention period");

			it.skip("should show an error when two message retention periods are set", async () => {});
			it.skip("should show an error when invalid message retention period is set", async () => {});
		});

		describe("update", () => {
			function mockUpdateRequest(
				expect: ExpectStatic,
				queueId: string,
				queueSettings:
					| { delivery_delay?: number; message_retention_period?: number }
					| undefined
			) {
				const requests = { count: 0 };

				// cf calls PATCH for `queues edit`. For `queues update`
				// it calls PUT. The wrangler test asserted PATCH, so we
				// test against `cf queues edit` which is the closest
				// semantic match (partial update).
				msw.use(
					http.patch(
						"*/accounts/:accountId/queues/:queueId",
						async ({ request, params }) => {
							requests.count += 1;
							expect(params.queueId).toEqual(queueId);
							const body = (await request.json()) as {
								settings?: {
									delivery_delay?: number;
									message_retention_period?: number;
								};
							};
							if (queueSettings) {
								expect(body.settings).toMatchObject(queueSettings);
							}
							return HttpResponse.json({
								success: true,
								errors: [],
								messages: [],
								result: {
									queue_name: "testQueue",
									created_on: "01-01-2001",
									modified_on: "01-01-2001",
								},
							});
						},
						{ once: true }
					)
				);
				return requests;
			}

			it.skip("should show the correct help text", async () => {});

			// cf addresses queues by id; the wrangler "preserve old
			// delivery delay" test relied on a list-then-update flow
			// where wrangler GET'd to look up settings, merged, and
			// PATCH'd. cf takes the queue id directly and only sends
			// the settings explicitly passed.
			it("should update a queue with new message retention period and preserve old delivery delay", async ({
				expect,
			}) => {
				const requests = mockUpdateRequest(expect, expectedQueueId, {
					message_retention_period: 400,
				});
				await runWrangler(
					`queues edit ${expectedQueueId} --settings-message-retention-period=400`
				);
				expect(requests.count).toEqual(1);
			});

			it.skip("should show an error when two message retention periods are set", async () => {});
			it.skip("should show an error when two delivery delays are set", async () => {});
			it.skip("should show an error when invalid delivery delay is set", async () => {});
			it.skip("should show an error when invalid message retention period is set", async () => {});
		});

		describe("delete", () => {
			function mockDeleteRequest(expect: ExpectStatic, queueId: string) {
				const requests = { count: 0 };
				msw.use(
					http.delete(
						"*/accounts/:accountId/queues/:queueId",
						async ({ params }) => {
							requests.count += 1;
							expect(params.queueId).toEqual(queueId);
							expect(params.accountId).toEqual("some-account-id");
							return HttpResponse.json({
								success: true,
								errors: [],
								messages: [],
								result: {},
							});
						},
						{ once: true }
					)
				);
				return requests;
			}

			it.skip("should show the correct help text", async () => {});

			it("should delete a queue", async ({ expect }) => {
				const deleteRequest = mockDeleteRequest(expect, expectedQueueId);

				mockConfirm({
					text: "This permanently deletes the resource. Continue?",
					result: true,
				});
				await runWrangler(`queues delete ${expectedQueueId}`);
				expect(deleteRequest.count).toEqual(1);
			});

			// cf's `queues delete` takes a queue id positional and goes
			// straight to DELETE. Wrangler's name-resolution flow
			// (GET-list to look up id, then 404-style "Queue X does not
			// exist. To create it, run: …" copy) has no cf equivalent.
			it.skip("should show error when a queue doesn't exist", async () => {});
		});

		describe("consumers", () => {
			it.skip("should show the correct help text", async () => {});

			describe("add", () => {
				function mockPostRequest(
					expect: ExpectStatic,
					queueId: string,
					expectedBody: PostTypedConsumerBody
				) {
					const requests = { count: 0 };
					msw.use(
						http.post(
							"*/accounts/:accountId/queues/:queueId/consumers",
							async ({ request, params }) => {
								requests.count += 1;
								expect(params.queueId).toEqual(queueId);
								expect(params.accountId).toEqual("some-account-id");
								const body = (await request.json()) as PostTypedConsumerBody;
								expect(body.script_name).toEqual(expectedBody.script_name);
								expect(body.type).toEqual(expectedBody.type);
								expect(body.dead_letter_queue).toEqual(
									expectedBody.dead_letter_queue
								);
								// cf's --settings-* flags map to a `settings`
								// nested object; flags omitted on the
								// command line are absent from the body
								// (whereas wrangler always sent the full
								// shape with `undefined` values).
								expect(body.settings).toEqual(expectedBody.settings);
								return HttpResponse.json({
									success: true,
									errors: [],
									messages: [],
									result: {},
								});
							},
							{ once: true }
						)
					);
					return requests;
				}

				it.skip("should show the correct help text", async () => {});

				it("should add a consumer using defaults", async ({ expect }) => {
					// cf only sends `--settings-*` keys that are
					// explicitly supplied; with no settings flags, the
					// `settings` block is absent from the body
					// (whereas wrangler always sent `settings: {…undefined}`).
					const expectedBody: PostTypedConsumerBody = {
						script_name: "testScript",
						type: "worker",
						settings: undefined as unknown as PostTypedConsumerBody["settings"],
					};
					const postRequest = mockPostRequest(
						expect,
						expectedQueueId,
						expectedBody
					);
					await runWrangler(
						`queues consumers create ${expectedQueueId} --type worker --script-name testScript`
					);

					expect(postRequest.count).toEqual(1);
				});

				it("should add a consumer using custom values", async ({ expect }) => {
					const expectedBody: PostTypedConsumerBody = {
						script_name: "testScript",
						type: "worker",
						settings: {
							batch_size: 20,
							max_retries: 3,
							max_wait_time_ms: 10000,
							max_concurrency: 3,
							retry_delay: 10,
						},
						dead_letter_queue: "myDLQ",
					};
					const postRequest = mockPostRequest(
						expect,
						expectedQueueId,
						expectedBody
					);

					await runWrangler(
						`queues consumers create ${expectedQueueId} --type worker --script-name testScript --settings-batch-size 20 --settings-max-wait-time-ms 10000 --settings-max-retries 3 --settings-max-concurrency 3 --dead-letter-queue myDLQ --settings-retry-delay 10`
					);
					expect(postRequest.count).toEqual(1);
				});

				it("should add a consumer with batchTimeout of 0", async ({
					expect,
				}) => {
					const expectedBody: PostTypedConsumerBody = {
						script_name: "testScript",
						type: "worker",
						settings: {
							batch_size: 20,
							max_retries: 3,
							max_wait_time_ms: 0,
							max_concurrency: 3,
							retry_delay: 10,
						},
						dead_letter_queue: "myDLQ",
					};
					const postRequest = mockPostRequest(
						expect,
						expectedQueueId,
						expectedBody
					);

					await runWrangler(
						`queues consumers create ${expectedQueueId} --type worker --script-name testScript --settings-batch-size 20 --settings-max-wait-time-ms 0 --settings-max-retries 3 --settings-max-concurrency 3 --dead-letter-queue myDLQ --settings-retry-delay 10`
					);
					expect(postRequest.count).toEqual(1);
				});

				it.skip("should show an error when two retry delays are set", async () => {});

				// cf addresses by id (no name→id resolution), so the
				// wrangler "queue does not exist" error path is gone.
				it.skip("should show an error when queue does not exist", async () => {});

				it.skip("should show link to dash when not enabled", async () => {});
			});

			describe("delete", () => {
				function mockDeleteRequest(
					expect: ExpectStatic,
					queueId: string,
					consumerId: string
				) {
					const requests = { count: 0 };

					msw.use(
						http.delete(
							"*/accounts/:accountId/queues/:queueId/consumers/:consumerId",
							async ({ params }) => {
								requests.count++;
								expect(params.accountId).toBe("some-account-id");
								expect(params.queueId).toBe(queueId);
								expect(params.consumerId).toBe(consumerId);
								return HttpResponse.json(
									{
										success: true,
										errors: [],
										messages: [],
										result: {},
									},
									{ status: 200 }
								);
							},
							{ once: true }
						)
					);

					return requests;
				}

				it.skip("should show the correct help text", async () => {});

				// cf's `queues consumers delete` takes a consumer id
				// positional plus a `--queue-id` flag — both ids must
				// be known up front. The wrangler "name does not
				// exist" surface has no cf equivalent.
				it.skip("should show an error when queue does not exist", async () => {});

				describe("when script consumers are in use", () => {
					it("should delete the correct consumer", async ({ expect }) => {
						const deleteRequest = mockDeleteRequest(
							expect,
							expectedQueueId,
							expectedConsumerId
						);
						mockConfirm({
							text: "This permanently deletes the resource. Continue?",
							result: true,
						});
						await runWrangler(
							`queues consumers delete ${expectedConsumerId} --queue-id ${expectedQueueId}`
						);
						expect(deleteRequest.count).toEqual(1);
					});

					// cf doesn't list-then-delete — it requires both
					// queue id and consumer id from the user, so
					// "non-existing consumer" surfaces only at the
					// API layer (not as a wrangler-style "no
					// consumer 'X' exists" preflight error).
					it.skip("should show error when deleting a non-existing consumer", async () => {});
				});

				describe("when service consumers are in use", () => {
					// All four "service consumer with env" tests rely on
					// wrangler's list-then-delete flow that filters by
					// matching `service` + `environment` and resolves
					// the correct consumer_id. cf takes consumer_id
					// directly so none of this branching is exercised.
					it.skip("should delete a consumer with env set", async () => {});
					it.skip("should show error when deleting a non-matching environment", async () => {});
					it.skip("should delete a consumer without env set", async () => {});

					describe("when multiple consumers are set", () => {
						it.skip("should delete default environment consumer without env set", async () => {});
						it.skip("should delete matching consumer with env set", async () => {});
						it.skip("should show error when deleting on a non-matching environment", async () => {});
					});
				});
			});
		});

		describe("http_pull consumers", () => {
			it.skip("should show the correct help text", async () => {});

			describe("add", () => {
				function mockPostRequest(
					expect: ExpectStatic,
					queueId: string,
					expectedBody: PostTypedConsumerBody
				) {
					const requests = { count: 0 };
					msw.use(
						http.post(
							"*/accounts/:accountId/queues/:queueId/consumers",
							async ({ request, params }) => {
								requests.count += 1;
								expect(params.queueId).toEqual(queueId);
								expect(params.accountId).toEqual("some-account-id");
								const body = (await request.json()) as PostTypedConsumerBody;
								expect(body.type).toEqual(expectedBody.type);
								expect(body.dead_letter_queue).toEqual(
									expectedBody.dead_letter_queue
								);
								expect(body.settings).toEqual(expectedBody.settings);
								return HttpResponse.json({
									success: true,
									errors: [],
									messages: [],
									result: {},
								});
							},
							{ once: true }
						)
					);
					return requests;
				}

				it.skip("should show the correct help text", async () => {});

				it("should add a consumer using defaults", async ({ expect }) => {
					const expectedBody: PostTypedConsumerBody = {
						type: "http_pull",
						settings: undefined as unknown as PostTypedConsumerBody["settings"],
					};
					const postRequest = mockPostRequest(
						expect,
						expectedQueueId,
						expectedBody
					);

					await runWrangler(
						`queues consumers create ${expectedQueueId} --type http_pull`
					);
					expect(postRequest.count).toEqual(1);
				});

				// Fixed: queues-consumers-create-missing-visibility-timeout.
				// Forge now deep-merges the `settings` object across the
				// worker/http_pull oneOf variants, so the http_pull-only
				// `--settings-visibility-timeout-ms` flag is surfaced on
				// `queues consumers create`. The body-assembly path emits
				// it under `settings.visibility_timeout_ms`.
				it("should add a consumer using custom values", async ({ expect }) => {
					const expectedBody: PostTypedConsumerBody = {
						type: "http_pull",
						dead_letter_queue: "myDLQ",
						settings: {
							batch_size: 20,
							max_retries: 3,
							visibility_timeout_ms: 6000,
							retry_delay: 3,
						},
					};
					const postRequest = mockPostRequest(
						expect,
						expectedQueueId,
						expectedBody
					);

					await runWrangler(
						`queues consumers create ${expectedQueueId} --type http_pull --settings-batch-size 20 --settings-max-retries 3 --settings-visibility-timeout-ms 6000 --settings-retry-delay 3 --dead-letter-queue myDLQ`
					);
					expect(postRequest.count).toEqual(1);
				});
			});

			describe("delete", () => {
				function mockDeleteRequest(
					expect: ExpectStatic,
					queueId: string,
					consumerId: string
				) {
					const requests = { count: 0 };
					msw.use(
						http.delete(
							"*/accounts/:accountId/queues/:queueId/consumers/:consumerId",
							async ({ params }) => {
								requests.count++;
								expect(params.accountId).toBe("some-account-id");
								expect(params.queueId).toBe(queueId);
								expect(params.consumerId).toBe(consumerId);
								return HttpResponse.json(
									{
										success: true,
										errors: [],
										messages: [],
										result: {},
									},
									{ status: 200 }
								);
							},
							{ once: true }
						)
					);

					return requests;
				}

				it.skip("should show the correct help text", async () => {});

				it("should delete a pull consumer", async ({ expect }) => {
					const deleteRequest = mockDeleteRequest(
						expect,
						expectedQueueId,
						expectedConsumerId
					);
					mockConfirm({
						text: "This permanently deletes the resource. Continue?",
						result: true,
					});
					await runWrangler(
						`queues consumers delete ${expectedConsumerId} --queue-id ${expectedQueueId}`
					);
					expect(deleteRequest.count).toEqual(1);
				});
			});
		});

		describe("info", () => {
			// cf's `queues get` takes a queue id positional. Wrangler's
			// `queues info <name>` resolved name → id via list-then-fetch
			// and rendered a curated text view. cf returns the raw API
			// JSON. The wrangler test cases were assertions on the
			// curated text shape, which has no cf equivalent.
			it.skip("should return the documentation for the info command when using the --help param", async () => {});

			it("should return queue info with worker producers when the queue has workers configured as producers", async ({
				expect,
			}) => {
				const mockQueue = {
					queue_id: "1234567",
					queue_name: expectedQueueName,
					created_on: "2024-05-20T14:43:56.70498Z",
					producers: [
						{
							namespace: "testnamespace",
							script: "test-producer1",
							type: "worker",
						},
					],
					consumers: [
						{
							dead_letter_queue: "testdlq",
							settings: { batch_size: 10 },
							consumer_id: "111",
							type: "worker",
							script: "test-consumer",
						},
					],
					producers_total_count: 1,
					consumers_total_count: 1,
					modified_on: "2024-07-19T14:43:56.70498Z",
				};
				const requests = { count: 0 };
				msw.use(
					http.get(
						"*/accounts/:accountId/queues/:queueId",
						async ({ params }) => {
							requests.count += 1;
							expect(params.queueId).toEqual("1234567");
							return HttpResponse.json({
								success: true,
								errors: [],
								messages: [],
								result: mockQueue,
							});
						},
						{ once: true }
					)
				);
				await runWrangler("queues get 1234567");
				expect(requests.count).toEqual(1);
				expect(JSON.parse(std.out)).toEqual(mockQueue);
			});

			it.skip('should return "http consumer" and a curl command when the consumer type is http_pull', async () => {});
			it.skip("should return the list of r2 bucket producers when the queue is used in an r2 event notification", async () => {});
		});
	});

	// cf has no `queues pause-delivery` / `queues resume-delivery`
	// dedicated commands. The behaviour is exposed via
	// `cf queues edit <queueId> --settings-delivery-paused=<bool>`,
	// but the wrangler test asserted the dedicated subcommands that
	// don't exist in cf.
	describe("pause-delivery", () => {
		it.skip("should show the correct help text", async () => {});
		it.skip("should update the queue's delivery_paused setting", async () => {});
	});

	describe("resume-delivery", () => {
		it.skip("should show the correct help text", async () => {});
		it.skip("should update the queue's delivery_paused setting to false", async () => {});
	});

	describe("purge", () => {
		const expectedQueueId = "queueId";
		beforeEach(() => {
			setIsTTY(false);
		});

		function mockPurgeRequest(expect: ExpectStatic) {
			const requests = { count: 0 };

			msw.use(
				http.post(
					"*/accounts/:accountId/queues/:queueId/purge",
					async ({ request }) => {
						requests.count += 1;

						const body = (await request.json()) as {
							delete_messages_permanently?: boolean;
						};
						// cf's `queues purge start` exposes a boolean
						// `--delete-messages-permanently` flag; it's
						// always serialised into the request body when
						// set.
						expect(body.delete_messages_permanently).toEqual(true);
						return HttpResponse.json({
							success: true,
							errors: [],
							messages: [],
							result: {
								started_on: "01-01-2001",
								complete: false,
							},
						});
					},
					{ once: true }
				)
			);
			return requests;
		}

		it.skip("should show the correct help text", async () => {});

		// Fixed: queues-purge-no-force-rename. `queues purge start` is a
		// generic destructive confirm op (x-forge-require-confirmation).
		// In non-interactive mode without --force, confirmDelete aborts
		// and the handler returns WITHOUT firing the API call — the
		// CI-friendly "pass --force to confirm" message is written via
		// process.stderr.write (not console.*), so it's invisible to
		// mockConsoleMethods. Asserting the no-API-call side-effect +
		// empty stdout is the observable behaviour.
		//
		// (The companion wrangler "type-the-queue-name" confirmation path
		// — `rejects invalid confirmation in interactive mode` below —
		// stays skipped; cf has no typed-name confirmation.)
		it("rejects a missing --force flag in non-interactive mode", async ({
			expect,
		}) => {
			setIsTTY(false);
			const requests = mockPurgeRequest(expect);
			await runWrangler(
				`queues purge start ${expectedQueueId} --delete-messages-permanently`
			);
			expect(requests.count).toEqual(0);
			expect(std.out).toEqual("");
		});

		it("allows purge with the --force flag in non-interactive mode", async ({
			expect,
		}) => {
			setIsTTY(false);
			const requests = mockPurgeRequest(expect);
			await runWrangler(
				`queues purge start ${expectedQueueId} --delete-messages-permanently --force`
			);
			expect(requests.count).toEqual(1);
		});

		it("allows purge with the --force flag in interactive mode", async ({
			expect,
		}) => {
			setIsTTY(true);
			const requests = mockPurgeRequest(expect);
			// --force bypasses the confirm prompt entirely; if the
			// prompt fires anyway, mockConfirm would error since none
			// is mocked.
			await runWrangler(
				`queues purge start ${expectedQueueId} --delete-messages-permanently --force`
			);
			expect(requests.count).toEqual(1);
		});

		it.skip("rejects invalid confirmation in interactive mode", async () => {});

		it("allows purge with correct confirmation in interactive mode", async ({
			expect,
		}) => {
			setIsTTY(true);
			const requests = mockPurgeRequest(expect);
			// `queues purge start` is annotated with
			// `x-forge-require-confirmation: 'This operation drops every
			// message in the queue.'`. The forge message is surfaced
			// verbatim in the confirm prompt instead of the generic
			// "Delete <noun>?" wording.
			mockConfirm({
				text: `This operation drops every message in the queue. Continue?`,
				result: true,
			});
			await runWrangler(
				`queues purge start ${expectedQueueId} --delete-messages-permanently`
			);
			expect(requests.count).toEqual(1);
		});
	});
});
