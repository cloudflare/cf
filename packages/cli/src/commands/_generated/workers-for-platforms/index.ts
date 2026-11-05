import $dispatchnamespaces from "./dispatch-namespaces/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * workers-for-platforms command
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "workers-for-platforms",
	describe:
		"Workers for Platforms uses dispatch namespaces to isolate and route requests to many individual user Workers, letting platforms run untrusted customer or AI-generated code at scale with per-tenant bindings, limits, and observability",

	builder: (yargs) => {
		return yargs
			.command($dispatchnamespaces)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
