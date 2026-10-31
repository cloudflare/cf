import $aggregate from "./aggregate.js";
import $attackers from "./attackers/index.js";
import $bulkcreate from "./bulk-create.js";
import $bulkupdate from "./bulk-update.js";
import $categories from "./categories/index.js";
import $copy from "./copy.js";
import $countries from "./countries/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $graphql from "./graphql.js";
import $legacy from "./legacy/index.js";
import $list from "./list.js";
import $move from "./move.js";
import $queries from "./queries/index.js";
import $raw from "./raw/index.js";
import $relationships from "./relationships/index.js";
import $search from "./search.js";
import $targetindustries from "./target-industries/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * events command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "events",
	describe: "Operations for threat-intel.events",

	builder: (yargs) => {
		return yargs
			.command($aggregate)
			.command($bulkcreate)
			.command($bulkupdate)
			.command($copy)
			.command($create)
			.command($delete)
			.command($get)
			.command($graphql)
			.command($list)
			.command($move)
			.command($search)
			.command($update)
			.command($attackers)
			.command($categories)
			.command($countries)
			.command($legacy)
			.command($queries)
			.command($raw)
			.command($relationships)
			.command($targetindustries)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
