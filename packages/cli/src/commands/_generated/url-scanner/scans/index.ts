import $bulkcreate from "./bulk-create.js";
import $create from "./create.js";
import $dom from "./dom.js";
import $get from "./get.js";
import $har from "./har.js";
import $list from "./list.js";
import $screenshot from "./screenshot.js";
/**
 * scans command group
 * @generated from apis/overlays/url-scanner.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "scans",
	describe:
		"URL scan requests and results — submit URLs for analysis and retrieve threat verdicts",

	routes: {
		"bulk-create": $bulkcreate,
		create: $create,
		dom: $dom,
		get: $get,
		har: $har,
		list: $list,
		screenshot: $screenshot,
	},
});

export default command;
