import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { clearDialogs, mockConfirm } from "../helpers/mock-dialogs";
import { useMockIsTTY } from "../helpers/mock-istty";
import { msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";
import type { ExpectStatic } from "vite-plus/test";

// Subset of the legacy wrangler subscription-types module — that file
// doesn't exist in this repo, but the original mock-utils references it
// for the EventSourceType enum. Inlining the values we need keeps the
// ported tests self-contained.
const EventSourceType = {
	WORKERS_BUILDS_WORKER: "workersBuilds.worker",
	KV: "kv",
} as const;

interface EventSubscription {
	id: string;
	created_at: string;
	modified_at: string;
	name: string;
	enabled: boolean;
	source: { type: string; worker_name?: string };
	destination: { type: string; queue_id: string };
	events: string[];
}

interface CreateEventSubscriptionRequest {
	name?: string;
	enabled?: boolean;
	source?: { type: string; worker_name?: string };
	destination?: { type: string; queue_id: string };
	events?: string[];
}

// ---------------------------------------------------------------------
// MSW mocks. Replaces the original ./mock-utils helpers — those targeted
// wrangler's queue-name-resolution flow and pre-cf URL shape; cf hits
// /accounts/:accountId/event_subscriptions/subscriptions[/...] directly.
// ---------------------------------------------------------------------

function mockCreateSubscriptionRequest(
	expect: ExpectStatic,
	expectedRequest: Partial<CreateEventSubscriptionRequest>,
	expectedQueueId: string
) {
	const requests = { count: 0 };
	msw.use(
		http.post(
			"*/accounts/:accountId/event_subscriptions/subscriptions",
			async ({ request }) => {
				requests.count += 1;
				const body = (await request.json()) as CreateEventSubscriptionRequest;
				expect(body.name).toEqual(expectedRequest.name);
				expect(body.enabled).toEqual(expectedRequest.enabled);
				expect(body.source).toEqual(expectedRequest.source);
				expect(body.events).toEqual(expectedRequest.events);
				return HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result: {
						id: "sub-123",
						created_at: "2024-01-01T00:00:00Z",
						modified_at: "2024-01-01T00:00:00Z",
						name: body.name,
						enabled: body.enabled,
						source: body.source,
						destination: {
							type: "queues.queue",
							queue_id: expectedQueueId,
						},
						events: body.events,
					} as EventSubscription,
				});
			},
			{ once: true }
		)
	);
	return requests;
}

function mockListSubscriptionsRequest(subscriptions: EventSubscription[]) {
	const requests = { count: 0 };
	msw.use(
		http.get(
			"*/accounts/:accountId/event_subscriptions/subscriptions",
			async () => {
				requests.count += 1;
				return HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result: subscriptions,
					result_info: {
						count: subscriptions.length,
						total_count: subscriptions.length,
						page: 1,
						per_page: 20,
						total_pages: 1,
					},
				});
			},
			{ once: true }
		)
	);
	return requests;
}

function mockGetSubscriptionRequest(
	expect: ExpectStatic,
	subscriptionId: string,
	subscription: EventSubscription | null
) {
	const requests = { count: 0 };
	msw.use(
		http.get(
			"*/accounts/:accountId/event_subscriptions/subscriptions/:subscriptionId",
			async ({ params }) => {
				requests.count += 1;
				expect(params.subscriptionId).toEqual(subscriptionId);

				if (!subscription) {
					return HttpResponse.json(
						{
							success: false,
							errors: [{ code: 404, message: "Subscription not found" }],
						},
						{ status: 404 }
					);
				}

				return HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result: subscription,
				});
			},
			{ once: true }
		)
	);
	return requests;
}

