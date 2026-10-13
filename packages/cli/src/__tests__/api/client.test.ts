/**
 * Tests of the runtime library, `#api`, that commands send their requests
 * through.
 */
import assert from "node:assert/strict";
import { describe, test } from "vite-plus/test";
import {
	ApiError,
	ApiTimeoutError,
	Client,
	type ClientOptions,
	type Operation,
	path,
} from "../../api/index.js";

interface Sent {
	url: string;
	init: RequestInit;
}

/** The first request of `sent`. */
function first(sent: Sent[]): Sent {
	const request = sent[0];
	assert.ok(request, "no request was sent");
	return request;
}

function client(
	respond: (url: string, init: RequestInit) => Response | Promise<Response>,
	options: Partial<ClientOptions> = {}
): { client: Client; sent: Sent[] } {
	const sent: Sent[] = [];
	const fetcher = async (
		input: RequestInfo | URL,
		init?: RequestInit
	): Promise<Response> => {
		const url =
			typeof input === "string"
				? input
				: input instanceof URL
					? input.href
					: input.url;
		sent.push({ url, init: init ?? {} });
		return respond(url, init ?? {});
	};
	return {
		client: new Client({
			baseUrl: "https://api.test/client/v4",
			auth: async () => ({ headers: { Authorization: "Bearer t" } }),
			maxRetries: 0,
			fetch: fetcher as typeof fetch,
			...options,
		}),
		sent,
	};
}

function json(
	body: unknown,
	status = 200,
	headers: Record<string, string> = {}
): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json", ...headers },
	});
}

function sentHeaders(sent: Sent): Record<string, string> {
	return Object.fromEntries(new Headers(sent.init.headers).entries());
}

/** The path of `/a/{id}`. */
function idPath(request: Record<string, unknown>): string {
	return path`/a/${request.id}`;
}

describe("path", () => {
	test("encodes each substituted value as a path segment", () => {
		assert.equal(
			path`/a/${"x/y z"}/b/${7}/c/${null}/d/${undefined}`,
			"/a/x%2Fy%20z/b/7/c/null/d/undefined"
		);
		assert.equal(path`/a`, "/a");
	});
});

