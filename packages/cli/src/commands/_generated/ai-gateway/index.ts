import $customdomains from "./custom-domains/index.js";
import $customproviders from "./custom-providers/index.js";
import $dynamicrouting from "./dynamic-routing/index.js";
import $gateways from "./gateways/index.js";
import $logs from "./logs/index.js";
import $websearch from "./web-search.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ai-gateway command
 * @generated from apis/overlays/ai-gateway.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ai-gateway",
	describe:
		"Proxy, cache, rate-limit, and observe requests to AI providers — OpenAI, Anthropic, Workers AI, and more",

	builder: (yargs) => {
		return yargs
			.command($websearch)
			.command($customdomains)
			.command($customproviders)
			.command($dynamicrouting)
			.command($gateways)
			.command($logs)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
