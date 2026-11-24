import $list from "./list.js";
/**
 * crawlers command group
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "crawlers",
	describe: "Operations for crawlers",

	routes: {
		list: $list,
	},
});

export default command;
