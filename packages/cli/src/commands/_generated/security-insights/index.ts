import $auditlogs from "./audit-logs/index.js";
import $classify from "./classify.js";
import $context from "./context/index.js";
import $count from "./count/index.js";
import $dismiss from "./dismiss.js";
import $list from "./list.js";
import $partners from "./partners/index.js";
import $scans from "./scans/index.js";
import $state from "./state/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * security-insights command
 * @generated from apis/overlays/security-insights.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "security-insights",
	describe: "security-insights",

	builder: (yargs) => {
		return yargs
			.command($classify)
			.command($dismiss)
			.command($list)
			.command($auditlogs)
			.command($context)
			.command($count)
			.command($partners)
			.command($scans)
			.command($state)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
