import $aggregate from "./aggregate/index.js";
import $categories from "./categories/index.js";
import $create from "./create.js";
import $dataset from "./dataset/index.js";
import $datasets from "./datasets/index.js";
import $delete from "./delete/index.js";
import $graphql from "./graphql/index.js";
import $indicator from "./indicator/index.js";
import $indicators from "./indicators/index.js";
import $queries from "./queries/index.js";
import $raw from "./raw/index.js";
import $relate from "./relate/index.js";
import $relationships from "./relationships/index.js";
import $tags from "./tags/index.js";
import $target from "./target/index.js";
import $update from "./update/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * events command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "events",
	describe: "Operations for events",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($aggregate)
			.command($categories)
			.command($dataset)
			.command($datasets)
			.command($delete)
			.command($graphql)
			.command($indicator)
			.command($indicators)
			.command($queries)
			.command($raw)
			.command($relate)
			.command($relationships)
			.command($tags)
			.command($target)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
