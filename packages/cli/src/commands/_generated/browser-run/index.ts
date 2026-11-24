import $crawl from "./crawl/index.js";
import $devtools from "./devtools/index.js";
import $quickaction from "./quick-action/index.js";
import $recording from "./recording/index.js";
import $script from "./script/index.js";
/**
 * browser-run command
 * @generated from apis/overlays/browser-run.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "browser-run",
	describe: "browser-run",

	routes: {
		crawl: $crawl,
		devtools: $devtools,
		"quick-action": $quickaction,
		recording: $recording,
		script: $script,
	},
});

export default command;
