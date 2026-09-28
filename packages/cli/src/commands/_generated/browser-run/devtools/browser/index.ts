import $connect from "./connect.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $launch from "./launch.js";
import $liveview from "./live-view/index.js";
import $page from "./page/index.js";
import $protocol from "./protocol.js";
import $targets from "./targets/index.js";
import $version from "./version.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * browser command group
 * @generated from apis/overlays/browser-run.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "browser",
	describe: "Operations for devtools.browser",

	builder: (yargs) => {
		return yargs
			.command($connect)
			.command($create)
			.command($delete)
			.command($launch)
			.command($protocol)
			.command($version)
			.command($liveview)
			.command($page)
			.command($targets)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
