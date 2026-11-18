import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import { describe, expect, it, vi } from "vite-plus/test";
import { handler } from "../../../../generator/plugin/emit/handler.js";
import { compactBody, parseBody } from "../../../lib/body-parser.js";
import { resolveFileToken } from "../../../lib/input-validation.js";
import {
	bodyParam,
	context,
	method,
	operation,
	param,
	wire,
} from "../../helpers/cli-plugin.js";

describe("authentication before required input", () => {
	function setup() {
		const ctx = context(
			method("create", "things.create"),
			"things",
			operation("post", "/accounts/{account_id}/things", {
				pathParams: [param("account_id")],
				hasRequestBody: true,
				requestContentTypes: ["application/json"],
				bodyParams: [
					bodyParam("kind", "string", ["kind"], {
						required: true,
						enumValues: ["one", "two"],
					}),
					bodyParam("value", "string", ["value"], {
						required: true,
						sensitive: true,
					}),
				],
				wire: wire({ hasRequest: true, body: "json", bodyRequired: true }),
			})
		);
		const events: string[] = [];
		const send = vi.fn(async () => {
			events.push("send");
		});
		const createCommandClient = vi.fn(async () => {
			events.push("auth");
			return { send };
		});
		const getAccountId = vi.fn(async () => {
			events.push("account");
			return "account";
		});
		const promptForRequiredEnumField = vi.fn(async () => {
			events.push("enum");
			return "one";
		});
		const promptForRequiredField = vi.fn(async () => {
			events.push("secret");
			return "secret-value";
		});
		const formatDryRun = vi.fn();
		const execute = new Script(
			stripTypeScriptTypes(`(async (argv) => {\n${handler(ctx).join("\n")}\n})`)
		).runInNewContext({
			createCommandClient,
			getAccountId,
			resolveAccountIdSilent: async () => undefined,
			promptForRequiredEnumField,
			promptForRequiredField,
			compactBody,
			parseBody,
			resolveFileToken,
			operation: {},
			formatDryRun,
			formatOutput: () => {},
			withProgress: async (_label: string, task: () => Promise<unknown>) =>
				task(),
		}) as (argv: Record<string, unknown>) => Promise<void>;
		return {
			execute,
			events,
			send,
			createCommandClient,
			getAccountId,
			promptForRequiredEnumField,
			promptForRequiredField,
			formatDryRun,
		};
	}

	it.each(["client", "account"])(
		"does not interact when %s authentication fails",
		async (failure) => {
			const c = setup();
			const error = new Error("Authentication failed");
			if (failure === "client") {
				c.createCommandClient.mockRejectedValue(error);
			} else {
				c.getAccountId.mockRejectedValue(error);
			}
			await expect(c.execute({})).rejects.toThrow(error);
			expect(c.promptForRequiredEnumField).not.toHaveBeenCalled();
			expect(c.promptForRequiredField).not.toHaveBeenCalled();
			expect(c.send).not.toHaveBeenCalled();
			expect(c.formatDryRun).not.toHaveBeenCalled();
		}
	);

	it("authenticates and selects the account before resolving required values", async () => {
		const c = setup();
		await c.execute({});
		expect(c.events).toEqual(["auth", "account", "enum", "secret", "send"]);
	});

	it("resolves dry-run input without authenticating or selecting an account", async () => {
		const c = setup();
		await c.execute({ dryRun: true });
		expect(c.events).toEqual(["enum", "secret"]);
		expect(c.formatDryRun).toHaveBeenCalledOnce();
		expect(c.createCommandClient).not.toHaveBeenCalled();
		expect(c.getAccountId).not.toHaveBeenCalled();
		expect(c.send).not.toHaveBeenCalled();
	});
});
