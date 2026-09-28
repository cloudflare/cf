import $blobs from "./blobs/index.js";
import $commits from "./commits/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $files from "./files/index.js";
import $fork from "./fork.js";
import $get from "./get.js";
import $import from "./import.js";
import $list from "./list.js";
import $logs from "./logs/index.js";
import $raw from "./raw/index.js";
import $tokens from "./tokens/index.js";
import $trees from "./trees/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * repos command group
 * @generated from apis/overlays/artifacts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "repos",
	describe: "Operations for namespaces.repos",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($fork)
			.command($get)
			.command($import)
			.command($list)
			.command($blobs)
			.command($commits)
			.command($files)
			.command($logs)
			.command($raw)
			.command($tokens)
			.command($trees)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
