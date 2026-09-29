import $deploy from "#commands/pages/deploy/index.js";
import $buildcache from "./build-cache/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $deployments from "./deployments/index.js";
import $domains from "./domains/index.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $source from "./source/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * pages command
 * @generated from apis/overlays/pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "pages",
	describe:
		"Full-stack application hosting with Git-integrated builds, preview deployments, and custom domains",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($deploy)
			.command($edit)
			.command($get)
			.command($list)
			.command($buildcache)
			.command($deployments)
			.command($domains)
			.command($source)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
