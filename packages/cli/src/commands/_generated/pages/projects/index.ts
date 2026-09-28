import $connectsource from "./connect-source.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $deployments from "./deployments/index.js";
import $disconnectsource from "./disconnect-source.js";
import $domains from "./domains/index.js";
import $edit from "./edit.js";
import $getuploadtoken from "./get-upload-token.js";
import $get from "./get.js";
import $list from "./list.js";
import $purgebuildcache from "./purge-build-cache.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * projects command group
 * @generated from apis/overlays/pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "projects",
	describe:
		"Pages projects, deployments, build logs, and custom domain bindings",

	builder: (yargs) => {
		return yargs
			.command($connectsource)
			.command($create)
			.command($delete)
			.command($disconnectsource)
			.command($edit)
			.command($get)
			.command($getuploadtoken)
			.command($list)
			.command($purgebuildcache)
			.command($deployments)
			.command($domains)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
