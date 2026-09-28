import $create from "./create.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * submissions command group
 * @generated from apis/overlays/email-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "submissions",
	describe:
		"Reclassify submissions — track user and team reports of false positives and missed detections",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
