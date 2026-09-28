import $origin from "./origin/index.js";
import $tls from "./tls/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * post-quantum command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "post-quantum",
	describe:
		"Post-quantum encryption adoption and deployment trends across the Internet",

	builder: (yargs) => {
		return yargs
			.command($origin)
			.command($tls)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
