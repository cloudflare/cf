import $settings from "./settings/index.js";
import $shadowhosts from "./shadow-hosts/index.js";
import $shadowzonehosts from "./shadow-zone-hosts/index.js";
import $shadowzones from "./shadow-zones/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * partners command group
 * @generated from apis/overlays/security-insights.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "partners",
	describe: "Operations for partners",

	builder: (yargs) => {
		return yargs
			.command($settings)
			.command($shadowhosts)
			.command($shadowzonehosts)
			.command($shadowzones)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
