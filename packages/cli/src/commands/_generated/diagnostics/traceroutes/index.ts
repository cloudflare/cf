import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * traceroutes command group
 * @generated from apis/overlays/diagnostics.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "traceroutes",
	describe:
		"Run traceroutes from Cloudflare data centers to diagnose network path issues",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
