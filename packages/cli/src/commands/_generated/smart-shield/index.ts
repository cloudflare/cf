import $cachereserveclear from "./cache-reserve-clear/index.js";
import $get from "./get.js";
import $healthchecks from "./health-checks/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * smart-shield command
 * @generated from apis/overlays/smart-shield.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "smart-shield",
	describe:
		"Smart Shield settings, health checks, and cache reserve management",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($update)
			.command($cachereserveclear)
			.command($healthchecks)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
