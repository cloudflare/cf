import $class from "./class/index.js";
import $dismiss from "./dismiss.js";
import $getpartnercount from "./get-partner-count.js";
import $list from "./list.js";
import $severity from "./severity/index.js";
import $type from "./type/index.js";
import $updateclassification from "./update-classification.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * insights command group
 * @generated from apis/overlays/security-center.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "insights",
	describe:
		"Security findings and recommendations across your account — DNS, SSL, WAF misconfigurations, etc.",

	builder: (yargs) => {
		return yargs
			.command($dismiss)
			.command($getpartnercount)
			.command($list)
			.command($updateclassification)
			.command($class)
			.command($severity)
			.command($type)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
