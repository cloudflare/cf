import $iqi from "./iqi/index.js";
import $speed from "./speed/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * quality command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "quality",
	describe:
		"Internet connection quality metrics — speed, latency, and jitter by geography and ASN",

	builder: (yargs) => {
		return yargs
			.command($iqi)
			.command($speed)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
