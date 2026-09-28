import $keys from "./keys.js";
import $query from "./query.js";
import $values from "./values.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * telemetry command group
 * @generated from apis/overlays/observability.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "telemetry",
	describe: "Operations for telemetry",

	builder: (yargs) => {
		return yargs
			.command($keys)
			.command($query)
			.command($values)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
