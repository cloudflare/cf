import $cloudflaresource from "./cloudflare-source/index.js";
import $initialresolvedip from "./initial-resolved-ip/index.js";
import $list from "./list.js";
import $warp from "./warp/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * subnets command group
 * @generated from apis/overlays/network.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "subnets",
	describe: "Operations for subnets",

	builder: (yargs) => {
		return yargs
			.command($list)
			.command($cloudflaresource)
			.command($initialresolvedip)
			.command($warp)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
