// Port status: SKIPPED — cf has no `tail` command (real-time log streaming)
// today. Worker tail-session operations are SDK-only, so cf has neither their
// descriptor CRUD commands nor the streaming UX this file exercises (websocket
// connection, filter routing, pretty/JSON formatting, ping handling, etc.).
//
// Log streaming would require a dedicated hand-written command and is not
// implemented. The whole describe block below is wrapped in
// `.skip` and unresolvable imports (vitest-websocket-mock, the wrangler-
// internal `../tail/createTail` type module, ws, undici Request/Headers,
// helpers/mock-web-socket) have been stripped or replaced with local stand-ins
// so the file parses. Re-enable when `cf tail` lands.
//
/* eslint-disable no-unused-vars, no-unassigned-vars -- This file is skipped
   scaffolding for the not-yet-implemented `cf tail` command (see header). The
   imports and mock-event helpers are intentionally retained for when log
   streaming lands; until then they are unreferenced. */
import { setTimeout } from "node:timers/promises";
import { writeWranglerConfig } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { clearDialogs } from "./helpers/mock-dialogs";
import { useMockIsTTY } from "./helpers/mock-istty";
import { createFetchResult, msw, mswSucessScriptHandlers } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";
import type { ExpectStatic } from "vite-plus/test";

// --- Local stand-ins for stripped imports (file is .skip'd; types only need
// to parse). ---
// `vitest-websocket-mock` is not installed in this repo.
type MockWebSocketServer = {
	connected: Promise<boolean>;
	nextMessage: Promise<string | Buffer>;
	send: (data: unknown) => void;
	close: () => void;
};
const MockWebSocketServer = class {
	constructor(_url: string) {
		throw new Error("MockWebSocketServer stub — tail tests are skipped");
	}
} as unknown as new (url: string) => MockWebSocketServer;
// `./helpers/mock-web-socket` exists but pulls `ws` which is not in deps.

// `../tail/createTail` is wrangler-internal and not in this repo. Stub the
// types so the helpers below still type-check inside the .skip block.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TailEventMessageType = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RequestEvent = { request: any; cf?: any };
type ScheduledEvent = { cron: string; scheduledTime: number };
type AlarmEvent = { scheduledTime: string };
type EmailEvent = { mailFrom: string; rcptTo: string; rawSize: number };
type QueueEvent = { queue: string; batchSize: number };
type RpcEvent = { rpcMethod: string };
type TailEvent = { consumedEvents: { scriptName: string }[] };
type TailInfo = { message: string; type: string };
type TailEventMessage = {
	outcome?: string;
	entrypoint?: string;
	exceptions?: unknown[];
	logs?: unknown[];
	eventTimestamp?: number;
	event?: TailEventMessageType;
};
type RequestInit = Record<string, unknown>;
type RawData = Buffer;
// `undici`'s Request/Headers — use the global Web Request/Headers as stubs.
declare const Request: typeof globalThis.Request;
declare const Headers: typeof globalThis.Headers;

