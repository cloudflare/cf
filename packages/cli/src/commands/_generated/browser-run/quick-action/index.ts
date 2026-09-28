import $accessibilitytree from "./accessibility-tree.js";
import $content from "./content.js";
import $json from "./json.js";
import $links from "./links.js";
import $markdown from "./markdown.js";
import $pdf from "./pdf.js";
import $scrape from "./scrape.js";
import $screenshot from "./screenshot.js";
import $snapshot from "./snapshot.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * quick-action command group
 * @generated from apis/overlays/browser-run.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "quick-action",
	describe: "Operations for quick-action",

	builder: (yargs) => {
		return yargs
			.command($accessibilitytree)
			.command($content)
			.command($json)
			.command($links)
			.command($markdown)
			.command($pdf)
			.command($scrape)
			.command($screenshot)
			.command($snapshot)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
