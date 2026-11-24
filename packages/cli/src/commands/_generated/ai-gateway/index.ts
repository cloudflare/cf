import $customdomains from "./custom-domains/index.js";
import $customproviders from "./custom-providers/index.js";
import $dynamicrouting from "./dynamic-routing/index.js";
import $gateways from "./gateways/index.js";
import $logs from "./logs/index.js";
import $modelaliases from "./model-aliases/index.js";
/**
 * ai-gateway command
 * @generated from apis/overlays/ai-gateway.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ai-gateway",
	describe:
		"Proxy, cache, rate-limit, and observe requests to AI providers — OpenAI, Anthropic, Workers AI, and more",

	routes: {
		"custom-domains": $customdomains,
		"custom-providers": $customproviders,
		"dynamic-routing": $dynamicrouting,
		gateways: $gateways,
		logs: $logs,
		"model-aliases": $modelaliases,
	},
});

export default command;