// Skipped: cf has no streaming `tail` command.
describe("tail", () => {
	mockAccountId();
	mockApiToken();
	let api: MockAPI;
	afterEach(async () => {
		await api?.closeHelper?.();
		mockWebSockets.forEach((ws) => ws.close());
		mockWebSockets = [];
		clearDialogs();
	});

	beforeEach(() => msw.use(...mswSucessScriptHandlers));
	runInTempDir();

	/**
	 * Interaction with the tailing API, including tail creation,
	 * deletion, and connection.
	 */
	describe("API interaction", () => {
		it.todo("should throw an error if name isn't provided");

		it.todo("creates and then delete tails");

		it.todo("should connect to the worker assigned to a given route");

		it.todo("should error if a given route is not assigned to the user's zone");
		it.todo("should error if a given route is not within the user's zone");

		it.skip("creates and then delete tails: legacy envs", () => {});

		it.skip("creates and then delete tails: service envs", () => {});

		it.todo("activates debug mode when the cli arg is passed in");
	});

	describe("filtering", () => {
		it.todo("sends sampling rate filters");

		it.todo("sends single status filters");

		it.todo("sends multiple status filters");

		it.todo("sends single HTTP method filters");

		it.todo("sends multiple HTTP method filters");

		it.todo("sends header filters without a query");

		it.todo("sends header filters with a query");

		it.todo("sends single IP filters");

		it.todo("sends multiple IP filters");

		it.todo("sends search filters");

		it.todo("sends version id filters");

		it.todo("sends everything but the kitchen sink");
	});

	describe("printing", () => {
		it.todo("logs request messages in JSON format");

		it.todo("logs scheduled messages in JSON format");

		it.todo("logs alarm messages in json format");

		it.todo("logs email messages in json format");

		it.todo("logs tail messages in json format");

		it.todo("logs queue messages in json format");

		it.todo("logs request messages in pretty format");

		it.todo("logs rpc messages in pretty format");

		it.todo("logs scheduled messages in pretty format");

		it.todo("logs alarm messages in pretty format");

		it.todo("logs email messages in pretty format");

		it.todo("logs tail messages in pretty format");

		it.todo("logs tail overload message");

		it.todo("logs queue messages in pretty format");

		it.todo("should not crash when the tail message has a void event");

		it.todo("defaults to logging in pretty format when the output is a TTY");

		it.todo("defaults to logging in json format when the output is not a TTY");

		it.todo("logs console messages and exceptions");
	});

	describe("disconnects", () => {
		it.todo("errors when the websocket is already closed");

		it.todo(
			"errors when the websocket stops reacting to pings (pretty format)"
		);

		it.todo("errors when the websocket stops reacting to pings (json format)");
	});
});

/* helpers */

/**
 * The built in serialize-to-JSON feature of our mock websocket doesn't work
 * for our use-case since we actually expect a raw buffer,
 * not a Javascript string. Additionally, we have to do some fiddling
 * with `RequestEvent`s to get them to serialize properly.
 *
 * @param message a message to serialize to JSON
 * @returns the same type we expect when deserializing in wrangler
 */
function serialize(message: TailEventMessage): RawData {
	if (!isRequest(message.event)) {
		// `ScheduledEvent`s and `TailEvent`s work just fine
		const stringified = JSON.stringify(message);
		return Buffer.from(stringified, "utf-8");
	} else {
		// Since the "properties" of an `undici.Request` are actually getters,
		// which don't serialize properly, we need to hydrate them manually.
		// This isn't a problem outside of testing since deserialization
		// works just fine and wrangler never _sends_ any event messages,
		// it only receives them.
		const request = ((message.event as RequestEvent | undefined | null) || {})
			.request;
		const stringified = JSON.stringify(message, (key, value) => {
			if (key !== "request") {
				return value;
			}

			return {
				...request,
				url: request?.url,
				headers: request?.headers,
				method: request?.method,
			};
		});

		return Buffer.from(stringified, "utf-8");
	}
}

/**
 * Small helper to disambiguate the event types possible in a `TailEventMessage`
 *
 * @param event A TailEvent
 * @returns true if `event` is a RequestEvent
 */
function isRequest(event: TailEventMessageType): event is RequestEvent {
	return Boolean(event && "request" in event);
}

/**
 * Similarly, we need to deserialize from a raw buffer instead
 * of just JSON.parsing a raw string.
 *
 * @param message a buffer of data received from the websocket
 * @returns a JSON object ready to be compared against
 */
function deserializeJsonMessage(message: RawData) {
	return JSON.parse(message.toString());
}

/**
 * A mock for all the different API resources wrangler accesses
 * when running `wrangler tail`
 */
type MockAPI = {
	requests: {
		creation: RequestInit[];
		deletion: RequestCounter;
	};
	ws: MockWebSocketServer;
	nextMessageJson(): Promise<unknown>;
	closeHelper: () => Promise<void>;
};

/**
 * A counter used to check how many times a mock API has been hit.
 * Useful as a helper in our testing to check if wrangler is making
 * the correct API calls without actually sending any web traffic
 */
type RequestCounter = {
	count: number;
};

