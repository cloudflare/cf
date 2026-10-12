import { describe, expect, it } from "vite-plus/test";
import { providerArgs } from "../../commands/ai/codex/run.js";

function values(args: string[]): string[] {
	return args.filter((_, index) => args[index - 1] === "--config");
}

describe("cf ai codex provider configuration", () => {
	it("configures the account REST Responses API with an environment token", () => {
		const args = providerArgs({
			baseUrl: "https://api.cloudflare.com/client/v4/accounts/account-id/ai/v1",
			model: "openai/gpt-5.5",
		});

		expect(args.slice(0, 2)).toEqual(["--model", "openai/gpt-5.5"]);
		expect(values(args)).toEqual(
			expect.arrayContaining([
				'model_provider="cloudflare-ai-gateway"',
				'model_providers.cloudflare-ai-gateway.wire_api="responses"',
				'model_providers.cloudflare-ai-gateway.env_key="CF_AIG_TOKEN"',
				'model_providers.cloudflare-ai-gateway.env_http_headers={"cf-aig-gateway-id"="CF_AIG_GATEWAY_ID","cf-aig-metadata"="CF_AIG_METADATA"}',
			])
		);
	});

	it("configures an Access credential helper with proactive refresh", () => {
		const args = providerArgs({
			baseUrl: "https://ai.example.com/compat",
			model: "openai/gpt-5.5",
			access: { origin: "https://ai.example.com", bearer: true },
		});

		expect(values(args)).toEqual(
			expect.arrayContaining([
				'model_providers.cloudflare-ai-gateway.env_http_headers={"cf-aig-metadata"="CF_AIG_METADATA"}',
				'model_providers.cloudflare-ai-gateway.auth.command="cloudflared"',
				'model_providers.cloudflare-ai-gateway.auth.args=["access","token","--app=https://ai.example.com"]',
				"model_providers.cloudflare-ai-gateway.auth.refresh_interval_ms=300000",
			])
		);
		expect(values(args)).not.toContain(
			'model_providers.cloudflare-ai-gateway.env_key="CF_AIG_TOKEN"'
		);
		expect(values(args).join(" ")).not.toContain("cf-access-token");
	});

	it("uses a launch-time header for Access apps without OAuth bearer support", () => {
		const args = providerArgs({
			baseUrl: "https://header-only.example.com/compat",
			model: "openai/gpt-5.5",
			access: { origin: "https://header-only.example.com", bearer: false },
		});

		expect(values(args)).toEqual(
			expect.arrayContaining([
				'model_providers.cloudflare-ai-gateway.env_key="CF_ACCESS_TOKEN"',
				'model_providers.cloudflare-ai-gateway.env_http_headers={"cf-access-token"="CF_ACCESS_TOKEN","cf-aig-metadata"="CF_AIG_METADATA"}',
			])
		);
		expect(values(args).join(" ")).not.toContain("auth.command");
	});
});
