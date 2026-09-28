import $create from "./create.js";
import $delete from "./delete.js";
import $deployments from "./deployments/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import $versions from "./versions/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * dynamic-routing command group
 * @generated from apis/overlays/ai-gateway.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "dynamic-routing",
	describe:
		"Route requests across multiple AI providers with fallback, load-balancing, and versioned deployments",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($deployments)
			.command($versions)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
