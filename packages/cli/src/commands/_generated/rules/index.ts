import $lists from "./lists/index.js";
/**
 * rules command
 * @generated from apis/overlays/rules.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rules",
	describe: "Resources used by Cloudflare rules and rulesets",

	routes: {
		lists: $lists,
	},
});

export default command;
