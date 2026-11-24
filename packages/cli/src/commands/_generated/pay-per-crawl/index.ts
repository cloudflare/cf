import $config from "./config/index.js";
import $crawler from "./crawler/index.js";
import $crawlers from "./crawlers/index.js";
import $publisher from "./publisher/index.js";
import $terms from "./terms/index.js";
import $zones from "./zones/index.js";
/**
 * pay-per-crawl command
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "pay-per-crawl",
	describe: "pay-per-crawl",

	routes: {
		config: $config,
		crawler: $crawler,
		crawlers: $crawlers,
		publisher: $publisher,
		terms: $terms,
		zones: $zones,
	},
});

export default command;
