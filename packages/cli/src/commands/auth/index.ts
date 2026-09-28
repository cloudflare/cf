import {
	withTelemetry,
	type ShortFlagAliases,
} from "../../lib/telemetry/index.js";
import loginCommand, { loginTelemetryClassification } from "./login.js";
import logoutCommand from "./logout.js";
import {
	activateCommand,
	createCommand,
	deactivateCommand,
	deleteCommand,
	listCommand,
} from "./profiles.js";
import whoamiCommand from "./whoami.js";
import type { Argv, CommandModule } from "yargs";

const authCommands: CommandModule & { describe: string } = {
	command: "auth",
	describe: "Manage authentication and profiles",

	builder: (yargs: Argv) => {
		return yargs
			.command(
				withTelemetry(loginCommand, {
					command: "auth login",
					classification: loginTelemetryClassification,
				})
			)
			.command(telemetryCommand(logoutCommand, "auth logout"))
			.command(telemetryCommand(whoamiCommand, "auth whoami"))
			.command(
				telemetryCommand(createCommand, "auth create", ["browser", "device"])
			)
			.command(telemetryCommand(deleteCommand, "auth delete"))
			.command(telemetryCommand(activateCommand, "auth activate"))
			.command(telemetryCommand(deactivateCommand, "auth deactivate"))
			.command(telemetryCommand(listCommand, "auth list"))
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {
		// This is required but won't be called due to demandCommand
	},
};

function telemetryCommand<T, U>(
	command: CommandModule<T, U>,
	name: string,
	safeFlags: string[] = [],
	shortFlagAliases?: ShortFlagAliases<U>
) {
	return withTelemetry(command, {
		command: name,
		classification: { safeFlags, shortFlagAliases },
	});
}

export default authCommands;
