import $layer3 from "./layer3/index.js";
import $layer7 from "./layer7/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * attacks command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "attacks",
	describe:
		"DDoS and application-layer attack trends, vectors, and target analysis",

	builder: (yargs) => {
		return yargs
			.command($layer3)
			.command($layer7)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
