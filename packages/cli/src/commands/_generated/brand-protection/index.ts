import $logomatches from "./logo-matches/index.js";
import $logos from "./logos/index.js";
import $matches from "./matches/index.js";
import $queries from "./queries/index.js";
import $submit from "./submit.js";
import $trial from "./trial/index.js";
import $urlinfo from "./url-info.js";
import $urls from "./urls/index.js";
/**
 * brand-protection command
 * @generated from apis/overlays/brand-protection.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "brand-protection",
	describe: "brand-protection",

	routes: {
		submit: $submit,
		"url-info": $urlinfo,
		"logo-matches": $logomatches,
		logos: $logos,
		matches: $matches,
		queries: $queries,
		trial: $trial,
		urls: $urls,
	},
});

export default command;
