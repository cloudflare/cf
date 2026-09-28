import $catalogsyncs from "./catalog-syncs/index.js";
import $cloudintegrations from "./cloud-integrations/index.js";
import $onramps from "./on-ramps/index.js";
import $resources from "./resources/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * magic-cloud-networking command
 * @generated from apis/overlays/magic-cloud-networking.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "magic-cloud-networking",
	describe: "magic-cloud-networking",

	builder: (yargs) => {
		return yargs
			.command($catalogsyncs)
			.command($cloudintegrations)
			.command($onramps)
			.command($resources)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
