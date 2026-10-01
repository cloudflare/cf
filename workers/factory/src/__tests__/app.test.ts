import { dispatch } from "@flue/runtime";
import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { testClient } from "hono/testing";
import { describe, expect, it, vi } from "vitest";
import { app } from "../app";
import type * as Runtime from "@flue/runtime";

vi.mock("@flue/runtime", async (importOriginal) => ({
	...(await importOriginal<typeof Runtime>()),
	dispatch: vi.fn(),
}));
vi.mock("../agents/issue-triage.agent", () => ({
	IssueTriage: function IssueTriage() {
		return "";
	},
}));

const WEBHOOK_SECRET = env.GITHUB_WEBHOOK_SECRET;
const client = testClient(app);
const webhookClient = testClient(
	new Hono().post("/channels/github/webhook", (c) => app.fetch(c.req.raw))
).channels.github.webhook;
const payload = {
	action: "opened",
	installation: { id: 123 },
	issue: { body: "The CLI crashes.", number: 42, title: "CLI crash" },
	repository: { name: "cf", owner: { login: "cloudflare" } },
};

async function sendWebhook(body: string, event = "issues") {
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(WEBHOOK_SECRET),
		{ hash: "SHA-256", name: "HMAC" },
		false,
		["sign"]
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(body)
	);
	const hex = Array.from(new Uint8Array(signature), (byte) =>
		byte.toString(16).padStart(2, "0")
	).join("");
	return webhookClient.$post(
		{},
		{
			init: { body },
			headers: {
				"content-type": "application/json",
				"x-github-delivery": "delivery-1",
				"x-github-event": event,
				"x-hub-signature-256": `sha256=${hex}`,
			},
		}
	);
}

describe("factory routes", () => {
	it("serves health", async () => {
		const response = await client.health.$get();
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ status: "ok" });
	});

	it("returns 404 for unknown routes and unmounted agent routes", async () => {
		expect((await app.request("/unknown")).status).toBe(404);
		expect((await app.request("/agents/issue-triage/42")).status).toBe(404);
	});

	it("rejects unsigned webhooks", async () => {
		const response = await webhookClient.$post(
			{},
			{
				init: { body: JSON.stringify(payload) },
				headers: { "content-type": "application/json" },
			}
		);
		expect(response.status).toBe(401);
		expect(dispatch).not.toHaveBeenCalled();
	});

	it("rejects an invalid signature", async () => {
		const response = await webhookClient.$post(
			{},
			{
				init: { body: JSON.stringify(payload) },
				headers: {
					"content-type": "application/json",
					"x-hub-signature-256": `sha256=${"0".repeat(64)}`,
				},
			}
		);
		expect(response.status).toBe(401);
		expect(dispatch).not.toHaveBeenCalled();
	});

	it("acknowledges GitHub App ping without dispatch", async () => {
		expect((await sendWebhook("{}", "ping")).status).toBe(200);
		expect(dispatch).not.toHaveBeenCalled();
	});

	it("dispatches a verified opened issue with trusted creation data", async () => {
		const response = await sendWebhook(JSON.stringify(payload));
		expect(response.status).toBe(200);
		expect(dispatch).toHaveBeenCalledExactlyOnceWith(expect.any(Function), {
			id: expect.any(String),
			initialData: {
				body: "The CLI crashes.",
				installationId: 123,
				issueNumber: 42,
				owner: "cloudflare",
				repo: "cf",
				title: "CLI crash",
			},
			message: {
				attributes: { deliveryId: "delivery-1" },
				body: "Classify the newly opened issue using the classify-issue-type skill.",
				kind: "signal",
				type: "github.issues.opened",
			},
		});
	});

	it("normalizes an empty issue body", async () => {
		await sendWebhook(
			JSON.stringify({ ...payload, issue: { ...payload.issue, body: null } })
		);
		expect(dispatch).toHaveBeenCalledWith(
			expect.any(Function),
			expect.objectContaining({
				initialData: expect.objectContaining({ body: "" }),
			})
		);
	});

	it.each(["edited", "closed", "reopened"])(
		"ignores issues.%s",
		async (action) => {
			const response = await sendWebhook(
				JSON.stringify({ ...payload, action })
			);
			expect(response.status).toBe(200);
			expect(dispatch).not.toHaveBeenCalled();
		}
	);

	it("ignores other GitHub events", async () => {
		const response = await sendWebhook(
			JSON.stringify({ action: "created" }),
			"issue_comment"
		);
		expect(response.status).toBe(200);
		expect(dispatch).not.toHaveBeenCalled();
	});

	it("requires a GitHub App installation", async () => {
		const response = await sendWebhook(
			JSON.stringify({ ...payload, installation: undefined })
		);
		expect(response.status).toBe(400);
		expect(dispatch).not.toHaveBeenCalled();
	});

	it("rejects signed invalid JSON", async () => {
		expect((await sendWebhook("{")).status).toBe(400);
		expect(dispatch).not.toHaveBeenCalled();
	});

	it("rejects a signed opened event without issue data", async () => {
		const response = await sendWebhook(
			JSON.stringify({ action: "opened", installation: { id: 123 } })
		);
		expect(response.status).toBe(400);
		expect(dispatch).not.toHaveBeenCalled();
	});
});
