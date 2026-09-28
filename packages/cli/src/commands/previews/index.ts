import { withTelemetry } from "../../lib/telemetry/index.js";
import deployCommand from "./deploy.js";
import type { CommonYargsOptions } from "../../lib/cli-types.js";
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "previews",
	describe: "Manage Worker Previews",
	builder: (yargs) =>
		yargs
			.command(
				withTelemetry(deployCommand, {
					command: "previews deploy",
					classification: { safeFlags: ["prebuilt"] },
				})
			)
			.demandCommand(1, "Please specify a subcommand"),
	handler: () => {},
};

export default command;
