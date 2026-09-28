import $bulkcreate from "./bulk-create.js";
import $create from "./create.js";
import $dom from "./dom.js";
import $get from "./get.js";
import $har from "./har.js";
import $list from "./list.js";
import $screenshot from "./screenshot.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * scans command group
 * @generated from apis/overlays/url-scanner.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "scans",
	describe:
		"URL scan requests and results — submit URLs for analysis and retrieve threat verdicts",

	builder: (yargs) => {
		return yargs
			.command($bulkcreate)
			.command($create)
			.command($dom)
			.command($get)
			.command($har)
			.command($list)
			.command($screenshot)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
