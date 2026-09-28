import $monitors from "./monitors/index.js";
import $pools from "./pools/index.js";
import $preview from "./preview/index.js";
import $regions from "./regions/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * load-balancers command group
 * @generated from apis/overlays/user.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "load-balancers",
	describe: "Operations for load-balancers",

	builder: (yargs) => {
		return yargs
			.command($monitors)
			.command($pools)
			.command($preview)
			.command($regions)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