/**
 * Mock out the API hit during Tail creation
 *
 * @param websocketURL a fake URL for wrangler to connect a websocket to
 * @returns a `RequestCounter` for counting how many times the API is hit
 */
function mockCreateTailRequest(
	expect: ExpectStatic,
	websocketURL: string,
	env?: string,
	useServiceEnvironments = true,
	expectedScriptName = !useServiceEnvironments && env
		? `test-worker-${env}`
		: "test-worker"
): RequestInit[] {
	const requests: RequestInit[] = [];
	const servicesOrScripts =
		env && useServiceEnvironments ? "services" : "scripts";
	const environment =
		env && useServiceEnvironments ? "/environments/:envName" : "";
	msw.use(
		http.post<
			{ accountId: string; scriptName: string; envName: string },
			RequestInit
		>(
			`*/accounts/:accountId/workers/${servicesOrScripts}/:scriptName${environment}/tails`,
			async ({ params, request }) => {
				const r = await request.json();
				requests.push(r);
				expect(params.accountId).toEqual("some-account-id");
				expect(params.scriptName).toEqual(expectedScriptName);
				if (useServiceEnvironments) {
					expect(params.envName).toEqual(env);
				}
				return HttpResponse.json(
					createFetchResult({
						url: websocketURL,
						id: "tail-id",
						expires_at: mockTailExpiration,
					})
				);
			},
			{ once: true }
		)
	);

	return requests;
}

/**
 * Mock expiration datetime for tails created during testing
 */
const mockTailExpiration = new Date(3005, 1);

/**
 * Default value for event timestamps
 */
const mockEventTimestamp = 1645454470467;

/**
 * Default value for event time ISO strings
 */
const mockEventScheduledTime = new Date(mockEventTimestamp).toISOString();

/**
 * Default value for email event from
 */
const mockEmailEventFrom = "from@example.com";

/**
 * Default value for email event to
 */
const mockEmailEventTo = "to@example.com";

/**
 * Default value for email event mail size
 */
const mockEmailEventSize = 45416;

/**
 * Mock out the API hit during Tail deletion
 *
 * @returns a `RequestCounter` for counting how many times the API is hit
 */
function mockDeleteTailRequest(
	expect: ExpectStatic,
	env?: string,
	useServiceEnvironments = true,
	expectedScriptName = !useServiceEnvironments && env
		? `test-worker-${env}`
		: "test-worker"
): RequestCounter {
	const requests = { count: 0 };
	const servicesOrScripts =
		env && useServiceEnvironments ? "services" : "scripts";
	const environment =
		env && useServiceEnvironments ? "/environments/:envName" : "";
	msw.use(
		http.delete(
			`*/accounts/:accountId/workers/${servicesOrScripts}/:scriptName${environment}/tails/:tailId`,
			async ({ params }) => {
				requests.count++;
				expect(params.accountId).toEqual("some-account-id");
				expect(params.scriptName).toEqual(expectedScriptName);
				if (useServiceEnvironments) {
					if (env) {
						expect(params.tailId).toEqual("tail-id");
					}
				}
				expect(params.tailId).toEqual("tail-id");
				return HttpResponse.json(createFetchResult(null));
			}
		)
	);

	return requests;
}

let mockWebSockets: MockWebSocketServer[] = [];

/**
 * All-in-one convenience method to mock the appropriate API calls before
 * each test, and clean up afterwards.
 *
 * @param websocketURL a fake websocket URL for wrangler to connect to
 * @returns a mocked-out version of the API
 */
