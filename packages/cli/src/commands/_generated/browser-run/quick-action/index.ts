import $accessibilitytree from "./accessibility-tree.js";
import $content from "./content.js";
import $json from "./json.js";
import $links from "./links.js";
import $markdown from "./markdown.js";
import $pdf from "./pdf.js";
import $scrape from "./scrape.js";
import $screenshot from "./screenshot.js";
import $snapshot from "./snapshot.js";
/**
 * quick-action command group
 * @generated from apis/overlays/browser-run.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "quick-action",
	describe: "Operations for quick-action",

	routes: {
		"accessibility-tree": $accessibilitytree,
		content: $content,
		json: $json,
		links: $links,
		markdown: $markdown,
		pdf: $pdf,
		scrape: $scrape,
		screenshot: $screenshot,
		snapshot: $snapshot,
	},
});

export default command;
