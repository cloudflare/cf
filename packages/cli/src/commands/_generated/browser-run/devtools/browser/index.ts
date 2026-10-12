import $create from "./create.js";
import $delete from "./delete.js";
import $liveview from "./live-view/index.js";
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
			.command($create)
			.command($delete)
			.command($protocol)
			.command($version)
			.command($liveview)
			.command($targets)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