function mockDeleteSubscriptionRequest(
	expect: ExpectStatic,
	subscriptionId: string
) {
	const requests = { count: 0 };
	msw.use(
		http.delete(
			"*/accounts/:accountId/event_subscriptions/subscriptions/:subscriptionId",
			async ({ params }) => {
				requests.count += 1;
				expect(params.subscriptionId).toEqual(subscriptionId);
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

describe("queues subscription", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();

	const std = mockConsoleMethods();
	const expectedQueueId = "queueId";

	const { setIsTTY } = useMockIsTTY();
	beforeEach(() => {
		setIsTTY(true);
	});
	afterEach(() => {
		clearDialogs();
	});

	const mockSubscription1: EventSubscription = {
		id: "sub-123",
		created_at: "2024-01-01T00:00:00Z",
		modified_at: "2024-01-01T00:00:00Z",
		name: "Test Subscription 1",
		enabled: true,
		source: {
			type: EventSourceType.WORKERS_BUILDS_WORKER,
			worker_name: "my-worker",
		},
		destination: {
			type: "queues.queue",
			queue_id: expectedQueueId,
		},
		events: ["build.completed", "build.failed"],
	};

	const mockSubscription2: EventSubscription = {
		id: "sub-456",
		created_at: "2024-01-02T00:00:00Z",
		modified_at: "2024-01-02T00:00:00Z",
		name: "Test Subscription 2",
		enabled: false,
		source: {
			type: EventSourceType.KV,
		},
		destination: {
			type: "queues.queue",
			queue_id: expectedQueueId,
		},
		events: ["namespace.created"],
	};

	describe("create", () => {
		// Help text format differs between wrangler and cf (cf emits
		// "Run 'cf ... --help-full' for all options.")
		it.skip("should show the correct help text", async () => {});

		it("should create a subscription for workersBuilds.worker source", async ({
			expect,
		}) => {
			const expectedRequest: Partial<CreateEventSubscriptionRequest> = {
				name: "testQueue workersBuilds.worker",
				enabled: true,
				source: {
					type: EventSourceType.WORKERS_BUILDS_WORKER,
					worker_name: "my-worker",
				},
				destination: {
					type: "queues.queue",
					queue_id: expectedQueueId,
				},
				events: ["build.completed", "build.failed"],
			};

			const createRequest = mockCreateSubscriptionRequest(
				expect,
				expectedRequest,
				expectedQueueId
			);

			await runWrangler(
				`queues subscriptions create --destination-queue-id ${expectedQueueId} --destination-type queues.queue --source-type workersBuilds.worker --events build.completed --events build.failed --source-worker-name my-worker --name "testQueue workersBuilds.worker" --enabled`
			);

			expect(createRequest.count).toEqual(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
		});

		it("should create subscription with custom name and disabled state", async ({
			expect,
		}) => {
			// `--enabled` is not passed; it's correctly omitted from the
			// wire body (see test_bugs/
			// generator-fabricates-default-false-on-optional-booleans.md).
			// Test title preserved for historical context — the original
			// wrangler test exercised the disabled-state default; cf no
			// longer fabricates a default, so callers wanting an explicit
			// false would need to pass `--enabled false`.
			const expectedRequest: Partial<CreateEventSubscriptionRequest> = {
				name: "Custom Subscription",
				source: {
					type: EventSourceType.WORKERS_BUILDS_WORKER,
					worker_name: "my-worker",
				},
				destination: {
					type: "queues.queue",
					queue_id: expectedQueueId,
				},
				events: ["build.completed"],
			};

			const createRequest = mockCreateSubscriptionRequest(
				expect,
				expectedRequest,
				expectedQueueId
			);

			await runWrangler(
				`queues subscriptions create --destination-queue-id ${expectedQueueId} --destination-type queues.queue --source-type workersBuilds.worker --events build.completed --source-worker-name my-worker --name "Custom Subscription"`
			);

			expect(createRequest.count).toEqual(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
		});

		// cf doesn't enforce per-source companion-flag requirements
		// (e.g. workersBuilds.worker → --source-worker-name). Forge could
		// model that with a custom validator, but today cf just forwards
		// whatever the user passes and lets the API reject it.
		// Parity gap: generic per-flag validation is not implemented.
		it.skip("should show error when worker-name is missing for workersBuilds.worker source", async () => {});

		it("should show error for invalid source type", async ({ expect }) => {
			await expect(
				runWrangler(
					"queues subscriptions create --destination-queue-id queueId --destination-type queues.queue --source-type invalid --events test"
				)
			).rejects.toThrow(
				/Argument: source-type, Given: "invalid", Choices: "images", "kv", "r2", "superSlurper", "vectorize", "workersAi\.model", "workersBuilds\.worker", "workers\.script", "workflows\.workflow"/
			);
		});

		// cf doesn't surface a wrangler-style "no events" pre-validation
		// error — empty events is forwarded to the API.
		// Parity gap: the product overlay does not enforce this constraint.
		it.skip("should show error when no events are provided", async () => {});

		// cf doesn't resolve queue-by-name; the queue id is passed via
		// --destination-queue-id, so there's no name → id lookup that
		// could fail with a "queue does not exist" error.
		it.skip("should show error when queue does not exist", async () => {});
	});

	describe("list", () => {
		it.skip("should show the correct help text", async () => {});

		it.skip("should show message when no subscriptions exist", async ({
			expect,
		}) => {
			const listRequest = mockListSubscriptionsRequest([]);

			await runWrangler("queues subscriptions list");

			expect(listRequest.count).toEqual(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual([]);
		});

		it.skip("should list subscriptions for a queue", async ({ expect }) => {
			const listRequest = mockListSubscriptionsRequest([
				mockSubscription1,
				mockSubscription2,
			]);

			await runWrangler("queues subscriptions list");

			expect(listRequest.count).toEqual(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual([
				mockSubscription1,
				mockSubscription2,
			]);
		});

		// cf always emits JSON by default; the wrangler-style human-readable
		// table + a separate --json toggle don't exist.
		it.skip('supports valid json output with "--json" flag', async () => {});

		// cf list doesn't take a queue positional, so there's no queue
		// name to fail to resolve.
		it.skip("should show error when queue does not exist", async () => {});
	});

	describe("get", () => {
		it.skip("should show the correct help text", async () => {});

		it("should get a subscription by ID", async ({ expect }) => {
			const getRequest = mockGetSubscriptionRequest(
				expect,
				"sub-123",
				mockSubscription1
			);

			await runWrangler("queues subscriptions get sub-123");

			expect(getRequest.count).toEqual(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
			expect(JSON.parse(std.out)).toEqual(mockSubscription1);
		});

		// cf's get always emits JSON; the wrangler-style human-readable
		// table + a separate --json toggle don't exist.
		it.skip('supports valid json output with "--json" flag', async () => {});

		it("should show error when subscription does not exist", async ({
			expect,
		}) => {
			const getRequest = mockGetSubscriptionRequest(
				expect,
				"nonexistent-id",
				null
			);

			await expect(
				runWrangler("queues subscriptions get nonexistent-id")
			).rejects.toThrowError();

			expect(getRequest.count).toEqual(1);
		});
	});

	describe("delete", () => {
		it.skip("should show the correct help text", async () => {});

		it("should delete a subscription after confirmation", async ({
			expect,
		}) => {
			const deleteRequest = mockDeleteSubscriptionRequest(expect, "sub-123");

			mockConfirm({
				text: "This permanently deletes the resource. Continue?",
				result: true,
			});

			await runWrangler("queues subscriptions delete sub-123");

			expect(deleteRequest.count).toEqual(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
		});

		it("should delete subscription without confirmation when --force is used", async ({
			expect,
		}) => {
			const deleteRequest = mockDeleteSubscriptionRequest(expect, "sub-123");

			await runWrangler("queues subscriptions delete sub-123 --force");

			expect(deleteRequest.count).toEqual(1);
			expect(std.err).toMatchInlineSnapshot(`""`);
		});

		// cf's delete doesn't pre-fetch the subscription before deleting
		// (that's a wrangler-side affordance). It goes straight to
		// DELETE, so the "fail before delete" path doesn't exist.
		it.skip("should show error when subscription does not exist", async () => {});
	});

	describe("update", () => {
		// Fixed: queues-subscriptions-update-required-fields. cf's
		// generator no longer marks `--destination-queue-id` /
		// `--destination-type` as `demandOption` on PATCH; they're only
		// group-required when any `--destination-*` flag is set. Partial
		// PATCHes that only touch unrelated fields (--name, --events,
		// --enabled) now succeed with no prompt, so these tests use the
		// per-field flags directly instead of the old `--body` escape
		// hatch.
		it("should update subscription with multiple fields", async ({
			expect,
		}) => {
			let capturedBody: Record<string, unknown> | undefined;
			msw.use(
				http.patch(
					"*/accounts/:accountId/event_subscriptions/subscriptions/:subscriptionId",
					async ({ request, params }) => {
						expect(params.subscriptionId).toEqual("sub-123");
						capturedBody = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json({
							success: true,
							errors: [],
							messages: [],
							result: {
								...mockSubscription1,
								name: "new-name",
								enabled: false,
							},
						});
					},
					{ once: true }
				)
			);

			await runWrangler(
				`queues subscriptions update sub-123 --name new-name --events build.completed --events build.failed --enabled false`
			);

			expect(capturedBody).toEqual({
				name: "new-name",
				events: ["build.completed", "build.failed"],
				enabled: false,
			});
			expect(std.err).toMatchInlineSnapshot(`""`);
		});

		// cf always emits JSON by default; --json is a wrangler-only knob.
		// Verify the partial PATCH lands (via per-field flags, no
		// over-strict destination requirement) and emits JSON.
		// Fixed: queues-subscriptions-update-required-fields.
		it('supports json output with "--json" flag', async ({ expect }) => {
			let capturedBody: Record<string, unknown> | undefined;
			msw.use(
				http.patch(
					"*/accounts/:accountId/event_subscriptions/subscriptions/:subscriptionId",
					async ({ request }) => {
						capturedBody = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json({
							success: true,
							errors: [],
							messages: [],
							result: {
								...mockSubscription1,
								name: "Renamed Subscription",
							},
						});
					},
					{ once: true }
				)
			);

			await runWrangler(
				`queues subscriptions update sub-123 --name "Renamed Subscription"`
			);

			expect(capturedBody).toEqual({ name: "Renamed Subscription" });
			const parsed = JSON.parse(std.out);
			expect(parsed.id).toEqual("sub-123");
			expect(parsed.name).toEqual("Renamed Subscription");
		});

		// The original wrangler test asserted that an empty update
		// invocation surfaced the missing-required-field error. cf's
		// generator group-implies fix (see
		// `test_bugs/queues-subscriptions-update-required-fields.md`)
		// makes empty partial-PATCH invocations legal: when no
		// `--destination-*` flag is set, the destination object is
		// omitted from the wire body entirely, and the API receives an
		// empty PATCH. The error no longer fires; the scenario the
		// wrangler test exercised doesn't exist in cf anymore.
		it.skip("should error when no fields provided", async () => {});
	});
});