function mockWebsocketAPIs(
	expect: ExpectStatic,
	env?: string,
	useServiceEnvironments = true,
	expectedScriptName?: string
): MockAPI {
	const websocketURL = "ws://localhost:1234";
	const api: MockAPI = {
		requests: {
			deletion: { count: 0 },
			creation: [],
		},
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		ws: null!, // will be set in the `beforeEach()` below.

		/**
		 * Parse the next message received by the mock websocket as JSON
		 * @returns JSON.parse of the next message received by the websocket
		 */
		async nextMessageJson() {
			const message = await api.ws.nextMessage;
			return JSON.parse(message as string);
		},
		/**
		 * Close the mock websocket and clean up the API.
		 * The setTimeout forces a cycle to allow for closing and cleanup
		 * @returns a Promise that resolves when the websocket is closed
		 */
		async closeHelper() {
			api.ws.close();
			await setTimeout(0);
		},
	};
	api.requests.creation = mockCreateTailRequest(
		expect,
		websocketURL,
		env,
		useServiceEnvironments,
		expectedScriptName
	);
	api.requests.deletion = mockDeleteTailRequest(
		expect,
		env,
		useServiceEnvironments,
		expectedScriptName
	);
	api.ws = new MockWebSocketServer(websocketURL);
	mockWebSockets.push(api.ws);

	return api;
}

/**
 * Generate a mock `TailEventMessage` of the same shape sent back by the
 * tail worker.
 *
 * @param opts Any specific parts of the message to use instead of defaults
 * @returns a `TailEventMessage` that wrangler can process and display
 */
function generateMockEventMessage({
	outcome = "ok",
	entrypoint,
	exceptions = [],
	logs = [],
	eventTimestamp = mockEventTimestamp,
	event = generateMockRequestEvent(),
}: Partial<TailEventMessage>): TailEventMessage {
	return {
		outcome,
		entrypoint,
		exceptions,
		logs,
		eventTimestamp,
		event,
	};
}

/**
 * Generate a mock `RequestEvent` that, in an alternate timeline, was used
 * to trigger a worker. You can't disprove this!
 *
 * @param opts Any specific parts of the event to use instead of defaults
 * @returns a `RequestEvent` that can be used within an `EventMessage`
 */
function generateMockRequestEvent(
	opts?: Partial<RequestEvent["request"]>
): RequestEvent {
	return {
		request: Object.assign(
			new Request(opts?.url || "https://example.org/", {
				method: opts?.method || "GET",
				headers:
					opts?.headers || new Headers({ "X-EXAMPLE-HEADER": "some_value" }),
			}),
			{
				cf: opts?.cf || {
					tlsCipher: "AEAD-ENCRYPT-O-MATIC-SHA",
					tlsVersion: "TLSv2.0",
					asn: 42069,
					colo: "ATL",
					httpProtocol: "HTTP/4",
					asOrganization: "Cloudflare",
				},
			}
		),
	};
}

function generateMockScheduledEvent(
	opts?: Partial<ScheduledEvent>
): ScheduledEvent {
	return {
		cron: opts?.cron || "* * * * *",
		scheduledTime: opts?.scheduledTime || mockEventTimestamp,
	};
}

function generateMockAlarmEvent(opts?: Partial<AlarmEvent>): AlarmEvent {
	return {
		scheduledTime: opts?.scheduledTime || mockEventScheduledTime,
	};
}

function generateMockEmailEvent(opts?: Partial<EmailEvent>): EmailEvent {
	return {
		mailFrom: opts?.mailFrom || mockEmailEventFrom,
		rcptTo: opts?.rcptTo || mockEmailEventTo,
		rawSize: opts?.rawSize || mockEmailEventSize,
	};
}

function generateMockTailEvent(tailing: string[]): TailEvent {
	return {
		consumedEvents: tailing.map((tailedScript) => {
			return { scriptName: tailedScript };
		}),
	};
}

function generateTailInfo(overload: boolean): TailInfo {
	return overload
		? {
				message:
					"Tail is currently in sampling mode due to the high volume of messages. To prevent messages from being dropped consider adding filters.",
				type: "overload",
			}
		: {
				message:
					"Tail has exited sampling mode and is no longer dropping messages.",
				type: "overload-stop",
			};
}

function generateMockQueueEvent(opts?: Partial<QueueEvent>): QueueEvent {
	return {
		queue: opts?.queue || "my-queue123",
		batchSize: opts?.batchSize || 7,
	};
}

function generateMockRpcEvent(opts?: Partial<RpcEvent>): RpcEvent {
	return {
		rpcMethod: opts?.rpcMethod || "foo",
	};
}