describe("send", () => {
	test("encodes path parameters and orders the query", async () => {
		const { client: c, sent } = client(() =>
			json({ success: true, result: { id: 1 } })
		);
		const op: Operation = {
			method: "GET",
			path: (request) =>
				path`/accounts/${request.account_id}/keys/${request.key}`,
			query: ["b", "a", "fields", "since"],
			joined: ["fields"],
		};
		const result = await c.send(op, {
			account_id: "acc",
			key: "a/b c",
			a: ["x", "y"],
			b: undefined,
			fields: ["f1", "f2"],
			since: 5,
			extra: "ignored",
		});
		assert.deepEqual(result, { id: 1 });
		assert.equal(
			first(sent).url,
			"https://api.test/client/v4/accounts/acc/keys/a%2Fb%20c?a=x&a=y&fields=f1,f2&since=5"
		);
		assert.equal(first(sent).init.method, "GET");
		assert.equal(first(sent).init.body, undefined);
		assert.deepEqual(sentHeaders(first(sent)), {
			accept: "*/*",
			authorization: "Bearer t",
		});
	});

	test("sends the body as it is, with its constants", async () => {
		const { client: c, sent } = client(() =>
			json({ success: true, result: null })
		);
		await c.send(
			{
				method: "POST",
				path: idPath,
				query: ["q"],
				body: "json",
				constants: { kind: "x" },
			},
			// A body field named like a parameter is the body's.
			{ id: "1", q: "v", body: { name: "n", kind: "y", id: "2" } }
		);
		assert.equal(first(sent).url, "https://api.test/client/v4/a/1?q=v");
		assert.equal(first(sent).init.body, '{"name":"n","kind":"x","id":"2"}');
		assert.equal(sentHeaders(first(sent))["content-type"], "application/json");
	});

	test("sends an empty body", async () => {
		const { client: c, sent } = client(() =>
			json({ success: true, result: null })
		);
		await c.send(
			{
				method: "POST",
				path: idPath,
				body: "json",
				contentType: "application/scim+json",
			},
			{ id: "1", body: {} }
		);
		assert.equal(first(sent).init.body, "{}");
		assert.equal(
			sentHeaders(first(sent))["content-type"],
			"application/scim+json"
		);
	});

	test("sends a body that is not an object as it is", async () => {
		const { client: c, sent } = client(() =>
			json({ success: true, result: [1] })
		);
		const result = await c.send(
			{
				method: "PUT",
				path: () => "/a",
				body: "json",
				constants: { kind: "x" },
			},
			{ body: [{ id: 1 }], x: 1 }
		);
		assert.equal(first(sent).init.body, '[{"id":1}]');
		assert.deepEqual(result, { result: [1], result_info: undefined });
	});

	test("sends no body for a missing one", async () => {
		const { client: c, sent } = client(() =>
			json({ success: true, result: null })
		);
		await c.send({ method: "PUT", path: () => "/a", body: "json" }, {});
		assert.equal(first(sent).init.body, undefined);
		assert.equal(sentHeaders(first(sent))["content-type"], undefined);
	});

	test("sends a form body", async () => {
		const { client: c, sent } = client(() =>
			json({ success: true, result: null })
		);
		await c.send(
			{
				method: "POST",
				path: idPath,
				pathParams: ["id"],
				query: ["q"],
				body: "form",
			},
			{ id: "1", q: "v", name: "n", meta: { a: 1 } }
		);
		const form = first(sent).init.body;
		assert.ok(form instanceof FormData);
		// The fields the path and query take are left out of the form.
		assert.deepEqual(
			[...form.entries()],
			[
				["name", "n"],
				["meta", '{"a":1}'],
			]
		);
		assert.equal(first(sent).url, "https://api.test/client/v4/a/1?q=v");
		assert.equal(sentHeaders(first(sent))["content-type"], undefined);
	});

	test("merges headers, later ones winning", async () => {
		const { client: c, sent } = client(() => json({}), {
			headers: { "User-Agent": "cf", authorization: "x" },
		});
		await c.send(
			{ method: "GET", path: () => "/a" },
			{},
			{ headers: { "X-Extra": "1" } }
		);
		assert.deepEqual(sentHeaders(first(sent)), {
			accept: "*/*",
			authorization: "x",
			"user-agent": "cf",
			"x-extra": "1",
		});
	});

	test("reads responses", async () => {
		const text = client(() => new Response("hello"));
		assert.equal(
			await text.client.send({
				method: "GET",
				path: () => "/a",
				response: "text",
			}),
			"hello"
		);
		assert.equal(sentHeaders(first(text.sent))["accept"], "text/plain");

		const none = client(() => json({ success: true, result: { a: 1 } }));
		assert.equal(
			await none.client.send({
				method: "GET",
				path: () => "/a",
				response: false,
			}),
			undefined
		);

		const empty = client(() => new Response(""));
		assert.equal(
			await empty.client.send({ method: "GET", path: () => "/a" }),
			undefined
		);

		const plain = client(() => json({ a: 1 }));
		assert.deepEqual(
			await plain.client.send({ method: "GET", path: () => "/a" }),
			{
				a: 1,
			}
		);

		const nonJson = client(() => new Response("<html>", { status: 201 }));
		assert.deepEqual(
			await nonJson.client.send({ method: "GET", path: () => "/a" }),
			{
				ok: false,
				error: { reason: "non-json", statusCode: 201, rawBody: "<html>" },
			}
		);

		const binary = client(() => new Response("bytes"));
		const body = (await binary.client.send({
			method: "GET",
			path: () => "/a",
			response: "binary-response",
		})) as {
			bodyUsed: boolean;
			arrayBuffer(): Promise<ArrayBuffer>;
		};
		assert.equal(JSON.stringify(body), '{"bodyUsed":false}');
		assert.equal(new TextDecoder().decode(await body.arrayBuffer()), "bytes");
	});

	test("throws an envelope's errors", async () => {
		const { client: c } = client(() =>
			json({ success: false, errors: [{ message: "a" }, "b"], result: null })
		);
		await assert.rejects(
			c.send({ method: "GET", path: () => "/a" }),
			(error: unknown) => {
				assert.ok(error instanceof ApiError);
				assert.equal(error.message, "a, b");
				assert.equal(error.statusCode, undefined);
				assert.equal(error.rawResponse?.status, 0);
				return true;
			}
		);
	});

	test("throws status errors", async () => {
		const body = { success: false, errors: [{ code: 7, message: "bad" }] };
		const { client: c } = client(() =>
			json(body, 400, { "x-request-id": "r" })
		);
		await assert.rejects(
			c.send({
				method: "GET",
				path: () => "/a",
				errors: { "400": "BadRequestError" },
			}),
			(error: unknown) => {
				assert.ok(error instanceof ApiError);
				assert.equal(error.name, "BadRequestError");
				assert.equal(error.statusCode, 400);
				assert.deepEqual(error.body, body);
				assert.equal(error.requestId, "r");
				assert.equal(
					error.message,
					`BadRequestError\nStatus code: 400\nBody: ${JSON.stringify(body, null, 2)}`
				);
				return true;
			}
		);
		const plain = client(
			() =>
				new Response("nope", {
					status: 404,
					headers: { "content-type": "text/plain" },
				})
		);
		await assert.rejects(
			plain.client.send({ method: "GET", path: () => "/a" }),
			(error: unknown) => {
				assert.ok(error instanceof ApiError);
				assert.equal(error.message, 'Status code: 404\nBody: "nope"');
				return true;
			}
		);
	});

	test("times out", async () => {
		const { client: c } = client(
			(_, init) =>
				new Promise((_resolve, reject) => {
					init.signal?.addEventListener("abort", () =>
						reject(new DOMException("aborted", "AbortError"))
					);
				}),
			{ timeoutInSeconds: 0.01 }
		);
		await assert.rejects(
			c.send({ method: "GET", path: idPath }, { id: "1" }),
			(error: unknown) => {
				assert.ok(error instanceof ApiTimeoutError);
				assert.equal(error.message, "Timeout exceeded when calling GET /a/1.");
				return true;
			}
		);
	});

	test("retries", async () => {
		let calls = 0;
		const { client: c } = client(
			() => {
				calls++;
				return calls === 1
					? new Response("", { status: 503, headers: { "retry-after": "0" } })
					: json({ ok: 1 });
			},
			{ maxRetries: 1 }
		);
		const started = Date.now();
		assert.deepEqual(await c.send({ method: "GET", path: () => "/a" }), {
			ok: 1,
		});
		assert.equal(calls, 2);
		assert.ok(Date.now() - started >= 0);
	});
});

describe("fetch", () => {
	test("resolves the path and merges headers", async () => {
		const { client: c, sent } = client(() => json({}), {
			headers: { "User-Agent": "cf" },
		});
		await c.fetch("/accounts/1?x=1", {
			method: "POST",
			headers: { "Content-Type": "text/plain" },
			body: "b",
		});
		assert.equal(
			first(sent).url,
			"https://api.test/client/v4/accounts/1%3Fx=1"
		);
		assert.equal(first(sent).init.method, "POST");
		assert.equal(first(sent).init.body, "b");
		assert.deepEqual(first(sent).init.headers, {
			"user-agent": "cf",
			authorization: "Bearer t",
			"content-type": "text/plain",
		});
	});

	test("keeps absolute URLs", async () => {
		const { client: c, sent } = client(() => json({}));
		await c.fetch("https://api.test/client/v4/a?b=1");
		assert.equal(first(sent).url, "https://api.test/client/v4/a?b=1");
		assert.equal(first(sent).init.method, "GET");
	});
});
