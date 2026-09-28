import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $listsitetags from "./list-site-tags.js";
import $listzonetags from "./list-zone-tags.js";
import $list from "./list.js";
import $update from "./update.js";
import $validatehostname from "./validate-hostname.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * site-info command group
 * @generated from apis/overlays/rum.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "site-info",
	describe:
		"Web Analytics sites — register domains and get the JavaScript beacon snippet",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($listsitetags)
			.command($listzonetags)
			.command($update)
			.command($validatehostname)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
