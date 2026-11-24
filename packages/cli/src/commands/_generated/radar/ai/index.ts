import $bots from "./bots/index.js";
import $inference from "./inference/index.js";
import $markdownforagents from "./markdown-for-agents/index.js";
/**
 * ai command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ai",
	describe:
		"AI inference trends and model usage statistics across the Cloudflare network",

	routes: {
		bots: $bots,
		inference: $inference,
		"markdown-for-agents": $markdownforagents,
	},
});

export default command;
