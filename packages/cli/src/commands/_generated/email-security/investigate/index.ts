import $actionlog from "./action-log/index.js";
import $bulk from "./bulk/index.js";
import $detections from "./detections/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $move from "./move.js";
import $preview from "./preview/index.js";
import $raw from "./raw/index.js";
import $release from "./release.js";
import $trace from "./trace/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * investigate command group
 * @generated from apis/overlays/email-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "investigate",
	describe:
		"Search and investigate email messages — view detections, traces, raw content, and take remediation actions",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($list)
			.command($move)
			.command($release)
			.command($actionlog)
			.command($bulk)
			.command($detections)
			.command($preview)
			.command($raw)
			.command($trace)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
