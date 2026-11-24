import $domaincategories from "./domain-categories.js";
import $useragents from "./user-agents/index.js";
/**
 * top command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "top",
	describe: "Operations for robots-txt.top",

	routes: {
		"domain-categories": $domaincategories,
		"user-agents": $useragents,
	},
});

export default command;
