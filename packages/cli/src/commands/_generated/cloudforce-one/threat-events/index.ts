import $attackers from "./attackers/index.js";
import $bulkcreate from "./bulk-create.js";
import $categories from "./categories/index.js";
import $countries from "./countries/index.js";
import $create from "./create.js";
import $datasets from "./datasets/index.js";
import $edit from "./edit.js";
import $eventtags from "./event-tags/index.js";
import $get from "./get.js";
import $indicatortypes from "./indicator-types/index.js";
import $list from "./list.js";
import $raw from "./raw/index.js";
import $relate from "./relate/index.js";
import $search from "./search.js";
import $tags from "./tags/index.js";
import $targetindustries from "./target-industries/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * threat-events command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "threat-events",
	describe: "Operations for threat-events",

	builder: (yargs) => {
		return yargs
			.command($bulkcreate)
			.command($create)
			.command($edit)
			.command($get)
			.command($list)
			.command($search)
			.command($attackers)
			.command($categories)
			.command($countries)
			.command($datasets)
			.command($eventtags)
			.command($indicatortypes)
			.command($raw)
			.command($relate)
			.command($tags)
			.command($targetindustries)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
