import $create from "./create.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * binary-storage command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "binary-storage",
	describe:
		"Upload and retrieve malware samples and suspicious binaries for analysis",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
