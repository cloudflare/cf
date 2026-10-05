import { http, HttpResponse } from "msw";
// eslint-disable-next-line no-restricted-imports
import { expect } from "vite-plus/test";
import { msw } from "../helpers/msw";

// Types inlined from the original wrangler `queues/client` and
// `queues/subscription-types` modules (which don't exist in this
// ported repo). Kept structural so test fixtures continue to type-check
// against the same shapes as upstream wrangler.
export type QueueResponse = {
	queue_id?: string;
	queue_name: string;
	created_on: string;
	modified_on: string;
	producers: unknown[];
	producers_total_count: number;
	consumers: unknown[];
	consumers_total_count: number;
	settings?: Record<string, unknown>;
};

export type PostTypedConsumerBody = {
	script_name?: string;
	type: string;
	environment_name?: string;
	settings: {
		batch_size?: number;
		max_retries?: number;
		max_wait_time_ms?: number;
		max_concurrency?: number;
		retry_delay?: number;
		visibility_timeout_ms?: number;
	};
	dead_letter_queue?: string;
};

export const EventSourceType = {
	WORKERS_BUILDS_WORKER: "workers.builds.worker",
} as const;

export type CreateEventSubscriptionRequest = {
	name: string;
	enabled: boolean;
	source: { type: string; [k: string]: unknown };
	events: string[];
	destination: { type: string; queue_id: string };
};

export type EventSubscription = {
	id: string;
	created_at: string;
	modified_at: string;
	name: string;
	enabled: boolean;
	source: { type: string; [k: string]: unknown };
	destination: { type?: string; queue_id: string };
	events: string[];
};

export function mockGetQueueByNameRequest(
	queueName: string,
	queue: QueueResponse | null
) {
	const requests = { count: 0 };
	msw.use(
		http.get(
			"*/accounts/:accountId/queues?*",
			async ({ request }) => {
				const url = new URL(request.url);

				requests.count += 1;
				if (queue) {
					const nameParam = url.searchParams.getAll("name");
					expect(nameParam.length).toBeGreaterThan(0);
					expect(nameParam[0]).toEqual(queueName);
				}
				expect(await request.text()).toEqual("");
				return HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result: queue ? [queue] : [],
				});
			},
			{ once: true }
		)
	);
	return requests;
}

export function mockCreateSubscriptionRequest(
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

export function mockListSubscriptionsRequest(
	queueId: string,
	subscriptions: EventSubscription[]
) {
	const requests = { count: 0 };
	msw.use(
		http.get(
			"*/accounts/:accountId/event_subscriptions/subscriptions?*",
			async ({ request }) => {
				requests.count += 1;
				const url = new URL(request.url);
				expect(url.searchParams.get("queue_id")).toEqual(queueId);
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

export function mockGetSubscriptionRequest(
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

export function mockDeleteSubscriptionRequest(subscriptionId: string) {
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

export function mockUpdateSubscriptionRequest(
	subscriptionId: string,
	expectedBody: object
) {
	const requests = { count: 0 };
	msw.use(
		http.patch(
			"*/accounts/:accountId/event_subscriptions/subscriptions/:subscriptionId",
			async ({ request, params }) => {
				requests.count += 1;
				expect(params.subscriptionId).toEqual(subscriptionId);
				expect(params.accountId).toEqual("some-account-id");
				expect(await request.json()).toEqual(expectedBody);
				return HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result: {
						id: subscriptionId,
						name: "updated-subscription",
						source: {
							type: EventSourceType.WORKERS_BUILDS_WORKER,
							worker_name: "my-worker",
						},
						destination: {
							queue_id: "queue-id-1",
						},
						events: ["build.completed", "build.failed"],
						enabled: false,
						modified_at: "2023-01-01T00:00:00.000Z",
					},
				});
			}
		)
	);
	return requests;
}
