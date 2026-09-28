import telemetry from "../telemetry/index.js";
import search from "./search.js";
import type { CommandModule } from "yargs";

const cli: CommandModule & { describe: string } = {
	command: "cli",
	describe: "Discover commands and configure the cf CLI",
	builder: (yargs) =>
		yargs
			.command(search)
			.command(telemetry)
			.demandCommand(1, "Please specify a subcommand"),
	handler: () => {},
};

export default cli;
