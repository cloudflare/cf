import { withTelemetry } from "../../../lib/telemetry/index.js";
import deployCommand from "./deploy.js";
import type { CommonYargsOptions } from "../../../lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

const triggersCommand: CommandModule<CommonYargsOptions, {}> & {
	describe: string;
} = {
	command: "triggers",
	describe: "Manage triggers (Routes, Workflows, Cron triggers etc.)",

	builder: (yargs: Argv<CommonYargsOptions>) => {
		return yargs
			.command(
				withTelemetry(deployCommand, {
					command: "workers triggers deploy",
					classification: { safeFlags: ["dry-run", "prebuilt"] },
				})
			)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default triggersCommand;
